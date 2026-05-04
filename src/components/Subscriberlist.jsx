/**
 * EN: Newsletter subscriber list — shows everyone who signed up via the
 *     public site footer, lets admin search, copy emails to clipboard for
 *     a campaign, export to CSV, and remove bounced / unsubscribed entries.
 * BN: Newsletter subscriber list — public site footer থেকে যারা subscribe
 *     করেছে সবাই দেখাবে; admin search, campaign-এর জন্য clipboard-এ email
 *     copy, CSV export এবং bounced / unsubscribed entry remove করতে পারে।
 */

import { useEffect, useMemo, useState } from 'react';
import axiosInterceptor from '../axios/axiosInterceptor';
import { relativeTimeBn, downloadCsv } from '../lib/inboxUtils';
import { confirmDialog } from './ConfirmDialog';

const Subscriberlist = () => {
  const api = axiosInterceptor();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [copied, setCopied] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/subscriber');
      setRows(Array.isArray(data?.subscribers) ? data.subscribers : []);
    } catch (err) {
      console.error('Subscriber load error:', err);
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
    return rows.filter((r) => (r.email || '').toLowerCase().includes(q));
  }, [rows, search]);

  const remove = async (id) => {
    const ok = await confirmDialog({
      title: 'Subscriber remove করবেন?',
      message: 'এই subscriber টি list থেকে remove করতে চান?',
      confirmText: 'হ্যাঁ, remove',
      cancelText: 'বাতিল',
      danger: true,
    });
    if (!ok) return;
    setBusyId(id);
    try {
      await api.delete(`/subscriber/${id}`);
      setRows((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      alert('Delete failed');
    } finally {
      setBusyId(null);
    }
  };

  const copyAllEmails = async () => {
    const text = visible.map((r) => r.email).filter(Boolean).join(', ');
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      alert('Copy failed — browser permission না থাকলে CSV export ব্যবহার করুন।');
    }
  };

  const exportCsv = () => {
    const headers = [
      { key: 'email', label: 'Email' },
      { key: 'createdAt', label: 'Subscribed At' },
    ];
    downloadCsv(`subscribers-${new Date().toISOString().slice(0, 10)}.csv`, headers, visible);
  };

  return (
    <div className="space-y-5 max-w-5xl">
      <div>
        <h1 className="text-2xl font-extrabold text-brand-navy">নিউজলেটার সাবস্ক্রাইবার</h1>
        <p className="mt-1 text-sm text-brand-slate">
          Public site footer থেকে যারা subscribe করেছে। Marketing campaign-এর জন্য email copy বা CSV export করুন।
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="মোট subscriber" value={rows.length} />
        <Stat label="দেখানো হচ্ছে" value={visible.length} />
        <Stat label="সর্বশেষ" value={rows[0]?.createdAt ? relativeTimeBn(rows[0].createdAt) : '—'} small />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by email…"
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
        <button
          type="button"
          onClick={copyAllEmails}
          disabled={visible.length === 0}
          className="rounded bg-brand-navy text-white px-3 py-2 text-sm font-semibold hover:bg-brand-teal disabled:opacity-50"
        >
          {copied ? '✓ Copied!' : `📋 Copy ${visible.length} email${visible.length === 1 ? '' : 's'}`}
        </button>
        <button
          type="button"
          onClick={exportCsv}
          disabled={visible.length === 0}
          className="rounded bg-white border border-brand-tealLight/60 px-3 py-2 text-sm font-semibold text-brand-navy hover:bg-brand-tealLight/20 disabled:opacity-50"
        >
          ⬇ CSV Export
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-brand-slate">Loading…</p>
      ) : visible.length === 0 ? (
        <div className="rounded-xl border border-brand-tealLight/40 bg-white p-10 text-center">
          <p className="text-sm text-brand-slate">
            {rows.length === 0 ? 'এখনো কোনো subscriber নেই।' : 'এই search-এ কেউ মেলেনি।'}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-brand-tealLight/40 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-brand-tealLight/15 text-brand-navy">
                <tr>
                  <th className="px-4 py-3 font-semibold">#</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">কখন</th>
                  <th className="px-4 py-3 font-semibold text-right">কাজ</th>
                </tr>
              </thead>
              <tbody className="text-brand-slate">
                {visible.map((r, i) => (
                  <tr key={r.id} className="border-t border-brand-tealLight/30 hover:bg-brand-tealLight/5">
                    <td className="px-4 py-3 text-brand-slate/70">{i + 1}</td>
                    <td className="px-4 py-3">
                      <a href={`mailto:${r.email}`} className="font-semibold text-brand-navy hover:text-brand-teal break-all">
                        {r.email}
                      </a>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-brand-slate">
                      {relativeTimeBn(r.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => remove(r.id)}
                        disabled={busyId === r.id}
                        className="rounded bg-red-50 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50"
                      >
                        Remove
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

export default Subscriberlist;

// EN: Stat card — value can be number or short string (for "last subscribed" timestamp).
// BN: Stat card — value number বা short string (last subscribed time-এর জন্য)।
function Stat({ label, value, small }) {
  return (
    <div className="rounded-xl border border-brand-tealLight/40 bg-white p-4 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wider text-brand-slate/70">{label}</p>
      <p className={`mt-1 font-extrabold text-brand-navy ${small ? 'text-base' : 'text-3xl'}`}>{value}</p>
    </div>
  );
}
