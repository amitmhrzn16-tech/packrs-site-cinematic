const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

async function get(path) {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`API ${path} ${res.status}`);
  return res.json();
}

export const api = {
  stats: () => get('/stats'),
  track: (id) => get(`/track/${encodeURIComponent(id)}`),
  districts: () => get('/districts'),
  // NRB daily rate, for USD-quoted international tariffs billed in NPR.
  forex: (iso3 = 'USD') => get(`/forex/${encodeURIComponent(iso3)}`),
};

// Fallback when backend isn't running yet — keeps the demo standalone.
export const fallbackStats = {
  parcels_delivered: 30_000_000,
  staff_current: 50,
  staff_target: 1000,
  locations: 556,
  districts: 77,
  sla_hours_min: 4,
  sla_hours_max: 6,
  narrative: 'Carrying Happiness',
};
