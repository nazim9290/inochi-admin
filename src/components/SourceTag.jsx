/**
 * EN: Small coloured chip showing where a lead came from (e.g. "Facebook/
 *     Instagram Ad", "Google", "Direct"). Paid ads are highlighted blue so
 *     the team can spot ad-driven leads at a glance. Hover shows the raw
 *     UTM/referrer detail. Empty source renders a muted dash.
 * BN: ছোট রঙিন chip — lead কোথা থেকে এল দেখায় (যেমন "Facebook/Instagram Ad",
 *     "Google", "Direct")। Paid ad নীল রঙে highlight — অ্যাড থেকে আসা lead
 *     এক নজরে চেনা যায়। Hover-এ raw UTM/referrer detail। খালি হলে muted dash।
 */
const SourceTag = ({ source, attribution }) => {
  const s = String(source || '').trim();
  if (!s) return <span className="text-brand-slate/40">—</span>;

  const cls = /\bad\b|ads/i.test(s)
    ? 'bg-blue-100 text-blue-700' // paid ad
    : /facebook|instagram|youtube|tiktok|linkedin|twitter|x\//i.test(s)
      ? 'bg-indigo-50 text-indigo-700' // social (organic)
      : /google|bing|organic/i.test(s)
        ? 'bg-emerald-50 text-emerald-700' // search
        : /direct/i.test(s)
          ? 'bg-slate-100 text-slate-600' // direct
          : 'bg-amber-50 text-amber-700'; // referral / other

  return (
    <span
      title={attribution || s}
      className={`inline-block rounded px-2 py-0.5 text-[10px] font-semibold ${cls}`}
    >
      {s}
    </span>
  );
};

export default SourceTag;
