import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Inbox, TrendingUp, CheckCircle2, Clock, BarChart3, ArrowUpRight } from 'lucide-react';
import { adminApi } from './api.js';
import AdminPageShell from './AdminPageShell.jsx';
import { useAutoRefresh } from './useAutoRefresh.js';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const refresh = useCallback(() => {
    adminApi.analytics.dashboard().then(setData).catch(() => {});
  }, []);
  useEffect(refresh, [refresh]);
  useAutoRefresh(refresh, 30_000);

  const t = data?.totals ?? {};
  const series = data?.series_30d ?? [];
  const peak = Math.max(1, ...series.map((d) => d.count));

  return (
    <AdminPageShell
      title="Dashboard"
      description="Booking trends, recent activity, and what needs attention."
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Stat icon={Inbox} label="Today" value={t.today ?? '—'} accent="teal" />
        <Stat icon={TrendingUp} label="This week" value={t.this_week ?? '—'} accent="yellow" />
        <Stat icon={Clock} label="New / unhandled" value={t.new ?? '—'} accent="rose" cta={{ to: '/admin/bookings?status=new', label: 'Triage' }} />
        <Stat icon={CheckCircle2} label="Converted" value={t.converted ?? '—'} accent="emerald" />
        <Stat icon={BarChart3} label="All-time" value={t.all_time ?? '—'} accent="slate" />
      </div>

      <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-white">Bookings — last 30 days</h2>
          <Link to="/admin/bookings" className="text-xs text-packrs-teal hover:underline inline-flex items-center gap-1">
            View all <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
        {/* Simple SVG sparkline so we don't pull in a chart library yet. */}
        <div className="mt-6 h-40 flex items-end gap-1">
          {series.map((d) => (
            <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group">
              <div
                className="w-full rounded-t bg-packrs-teal/40 group-hover:bg-packrs-teal transition"
                style={{ height: `${(d.count / peak) * 100}%`, minHeight: d.count > 0 ? 2 : 1 }}
                title={`${d.date}: ${d.count}`}
              />
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between text-[10px] text-slate-500">
          <span>{series[0]?.date ?? ''}</span>
          <span>{series[series.length - 1]?.date ?? ''}</span>
        </div>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card title="By status">
          <ul className="space-y-2 text-sm">
            {Object.entries(data?.by_status ?? {}).length === 0 && <li className="text-slate-500">No bookings yet.</li>}
            {Object.entries(data?.by_status ?? {}).map(([k, v]) => (
              <li key={k} className="flex items-center justify-between rounded-lg bg-slate-950/40 px-3 py-2 ring-1 ring-slate-800">
                <span className="capitalize text-slate-300">{k}</span>
                <span className="font-display font-bold text-packrs-teal tabular-nums">{v}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Top business types">
          <ul className="space-y-2 text-sm">
            {(data?.top_business_types ?? []).length === 0 && <li className="text-slate-500">No bookings yet.</li>}
            {(data?.top_business_types ?? []).map((row) => (
              <li key={row.business_type} className="flex items-center justify-between rounded-lg bg-slate-950/40 px-3 py-2 ring-1 ring-slate-800">
                <span className="text-slate-300">{row.business_type}</span>
                <span className="font-display font-bold text-packrs-yellow tabular-nums">{row.count}</span>
              </li>
            ))}
          </ul>
        </Card>
      </section>
    </AdminPageShell>
  );
}

const ACCENTS = {
  teal:    'bg-packrs-teal/10 text-packrs-teal ring-packrs-teal/30',
  yellow:  'bg-packrs-yellow/10 text-packrs-yellow ring-packrs-yellow/30',
  rose:    'bg-rose-500/10 text-rose-300 ring-rose-500/30',
  emerald: 'bg-emerald-500/10 text-emerald-300 ring-emerald-500/30',
  slate:   'bg-slate-500/10 text-slate-300 ring-slate-500/30',
};

function Stat({ icon: Icon, label, value, accent, cta }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
      <div className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ring-1 ${ACCENTS[accent]}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="mt-4 font-display text-3xl font-bold text-white tabular-nums">{value}</div>
      <div className="mt-1 text-xs text-slate-400 flex items-center justify-between">
        <span>{label}</span>
        {cta && <Link to={cta.to} className="text-packrs-teal hover:underline">{cta.label} →</Link>}
      </div>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
      <h3 className="font-semibold text-white">{title}</h3>
      <div className="mt-4">{children}</div>
    </div>
  );
}
