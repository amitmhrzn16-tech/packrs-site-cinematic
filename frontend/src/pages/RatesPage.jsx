import PageHeader from '../components/site/PageHeader.jsx';
import RateCalculator from '../components/site/RateCalculator.jsx';
import DynamicSeo from '../components/site/DynamicSeo.jsx';

export default function RatesPage() {
  return (
    <>
      <DynamicSeo page="rates" title="Delivery Rate Calculator — Packrs Courier" description="Calculate Packrs Courier delivery rates for any destination in Nepal — same calculator our riders use." />
      <PageHeader
        eyebrow="Rates"
        title="What will it cost?"
        description="Pick a service type and weight to see your delivery price instantly. The same formula our CRM and riders use — no hidden fees."
      />
      <section className="pb-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <RateCalculator />

          <div className="mt-10 rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:p-8">
            <h3 className="font-display text-lg font-bold">Need a custom rate?</h3>
            <p className="mt-2 text-sm text-white/60">
              Bulk volumes, recurring deliveries, or destinations not listed here — call us and we'll
              quote you a tailored rate within minutes.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <a href="tel:+977-9801367205" className="btn-glow">Call +977 9801 367 205</a>
              <a href="mailto:packrs24@gmail.com?subject=Custom%20rate%20enquiry" className="btn-ghost">
                Email for a quote
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
