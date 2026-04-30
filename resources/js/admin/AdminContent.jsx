import { useEffect, useRef, useState } from 'react';
import { Save, Trash2, Upload, ImageIcon, ExternalLink, RotateCcw } from 'lucide-react';
import { adminApi } from './api.js';
import AdminPageShell from './AdminPageShell.jsx';
import { CONTENT_SCHEMA, PAGES } from '../lib/contentSchema.js';

const rawApi = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1';
const API_ORIGIN = rawApi.startsWith('http')
  ? rawApi.replace(/\/api\/v1\/?$/, '')
  : (typeof window !== 'undefined' ? window.location.origin : '');
const absoluteUrl = (p) => p?.startsWith('http') ? p : p ? `${API_ORIGIN}${p.startsWith('/') ? '' : '/'}${p}` : '';

export default function AdminContent() {
  const [page, setPage] = useState('home');
  const [savedRows, setSavedRows] = useState([]);   // rows that exist in DB
  const [loading, setLoading] = useState(true);

  async function load(p = page) {
    setLoading(true);
    try {
      const r = await adminApi.content.list(p);
      setSavedRows(r.data ?? []);
    } finally { setLoading(false); }
  }
  useEffect(() => { load(page); /* eslint-disable-next-line */ }, [page]);

  // The schema is the source of truth — admin sees every editable field for the
  // selected page, even if the DB row doesn't exist yet.
  const schema = CONTENT_SCHEMA[page]?.fields ?? [];
  const savedByKey = Object.fromEntries(savedRows.map((r) => [r.content_key, r]));

  async function save(field, value) {
    const payload = {
      page_slug: page,
      content_key: field.key,
      type: field.type ?? 'text',
      value,
      label: field.label,
    };
    const r = await adminApi.content.save(payload);
    setSavedRows((rows) => {
      const idx = rows.findIndex((x) => x.content_key === field.key);
      if (idx === -1) return [...rows, r.data];
      const next = [...rows];
      next[idx] = r.data;
      return next;
    });
  }

  async function reset(field) {
    const row = savedByKey[field.key];
    if (!row?.id) return;
    if (!confirm(`Reset "${field.label}" to default? This deletes the override.`)) return;
    await adminApi.content.remove(row.id);
    setSavedRows((rows) => rows.filter((x) => x.id !== row.id));
  }

  return (
    <AdminPageShell
      title="Pages & Modules"
      description="Edit every text and image on the public site. Empty fields render the built-in default; saved fields override it."
      actions={
        <a
          href={page === 'home' ? '/' : `/${page}`}
          target="_blank" rel="noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-sm ring-1 ring-slate-800 text-slate-300 hover:text-white"
        >
          <ExternalLink className="h-3.5 w-3.5" /> Preview page
        </a>
      }
    >
      <div className="mb-5 flex flex-wrap items-center gap-2">
        {PAGES.map((p) => {
          const overrides = savedRows.length;
          const isActive = page === p.slug;
          return (
            <button
              key={p.slug}
              onClick={() => setPage(p.slug)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium ring-1 transition flex items-center gap-1.5
                ${isActive
                  ? 'bg-packrs-teal/15 text-packrs-teal ring-packrs-teal/40'
                  : 'bg-slate-900 text-slate-400 ring-slate-800 hover:text-white'}`}
            >
              {p.label}
              {isActive && overrides > 0 && (
                <span className="rounded-full bg-packrs-teal/30 text-packrs-teal text-[9px] px-1.5">
                  {overrides}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {schema.length === 0 ? (
        <p className="text-sm text-slate-500">No content schema declared for <code>{page}</code> yet.</p>
      ) : loading ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : (
        <div className="space-y-3">
          {schema.map((field) => (
            <ContentRow
              key={field.key}
              field={field}
              saved={savedByKey[field.key]}
              onSave={(value) => save(field, value)}
              onReset={() => reset(field)}
            />
          ))}
        </div>
      )}
    </AdminPageShell>
  );
}

function ContentRow({ field, saved, onSave, onReset }) {
  const isOverridden = !!saved;
  const [draft, setDraft] = useState(saved?.value ?? field.default);
  const [busy, setBusy] = useState(false);

  // If the saved row changes underneath us (e.g. after reset/refresh), reseed.
  useEffect(() => {
    setDraft(saved?.value ?? field.default);
  }, [saved?.id, saved?.value, field.default]);

  const dirty = draft !== (saved?.value ?? field.default);

  async function handleSave() {
    setBusy(true);
    try { await onSave(draft); } finally { setBusy(false); }
  }

  return (
    <div className={`rounded-2xl border p-4 sm:p-5 transition ${
      isOverridden ? 'border-packrs-teal/30 bg-packrs-teal/[0.03]' : 'border-slate-800 bg-slate-900/40'
    }`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-white">{field.label}</span>
            {isOverridden ? (
              <span className="rounded-md bg-packrs-teal/15 text-packrs-teal text-[10px] px-1.5 py-0.5 ring-1 ring-packrs-teal/30">
                Overridden
              </span>
            ) : (
              <span className="rounded-md bg-slate-700/40 text-slate-400 text-[10px] px-1.5 py-0.5 ring-1 ring-slate-700">
                Using default
              </span>
            )}
          </div>
          <code className="mt-1 inline-block text-[11px] text-slate-500">{field.key}</code>
        </div>

        <div className="flex items-center gap-1">
          {isOverridden && (
            <button
              onClick={onReset}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-slate-400 hover:bg-slate-800 hover:text-white"
              title="Reset to default"
            >
              <RotateCcw className="h-3 w-3" /> Reset
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!dirty || busy}
            className="inline-flex items-center gap-1 rounded-md bg-packrs-teal px-2.5 py-1 text-xs font-semibold text-slate-950 hover:bg-packrs-yellow disabled:opacity-40"
          >
            <Save className="h-3 w-3" /> {busy ? 'Saving…' : dirty ? 'Save' : 'Saved'}
          </button>
        </div>
      </div>

      <div className="mt-3">
        {field.type === 'html' ? (
          <textarea
            rows={5}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="w-full rounded-lg bg-slate-950 px-3 py-2 text-sm font-mono text-slate-200 ring-1 ring-slate-800 focus:ring-packrs-teal/60 outline-none"
          />
        ) : field.type === 'image' ? (
          <ImageUploader value={draft} onChange={setDraft} />
        ) : draft.length > 80 ? (
          <textarea
            rows={3}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="w-full rounded-lg bg-slate-950 px-3 py-2 text-sm text-slate-200 ring-1 ring-slate-800 focus:ring-packrs-teal/60 outline-none"
          />
        ) : (
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="w-full rounded-lg bg-slate-950 px-3 py-2 text-sm text-slate-200 ring-1 ring-slate-800 focus:ring-packrs-teal/60 outline-none"
          />
        )}
      </div>
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
    <div className="space-y-2">
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
