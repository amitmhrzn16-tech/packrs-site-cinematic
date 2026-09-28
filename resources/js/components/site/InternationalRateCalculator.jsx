import { useEffect, useMemo, useRef, useState } from 'react';
import { Plane, MapPin, ChevronDown } from 'lucide-react';
import {
  INTL_META, ZONES, DELIVERY_TERMS, SURCHARGES, DOC_MAX_KG, MAX_WEIGHT_KG, calcIntlRate,
} from '../../lib/internationalRates.js';
import {
  ECON_META, ECON_ROUTES, ECON_COUNTRY_GROUPS, ECON_COUNTRIES, ECON_TERMS,
  ECON_SLAB_MAX_KG, ECON_MAX_KG, calcEconomyRate,
} from '../../lib/economyRates.js';

const FROM = 'Kathmandu · Nepal';

// The two service levels the page offers. Express is DHL (fast); Economy is
// the consolidator network (cheaper). Both are priced in NPR.
const ECON_ROUTE_COUNT = Object.keys(ECON_ROUTES).length;

export const LEVELS = [
  { value: 'express', label: 'Express', hint: 'DHL · NPR' },
  { value: 'economy', label: 'Economy', hint: `${ECON_ROUTE_COUNT} routes · NPR` },
];

// Destination lists for the type-to-search picker, grouped as the old
// <select> optgroups were: EU/Asia/… regions for Economy, DHL zones for Express.
const ECON_PICKER_GROUPS = ECON_COUNTRY_GROUPS.map(({ group, countries }) => ({
  group,
  countries: Object.keys(countries).sort(),
}));

const EXPRESS_PICKER_GROUPS = Object.keys(ZONES)
  .map(Number)
  .sort((a, b) => a - b)
  .map((zone) => ({ group: `Zone ${zone}`, countries: [...ZONES[zone]].sort() }));

const SERVICES = [
  { value: 'Document', label: 'Document', hint: '≤ 2 kg' },
  { value: 'Parcel', label: 'Parcel', hint: '≤ 30 kg' },
];

function fmtNpr(n) {
  return Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

export default function InternationalRateCalculator({ level = 'express', onLevelChange }) {
  const economy = level === 'economy';

  // Express (DHL) inputs
  const [country, setCountry] = useState('USA');
  const [service, setService] = useState('Parcel');

  // Economy (consolidator) inputs — its own country list, so its own state.
  const [econCountry, setEconCountry] = useState('USA');
  const [econRoute, setEconRoute] = useState('USCAFDX');

  // Weight is shared: switching service level keeps what you already typed.
  const [weight, setWeight] = useState('2');

  const econRoutes = ECON_COUNTRIES[econCountry] ?? [];

  const onEconCountryChange = (next) => {
    setEconCountry(next);
    const first = ECON_COUNTRIES[next]?.[0];
    if (first) setEconRoute(first);
  };

  const result = useMemo(
    () => (economy
      ? calcEconomyRate(econCountry, weight, econRoute)
      : calcIntlRate(country, weight, service)),
    [economy, econCountry, econRoute, country, service, weight],
  );

  const w = parseFloat(weight);
  const destination = economy ? econCountry : country;
  const maxKg = economy ? ECON_MAX_KG : MAX_WEIGHT_KG;

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:p-10">
      <div className="flex items-start gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-packrs-teal/30 to-packrs-yellow/20 ring-1 ring-inset ring-white/10">
          <Plane className="h-5 w-5 text-packrs-teal" />
        </div>
        <div>
          <h2 className="font-display text-2xl font-bold">International rate calculator</h2>
          <p className="text-sm text-white/60">
            {economy
              ? `Economy network · ${ECON_ROUTE_COUNT} routes · rates effective ${ECON_META.effectiveFrom}`
              : `DHL Express · 7 zones · rates effective ${INTL_META.effectiveFrom}`}
          </p>
        </div>
      </div>

      <div className="mt-8">
        <Field label="Service level">
          <div className="grid grid-cols-2 gap-2">
            {LEVELS.map((l) => {
              const active = level === l.value;
              return (
                <button
                  key={l.value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onLevelChange?.(l.value)}
                  className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-colors ${
                    active
                      ? 'border-packrs-teal bg-packrs-teal/10 text-packrs-teal'
                      : 'border-white/10 bg-black/30 text-white/70 hover:text-white'
                  }`}
                >
                  {l.label}
                  <span className="ml-1.5 text-[11px] font-normal text-white/40">{l.hint}</span>
                </button>
              );
            })}
          </div>
        </Field>
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <Field label="From">
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white/80">
            <MapPin className="h-4 w-4 text-packrs-teal" />
            {FROM}
          </div>
        </Field>

        <Field label="Destination country">
          {economy ? (
            <CountryCombobox
              key="economy"
              groups={ECON_PICKER_GROUPS}
              value={econCountry}
              onChange={onEconCountryChange}
            />
          ) : (
            <CountryCombobox
              key="express"
              groups={EXPRESS_PICKER_GROUPS}
              value={country}
              onChange={setCountry}
            />
          )}
        </Field>

        {economy ? (
          <Field label="Route">
            <select
              value={econRoute}
              onChange={(e) => setEconRoute(e.target.value)}
              disabled={!econRoutes.length}
              className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none focus:border-packrs-teal disabled:opacity-50"
            >
              {econRoutes.map((code) => (
                <option key={code} value={code}>
                  {ECON_ROUTES[code].name} — {ECON_ROUTES[code].covers}
                </option>
              ))}
            </select>
            <p className="mt-1 text-[11px] text-white/50">
              {econRoutes.length > 1 ? `${econRoutes.length} routes available` : 'Dedicated route'}
            </p>
          </Field>
        ) : (
          <Field label="Service type">
            <div className="grid grid-cols-2 gap-2">
              {SERVICES.map((s) => {
                const active = service === s.value;
                return (
                  <button
                    key={s.value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setService(s.value)}
                    className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-colors ${
                      active
                        ? 'border-packrs-teal bg-packrs-teal/10 text-packrs-teal'
                        : 'border-white/10 bg-black/30 text-white/70 hover:text-white'
                    }`}
                  >
                    {s.label}
                    <span className="ml-1.5 text-[11px] font-normal text-white/40">{s.hint}</span>
                  </button>
                );
              })}
            </div>
          </Field>
        )}

        <Field label="Weight (kg)">
          <input
            type="number" min="0.1" step="0.1"
            value={weight} onChange={(e) => setWeight(e.target.value)}
            placeholder="e.g. 1.5"
            className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none focus:border-packrs-teal tabular-nums"
          />
          <p className="mt-1 text-[11px] text-white/50">
            {economy
              ? `0.5 kg slabs to ${ECON_SLAB_MAX_KG} kg · per-kg above · max ${maxKg} kg`
              : service === 'Document' ? `Range: 0.5 – ${DOC_MAX_KG} kg` : `Range: 0.5 – ${maxKg} kg`}
          </p>
        </Field>
      </div>

      <div className="mt-8 rounded-2xl border border-packrs-teal/30 bg-packrs-teal/[0.04] p-6">
        <div className="flex items-baseline justify-between gap-3 flex-wrap">
          <div>
            <span className="text-[11px] uppercase tracking-[0.25em] font-semibold text-packrs-teal">
              Estimated rate
            </span>
            <p className="mt-1 font-display text-lg font-bold">Kathmandu → {destination}</p>
          </div>
          {result.error ? (
            <span className="text-sm text-amber-300 max-w-xs text-right">{result.error}</span>
          ) : (
            <div className="text-right">
              <span className="font-display text-4xl font-bold text-packrs-teal tabular-nums drop-shadow-[0_0_18px_rgba(41,255,202,0.45)]">
                NPR {fmtNpr(result.rate)}
              </span>
            </div>
          )}
        </div>

        {!result.error && (
          <p className="mt-3 text-xs text-white/60">
            {economy ? (
              <>
                {result.mode === 'perkg'
                  ? `${ECON_ROUTES[result.route].name} · billed ${result.billedKg} kg × NPR ${fmtNpr(result.perKg)}/kg (${result.tier} tier)`
                  : `${ECON_ROUTES[result.route].name} · ${w} kg (billed at ${result.slab} kg slab)`}
                {' · '}
                {`Nepal customs NPR ${fmtNpr(ECON_TERMS.nepalCustomsPerBoxNpr)}/box and TIA NPR ${fmtNpr(ECON_TERMS.tiaPerKgNpr)}/kg are charged on top`}
              </>
            ) : (
              result.mode === 'perkg'
                ? `${service} · billed ${result.billedKg} kg × NPR ${fmtNpr(result.perKg)}/kg (${result.tier}) · Zone ${result.zone}`
                : `${service} · ${w} kg (billed at ${result.slab} kg slab) · Zone ${result.zone}`
            )}
          </p>
        )}
      </div>

      <div className="mt-4 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-3">
        {economy ? (
          <>
            <InfoCell k="Chargeable weight" v={`L×B×H ÷ ${ECON_TERMS.volumetricDivisor.toLocaleString('en-IN')}`} />
            <InfoCell k="Nepal customs" v={`NPR ${fmtNpr(ECON_TERMS.nepalCustomsPerBoxNpr)}/box`} />
            <InfoCell k="TIA charge" v={`NPR ${fmtNpr(ECON_TERMS.tiaPerKgNpr)}/kg`} />
          </>
        ) : (
          <>
            <InfoCell k="Delivery time" v={DELIVERY_TERMS.deliveryTime} />
            <InfoCell k="Packing" v="Free" positive />
            <InfoCell k="Customs above 10 kg" v={`NPR ${fmtNpr(SURCHARGES.customsPerBoxAbove10kg)}/box`} />
          </>
        )}
      </div>
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

// Type-to-search destination picker. What the user types only filters the
// list; the selected country changes only when an option is picked, so the
// calculator never receives a half-typed name.
function CountryCombobox({ groups, value, onChange }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlight, setHighlight] = useState(0);
  const wrapRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return groups;
    return groups
      .map((g) => ({ ...g, countries: g.countries.filter((c) => c.toLowerCase().includes(q)) }))
      .filter((g) => g.countries.length);
  }, [groups, query]);

  const flat = useMemo(() => filteredGroups.flatMap((g) => g.countries), [filteredGroups]);

  const close = () => { setOpen(false); setQuery(''); };

  useEffect(() => {
    if (!open) return undefined;
    const onDocDown = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) close(); };
    document.addEventListener('mousedown', onDocDown);
    return () => document.removeEventListener('mousedown', onDocDown);
  }, [open]);

  // Start on the current country when opening; jump to the first match while typing.
  useEffect(() => {
    if (!open) return;
    const idx = query ? 0 : flat.indexOf(value);
    setHighlight(Math.max(0, idx));
  }, [open, query]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!open) return;
    listRef.current?.querySelector(`[data-idx="${highlight}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [open, highlight]);

  const select = (c) => {
    onChange(c);
    close();
    inputRef.current?.blur();
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); if (!open) setOpen(true); else setHighlight((h) => Math.min(h + 1, flat.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlight((h) => Math.max(0, h - 1)); }
    else if (e.key === 'Enter') { if (open && flat[highlight]) { e.preventDefault(); select(flat[highlight]); } }
    else if (e.key === 'Escape') { close(); inputRef.current?.blur(); }
    else if (e.key === 'Tab') close();
  };

  let idx = -1;

  return (
    <div ref={wrapRef} className="relative">
      <input
        ref={inputRef}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        value={open ? query : value}
        onChange={(e) => { setQuery(e.target.value); if (!open) setOpen(true); }}
        onFocus={() => setOpen(true)}
        onClick={() => setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder={open ? `Type to search — ${value}` : 'Type a country…'}
        autoComplete="off"
        className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 pr-10 text-sm outline-none focus:border-packrs-teal"
      />
      <button
        type="button"
        tabIndex={-1}
        onMouseDown={(e) => { e.preventDefault(); if (open) close(); else inputRef.current?.focus(); }}
        className="absolute inset-y-0 right-0 flex items-center px-3 text-white/50 hover:text-white"
        aria-label="Show destinations"
      >
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          ref={listRef}
          role="listbox"
          className="absolute z-30 left-0 right-0 mt-1 max-h-72 overflow-auto rounded-xl border border-white/10 bg-packrs-ink/95 backdrop-blur-xl shadow-glass py-1"
        >
          {flat.length === 0 ? (
            <div className="px-3 py-3 text-xs text-white/60">
              No destinations match &ldquo;{query}&rdquo;.
            </div>
          ) : filteredGroups.map(({ group, countries }) => (
            <div key={group}>
              <div className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">{group}</div>
              {countries.map((c) => {
                idx += 1;
                const i = idx;
                return (
                  <div
                    key={c}
                    data-idx={i}
                    role="option"
                    aria-selected={c === value}
                    onMouseDown={(e) => { e.preventDefault(); select(c); }}
                    onMouseEnter={() => setHighlight(i)}
                    className={`cursor-pointer px-3 py-2 text-sm ${i === highlight ? 'bg-packrs-teal/10' : ''} ${c === value ? 'font-semibold text-packrs-teal' : 'text-white'}`}
                  >
                    {c}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function InfoCell({ k, v, positive }) {
  return (
    <div className="bg-packrs-ink/60 px-5 py-4">
      <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-white/50">{k}</div>
      <div className={`mt-1 font-display text-lg font-bold ${positive ? 'text-packrs-teal' : ''}`}>{v}</div>
    </div>
  );
}
