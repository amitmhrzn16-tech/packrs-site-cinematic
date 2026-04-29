import { Link } from 'react-router-dom';
import PageHeader from '../components/site/PageHeader.jsx';
import BookForm from '../components/site/BookForm.jsx';
import DynamicSeo from '../components/site/DynamicSeo.jsx';

export default function BookPage() {
  return (
    <>
      <DynamicSeo page="book" title="Book a Pickup — Packrs Courier" description="Schedule a same-day pickup anywhere in the Kathmandu Valley." />
      <PageHeader
        eyebrow="Book a pickup"
        title="Tell us about your business."
        description="Set up a Packrs pickup partnership — we'll match you with the right pricing, COD schedule, and rider zone. Need a quick price first? Try the rate calculator."
      />
      <section className="pb-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.025] px-5 py-4 text-sm">
            <span className="text-white/70">
              Looking for a price estimate?
            </span>
            <Link to="/rates" className="text-packrs-teal hover:underline">
              Open the rate calculator →
            </Link>
          </div>

          <BookForm />
        </div>
      </section>
    </>
  );
}
