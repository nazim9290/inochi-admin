/**
 * EN: "Where are our visitors from" block for the admin dashboard. Reads GA4
 *     through our own backend so nobody has to log into analytics.google.com to
 *     answer the everyday question.
 *
 *     Until the GA4 credentials are set the endpoint answers configured:false,
 *     and this renders the setup steps in Bangla instead of an error — an
 *     unconfigured dashboard should teach, not scold.
 *
 * BN: Admin dashboard-এর "আমাদের ভিজিটর কোন দেশ থেকে" ব্লক। নিজেদের backend
 *     দিয়ে GA4 পড়ে, তাই রোজকার এই প্রশ্নের উত্তর পেতে কাউকে
 *     analytics.google.com-এ login করতে হয় না।
 *
 *     GA4 credential বসানোর আগে endpoint configured:false দেয়, তখন error না
 *     দেখিয়ে বাংলায় setup-এর ধাপগুলো দেখায় — সেট না থাকা dashboard-এর কাজ
 *     শেখানো, বকা দেওয়া নয়।
 */

import { useEffect, useState } from 'react';
import axiosInterceptor from '../axios/axiosInterceptor';

// EN: Turn a two-letter country code into its flag emoji. Every code maps to a
//     pair of regional-indicator characters, so no image or lookup table.
// BN: দুই-অক্ষরের country code-কে flag emoji-তে বদলায়। প্রতিটা code দুটো
//     regional-indicator character-এ map হয়, তাই কোনো ছবি বা lookup table লাগে না।
const flagOf = (code) => {
  if (!code || code.length !== 2) return '🌐';
  return String.fromCodePoint(
    ...[...code.toUpperCase()].map((ch) => 0x1f1e6 + ch.charCodeAt(0) - 65)
  );
};

const RANGES = [
  { days: 7, label: '৭ দিন' },
  { days: 30, label: '৩০ দিন' },
  { days: 90, label: '৯০ দিন' },
];

const VisitorsByCountry = () => {
  const api = axiosInterceptor();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const res = await api.get(`/analytics/countries?days=${days}`);
        if (!cancelled) setData(res.data);
      } catch (err) {
        if (!cancelled) setData({ configured: false, reason: 'request-failed', countries: [] });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days]);

  const countries = data?.countries || [];
  const top = countries.slice(0, 10);
  // EN: GA4 resolves geography hours after it records the visit, so a freshly
  //     connected property reports real users with an empty country for a day
  //     or two. Say that plainly instead of labelling them "Unknown", which
  //     reads like something is broken.
  // BN: GA4 ভিজিট রেকর্ড করার কয়েক ঘণ্টা পর ভৌগোলিক তথ্য বসায়, তাই সদ্য
  //     যুক্ত property-তে এক-দুই দিন আসল visitor-ও দেশ ছাড়াই আসে। "Unknown"
  //     লিখলে মনে হয় কিছু ভেঙেছে — তাই খোলাখুলি সেটাই বলা হচ্ছে।
  const isUnresolved = (c) => !c.code && (!c.country || /unknown|not set/i.test(c.country));
  const allUnresolved = top.length > 0 && top.every(isUnresolved);
  // EN: Bars are scaled against the biggest country, not the total — otherwise
  //     one dominant country flattens every other bar to nothing.
  // BN: Bar মোট সংখ্যার সাপেক্ষে নয়, সবচেয়ে বড় দেশের সাপেক্ষে scale করা —
  //     নইলে একটা দেশ বড় হলে বাকি সব bar মিলিয়ে যায়।
  const max = top.length ? top[0].users : 0;

  return (
    <div>
      <div className="flex items-baseline justify-between mb-3 gap-3 flex-wrap">
        <h2 className="text-sm font-bold text-brand-navy uppercase tracking-wide">
          ভিজিটর কোন দেশ থেকে
        </h2>
        {data?.configured && (
          <div className="flex gap-1">
            {RANGES.map((r) => (
              <button
                key={r.days}
                onClick={() => setDays(r.days)}
                className={
                  'text-xs px-2 py-1 rounded font-semibold ' +
                  (days === r.days
                    ? 'bg-brand-teal text-white'
                    : 'bg-brand-tealLight/20 text-brand-navy hover:bg-brand-tealLight/40')
                }
              >
                {r.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-brand-tealLight/40 shadow-sm p-5">
        {loading && <p className="text-sm text-brand-slate">Loading…</p>}

        {!loading && data && !data.configured && (
          <div className="text-sm text-brand-slate space-y-3">
            <p className="font-semibold text-brand-navy">
              Google Analytics-এর সাথে সংযোগ এখনো হয়নি।
            </p>
            <p>
              এটা চালু করলে এখানেই দেখতে পাবেন কোন দেশ থেকে কতজন আপনার সাইটে আসছে —
              analytics.google.com-এ আলাদা করে ঢুকতে হবে না। যা লাগবে:
            </p>
            <ol className="list-decimal ms-5 space-y-1.5">
              <li>
                GA4-এ <strong>Admin → Property settings</strong> → <strong>Property ID</strong>{' '}
                সংখ্যাটা (যেমন 493812345) — এটা <code>G-</code> দিয়ে শুরু হওয়া আইডি নয়।
              </li>
              <li>
                Google Cloud-এ একটা <strong>service account</strong> বানিয়ে তার JSON key ফাইল
                নামান (ফ্রি)।
              </li>
              <li>
                সেই service account-এর ইমেইলটা GA4 property-তে <strong>Viewer</strong> হিসেবে
                যোগ করুন — না করলে Google তথ্য দিতে অস্বীকার করবে।
              </li>
            </ol>
            <p className="text-xs">
              তিনটা জিনিস হাতে পেলে ডেভেলপারকে দিন — সার্ভারে বসিয়ে দিলেই এই জায়গায় তালিকা
              দেখা যাবে।
            </p>
          </div>
        )}

        {!loading && data?.configured && top.length === 0 && (
          <p className="text-sm text-brand-slate">
            এখনো কোনো তথ্য আসেনি। Google Analytics সদ্য চালু হলে ডেটা জমতে ২৪–৪৮ ঘণ্টা লাগে।
          </p>
        )}

        {!loading && data?.configured && top.length > 0 && (
          <>
            <p className="text-xs text-brand-slate mb-4">
              গত {days} দিনে মোট <strong className="text-brand-navy">{data.totalUsers}</strong> জন
              ভিজিটর, {countries.length}টি দেশ থেকে।
              {data.cached && <span className="ms-1 opacity-70">(সংরক্ষিত হিসাব)</span>}
            </p>
            <ul className="space-y-2.5">
              {top.map((c) => (
                <li key={c.country} className="flex items-center gap-3">
                  <span className="text-lg leading-none w-6 flex-shrink-0">{flagOf(c.code)}</span>
                  <span
                    className={
                      'text-sm w-40 flex-shrink-0 truncate ' +
                      (isUnresolved(c) ? 'text-brand-slate italic' : 'text-brand-navy')
                    }
                  >
                    {isUnresolved(c) ? 'দেশ এখনো জানা যায়নি' : c.country}
                  </span>
                  <div className="flex-1 h-2 bg-brand-tealLight/20 rounded overflow-hidden min-w-0">
                    <div
                      className="h-full bg-brand-teal rounded"
                      style={{ width: max ? `${Math.max((c.users / max) * 100, 2)}%` : '0%' }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-brand-navy w-14 text-end flex-shrink-0">
                    {c.users}
                  </span>
                </li>
              ))}
            </ul>
            {allUnresolved && (
              <p className="text-xs text-brand-slate mt-4 bg-brand-tealLight/10 border border-brand-tealLight/40 rounded p-3 leading-relaxed">
                ভিজিটর গোনা হচ্ছে ঠিকভাবে, কিন্তু Google এখনো বলেনি তারা কোন দেশ থেকে এসেছে।
                সদ্য চালু হওয়া Analytics-এ এটাই স্বাভাবিক — সাধারণত ২৪–৪৮ ঘণ্টার মধ্যে দেশের নাম
                বসে যায়। কিছু করতে হবে না, অপেক্ষা করুন।
              </p>
            )}
            {countries.length > top.length && (
              <p className="text-xs text-brand-slate mt-3">
                আরও {countries.length - top.length}টি দেশ — পুরো তালিকা Google Analytics-এ।
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default VisitorsByCountry;
