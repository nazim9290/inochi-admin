/**
 * EN: Single source of truth for inbox counts (applications, contacts, reviews).
 *     Polls the backend once and shares the result so TopNav can show a total
 *     unread badge and SubNav can show per-tab badges that match what the
 *     admin sees on each list page. Without this, TopNav and SubNav would
 *     either fetch separately (double traffic) or disagree on what's "new".
 * BN: Inbox count-এর single source of truth (applications, contacts, reviews)।
 *     Backend একবার poll করে result share করে — যাতে TopNav-এ মোট unread badge
 *     আর SubNav-এর প্রতিটা tab-এর alada badge দুটোই একই data থেকে দেখানো যায়।
 *     এটা না থাকলে দুই component আলাদা fetch করত (দ্বিগুণ traffic) বা "new"
 *     নিয়ে বিভ্রান্তি তৈরি হতো।
 */

import { createContext, useContext, useEffect, useState } from 'react';
import axiosInterceptor from '../axios/axiosInterceptor';

const InboxContext = createContext({
  counts: { applications: 0, contacts: 0, reviews: 0 },
  total: 0,
  refresh: () => {},
});

const POLL_MS = 60_000;

export function InboxProvider({ children }) {
  const [counts, setCounts] = useState({ applications: 0, contacts: 0, reviews: 0 });
  const api = axiosInterceptor();

  // EN: Fetch all three pending pools in parallel. Failures fall through silently
  //     so a transient hiccup doesn't reset everything to 0; the previous count
  //     stays visible until the next successful poll.
  // BN: তিনটি pending pool parallel-এ fetch। Failure-এ silently — transient
  //     hiccup-এ count 0 হয় না; পরবর্তী successful poll না হওয়া পর্যন্ত আগের
  //     count visible থাকে।
  const refresh = async () => {
    try {
      const [contactsRes, appsRes, reviewsRes] = await Promise.all([
        api.get('/all-contact-request').catch(() => ({ data: { contacts: [] } })),
        api.get('/applications?status=new').catch(() => ({ data: { applications: [] } })),
        api.get('/reviews?status=pending').catch(() => ({ data: { reviews: [] } })),
      ]);
      const pendingContacts = (contactsRes.data?.contacts || []).filter(
        (c) => (c.status || 'Pending') === 'Pending',
      ).length;
      const newApps = (appsRes.data?.applications || []).length;
      const pendingReviews = (reviewsRes.data?.reviews || []).length;
      setCounts({ applications: newApps, contacts: pendingContacts, reviews: pendingReviews });
    } catch {
      // EN: ignore — keep last known counts
      // BN: ignore — সর্বশেষ count রেখে দেই
    }
  };

  useEffect(() => {
    let alive = true;
    const tick = () => alive && refresh();
    tick();
    const interval = setInterval(tick, POLL_MS);
    const onFocus = () => tick();
    window.addEventListener('focus', onFocus);
    return () => {
      alive = false;
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const total = counts.applications + counts.contacts + counts.reviews;

  return (
    <InboxContext.Provider value={{ counts, total, refresh }}>
      {children}
    </InboxContext.Provider>
  );
}

export function useInbox() {
  return useContext(InboxContext);
}
