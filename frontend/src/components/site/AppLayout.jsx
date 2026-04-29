import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Nav from './Nav.jsx';
import Footer from './Footer.jsx';

export default function AppLayout({ children }) {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return (
    <>
      <Nav />
      <main id="main" className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
