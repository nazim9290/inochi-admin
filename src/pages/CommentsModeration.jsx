/**
 * EN: Comments moderation page. Lists comments by status (Pending /
 *     Approved / Rejected / All), shows author + blog title + timestamp,
 *     and exposes Approve, Reject, Restore (back to pending), and Delete
 *     actions. Default tab is Pending so the moderation queue is the
 *     first thing the admin sees on landing.
 * BN: Comment moderation page। Status অনুযায়ী comment list (Pending /
 *     Approved / Rejected / সব), author + blog title + timestamp দেখায়,
 *     এবং Approve, Reject, Restore (pending-এ ফেরত), Delete action দেয়।
 *     Default tab Pending — admin landing-এই moderation queue চোখে পড়ে।
 */

import { useEffect, useMemo, useState } from 'react';
import axiosInterceptor from '../axios/axiosInterceptor';
import { confirmDialog } from '../components/ConfirmDialog';

const STATUSES = [
  { key: 'pending', label: 'Pending', tone: 'amber' },
  { key: 'approved', label: 'Approved', tone: 'green' },
  { key: 'rejected', label: 'Rejected', tone: 'red' },
  { key: 'all', label: 'সব', tone: 'navy' },
];

const TONE_BADGE = {
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
  green: 'bg-green-50 text-green-700 border-green-200',
  red: 'bg-red-50 text-red-700 border-red-200',
  navy: 'bg-brand-navy/10 text-brand-navy border-brand-navy/30',
};

const STATUS_BADGE = {
  pending: TONE_BADGE.amber,
  approved: TONE_BADGE.green,
  rejected: TONE_BADGE.red,
};

function formatDate(iso) {
  if (!iso) return '';
  try {
    return new Intl.DateTimeFormat('bn-BD', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

const CommentsModeration = () => {
  const api = axiosInterceptor();
  const [filter, setFilter] = useState('pending');
  const [search, setSearch] = useState('');
  const [items, setItems] = useState([]);
  const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [message, setMessage] = useState(null);

  const showMsg = (kind, text) => {
    setMessage({ kind, text });
    setTimeout(() => setMessage(null), 2500);
  };

  const load = async (statusKey = filter) => {
    setLoading(true);
    try {
      const [{ data: list }, { data: c }] = await Promise.all([
        api.get(`/admin/comments?status=${statusKey}`),
        api.get('/admin/comments/counts'),
      ]);
      setItems(Array.isArray(list?.items) ? list.items : []);
      setCounts({
        pending: c?.pending || 0,
        approved: c?.approved || 0,
        rejected: c?.rejected || 0,
      });
    } catch (err) {
      console.error('Comments load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(filter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (c) =>
        (c.body || '').toLowerCase().includes(q) ||
        (c.user?.name || '').toLowerCase().includes(q) ||
        (c.user?.email || '').toLowerCase().includes(q) ||
        (c.blog?.title || '').toLowerCase().includes(q),
    );
  }, [items, search]);

  const setStatus = async (id, status) => {
    setBusyId(id);
    try {
      await api.put(`/admin/comments/${id}/status`, { status });
      showMsg('ok', `✓ Status: ${status}`);
      await load(filter);
    } catch (err) {
      console.error(err);
      showMsg('error', 'Status update failed');
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (id) => {
    const ok = await confirmDialog({
      title: 'Comment delete করবেন?',
      message: 'এই comment permanently delete করবেন?',
      confirmText: 'হ্যাঁ, delete',
      cancelText: 'বাতিল',
      danger: true,
    });
    if (!ok) return;
    setBusyId(id);
    try {
      await api.delete(`/comments/${id}`);
      showMsg('ok', '✓ Delete হয়েছে');
      await load(filter);
    } catch (err) {
      console.error(err);
      showMsg('error', 'Delete failed');
    } finally {
      setBusyId(null);
    }
  };

  const tabBtn = (s) => {
    const isActive = filter === s.key;
    const count =
      s.key === 'all'
        ? counts.pending + counts.approved + counts.rejected
        : counts[s.key] || 0;
    return (
      <button
        key={s.key}
        type="button"
        onClick={() => setFilter(s.key)}
        className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-semibold transition ${
          isActive
            ? 'border-brand-teal bg-brand-teal text-white shadow-sm'
            : 'border-brand-tealLight/60 bg-white text-brand-navy hover:bg-brand-tealLight/15'
        }`}
      >
        {s.label}
        {count > 0 && (
          <span
            className={`rounded-full px-1.5 text-[11px] ${
              isActive ? 'bg-white/20 text-white' : TONE_BADGE[s.tone]
            }`}
          >
            {count}
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-brand-navy">Comments Moderation</h1>
          <p className="text-xs text-brand-slate">
            Public site-এর blog comment-গুলো এখানে approve / reject করুন।
          </p>
        </div>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name / email / blog…"
          className="w-full max-w-xs rounded-lg border border-brand-tealLight/60 px-3 py-2 text-sm focus:border-brand-teal focus:outline-none focus:ring-2 focus:ring-brand-teal/30"
        />
      </header>

      <div className="flex flex-wrap gap-2">{STATUSES.map(tabBtn)}</div>

      {message && (
        <div
          className={`rounded-lg border px-4 py-2 text-sm ${
            message.kind === 'ok'
              ? 'border-green-200 bg-green-50 text-green-700'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="rounded-xl border border-brand-tealLight/40 bg-white shadow-sm">
        {loading ? (
          <div className="p-10 text-center text-brand-slate">Loading…</div>
        ) : visible.length === 0 ? (
          <div className="p-10 text-center text-brand-slate">
            কোনো comment নেই।
          </div>
        ) : (
          <ul className="divide-y divide-brand-tealLight/30">
            {visible.map((c) => {
              const statusKey = c.status;
              return (
                <li key={c.id} className="p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-brand-slate">
                        <span className="font-semibold text-brand-navy">
                          {c.user?.name || '—'}
                        </span>
                        {c.user?.email && (
                          <span className="text-brand-slate">{c.user.email}</span>
                        )}
                        <span>•</span>
                        <span>{formatDate(c.createdAt)}</span>
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
                            STATUS_BADGE[statusKey] || TONE_BADGE.navy
                          }`}
                        >
                          {statusKey}
                        </span>
                        {c.parentId && (
                          <span className="rounded-full border border-brand-tealLight/60 bg-brand-tealLight/15 px-2 py-0.5 text-[11px] text-brand-slate">
                            reply
                          </span>
                        )}
                      </div>

                      {c.blog && (
                        <p className="mt-1 text-[12px] italic text-brand-slate">
                          on: {c.blog.titleEn || c.blog.title}
                        </p>
                      )}

                      <p className="mt-2 whitespace-pre-line break-words text-sm text-brand-navy">
                        {c.body}
                      </p>
                    </div>

                    <div className="flex flex-shrink-0 flex-wrap gap-2">
                      {statusKey !== 'approved' && (
                        <button
                          type="button"
                          onClick={() => setStatus(c.id, 'approved')}
                          disabled={busyId === c.id}
                          className="rounded-lg border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 hover:bg-green-100 disabled:opacity-60"
                        >
                          ✓ Approve
                        </button>
                      )}
                      {statusKey !== 'rejected' && (
                        <button
                          type="button"
                          onClick={() => setStatus(c.id, 'rejected')}
                          disabled={busyId === c.id}
                          className="rounded-lg border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700 hover:bg-orange-100 disabled:opacity-60"
                        >
                          ✗ Reject
                        </button>
                      )}
                      {statusKey !== 'pending' && (
                        <button
                          type="button"
                          onClick={() => setStatus(c.id, 'pending')}
                          disabled={busyId === c.id}
                          className="rounded-lg border border-brand-tealLight/60 bg-white px-3 py-1 text-xs font-semibold text-brand-navy hover:bg-brand-tealLight/15 disabled:opacity-60"
                        >
                          ↺ Pending
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => remove(c.id)}
                        disabled={busyId === c.id}
                        className="rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60"
                      >
                        🗑 Delete
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default CommentsModeration;
