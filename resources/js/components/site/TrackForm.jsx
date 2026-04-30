import { useState } from 'react';
import { CheckCircle2, Circle, Loader2, Package, Truck } from 'lucide-react';
import { api } from '../../lib/api.js';
import { site } from '../../lib/site.js';

const stages = [
  { key: 'booked',    label: 'Pickup booked', icon: Package },
  { key: 'picked',    label: 'Picked up',     icon: Package },
  { key: 'transit',   label: 'In transit',    icon: Truck },
  { key: 'delivered', label: 'Delivered',     icon: CheckCircle2 },
];

export default function TrackForm() {
  const [id, setId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setResult(null);
    const clean = id.trim().toUpperCase();
    if (!clean) return;
    setLoading(true);
    try {
      // Try the live Laravel API first.
      const live = await api.track(clean);
      setResult({
        id: clean,
        stage: 2,
        location: live.current_district,
        eta: live.eta_minutes ? `~${live.eta_minutes} min` : 'In transit',
      });
    } catch {
      // Fallback to deterministic demo if backend is offline.
      const hash = [...clean].reduce((a, c) => a + c.charCodeAt(0), 0);
      setResult({
        id: clean,
        stage: hash % 4,
        location: ['Lalitpur hub', 'Kathmandu hub', 'On route', 'Destination'][hash % 4],
        eta:      ['Today, 4–6 PM', 'Today, 6–8 PM', 'Within 1 hour', 'Delivered'][hash % 4],
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <form onSubmit={onSubmit} className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:flex-row">
        <input
          value={id} onChange={(e) => setId(e.target.value)}
          placeholder="e.g. PKRS-2026-X42"
          className="flex-1 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none focus:border-packrs-orange"
        />
        <button
          type="submit" disabled={loading}
          className="inline-flex items-center justify-center gap-2 btn-glow disabled:opacity-60"
        >
          {loading
            ? <><Loader2 className="h-4 w-4 animate-spin" />Looking up…</>
            : 'Track'}
        </button>
      </form>

      {error && (
        <p className="mt-4 rounded-xl border border-white/10 bg-white/[0.04] p-4 text-sm text-white/70">{error}</p>
      )}

      {result && (
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-white/50">Tracking ID</p>
              <p className="mt-1 font-display text-xl font-bold">{result.id}</p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-widest text-white/50">ETA</p>
              <p className="mt-1 text-sm font-medium text-packrs-orange">{result.eta}</p>
            </div>
          </div>

          <ol className="mt-8 space-y-4">
            {stages.map((s, i) => {
              const done = i < result.stage;
              const current = i === result.stage;
              const Icon = s.icon;
              return (
                <li key={s.key} className="flex items-start gap-3">
                  <span className={
                    'mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-full border ' +
                    (done
                      ? 'border-packrs-orange bg-packrs-orange/10 text-packrs-orange'
                      : current
                        ? 'border-packrs-ember bg-packrs-ember/10 text-packrs-ember'
                        : 'border-white/10 text-white/40')
                  }>
                    {done ? <CheckCircle2 className="h-4 w-4" /> : current ? <Icon className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                  </span>
                  <div>
                    <p className={'text-sm ' + (current ? 'font-semibold' : 'text-white/60')}>{s.label}</p>
                    {current && <p className="text-xs text-white/50">{result.location}</p>}
                  </div>
                </li>
              );
            })}
          </ol>

          <p className="mt-6 border-t border-white/10 pt-4 text-xs text-white/50">
            Live data from API when available, demo fallback otherwise. Prefer to call? {site.phoneDisplay}.
          </p>
        </div>
      )}
    </div>
  );
}
