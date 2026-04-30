import { useEffect, useMemo, useState } from 'react';
import { useStore } from '../lib/store.js';
import { api } from '../lib/api.js';
import { ping, cashRustle } from './SoundManager.js';

export default function TrackingPanel() {
  const setGhost = useStore((s) => s.setGhost);
  const fireCash = useStore((s) => s.fireCash);
  const [districts, setDistricts] = useState([]);
  const [q, setQ] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.districts()
      .then((j) => setDistricts(j.districts || []))
      .catch(() => setDistricts([]));
  }, []);

  const ghost = useMemo(() => {
    if (!q || !districts.length) return null;
    // Hash the query the same way the backend does — predictive guess.
    let h = 0;
    for (let i = 0; i < q.length; i++) h = (h * 31 + q.charCodeAt(i)) >>> 0;
    return districts[h % districts.length] || null;
  }, [q, districts]);

  useEffect(() => {
    setGhost(ghost);
    if (ghost) ping(740);
  }, [ghost, setGhost]);

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    try {
      const r = await api.track(q);
      setResult(r);
      ping(540);
      setTimeout(() => {
        fireCash();
        cashRustle();
      }, 600);
    } catch (e) {
      setError('Backend offline — start Laravel (`php artisan serve`) to track live.');
      // Use the predicted district as a graceful demo result.
      if (ghost) setResult({ tracking_id: q, current_district: ghost.name, status: 'predicted', progress: 0.62 });
    }
  }

  return (
    <form onSubmit={onSubmit} className="glass p-5 space-y-3">
      <label className="text-[10px] uppercase tracking-[0.25em] text-white/50">Tracking ID</label>
      <div className="flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="PKRS-2026-XXXX"
          className="flex-1 bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-packrs-orange/60"
        />
        <button type="submit" className="btn-glow text-sm">Track</button>
      </div>
      {ghost && !result && (
        <div className="text-xs text-white/60">
          Predicted district: <span className="text-packrs-orange">{ghost.name}</span>
        </div>
      )}
      {result && (
        <div className="text-xs text-white/80 space-y-1 pt-2 border-t border-white/10">
          <div>Status: <span className="text-packrs-orange uppercase">{result.status}</span></div>
          <div>District: <span className="text-white">{result.current_district}</span></div>
          {result.eta_minutes && <div>ETA: ~{result.eta_minutes} min</div>}
        </div>
      )}
      {error && <div className="text-[11px] text-packrs-ember/80">{error}</div>}
    </form>
  );
}
