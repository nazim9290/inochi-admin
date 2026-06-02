/**
 * EN: AI Blog control panel. Three sections:
 *       1. Status banner — shows whether the scheduler is enabled, whether
 *          DeepSeek API key is present, and what hour it fires.
 *       2. Topic queue — admin can pre-load topic ideas; oldest pending is
 *          consumed each day. Empty queue → AI picks a topic.
 *       3. Run history — last 50 runs with success/failure + linked blog.
 *     Plus a "Generate now" button to trigger a one-off run on demand.
 * BN: AI Blog control panel। তিনটি section:
 *       ১. Status banner — scheduler enabled কিনা, DeepSeek API key আছে
 *          কিনা, কখন fire হয় দেখায়।
 *       ২. Topic queue — admin আগে থেকে topic idea যোগ করতে পারে; প্রতিদিন
 *          সবচেয়ে পুরোনো pending consume হয়। খালি হলে AI বেছে নেয়।
 *       ৩. Run history — শেষ ৫০টা run, success/failure + linked blog।
 *     এছাড়া "Generate now" বাটন — চাইলে এখনই একটা run।
 */

import { useEffect, useState } from 'react';
import axiosInterceptor from '../axios/axiosInterceptor';
import { confirmDialog } from '../components/ConfirmDialog';

const AiBlogManage = () => {
  const api = axiosInterceptor();
  const [status, setStatus] = useState(null);
  const [queue, setQueue] = useState([]);
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ topic: '', category: '', keywordsCsv: '' });
  const [busyAdd, setBusyAdd] = useState(false);
  const [busyRun, setBusyRun] = useState(false);
  const [lastRunMessage, setLastRunMessage] = useState('');

  const loadAll = async () => {
    setLoading(true);
    try {
      const [s, q, r] = await Promise.all([
        api.get('/ai-blog/status'),
        api.get('/ai-blog/queue'),
        api.get('/ai-blog/runs'),
      ]);
      setStatus(s.data || null);
      setQueue(Array.isArray(q.data?.items) ? q.data.items : []);
      setRuns(Array.isArray(r.data?.runs) ? r.data.runs : []);
    } catch (err) {
      // EN: Silent — banner already explains when status fails to load.
      // BN: Silent — status load না হলে banner বুঝিয়ে দেয়।
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addTopic = async (e) => {
    e?.preventDefault();
    if (!form.topic.trim()) return;
    setBusyAdd(true);
    try {
      await api.post('/ai-blog/queue', form);
      setForm({ topic: '', category: '', keywordsCsv: '' });
      loadAll();
    } catch (err) {
      alert('Topic যোগ করতে সমস্যা');
    } finally {
      setBusyAdd(false);
    }
  };

  const removeTopic = async (id) => {
    const ok = await confirmDialog({
      title: 'Topic delete?',
      message: 'এই topic-টি queue থেকে সরাবেন?',
      confirmText: 'হ্যাঁ, সরান',
      cancelText: 'বাতিল',
      danger: true,
    });
    if (!ok) return;
    try {
      await api.delete(`/ai-blog/queue/${id}`);
      loadAll();
    } catch (err) {
      alert('Delete failed');
    }
  };

  const runNow = async () => {
    const ok = await confirmDialog({
      title: 'এখনই একটি blog generate করবেন?',
      message:
        'DeepSeek-কে এখনই একটি trilingual blog post বানাতে বলা হবে এবং সরাসরি publish হবে। চালিয়ে যাবেন?',
      confirmText: 'হ্যাঁ, generate',
      cancelText: 'বাতিল',
    });
    if (!ok) return;
    setBusyRun(true);
    setLastRunMessage('Generating… (এতে ৩০–৯০ সেকেন্ড লাগতে পারে)');
    try {
      const { data } = await api.post('/ai-blog/run');
      if (data?.ok) {
        setLastRunMessage(`✓ Published: ${data.title}`);
      } else {
        setLastRunMessage(`✗ Failed: ${data?.error || 'unknown'}`);
      }
      loadAll();
    } catch (err) {
      const msg = err?.response?.data?.error || err?.message || 'Generation failed';
      setLastRunMessage(`✗ ${msg}`);
    } finally {
      setBusyRun(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <header>
        <h1 className="text-2xl font-extrabold text-brand-navy">AI Blog Auto-Publish</h1>
        <p className="mt-1 text-sm text-brand-slate">
          DeepSeek প্রতিদিন একটি trilingual (bn + en + ja) SEO-optimised blog post বানিয়ে publish করে।
          এখানে topic queue manage করুন, এখনই generate করুন, বা শেষ runs দেখুন।
        </p>
      </header>

      <StatusBanner status={status} />

      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-xl border border-brand-tealLight/40 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-brand-navy">Topic Queue</h2>
          <p className="mt-1 text-xs text-brand-slate">
            Pending row থাকলে scheduler প্রথমে সেটি ব্যবহার করে। খালি হলে AI fallback topic বেছে নেয়।
          </p>

          <form onSubmit={addTopic} className="mt-4 space-y-2">
            <input
              type="text"
              required
              value={form.topic}
              onChange={(e) => setForm((f) => ({ ...f, topic: e.target.value }))}
              placeholder="যেমন: ৩০ দিনে JLPT N5 প্রস্তুতি"
              className="w-full rounded-lg border border-brand-tealLight/60 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal/40"
            />
            <div className="grid gap-2 sm:grid-cols-2">
              <input
                type="text"
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                placeholder="Category (ঐচ্ছিক)"
                className="rounded-lg border border-brand-tealLight/60 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal/40"
              />
              <input
                type="text"
                value={form.keywordsCsv}
                onChange={(e) => setForm((f) => ({ ...f, keywordsCsv: e.target.value }))}
                placeholder="Keywords CSV (ঐচ্ছিক)"
                className="rounded-lg border border-brand-tealLight/60 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal/40"
              />
            </div>
            <button
              type="submit"
              disabled={busyAdd}
              className="rounded bg-brand-navy text-white px-4 py-2 text-sm font-semibold hover:bg-brand-teal disabled:opacity-50"
            >
              {busyAdd ? 'যোগ হচ্ছে…' : '+ Queue-এ যোগ করুন'}
            </button>
          </form>

          <div className="mt-5 space-y-2">
            {loading ? (
              <p className="text-sm text-brand-slate">Loading…</p>
            ) : queue.length === 0 ? (
              <p className="text-sm text-brand-slate/70">Queue খালি — AI fallback topic বেছে নেবে।</p>
            ) : (
              queue.map((q) => (
                <div
                  key={q.id}
                  className="flex items-start justify-between rounded-lg border border-brand-tealLight/30 bg-brand-tealLight/5 px-3 py-2"
                >
                  <div className="min-w-0 flex-1 pr-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusChip status={q.status} />
                      {q.category && (
                        <span className="rounded bg-brand-navy/10 px-2 py-0.5 text-[10px] font-semibold text-brand-navy">
                          {q.category}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-brand-navy break-words">{q.topic}</p>
                    {q.keywordsCsv && (
                      <p className="mt-1 text-xs text-brand-slate/70 break-words">kw: {q.keywordsCsv}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeTopic(q.id)}
                    className="rounded bg-red-50 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-100"
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-xl border border-brand-tealLight/40 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-brand-navy">Run History</h2>
            <button
              type="button"
              onClick={runNow}
              disabled={busyRun || !status?.hasApiKey}
              className="rounded bg-brand-teal px-3 py-2 text-xs font-semibold text-white hover:bg-brand-tealLight disabled:opacity-50"
            >
              {busyRun ? 'Generating…' : '▶ এখনই Generate'}
            </button>
          </div>

          {lastRunMessage && (
            <div className="mt-3 rounded border border-brand-tealLight/40 bg-brand-tealLight/5 px-3 py-2 text-sm text-brand-navy">
              {lastRunMessage}
            </div>
          )}

          <div className="mt-4 max-h-[480px] overflow-y-auto pr-1">
            {loading ? (
              <p className="text-sm text-brand-slate">Loading…</p>
            ) : runs.length === 0 ? (
              <p className="text-sm text-brand-slate/70">এখনো কোনো run হয়নি।</p>
            ) : (
              <ul className="space-y-2">
                {runs.map((r) => (
                  <li
                    key={r.id}
                    className={`rounded-lg border px-3 py-2 ${
                      r.status === 'success'
                        ? 'border-emerald-200 bg-emerald-50'
                        : 'border-red-200 bg-red-50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold">
                        {r.status === 'success' ? '✓ Success' : '✗ Failed'} · {r.source}
                      </span>
                      <span className="text-[10px] text-brand-slate">
                        {new Date(r.createdAt).toLocaleString('bn-BD')}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-brand-navy break-words">{r.topic}</p>
                    {r.blogTitle && (
                      <p className="mt-1 text-xs text-brand-slate break-words">→ {r.blogTitle}</p>
                    )}
                    {r.errorMessage && (
                      <p className="mt-1 font-mono text-[10px] text-red-700 break-all">
                        {r.errorMessage.slice(0, 240)}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

// EN: Status banner — green when fully ready, amber when missing key, grey when disabled.
// BN: Status banner — সব ঠিক থাকলে সবুজ, key না থাকলে amber, disabled হলে grey।
function StatusBanner({ status }) {
  if (!status) {
    return (
      <div className="rounded-xl border border-brand-tealLight/40 bg-white px-4 py-3 text-sm text-brand-slate">
        Status load হচ্ছে…
      </div>
    );
  }
  if (!status.enabled) {
    return (
      <div className="rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700">
        🟤 Scheduler <strong>disabled</strong>। VPS .env-এ <code>AI_BLOG_ENABLED=true</code> set করে
        api restart করুন।
      </div>
    );
  }
  if (!status.hasApiKey) {
    return (
      <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        🟠 Enabled কিন্তু <strong>DEEPSEEK_API_KEY missing</strong>। .env-এ key বসিয়ে api restart করুন।
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
      🟢 Ready — প্রতিদিন স্থানীয় সময় <strong>{String(status.hour).padStart(2, '0')}:17</strong>-এ
      run হবে। Model: <code>{status.model}</code>
      {status.authorIdConfigured ? '' : ' · Author: প্রথম admin (default)'}
    </div>
  );
}

// EN: Tiny status chip — colour-codes pending / used / failed.
// BN: ছোট status chip — pending / used / failed colour-code করে।
function StatusChip({ status }) {
  const styles =
    status === 'used'
      ? 'bg-emerald-100 text-emerald-700'
      : status === 'failed'
        ? 'bg-red-100 text-red-700'
        : 'bg-amber-100 text-amber-800';
  return (
    <span className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase ${styles}`}>{status}</span>
  );
}

export default AiBlogManage;
