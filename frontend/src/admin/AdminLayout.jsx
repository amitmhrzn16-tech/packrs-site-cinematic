import { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import AdminSidebar from './AdminSidebar.jsx';
import { adminApi, adminToken } from './api.js';

export default function AdminLayout() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [badges, setBadges] = useState({});
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    if (!adminToken.get()) {
      navigate('/admin/login', { replace: true });
      return;
    }
    adminApi.me()
      .then((d) => setUser(d.user))
      .catch(() => navigate('/admin/login', { replace: true }))
      .finally(() => setLoading(false));
  }, [navigate]);

  // Live "new bookings" badge — refreshed on every route change inside admin.
  useEffect(() => {
    if (!user) return;
    adminApi.bookings.list('status=new&per_page=1')
      .then((d) => setBadges((b) => ({ ...b, new_bookings: d.data?.total ?? 0 })))
      .catch(() => {});
  }, [user, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 grid place-items-center text-slate-400 text-sm">
        Loading admin…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex">
      <AdminSidebar user={user} badges={badges} />
      <main className="flex-1 min-w-0">
        <Outlet context={{ user, badges }} />
      </main>
    </div>
  );
}
