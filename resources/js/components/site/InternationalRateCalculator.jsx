import { useMemo, useState } from 'react';
import { Plane, MapPin } from 'lucide-react';
import {
  INTL_META, ZONES, DELIVERY_TERMS, DOC_MAX_KG, MAX_WEIGHT_KG, calcIntlRate,
} from '../../lib/internationalRates.js';

const FROM = 'Kathmandu · Nepal';
const SERVICES = [
  { value: 'Document', label: 'Document', hint: '≤ 2 kg' },
  { value: 'Parcel', label: 'Parcel', hint: '≤ 300 kg' },
];

function fmt(n) {
  return Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

export default function InternationalRateCalculator() {
  const [country, setCountry] = useState('USA');
  const [weight, setWeight] = useState('2');
  const [service, setService] = useState('Parcel');

  const result = useMemo(() => calcIntlRate(country, weight, service), [country, weight, service]);
  const w = parseFloat(weight);

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:p-10">
      <div className="flex items-start gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-packrs-teal/30 to-packrs-yellow/20 ring-1 ring-inset ring-white/10">
          <Plane className="h-5 w-5 text-packrs-teal" />
        </div>
        <div>
          <h2 className="font-display text-2xl font-bold">International rate calculator</h2>
          <p className="text-sm text-white/60">
            DHL Express · 7 zones · parcel prices include {INTL_META.markupApplied} Packrs markup
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

        <Field label="Destination country">
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
        </Field>

        <Field label="Service type">
          <div className="grid grid-cols-2 gap-2">
            {SERVICES.map((s) => {
              const active = service === s.value;
              return (
                <button
                  key={s.value}
                  type="button"
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

        <Field label="Weight (kg)">
          <input
            type="number" min="0.1" step="0.1"
            value={weight} onChange={(e) => setWeight(e.target.value)}
            placeholder="e.g. 1.5"
            className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none focus:border-packrs-teal tabular-nums"
          />
          <p className="mt-1 text-[11px] text-white/50">
            {service === 'Document' ? `Range: 0.5 – ${DOC_MAX_KG} kg` : `Range: 0.5 – ${MAX_WEIGHT_KG} kg`}
          </p>
        </Field>
      </div>

      <div className="mt-8 rounded-2xl border border-packrs-teal/30 bg-packrs-teal/[0.04] p-6">
        <div className="flex items-baseline justify-between gap-3 flex-wrap">
          <div>
            <span className="text-[11px] uppercase tracking-[0.25em] font-semibold text-packrs-teal">
              Estimated rate
            </span>
            <p className="mt-1 font-display text-lg font-bold">Kathmandu → {country}</p>
          </div>
          {result.error ? (
            <span className="text-sm text-amber-300 max-w-xs text-right">{result.error}</span>
          ) : (
            <span className="font-display text-4xl font-bold text-packrs-teal tabular-nums drop-shadow-[0_0_18px_rgba(41,255,202,0.45)]">
              NPR {fmt(result.rate)}
            </span>
          )}
        </div>

        {!result.error && (
          <p className="mt-3 text-xs text-white/60">
            {result.mode === 'perkg'
              ? `${service} · ${w} kg · Zone ${result.zone} · bulk rate NPR ${fmt(result.perKg)}/kg × ${w} kg`
              : `${service} · ${w} kg (billed at ${result.slab} kg slab) · Zone ${result.zone}`}
          </p>
        )}
      </div>

      <div className="mt-4 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-3">
        <InfoCell k="Delivery time" v={DELIVERY_TERMS.deliveryTime} />
        <InfoCell k="Customs in Nepal" v="Free" positive />
        <InfoCell k="Packing" v="Free" positive />
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
