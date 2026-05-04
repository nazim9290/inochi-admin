/**
 * EN: Contact Inbox — full management UI for visitor enquiries from the
 *     public site's lead form. Tabs (All / Pending / Answered), live search,
 *     row-level reply (email + WhatsApp), mark-answered and delete actions,
 *     plus a side drawer for the full message + extras packed into msg by
 *     the public site's /api/lead route.
 * BN: Contact Inbox — public site-এর lead form থেকে আসা enquiry-র full
 *     management UI। Tab (সব / Pending / Answered), live search, row-level
 *     reply (email + WhatsApp), Mark answered + Delete action, এবং পূর্ণ
 *     message + public /api/lead route-এর extra info-র জন্য side drawer।
 */

import { useEffect, useMemo, useState } from 'react';
import axiosInterceptor from '../axios/axiosInterceptor';
import { relativeTimeBn, formatFullDateBn, downloadCsv, phoneDigits, waLink } from '../lib/inboxUtils';
import { confirmDialog } from './ConfirmDialog';

// EN: Shared button style — kept inline so the file remains self-contained.
// BN: Shared button style — file self-contained রাখার জন্য inline।
const btn = 'inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold transition-colors';

const Contac = () => {
  const api = axiosInterceptor();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all | pending | answered
  const [search, setSearch] = useState('');
  const [active, setActive] = useState(null); // currently-open contact in drawer
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/all-contact-request');
      setRows(Array.isArray(data?.contacts) ? data.contacts : []);
    } catch (err) {
      console.error('Contact list load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // EN: Counts power the tab badges + the stats card row.
  // BN: Tab badge + stats card-এ count দেখায়।
  const counts = useMemo(() => {
    const total = rows.length;
    const pending = rows.filter((r) => (r.status || 'Pending') === 'Pending').length;
    const answered = total - pending;
    return { total, pending, answered };
  }, [rows]);

  // EN: Apply filter then search across name / email / phone / message.
  // BN: প্রথমে filter, তারপর name / email / phone / message-এ search।
  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      const status = r.status || 'Pending';
      if (filter === 'pending' && status !== 'Pending') return false;
      if (filter === 'answered' && status !== 'Answered') return false;
      if (!q) return true;
      return (
        (r.name || '').toLowerCase().includes(q) ||
        (r.email || '').toLowerCase().includes(q) ||
        (r.phone || '').toLowerCase().includes(q) ||
        (r.msg || '').toLowerCase().includes(q)
      );
    });
  }, [rows, filter, search]);

  const markAnswered = async (id) => {
    setBusyId(id);
    try {
      await api.put(`/answare-contact/${id}`);
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'Answered' } : r)));
      if (active?.id === id) setActive((prev) => ({ ...prev, status: 'Answered' }));
    } catch (err) {
      alert('Status update failed');
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (id) => {
    const ok = await confirmDialog({
      title: 'Enquiry delete করবেন?',
      message: 'এই enquiry টি delete করতে চান? এটা আর ফেরত পাবেন না।',
      confirmText: 'হ্যাঁ, delete',
      cancelText: 'বাতিল',
      danger: true,
    });
    if (!ok) return;
    setBusyId(id);
    try {
      await api.delete(`/contact/${id}`);
      setRows((prev) => prev.filter((r) => r.id !== id));
      if (active?.id === id) setActive(null);
    } catch (err) {
      alert('Delete failed');
    } finally {
      setBusyId(null);
    }
  };

  const exportCsv = () => {
    const headers = [
      { key: 'createdAt', label: 'Date' },
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'status', label: 'Status' },
      { key: 'msg', label: 'Message' },
    ];
    downloadCsv(`contacts-${new Date().toISOString().slice(0, 10)}.csv`, headers, visible);
  };

  return (
    <div className="space-y-5 max-w-6xl">
      <PageHeader counts={counts} onExport={exportCsv} />

      <div className="flex flex-wrap items-center gap-3">
        <FilterTabs filter={filter} setFilter={setFilter} counts={counts} />
        <SearchBox value={search} onChange={setSearch} />
      </div>

      <ContactTable
        loading={loading}
        rows={visible}
        busyId={busyId}
        onOpen={setActive}
        onAnswered={markAnswered}
        onDelete={remove}
      />

      {active && (
        <ContactDrawer
          contact={active}
          busyId={busyId}
          onClose={() => setActive(null)}
          onAnswered={markAnswered}
          onDelete={remove}
        />
      )}
    </div>
  );
};

export default Contac;

// EN: Page title + bilingual subtitle + count cards + CSV export.
// BN: Page title + bilingual subtitle + count card + CSV export।
function PageHeader({ counts, onExport }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-navy">যোগাযোগের অনুরোধ</h1>
          <p className="mt-1 text-sm text-brand-slate">
            Public site-এর lead form থেকে যত enquiry এসেছে — reply করুন, status mark করুন, প্রয়োজনে delete।
          </p>
        </div>
        <button
          type="button"
          onClick={onExport}
          className="inline-flex items-center gap-2 rounded bg-white border border-brand-tealLight/60 px-3 py-1.5 text-sm font-semibold text-brand-navy hover:bg-brand-tealLight/20"
        >
          <DownloadIcon /> CSV Export
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="মোট" value={counts.total} tone="navy" />
        <StatCard label="Pending" value={counts.pending} tone="amber" />
        <StatCard label="Answered" value={counts.answered} tone="teal" />
      </div>
    </div>
  );
}

function StatCard({ label, value, tone }) {
  const tones = {
    navy: 'border-brand-navy/20 bg-brand-navy/5 text-brand-navy',
    amber: 'border-amber-200 bg-amber-50 text-amber-900',
    teal: 'border-brand-tealLight/40 bg-brand-tealLight/15 text-brand-teal',
  };
  return (
    <div className={`rounded-xl border p-4 ${tones[tone]}`}>
      <p className="text-xs font-bold uppercase tracking-wider opacity-70">{label}</p>
      <p className="mt-1 text-3xl font-extrabold">{value}</p>
    </div>
  );
}

// EN: All / Pending / Answered tabs with live counts in each pill.
// BN: All / Pending / Answered tab — প্রতিটায় live count।
function FilterTabs({ filter, setFilter, counts }) {
  const tabs = [
    { key: 'all', label: 'সব', count: counts.total },
    { key: 'pending', label: 'Pending', count: counts.pending },
    { key: 'answered', label: 'Answered', count: counts.answered },
  ];
  return (
    <div className="inline-flex rounded-lg border border-brand-tealLight/50 bg-white p-1">
      {tabs.map((t) => {
        const active = filter === t.key;
        return (
          <button
            key={t.key}
            type="button"
            onClick={() => setFilter(t.key)}
            className={`rounded px-3 py-1.5 text-xs font-semibold transition-colors ${
              active
                ? 'bg-brand-navy text-white'
                : 'text-brand-slate hover:text-brand-navy hover:bg-brand-tealLight/20'
            }`}
          >
            {t.label}
            <span className={`ml-1.5 rounded-full px-1.5 text-[10px] ${active ? 'bg-white/20' : 'bg-brand-tealLight/30 text-brand-navy'}`}>
              {t.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// EN: Live search box; clears with × button.
// BN: Live search box; × button-এ clear।
function SearchBox({ value, onChange }) {
  return (
    <div className="relative flex-1 min-w-[200px] max-w-md">
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search name, email, phone, message…"
        className="w-full rounded-lg border border-brand-tealLight/60 bg-white px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal/40"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-brand-slate hover:text-brand-navy"
          aria-label="Clear search"
        >
          ×
        </button>
      )}
    </div>
  );
}

// EN: Main desktop table — name + status badge + clickable contacts + actions.
// BN: Main desktop table — name + status badge + clickable contact + action।
function ContactTable({ loading, rows, busyId, onOpen, onAnswered, onDelete }) {
  if (loading) return <p className="text-sm text-brand-slate">Loading…</p>;
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-brand-tealLight/40 bg-white p-10 text-center">
        <p className="text-sm text-brand-slate">কোনো enquiry মেলেনি।</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-brand-tealLight/40 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-brand-tealLight/15 text-brand-navy">
            <tr>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">নাম</th>
              <th className="px-4 py-3 font-semibold">যোগাযোগ</th>
              <th className="px-4 py-3 font-semibold">বার্তা</th>
              <th className="px-4 py-3 font-semibold">কখন</th>
              <th className="px-4 py-3 font-semibold text-right">কাজ</th>
            </tr>
          </thead>
          <tbody className="text-brand-slate">
            {rows.map((r) => {
              const status = r.status || 'Pending';
              const isPending = status === 'Pending';
              return (
                <tr key={r.id} className="border-t border-brand-tealLight/30 hover:bg-brand-tealLight/5">
                  <td className="px-4 py-3 align-top">
                    <StatusBadge status={status} />
                  </td>
                  <td className="px-4 py-3 align-top">
                    <button
                      type="button"
                      onClick={() => onOpen(r)}
                      className="font-semibold text-brand-navy hover:text-brand-teal"
                    >
                      {r.name || '—'}
                    </button>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <ContactLinks email={r.email} phone={r.phone} />
                  </td>
                  <td className="px-4 py-3 align-top max-w-md">
                    <p className="line-clamp-2 text-xs">{r.msg || '—'}</p>
                  </td>
                  <td className="px-4 py-3 align-top whitespace-nowrap text-xs text-brand-slate">
                    {relativeTimeBn(r.createdAt)}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <div className="flex flex-wrap items-center justify-end gap-1.5">
                      {isPending && (
                        <button
                          type="button"
                          onClick={() => onAnswered(r.id)}
                          disabled={busyId === r.id}
                          className={`${btn} bg-brand-teal/10 text-brand-teal hover:bg-brand-teal hover:text-white disabled:opacity-50`}
                        >
                          ✓ Mark
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onOpen(r)}
                        className={`${btn} bg-brand-navy/10 text-brand-navy hover:bg-brand-navy hover:text-white`}
                      >
                        Open
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(r.id)}
                        disabled={busyId === r.id}
                        className={`${btn} bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50`}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// EN: Pill showing current status with a tone-matched colour.
// BN: Status pill — color tone matching।
function StatusBadge({ status }) {
  const isPending = status === 'Pending';
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
        isPending ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${isPending ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
      {isPending ? 'Pending' : 'Answered'}
    </span>
  );
}

// EN: Email + phone with mailto/tel/WhatsApp deep links.
// BN: Email + phone — mailto / tel / WhatsApp deep link সহ।
function ContactLinks({ email, phone }) {
  return (
    <div className="space-y-0.5 text-xs">
      {email && (
        <a href={`mailto:${email}`} className="block text-brand-teal hover:text-brand-navy">
          {email}
        </a>
      )}
      {phone && (
        <div className="flex flex-wrap gap-2">
          <a href={`tel:${phoneDigits(phone)}`} className="text-brand-teal hover:text-brand-navy">
            {phone}
          </a>
          <a
            href={waLink(phone)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-700 font-semibold hover:text-emerald-900"
          >
            WhatsApp ↗
          </a>
        </div>
      )}
    </div>
  );
}

// EN: Slide-in detail drawer — full message + all reply actions in one place.
//     The public lead form packs extras (Education / Year / Intake / Sponsor)
//     into the msg field as labelled lines, so we render `msg` verbatim.
// BN: Slide-in detail drawer — পূর্ণ message + সব reply action। Public lead
//     form-এ extra info (Education / Year / Intake / Sponsor) labelled line
//     হিসেবে msg-তে packed, তাই msg verbatim দেখাই।
function ContactDrawer({ contact, busyId, onClose, onAnswered, onDelete }) {
  const status = contact.status || 'Pending';
  const isPending = status === 'Pending';
  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="h-full w-full max-w-md overflow-y-auto bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-brand-tealLight/40 bg-white p-4">
          <div>
            <h2 className="text-lg font-bold text-brand-navy">{contact.name || '—'}</h2>
            <p className="text-xs text-brand-slate">{formatFullDateBn(contact.createdAt)}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-brand-slate hover:bg-brand-tealLight/30"
            aria-label="Close"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <StatusBadge status={status} />

          <DetailRow label="Email" value={contact.email} type="email" />
          <DetailRow label="Phone" value={contact.phone} type="phone" />

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-brand-slate/70 mb-1">বার্তা</p>
            <pre className="whitespace-pre-wrap rounded-lg bg-brand-tealLight/10 p-3 text-sm text-brand-navy font-sans leading-relaxed">
              {contact.msg || '—'}
            </pre>
          </div>

          <div className="flex flex-wrap gap-2 pt-2 border-t border-brand-tealLight/30">
            {contact.email && (
              <a
                href={`mailto:${contact.email}?subject=${encodeURIComponent('Inochi Education — আপনার enquiry-র জবাব')}`}
                className="rounded bg-brand-navy text-white px-3 py-2 text-sm font-semibold hover:bg-brand-teal"
              >
                ✉ Reply via Email
              </a>
            )}
            {contact.phone && (
              <a
                href={waLink(contact.phone)}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded bg-emerald-600 text-white px-3 py-2 text-sm font-semibold hover:bg-emerald-700"
              >
                💬 WhatsApp
              </a>
            )}
            {isPending && (
              <button
                type="button"
                onClick={() => onAnswered(contact.id)}
                disabled={busyId === contact.id}
                className="rounded bg-brand-teal text-white px-3 py-2 text-sm font-semibold hover:bg-brand-navy disabled:opacity-50"
              >
                ✓ Mark Answered
              </button>
            )}
            <button
              type="button"
              onClick={() => onDelete(contact.id)}
              disabled={busyId === contact.id}
              className="rounded bg-red-50 text-red-600 border border-red-200 px-3 py-2 text-sm font-semibold hover:bg-red-100 disabled:opacity-50"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// EN: Single label + value row in the detail drawer; renders contact links
//     when type is "email" or "phone".
// BN: Detail drawer-এ একটা label + value row; type "email" বা "phone" হলে
//     contact link render করে।
function DetailRow({ label, value, type }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wider text-brand-slate/70">{label}</p>
      {type === 'email' ? (
        <a href={`mailto:${value}`} className="text-sm font-semibold text-brand-teal hover:text-brand-navy break-all">{value}</a>
      ) : type === 'phone' ? (
        <div className="flex flex-wrap gap-3 text-sm font-semibold">
          <a href={`tel:${phoneDigits(value)}`} className="text-brand-teal hover:text-brand-navy">{value}</a>
          <a href={waLink(value)} target="_blank" rel="noopener noreferrer" className="text-emerald-700 hover:text-emerald-900">WhatsApp ↗</a>
        </div>
      ) : (
        <p className="text-sm text-brand-navy">{value}</p>
      )}
    </div>
  );
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
