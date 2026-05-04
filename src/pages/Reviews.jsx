/**
 * EN: Reviews moderation inbox. Public submissions land here as 'pending'.
 *     Admin filters by status (Pending / Approved / Rejected), searches
 *     across name + body, opens a side drawer to read the full review,
 *     toggles publish, edits rating + location, adds private admin notes,
 *     replies via email, exports CSV, deletes. Approving + publishing
 *     surfaces the review at /reviews on the public site.
 * BN: Review moderation inbox। Public submission এখানে 'pending' হিসেবে আসে।
 *     Admin status (Pending / Approved / Rejected) দিয়ে filter, name + body-তে
 *     search, side drawer-এ পুরো review পড়ে, publish toggle, rating + location
 *     edit, private admin note, email reply, CSV export, delete। Approve +
 *     publish করলে public site-এর /reviews-এ দেখাবে।
 */

import { useEffect, useMemo, useState } from 'react';
import axiosInterceptor from '../axios/axiosInterceptor';
import { relativeTimeBn, formatFullDateBn, downloadCsv, phoneDigits, waLink } from '../lib/inboxUtils';
import { confirmDialog } from '../components/ConfirmDialog';

const STATUSES = [
  { key: 'all', label: 'সব', tone: 'navy' },
  { key: 'pending', label: 'Pending', tone: 'amber' },
  { key: 'approved', label: 'Approved', tone: 'green' },
  { key: 'rejected', label: 'Rejected', tone: 'red' },
];

const PIPELINE = STATUSES.filter((s) => s.key !== 'all');

const TONE_CLASSES = {
  navy: 'bg-brand-navy/10 text-brand-navy border-brand-navy/30',
  amber: 'bg-amber-100 text-amber-800 border-amber-300',
  green: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  red: 'bg-red-100 text-red-800 border-red-300',
};

function Stars({ rating, size = 14 }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <svg
          key={n}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          className={n <= (rating || 0) ? 'fill-amber-400' : 'fill-gray-200'}
        >
          <path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z" />
        </svg>
      ))}
    </span>
  );
}

export default function Reviews() {
  const api = axiosInterceptor();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [active, setActive] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/reviews');
      setRows(Array.isArray(data?.reviews) ? data.reviews : []);
    } catch (err) {
      console.error('Reviews load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const counts = useMemo(() => {
    const out = { all: rows.length, pending: 0, approved: 0, rejected: 0 };
    rows.forEach((r) => {
      out[r.status || 'pending'] = (out[r.status || 'pending'] || 0) + 1;
    });
    return out;
  }, [rows]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (filter !== 'all' && (r.status || 'pending') !== filter) return false;
      if (!q) return true;
      const hay = `${r.name || ''} ${r.email || ''} ${r.review || ''} ${r.location || ''}`.toLowerCase();
      return hay.includes(q);
    });
  }, [rows, filter, search]);

  const updateStatus = async (id, patch) => {
    setBusyId(id);
    try {
      await api.put(`/reviews/${id}`, patch);
      await load();
      if (active?.id === id) {
        setActive((cur) => (cur ? { ...cur, ...patch } : cur));
      }
    } catch (err) {
      alert('Update failed');
    } finally {
      setBusyId(null);
    }
  };

  const togglePublish = (r) => {
    if (r.status !== 'approved') {
      // EN: Auto-approve when publishing — admin shouldn't need two clicks.
      // BN: Publish করলে auto-approve — admin-কে দু'বার click করতে হবে না।
      updateStatus(r.id, { published: true, status: 'approved' });
    } else {
      updateStatus(r.id, { published: !r.published });
    }
  };

  const remove = async (id) => {
    const ok = await confirmDialog({
      title: 'Review delete করবেন?',
      message: 'এই review delete করতে চান?',
      confirmText: 'হ্যাঁ, delete',
      cancelText: 'বাতিল',
      danger: true,
    });
    if (!ok) return;
    try {
      await api.delete(`/reviews/${id}`);
      if (active?.id === id) setActive(null);
      load();
    } catch (err) {
      alert('Delete failed');
    }
  };

  const exportCsv = () => {
    const headers = ['Name', 'Email', 'Phone', 'Rating', 'Status', 'Published', 'Location', 'JLPT', 'Batch', 'Review', 'Submitted'];
    const data = visible.map((r) => [
      r.name || '',
      r.email || '',
      r.phone || '',
      r.rating || 0,
      r.status || 'pending',
      r.published ? 'Yes' : 'No',
      r.location || '',
      r.jlptLevel || '',
      r.batchYear || '',
      (r.review || '').replace(/\s+/g, ' ').slice(0, 500),
      r.createdAt || '',
    ]);
    downloadCsv(`inochi-reviews-${filter}-${new Date().toISOString().slice(0, 10)}.csv`, headers, data);
  };

  return (
    <div className="space-y-5 max-w-7xl pb-20">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-navy">Reviews</h1>
          <p className="mt-1 text-sm text-brand-slate">
            Public submission moderate করুন। Approve + Publish করলে সাইটের{' '}
            <span className="font-semibold text-brand-teal-700">/reviews</span> পেজে দেখাবে।
          </p>
        </div>
        <button
          type="button"
          onClick={exportCsv}
          disabled={visible.length === 0}
          className="rounded-md border border-brand-tealLight/60 bg-white px-3 py-1.5 text-xs font-semibold text-brand-navy hover:bg-brand-teal-100/30 disabled:opacity-40"
        >
          Export CSV ({visible.length})
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {STATUSES.map((s) => (
          <button
            key={s.key}
            onClick={() => setFilter(s.key)}
            className={`rounded-xl border p-4 text-left transition-all ${
              filter === s.key
                ? `${TONE_CLASSES[s.tone]} shadow-sm`
                : 'border-brand-tealLight/40 bg-white hover:border-brand-teal/40'
            }`}
          >
            <p className="text-[11px] font-bold uppercase tracking-wider opacity-80">{s.label}</p>
            <p className="mt-1 text-2xl font-extrabold">{counts[s.key] || 0}</p>
          </button>
        ))}
      </div>

      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name, email, location, body…"
        className="w-full rounded-md border border-brand-tealLight/60 bg-white px-3 py-2 text-sm focus:border-brand-teal focus:outline-none focus:ring-2 focus:ring-brand-teal/40"
      />

      <div className="overflow-hidden rounded-xl border border-brand-tealLight/40 bg-white shadow-sm">
        {loading ? (
          <p className="p-6 text-sm text-brand-slate">Loading…</p>
        ) : visible.length === 0 ? (
          <p className="p-6 text-sm text-brand-slate">কোনো review পাওয়া যায়নি।</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-brand-tealLight/10 text-[11px] uppercase tracking-wider text-brand-navy">
              <tr>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Rating</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Published</th>
                <th className="px-4 py-2 text-left">Submitted</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-tealLight/30">
              {visible.map((r) => (
                <tr
                  key={r.id}
                  className="cursor-pointer hover:bg-brand-tealLight/5"
                  onClick={() => setActive(r)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {r.photoUrl ? (
                        <img src={r.photoUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-teal/10 text-xs font-bold text-brand-teal-700">
                          {r.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold text-brand-navy">{r.name}</p>
                        {r.location && (
                          <p className="text-[11px] text-brand-slate">{r.location}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><Stars rating={r.rating} /></td>
                  <td className="px-4 py-3">
                    <StatusBadge status={r.status || 'pending'} />
                  </td>
                  <td className="px-4 py-3">
                    {r.published ? (
                      <span className="text-emerald-700">Live</span>
                    ) : (
                      <span className="text-brand-slate/60">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[11px] text-brand-slate" title={formatFullDateBn(r.createdAt)}>
                    {relativeTimeBn(r.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={(e) => { e.stopPropagation(); togglePublish(r); }}
                      disabled={busyId === r.id}
                      className={`mr-2 rounded-md px-2.5 py-1 text-xs font-semibold ${
                        r.published
                          ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                          : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                      } disabled:opacity-50`}
                    >
                      {r.published ? 'Unpublish' : 'Publish'}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); remove(r.id); }}
                      className="rounded-md bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-100"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {active && (
        <Drawer
          review={active}
          onClose={() => setActive(null)}
          onUpdate={(patch) => updateStatus(active.id, patch)}
          onDelete={() => remove(active.id)}
          busy={busyId === active.id}
        />
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const tone = {
    pending: 'bg-amber-100 text-amber-800 border-amber-300',
    approved: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    rejected: 'bg-red-100 text-red-800 border-red-300',
  }[status] || 'bg-gray-100 text-gray-700 border-gray-300';
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${tone}`}>
      {status === 'pending' && (
        <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
      )}
      {status}
    </span>
  );
}

function Drawer({ review, onClose, onUpdate, onDelete, busy }) {
  const [notes, setNotes] = useState(review.adminNotes || '');
  const [savingNotes, setSavingNotes] = useState(false);

  const saveNotes = async () => {
    setSavingNotes(true);
    try {
      await onUpdate({ adminNotes: notes });
    } finally {
      setSavingNotes(false);
    }
  };

  const wa = review.phone ? waLink(phoneDigits(review.phone)) : null;
  const mail = review.email
    ? `mailto:${review.email}?subject=${encodeURIComponent('Re: your Inochi review')}`
    : null;

  return (
    <div className="fixed inset-0 z-40 flex" onClick={onClose}>
      <div className="flex-1 bg-black/30" />
      <aside
        className="flex h-full w-full max-w-xl flex-col overflow-y-auto bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 flex items-start justify-between gap-3 border-b border-brand-tealLight/40 bg-white px-5 py-4">
          <div className="flex items-center gap-3 min-w-0">
            {review.photoUrl ? (
              <img src={review.photoUrl} alt="" className="h-12 w-12 flex-shrink-0 rounded-full object-cover" />
            ) : (
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-brand-teal/10 text-base font-bold text-brand-teal-700">
                {review.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
            )}
            <div className="min-w-0">
              <h2 className="truncate text-base font-bold text-brand-navy">{review.name}</h2>
              <Stars rating={review.rating} size={12} />
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-brand-slate hover:bg-brand-tealLight/20"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="space-y-5 px-5 py-5">
          <section>
            <p className="text-[11px] font-bold uppercase text-brand-slate">Status pipeline</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {PIPELINE.map((s) => {
                const active = (review.status || 'pending') === s.key;
                return (
                  <button
                    key={s.key}
                    type="button"
                    disabled={busy}
                    onClick={() => onUpdate({ status: s.key })}
                    className={`rounded-md border px-3 py-1.5 text-xs font-semibold transition ${
                      active ? TONE_CLASSES[s.tone] : 'border-brand-tealLight/40 bg-white text-brand-navy hover:bg-brand-tealLight/10'
                    } disabled:opacity-50`}
                  >
                    {s.label}
                  </button>
                );
              })}
              <button
                type="button"
                disabled={busy}
                onClick={() => onUpdate({ published: !review.published, status: review.published ? review.status : 'approved' })}
                className={`rounded-md border px-3 py-1.5 text-xs font-bold ${
                  review.published
                    ? 'border-amber-300 bg-amber-100 text-amber-800'
                    : 'border-emerald-300 bg-emerald-100 text-emerald-800'
                } disabled:opacity-50`}
              >
                {review.published ? '⬇ Unpublish' : '⬆ Publish to /reviews'}
              </button>
            </div>
          </section>

          <section className="rounded-lg border border-brand-tealLight/40 bg-brand-tealLight/5 p-4">
            <p className="text-[11px] font-bold uppercase text-brand-slate">Review</p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-brand-navy">
              {review.review}
            </p>
          </section>

          <section className="grid grid-cols-2 gap-3 text-sm">
            <Field label="Email" value={review.email || '—'} />
            <Field label="Phone" value={review.phone || '—'} />
            <Field label="Location" value={review.location || '—'} />
            <Field label="JLPT" value={review.jlptLevel || '—'} />
            <Field label="Batch year" value={review.batchYear || '—'} />
            <Field label="Submitted" value={formatFullDateBn(review.createdAt)} />
          </section>

          {(mail || wa) && (
            <section className="flex flex-wrap gap-2">
              {mail && (
                <a
                  href={mail}
                  className="inline-flex items-center gap-1.5 rounded-md bg-brand-teal px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-navy"
                >
                  ✉ Email reply
                </a>
              )}
              {wa && (
                <a
                  href={wa}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                >
                  WhatsApp
                </a>
              )}
            </section>
          )}

          <section>
            <label className="mb-1 block text-[11px] font-bold uppercase text-brand-slate">
              Admin notes (private)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-brand-tealLight/60 bg-white px-3 py-2 text-sm focus:border-brand-teal focus:outline-none focus:ring-2 focus:ring-brand-teal/40"
              placeholder="Internal note — not visible to the submitter…"
            />
            <button
              type="button"
              onClick={saveNotes}
              disabled={savingNotes}
              className="mt-2 rounded-md border border-brand-tealLight/60 bg-white px-3 py-1.5 text-xs font-semibold text-brand-navy hover:bg-brand-tealLight/20 disabled:opacity-50"
            >
              {savingNotes ? 'Saving…' : 'Save notes'}
            </button>
          </section>

          <section className="border-t border-brand-tealLight/40 pt-4">
            <button
              type="button"
              onClick={onDelete}
              className="rounded-md bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100"
            >
              Delete this review permanently
            </button>
          </section>
        </div>
      </aside>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase text-brand-slate">{label}</p>
      <p className="text-brand-navy">{value}</p>
    </div>
  );
}
