import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { adminApi } from './api.js';
import AdminPageShell from './AdminPageShell.jsx';

const PAGES = ['home', 'about', 'services', 'coverage', 'rates', 'book', 'track', 'contact'];

const EMPTY = (slug) => ({
  page_slug: slug,
  meta_title: '', meta_description: '',
  canonical_url: '',
  og_title: '', og_description: '', og_image: '',
  og_type: 'website', twitter_card: 'summary_large_image',
  keywords: [], extra_meta: [],
  robots_index: true, robots_follow: true,
});

export default function AdminSeo() {
  const [page, setPage] = useState('home');
  const [draft, setDraft] = useState(EMPTY('home'));
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);

  useEffect(() => {
    adminApi.seo.show(page)
      .then((r) => setDraft(r.data ? { ...EMPTY(page), ...r.data, keywords: r.data.keywords ?? [] } : EMPTY(page)))
      .catch(() => setDraft(EMPTY(page)));
  }, [page]);

  async function save() {
    setSaving(true);
    try {
      const r = await adminApi.seo.save({ ...draft, page_slug: page });
      setDraft({ ...EMPTY(page), ...r.data, keywords: r.data.keywords ?? [] });
      setSavedAt(new Date());
    } finally { setSaving(false); }
  }

  return (
    <AdminPageShell
      title="SEO settings"
      description="Edit meta titles, descriptions, OpenGraph, Twitter cards, and indexing rules per page."
      actions={
        <button onClick={save} disabled={saving} className="inline-flex items-center gap-1.5 rounded-lg bg-packrs-teal px-3 py-1.5 text-sm font-semibold text-slate-950 hover:bg-packrs-yellow disabled:opacity-50">
          <Save className="h-3.5 w-3.5" /> {saving ? 'Saving…' : 'Save'}
        </button>
      }
    >
      <div className="mb-5 flex flex-wrap items-center gap-2">
        {PAGES.map((p) => (
          <button
            key={p}
            onClick={() => setPage(p)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium ring-1 transition capitalize
              ${page === p ? 'bg-packrs-teal/15 text-packrs-teal ring-packrs-teal/40'
                           : 'bg-slate-900 text-slate-400 ring-slate-800 hover:text-white'}`}
          >
            {p}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Search engine">
          <Field label="Meta title" maxLength={60}>
            <input value={draft.meta_title ?? ''} onChange={(e) => setDraft({ ...draft, meta_title: e.target.value })}
              className="input" placeholder="Page title shown in Google results" />
          </Field>
          <Field label="Meta description" maxLength={160}>
            <textarea rows={3} value={draft.meta_description ?? ''} onChange={(e) => setDraft({ ...draft, meta_description: e.target.value })}
              className="input" placeholder="One- or two-sentence summary for the search snippet" />
          </Field>
          <Field label="Canonical URL">
            <input value={draft.canonical_url ?? ''} onChange={(e) => setDraft({ ...draft, canonical_url: e.target.value })}
              className="input" placeholder="https://packrscourier.com.np/services" />
          </Field>
          <div className="flex flex-wrap gap-4">
            <Toggle checked={draft.robots_index} onChange={(v) => setDraft({ ...draft, robots_index: v })} label="Index in search" />
            <Toggle checked={draft.robots_follow} onChange={(v) => setDraft({ ...draft, robots_follow: v })} label="Follow links" />
          </div>
          <Field label="Keywords (comma separated)">
            <input
              value={(draft.keywords ?? []).join(', ')}
              onChange={(e) => setDraft({ ...draft, keywords: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
              className="input"
              placeholder="kathmandu courier, same day delivery"
            />
          </Field>
        </Section>

        <Section title="Social cards (OpenGraph + Twitter)">
          <Field label="OG title">
            <input value={draft.og_title ?? ''} onChange={(e) => setDraft({ ...draft, og_title: e.target.value })} className="input" />
          </Field>
          <Field label="OG description">
            <textarea rows={3} value={draft.og_description ?? ''} onChange={(e) => setDraft({ ...draft, og_description: e.target.value })} className="input" />
          </Field>
          <Field label="OG image (URL)" hint="Recommended 1200×630">
            <input value={draft.og_image ?? ''} onChange={(e) => setDraft({ ...draft, og_image: e.target.value })} className="input" placeholder="https://…/og.png" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="OG type">
              <select value={draft.og_type ?? 'website'} onChange={(e) => setDraft({ ...draft, og_type: e.target.value })} className="input">
                <option value="website">website</option>
                <option value="article">article</option>
                <option value="product">product</option>
                <option value="profile">profile</option>
              </select>
            </Field>
            <Field label="Twitter card">
              <select value={draft.twitter_card ?? 'summary_large_image'} onChange={(e) => setDraft({ ...draft, twitter_card: e.target.value })} className="input">
                <option value="summary">summary</option>
                <option value="summary_large_image">summary_large_image</option>
                <option value="app">app</option>
              </select>
            </Field>
          </div>
        </Section>
      </div>

      {savedAt && <p className="mt-4 text-xs text-emerald-300">Saved {savedAt.toLocaleTimeString()}.</p>}

      <style>{`.input { width: 100%; border-radius: 8px; background: rgb(2 6 23); padding: 0.55rem 0.75rem; font-size: 0.875rem; color: rgb(226 232 240); outline: none; box-shadow: inset 0 0 0 1px rgb(30 41 59); }
        .input:focus { box-shadow: inset 0 0 0 1px rgb(41 255 202 / 0.6); }
      `}</style>
    </AdminPageShell>
  );
}

function Section({ title, children }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
      <h2 className="font-semibold text-white">{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, hint, maxLength, children }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-slate-300">{label}{maxLength && <span className="ml-1 text-[10px] text-slate-500">≤ {maxLength} chars</span>}</span>
      <div className="mt-1.5">{children}</div>
      {hint && <p className="mt-1 text-[11px] text-slate-500">{hint}</p>}
    </label>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2">
      <span className={`relative inline-flex h-5 w-9 items-center rounded-full transition ${checked ? 'bg-packrs-teal' : 'bg-slate-700'}`}>
        <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition ${checked ? 'translate-x-5' : 'translate-x-1'}`} />
      </span>
      <span className="text-xs text-slate-300">{label}</span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only" />
    </label>
  );
}
