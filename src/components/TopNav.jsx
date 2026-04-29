/**
 * EN: Main top navigation bar — logo + brand name on the left, six section
 *     tabs in the centre, user info + logout on the right. On mobile the
 *     tabs collapse into a hamburger button that toggles a drawer.
 * BN: প্রধান top nav bar — বাঁয়ে logo + brand name, মাঝে ছয়টা section tab,
 *     ডানে user info + logout। Mobile-এ tab গুলো hamburger button-এ collapse
 *     হয়, যেটা একটা drawer toggle করে।
 */

import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { NAV_SECTIONS, findActiveSection } from '../lib/navConfig';
import axiosInterceptor from '../axios/axiosInterceptor';
import MobileMenu from './MobileMenu';

export default function TopNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, state } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const api = axiosInterceptor();

  const active = findActiveSection(location.pathname);

  // EN: Poll the inbox unread count so admins notice fresh items even while
  //     sitting on a different tab. Sums pending contact requests + new
  //     applications. Both endpoints fire in parallel; failures fall through
  //     silently so a transient backend hiccup doesn't reset the badge to 0.
  // BN: Inbox-এর unread count poll করি — admin অন্য tab-এ থাকলেও নতুন item-এর
  //     খবর পাবে। Pending contact + new application sum করে। দুই endpoint
  //     parallel; failure silently ignore — transient hiccup-এ badge 0 হয় না।
  useEffect(() => {
    let alive = true;
    const refresh = async () => {
      try {
        const [contacts, apps, reviews] = await Promise.all([
          api.get('/all-contact-request').catch(() => ({ data: { contacts: [] } })),
          api.get('/applications?status=new').catch(() => ({ data: { applications: [] } })),
          api.get('/reviews?status=pending').catch(() => ({ data: { reviews: [] } })),
        ]);
        if (!alive) return;
        const pendingContacts = (contacts.data?.contacts || []).filter((c) => (c.status || 'Pending') === 'Pending').length;
        const newApps = (apps.data?.applications || []).length;
        const pendingReviews = (reviews.data?.reviews || []).length;
        setPendingCount(pendingContacts + newApps + pendingReviews);
      } catch {
        // EN: Silently ignore — badge just stays at last known value.
        // BN: Silently ignore — badge সর্বশেষ value-তেই থাকবে।
      }
    };
    refresh();
    const interval = setInterval(refresh, 60_000);
    const onFocus = () => refresh();
    window.addEventListener('focus', onFocus);
    return () => {
      alive = false;
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // EN: Map section.key → badge count. Currently only inbox has a badge.
  // BN: section.key → badge count map। এখন শুধু inbox-এ badge।
  const badgeFor = (key) => (key === 'inbox' && pendingCount > 0 ? pendingCount : null);

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-brand-tealLight/40 bg-white shadow-sm">
        <div className="flex h-14 items-center justify-between gap-4 px-4 md:h-16 md:px-6">
          <BrandLogo />

          {/* EN: Desktop tab strip — hidden under md breakpoint. */}
          {/* BN: Desktop tab strip — md breakpoint-এর নিচে hidden। */}
          <nav className="hidden flex-1 items-center justify-center gap-1 md:flex">
            {NAV_SECTIONS.map((section) => (
              <NavTab
                key={section.key}
                section={section}
                isActive={section.key === active.key}
                badge={badgeFor(section.key)}
              />
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <UserBadge name={state?.user?.fullname || state?.user?.email} />
            <button
              type="button"
              onClick={handleLogout}
              className="hidden rounded-md border border-brand-tealLight/60 px-3 py-1.5 text-xs font-semibold text-brand-slate transition-colors hover:bg-brand-tealLight/20 hover:text-brand-navy md:inline-flex"
            >
              Logout
            </button>
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-brand-navy hover:bg-brand-tealLight/20 md:hidden"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <MobileMenu
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        activeKey={active.key}
        onLogout={handleLogout}
        badges={{ inbox: pendingCount }}
      />
    </>
  );
}

// EN: Logo + brand text. Logo links to dashboard.
// BN: Logo + brand text। Logo দিয়ে dashboard-এ যায়।
function BrandLogo() {
  return (
    <Link to="/" className="flex flex-shrink-0 items-center gap-2 no-underline">
      <img src="/Inochi_logo.png" alt="Inochi" className="h-9 w-9 object-contain md:h-10 md:w-10" />
      <div className="hidden flex-col leading-tight sm:flex">
        <span className="text-sm font-bold text-brand-navy">Inochi Admin</span>
        <span className="text-[10px] text-brand-slate">Dhaka · Saitama</span>
      </div>
    </Link>
  );
}

// EN: Single top tab with icon + Bangla label. Active state gets brand-teal
//     underline + bg. Optional `badge` shows a pulsing red dot with count
//     (used for unread inbox enquiries).
// BN: একটা top tab — icon + Bangla label। Active হলে brand-teal underline + bg।
//     Optional `badge` — pulsing red dot with count (unread inbox-এর জন্য)।
function NavTab({ section, isActive, badge }) {
  const base =
    'relative inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-semibold transition-colors no-underline';
  const activeCls = 'bg-brand-teal/15 text-brand-navy';
  const inactiveCls = 'text-brand-slate hover:bg-brand-tealLight/20 hover:text-brand-navy';
  return (
    <Link to={section.home} className={`${base} ${isActive ? activeCls : inactiveCls}`}>
      <span className={isActive ? 'text-brand-teal' : 'text-brand-slate/60'}>{section.icon}</span>
      <span>{section.label}</span>
      {badge != null && badge > 0 && (
        <span className="ml-0.5 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white shadow ring-2 ring-white">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </Link>
  );
}

// EN: Compact "user" chip — shows initial in a coloured circle + name on wider screens.
// BN: Compact "user" chip — coloured circle-এ initial + বড় screen-এ নাম।
function UserBadge({ name }) {
  const initial = (name || 'A').trim()[0]?.toUpperCase() || 'A';
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-navy text-xs font-bold text-white">
        {initial}
      </div>
      {name && <span className="hidden text-xs font-medium text-brand-slate lg:inline">{name}</span>}
    </div>
  );
}
