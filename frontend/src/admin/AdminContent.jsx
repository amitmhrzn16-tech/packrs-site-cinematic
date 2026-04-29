import { useEffect, useRef, useState } from 'react';
import { Save, Trash2, Plus, Upload, ImageIcon } from 'lucide-react';
import { adminApi } from './api.js';
import AdminPageShell from './AdminPageShell.jsx';

const API_ORIGIN = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1').replace(/\/api\/v1\/?$/, '');
const absoluteUrl = (p) => p?.startsWith('http') ? p : p ? `${API_ORIGIN}${p.startsWith('/') ? '' : '/'}${p}` : '';

const PAGES = [
  { slug: 'home',     label: 'Home (cinematic)' },
  { slug: 'about',    label: 'About' },
  { slug: 'services', label: 'Services index' },
  { slug: 'coverage', label: 'Coverage' },
  { slug: 'rates',    label: 'Rates' },
  { slug: 'book',     label: 'Book a Pickup' },
  { slug: 'track',    label: 'Track' },
  { slug: 'contact',  label: 'Contact' },
];

export default function AdminContent() {
  const [page, setPage] = useState('home');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load(p = page) {
    setLoading(true);
    try {
      const r = await adminApi.content.list(p);
      setItems(r.data ?? []);
    } finally { setLoading(false); }
  }
  useEffect(() => { load(page); /* eslint-disable-next-line */ }, [page]);

  async function save(item) {
    const payload = { page_slug: page, content_key: item.content_key, type: item.type, value: item.value, label: item.label };
    const r = await adminApi.content.save(payload);
    setItems((xs) => xs.map((x) => x.content_key === item.content_key ? r.data : x));
  }

  async function remove(id) {
    if (!confirm('Delete this content block?')) return;
    await adminApi.content.remove(id);
    setItems((xs) => xs.filter((x) => x.id !== id));
  }

  function addBlock() {
    const key = prompt('Content key (e.g. hero_title, cta_button_text):');
    if (!key) return;
    setItems((xs) => [...xs, { id: `new-${Date.now()}`, content_key: key, type: 'text', value: '', label: '' }]);
  }

  return (
    <AdminPageShell
      title="Pages & Modules"
      description="Edit text, headlines, and image URLs the public site renders. Content is keyed by page + content_key — wire it up in your React components via /api/admin/content."
      actions={
        <button onClick={addBlock} className="inline-flex items-center gap-1.5 rounded-lg bg-packrs-teal px-3 py-1.5 text-sm font-semibold text-slate-950 hover:bg-packrs-yellow">
          <Plus className="h-3.5 w-3.5" /> Add block
        </button>
      }
    >
      <div className="mb-5 flex flex-wrap items-center gap-2">
        {PAGES.map((p) => (
          <button
            key={p.slug}
            onClick={() => setPage(p.slug)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium ring-1 transition
              ${page === p.slug
                ? 'bg-packrs-teal/15 text-packrs-teal ring-packrs-teal/40'
                : 'bg-slate-900 text-slate-400 ring-slate-800 hover:text-white'}`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {loading ? <p className="text-sm text-slate-500">Loading…</p> : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 px-6 py-10 text-center">
          <p className="text-sm text-slate-400">No content blocks yet for <span className="text-white">{page}</span>.</p>
          <p className="mt-1 text-xs text-slate-500">Click <strong>Add block</strong> to create your first one.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((it) => (
            <ContentRow key={it.id} item={it} onSave={save} onDelete={() => remove(it.id)} />
          ))}
        </div>
      )}
    </AdminPageShell>
  );
}

function ContentRow({ item, onSave, onDelete }) {
  const [draft, setDraft] = useState(item);
  const dirty = JSON.stringify(draft) !== JSON.stringify(item);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 sm:p-5">
      <div className="flex flex-wrap items-center gap-3">
        <code className="rounded-md bg-slate-950 px-2 py-1 text-[11px] text-packrs-teal ring-1 ring-slate-800">{draft.content_key}</code>
        <select
          value={draft.type ?? 'text'}
          onChange={(e) => setDraft({ ...draft, type: e.target.value })}
          className="rounded-md bg-slate-950 px-2 py-1 text-[11px] text-slate-300 ring-1 ring-slate-800"
        >
          <option value="text">text</option>
          <option value="html">html</option>
          <option value="image">image (URL)</option>
          <option value="url">url</option>
        </select>
        <input
          value={draft.label ?? ''}
          onChange={(e) => setDraft({ ...draft, label: e.target.value })}
          placeholder="Friendly label (admin-only)"
          className="flex-1 min-w-[160px] rounded-md bg-slate-950 px-2 py-1 text-xs text-slate-300 ring-1 ring-slate-800"
        />
        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={() => onSave(draft)}
            disabled={!dirty}
            className="inline-flex items-center gap-1 rounded-md bg-packrs-teal px-2.5 py-1 text-xs font-semibold text-slate-950 hover:bg-packrs-yellow disabled:opacity-40"
          >
            <Save className="h-3 w-3" /> Save
          </button>
          <button onClick={onDelete} className="rounded-md p-1 text-slate-500 hover:bg-rose-500/10 hover:text-rose-300">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {draft.type === 'html' ? (
        <textarea
          rows={5}
          value={draft.value ?? ''}
          onChange={(e) => setDraft({ ...draft, value: e.target.value })}
          className="mt-3 w-full rounded-lg bg-slate-950 px-3 py-2 text-sm font-mono text-slate-200 ring-1 ring-slate-800 focus:ring-packrs-teal/60 outline-none"
        />
      ) : draft.type === 'image' ? (
        <ImageUploader
          value={draft.value ?? ''}
          onChange={(v) => setDraft({ ...draft, value: v })}
        />
      ) : (
        <input
          value={draft.value ?? ''}
          onChange={(e) => setDraft({ ...draft, value: e.target.value })}
          placeholder="Value"
          className="mt-3 w-full rounded-lg bg-slate-950 px-3 py-2 text-sm text-slate-200 ring-1 ring-slate-800 focus:ring-packrs-teal/60 outline-none"
        />
      )}
    </div>
  );
}

function ImageUploader({ value, onChange }) {
  const fileRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function onPick(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true); setError(null);
    try {
      const r = await adminApi.media.upload(file);
      onChange(r.url);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  return (
    <div className="mt-3 space-y-2">
      <div className="flex items-center gap-2">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://… image URL or upload below"
          className="flex-1 rounded-lg bg-slate-950 px-3 py-2 text-sm text-slate-200 ring-1 ring-slate-800 focus:ring-packrs-teal/60 outline-none"
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-lg bg-packrs-teal px-3 py-2 text-xs font-semibold text-slate-950 hover:bg-packrs-yellow disabled:opacity-50"
        >
          <Upload className="h-3.5 w-3.5" />
          {busy ? 'Uploading…' : 'Upload'}
        </button>
        <input ref={fileRef} type="file" accept="image/*" onChange={onPick} className="hidden" />
      </div>

      {error && <p className="text-xs text-rose-300">{error}</p>}

      {value ? (
        <div className="flex items-center gap-3 rounded-lg bg-slate-950/60 p-2 ring-1 ring-slate-800">
          <img
            src={absoluteUrl(value)}
            alt="preview"
            className="h-14 w-14 object-cover rounded-md ring-1 ring-slate-800"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
          <code className="text-[11px] text-slate-400 truncate flex-1">{value}</code>
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-lg bg-slate-950/40 p-2 text-[11px] text-slate-500 ring-1 ring-dashed ring-slate-800">
          <ImageIcon className="h-3.5 w-3.5" /> No image yet — paste a URL or upload one above.
        </div>
      )}
    </div>
  );
}
