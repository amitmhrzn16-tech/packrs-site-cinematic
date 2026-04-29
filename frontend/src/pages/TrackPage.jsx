import PageHeader from '../components/site/PageHeader.jsx';
import TrackForm from '../components/site/TrackForm.jsx';
import DynamicSeo from '../components/site/DynamicSeo.jsx';
import { useSiteContent } from '../lib/useSiteContent.js';
import { defaultsFor } from '../lib/contentSchema.js';

export default function TrackPage() {
  const t = useSiteContent('track', defaultsFor('track'));
  return (
    <>
      <DynamicSeo page="track" title="Track Your Shipment — Packrs Courier" description={t.description} />
      <PageHeader eyebrow={t.eyebrow} title={t.title} description={t.description} />
      <section className="pb-24">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <TrackForm />
        </div>
      </section>
    </>
  );
}
