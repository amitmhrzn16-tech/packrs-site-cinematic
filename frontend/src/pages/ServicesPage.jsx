import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { site } from '../lib/site.js';
import PageHeader from '../components/site/PageHeader.jsx';
import DynamicSeo from '../components/site/DynamicSeo.jsx';
import { useSiteContent } from '../lib/useSiteContent.js';
import { defaultsFor } from '../lib/contentSchema.js';

export default function ServicesPage() {
  const t = useSiteContent('services', defaultsFor('services'));
  return (
    <>
      <DynamicSeo page="services" title="Courier Services in Kathmandu Valley" description={t.description} />
      <PageHeader eyebrow={t.eyebrow} title={t.title} description={t.description} />
      <section className="pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {site.services.map((s) => (
              <Link
                key={s.slug}
                to={`/services/${s.slug}`}
                className="group flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition hover:border-packrs-orange/50 hover:bg-white/[0.08]"
              >
                <h2 className="font-display text-xl font-semibold">{s.name}</h2>
                <p className="mt-2 flex-1 text-sm text-white/60">{s.short}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm text-packrs-orange">
                  Learn more
                  <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
