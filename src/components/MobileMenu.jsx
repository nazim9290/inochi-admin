/**
 * EN: Mobile slide-out menu — same nav config as TopNav, but stacked vertically
 *     with each section expanded to show its sub-routes. Backdrop closes menu.
 * BN: Mobile slide-out menu — TopNav-এর একই nav config, কিন্তু vertically stacked
 *     এবং প্রতিটা section expanded — sub-route সহ। Backdrop click করলে menu close।
 */

import { Link, useLocation } from 'react-router-dom';
import { NAV_SECTIONS } from '../lib/navConfig';
import { useInbox } from '../context/InboxContext';

export default function MobileMenu({ open, onClose, activeKey, onLogout, badges = {} }) {
  const location = useLocation();
  const { counts } = useInbox();
  if (!open) return null;

  return (
    <>
      {/* EN: Dark backdrop — click to close. */}
      {/* BN: কালো backdrop — click করলে close হয়। */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-40 bg-brand-navy/60 backdrop-blur-sm md:hidden"
        aria-hidden="true"
      />

      {/* EN: Slide-in drawer from the right side. */}
      {/* BN: ডান দিক থেকে slide-in drawer। */}
      <aside className="fixed right-0 top-0 z-50 h-full w-80 max-w-[85vw] overflow-y-auto bg-white shadow-xl md:hidden">
        <div className="flex items-center justify-between border-b border-brand-tealLight/40 px-4 py-3">
          <span className="font-bold text-brand-navy">মেনু</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-brand-slate hover:bg-brand-tealLight/20"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <nav className="px-2 py-3">
          {NAV_SECTIONS.map((section) => (
            <SectionBlock
              key={section.key}
              section={section}
              isActive={section.key === activeKey}
              currentPath={location.pathname}
              onSelect={onClose}
              badge={badges[section.key]}
              subCounts={counts}
            />
          ))}
        </nav>

        <div className="border-t border-brand-tealLight/40 p-3">
          <button
            type="button"
            onClick={() => {
              onClose();
              onLogout();
            }}
            className="w-full rounded-md border border-brand-tealLight/60 py-2 text-sm font-semibold text-brand-slate hover:bg-brand-tealLight/20 hover:text-brand-navy"
          >
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}

// EN: One mobile section block — header + list of sub-routes (or just the home link
//     if the section has no sub-routes, like the dashboard).
// BN: একটা mobile section block — header + sub-route list (বা শুধু home link যদি
//     section-এ sub-route না থাকে, যেমন dashboard)।
function SectionBlock({ section, isActive, currentPath, onSelect, badge, subCounts = {} }) {
  return (
    <div className="mb-2">
      <Link
        to={section.home}
        onClick={onSelect}
        className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-bold no-underline ${
          isActive
            ? 'bg-brand-teal/15 text-brand-navy'
            : 'text-brand-slate hover:bg-brand-tealLight/15 hover:text-brand-navy'
        }`}
      >
        <span className={isActive ? 'text-brand-teal' : 'text-brand-slate/60'}>{section.icon}</span>
        <span className="flex-1">{section.label}</span>
        {badge != null && badge > 0 && (
          <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
            {badge > 99 ? '99+' : badge}
          </span>
        )}
      </Link>

      {isActive && section.routes.length > 0 && (
        <ul className="ml-7 mt-1 space-y-0.5 border-l border-brand-tealLight/40 pl-3">
          {section.routes.map((r) => {
            const sub = currentPath === r.path;
            const subBadge = r.badgeKey ? subCounts[r.badgeKey] || 0 : 0;
            return (
              <li key={r.path}>
                <Link
                  to={r.path}
                  onClick={onSelect}
                  className={`flex items-center justify-between gap-2 rounded px-3 py-1.5 text-xs font-semibold no-underline ${
                    sub
                      ? 'bg-brand-teal/10 text-brand-teal'
                      : 'text-brand-slate hover:bg-brand-tealLight/15 hover:text-brand-navy'
                  }`}
                >
                  <span>{r.label}</span>
                  {subBadge > 0 && (
                    <span className="inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                      {subBadge > 99 ? '99+' : subBadge}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
