/**
 * EN: Top-level admin app shell. Vertical layout: TopNav (sticky) → SubNav
 *     (contextual section tabs) → main content via React Router Outlet.
 *     Sidebar removed in favour of a cleaner two-tier tab structure that
 *     scales better when there are many sub-pages.
 * BN: Admin app-এর top-level shell। Vertical layout: TopNav (sticky) → SubNav
 *     (contextual section tab) → main content (React Router Outlet দিয়ে)।
 *     Sidebar বাদ — পরিবর্তে cleaner two-tier tab structure যা অনেক sub-page
 *     থাকলেও ভালভাবে handle করে।
 */

import { Outlet } from 'react-router-dom';
import TopNav from './components/TopNav';
import SubNav from './components/SubNav';
import useCurrentUser from './useCurrentUser';
import { InboxProvider } from './context/InboxContext';

const App = () => {
  const { currentUser, loading } = useCurrentUser();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-tealLight/10">
        <p className="text-brand-slate">Loading…</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-tealLight/10">
        <p className="text-brand-slate">
          Failed to fetch admin information. Redirecting to login…
        </p>
      </div>
    );
  }

  return (
    <InboxProvider>
      <div className="min-h-screen bg-brand-tealLight/10">
        <TopNav />
        <SubNav />
        <main className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
          <Outlet />
        </main>
      </div>
    </InboxProvider>
  );
};

export default App;
