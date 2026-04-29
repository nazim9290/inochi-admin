/**
 * EN: User management page. Admin sees every account, filters by role,
 *     searches by name/email/phone, opens a side drawer to edit (or
 *     creates a new one via the "+ Add user" button). Password reset is
 *     opt-in — leaving the field blank keeps the existing password.
 *     Self-deletion is blocked server-side; we still hide the delete button
 *     for the current admin's own row to avoid the dead click.
 * BN: User management page। Admin সব account দেখে, role দিয়ে filter,
 *     name/email/phone-এ search, side drawer-এ edit (অথবা "+ Add user"
 *     দিয়ে নতুন create)। Password reset opt-in — field খালি রাখলে আগের
 *     password বহাল। Self-delete server-side block; current admin-এর
 *     নিজের row-এ delete button লুকানো — dead click এড়াতে।
 */

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@context/AuthContext';
import axiosInterceptor from '../axios/axiosInterceptor';
import { relativeTimeBn, formatFullDateBn } from '../lib/inboxUtils';

const ROLES = [
  { key: 'all', label: 'সব', tone: 'navy' },
  { key: 'admin', label: 'Admin', tone: 'red' },
  { key: 'staff', label: 'Staff', tone: 'blue' },
  { key: 'student', label: 'Student', tone: 'green' },
  { key: 'gust', label: 'Guest', tone: 'gray' },
];

const ROLE_OPTIONS = ROLES.filter((r) => r.key !== 'all');

const TONE = {
  navy: 'bg-brand-navy/10 text-brand-navy border-brand-navy/30',
  red: 'bg-red-100 text-red-800 border-red-300',
  blue: 'bg-blue-100 text-blue-800 border-blue-300',
  green: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  gray: 'bg-gray-200 text-gray-700 border-gray-300',
};

const labelClass = 'mb-1 block text-[11px] font-bold uppercase text-brand-slate';
const inputClass =
  'w-full rounded-md border border-brand-tealLight/60 bg-white px-3 py-2 text-sm focus:border-brand-teal focus:outline-none focus:ring-2 focus:ring-brand-teal/40';

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  password: '',
  role: 'gust',
  branch: 'A',
};

export default function Users() {
  const api = axiosInterceptor();
  const { state: auth } = useAuth();
  const selfId = auth?.user?.id || auth?.user?._id;
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/users');
      setUsers(Array.isArray(data?.users) ? data.users : []);
    } catch (err) {
      console.error('Users load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const counts = useMemo(() => {
    const out = { all: users.length };
    ROLE_OPTIONS.forEach((r) => (out[r.key] = 0));
    users.forEach((u) => {
      out[u.role || 'gust'] = (out[u.role || 'gust'] || 0) + 1;
    });
    return out;
  }, [users]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      if (filter !== 'all' && (u.role || 'gust') !== filter) return false;
      if (!q) return true;
      const hay = `${u.name || ''} ${u.email || ''} ${u.phone || ''}`.toLowerCase();
      return hay.includes(q);
    });
  }, [users, filter, search]);

  const remove = async (id) => {
    if (!confirm('এই user permanently delete করবেন?')) return;
    try {
      await api.delete(`/users/${id}`);
      load();
      if (editing?.id === id) setEditing(null);
    } catch (err) {
      alert(err.response?.data?.error || 'Delete failed');
    }
  };

  return (
    <div className="space-y-5 max-w-7xl pb-20">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-navy">User Management</h1>
          <p className="mt-1 text-sm text-brand-slate">
            Admin / Staff / Student / Guest একাউন্ট তৈরি, edit ও delete করুন।
            <br />
            <span className="text-xs">💡 Password reset দিতে চাইলে edit drawer-এর password field-এ নতুন password লিখুন। খালি রাখলে আগেরটাই থাকবে।</span>
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="rounded-md bg-brand-teal px-4 py-2 text-sm font-bold text-white hover:bg-brand-navy"
        >
          + Add user
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {ROLES.map((r) => (
          <button
            key={r.key}
            onClick={() => setFilter(r.key)}
            className={`rounded-xl border p-4 text-left transition-all ${
              filter === r.key ? `${TONE[r.tone]} shadow-sm` : 'border-brand-tealLight/40 bg-white hover:border-brand-teal/40'
            }`}
          >
            <p className="text-[11px] font-bold uppercase tracking-wider opacity-80">{r.label}</p>
            <p className="mt-1 text-2xl font-extrabold">{counts[r.key] || 0}</p>
          </button>
        ))}
      </div>

      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Name, email, ফোন দিয়ে search…"
        className={inputClass}
      />

      <div className="overflow-hidden rounded-xl border border-brand-tealLight/40 bg-white shadow-sm">
        {loading ? (
          <p className="p-6 text-sm text-brand-slate">Loading…</p>
        ) : visible.length === 0 ? (
          <p className="p-6 text-sm text-brand-slate">কোনো user পাওয়া যায়নি।</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-brand-tealLight/10 text-[11px] uppercase tracking-wider text-brand-navy">
              <tr>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Contact</th>
                <th className="px-4 py-2 text-left">Role</th>
                <th className="px-4 py-2 text-left">Branch</th>
                <th className="px-4 py-2 text-left">Created</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-tealLight/30">
              {visible.map((u) => {
                const isSelf = String(u.id) === String(selfId);
                return (
                  <tr key={u.id} className="cursor-pointer hover:bg-brand-tealLight/5" onClick={() => setEditing(u)}>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-brand-navy">
                        {u.name}
                        {isSelf && <span className="ml-2 text-[10px] font-normal italic text-brand-slate">(আপনি)</span>}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <p className="text-brand-navy">{u.phone || '—'}</p>
                      <p className="text-brand-slate">{u.email || '—'}</p>
                    </td>
                    <td className="px-4 py-3"><RoleBadge role={u.role || 'gust'} /></td>
                    <td className="px-4 py-3 text-xs text-brand-slate">{u.branch || '—'}</td>
                    <td className="px-4 py-3 text-[11px] text-brand-slate" title={formatFullDateBn(u.createdAt)}>
                      {relativeTimeBn(u.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={(e) => { e.stopPropagation(); setEditing(u); }}
                        className="mr-2 rounded-md border border-brand-tealLight/60 bg-white px-2.5 py-1 text-xs font-semibold text-brand-navy hover:bg-brand-tealLight/20"
                      >
                        Edit
                      </button>
                      {!isSelf && (
                        <button
                          onClick={(e) => { e.stopPropagation(); remove(u.id); }}
                          className="rounded-md bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-100"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {editing && (
        <UserDrawer
          user={editing}
          onClose={() => setEditing(null)}
          onSaved={() => { load(); setEditing(null); }}
          onDelete={() => remove(editing.id)}
          isSelf={String(editing.id) === String(selfId)}
        />
      )}

      {creating && (
        <UserDrawer
          user={null}
          onClose={() => setCreating(false)}
          onSaved={() => { load(); setCreating(false); }}
        />
      )}
    </div>
  );
}

function RoleBadge({ role }) {
  const def = ROLE_OPTIONS.find((r) => r.key === role) || ROLE_OPTIONS[ROLE_OPTIONS.length - 1];
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${TONE[def.tone]}`}>
      {def.label}
    </span>
  );
}

function UserDrawer({ user, onClose, onSaved, onDelete, isSelf }) {
  const api = axiosInterceptor();
  const [form, setForm] = useState(() => ({ ...emptyForm, ...(user || {}), password: '' }));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const isEdit = !!user;

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const payload = { ...form };
      if (isEdit && !payload.password) delete payload.password;
      if (isEdit) {
        await api.put(`/users/${user.id}`, payload);
      } else {
        await api.post('/users', payload);
      }
      onSaved();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Save failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex" onClick={onClose}>
      <div className="flex-1 bg-black/30" />
      <aside className="flex h-full w-full max-w-lg flex-col overflow-y-auto bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 flex items-start justify-between border-b border-brand-tealLight/40 bg-white px-5 py-4">
          <div>
            <h2 className="text-base font-bold text-brand-navy">
              {isEdit ? `${user.name}-এর details` : 'নতুন user তৈরি'}
            </h2>
            {isEdit && (
              <p className="text-[11px] text-brand-slate">
                Created {formatFullDateBn(user.createdAt)}
              </p>
            )}
          </div>
          <button onClick={onClose} className="rounded-md p-1.5 text-brand-slate hover:bg-brand-tealLight/20" aria-label="Close">
            ✕
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4 px-5 py-5">
          <div>
            <label className={labelClass}>নাম</label>
            <input name="name" value={form.name} onChange={onChange} required className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Email</label>
              <input type="email" name="email" value={form.email || ''} onChange={onChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>ফোন</label>
              <input name="phone" value={form.phone || ''} onChange={onChange} required className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Role</label>
              <select name="role" value={form.role} onChange={onChange} className={inputClass}>
                {ROLE_OPTIONS.map((r) => (
                  <option key={r.key} value={r.key}>{r.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Branch</label>
              <input name="branch" value={form.branch || ''} onChange={onChange} className={inputClass} />
            </div>
          </div>
          <div>
            <label className={labelClass}>
              Password {isEdit && <span className="text-brand-slate font-normal italic">(reset দিতে চাইলে শুধু পূরণ করুন)</span>}
            </label>
            <input
              type="password"
              name="password"
              value={form.password || ''}
              onChange={onChange}
              placeholder={isEdit ? 'Keep current password' : 'কমপক্ষে ৬ অক্ষর'}
              className={inputClass}
              minLength={isEdit ? 0 : 6}
              required={!isEdit}
            />
          </div>

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-2.5 text-xs text-red-700">{error}</div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 pt-3">
            <button
              type="submit"
              disabled={busy}
              className="rounded-md bg-brand-teal px-5 py-2 text-sm font-bold text-white hover:bg-brand-navy disabled:opacity-50"
            >
              {busy ? 'Saving…' : isEdit ? 'Update user' : 'Create user'}
            </button>
            {isEdit && !isSelf && onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="rounded-md bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100"
              >
                Delete user
              </button>
            )}
          </div>
        </form>
      </aside>
    </div>
  );
}
