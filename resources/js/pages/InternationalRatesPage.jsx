import { useState } from 'react';
import PageHeader from '../components/site/PageHeader.jsx';
import InternationalRateCalculator from '../components/site/InternationalRateCalculator.jsx';
import DynamicSeo from '../components/site/DynamicSeo.jsx';
import { DELIVERY_TERMS } from '../lib/internationalRates.js';
import { ECON_META, ECON_TERMS } from '../lib/economyRates.js';

const T = DELIVERY_TERMS;
const E = ECON_TERMS;

const npr = (n) => `NPR ${n.toLocaleString('en-IN')}`;

// Express (DHL) delivery terms & surcharges, surfaced from internationalRates.js.
const EXPRESS_TERMS = [
  { highlight: true, title: 'Free packing & customs in Nepal', desc: 'No charge for packing materials or customs clearance in Nepal — included with every shipment.' },
  { title: `Delivery time: ${T.deliveryTime}`, desc: 'Standard delivery is 3–5 working days. Check dct.dhl.com for the accurate day.', link: 'https://www.dct.dhl.com' },
  { title: 'Remote area fee', desc: `${npr(T.remoteAreaFeeNpr)} extra for delivery to out-of-city areas.` },
  { title: 'Wooden box / tube packing', desc: `${npr(T.woodenBoxOrTubeNpr)} extra if your shipment requires a wooden box or tube.` },
  { title: 'Oversized packets (≥ 100 cm)', desc: `${npr(T.oversizePacket100cmNpr)} extra for any individual packet measuring 100 cm or more on any side.` },
  { title: 'Heavy packets 24.5–79.5 kg', desc: `${npr(T.heavy24_5to79_5Npr)} extra per packet weighing between 24.5 kg and 79.5 kg.` },
  { title: 'Heavy packets ≥ 79.5 kg', desc: `${npr(T.heavyAbove79_5Npr)} extra per packet weighing 79.5 kg or more.` },
  { title: 'Address change & war zones', desc: `Address change after departure: ${npr(T.addressChangeNpr)}. War-affected regions: ${T.warZoneNote.toLowerCase()}` },
];

// Economy delivery terms & surcharges, surfaced from economyRates.js. These are
// the carrier's pass-through charges — no Packrs margin is added to them.
const ECONOMY_TERMS = [
  { highlight: true, title: 'Rates in USD, billed in NPR', desc: `Every Economy rate is quoted in USD and converted at the NRB daily exchange rate. Rate card effective ${ECON_META.effectiveFrom}.` },
  { title: 'Volumetric weight', desc: `Chargeable weight is the higher of actual weight and (L × B × H in cm) ÷ ${E.volumetricDivisor.toLocaleString('en-IN')}.` },
  { title: 'Nepal customs handling', desc: `${npr(E.customsPerBoxOver10kgNpr)} per box over 10 kg; ${npr(E.customsPerKgOver0_5kgNpr)}/kg for items over 0.5 kg. Nepal Post shipments: ${npr(E.nepalPostPerConsignmentNpr)} per consignment plus ${npr(E.nepalPostPerBoxNpr)} per box.` },
  { title: 'Remote area charges', desc: E.remoteArea },
  { title: 'Weight limits per box', desc: E.weightLimits },
  { title: 'Food & restricted items', desc: `Ghee, pickle, honey and oil: ${npr(E.bottledGoodsPerBottleNpr)} per bottle to Korea and Japan. Food misdeclared to Europe: EUR ${E.misdeclaredFoodEuropeEur} charge. No medicine or seeds on the 1000 Japan route.` },
  { title: 'Liability & insurance', desc: `Lost parcels: USD ${E.lostParcelCompensationUsd} plus courier charges, except where the fault is the shipper's or consignee's. Insurance up to USD ${E.insuranceMaxUsd.toLocaleString('en-US')} per consignment. No compensation for customs delays, flight cancellations, weather, or goods destroyed by customs for missing documents.` },
  { title: 'Islands & late payment', desc: `New Zealand islands: USD ${E.nzIslandUsd} or USD ${E.nzIslandPerKgUsd}/kg, whichever is higher. Japan islands (Okinawa, Hokkaido, Miyazaki): USD ${E.japanIslandDocUsd} per document or USD ${E.japanIslandBoxUsd} per box. Payment later than ${E.latePaymentAfterDays} days raises the rate by ${E.latePaymentIncreasePct}%.` },
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
        description="Express and Economy international shipping rates from Nepal. DHL Express across 7 zones up to 300 kg, or the Economy network across 22 routes to Europe, the Americas, Asia and Oceania."
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
