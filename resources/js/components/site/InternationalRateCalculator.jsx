import { useEffect, useMemo, useState } from 'react';
import { Plane, MapPin } from 'lucide-react';
import { api } from '../../lib/api.js';
import {
  INTL_META, ZONES, DELIVERY_TERMS, DOC_MAX_KG, MAX_WEIGHT_KG, calcIntlRate,
} from '../../lib/internationalRates.js';
import {
  ECON_META, ECON_ROUTES, ECON_COUNTRY_GROUPS, ECON_COUNTRIES,
  ECON_SLAB_MAX_KG, ECON_MAX_KG, calcEconomyRate,
} from '../../lib/economyRates.js';

const FROM = 'Kathmandu · Nepal';

// The two service levels the page offers. Express is DHL (fast, NPR);
// Economy is the consolidator network (cheaper, USD).
export const LEVELS = [
  { value: 'express', label: 'Express', hint: 'DHL · NPR' },
  { value: 'economy', label: 'Economy', hint: '22 routes · USD' },
];

const SERVICES = [
  { value: 'Document', label: 'Document', hint: '≤ 2 kg' },
  { value: 'Parcel', label: 'Parcel', hint: '≤ 300 kg' },
];

function fmtNpr(n) {
  return Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

function fmtUsd(n) {
  return Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// 2026-07-25 → 25 Jul 2026. NRB publishes plain ISO dates.
function fmtDate(iso) {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function InternationalRateCalculator({ level = 'express', onLevelChange }) {
  const economy = level === 'economy';

  // Express (DHL) inputs
  const [country, setCountry] = useState('USA');
  const [service, setService] = useState('Parcel');

  // Economy (consolidator) inputs — its own country list, so its own state.
  const [econCountry, setEconCountry] = useState('USA');
  const [econRoute, setEconRoute] = useState('JFKDDU');

  // Weight is shared: switching service level keeps what you already typed.
  const [weight, setWeight] = useState('2');

  // NRB daily rate, so a USD quote can also be shown in what the customer pays.
  // Fetched the first time Economy is opened; absence is not an error state —
  // the quote still stands in USD if NRB is unreachable.
  const [forex, setForex] = useState(null);

  useEffect(() => {
    if (!economy || forex) return;
    let cancelled = false;
    api.forex('USD')
      .then((data) => { if (!cancelled) setForex(data); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [economy, forex]);

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

  // NRB quotes per `unit` of currency. Selling rate: the bank sells the USD
  // the shipment is billed in, so that is what the customer converts at.
  const usdToNpr = forex ? forex.sell / (forex.unit || 1) : null;
  const npr = usdToNpr && !result.error && economy ? result.rate * usdToNpr : null;

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
              ? `Economy network · 22 routes · rates in USD, effective ${ECON_META.effectiveFrom}`
              : `DHL Express · 7 zones · parcel prices include ${INTL_META.markupApplied} Packrs markup`}
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
                {economy ? `USD ${fmtUsd(result.rate)}` : `NPR ${fmtNpr(result.rate)}`}
              </span>
              {economy && npr && (
                <>
                  <div className="mt-1 font-display text-2xl font-bold text-white tabular-nums">
                    NPR {fmtNpr(npr)}
                  </div>
                  <div className="mt-1 text-[11px] text-white/45 tabular-nums">
                    1 USD = NPR {fmtUsd(usdToNpr)} · NRB{forex?.date ? ` ${fmtDate(forex.date)}` : ''}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {!result.error && (
          <p className="mt-3 text-xs text-white/60">
            {economy ? (
              <>
                {result.mode === 'perkg'
                  ? `${ECON_ROUTES[result.route].name} · billed ${result.billedKg} kg × $${fmtUsd(result.perKg)}/kg (${result.tier} tier)`
                  : `${ECON_ROUTES[result.route].name} · ${w} kg (billed at ${result.slab} kg slab)`}
                {' · '}
                {forex
                  ? `Billed in NPR at the NRB selling rate${forex.stale ? ' (last published)' : ''}`
                  : ECON_META.billingNote}
              </>
            ) : (
              result.mode === 'perkg'
                ? `${service} · ${w} kg · Zone ${result.zone} · bulk rate NPR ${fmtNpr(result.perKg)}/kg × ${w} kg`
                : `${service} · ${w} kg (billed at ${result.slab} kg slab) · Zone ${result.zone}`
            )}
          </p>
        )}
      </div>

      <div className="mt-4 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-3">
        {economy ? (
          <>
            <InfoCell k="Chargeable weight" v="L×B×H ÷ 5000" />
            <InfoCell
              k={forex?.date ? `NRB rate · ${fmtDate(forex.date)}` : 'Payment'}
              v={usdToNpr ? `NPR ${fmtUsd(usdToNpr)} / USD` : 'NPR at NRB rate'}
            />
            <InfoCell k="Insurance" v="USD 1,000 max" positive />
          </>
        ) : (
          <>
            <InfoCell k="Delivery time" v={DELIVERY_TERMS.deliveryTime} />
            <InfoCell k="Customs in Nepal" v="Free" positive />
            <InfoCell k="Packing" v="Free" positive />
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
