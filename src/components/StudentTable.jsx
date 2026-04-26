import { useEffect, useState } from 'react';
import axiosInterceptor from '../axios/axiosInterceptor';

const StudentTable = ({ endpoint, title }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const api = axiosInterceptor();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get(endpoint);
        if (!cancelled) setStudents(Array.isArray(data) ? data : data?.allUser || []);
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
  }, [endpoint]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-brand-tealLight/40 p-6">
      {title && <h2 className="text-xl font-extrabold text-brand-navy mb-4">{title}</h2>}
      {loading ? (
        <p className="text-brand-slate">Loading…</p>
      ) : students.length === 0 ? (
        <p className="text-brand-slate">No students found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-brand-tealLight/20 text-brand-navy">
              <tr>
                <th className="px-3 py-2">#</th>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Education</th>
                <th className="px-3 py-2">Phone</th>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">Address</th>
                <th className="px-3 py-2">Father</th>
                <th className="px-3 py-2">Mother</th>
                <th className="px-3 py-2">Branch</th>
                <th className="px-3 py-2">Role</th>
              </tr>
            </thead>
            <tbody className="text-brand-slate">
              {students.map((s, i) => (
                <tr key={s.id || s._id} className="border-b border-brand-tealLight/30 align-top">
                  <td className="px-3 py-2">{i + 1}</td>
                  <td className="px-3 py-2 text-brand-navy font-medium whitespace-nowrap">{s.name}</td>
                  <td className="px-3 py-2">{s.education}</td>
                  <td className="px-3 py-2">{s.phone}</td>
                  <td className="px-3 py-2">{s.email}</td>
                  <td className="px-3 py-2">{s.parent || s.paddress}</td>
                  <td className="px-3 py-2">{s.father}</td>
                  <td className="px-3 py-2">{s.mother}</td>
                  <td className="px-3 py-2">{s.branch}</td>
                  <td className="px-3 py-2 capitalize">{s.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StudentTable;
