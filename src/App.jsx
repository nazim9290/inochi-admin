import { Outlet } from 'react-router-dom';
import SideBar from './components/SideBar';
import useCurrentUser from './useCurrentUser';

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
    <div className="min-h-screen flex bg-brand-tealLight/10">
      <SideBar />
      <main className="flex-1 p-6 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
};

export default App;
