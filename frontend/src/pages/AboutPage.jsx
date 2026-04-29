import { Link } from 'react-router-dom';
import PageHeader from '../components/site/PageHeader.jsx';
import DynamicSeo from '../components/site/DynamicSeo.jsx';
import { useSiteContent } from '../lib/useSiteContent.js';

export default function AboutPage() {
  // Every key here is editable from /admin/content (page: about). The hardcoded
  // values are the fallback when no override exists.
  const t = useSiteContent('about', {
    eyebrow: 'About',
    title: 'Logistics built for Nepal, by Nepal.',
    description:
      "Packrs Courier was founded on a simple idea: same-day delivery inside the Kathmandu Valley shouldn't be a luxury. It should be the default.",
    body_paragraph_1:
      "We started Packrs because Nepali e-commerce sellers were spending more time worrying about delivery than growing their business. Orders lost in transit. COD amounts delayed for weeks. Customers calling to ask where their parcel was. Riders who couldn't find the right gali.",
    body_paragraph_2:
      "So we built a courier service designed around the valley's actual geography, its actual payment habits, and its actual sellers. Same-day as a standard, not a premium. COD remittance on a fixed schedule you can plan around. Riders who know every back road from Kalanki to Suryabinayak.",
    body_paragraph_3:
      "Today Packrs Courier delivers across Kathmandu, Lalitpur, Bhaktapur, Kirtipur, and Madhyapur Thimi — and we're expanding. Whether you're a one-person Instagram boutique or a full-scale Daraz reseller, we'll treat every parcel like it matters. Because to your customer, it does.",
    pillar_1_title: 'Valley',
    pillar_1_body:  'Built exclusively for Kathmandu Valley logistics',
    pillar_2_title: 'Same-day',
    pillar_2_body:  'Our default speed, not a premium add-on',
    pillar_3_title: 'Transparent',
    pillar_3_body:  'Flat per-parcel pricing, no hidden fees',
    cta_label:      'Get in touch',
  });

  return (
    <>
      <DynamicSeo
        page="about"
        title="About Packrs Courier"
        description={t.description}
      />
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
