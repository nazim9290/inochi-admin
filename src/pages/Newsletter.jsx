/**
 * EN: Newsletter compose + send. Loads subscriber count, lets admin compose
 *     a subject + body (textarea — line breaks become <br>; **bold** and
 *     [link](url) markdown shortcuts handled inline), preview pane shows the
 *     wrapped email exactly as recipients will see it, and the send button
 *     POSTs to /api/newsletter-send. Confirmation modal before sending so
 *     the action stays deliberate.
 * BN: Newsletter compose + send। Subscriber count load করে, admin subject +
 *     body লিখে (textarea — line break <br> হয়; **bold** আর [link](url)
 *     markdown shortcut inline handle), preview pane recipient যেমন দেখবে
 *     তেমন wrap করা email দেখায়, send button /api/newsletter-send POST
 *     করে। Send-এর আগে confirmation modal — action deliberate রাখতে।
 */

import { useEffect, useMemo, useState } from 'react';
import axiosInterceptor from '../axios/axiosInterceptor';

const labelClass = 'mb-1 block text-xs font-semibold uppercase tracking-wider text-brand-slate';
const inputClass =
  'w-full rounded-md border border-brand-tealLight/60 bg-white px-3 py-2.5 text-sm focus:border-brand-teal focus:outline-none focus:ring-2 focus:ring-brand-teal/40';

// EN: Tiny markdown shim — bold via **text**, links via [text](url), and
//     auto-paragraph on blank lines. Newlines within a paragraph become
//     <br> so admin's hand-formatting is honored without a full rich editor.
// BN: ছোট্ট markdown shim — **text** bold, [text](url) link, blank line-এ
//     auto-paragraph। Paragraph-এর ভিতরে newline <br> হয় — admin-এর
//     hand-formatting সম্মান পায়, full rich editor ছাড়াই।
function escape(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
function renderBody(raw) {
  if (!raw) return '';
  const paragraphs = raw.split(/\n\s*\n/);
  return paragraphs
    .map((p) => {
      let html = escape(p);
      html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color:#0F2D52;text-decoration:underline;">$1</a>');
      html = html.replace(/\n/g, '<br>');
      return `<p style="margin:0 0 12px;">${html}</p>`;
    })
    .join('\n');
}

// EN: Templates are admin-local (localStorage) — fast, no backend round-trip,
//     and no DB schema change. Each template = { id, name, subject, body }.
//     Used to store recurring layouts (monthly digest, intake reminder etc.)
//     so the admin doesn't retype them.
// BN: Template admin-local (localStorage) — দ্রুত, backend round-trip নেই,
//     DB schema বদলায় না। প্রতি template = { id, name, subject, body }।
//     পুনরাবৃত্ত layout (monthly digest, intake reminder ইত্যাদি) save —
//     admin বার বার লিখতে হয় না।
const TEMPLATE_STORAGE_KEY = 'inochi.newsletter.templates';

function loadTemplates() {
  try {
    const raw = window.localStorage.getItem(TEMPLATE_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
function saveTemplates(list) {
  try {
    window.localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(list));
  } catch {}
}

export default function Newsletter() {
  const api = axiosInterceptor();
  const [subscribers, setSubscribers] = useState(0);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [savingAs, setSavingAs] = useState(false);
  const [templateName, setTemplateName] = useState('');

  useEffect(() => {
    api
      .get('/subscriber')
      .then((res) => setSubscribers((res.data?.subscribers || []).length))
      .catch(() => setSubscribers(0));
    setTemplates(loadTemplates());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyTemplate = (id) => {
    if (!id) return;
    const tpl = templates.find((t) => t.id === id);
    if (!tpl) return;
    setSubject(tpl.subject || '');
    setBody(tpl.body || '');
  };

  const saveCurrentAsTemplate = () => {
    const name = templateName.trim();
    if (!name) return;
    const next = [
      ...templates.filter((t) => t.name !== name),
      { id: `${Date.now()}`, name, subject, body, savedAt: new Date().toISOString() },
    ];
    setTemplates(next);
    saveTemplates(next);
    setSavingAs(false);
    setTemplateName('');
  };

  const removeTemplate = (id) => {
    const next = templates.filter((t) => t.id !== id);
    setTemplates(next);
    saveTemplates(next);
  };

  const renderedBody = useMemo(() => renderBody(body), [body]);
  const hasContent = subject.trim() && body.trim();

  const send = async () => {
    setSending(true);
    setResult(null);
    try {
      const res = await api.post('/newsletter-send', {
        subject: subject.trim(),
        html: renderedBody,
      });
      setResult({ ok: true, ...res.data });
      setConfirming(false);
    } catch (err) {
      setResult({ ok: false, error: err.response?.data?.error || err.message });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-5 max-w-5xl pb-20">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-navy">Newsletter</h1>
          <p className="mt-1 text-sm text-brand-slate">
            সব subscriber-কে একসাথে email পাঠান। Recipient-রা একে-অন্যকে দেখতে পাবে না (BCC)।
          </p>
        </div>
        <div className="rounded-xl border border-brand-tealLight/40 bg-white px-4 py-3 text-center shadow-sm">
          <p className="text-[10px] font-bold uppercase text-brand-slate">Subscribers</p>
          <p className="text-2xl font-extrabold text-brand-navy">{subscribers}</p>
        </div>
      </div>

      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-xs text-blue-900 leading-relaxed">
        💡 <strong>Tips:</strong>
        <ul className="mt-1.5 list-disc space-y-1 pl-5">
          <li><strong>Bold:</strong> দুটো star দিয়ে wrap — <code className="bg-white px-1">**important**</code> → <strong>important</strong></li>
          <li><strong>Link:</strong> <code className="bg-white px-1">[text](https://url)</code></li>
          <li><strong>Paragraph break:</strong> দুটো line break (Enter দু'বার)</li>
          <li>Send-এর আগে preview দেখুন — recipient ঠিক এটাই দেখবে।</li>
        </ul>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="space-y-4 rounded-xl border border-brand-tealLight/40 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wide text-brand-navy">Compose</h2>
            <div className="flex items-center gap-2">
              {templates.length > 0 && (
                <select
                  defaultValue=""
                  onChange={(e) => {
                    applyTemplate(e.target.value);
                    e.target.value = '';
                  }}
                  className="rounded-md border border-brand-tealLight/60 bg-white px-2 py-1 text-xs text-brand-navy focus:border-brand-teal focus:outline-none"
                >
                  <option value="">📂 Load template…</option>
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              )}
              <button
                type="button"
                onClick={() => setSavingAs(true)}
                disabled={!subject.trim() && !body.trim()}
                className="rounded-md border border-brand-navy bg-white px-2 py-1 text-xs font-semibold text-brand-navy hover:bg-brand-tealLight/10 disabled:opacity-40"
              >
                💾 Save as template
              </button>
            </div>
          </div>
          {templates.length > 0 && (
            <details className="rounded-md bg-brand-tealLight/5 p-2">
              <summary className="cursor-pointer text-xs font-semibold text-brand-slate">
                Saved templates ({templates.length})
              </summary>
              <ul className="mt-2 space-y-1">
                {templates.map((t) => (
                  <li key={t.id} className="flex items-center justify-between gap-2 rounded bg-white px-2 py-1 text-xs">
                    <span className="truncate font-medium text-brand-navy">{t.name}</span>
                    <button
                      type="button"
                      onClick={() => removeTemplate(t.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            </details>
          )}
          <div>
            <label className={labelClass}>Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="যেমন: জুলাই intake-এর জন্য নতুন partner-school open হলো"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Body</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={14}
              placeholder={`আসসালামু আলাইকুম,\n\nএই সপ্তাহের update — **৩টা নতুন partner school** join করেছে...\n\n[বিস্তারিত পড়ুন](https://inochieducation.com/blog)\n\nধন্যবাদ,\nInochi Team`}
              className={inputClass + ' font-mono text-xs leading-relaxed'}
            />
            <p className="mt-1 text-[11px] text-brand-slate/70">
              {body.length} characters
            </p>
          </div>
          <button
            type="button"
            onClick={() => setConfirming(true)}
            disabled={!hasContent || subscribers === 0}
            className="inline-flex items-center gap-2 rounded-md bg-brand-teal px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-navy disabled:cursor-not-allowed disabled:opacity-50"
          >
            ✉ Review &amp; Send to {subscribers} subscriber{subscribers !== 1 ? 's' : ''}
          </button>
        </div>

        <div className="rounded-xl border border-brand-tealLight/40 bg-white shadow-sm overflow-hidden">
          <h2 className="border-b border-brand-tealLight/40 px-5 py-3 text-sm font-bold uppercase tracking-wide text-brand-navy">
            Email preview
          </h2>
          <div className="bg-brand-tealLight/5 p-4">
            <div className="rounded-lg border border-brand-tealLight/40 bg-white p-5 text-sm">
              <p className="text-[11px] text-brand-slate">
                <strong>Subject:</strong> {subject || <em className="text-brand-slate/50">(empty)</em>}
              </p>
              <hr className="my-3 border-brand-tealLight/40" />
              {renderedBody ? (
                <div
                  className="prose prose-sm max-w-none text-brand-navy"
                  dangerouslySetInnerHTML={{ __html: renderedBody }}
                />
              ) : (
                <p className="text-brand-slate/50 italic text-xs">Body লেখা শুরু করুন…</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {savingAs && (
        <SaveTemplateModal
          name={templateName}
          setName={setTemplateName}
          onCancel={() => {
            setSavingAs(false);
            setTemplateName('');
          }}
          onSave={saveCurrentAsTemplate}
        />
      )}

      {confirming && (
        <ConfirmModal
          subscribers={subscribers}
          subject={subject}
          sending={sending}
          onCancel={() => !sending && setConfirming(false)}
          onConfirm={send}
        />
      )}

      {result && (
        <div
          className={`rounded-xl border-2 p-5 ${
            result.ok ? 'border-emerald-300 bg-emerald-50' : 'border-red-300 bg-red-50'
          }`}
        >
          {result.ok ? (
            <>
              <h3 className="font-bold text-emerald-900">✓ Newsletter পাঠানো হয়েছে</h3>
              <p className="mt-1 text-sm text-emerald-800">
                {result.sent} জনের কাছে delivered
                {result.failed > 0 ? `, ${result.failed} জনে fail` : ''}.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSubject('');
                  setBody('');
                  setResult(null);
                }}
                className="mt-3 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
              >
                নতুন campaign
              </button>
            </>
          ) : (
            <>
              <h3 className="font-bold text-red-900">✗ পাঠানো যায়নি</h3>
              <p className="mt-1 text-sm text-red-800">{result.error || 'Server error'}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// EN: Save-template prompt — reuses the same modal shell as the send confirm.
//     Pre-fills name with current subject so admin doesn't have to re-type.
// BN: Save-template prompt — send confirm-এর মতই modal shell। Current subject
//     দিয়ে name pre-fill — admin আবার লিখতে হয় না।
function SaveTemplateModal({ name, setName, onCancel, onSave }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onCancel}>
      <div
        className="max-w-md w-full rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-brand-navy">Template-এর নাম দিন</h2>
        <p className="mt-2 text-sm text-brand-slate">
          এই subject + body next time-এ load করতে পারবেন। একই নামে save করলে আগেরটা overwrite হবে।
        </p>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="যেমন: Monthly digest"
          autoFocus
          className="mt-4 w-full rounded-md border border-brand-tealLight/60 bg-white px-3 py-2 text-sm focus:border-brand-teal focus:outline-none focus:ring-2 focus:ring-brand-teal/40"
        />
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-brand-navy px-4 py-2 text-sm font-semibold text-brand-navy hover:bg-brand-tealLight/10"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={!name.trim()}
            className="rounded-md bg-brand-teal px-5 py-2 text-sm font-bold text-white hover:bg-brand-navy disabled:opacity-50"
          >
            💾 Save
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmModal({ subscribers, subject, sending, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onCancel}>
      <div
        className="max-w-md w-full rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-brand-navy">নিশ্চিত আছেন?</h2>
        <p className="mt-2 text-sm text-brand-slate leading-relaxed">
          এই campaign <strong>{subscribers}</strong> জন subscriber-এর কাছে এখনই পাঠানো হবে। একবার পাঠালে আর undo হবে না।
        </p>
        <div className="mt-3 rounded-lg bg-brand-tealLight/10 p-3">
          <p className="text-[11px] font-bold uppercase text-brand-slate">Subject</p>
          <p className="mt-0.5 text-sm font-semibold text-brand-navy">{subject}</p>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={sending}
            className="rounded-md border border-brand-navy px-4 py-2 text-sm font-semibold text-brand-navy hover:bg-brand-tealLight/10 disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={sending}
            className="rounded-md bg-brand-teal px-5 py-2 text-sm font-bold text-white hover:bg-brand-navy disabled:opacity-50"
          >
            {sending ? 'Sending…' : `✓ Send to ${subscribers}`}
          </button>
        </div>
      </div>
    </div>
  );
}
