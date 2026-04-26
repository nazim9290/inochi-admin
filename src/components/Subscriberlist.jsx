import { useEffect, useState } from 'react';
import axiosInterceptor from '../axios/axiosInterceptor';

const Subscriberlist = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const api = axiosInterceptor();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get('/subscriber');
        if (!cancelled) setRows(data.subscribers || []);
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-brand-tealLight/40 p-6">
      <h2 className="text-xl font-extrabold text-brand-navy mb-4">Subscriber List</h2>
      {loading ? (
        <p className="text-brand-slate">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="text-brand-slate">No subscribers yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-brand-tealLight/20 text-brand-navy">
              <tr>
                <th className="px-4 py-2">#</th>
                <th className="px-4 py-2">Email</th>
              </tr>
            </thead>
            <tbody className="text-brand-slate">
              {rows.map((row, i) => (
                <tr key={row.id || row._id} className="border-b border-brand-tealLight/30">
                  <td className="px-4 py-2">{i + 1}</td>
                  <td className="px-4 py-2">{row.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Subscriberlist;
