import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { lazy, Suspense, useEffect } from 'react';
import Nav from './components/site/Nav.jsx';
import Footer from './components/site/Footer.jsx';
import HomePage from './pages/HomePage.jsx';
import ServicesPage from './pages/ServicesPage.jsx';
import ServiceDetailPage from './pages/ServiceDetailPage.jsx';
import CoveragePage from './pages/CoveragePage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import BookPage from './pages/BookPage.jsx';
import RatesPage from './pages/RatesPage.jsx';
import TrackPage from './pages/TrackPage.jsx';
import ContactPage from './pages/ContactPage.jsx';

// Admin bundle is lazy — never paid for by public-site visitors.
const AdminLayout = lazy(() => import('./admin/AdminLayout.jsx'));
const AdminLogin = lazy(() => import('./admin/AdminLogin.jsx'));
const AdminDashboard = lazy(() => import('./admin/AdminDashboard.jsx'));
const AdminBookings = lazy(() => import('./admin/AdminBookings.jsx'));
const AdminRates = lazy(() => import('./admin/AdminRates.jsx'));
const AdminSlack = lazy(() => import('./admin/AdminSlack.jsx'));
const AdminContent = lazy(() => import('./admin/AdminContent.jsx'));
const AdminSeo = lazy(() => import('./admin/AdminSeo.jsx'));
const AdminUsers = lazy(() => import('./admin/AdminUsers.jsx'));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

// Public site has Nav + Footer; the home route owns the full canvas; admin owns its own layout.
function PublicLayout({ children }) {
  const { pathname } = useLocation();
  const isHome = pathname === '/';
  return (
    <>
      <Nav />
      <main id="main" className={isHome ? '' : 'flex-1 pt-0'}>{children}</main>
      {!isHome && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Admin tree — own layout, no public Nav/Footer */}
        <Route path="/admin/login" element={<Suspense fallback={null}><AdminLogin /></Suspense>} />
        <Route path="/admin" element={<Suspense fallback={null}><AdminLayout /></Suspense>}>
          <Route index element={<Suspense fallback={null}><AdminDashboard /></Suspense>} />
          <Route path="bookings" element={<Suspense fallback={null}><AdminBookings /></Suspense>} />
          <Route path="rates" element={<Suspense fallback={null}><AdminRates /></Suspense>} />
          <Route path="slack" element={<Suspense fallback={null}><AdminSlack /></Suspense>} />
          <Route path="content" element={<Suspense fallback={null}><AdminContent /></Suspense>} />
          <Route path="seo" element={<Suspense fallback={null}><AdminSeo /></Suspense>} />
          <Route path="users" element={<Suspense fallback={null}><AdminUsers /></Suspense>} />
        </Route>

        {/* Public site */}
        <Route path="/*" element={
          <PublicLayout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/services/:slug" element={<ServiceDetailPage />} />
              <Route path="/coverage" element={<CoveragePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/book" element={<BookPage />} />
              <Route path="/rates" element={<RatesPage />} />
              <Route path="/track" element={<TrackPage />} />
              <Route path="/contact" element={<ContactPage />} />
            </Routes>
          </PublicLayout>
        } />
      </Routes>
    </BrowserRouter>
  );
}
