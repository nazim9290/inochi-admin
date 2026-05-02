/**
 * EN: Audit log viewer. Timeline of admin actions across reviews,
 *     applications, users, and site settings. Filter by entity, action,
 *     or summary text. "Load more" pages through older entries.
 * BN: Audit log viewer। Review, application, user, site settings — সব
 *     admin action-এর timeline। Entity, action, summary text দিয়ে filter।
 *     "Load more" দিয়ে পুরাতন entry page করা যায়।
 */

import { useEffect, useMemo, useState } from 'react';
import axiosInterceptor from '../axios/axiosInterceptor';
import { relativeTimeBn, formatFullDateBn } from '../lib/inboxUtils';

const ENTITIES = [
  { key: '', label: 'All entities' },
  { key: 'Review', label: 'Reviews' },
  { key: 'Application', label: 'Applications' },
  { key: 'User', label: 'Users' },
  { key: 'SiteSettings', label: 'Site settings' },
  { key: 'HowItWorksStep', label: 'Pathway steps' },
  { key: 'Branch', label: 'Branches' },
];

const ACTIONS = [
  { key: '', label: 'Any action' },
  { key: 'create', label: 'Create' },
  { key: 'update', label: 'Update' },
  { key: 'delete', label: 'Delete' },
];

const ACTION_TONE = {
  create: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  update: 'bg-blue-100 text-blue-800 border-blue-300',
  delete: 'bg-red-100 text-red-800 border-red-300',
};

const PAGE_SIZE = 100;
const inputClass =
  'rounded-md border border-brand-tealLight/60 bg-white px-3 py-2 text-sm focus:border-brand-teal focus:outline-none focus:ring-2 focus:ring-brand-teal/40';

export default function AuditLog() {
  const api = axiosInterceptor();
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [entity, setEntity] = useState('');
  const [action, setAction] = useState('');
  const [q, setQ] = useState('');

  const fetchPage = async (off, replace) => {
    setLoading(true);
    try {
      const params = { limit: PAGE_SIZE, offset: off };
      if (entity) params.entity = entity;
      if (action) params.action = action;
      if (q.trim()) params.q = q.trim();
      const { data } = await api.get('/audit-logs', { params });
      const newRows = Array.isArray(data?.logs) ? data.logs : [];
      setLogs((prev) => (replace ? newRows : [...prev, ...newRows]));
      setTotal(data?.total || 0);
      setOffset(off + newRows.length);
    } catch (err) {
      console.error('Audit log load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPage(0, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entity, action]);

  const onSearch = (e) => {
    e.preventDefault();
    fetchPage(0, true);
  };

  const grouped = useMemo(() => {
    const out = [];
    let lastDay = null;
    for (const l of logs) {
      const d = (l.createdAt || '').slice(0, 10);
      if (d !== lastDay) {
        out.push({ kind: 'day', date: d });
        lastDay = d;
      }
      out.push({ kind: 'entry', log: l });
    }
    return out;
  }, [logs]);

  return (
    <div className="space-y-5 max-w-5xl pb-20">
      <div>
        <h1 className="text-2xl font-extrabold text-brand-navy">Audit Log</h1>
        <p className="mt-1 text-sm text-brand-slate">
          কে কখন কী বদল করেছেন — সবকিছুর timeline। সাম্প্রতিক উপরে।
        </p>
      </div>

      <form onSubmit={onSearch} className="flex flex-wrap items-end gap-3 rounded-xl border border-brand-tealLight/40 bg-white p-4 shadow-sm">
        <div>
          <label className="block text-[11px] font-bold uppercase text-brand-slate">Entity</label>
          <select value={entity} onChange={(e) => setEntity(e.target.value)} className={inputClass + ' min-w-[160px]'}>
            {ENTITIES.map((o) => (
              <option key={o.key} value={o.key}>{o.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-bold uppercase text-brand-slate">Action</label>
          <select value={action} onChange={(e) => setAction(e.target.value)} className={inputClass + ' min-w-[140px]'}>
            {ACTIONS.map((o) => (
              <option key={o.key} value={o.key}>{o.label}</option>
            ))}
          </select>
        </div>
        <div className="flex-1 min-w-[220px]">
          <label className="block text-[11px] font-bold uppercase text-brand-slate">Search summary</label>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="যেমন: name, status…" className={inputClass + ' w-full'} />
        </div>
        <button type="submit" className="rounded-md bg-brand-teal px-5 py-2 text-sm font-bold text-white hover:bg-brand-navy">
          Search
        </button>
      </form>

      <p className="text-xs text-brand-slate">
        {loading && logs.length === 0 ? 'Loading…' : `Showing ${logs.length} of ${total} entries`}
      </p>

      <div className="rounded-xl border border-brand-tealLight/40 bg-white shadow-sm">
        {logs.length === 0 && !loading ? (
          <p className="p-6 text-sm text-brand-slate">কোনো log entry নেই।</p>
        ) : (
          <ul className="divide-y divide-brand-tealLight/30">
            {grouped.map((g, i) =>
              g.kind === 'day' ? (
                <li key={`d-${g.date}-${i}`} className="bg-brand-tealLight/10 px-5 py-2 text-[11px] font-bold uppercase tracking-wider text-brand-slate">
                  {g.date}
                </li>
              ) : (
                <LogRow key={g.log.id} log={g.log} />
              )
            )}
          </ul>
        )}
      </div>

      {logs.length < total && (
        <div className="text-center">
          <button
            type="button"
            onClick={() => fetchPage(offset, false)}
            disabled={loading}
            className="rounded-md border border-brand-teal bg-white px-5 py-2 text-sm font-semibold text-brand-teal hover:bg-brand-teal hover:text-white disabled:opacity-50"
          >
            {loading ? 'Loading…' : 'Load more'}
          </button>
        </div>
      )}
    </div>
  );
}

function LogRow({ log }) {
  const [expanded, setExpanded] = useState(false);
  const tone = ACTION_TONE[log.action] || 'bg-gray-100 text-gray-700 border-gray-300';
  const hasDetails = log.details && Object.keys(log.details).length > 0;
  return (
    <li className="px-5 py-3 hover:bg-brand-tealLight/5">
      <div className="flex items-start gap-3">
        <span className={`flex-shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${tone}`}>
          {log.action}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-brand-navy">
            <span className="font-semibold">{log.actorName || 'Unknown'}</span>
            <span className="ml-2 inline-block rounded bg-brand-navy/10 px-1.5 py-0.5 text-[10px] font-bold uppercase text-brand-navy">
              {log.entity}
            </span>
          </p>
          <p className="mt-0.5 text-[13px] text-brand-slate">{log.summary || '(no summary)'}</p>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-[10px] text-brand-slate/70">
            <span title={formatFullDateBn(log.createdAt)}>{relativeTimeBn(log.createdAt)}</span>
            {log.ip && <span>IP: {log.ip}</span>}
            {hasDetails && (
              <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className="text-brand-teal-700 hover:text-brand-navy font-semibold"
              >
                {expanded ? 'Hide details' : 'Show details'}
              </button>
            )}
          </div>
          {expanded && hasDetails && (
            <pre className="mt-2 max-w-full overflow-x-auto rounded-md bg-brand-navy/5 p-2.5 text-[11px] text-brand-navy">
              {JSON.stringify(log.details, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </li>
  );
}
