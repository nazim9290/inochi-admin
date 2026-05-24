/**
 * EN: Send Email — compose + send outreach to the school directory.
 *     Flow enforced by the UI:
 *       1. Pick recipients (a group / a single address / selected schools /
 *          the whole directory).
 *       2. Write subject + HTML body (live preview on the right). Tokens like
 *          {{school}} {{name}} {{city}} are filled per recipient.
 *       3. Send a TEST mail to one address and eyeball it.
 *       4. Tick "I checked the test" — only then is the real Send enabled.
 *     All replies go to inochiedu@gmail.com (Reply-To), shown read-only.
 * BN: Send Email — school directory-তে outreach compose + send। UI যে flow
 *     বাধ্য করে:
 *       ১. প্রাপক বাছুন (একটা group / একটা ঠিকানা / বাছাই করা স্কুল / পুরো
 *          directory)।
 *       ২. Subject + HTML body লিখুন (ডানে live preview)। {{school}} {{name}}
 *          {{city}} টোকেন প্রতি প্রাপকে ভরে যায়।
 *       ৩. একটা TEST মেইল পাঠিয়ে চোখে দেখে নিন।
 *       ৪. "টেস্ট চেক করেছি" টিক দিন — তবেই আসল Send চালু হয়।
 *     সব reply যায় inochiedu@gmail.com-এ (Reply-To), read-only দেখানো।
 */

import { useEffect, useMemo, useState } from 'react';
import axiosInterceptor from '../axios/axiosInterceptor';

const inputClass =
  'w-full rounded-md border border-brand-tealLight/60 bg-white px-3 py-2.5 text-sm text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-teal/40 focus:border-brand-teal';
const labelClass = 'mb-1 block text-xs font-bold uppercase tracking-wider text-brand-navy';

const isEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(e || '').trim());

export default function EmailCompose() {
  // EN: axiosInterceptor() is a hook (useAuth + useNavigate inside) — must run
  //     at top level every render, not wrapped in useMemo (caused React #311).
  // BN: axiosInterceptor() একটা hook (ভেতরে useAuth + useNavigate) — প্রতি
  //     render-এ top level-এ চালাতে হয়, useMemo-তে নয় (React #311 হচ্ছিল)।
  const api = axiosInterceptor();

  const [groups, setGroups] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [status, setStatus] = useState({ smtpReady: true, replyTo: 'inochiedu@gmail.com', maxRecipients: 500 });

  // Compose
  const [subject, setSubject] = useState('');
  const [html, setHtml] = useState('');
  const [wrapBrand, setWrapBrand] = useState(true);

  // Recipients
  const [mode, setMode] = useState('group'); // group | single | selected | all
  const [group, setGroup] = useState('');
  const [single, setSingle] = useState({ email: '', schoolName: '', contactName: '' });
  const [selectedIds, setSelectedIds] = useState([]);

  // Test + gate
  const [testEmail, setTestEmail] = useState('');
  const [testing, setTesting] = useState(false);
  const [testSent, setTestSent] = useState(false);
  const [checked, setChecked] = useState(false);

  // Send
  const [confirming, setConfirming] = useState(false);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const [msg, setMsg] = useState(null);

  const flash = (ok, text) => {
    setMsg({ ok, text });
    setTimeout(() => setMsg(null), 5000);
  };

  useEffect(() => {
    Promise.all([
      api.get('/email-groups').catch(() => ({ data: { groups: [] } })),
      api.get('/school-contacts').catch(() => ({ data: { contacts: [] } })),
      api.get('/email-outreach/status').catch(() => ({ data: {} })),
    ]).then(([g, c, s]) => {
      setGroups(g.data?.groups || []);
      setContacts(c.data?.contacts || []);
      if (s.data?.replyTo) {
        setStatus(s.data);
        setTestEmail(s.data.replyTo);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // EN: Editing the message / recipients invalidates a prior test.
  // BN: message / প্রাপক বদলালে আগের test বাতিল।
  useEffect(() => {
    setTestSent(false);
    setChecked(false);
  }, [subject, html, wrapBrand, mode, group, selectedIds, single.email]);

  const activeContacts = useMemo(() => contacts.filter((c) => c.active !== false), [contacts]);

  // EN: Resolve the live recipient list for the current mode (for count + sample).
  // BN: বর্তমান mode-এর জন্য live প্রাপক তালিকা (count + sample-এর জন্য)।
  const recipients = useMemo(() => {
    if (mode === 'single') return isEmail(single.email) ? [{ ...single, email: single.email.trim() }] : [];
    if (mode === 'all') return activeContacts;
    if (mode === 'group') return group ? activeContacts.filter((c) => (c.groups || []).includes(group)) : [];
    if (mode === 'selected') return activeContacts.filter((c) => selectedIds.includes(c.id));
    return [];
  }, [mode, single, group, selectedIds, activeContacts]);

  const recipientCount = recipients.length;
  const sample = recipients[0] || null;
  const hasContent = subject.trim() && html.trim();

  const sendPayload = () => {
    const base = { subject: subject.trim(), html, mode, wrapBrand };
    if (mode === 'group') base.group = group;
    if (mode === 'selected') base.contactIds = selectedIds;
    if (mode === 'single') {
      base.email = single.email.trim();
      base.schoolName = single.schoolName;
      base.contactName = single.contactName;
    }
    return base;
  };

  const sendTest = async () => {
    if (!hasContent) return flash(false, 'Subject ও body লিখুন');
    if (!isEmail(testEmail)) return flash(false, 'সঠিক test email দিন');
    setTesting(true);
    try {
      await api.post('/email-outreach/test', {
        subject: subject.trim(),
        html,
        testEmail: testEmail.trim(),
        wrapBrand,
        sample: sample ? { schoolName: sample.schoolName, contactName: sample.contactName, city: sample.city } : undefined,
      });
      setTestSent(true);
      flash(true, `টেস্ট মেইল পাঠানো হয়েছে → ${testEmail}. আপনার inbox চেক করুন।`);
    } catch (err) {
      flash(false, err.response?.data?.error || 'টেস্ট পাঠানো যায়নি');
    } finally {
      setTesting(false);
    }
  };

  const doSend = async () => {
    setSending(true);
    setResult(null);
    try {
      const res = await api.post('/email-outreach/send', sendPayload());
      setResult({ ok: true, ...res.data });
      setConfirming(false);
      setTestSent(false);
      setChecked(false);
    } catch (err) {
      setResult({ ok: false, error: err.response?.data?.error || err.message });
      setConfirming(false);
    } finally {
      setSending(false);
    }
  };

  const canSend = hasContent && recipientCount > 0 && testSent && checked;

  const toggleSelected = (id) =>
    setSelectedIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));

  return (
    <div className="space-y-5 max-w-6xl pb-28">
      <div>
        <h1 className="text-2xl font-extrabold text-brand-navy">Send Email</h1>
        <p className="mt-1 text-sm text-brand-slate">
          পরিচিত স্কুলগুলোতে মেইল পাঠান — গ্রুপে, একজনকে, বা বেছে নেওয়া কয়েকটিতে। প্রতিজন আলাদা মেইল পাবে।
          সব reply আসবে <strong>{status.replyTo}</strong>-এ।
        </p>
      </div>

      {!status.smtpReady && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-2.5 text-sm text-amber-800">
          ⚠ Server-এ SMTP কনফিগার করা নেই — মেইল পাঠানো যাবে না। ব্যাকএন্ড .env-এ SMTP_* সেট করতে হবে।
        </div>
      )}
      {msg && (
        <div className={`rounded-lg border px-4 py-2.5 text-sm ${msg.ok ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-red-300 bg-red-50 text-red-800'}`}>
          {msg.ok ? '✓ ' : '✗ '}{msg.text}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* LEFT: recipients + compose */}
        <div className="space-y-5">
          {/* Recipients */}
          <section className="rounded-xl border border-brand-tealLight/40 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wide text-brand-navy">প্রাপক (Recipients)</h2>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
              {[
                { v: 'group', label: 'গ্রুপ' },
                { v: 'single', label: 'একজন' },
                { v: 'selected', label: 'বেছে নেওয়া' },
                { v: 'all', label: 'পুরো তালিকা' },
              ].map((o) => (
                <label key={o.v} className={`cursor-pointer rounded-lg border px-3 py-2 text-center text-xs font-semibold ${mode === o.v ? 'border-brand-teal bg-brand-teal text-white' : 'border-brand-tealLight/60 bg-white text-brand-navy'}`}>
                  <input type="radio" name="mode" className="hidden" checked={mode === o.v} onChange={() => setMode(o.v)} />
                  {o.label}
                </label>
              ))}
            </div>

            {mode === 'group' && (
              <div className="mt-3">
                <label className={labelClass}>গ্রুপ বাছুন</label>
                <select value={group} onChange={(e) => setGroup(e.target.value)} className={inputClass}>
                  <option value="">— গ্রুপ —</option>
                  {groups.map((g) => <option key={g.id} value={g.name}>{g.name} ({g.memberCount})</option>)}
                </select>
                {/* EN: Guide the (non-technical) admin: groups are created on the
                        Directory tab, not here. BN: গ্রুপ তৈরি হয় ডিরেক্টরি ট্যাবে। */}
                {groups.length === 0 && (
                  <p className="mt-1.5 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
                    এখনো কোনো গ্রুপ নেই। উপরে <strong>“ডিরেক্টরি”</strong> ট্যাবে গিয়ে গ্রুপ তৈরি করুন এবং স্কুলগুলোকে সেই গ্রুপে যোগ করুন — তারপর এখানে দেখা যাবে। (গ্রুপ ছাড়াও <strong>“বেছে নেওয়া”</strong> বা <strong>“পুরো তালিকা”</strong> দিয়ে পাঠাতে পারেন।)
                  </p>
                )}
              </div>
            )}

            {mode === 'single' && (
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                <div className="sm:col-span-3">
                  <label className={labelClass}>Email *</label>
                  <input value={single.email} onChange={(e) => setSingle({ ...single, email: e.target.value })} className={inputClass} placeholder="school@example.jp" />
                </div>
                <div>
                  <label className={labelClass}>স্কুলের নাম</label>
                  <input value={single.schoolName} onChange={(e) => setSingle({ ...single, schoolName: e.target.value })} className={inputClass} />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>যোগাযোগ ব্যক্তি</label>
                  <input value={single.contactName} onChange={(e) => setSingle({ ...single, contactName: e.target.value })} className={inputClass} />
                </div>
              </div>
            )}

            {mode === 'selected' && (
              <div className="mt-3 max-h-52 overflow-y-auto rounded-lg border border-brand-tealLight/40">
                {activeContacts.length === 0 && <p className="p-3 text-xs text-brand-slate/60">Directory খালি।</p>}
                {activeContacts.map((c) => (
                  <label key={c.id} className="flex cursor-pointer items-center gap-2 border-b border-brand-tealLight/20 px-3 py-1.5 text-sm hover:bg-brand-tealLight/5">
                    <input type="checkbox" checked={selectedIds.includes(c.id)} onChange={() => toggleSelected(c.id)} />
                    <span className="font-medium text-brand-navy">{c.schoolName}</span>
                    <span className="text-xs text-brand-slate/70">{c.email}</span>
                  </label>
                ))}
              </div>
            )}

            <p className="mt-3 rounded-md bg-brand-tealLight/10 px-3 py-2 text-sm text-brand-navy">
              📨 এই মেইল যাবে <strong>{recipientCount}</strong> জনের কাছে{mode === 'group' && group ? ` (গ্রুপ: ${group})` : ''}।
            </p>
          </section>

          {/* Compose */}
          <section className="rounded-xl border border-brand-tealLight/40 bg-white p-5 shadow-sm space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wide text-brand-navy">Compose</h2>
            <div>
              <label className={labelClass}>Subject</label>
              <input value={subject} onChange={(e) => setSubject(e.target.value)} className={inputClass} placeholder="যেমন: Partnership inquiry from Inochi Global Education" />
            </div>
            <div>
              <label className={labelClass}>Body (HTML)</label>
              <textarea
                value={html}
                onChange={(e) => setHtml(e.target.value)}
                rows={12}
                placeholder={'<p>Dear {{name}},</p>\n<p>We are Inochi Global Education from Bangladesh. We would like to partner with {{school}}...</p>\n<p>Best regards,<br>Inochi Team</p>'}
                className={inputClass + ' font-mono text-xs leading-relaxed'}
              />
            </div>
            <div className="rounded-md bg-blue-50 px-3 py-2 text-[11px] text-blue-900">
              টোকেন (প্রতিজনের তথ্য বসবে): <code className="bg-white px-1">{'{{school}}'}</code> <code className="bg-white px-1">{'{{name}}'}</code> <code className="bg-white px-1">{'{{city}}'}</code> <code className="bg-white px-1">{'{{email}}'}</code>
            </div>
            <label className="flex items-center gap-2 text-sm text-brand-navy">
              <input type="checkbox" checked={wrapBrand} onChange={(e) => setWrapBrand(e.target.checked)} />
              Inochi branded header/footer যোগ করুন
            </label>
            <div className="rounded-md bg-gray-50 px-3 py-2 text-xs text-brand-slate">
              <strong>Reply-To:</strong> {status.replyTo} <span className="text-brand-slate/60">(সব উত্তর এখানে আসবে — পরিবর্তনযোগ্য নয়)</span>
            </div>
          </section>

          {/* Test + Send */}
          <section className="rounded-xl border border-brand-tealLight/40 bg-white p-5 shadow-sm space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wide text-brand-navy">টেস্ট ও পাঠান</h2>
            <div className="flex flex-wrap items-end gap-2">
              <div className="flex-1 min-w-[200px]">
                <label className={labelClass}>টেস্ট মেইল কোথায় পাঠাবো?</label>
                <input value={testEmail} onChange={(e) => setTestEmail(e.target.value)} className={inputClass} />
              </div>
              <button type="button" onClick={sendTest} disabled={testing || !hasContent} className="rounded-md border-2 border-brand-teal bg-white px-4 py-2.5 text-sm font-bold text-brand-teal hover:bg-brand-tealLight/10 disabled:opacity-40">
                {testing ? 'পাঠানো হচ্ছে…' : '১ম: টেস্ট পাঠান'}
              </button>
            </div>

            {testSent && (
              <label className="flex items-start gap-2 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
                <input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} className="mt-0.5" />
                <span>টেস্ট মেইলটি ইনবক্সে দেখেছি এবং সব ঠিক আছে — এবার আসল প্রাপকদের পাঠাতে চাই।</span>
              </label>
            )}

            <button
              type="button"
              onClick={() => setConfirming(true)}
              disabled={!canSend}
              className="w-full rounded-md bg-brand-teal px-5 py-3 text-sm font-bold text-white hover:bg-brand-navy disabled:cursor-not-allowed disabled:opacity-50"
            >
              {testSent ? '' : '🔒 '}২য়: {recipientCount} জনকে পাঠান
            </button>
            {!testSent && hasContent && (
              <p className="text-center text-xs text-brand-slate/70">আগে একটা টেস্ট মেইল পাঠিয়ে চেক করুন — তারপর এই বাটন চালু হবে।</p>
            )}
          </section>
        </div>

        {/* RIGHT: preview */}
        <div className="lg:sticky lg:top-4 lg:self-start">
          <section className="rounded-xl border border-brand-tealLight/40 bg-white shadow-sm overflow-hidden">
            <h2 className="border-b border-brand-tealLight/40 px-5 py-3 text-sm font-bold uppercase tracking-wide text-brand-navy">
              Preview {sample ? `(নমুনা: ${sample.schoolName || sample.email})` : ''}
            </h2>
            <div className="bg-brand-tealLight/5 p-4">
              <div className="rounded-lg border border-brand-tealLight/40 bg-white p-5 text-sm">
                <p className="text-[11px] text-brand-slate">
                  <strong>Subject:</strong> {renderPreview(subject, sample) || <em className="text-brand-slate/50">(empty)</em>}
                </p>
                <hr className="my-3 border-brand-tealLight/40" />
                {html.trim() ? (
                  <div className="prose prose-sm max-w-none text-brand-navy" dangerouslySetInnerHTML={{ __html: renderPreview(html, sample) }} />
                ) : (
                  <p className="text-brand-slate/50 italic text-xs">Body লিখলে এখানে দেখা যাবে…</p>
                )}
              </div>
              {wrapBrand && <p className="mt-2 text-center text-[11px] text-brand-slate/60">+ উপরে Inochi navy header ও নিচে footer যোগ হবে।</p>}
            </div>
          </section>

          {result && (
            <div className={`mt-4 rounded-xl border-2 p-5 ${result.ok ? 'border-emerald-300 bg-emerald-50' : 'border-red-300 bg-red-50'}`}>
              {result.ok ? (
                <>
                  <h3 className="font-bold text-emerald-900">✓ পাঠানো সম্পন্ন</h3>
                  <p className="mt-1 text-sm text-emerald-800">
                    {result.sent} / {result.total} জনে delivered{result.failed > 0 ? `, ${result.failed} জনে fail` : ''}.
                  </p>
                  {result.failed > 0 && (
                    <details className="mt-2 text-xs text-red-700">
                      <summary className="cursor-pointer">যেগুলো fail করেছে</summary>
                      <ul className="mt-1 list-disc pl-5">
                        {(result.failedEmails || []).map((f) => <li key={f.email}>{f.email} — {f.reason}</li>)}
                      </ul>
                    </details>
                  )}
                </>
              ) : (
                <>
                  <h3 className="font-bold text-red-900">✗ পাঠানো যায়নি</h3>
                  <p className="mt-1 text-sm text-red-800">{result.error}</p>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {confirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => !sending && setConfirming(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-brand-navy">নিশ্চিত আছেন?</h2>
            <p className="mt-2 text-sm text-brand-slate leading-relaxed">
              এই মেইল এখনই <strong>{recipientCount}</strong> জন প্রাপকের কাছে আলাদা আলাদা ভাবে পাঠানো হবে। একবার পাঠালে আর ফেরানো যাবে না।
            </p>
            <div className="mt-3 rounded-lg bg-brand-tealLight/10 p-3">
              <p className="text-[11px] font-bold uppercase text-brand-slate">Subject</p>
              <p className="mt-0.5 text-sm font-semibold text-brand-navy">{subject}</p>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => !sending && setConfirming(false)} disabled={sending} className="rounded-md border border-brand-navy px-4 py-2 text-sm font-semibold text-brand-navy hover:bg-brand-tealLight/10 disabled:opacity-40">
                বাতিল
              </button>
              <button type="button" onClick={doSend} disabled={sending} className="rounded-md bg-brand-teal px-5 py-2 text-sm font-bold text-white hover:bg-brand-navy disabled:opacity-50">
                {sending ? 'পাঠানো হচ্ছে…' : `✓ ${recipientCount} জনকে পাঠান`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// EN: Client-side token preview — mirrors the server's personalize() so the
//     admin sees roughly what a recipient gets. Uses the sample (first
//     recipient) or generic placeholders.
// BN: Client-side token preview — server-এর personalize()-এর মতো, admin
//     মোটামুটি দেখতে পায় প্রাপক কী পাবে। sample (প্রথম প্রাপক) বা generic
//     placeholder ব্যবহার করে।
function renderPreview(text, sample) {
  if (!text) return '';
  const c = {
    school: sample?.schoolName || 'Sample School',
    name: sample?.contactName || sample?.schoolName || 'Sample School',
    city: sample?.city || '—',
    email: sample?.email || 'school@example.com',
  };
  return String(text).replace(/\{\{\s*([a-zA-Z]+)\s*\}\}/g, (m, key) => {
    const k = key.toLowerCase();
    if (k === 'school' || k === 'schoolname') return c.school;
    if (k === 'name' || k === 'contactname') return c.name;
    if (k === 'city') return c.city;
    if (k === 'email') return c.email;
    return m;
  });
}
