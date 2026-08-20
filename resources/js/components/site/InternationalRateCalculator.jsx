import { useMemo, useState } from 'react';
import { Plane, MapPin } from 'lucide-react';
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
export const LEVELS = [
  { value: 'express', label: 'Express', hint: 'DHL · NPR' },
  { value: 'economy', label: 'Economy', hint: '16 routes · NPR' },
];

const ECON_ROUTE_COUNT = Object.keys(ECON_ROUTES).length;

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
  const [econRoute, setEconRoute] = useState('USCA');

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
            <select
              value={econCountry}
              onChange={(e) => onEconCountryChange(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none focus:border-packrs-teal"
            >
              {ECON_COUNTRY_GROUPS.map(({ group, countries }) => (
                <optgroup key={group} label={group}>
                  {Object.keys(countries).sort().map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          ) : (
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none focus:border-packrs-teal"
            >
              {Object.keys(ZONES)
                .map(Number)
                .sort((a, b) => a - b)
                .map((zone) => (
                  <optgroup key={zone} label={`Zone ${zone}`}>
                    {[...ZONES[zone]].sort().map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </optgroup>
                ))}
            </select>
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

function InfoCell({ k, v, positive }) {
  return (
    <div className="bg-packrs-ink/60 px-5 py-4">
      <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-white/50">{k}</div>
      <div className={`mt-1 font-display text-lg font-bold ${positive ? 'text-packrs-teal' : ''}`}>{v}</div>
    </div>
  );
}
