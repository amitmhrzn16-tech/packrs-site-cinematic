import { Mail, MapPin, Phone, Clock } from 'lucide-react';
import { site } from '../lib/site.js';
import PageHeader from '../components/site/PageHeader.jsx';
import DynamicSeo from '../components/site/DynamicSeo.jsx';

export default function ContactPage() {
  return (
    <>
      <DynamicSeo page="contact" title="Contact Packrs Courier" description="Reach Packrs Courier — phone, email, address, and business enquiries." />
      <PageHeader
        eyebrow="Contact"
        title="Talk to a human."
        description="We answer calls and messages seven days a week. For urgent pickups, calling is fastest."
      />
      <section className="pb-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <Card icon={Phone} title="Call us" value={site.phoneDisplay} href={`tel:${site.phone}`} note="Fastest for urgent pickups" />
            <Card icon={Mail}  title="Email us" value={site.email} href={`mailto:${site.email}`} note="We reply within a few hours" />
            <Card icon={MapPin} title="Service area" value="Kathmandu Valley, Nepal" note="Kathmandu · Lalitpur · Bhaktapur" />
            <Card icon={Clock}  title="Hours" value="8:00 AM – 8:00 PM" note="Seven days a week" />
          </div>

          <div className="mt-10 rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center sm:p-12">
            <h3 className="font-display text-2xl font-bold">Have a business or bulk enquiry?</h3>
            <p className="mx-auto mt-3 max-w-xl text-sm text-white/60">
              E-commerce sellers, bulk senders, and recurring-delivery clients — email us for a tailored plan and volume-friendly pricing.
            </p>
            <a
              href={`mailto:${site.email}?subject=Business%20enquiry`}
              className="mt-6 inline-flex btn-glow"
            >
              Email {site.email}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

function Card({ icon: Icon, title, value, href, note }) {
  const inner = (
    <>
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-packrs-orange/30 to-packrs-ember/20 ring-1 ring-inset ring-white/10">
        <Icon className="h-5 w-5 text-packrs-orange" />
      </div>
      <p className="mt-4 text-xs uppercase tracking-widest text-white/50">{title}</p>
      <p className="mt-1 font-display text-lg font-semibold">{value}</p>
      {note && <p className="mt-1 text-xs text-white/50">{note}</p>}
    </>
  );
  const cls = 'block rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition hover:border-packrs-orange/50';
  return href ? <a href={href} className={cls}>{inner}</a> : <div className={cls}>{inner}</div>;
}
