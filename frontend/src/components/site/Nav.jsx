import { useEffect, useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Menu, X, Phone } from 'lucide-react';
import clsx from 'clsx';
import { site } from '../../lib/site.js';

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <header
      className={clsx(
        'fixed inset-x-0 top-0 z-40 transition-all duration-300',
        scrolled
          ? 'backdrop-blur-xl bg-packrs-ink/70 border-b border-white/10'
          : 'bg-transparent'
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="group flex items-center" aria-label="Packrs Courier — Home">
          <img
            src="/packrs-logo.png"
            alt="Packrs Courier"
            className="h-9 w-auto sm:h-10 transition group-hover:opacity-90"
            width="180" height="80"
          />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {site.nav.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.href === '/'}
              className={({ isActive }) =>
                clsx(
                  'relative rounded-full px-4 py-2 text-sm transition-colors',
                  isActive ? 'text-packrs-orange' : 'text-white/80 hover:text-white'
                )
              }
            >
              {({ isActive }) => (
                <>
                  {item.label}
                  {isActive && (
                    <span className="absolute inset-x-4 -bottom-px h-px bg-packrs-orange" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={`tel:${site.phone}`}
            className="hidden items-center gap-2 rounded-full border border-white/15 px-3 py-1.5 text-sm text-white/90 transition hover:border-packrs-orange hover:text-packrs-orange sm:inline-flex"
          >
            <Phone className="h-3.5 w-3.5" />
            {site.phoneDisplay}
          </a>
          <Link to="/book" className="hidden btn-glow text-sm md:inline-flex">
            Book Pickup
          </Link>
          <button
            type="button"
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 md:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-packrs-ink/95 backdrop-blur-xl md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4 sm:px-6">
            {site.nav.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                end={item.href === '/'}
                className={({ isActive }) =>
                  clsx(
                    'rounded-lg px-3 py-2.5 text-sm',
                    isActive
                      ? 'bg-white/[0.05] text-packrs-orange'
                      : 'text-white/90 hover:bg-white/[0.05]'
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
            <Link to="/book" className="mt-2 btn-glow text-center">
              Book Pickup
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
