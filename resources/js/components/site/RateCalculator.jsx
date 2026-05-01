import { useEffect, useMemo, useRef, useState } from 'react';
import { Calculator, ChevronDown, MapPin, Phone } from 'lucide-react';

// Live rates come from /api/v1/rates (admin uploads / row edits surface here
// without auth). The static /data/rates.json snapshot is kept as a fallback
// for local dev when the API isn't reachable. Inside-valley + branch-delivery
// use flat presets — they don't vary by destination.
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const PRESETS = {
  inside_valley:   { base_rate: 100, base_kg_limit: 3, additional_kg_mode: 'flat',          additional_kg_rate: 50 },
  branch_delivery: { base_rate: 70,  base_kg_limit: 1, additional_kg_mode: 'base_multiply', additional_kg_rate: null },
};

const SERVICE_TYPES = [
  { value: 'inside_valley',   label: 'Inside Valley',           desc: 'Flat rate — Rs 100 up to 3 kg, Rs 50 per extra kg', usesLocation: false },
  { value: 'branch_delivery', label: 'Branch Delivery',         desc: 'Flat rate — Rs 70 up to 1 kg, additional kg = base rate', usesLocation: false },
  { value: 'express_home',    label: 'Express Home Delivery',   desc: 'Per-destination pricing — door-to-door', usesLocation: true },
  { value: 'express_branch',  label: 'Express Branch Delivery', desc: 'Per-destination pricing — pickup at branch', usesLocation: true },
];

const MODE_LABEL = {
  flat: 'flat per kg',
  base_multiply: 'base × extra kg',
  half_base: 'half base per kg',
};

// Same arithmetic as DeliveryRate::calculate() in packrs crm.
function calculate(rate, weightKg) {
  const w = Math.max(0, Number(weightKg) || 0);
  if (!rate || w === 0) return null;
  const base = Number(rate.base_rate);
  const baseKg = Number(rate.base_kg_limit);
  const overflow = Math.max(0, w - baseKg);
  const extraKg = overflow > 0 ? Math.ceil(overflow) : 0;

  let perExtra = 0;
  if (rate.additional_kg_mode === 'flat')          perExtra = Number(rate.additional_kg_rate ?? 0);
  else if (rate.additional_kg_mode === 'base_multiply') perExtra = base;
  else if (rate.additional_kg_mode === 'half_base')     perExtra = base / 2;

  const extra = extraKg * perExtra;
  return { base, baseKg, mode: rate.additional_kg_mode, perExtra, extraKg, extra, total: base + extra };
}

const FROM = 'Chabahil · Kathmandu';

export default function RateCalculator() {
  const [rates, setRates] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [serviceType, setServiceType] = useState('inside_valley');
  const [destination, setDestination] = useState('');
  const [weight, setWeight] = useState('1');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch(`${API_BASE}/rates`);
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const data = await r.json();
        if (!cancelled) setRates(data);
      } catch (apiErr) {
        try {
          const r = await fetch('/data/rates.json');
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          const data = await r.json();
          if (!cancelled) setRates(data);
        } catch (fallbackErr) {
          if (!cancelled) setLoadError(apiErr.message);
        }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const svc = useMemo(() => SERVICE_TYPES.find((s) => s.value === serviceType), [serviceType]);

  // Rates matching the current service (for the location combobox).
  const matching = useMemo(() => {
    if (!rates || !svc.usesLocation) return [];
    return rates.filter((r) => r.service_type === serviceType && r.active);
  }, [rates, svc, serviceType]);

  // Find the exact rate for the selected destination.
  const selectedRate = useMemo(() => {
    if (!svc.usesLocation) return null;
    return matching.find((r) => r.to_location.toLowerCase() === destination.trim().toLowerCase()) ?? null;
  }, [svc, matching, destination]);

  const effectiveRate = svc.usesLocation
    ? selectedRate
    : { ...PRESETS[serviceType], to_location: '—' };

  const result = useMemo(() => calculate(effectiveRate, weight), [effectiveRate, weight]);

  // Reset destination when switching to a per-location service so previous typing
  // doesn't pollute the new service's lookup.
  useEffect(() => {
    if (svc.usesLocation) setDestination('');
  }, [serviceType, svc.usesLocation]);

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:p-10">
      <div className="flex items-start gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-packrs-teal/30 to-packrs-yellow/20 ring-1 ring-inset ring-white/10">
          <Calculator className="h-5 w-5 text-packrs-teal" />
        </div>
        <div>
          <h2 className="font-display text-2xl font-bold">Rate calculator</h2>
          <p className="text-sm text-white/60">
            {rates ? `${rates.length.toLocaleString()} live rates loaded` : loadError ? 'Using flat-rate defaults' : 'Loading rates…'}
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <Field label="From">
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white/80">
            <MapPin className="h-4 w-4 text-packrs-teal" />
            {FROM}
          </div>
        </Field>

        <Field label="Service type">
          <select
            value={serviceType}
            onChange={(e) => setServiceType(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none focus:border-packrs-teal"
          >
            {SERVICE_TYPES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <p className="mt-1 text-[11px] text-white/50">{svc.desc}</p>
        </Field>

        {svc.usesLocation && (
          <Field label="To (destination)" className="md:col-span-2">
            <DestinationCombobox
              rates={matching}
              value={destination}
              onChange={setDestination}
            />
            {destination && !selectedRate && matching.length > 0 && (
              <p className="mt-1 text-[11px] text-amber-300">
                No exact match — pick one from the dropdown to calculate.
              </p>
            )}
            {selectedRate?.areas_covered?.length > 0 && (
              <div className="mt-2">
                <div className="flex items-center gap-1 text-[11px] text-white/55">
                  <MapPin size={11} className="shrink-0 text-packrs-teal" />
                  <span className="text-white/75">Areas covered ({selectedRate.areas_covered.length})</span>
                </div>
                <ul className="mt-1.5 flex flex-wrap gap-1.5">
                  {selectedRate.areas_covered.map((area) => (
                    <li
                      key={area}
                      className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-0.5 text-[11px] text-white/70 capitalize"
                    >
                      {area.toLowerCase()}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {selectedRate?.contact_number && (
              <p className="mt-1 text-[11px] text-white/55 flex items-center gap-1">
                <Phone size={11} className="shrink-0 text-packrs-teal" />
                <span className="text-white/75">Branch contact:</span>
                <a href={`tel:${selectedRate.contact_number}`} className="hover:text-packrs-teal">{selectedRate.contact_number}</a>
              </p>
            )}
          </Field>
        )}

        <Field label="Weight (kg)">
          <input
            type="number" min="0.1" step="0.1"
            value={weight} onChange={(e) => setWeight(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none focus:border-packrs-teal tabular-nums"
          />
        </Field>
      </div>

      {result && (
        <div className="mt-8 rounded-2xl border border-packrs-teal/30 bg-packrs-teal/[0.04] p-6">
          <div className="flex items-baseline justify-between gap-3 flex-wrap">
            <span className="text-[11px] uppercase tracking-[0.25em] font-semibold text-packrs-teal">
              Estimated total
            </span>
            <span className="font-display text-4xl font-bold text-packrs-teal tabular-nums drop-shadow-[0_0_18px_rgba(41,255,202,0.45)]">
              Rs {result.total.toFixed(0)}
            </span>
          </div>

          <dl className="mt-5 grid grid-cols-2 gap-y-1.5 text-xs text-white/70">
            <dt>Base rate</dt>
            <dd className="text-right tabular-nums">Rs {result.base.toFixed(0)}</dd>
            <dt>Includes up to</dt>
            <dd className="text-right tabular-nums">{result.baseKg} kg</dd>
            <dt>Extra kg charged</dt>
            <dd className="text-right tabular-nums">{result.extraKg}</dd>
            <dt>Per extra kg</dt>
            <dd className="text-right tabular-nums">
              Rs {result.perExtra.toFixed(0)}
              <span className="ml-1 text-white/40">({MODE_LABEL[result.mode]})</span>
            </dd>
            <dt>Extra charge</dt>
            <dd className="text-right tabular-nums">Rs {result.extra.toFixed(0)}</dd>
          </dl>

          {svc.usesLocation && selectedRate && (
            <p className="mt-4 border-t border-white/10 pt-3 text-xs text-white/60">
              Delivering to <span className="text-white">{selectedRate.to_location}</span> as a{' '}
              <span className="text-packrs-teal">{svc.label.toLowerCase()}</span>.
            </p>
          )}
        </div>
      )}

      {svc.usesLocation && !selectedRate && (
        <p className="mt-6 text-xs text-white/50">
          Pick a destination above to see the rate. Don't see your area? Call us — coverage is constantly expanding.
        </p>
      )}
    </div>
  );
}

function Field({ label, className = '', children }) {
  return (
    <label className={`block ${className}`}>
      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

function DestinationCombobox({ rates, value, onChange }) {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const wrapRef = useRef(null);
  const inputRef = useRef(null);

  const filtered = useMemo(() => {
    const q = (value || '').trim().toLowerCase();
    if (!q) return rates.slice(0, 200);
    const out = rates.filter((r) =>
      r.to_location.toLowerCase().includes(q) ||
      (r.areas_covered || []).some((a) => a.toLowerCase().includes(q))
    );
    return out.slice(0, 200);
  }, [rates, value]);

  useEffect(() => {
    if (!open) return;
    const onDocDown = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDocDown);
    return () => document.removeEventListener('mousedown', onDocDown);
  }, [open]);

  useEffect(() => { setHighlight(0); }, [value, open]);

  const select = (rate) => {
    onChange(rate.to_location);
    setOpen(false);
    inputRef.current?.blur();
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); if (!open) setOpen(true); setHighlight((h) => Math.min(h + 1, filtered.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlight((h) => Math.max(0, h - 1)); }
    else if (e.key === 'Enter' && open && filtered[highlight]) { e.preventDefault(); select(filtered[highlight]); }
    else if (e.key === 'Escape') setOpen(false);
  };

  const empty = rates.length === 0;

  return (
    <div ref={wrapRef} className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => { onChange(e.target.value); if (!open) setOpen(true); }}
        onFocus={() => !empty && setOpen(true)}
        onClick={() => !empty && setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder={empty ? 'No locations loaded yet…' : 'Type a city or area — Pokhara, Boudha, Lakeside…'}
        autoComplete="off"
        disabled={empty}
        className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 pr-10 text-sm outline-none focus:border-packrs-teal disabled:opacity-50"
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => !empty && setOpen((o) => !o)}
        className="absolute inset-y-0 right-0 flex items-center px-3 text-white/50 hover:text-white"
        aria-label="Toggle destinations"
      >
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && filtered.length > 0 && (
        <ul
          role="listbox"
          className="absolute z-30 left-0 right-0 mt-1 max-h-72 overflow-auto rounded-xl border border-white/10 bg-packrs-ink/95 backdrop-blur-xl shadow-glass py-1"
        >
          {filtered.map((r, i) => (
            <li
              key={`${r.to_location}-${i}`}
              role="option"
              aria-selected={i === highlight}
              onMouseDown={(e) => { e.preventDefault(); select(r); }}
              onMouseEnter={() => setHighlight(i)}
              className={`px-3 py-2 cursor-pointer ${i === highlight ? 'bg-packrs-teal/10' : 'hover:bg-white/[0.04]'}`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-white">{r.to_location}</span>
                <span className="text-[10px] tabular-nums text-packrs-teal">Rs {Number(r.base_rate).toFixed(0)}</span>
              </div>
              {r.areas_covered?.length > 0 && (
                <div className="mt-0.5 text-[11px] text-white/50 truncate">
                  {r.areas_covered.slice(0, 4).join(', ')}{r.areas_covered.length > 4 ? '…' : ''}
                </div>
              )}
            </li>
          ))}
          {rates.length > filtered.length + 0 && filtered.length === 200 && (
            <li className="px-3 py-2 text-[11px] text-white/40">
              Showing first 200 — keep typing to narrow down.
            </li>
          )}
        </ul>
      )}

      {open && filtered.length === 0 && !empty && (
        <div className="absolute z-30 left-0 right-0 mt-1 rounded-xl border border-white/10 bg-packrs-ink/95 backdrop-blur-xl px-3 py-3 text-xs text-white/60">
          No matches for &ldquo;{value}&rdquo;.
        </div>
      )}
    </div>
  );
}
