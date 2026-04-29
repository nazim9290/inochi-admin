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

export default function Newsletter() {
  const api = axiosInterceptor();
  const [subscribers, setSubscribers] = useState(0);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    api
      .get('/subscriber')
      .then((res) => setSubscribers((res.data?.subscribers || []).length))
      .catch(() => setSubscribers(0));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          <h2 className="text-sm font-bold uppercase tracking-wide text-brand-navy">Compose</h2>
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
