import { useEffect, useState } from 'react';
import { Search, Trash2, Phone, MapPin } from 'lucide-react';
import { adminApi } from './api.js';
import AdminPageShell from './AdminPageShell.jsx';

const STATUSES = ['new', 'contacted', 'converted', 'dropped'];
const STATUS_COLORS = {
  new:       'bg-packrs-yellow/10 text-packrs-yellow ring-packrs-yellow/30',
  contacted: 'bg-packrs-teal/10 text-packrs-teal ring-packrs-teal/30',
  converted: 'bg-emerald-500/10 text-emerald-300 ring-emerald-500/30',
  dropped:   'bg-slate-500/10 text-slate-400 ring-slate-700',
};

export default function AdminBookings() {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (status) params.set('status', status);
    params.set('per_page', '50');
    try {
      const r = await adminApi.bookings.list(params.toString());
      setRows(r.data?.data ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh(); /* eslint-disable-next-line */ }, []);

  async function setRowStatus(id, next) {
    await adminApi.bookings.update(id, { status: next });
    setRows((rs) => rs.map((r) => r.id === id ? { ...r, status: next } : r));
  }

  async function remove(id) {
    if (!confirm('Delete this booking permanently?')) return;
    await adminApi.bookings.remove(id);
    setRows((rs) => rs.filter((r) => r.id !== id));
  }

  return (
    <AdminPageShell
      title="Pickup Requests"
      description="Live feed of every Book a Pickup submission."
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-1.5 ring-1 ring-slate-800">
            <Search className="h-3.5 w-3.5 text-slate-500" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && refresh()}
              placeholder="Search name, phone, address…"
              className="bg-transparent text-sm text-white outline-none placeholder:text-slate-500 w-56"
            />
          </div>
          <select
            value={status} onChange={(e) => setStatus(e.target.value)}
            className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm ring-1 ring-slate-800 outline-none"
          >
            <option value="">All statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button onClick={refresh} className="rounded-lg bg-packrs-teal px-3 py-1.5 text-sm font-semibold text-slate-950 hover:bg-packrs-yellow">
            Refresh
          </button>
        </div>
      }
    >
      {loading ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-slate-500">No pickup requests yet.</p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-800">
          <table className="w-full text-sm">
            <thead className="bg-slate-900/60 text-left text-[11px] uppercase tracking-widest text-slate-500">
              <tr>
                <th className="px-4 py-3">Submitted</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Address</th>
                <th className="px-4 py-3">Business</th>
                <th className="px-4 py-3">Volume</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-slate-900/40">
                  <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                    {new Date(r.created_at).toLocaleString('en-NP', { dateStyle: 'short', timeStyle: 'short' })}
                  </td>
                  <td className="px-4 py-3 font-medium text-white">{r.name}</td>
                  <td className="px-4 py-3">
                    <a href={`tel:${r.phone}`} className="inline-flex items-center gap-1 text-packrs-teal hover:underline">
                      <Phone className="h-3 w-3" />{r.phone}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-slate-300 max-w-[260px] truncate">
                    <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3 text-slate-500" />{r.address}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    <div>{r.business_type ?? '—'}</div>
                    <div className="text-[11px] text-slate-500">{r.business_registered ? 'Registered' : 'Unregistered'}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-400">{r.avg_volume ?? '—'}</td>
                  <td className="px-4 py-3">
                    <select
                      value={r.status}
                      onChange={(e) => setRowStatus(r.id, e.target.value)}
                      className={`rounded-md ring-1 px-2 py-1 text-[11px] capitalize ${STATUS_COLORS[r.status] ?? STATUS_COLORS.new}`}
                    >
                      {STATUSES.map((s) => <option key={s} value={s} className="bg-slate-950">{s}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => remove(r.id)}
                      className="p-1.5 rounded-md text-slate-500 hover:bg-rose-500/10 hover:text-rose-300"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminPageShell>
  );
}
