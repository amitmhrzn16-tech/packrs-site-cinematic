import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone } from 'lucide-react';
import { site } from '../../lib/site.js';

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-white/10 bg-white/[0.025]">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-packrs-orange to-packrs-ember font-display text-base font-black text-packrs-navy">
              P
            </span>
            <span className="font-display text-lg font-bold">{site.name}</span>
          </div>
          <p className="mt-4 max-w-sm text-sm text-white/60">{site.description}</p>
          <div className="mt-6 space-y-2 text-sm text-white/60">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-packrs-orange" />
              <a href={`tel:${site.phone}`} className="hover:text-white">{site.phoneDisplay}</a>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-packrs-orange" />
              <a href={`mailto:${site.email}`} className="hover:text-white">{site.email}</a>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-packrs-orange" />
              <span>{site.address.locality}, {site.address.region}, Nepal</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold">Services</h3>
          <ul className="mt-4 space-y-2 text-sm text-white/60">
            {site.services.map((s) => (
              <li key={s.slug}>
                <Link to={`/services/${s.slug}`} className="hover:text-white">{s.name}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold">Company</h3>
          <ul className="mt-4 space-y-2 text-sm text-white/60">
            <li><Link to="/about" className="hover:text-white">About</Link></li>
            <li><Link to="/coverage" className="hover:text-white">Coverage Area</Link></li>
            <li><Link to="/book" className="hover:text-white">Book Pickup</Link></li>
            <li><Link to="/track" className="hover:text-white">Track Shipment</Link></li>
            <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-2 px-4 py-6 text-xs text-white/50 sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} {site.name}. All rights reserved.</p>
          <p>Kathmandu · Lalitpur · Bhaktapur</p>
        </div>
      </div>
    </footer>
  );
}
