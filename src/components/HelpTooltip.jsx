/**
 * EN: HelpTooltip — small "?" badge next to a label that reveals a Bangla
 *     hint on hover (desktop) or tap (mobile). Built for non-technical
 *     admins who'd otherwise need to ask what a field means. CSS-only,
 *     no JS, no portal, works inside any form layout.
 *     Usage:
 *       <label className={labelClass}>
 *         Featured <HelpTooltip>Home page-এর top strip-এ দেখাবে।</HelpTooltip>
 *       </label>
 * BN: HelpTooltip — label-এর পাশে ছোট্ট "?" badge। Hover (desktop) বা tap
 *     (mobile) করলে Bangla hint দেখাবে। Non-technical admin-এর জন্য —
 *     কোন field মানে কী জিজ্ঞেস করার দরকার নেই। CSS-only, JS লাগে না,
 *     যে কোনো form layout-এ কাজ করে।
 */
export default function HelpTooltip({ children, side = 'top' }) {
  const sideClass =
    side === 'right'
      ? 'left-full top-1/2 -translate-y-1/2 ml-2'
      : side === 'bottom'
        ? 'top-full left-1/2 -translate-x-1/2 mt-1.5'
        : 'bottom-full left-1/2 -translate-x-1/2 mb-1.5';

  return (
    <span
      className="relative inline-flex items-center group align-middle"
      tabIndex={0}
      aria-label="সহায়িকা"
    >
      <span
        className="ml-1 inline-flex h-4 w-4 cursor-help items-center justify-center
          rounded-full bg-brand-tealLight/60 text-[10px] font-bold text-brand-navy
          ring-1 ring-brand-tealLight transition-colors
          group-hover:bg-brand-teal group-hover:text-white group-focus:bg-brand-teal group-focus:text-white"
        aria-hidden="true"
      >
        ?
      </span>
      <span
        role="tooltip"
        className={`absolute z-30 ${sideClass} pointer-events-none w-56 rounded-lg
          bg-brand-navy px-3 py-2 text-[11px] leading-relaxed text-white shadow-lg
          opacity-0 group-hover:opacity-100 group-focus:opacity-100
          transition-opacity duration-150`}
      >
        {children}
      </span>
    </span>
  );
}
