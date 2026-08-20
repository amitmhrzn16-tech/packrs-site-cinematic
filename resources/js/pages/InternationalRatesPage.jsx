import { useState } from 'react';
import PageHeader from '../components/site/PageHeader.jsx';
import InternationalRateCalculator from '../components/site/InternationalRateCalculator.jsx';
import DynamicSeo from '../components/site/DynamicSeo.jsx';
import {
  DELIVERY_TERMS, INTL_META, DOC_MAX_KG, PARCEL_SLAB_MAX_KG, MAX_WEIGHT_KG,
} from '../lib/internationalRates.js';
import { ECON_META, ECON_TERMS, ECON_ZONES, ECON_ROUTES, ECON_SLAB_MAX_KG, ECON_PER_KG_MIN_KG } from '../lib/economyRates.js';

const T = DELIVERY_TERMS;
const E = ECON_TERMS;

const npr = (n) => `NPR ${n.toLocaleString('en-IN')}`;

// Express (DHL) delivery terms & surcharges, surfaced from internationalRates.js.
const EXPRESS_TERMS = [
  { highlight: true, title: 'Free packing', desc: `No charge for packing materials. Rates effective ${INTL_META.effectiveFrom}, quoted in NPR.` },
  { title: `Delivery time: ${T.deliveryTime}`, desc: 'Standard delivery is 3–5 working days. Check dct.dhl.com for the accurate day.', link: 'https://www.dct.dhl.com' },
  { title: 'Documents & parcels', desc: `Documents up to ${DOC_MAX_KG} kg; parcels priced in 0.5 kg slabs to ${PARCEL_SLAB_MAX_KG} kg, then per kilogram to ${MAX_WEIGHT_KG} kg. Heavier shipments are quoted on request.` },
  { title: 'Document charges included', desc: 'Document rates are inclusive of the Emergency Charge, TIA charge and VAT.' },
  { title: 'Customs clearance', desc: `${npr(T.customsPerBoxAbove10kg)} per box for shipments above 10 kg.` },
  { title: 'Remote area fee', desc: `${npr(T.remoteArea)} extra for delivery to out-of-city areas.` },
  { title: 'Bad address', desc: `${npr(T.badAddressPerShipment)} per shipment if the delivery address is wrong or incomplete.` },
  { title: 'Overweight pieces', desc: `${npr(T.overweightAbove70kg)} for any single piece above 70 kg (150 lb).` },
];

// Economy terms & surcharges, surfaced from economyRates.js. Everything below
// is the carrier's own charge — no Packrs margin is added to a surcharge, and
// the ones the card quotes in EUR or USD are billed in that currency.
const ECONOMY_TERMS = [
  { highlight: true, title: 'Quoted and billed in NPR', desc: `Every Economy rate is a selling rate in rupees: supplier cost plus ${ECON_META.markupApplied}. ${ECON_META.rounding}. No exchange-rate step between the quote and the invoice. Card effective ${ECON_META.effectiveFrom}, valid ${E.validity.toLowerCase()}.` },
  { title: 'How the weight is priced', desc: `Up to ${ECON_SLAB_MAX_KG} kg a shipment is billed at a flat price for the next 0.5 kg slab. From ${ECON_PER_KG_MIN_KG} kg it is billed per kilogram, on the weight rounded up to the next whole kilogram.` },
  { title: 'Volumetric weight', desc: `Chargeable weight is the higher of actual weight and (L × B × H in cm) ÷ ${E.volumetricDivisor.toLocaleString('en-IN')}.` },
  { title: 'Nepal customs clearance & TIA', desc: `${npr(E.nepalCustomsPerBoxNpr)} per box for customs clearance in Nepal, plus a TIA charge of ${npr(E.tiaPerKgNpr)} per kg. Both apply to every shipment and are charged on top of the rate.` },
  { title: 'Remote area charge', desc: `EUR ${E.remoteAreaEur} on the ${E.remoteAreaApplies} when the address falls outside the carrier's standard delivery area. Call us before you book if the destination looks rural — we confirm it with the carrier first.` },
  { title: 'Bad address', desc: `EUR ${E.badAddressEur} if the delivery address is wrong or incomplete. Wooden box, where one is required: EUR ${E.woodenBoxEur} extra.` },
  { title: 'Weight limit per box', desc: `${E.weightLimitEuropeKg} kg to the UK and all of Europe; ${E.weightLimitUsCanadaKg} kg to the USA and Canada; ${E.weightLimitAustraliaKg} kg to Australia. Heavier consignments are split across boxes.` },
  { title: 'Restricted & surcharged goods', desc: `Dry meat to ${E.dryMeatApplies}: ${npr(E.dryMeatPerKgNpr)} per kg extra. Shipments routed via Frankfurt, ${E.fraSurchargeApplies}: USD ${E.fraSurchargeUsd} extra per shipment.` },
  { title: 'Duty paid or duty unpaid to North America', desc: `${ECON_ROUTES.USCA.name} leaves duty and tax for the consignee to settle on arrival. ${ECON_ROUTES.USCADDP.name} prepays both, and is priced from ${ECON_PER_KG_MIN_KG} kg only.` },
  { title: 'EU zones', desc: `Zone A: ${ECON_ZONES['EU Zone A'].join(', ')}. Zone B: ${ECON_ZONES['EU Zone B'].join(', ')}.` },
];

export default function InternationalRatesPage() {
  const [level, setLevel] = useState('express');
  const economy = level === 'economy';
  const terms = economy ? ECONOMY_TERMS : EXPRESS_TERMS;

  return (
    <>
      <DynamicSeo
        page="international-rates"
        title="International Shipping Rates — Packrs Courier"
        description="Express and Economy international shipping rates from Nepal. DHL Express across 7 zones up to 30 kg, or the Economy network across 16 routes to Europe, the Gulf, Asia, North America and Oceania — all quoted in NPR."
      />
      <PageHeader
        eyebrow="International Shipping · Express & Economy"
        title="Know your rate before you ship"
        description="Pick your service level, destination, and weight — we'll tell you exactly what it costs. Express when it has to be there fast, Economy when the price matters more than the day."
      />
      <section className="pb-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <InternationalRateCalculator level={level} onLevelChange={setLevel} />

          <div className="mt-12">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-display text-2xl font-bold">
                {economy ? 'Economy' : 'Express'} terms &amp; surcharges
              </h2>
              <span className="text-[11px] uppercase tracking-[0.15em] text-white/45">
                {terms.length} things to know
              </span>
            </div>
            <div className="mt-6 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2">
              {terms.map((term, i) => (
                <div
                  key={term.title}
                  className={`flex gap-4 px-5 py-5 ${term.highlight ? 'bg-packrs-teal/[0.06]' : 'bg-packrs-ink/60'}`}
                >
                  <span className="shrink-0 pt-0.5 font-mono text-xs font-bold text-packrs-orange tabular-nums">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h3 className={`text-sm font-semibold ${term.highlight ? 'text-packrs-teal' : ''}`}>{term.title}</h3>
                    <p className="mt-1 text-[13px] leading-relaxed text-white/60">
                      {term.desc}
                      {term.link && (
                        <>
                          {' '}
                          <a href={term.link} target="_blank" rel="noopener noreferrer" className="text-packrs-orange hover:underline">
                            {term.link.replace(/^https?:\/\/(www\.)?/, '')}
                          </a>
                        </>
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:p-8">
            <h3 className="font-display text-lg font-bold">Shipping something unusual?</h3>
            <p className="mt-2 text-sm text-white/60">
              Oversized, fragile, or beyond the weight limits above — call us for a tailored quote before you book.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <a href="tel:+977-9801367205" className="btn-glow">Call +977 9801 367 205</a>
              <a href="mailto:packrs24@gmail.com?subject=International%20shipping%20enquiry" className="btn-ghost">
                Email for a quote
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
