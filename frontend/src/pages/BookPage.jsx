import { Link } from 'react-router-dom';
import PageHeader from '../components/site/PageHeader.jsx';
import BookForm from '../components/site/BookForm.jsx';
import DynamicSeo from '../components/site/DynamicSeo.jsx';
import { useSiteContent } from '../lib/useSiteContent.js';
import { defaultsFor } from '../lib/contentSchema.js';

export default function BookPage() {
  const t = useSiteContent('book', defaultsFor('book'));
  return (
    <>
      <DynamicSeo page="book" title="Book a Pickup — Packrs Courier" description={t.description} />
      <PageHeader eyebrow={t.eyebrow} title={t.title} description={t.description} />
      <section className="pb-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.025] px-5 py-4 text-sm">
            <span className="text-white/70">Looking for a price estimate?</span>
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
