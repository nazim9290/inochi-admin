/**
 * EN: Applications inbox — full management UI for /apply submissions. Pipeline
 *     filter (new / reviewing / accepted / rejected / withdrawn / all), live
 *     search across applicant fields, side drawer with every submitted detail,
 *     status pipeline buttons inline with the drawer, admin-private notes,
 *     reply CTA (email + WhatsApp), CSV export, and delete.
 * BN: Application inbox — /apply submission-এর full management UI। Pipeline
 *     filter (new / reviewing / accepted / rejected / withdrawn / all), live
 *     search applicant field-গুলোয়, side drawer-এ পূর্ণ submitted detail,
 *     drawer-এ status pipeline button, admin-private note, reply CTA
 *     (email + WhatsApp), CSV export এবং delete।
 */

import { useEffect, useMemo, useState } from 'react';
import axiosInterceptor from '../axios/axiosInterceptor';
import { relativeTimeBn, formatFullDateBn, downloadCsv, phoneDigits, waLink } from '../lib/inboxUtils';
import { confirmDialog } from '../components/ConfirmDialog';

const STATUSES = [
  { key: 'all', label: 'সব', tone: 'navy' },
  { key: 'new', label: 'New', tone: 'amber' },
  { key: 'reviewing', label: 'Reviewing', tone: 'blue' },
  { key: 'accepted', label: 'Accepted', tone: 'green' },
  { key: 'rejected', label: 'Rejected', tone: 'red' },
  { key: 'withdrawn', label: 'Withdrawn', tone: 'gray' },
];

const STATUS_PIPELINE = STATUSES.filter((s) => s.key !== 'all');

const TONE_CLASSES = {
  navy: 'bg-brand-navy/10 text-brand-navy border-brand-navy/30',
  amber: 'bg-amber-100 text-amber-800 border-amber-300',
  blue: 'bg-blue-100 text-blue-800 border-blue-300',
  green: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  red: 'bg-red-100 text-red-800 border-red-300',
  gray: 'bg-gray-200 text-gray-700 border-gray-300',
};

const PROGRAM_LABEL = {
  language: 'Language school',
  undergrad: 'Undergraduate',
  grad: 'Graduate',
  vocational: 'Vocational',
  unsure: 'Not sure',
};

const SPONSOR_LABEL = {
  self: 'Self',
  parent: 'Parent',
  relative: 'Relative',
  scholarship: 'Scholarship',
  other: 'Other',
};

const EDU_LABEL = {
  ssc: 'SSC',
  hsc: 'HSC',
  diploma: 'Diploma',
  bachelor: 'Bachelor / Honors',
  master: "Master's",
  other: 'Other',
};

export default function Applications() {
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
      const { data } = await api.get('/applications');
      setRows(Array.isArray(data?.applications) ? data.applications : []);
    } catch (err) {
      console.error('Applications load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // EN: Counts per status — power the pipeline tab badges + stats cards.
  // BN: প্রতি status-এ count — pipeline tab badge + stats card।
  const counts = useMemo(() => {
    const out = { all: rows.length, new: 0, reviewing: 0, accepted: 0, rejected: 0, withdrawn: 0 };
    rows.forEach((r) => {
      out[r.status || 'new'] = (out[r.status || 'new'] || 0) + 1;
    });
    return out;
  }, [rows]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (filter !== 'all' && (r.status || 'new') !== filter) return false;
      if (!q) return true;
      return (
        (r.fullName || '').toLowerCase().includes(q) ||
        (r.email || '').toLowerCase().includes(q) ||
        (r.phone || '').toLowerCase().includes(q) ||
        (r.institution || '').toLowerCase().includes(q) ||
        (r.notes || '').toLowerCase().includes(q)
      );
    });
  }, [rows, filter, search]);

  const updateStatus = async (id, nextStatus) => {
    setBusyId(id);
    try {
      const { data } = await api.put(`/applications/${id}`, { status: nextStatus });
      setRows((prev) => prev.map((r) => (r.id === id ? data.application : r)));
      if (active?.id === id) setActive(data.application);
    } catch (err) {
      alert('Status update failed');
    } finally {
      setBusyId(null);
    }
  };

  const saveNotes = async (id, adminNotes) => {
    setBusyId(id);
    try {
      const { data } = await api.put(`/applications/${id}`, { adminNotes });
      setRows((prev) => prev.map((r) => (r.id === id ? data.application : r)));
      if (active?.id === id) setActive(data.application);
    } catch (err) {
      alert('Note save failed');
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (id) => {
    const ok = await confirmDialog({
      title: 'Application delete করবেন?',
      message: 'এই application টি delete করতে চান?\nএটা আর ফেরত পাবেন না।',
      confirmText: 'হ্যাঁ, delete',
      cancelText: 'বাতিল',
      danger: true,
    });
    if (!ok) return;
    setBusyId(id);
    try {
      await api.delete(`/applications/${id}`);
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
      { key: 'createdAt', label: 'Submitted At' },
      { key: 'status', label: 'Status' },
      { key: 'fullName', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'highestEducation', label: 'Education' },
      { key: 'institution', label: 'Institution' },
      { key: 'passingYear', label: 'Year' },
      { key: 'targetProgram', label: 'Target Program' },
      { key: 'targetIntake', label: 'Intake' },
      { key: 'jlptLevel', label: 'JLPT' },
      { key: 'sponsor', label: 'Sponsor' },
    ];
    downloadCsv(`applications-${new Date().toISOString().slice(0, 10)}.csv`, headers, visible);
  };

  return (
    <div className="space-y-5 max-w-6xl">
      <Header counts={counts} onExport={exportCsv} />

      <div className="flex flex-wrap items-center gap-3">
        <FilterTabs filter={filter} setFilter={setFilter} counts={counts} />
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, phone, institution…"
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
      </div>

      <Table
        loading={loading}
        rows={visible}
        busyId={busyId}
        onOpen={setActive}
        onStatusChange={updateStatus}
        onDelete={remove}
      />

      {active && (
        <Drawer
          application={active}
          busyId={busyId}
          onClose={() => setActive(null)}
          onStatusChange={updateStatus}
          onSaveNotes={saveNotes}
          onDelete={remove}
        />
      )}
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────

function Header({ counts, onExport }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-navy">আবেদন (Applications)</h1>
          <p className="mt-1 text-sm text-brand-slate">
            Public site-এর /apply থেকে যত application আসবে এখানে আসবে। Status update করুন (Reviewing → Accepted / Rejected),
            applicant-কে phone / WhatsApp-এ যোগাযোগ করুন, প্রয়োজনে delete।
          </p>
        </div>
        <button
          type="button"
          onClick={onExport}
          className="inline-flex items-center gap-2 rounded bg-white border border-brand-tealLight/60 px-3 py-1.5 text-sm font-semibold text-brand-navy hover:bg-brand-tealLight/20"
        >
          ⬇ CSV Export
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {STATUSES.map((s) => (
          <StatCard key={s.key} label={s.label} value={counts[s.key] || 0} tone={s.tone} />
        ))}
      </div>
    </div>
  );
}

function StatCard({ label, value, tone }) {
  return (
    <div className={`rounded-xl border p-3 ${TONE_CLASSES[tone]}`}>
      <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">{label}</p>
      <p className="mt-0.5 text-2xl font-extrabold">{value}</p>
    </div>
  );
}

function FilterTabs({ filter, setFilter, counts }) {
  return (
    <div className="inline-flex flex-wrap rounded-lg border border-brand-tealLight/50 bg-white p-1">
      {STATUSES.map((s) => {
        const isActive = filter === s.key;
        return (
          <button
            key={s.key}
            type="button"
            onClick={() => setFilter(s.key)}
            className={`rounded px-2.5 py-1.5 text-xs font-semibold transition-colors ${
              isActive ? 'bg-brand-navy text-white' : 'text-brand-slate hover:text-brand-navy hover:bg-brand-tealLight/20'
            }`}
          >
            {s.label}
            <span className={`ml-1 rounded-full px-1.5 text-[10px] ${isActive ? 'bg-white/20' : 'bg-brand-tealLight/30 text-brand-navy'}`}>
              {counts[s.key] || 0}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// EN: Table — status badge + name + key meta + actions; click row → drawer.
// BN: Table — status badge + name + key meta + action; row click → drawer।
function Table({ loading, rows, busyId, onOpen, onStatusChange, onDelete }) {
  if (loading) return <p className="text-sm text-brand-slate">Loading…</p>;
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-brand-tealLight/40 bg-white p-10 text-center">
        <p className="text-sm text-brand-slate">কোনো application মেলেনি।</p>
      </div>
    );
  }
  return (
    <div className="overflow-hidden rounded-xl border border-brand-tealLight/40 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-brand-tealLight/15 text-brand-navy">
            <tr>
              <th className="px-3 py-3 font-semibold">Status</th>
              <th className="px-3 py-3 font-semibold">নাম</th>
              <th className="px-3 py-3 font-semibold">যোগাযোগ</th>
              <th className="px-3 py-3 font-semibold">প্রোগ্রাম</th>
              <th className="px-3 py-3 font-semibold">শিক্ষা</th>
              <th className="px-3 py-3 font-semibold">কখন</th>
              <th className="px-3 py-3 font-semibold text-right">কাজ</th>
            </tr>
          </thead>
          <tbody className="text-brand-slate">
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-brand-tealLight/30 hover:bg-brand-tealLight/5">
                <td className="px-3 py-3 align-top">
                  <StatusPill status={r.status || 'new'} />
                </td>
                <td className="px-3 py-3 align-top">
                  <button
                    type="button"
                    onClick={() => onOpen(r)}
                    className="font-semibold text-brand-navy hover:text-brand-teal"
                  >
                    {r.fullName || '—'}
                  </button>
                </td>
                <td className="px-3 py-3 align-top text-xs">
                  <a href={`mailto:${r.email}`} className="block text-brand-teal hover:text-brand-navy break-all">{r.email}</a>
                  {r.phone && (
                    <div className="flex flex-wrap gap-2 mt-0.5">
                      <a href={`tel:${phoneDigits(r.phone)}`} className="text-brand-teal hover:text-brand-navy">{r.phone}</a>
                      <a href={waLink(r.phone)} target="_blank" rel="noopener noreferrer" className="text-emerald-700 hover:text-emerald-900 font-semibold">
                        WhatsApp ↗
                      </a>
                    </div>
                  )}
                </td>
                <td className="px-3 py-3 align-top text-xs">
                  <p className="font-semibold text-brand-navy">{PROGRAM_LABEL[r.targetProgram] || '—'}</p>
                  <p className="text-brand-slate/80 capitalize">{r.targetIntake || '—'} · JLPT {r.jlptLevel || 'none'}</p>
                </td>
                <td className="px-3 py-3 align-top text-xs">
                  <p>{EDU_LABEL[r.highestEducation] || '—'} {r.passingYear ? `(${r.passingYear})` : ''}</p>
                  <p className="text-brand-slate/80 truncate max-w-[160px]">{r.institution || '—'}</p>
                </td>
                <td className="px-3 py-3 align-top whitespace-nowrap text-xs text-brand-slate">
                  {relativeTimeBn(r.createdAt)}
                </td>
                <td className="px-3 py-3 align-top">
                  <div className="flex flex-wrap items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => onOpen(r)}
                      className="rounded bg-brand-navy/10 px-2 py-1 text-xs font-semibold text-brand-navy hover:bg-brand-navy hover:text-white"
                    >
                      Open
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(r.id)}
                      disabled={busyId === r.id}
                      className="rounded bg-red-50 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusPill({ status }) {
  const conf = STATUSES.find((s) => s.key === status) || STATUSES[1]; // default to "new"
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${TONE_CLASSES[conf.tone]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${status === 'new' ? 'animate-pulse' : ''} bg-current opacity-80`} />
      {conf.label}
    </span>
  );
}

// EN: Side drawer — full applicant detail + pipeline buttons + admin notes.
// BN: Side drawer — পূর্ণ applicant detail + pipeline button + admin note।
function Drawer({ application: app, busyId, onClose, onStatusChange, onSaveNotes, onDelete }) {
  const [notesDraft, setNotesDraft] = useState(app.adminNotes || '');
  useEffect(() => {
    setNotesDraft(app.adminNotes || '');
  }, [app.id, app.adminNotes]);

  const status = app.status || 'new';

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div
        className="h-full w-full max-w-xl overflow-y-auto bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-brand-tealLight/40 bg-white p-4">
          <div>
            <h2 className="text-lg font-bold text-brand-navy">{app.fullName}</h2>
            <p className="text-xs text-brand-slate">{formatFullDateBn(app.createdAt)}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-brand-slate hover:bg-brand-tealLight/30"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="p-4 space-y-5">
          <StatusPill status={status} />

          {/* Pipeline buttons */}
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-brand-slate/70">Status pipeline</p>
            <div className="flex flex-wrap gap-1.5">
              {STATUS_PIPELINE.map((s) => {
                const isCurrent = s.key === status;
                return (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => !isCurrent && onStatusChange(app.id, s.key)}
                    disabled={isCurrent || busyId === app.id}
                    className={`rounded px-3 py-1.5 text-xs font-semibold border transition-colors ${
                      isCurrent
                        ? `${TONE_CLASSES[s.tone]} cursor-default`
                        : 'border-brand-tealLight/60 bg-white text-brand-slate hover:bg-brand-tealLight/20'
                    }`}
                  >
                    {isCurrent && '✓ '}{s.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reply CTAs */}
          <div className="flex flex-wrap gap-2 border-t border-brand-tealLight/30 pt-4">
            <a
              href={`mailto:${app.email}?subject=${encodeURIComponent('Inochi — আপনার application সম্পর্কে')}`}
              className="rounded bg-brand-navy text-white px-3 py-2 text-sm font-semibold hover:bg-brand-teal"
            >
              ✉ Reply via Email
            </a>
            {app.phone && (
              <a
                href={waLink(app.phone)}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded bg-emerald-600 text-white px-3 py-2 text-sm font-semibold hover:bg-emerald-700"
              >
                💬 WhatsApp
              </a>
            )}
            {app.phone && (
              <a
                href={`tel:${phoneDigits(app.phone)}`}
                className="rounded bg-white border border-brand-navy text-brand-navy px-3 py-2 text-sm font-semibold hover:bg-brand-tealLight/20"
              >
                📞 Call
              </a>
            )}
          </div>

          {/* Personal */}
          <DetailGroup title="ব্যক্তিগত / Personal">
            <DetailRow label="Email" value={app.email} type="email" />
            <DetailRow label="Phone" value={app.phone} type="phone" />
            <DetailRow label="Date of birth" value={app.dateOfBirth} />
            <DetailRow label="Gender" value={app.gender} />
            <DetailRow label="Nationality" value={app.nationality} />
            <DetailRow label="Address" value={app.address} />
          </DetailGroup>

          {/* Education */}
          <DetailGroup title="শিক্ষা / Education">
            <DetailRow label="Highest" value={EDU_LABEL[app.highestEducation] || app.highestEducation} />
            <DetailRow label="Institution" value={app.institution} />
            <DetailRow label="Passing year" value={app.passingYear} />
            <DetailRow label="GPA / Grade" value={app.gpaOrGrade} />
          </DetailGroup>

          {/* Japan plan */}
          <DetailGroup title="জাপান প্ল্যান / Japan plan">
            <DetailRow label="Target program" value={PROGRAM_LABEL[app.targetProgram] || app.targetProgram} />
            <DetailRow label="Target intake" value={app.targetIntake} />
            <DetailRow label="JLPT level" value={app.jlptLevel} />
          </DetailGroup>

          {/* Sponsor */}
          <DetailGroup title="স্পনসর / Sponsor">
            <DetailRow label="Sponsor" value={SPONSOR_LABEL[app.sponsor] || app.sponsor} />
            <DetailRow label="Father's name" value={app.fatherName} />
            <DetailRow label="Mother's name" value={app.motherName} />
            <DetailRow label="Sponsor occupation" value={app.parentOccupation} />
          </DetailGroup>

          {/* Documents */}
          {(app.photoUrl || app.documentsUrl) && (
            <DetailGroup title="ছবি ও কাগজপত্র / Documents">
              {app.photoUrl && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-brand-slate/70 mb-1">Photo</p>
                  {/* eslint-disable-next-line jsx-a11y/alt-text */}
                  <img src={app.photoUrl} className="h-32 w-32 rounded-lg border border-brand-tealLight/40 object-cover" />
                </div>
              )}
              {app.documentsUrl && (
                <DetailRow label="Documents link" value={app.documentsUrl} type="url" />
              )}
            </DetailGroup>
          )}

          {/* Applicant notes */}
          {app.notes && (
            <DetailGroup title="Applicant-এর বার্তা / Notes from applicant">
              <pre className="whitespace-pre-wrap rounded-lg bg-brand-tealLight/10 p-3 text-sm text-brand-navy font-sans leading-relaxed">
                {app.notes}
              </pre>
            </DetailGroup>
          )}

          {/* Admin private notes */}
          <DetailGroup title="🔒 Admin notes (private)">
            <textarea
              value={notesDraft}
              onChange={(e) => setNotesDraft(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-brand-tealLight/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal/40"
              placeholder="Counselor follow-up notes…"
            />
            <button
              type="button"
              onClick={() => onSaveNotes(app.id, notesDraft)}
              disabled={busyId === app.id || notesDraft === (app.adminNotes || '')}
              className="mt-2 rounded bg-brand-teal text-white px-3 py-1.5 text-xs font-semibold hover:bg-brand-navy disabled:opacity-50"
            >
              Save notes
            </button>
          </DetailGroup>

          <div className="border-t border-brand-tealLight/30 pt-4">
            <button
              type="button"
              onClick={() => onDelete(app.id)}
              disabled={busyId === app.id}
              className="rounded bg-red-50 text-red-600 border border-red-200 px-3 py-2 text-sm font-semibold hover:bg-red-100 disabled:opacity-50"
            >
              Delete application
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailGroup({ title, children }) {
  return (
    <div className="space-y-2 rounded-lg border border-brand-tealLight/30 bg-brand-tealLight/5 p-3">
      <h3 className="text-xs font-bold uppercase tracking-wider text-brand-navy">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function DetailRow({ label, value, type }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-sm">
      <span className="w-32 flex-shrink-0 text-xs font-semibold uppercase tracking-wider text-brand-slate/70">{label}</span>
      {type === 'email' ? (
        <a href={`mailto:${value}`} className="text-brand-teal hover:text-brand-navy break-all">{value}</a>
      ) : type === 'phone' ? (
        <div className="flex flex-wrap gap-2">
          <a href={`tel:${phoneDigits(value)}`} className="text-brand-teal hover:text-brand-navy">{value}</a>
          <a href={waLink(value)} target="_blank" rel="noopener noreferrer" className="text-emerald-700 hover:text-emerald-900 font-semibold">
            WhatsApp ↗
          </a>
        </div>
      ) : type === 'url' ? (
        <a href={value} target="_blank" rel="noopener noreferrer" className="text-brand-teal hover:text-brand-navy break-all">{value}</a>
      ) : (
        <span className="text-brand-navy capitalize">{value}</span>
      )}
    </div>
  );
}
