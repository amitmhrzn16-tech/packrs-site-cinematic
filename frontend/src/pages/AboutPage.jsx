import { Link } from 'react-router-dom';
import PageHeader from '../components/site/PageHeader.jsx';
import DynamicSeo from '../components/site/DynamicSeo.jsx';
import { useSiteContent } from '../lib/useSiteContent.js';
import { defaultsFor } from '../lib/contentSchema.js';

export default function AboutPage() {
  const t = useSiteContent('about', defaultsFor('about'));
  return (
    <>
      <DynamicSeo page="about" title="About Packrs Courier" description={t.description} />
      <PageHeader eyebrow={t.eyebrow} title={t.title} description={t.description} />
      <section className="pb-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-6 text-base leading-relaxed text-white/70">
            <p>{t.body_paragraph_1}</p>
            <p>{t.body_paragraph_2}</p>
            <p>{t.body_paragraph_3}</p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
                <p className="font-display text-xl font-bold text-packrs-teal">{t[`pillar_${i}_title`]}</p>
                <p className="mt-2 text-sm text-white/60">{t[`pillar_${i}_body`]}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link to="/contact" className="btn-glow">{t.cta_label}</Link>
          </div>
        </div>
      </section>
    </>
  );
}
