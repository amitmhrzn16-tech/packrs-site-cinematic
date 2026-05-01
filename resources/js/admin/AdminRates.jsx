import { useCallback, useEffect, useRef, useState } from 'react';
import { Upload, AlertCircle, FileDown, Trash2, Plus } from 'lucide-react';
import { adminApi } from './api.js';
import AdminPageShell from './AdminPageShell.jsx';
import { useAutoRefresh } from './useAutoRefresh.js';

const SERVICE_LABEL = {
  inside_valley: 'Inside Valley',
  branch_delivery: 'Branch Delivery',
  express_home: 'Express Home',
  express_branch: 'Express Branch',
};

const TEMPLATE_CSV = `to_location,service_type,base_rate,base_kg_limit,additional_kg_mode,additional_kg_rate,contact_number,areas_covered,from_location,active
Boudha,inside_valley,100,3,flat,50,9801234567,"Boudha, Jorpati, Mahankal",Chabahil,1
Pokhara,express_home,200,2,half_base,,9807654321,"Lakeside, Chipledhunga",Chabahil,1
`;

export default function AdminRates() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [svc, setSvc] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('q', search);
      if (svc) params.set('service_type', svc);
      const r = await adminApi.rates.list(params.toString());
      setRows(r.data ?? []);
    } finally { setLoading(false); }
  }, [search, svc]);
  useEffect(() => { refresh(); /* eslint-disable-next-line */ }, []);
  useAutoRefresh(refresh, 60_000);

  async function remove(id) {
    if (!confirm('Delete this rate?')) return;
    await adminApi.rates.remove(id);
    setRows((rs) => rs.filter((r) => r.id !== id));
  }

  return (
    <AdminPageShell
      title="Rates"
      description="Per-destination pricing. Upload a CSV to bulk-update; edit individual rows below."
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <DownloadTemplate />
          <UploadDialog onDone={refresh} />
        </div>
      }
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input
          value={search} onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && refresh()}
          placeholder="Search destination…"
          className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm ring-1 ring-slate-800 outline-none focus:ring-packrs-teal/60 w-56"
        />
        <select
          value={svc} onChange={(e) => { setSvc(e.target.value); }}
          className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm ring-1 ring-slate-800 outline-none"
        >
          <option value="">All services</option>
          {Object.entries(SERVICE_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <button onClick={refresh} className="rounded-lg bg-packrs-teal px-3 py-1.5 text-sm font-semibold text-slate-950 hover:bg-packrs-yellow">
          Apply
        </button>
        <span className="ml-auto text-xs text-slate-500">{rows.length.toLocaleString()} rate{rows.length === 1 ? '' : 's'}</span>
      </div>

      {loading ? <p className="text-sm text-slate-500">Loading…</p> : rows.length === 0 ? (
        <p className="text-sm text-slate-500">No rates yet — upload a CSV to seed the table.</p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-800">
          <table className="w-full text-sm">
            <thead className="bg-slate-900/60 text-left text-[11px] uppercase tracking-widest text-slate-500">
              <tr>
                <th className="px-4 py-3">Destination</th>
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3 text-right">Base</th>
                <th className="px-4 py-3 text-right">Up to (kg)</th>
                <th className="px-4 py-3">Mode</th>
                <th className="px-4 py-3 text-right">+ per kg</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3 text-right">Active</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {rows.slice(0, 500).map((r) => (
                <tr key={r.id} className="hover:bg-slate-900/40">
                  <td className="px-4 py-3 text-white font-medium">{r.to_location}</td>
                  <td className="px-4 py-3 text-slate-300">{SERVICE_LABEL[r.service_type] ?? r.service_type}</td>
                  <td className="px-4 py-3 text-right tabular-nums">Rs {Number(r.base_rate).toFixed(0)}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{Number(r.base_kg_limit).toFixed(0)}</td>
                  <td className="px-4 py-3 text-slate-400">{r.additional_kg_mode}</td>
                  <td className="px-4 py-3 text-right text-slate-400 tabular-nums">
                    {r.additional_kg_mode === 'flat' ? `Rs ${Number(r.additional_kg_rate ?? 0).toFixed(0)}`
                      : r.additional_kg_mode === 'base_multiply' ? `Rs ${Number(r.base_rate).toFixed(0)}`
                      : `Rs ${(Number(r.base_rate) / 2).toFixed(0)}`}
                  </td>
                  <td className="px-4 py-3 text-slate-400">{r.contact_number ?? '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={r.active ? 'text-emerald-300' : 'text-slate-500'}>
                      {r.active ? '✓' : '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => remove(r.id)} className="p-1.5 rounded-md text-slate-500 hover:bg-rose-500/10 hover:text-rose-300">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length > 500 && (
            <div className="border-t border-slate-800 bg-slate-900/40 px-4 py-2 text-[11px] text-slate-500">
              Showing first 500 of {rows.length.toLocaleString()} — narrow with the search above.
            </div>
          )}
        </div>
      )}
    </AdminPageShell>
  );
}

function DownloadTemplate() {
  const onClick = () => {
    const blob = new Blob([TEMPLATE_CSV], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'rates-template.csv';
    a.click();
    URL.revokeObjectURL(a.href);
  };
  return (
    <button onClick={onClick} className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-sm ring-1 ring-slate-800 text-slate-300 hover:text-white">
      <FileDown className="h-3.5 w-3.5" /> Template
    </button>
  );
}

function UploadDialog({ onDone }) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [mode, setMode] = useState('upsert');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileRef = useRef(null);

  function reset() { setFile(null); setResult(null); setError(null); if (fileRef.current) fileRef.current.value = ''; }

  async function upload() {
    if (!file) return;
    setBusy(true); setError(null); setResult(null);
    try {
      const r = await adminApi.rates.upload(file, mode);
      setResult(r.data);
      onDone?.();
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="inline-flex items-center gap-1.5 rounded-lg bg-packrs-teal px-3 py-1.5 text-sm font-semibold text-slate-950 hover:bg-packrs-yellow">
        <Upload className="h-3.5 w-3.5" /> Upload CSV
      </button>
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/70 p-4 backdrop-blur-sm" onClick={() => !busy && (setOpen(false), reset())}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4">
            <header className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-display text-lg font-bold text-white">Bulk upload rates</h3>
                <p className="text-xs text-slate-400 mt-0.5">CSV with header: <code className="text-slate-200">to_location, service_type, base_rate, base_kg_limit, additional_kg_mode</code>.</p>
              </div>
              <button onClick={() => { setOpen(false); reset(); }} className="text-slate-500 hover:text-white">×</button>
            </header>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">CSV file</label>
              <input ref={fileRef} type="file" accept=".csv,text/csv,text/plain"
                onChange={(e) => { setFile(e.target.files?.[0] ?? null); setResult(null); setError(null); }}
                className="block w-full text-xs text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-packrs-teal file:text-slate-950 file:text-xs file:font-semibold hover:file:bg-packrs-yellow file:cursor-pointer" />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Import mode</label>
              <select value={mode} onChange={(e) => setMode(e.target.value)} className="w-full rounded-lg bg-slate-950 px-3 py-2 text-sm ring-1 ring-slate-800">
                <option value="upsert">Upsert — update by from+to+service, insert new</option>
                <option value="append">Append — always insert new rows</option>
                <option value="replace">Replace — wipe existing rates first</option>
              </select>
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-lg bg-rose-500/10 px-3 py-2 text-xs text-rose-300 ring-1 ring-rose-500/30">
                <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {result && (
              <div className="rounded-lg bg-emerald-500/5 ring-1 ring-emerald-500/20 p-3 text-xs space-y-1">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <Pill label="Created" value={result.created} accent="emerald" />
                  <Pill label="Updated" value={result.updated} accent="teal" />
                  <Pill label="Skipped" value={(result.skipped || []).length} accent={(result.skipped || []).length ? 'amber' : 'slate'} />
                </div>
                {(result.skipped || []).length > 0 && (
                  <details className="mt-2 text-amber-300/80">
                    <summary className="cursor-pointer text-amber-300">{result.skipped.length} skipped row{result.skipped.length === 1 ? '' : 's'}</summary>
                    <ul className="mt-1 space-y-1 max-h-40 overflow-auto">
                      {result.skipped.map((s, i) => (
                        <li key={i}><span className="font-mono">Row {s.row}:</span> {s.errors.join('; ')}</li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => { setOpen(false); reset(); }} className="rounded-lg bg-slate-800 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-700">Close</button>
              <button onClick={upload} disabled={!file || busy} className="rounded-lg bg-packrs-teal px-3 py-1.5 text-sm font-semibold text-slate-950 hover:bg-packrs-yellow disabled:opacity-50">
                {busy ? 'Uploading…' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Pill({ label, value, accent }) {
  const cls = {
    emerald: 'bg-emerald-500/10 text-emerald-300 ring-emerald-500/30',
    teal:    'bg-packrs-teal/10 text-packrs-teal ring-packrs-teal/30',
    amber:   'bg-amber-500/10 text-amber-300 ring-amber-500/30',
    slate:   'bg-slate-500/10 text-slate-400 ring-slate-700',
  }[accent];
  return (
    <div className={`rounded-md ring-1 px-2 py-1.5 ${cls}`}>
      <div className="font-display font-bold tabular-nums">{value}</div>
      <div className="text-[10px] uppercase tracking-widest mt-0.5 opacity-80">{label}</div>
    </div>
  );
}
