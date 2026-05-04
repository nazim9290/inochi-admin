/**
 * EN: Seminar bookings list — visitors who clicked "Reserve seat" on a
 *     seminar card on the public site. Same inbox-style UI as Contacts:
 *     stats, search, click-to-call/email/WhatsApp, CSV export, and delete
 *     once the booking has been processed (admission given, attendance
 *     marked elsewhere, or it was a duplicate).
 * BN: Seminar booking list — public site-এ seminar card-এর "Reserve seat"
 *     button যারা click করেছে। Contact-এর মতই inbox-style UI: stats, search,
 *     click-to-call/email/WhatsApp, CSV export, প্রক্রিয়া শেষ হলে delete।
 */

import { useEffect, useMemo, useState } from 'react';
import axiosInterceptor from '../axios/axiosInterceptor';
import { relativeTimeBn, downloadCsv, phoneDigits, waLink } from '../lib/inboxUtils';
import { confirmDialog } from './ConfirmDialog';

const SeminerBookList = () => {
  const api = axiosInterceptor();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/all-seminer-booking');
      setRows(Array.isArray(data?.pendingSeminer) ? data.pendingSeminer : []);
    } catch (err) {
      console.error('Booking load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        (r.name || '').toLowerCase().includes(q) ||
        (r.email || '').toLowerCase().includes(q) ||
        (r.phone || '').toLowerCase().includes(q)
    );
  }, [rows, search]);

  const remove = async (id) => {
    const ok = await confirmDialog({
      title: 'Booking delete করবেন?',
      message: 'এই booking টি delete করতে চান?',
      confirmText: 'হ্যাঁ, delete',
      cancelText: 'বাতিল',
      danger: true,
    });
    if (!ok) return;
    setBusyId(id);
    try {
      await api.delete(`/seminer-book/${id}`);
      setRows((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      alert('Delete failed');
    } finally {
      setBusyId(null);
    }
  };

  const exportCsv = () => {
    const headers = [
      { key: 'createdAt', label: 'Booked At' },
      { key: 'name', label: 'Name' },
      { key: 'phone', label: 'Phone' },
      { key: 'email', label: 'Email' },
    ];
    downloadCsv(`seminar-bookings-${new Date().toISOString().slice(0, 10)}.csv`, headers, visible);
  };

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-navy">সেমিনার বুকিং</h1>
          <p className="mt-1 text-sm text-brand-slate">
            যারা "Reserve seat" click করেছে। Phone / WhatsApp দিয়ে confirm করুন।
          </p>
        </div>
        <button
          type="button"
          onClick={exportCsv}
          disabled={visible.length === 0}
          className="rounded bg-white border border-brand-tealLight/60 px-3 py-1.5 text-sm font-semibold text-brand-navy hover:bg-brand-tealLight/20 disabled:opacity-50"
        >
          ⬇ CSV Export
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="মোট booking" value={rows.length} />
        <Stat label="দেখানো হচ্ছে" value={visible.length} />
        <Stat label="সর্বশেষ" value={rows[0]?.createdAt ? relativeTimeBn(rows[0].createdAt) : '—'} small />
      </div>

      <div className="relative max-w-md">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, email, phone…"
          className="w-full rounded-lg border border-brand-tealLight/60 bg-white px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal/40"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-brand-slate hover:text-brand-navy"
          >
            ×
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-brand-slate">Loading…</p>
      ) : visible.length === 0 ? (
        <div className="rounded-xl border border-brand-tealLight/40 bg-white p-10 text-center">
          <p className="text-sm text-brand-slate">
            {rows.length === 0 ? 'এখনো কোনো booking নেই।' : 'এই search-এ কেউ মেলেনি।'}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-brand-tealLight/40 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-brand-tealLight/15 text-brand-navy">
                <tr>
                  <th className="px-4 py-3 font-semibold">নাম</th>
                  <th className="px-4 py-3 font-semibold">ফোন</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">কখন</th>
                  <th className="px-4 py-3 font-semibold text-right">কাজ</th>
                </tr>
              </thead>
              <tbody className="text-brand-slate">
                {visible.map((r) => (
                  <tr key={r.id} className="border-t border-brand-tealLight/30 hover:bg-brand-tealLight/5">
                    <td className="px-4 py-3 align-top font-semibold text-brand-navy">{r.name || '—'}</td>
                    <td className="px-4 py-3 align-top">
                      {r.phone ? (
                        <div className="flex flex-wrap gap-2 text-xs">
                          <a href={`tel:${phoneDigits(r.phone)}`} className="text-brand-teal hover:text-brand-navy font-semibold">
                            {r.phone}
                          </a>
                          <a
                            href={waLink(r.phone)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-700 font-semibold hover:text-emerald-900"
                          >
                            WhatsApp ↗
                          </a>
                        </div>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 align-top text-xs">
                      {r.email ? (
                        <a href={`mailto:${r.email}`} className="text-brand-teal hover:text-brand-navy break-all">
                          {r.email}
                        </a>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 align-top whitespace-nowrap text-xs text-brand-slate">
                      {relativeTimeBn(r.createdAt)}
                    </td>
                    <td className="px-4 py-3 align-top text-right">
                      <button
                        type="button"
                        onClick={() => remove(r.id)}
                        disabled={busyId === r.id}
                        className="rounded bg-red-50 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeminerBookList;

function Stat({ label, value, small }) {
  return (
    <div className="rounded-xl border border-brand-tealLight/40 bg-white p-4 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wider text-brand-slate/70">{label}</p>
      <p className={`mt-1 font-extrabold text-brand-navy ${small ? 'text-base' : 'text-3xl'}`}>{value}</p>
    </div>
  );
}
