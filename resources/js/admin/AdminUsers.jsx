import { useEffect, useState } from 'react';
import { Plus, Trash2, Shield, ShieldCheck, X, Save } from 'lucide-react';
import { adminApi } from './api.js';
import AdminPageShell from './AdminPageShell.jsx';

export default function AdminUsers() {
  const [rows, setRows] = useState([]);
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null | 'new' | userObj

  async function refresh() {
    setLoading(true);
    try {
      const [u, meRes] = await Promise.all([adminApi.users.list(), adminApi.me()]);
      setRows(u.data ?? []);
      setMe(meRes.user);
    } finally { setLoading(false); }
  }
  useEffect(() => { refresh(); }, []);

  async function remove(id) {
    if (!confirm('Delete this user?')) return;
    await adminApi.users.remove(id);
    setRows((r) => r.filter((x) => x.id !== id));
  }

  return (
    <AdminPageShell
      title="Users"
      description="Manage admin and regular users. Anyone with the admin flag can sign in to /admin."
      actions={
        <button onClick={() => setEditing('new')} className="inline-flex items-center gap-1.5 rounded-lg bg-packrs-teal px-3 py-1.5 text-sm font-semibold text-slate-950 hover:bg-packrs-yellow">
          <Plus className="h-3.5 w-3.5" /> Add user
        </button>
      }
    >
      {loading ? <p className="text-sm text-slate-500">Loading…</p> : (
        <div className="overflow-hidden rounded-2xl border border-slate-800">
          <table className="w-full text-sm">
            <thead className="bg-slate-900/60 text-left text-[11px] uppercase tracking-widest text-slate-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {rows.map((u) => (
                <tr key={u.id} className="hover:bg-slate-900/40">
                  <td className="px-4 py-3 font-medium text-white">
                    {u.name}
                    {me?.id === u.id && <span className="ml-2 text-[10px] uppercase tracking-widest text-slate-500">(you)</span>}
                  </td>
                  <td className="px-4 py-3 text-slate-300">{u.email}</td>
                  <td className="px-4 py-3 text-slate-400">{u.phone ?? '—'}</td>
                  <td className="px-4 py-3">
                    {u.is_admin ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-packrs-teal/10 px-2 py-0.5 text-[11px] text-packrs-teal ring-1 ring-packrs-teal/30">
                        <ShieldCheck className="h-3 w-3" /> Admin
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-md bg-slate-500/10 px-2 py-0.5 text-[11px] text-slate-400 ring-1 ring-slate-700">
                        <Shield className="h-3 w-3" /> User
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">
                    {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-1">
                      <button onClick={() => setEditing(u)} className="rounded-md px-2 py-1 text-xs text-slate-400 hover:bg-slate-800 hover:text-white">Edit</button>
                      {me?.id !== u.id && (
                        <button onClick={() => remove(u.id)} className="rounded-md p-1.5 text-slate-500 hover:bg-rose-500/10 hover:text-rose-300">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <UserEditor
          user={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); refresh(); }}
        />
      )}
    </AdminPageShell>
  );
}

function UserEditor({ user, onClose, onSaved }) {
  const isNew = !user;
  const [form, setForm] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
    password: '',
    is_admin: user?.is_admin ?? false,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function save() {
    setBusy(true); setError(null);
    try {
      const payload = { ...form };
      if (!isNew && !payload.password) delete payload.password;
      if (isNew) await adminApi.users.create(payload);
      else       await adminApi.users.update(user.id, payload);
      onSaved();
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/70 p-4 backdrop-blur-sm" onClick={() => !busy && onClose()}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4">
        <header className="flex items-start justify-between">
          <h3 className="font-display text-lg font-bold text-white">{isNew ? 'Add user' : `Edit ${user.name}`}</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white"><X className="h-4 w-4" /></button>
        </header>

        <Field label="Name"><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="ui-input" /></Field>
        <Field label="Email"><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="ui-input" /></Field>
        <Field label="Phone (optional)"><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="ui-input" /></Field>
        <Field label={isNew ? 'Password (≥ 8 chars)' : 'New password (leave blank to keep current)'}>
          <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="ui-input" />
        </Field>

        <label className="flex items-center gap-3 cursor-pointer">
          <span className={`relative inline-flex h-5 w-9 items-center rounded-full transition ${form.is_admin ? 'bg-packrs-teal' : 'bg-slate-700'}`}>
            <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition ${form.is_admin ? 'translate-x-5' : 'translate-x-1'}`} />
          </span>
          <span className="text-sm text-slate-300">Admin access — can sign in to <code className="text-packrs-teal">/admin</code></span>
          <input type="checkbox" checked={form.is_admin} onChange={(e) => setForm({ ...form, is_admin: e.target.checked })} className="sr-only" />
        </label>

        {error && <p className="rounded-lg bg-rose-500/10 px-3 py-2 text-xs text-rose-300 ring-1 ring-rose-500/30">{error}</p>}

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg bg-slate-800 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-700">Cancel</button>
          <button onClick={save} disabled={busy} className="inline-flex items-center gap-1.5 rounded-lg bg-packrs-teal px-3 py-1.5 text-sm font-semibold text-slate-950 hover:bg-packrs-yellow disabled:opacity-60">
            <Save className="h-3.5 w-3.5" /> {busy ? 'Saving…' : 'Save'}
          </button>
        </div>

        <style>{`.ui-input { width: 100%; border-radius: 8px; background: rgb(2 6 23); padding: 0.5rem 0.75rem; font-size: 0.875rem; color: rgb(226 232 240); outline: none; box-shadow: inset 0 0 0 1px rgb(30 41 59); }
          .ui-input:focus { box-shadow: inset 0 0 0 1px rgb(41 255 202 / 0.6); }`}</style>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-slate-300">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
