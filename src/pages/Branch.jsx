/**
 * EN: Branches admin page — currently READ-ONLY because the backend has no
 *     Branch model yet. Branches live in the public site's site.js + Postgres
 *     site_settings, edited there manually. This page surfaces the 4 offices
 *     so admins know where to find them; an in-place editor will land once
 *     the backend Branch model is shipped.
 * BN: ব্রাঞ্চ admin page — এখন READ-ONLY কারণ backend-এ Branch model এখনো নাই।
 *     চারটা office-এর তথ্য public site-এর site.js + site_settings-এ আছে,
 *     manually edit করা হয়। Backend Branch model add হলে এই page-এ in-place
 *     editor যোগ করা হবে।
 */

import { useEffect, useState } from 'react';
import axiosInterceptor from '../axios/axiosInterceptor';

// EN: Fallback list — used when /api/site-settings has no branches data yet.
//     Mirrors the four offices in the public site's lib/site.js.
// BN: Fallback list — যখন /api/site-settings-এ branches data নাই তখন ব্যবহৃত।
//     Public site-এর lib/site.js-এর চারটা office-এর mirror।
const FALLBACK_BRANCHES = [
  {
    slug: 'dhaka',
    city: 'Dhaka',
    cityBn: 'ঢাকা',
    isHeadOffice: true,
    address: 'S.M Bhaban, Cha-75/C (4th Floor), North Badda, Pragati Sarani, Dhaka',
    addressBn: 'এস এম ভবন, চ-৭৫/সি (৪র্থ তলা), উত্তর বাড্ডা, প্রগতি সরণি, ঢাকা',
    phones: ['+880 1784-889646', '+880 1896-214840'],
  },
  {
    slug: 'narayanganj',
    city: 'Narayanganj',
    cityBn: 'নারায়ণগঞ্জ',
    address: 'FM Goli, College Road, Chashara, Narayanganj',
    addressBn: 'এফএম গলি, কলেজ রোড, চাষাড়া, নারায়ণগঞ্জ',
    phones: ['+880 1896-214843'],
  },
  {
    slug: 'barishal',
    city: 'Barishal',
    cityBn: 'বরিশাল',
    address: 'Talukdar Mansion, Nobogram Road, Muslim Para, Barishal',
    addressBn: 'তালুকদার ম্যানশন, নবগ্রাম রোড, মুসলিম পাড়া, বরিশাল',
    phones: ['+880 1896-214847', '+880 1716-176222'],
  },
  {
    slug: 'saitama',
    city: 'Japan',
    cityBn: 'জাপান',
    isJapanOffice: true,
    address: '〒335-0013 Saitama-ken, Toda-shi, Kizawa 1-15-4, Asahi Heim 303',
    addressBn: '〒335-0013 সাইতামা-কেন, তোদা-শি, কিজাওয়া ১-১৫-৪',
    phones: ['+81 70-1302-5135'],
  },
];

export default function Branch() {
  const api = axiosInterceptor();
  const [branches, setBranches] = useState(FALLBACK_BRANCHES);

  useEffect(() => {
    let alive = true;
    api
      .get('/site-settings')
      .then((res) => {
        const settings = res.data?.settings;
        // EN: Future-proofing — if settings ever exposes branches[], use it.
        // BN: Future-proofing — settings-এ branches[] থাকলে সেটা ব্যবহার করি।
        if (alive && Array.isArray(settings?.branches) && settings.branches.length) {
          setBranches(settings.branches);
        }
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-5 max-w-5xl">
      <PageHeader />
      <ReadOnlyNotice />
      <ul className="grid gap-4 sm:grid-cols-2">
        {branches.map((b) => (
          <BranchCard key={b.slug} branch={b} />
        ))}
      </ul>
    </div>
  );
}

// EN: Page title + subtitle in Bangla.
// BN: Page title + subtitle, Bangla-তে।
function PageHeader() {
  return (
    <div>
      <h1 className="text-2xl font-extrabold text-brand-navy">আমাদের অফিস</h1>
      <p className="mt-1 text-sm text-brand-slate">
        Inochi-র চারটা অফিস — তিনটা বাংলাদেশে, একটা জাপানে।
      </p>
    </div>
  );
}

// EN: Friendly notice that admins can't edit here yet (backend pending).
// BN: Admin-কে friendly note: এখানে এখনো edit করা যায় না (backend পেন্ডিং)।
function ReadOnlyNotice() {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
      <p className="font-semibold">📍 এই page এখন READ-ONLY</p>
      <p className="mt-1 leading-relaxed">
        Branch-এর তথ্য বদলাতে হলে আপাতত developer-এর সাথে যোগাযোগ করুন। শীঘ্রই
        এখানে in-place edit feature যোগ হবে যাতে আপনি নিজেই address, phone ও
        নতুন branch যোগ করতে পারেন।
      </p>
    </div>
  );
}

// EN: One office card — city + HQ/Japan badges + bilingual address + phones.
// BN: একটা office card — city + HQ/Japan badge + দুই ভাষার address + ফোন।
function BranchCard({ branch }) {
  return (
    <li className="rounded-xl border border-brand-tealLight/40 bg-white p-5 shadow-sm">
      <header className="mb-3 flex items-center gap-2">
        <h3 className="text-lg font-bold text-brand-navy">
          {branch.cityBn || branch.city}
        </h3>
        {branch.isHeadOffice && (
          <span className="rounded-full bg-brand-teal/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-teal">
            HQ
          </span>
        )}
        {branch.isJapanOffice && (
          <span className="rounded-full bg-brand-navy/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-navy">
            🇯🇵 Japan
          </span>
        )}
      </header>

      <div className="space-y-2 text-sm leading-relaxed text-brand-slate">
        <p>{branch.addressBn || branch.address}</p>
        {branch.address && branch.addressBn && (
          <p className="text-xs italic text-brand-slate/80">{branch.address}</p>
        )}
      </div>

      {branch.phones?.length > 0 && (
        <div className="mt-4 border-t border-brand-tealLight/30 pt-3">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-brand-slate/70">
            ফোন
          </p>
          <ul className="space-y-1">
            {branch.phones.map((p) => (
              <li key={p}>
                <a
                  href={`tel:${p.replace(/[\s-]/g, '')}`}
                  className="text-sm font-semibold text-brand-teal hover:text-brand-navy"
                >
                  {p}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </li>
  );
}
