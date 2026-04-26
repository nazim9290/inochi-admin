import { useEffect, useState } from 'react';
import axiosInterceptor from '../axios/axiosInterceptor';

const FreeStudent = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({ role: 'gust', branch: 'A' });
  const api = axiosInterceptor();

  const fetchStudents = async () => {
    try {
      const { data } = await api.get('/all-guset');
      setStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startEdit = (s) => {
    setEditingId(s.id || s._id);
    setDraft({ role: s.role || 'gust', branch: s.branch || 'A' });
  };

  const cancel = () => setEditingId(null);

  const save = async (id) => {
    try {
      await api.put(`/change-role/${id}`, draft);
      setEditingId(null);
      fetchStudents();
    } catch (err) {
      console.error(err);
    }
  };

  const fieldClass = 'px-2 py-1 border border-brand-tealLight/60 rounded text-sm';
  const btn = 'px-3 py-1 rounded text-xs font-semibold transition-colors';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-brand-tealLight/40 p-6">
      <h2 className="text-xl font-extrabold text-brand-navy mb-4">Guest Students (free)</h2>
      {loading ? (
        <p className="text-brand-slate">Loading…</p>
      ) : students.length === 0 ? (
        <p className="text-brand-slate">No guest users.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-brand-tealLight/20 text-brand-navy">
              <tr>
                <th className="px-3 py-2">#</th>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Phone</th>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">Branch</th>
                <th className="px-3 py-2">Role</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody className="text-brand-slate">
              {students.map((s, i) => {
                const id = s.id || s._id;
                const isEditing = editingId === id;
                return (
                  <tr key={id} className="border-b border-brand-tealLight/30">
                    <td className="px-3 py-2">{i + 1}</td>
                    <td className="px-3 py-2 text-brand-navy font-medium whitespace-nowrap">{s.name}</td>
                    <td className="px-3 py-2">{s.phone}</td>
                    <td className="px-3 py-2">{s.email}</td>
                    <td className="px-3 py-2">
                      {isEditing ? (
                        <select className={fieldClass} value={draft.branch} onChange={(e) => setDraft({ ...draft, branch: e.target.value })}>
                          <option value="A">A</option>
                          <option value="B">B</option>
                        </select>
                      ) : (
                        s.branch
                      )}
                    </td>
                    <td className="px-3 py-2 capitalize">
                      {isEditing ? (
                        <select className={fieldClass} value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value })}>
                          <option value="gust">Guest</option>
                          <option value="student">Student</option>
                          <option value="admin">Admin</option>
                        </select>
                      ) : (
                        s.role
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {isEditing ? (
                        <span className="flex gap-2">
                          <button onClick={() => save(id)} className={`${btn} bg-brand-teal hover:bg-brand-navy text-white`}>Save</button>
                          <button onClick={cancel} className={`${btn} bg-brand-tealLight/30 hover:bg-brand-tealLight/50 text-brand-navy`}>Cancel</button>
                        </span>
                      ) : (
                        <button onClick={() => startEdit(s)} className={`${btn} bg-brand-navy hover:bg-brand-teal text-white`}>Edit</button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FreeStudent;
