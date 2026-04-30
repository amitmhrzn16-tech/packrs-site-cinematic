import { Link, useParams, Navigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { site } from '../lib/site.js';
import PageHeader from '../components/site/PageHeader.jsx';
import DynamicSeo from '../components/site/DynamicSeo.jsx';

const benefits = [
  'Same-day delivery across Kathmandu Valley',
  'Door-to-door pickup from any address',
  'Trained riders with careful handling',
  'Transparent, per-parcel pricing',
  'Live status updates by phone',
  'Seven days a week, including holidays',
];

export default function ServiceDetailPage() {
  const { slug } = useParams();
  const service = site.services.find((s) => s.slug === slug);
  if (!service) return <Navigate to="/services" replace />;

  return (
    <>
      <DynamicSeo page={`services/${service.slug}`} title={`${service.name} — Packrs Courier`} description={service.description} />
      <PageHeader eyebrow="Service" title={service.name} description={service.description} />
      <section className="pb-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 sm:p-12">
            <h2 className="font-display text-2xl font-bold">What's included</h2>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {benefits.map((b) => (
                <li key={b} className="flex items-start gap-3 text-sm">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-packrs-orange" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link to="/book" className="inline-flex items-center gap-2 btn-glow">
                Book this service
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a href={`tel:${site.phone}`} className="btn-ghost">Call {site.phoneDisplay}</a>
            </div>
          </div>

          <div className="mt-12">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-white/50">Other services</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {site.services.filter((s) => s.slug !== service.slug).map((s) => (
                <Link
                  key={s.slug}
                  to={`/services/${s.slug}`}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm hover:border-packrs-orange/50"
                >
                  <span>{s.name}</span>
                  <ArrowRight className="h-4 w-4 text-packrs-orange" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
