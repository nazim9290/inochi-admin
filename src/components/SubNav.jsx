/**
 * EN: Secondary horizontal tab strip — shows the sub-routes inside the
 *     currently active main section. Hidden when the section has no
 *     sub-routes (e.g., the dashboard tab).
 * BN: গৌণ horizontal tab strip — বর্তমান active main section-এর sub-route
 *     দেখায়। যদি section-এ কোনো sub-route না থাকে (যেমন dashboard tab),
 *     তাহলে এই strip hidden থাকে।
 */

import { Link, useLocation } from 'react-router-dom';
import { findActiveSection } from '../lib/navConfig';
import { useInbox } from '../context/InboxContext';

export default function SubNav() {
  const location = useLocation();
  const active = findActiveSection(location.pathname);
  const { counts } = useInbox();

  // EN: Dashboard / sections without subroutes show no secondary nav.
  // BN: Dashboard / sub-route-হীন section-এ secondary nav দেখায় না।
  if (!active.routes || active.routes.length === 0) return null;

  return (
    <nav className="sticky top-14 z-20 border-b border-brand-tealLight/40 bg-white/95 backdrop-blur md:top-16">
      <div className="flex items-center gap-1 overflow-x-auto px-4 py-2 md:px-6">
        {active.routes.map((route) => {
          const isActive = location.pathname === route.path;
          // EN: Look up the count if the route advertises a badgeKey; the lookup
          //     stays 0 (and therefore hidden) when InboxContext doesn't have
          //     the key, so non-inbox sections never accidentally show a badge.
          // BN: route-এর badgeKey থাকলে count lookup; InboxContext-এ key না
          //     থাকলে 0 (ও hidden) থাকে — non-inbox section-এ ভুল করে badge
          //     দেখাবে না।
          const badge = route.badgeKey ? counts[route.badgeKey] || 0 : 0;
          return <SubTab key={route.path} route={route} isActive={isActive} badge={badge} />;
        })}
      </div>
    </nav>
  );
}

// EN: A single sub-tab pill. Active gets filled brand-teal background + white text.
//     When `badge` > 0 a small red count chip sits to the right of the label.
// BN: একটা sub-tab pill। Active হলে filled brand-teal background + white text।
//     `badge` > 0 হলে label-এর ডানে ছোট লাল count chip দেখায়।
function SubTab({ route, isActive, badge }) {
  const base =
    'inline-flex flex-shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors no-underline whitespace-nowrap';
  const activeCls = 'bg-brand-teal text-white shadow-sm';
  const inactiveCls = 'text-brand-slate hover:bg-brand-tealLight/30 hover:text-brand-navy';
  return (
    <Link to={route.path} className={`${base} ${isActive ? activeCls : inactiveCls}`}>
      <span>{route.label}</span>
      {badge > 0 && (
        <span
          className={`inline-flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[10px] font-bold ${
            isActive ? 'bg-white text-brand-teal' : 'bg-red-500 text-white'
          }`}
        >
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </Link>
  );
}
