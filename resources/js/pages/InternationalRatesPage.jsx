import PageHeader from '../components/site/PageHeader.jsx';
import InternationalRateCalculator from '../components/site/InternationalRateCalculator.jsx';
import DynamicSeo from '../components/site/DynamicSeo.jsx';
import { DELIVERY_TERMS } from '../lib/internationalRates.js';

const T = DELIVERY_TERMS;

// Delivery terms & surcharges, surfaced from internationalRates.js.
const TERMS = [
  { highlight: true, title: 'Free packing & customs in Nepal', desc: 'No charge for packing materials or customs clearance in Nepal — included with every shipment.' },
  { title: `Delivery time: ${T.deliveryTime}`, desc: 'Standard delivery is 3–5 working days. Check dct.dhl.com for the accurate day.', link: 'https://www.dct.dhl.com' },
  { title: 'Remote area fee', desc: `NPR ${T.remoteAreaFeeNpr.toLocaleString('en-IN')} extra for delivery to out-of-city areas.` },
  { title: 'Wooden box / tube packing', desc: `NPR ${T.woodenBoxOrTubeNpr.toLocaleString('en-IN')} extra if your shipment requires a wooden box or tube.` },
  { title: 'Oversized packets (≥ 100 cm)', desc: `NPR ${T.oversizePacket100cmNpr.toLocaleString('en-IN')} extra for any individual packet measuring 100 cm or more on any side.` },
  { title: 'Heavy packets 24.5–79.5 kg', desc: `NPR ${T.heavy24_5to79_5Npr.toLocaleString('en-IN')} extra per packet weighing between 24.5 kg and 79.5 kg.` },
  { title: 'Heavy packets ≥ 79.5 kg', desc: `NPR ${T.heavyAbove79_5Npr.toLocaleString('en-IN')} extra per packet weighing 79.5 kg or more.` },
  { title: 'Address change & war zones', desc: `Address change after departure: NPR ${T.addressChangeNpr.toLocaleString('en-IN')}. War-affected regions: ${T.warZoneNote.toLowerCase()}` },
];

export default function InternationalRatesPage() {
  return (
    <>
      <DynamicSeo
        page="international-rates"
        title="International Shipping Rates — Packrs Courier"
        description="DHL Express international shipping rates from Nepal across 7 zones. Documents and parcels up to 300 kg, with free packing and customs clearance in Nepal."
      />
      <PageHeader
        eyebrow="International Shipping · DHL Express"
        title="Know your rate before you ship"
        description="Pick your destination, weight, and service — we'll tell you exactly what it costs. No hidden customs fees in Nepal, no packing fees, no surprises."
      />
      <section className="pb-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <InternationalRateCalculator />

          <div className="mt-12">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-display text-2xl font-bold">Delivery terms &amp; surcharges</h2>
              <span className="text-[11px] uppercase tracking-[0.15em] text-white/45">8 things to know</span>
            </div>
            <div className="mt-6 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2">
              {TERMS.map((term, i) => (
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
              Oversized, fragile, or over 300 kg — call us for a tailored quote before you book.
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
