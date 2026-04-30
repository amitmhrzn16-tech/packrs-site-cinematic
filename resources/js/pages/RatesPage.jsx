import PageHeader from '../components/site/PageHeader.jsx';
import RateCalculator from '../components/site/RateCalculator.jsx';
import DynamicSeo from '../components/site/DynamicSeo.jsx';
import { useSiteContent } from '../lib/useSiteContent.js';
import { defaultsFor } from '../lib/contentSchema.js';

export default function RatesPage() {
  const t = useSiteContent('rates', defaultsFor('rates'));
  return (
    <>
      <DynamicSeo page="rates" title="Delivery Rate Calculator — Packrs Courier" description={t.description} />
      <PageHeader eyebrow={t.eyebrow} title={t.title} description={t.description} />
      <section className="pb-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <RateCalculator />

          <div className="mt-10 rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:p-8">
            <h3 className="font-display text-lg font-bold">{t.custom_heading}</h3>
            <p className="mt-2 text-sm text-white/60">{t.custom_body}</p>
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
