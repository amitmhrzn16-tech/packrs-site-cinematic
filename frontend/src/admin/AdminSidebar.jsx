import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Inbox, FileText, Tags, Search, MessageSquare, LogOut, Globe, Users,
} from 'lucide-react';
import clsx from 'clsx';
import { adminApi, adminToken } from './api.js';

const ITEMS = [
  { to: '/admin',          end: true,  icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/bookings', icon: Inbox,    label: 'Pickups',  badgeKey: 'new_bookings' },
  { to: '/admin/content',  icon: FileText, label: 'Pages & Modules' },
  { to: '/admin/rates',    icon: Tags,     label: 'Rates' },
  { to: '/admin/seo',      icon: Search,   label: 'SEO' },
  { to: '/admin/slack',    icon: MessageSquare, label: 'Slack' },
  { to: '/admin/users',    icon: Users,    label: 'Users' },
];

export default function AdminSidebar({ user, badges = {} }) {
  const navigate = useNavigate();

  async function logout() {
    try { await adminApi.logout(); } catch {}
    adminToken.clear();
    navigate('/admin/login');
  }

  return (
    <aside className="hidden md:flex w-60 flex-col border-r border-slate-800 bg-slate-950/60 backdrop-blur-md">
      <Link to="/admin" className="flex items-center gap-2 px-5 py-4 border-b border-slate-800">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-packrs-teal to-packrs-yellow font-display font-black text-slate-950">
          P
        </span>
        <div className="leading-tight">
          <div className="font-display text-sm font-bold tracking-wide">Packrs Admin</div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Dashboard</div>
        </div>
      </Link>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {ITEMS.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            end={it.end}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition',
                isActive
                  ? 'bg-packrs-teal/10 text-packrs-teal ring-1 ring-inset ring-packrs-teal/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              )
            }
          >
            <it.icon className="h-4 w-4" />
            <span className="flex-1">{it.label}</span>
            {it.badgeKey && badges[it.badgeKey] > 0 && (
              <span className="rounded-full bg-packrs-yellow text-slate-950 text-[10px] font-bold px-1.5 py-0.5">
                {badges[it.badgeKey]}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 pt-3 pb-4 border-t border-slate-800">
        <Link
          to="/"
          target="_blank"
          className="mb-2 flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-400 hover:bg-slate-900 hover:text-white"
        >
          <Globe className="h-3.5 w-3.5" />
          View public site
        </Link>
        <div className="rounded-lg bg-slate-900/60 px-3 py-2 ring-1 ring-slate-800">
          <div className="text-xs font-medium text-white truncate">{user?.name || 'Admin'}</div>
          <div className="text-[10px] text-slate-500 truncate">{user?.email}</div>
          <button
            onClick={logout}
            className="mt-2 inline-flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-packrs-yellow"
          >
            <LogOut className="h-3 w-3" /> Sign out
          </button>
        </div>
      </div>
    </aside>
  );
}
