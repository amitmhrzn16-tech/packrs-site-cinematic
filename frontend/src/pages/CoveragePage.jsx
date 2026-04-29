import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { site } from '../lib/site.js';
import PageHeader from '../components/site/PageHeader.jsx';
import DynamicSeo from '../components/site/DynamicSeo.jsx';

const neighborhoods = {
  Kathmandu: [
    'Hadigaun', 'Thamel', 'New Road', 'Baneshwor', 'Koteshwor',
    'Maharajgunj', 'Basundhara', 'Chabahil', 'Boudha', 'Kalanki',
    'Kalimati', 'Sinamangal', 'Gongabu',
  ],
  Lalitpur: [
    'Patan', 'Jawalakhel', 'Pulchowk', 'Kupondole', 'Satdobato',
    'Lagankhel', 'Ekantakuna', 'Sanepa', 'Imadol',
  ],
  Bhaktapur: [
    'Bhaktapur Durbar Square', 'Suryabinayak', 'Kaushaltar',
    'Sallaghari', 'Jagati', 'Balkot',
  ],
  Kirtipur: ['Kirtipur Old Town', 'Naya Bazar', 'Panga'],
  'Madhyapur Thimi': ['Thimi', 'Bode', 'Nagadesh'],
};

export default function CoveragePage() {
  return (
    <>
      <DynamicSeo page="coverage" title="Delivery Coverage Area — Kathmandu Valley" description="Packrs Courier covers Kathmandu, Lalitpur, Bhaktapur, Kirtipur, and Madhyapur Thimi." />
      <PageHeader
        eyebrow="Coverage Area"
        title="We deliver across the entire Kathmandu Valley."
        description="Five municipalities, dozens of neighborhoods, one call. If you're inside the valley, we can almost certainly reach you today."
      />
      <section className="pb-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(neighborhoods).map(([city, hoods]) => (
              <div key={city} className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-packrs-orange" />
                  <h2 className="font-display text-lg font-bold">{city}</h2>
                </div>
                <ul className="mt-4 flex flex-wrap gap-1.5">
                  {hoods.map((h) => (
                    <li key={h} className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs text-white/60">
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center sm:p-12">
            <h3 className="font-display text-2xl font-bold">Don't see your area?</h3>
            <p className="mx-auto mt-3 max-w-xl text-sm text-white/60">
              Coverage is constantly expanding. Call us and we'll tell you right away whether we can pick up from your address.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <a href={`tel:${site.phone}`} className="btn-glow">Call {site.phoneDisplay}</a>
              <Link to="/contact" className="btn-ghost">Send a message</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
