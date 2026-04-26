import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import axiosInterceptor from '../axios/axiosInterceptor';
import SideBar from '../components/SideBar';

const AdminPanel = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const api = axiosInterceptor();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get('/profile');
        if (!cancelled) setCurrentUser(data);
      } catch (error) {
        console.error('Error fetching current user:', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        <p className="text-brand-slate">Unable to load admin profile.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-brand-tealLight/10">
      <SideBar />
      <main className="flex-1 p-6 overflow-x-hidden">
        <h1 className="text-2xl font-extrabold text-brand-navy mb-6">Admin Panel</h1>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminPanel;
