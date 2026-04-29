import PageHeader from '../components/site/PageHeader.jsx';
import TrackForm from '../components/site/TrackForm.jsx';
import DynamicSeo from '../components/site/DynamicSeo.jsx';

export default function TrackPage() {
  return (
    <>
      <DynamicSeo page="track" title="Track Your Shipment — Packrs Courier" description="Live tracking for Packrs Courier parcels across Nepal." />
      <PageHeader
        eyebrow="Track shipment"
        title="Where's my parcel?"
        description="Enter your tracking ID to see the latest status. Don't have an ID? Call us and we'll look it up."
      />
      <section className="pb-24">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <TrackForm />
        </div>
      </section>
    </>
  );
}
