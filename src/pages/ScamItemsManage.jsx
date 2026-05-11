/**
 * EN: Anti-scam admin — CRUD over ScamItem rows that drive /anti-scam.
 *     Two kinds: "redflag" (title + body warning) and "check" (title-only
 *     verification question). The kind dropdown decides which fields the
 *     form shows; controller emits the legacy { redFlags, checks } shape.
 * BN: Anti-scam admin — /anti-scam-এর ScamItem row-এর CRUD। দুই ধরনের:
 *     "redflag" (title + body সতর্কতা) এবং "check" (শুধু title verification
 *     প্রশ্ন)। Kind dropdown form-এর কোন field দেখাবে ঠিক করে; controller
 *     legacy { redFlags, checks } shape emit করে।
 */

import { useEffect, useState } from 'react';
import axiosInterceptor from '../axios/axiosInterceptor';
import BilingualField from '../components/BilingualField';
import { confirmDialog } from '../components/ConfirmDialog';

const inputClass =
  'w-full rounded-md border border-brand-tealLight/60 bg-white px-3 py-2.5 text-sm text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-teal/40 focus:border-brand-teal';
const labelClass = 'mb-1 block text-xs font-bold uppercase tracking-wider text-brand-navy';

const empty = {
  kind: 'redflag',
  itemKey: '',
  title: '', titleEn: '', titleJa: '',
  body: '', bodyEn: '', bodyJa: '',
  sortOrder: 0,
  published: true,
};

// EN: Seed mirrors anti-scam.json — 8 red flags + 8 verification check questions.
// BN: Seed anti-scam.json-এর mirror — ৮ red flag + ৮ verification check প্রশ্ন।
const SEED_SCAM = [
  // red flags
  { kind: 'redflag', itemKey: 'cash-only',
    title: 'রসিদ ছাড়া শুধু নগদ পেমেন্ট', titleEn: 'Cash-only payments with no receipt', titleJa: '領収書なし現金のみの支払い',
    body: 'বৈধ এজেন্সি প্রতিটি পেমেন্টে নাম্বার-যুক্ত রসিদ দেয়। যে কেউ পেপারওয়ার্ক ছাড়া নগদ চাইছে — সে অদৃশ্য হতে প্রস্তুতি নিচ্ছে।',
    bodyEn: 'Legitimate agencies issue numbered receipts for every payment. Anyone asking for cash without paperwork is preparing to disappear.',
    bodyJa: '正規エージェントはすべての支払いに番号付き領収書を発行。書類なしで現金を要求する者は逃亡準備中。',
    sortOrder: 0 },
  { kind: 'redflag', itemKey: 'guaranteed-visa',
    title: '"১০০% ভিসা গ্যারান্টি"', titleEn: '"100% visa guarantee"', titleJa: '「ビザ100%保証」',
    body: 'কোনো বৈধ এজেন্সি ভিসার গ্যারান্টি দিতে পারে না — চূড়ান্ত সিদ্ধান্ত এম্বাসির। যে এই প্রতিশ্রুতি দেয় — হয় মিথ্যাবাদী, না হয় ফেইল হলে refund দেওয়ার পরিকল্পনা নেই।',
    bodyEn: 'No legitimate agency can guarantee visa approval — final decision rests with the embassy. Anyone making this promise is either lying or planning to skip refunds when it fails.',
    sortOrder: 1 },
  { kind: 'redflag', itemKey: 'no-physical-office',
    title: 'ফিজিক্যাল অফিস নেই বা শুধু ফেসবুক', titleEn: 'No physical office or only Facebook presence',
    body: 'পেমেন্টের আগে অফিসে গিয়ে কাউন্সেলরের সাথে দেখা করতে না পারলে — সমস্যা হলে কোনো recourse নেই। সাইন করার আগে সবসময় দেখা করুন।',
    bodyEn: "If you can't walk into the office and meet a counsellor in person before paying, you have no recourse if things go wrong. Always visit before signing.",
    sortOrder: 2 },
  { kind: 'redflag', itemKey: 'fake-school-claims',
    title: 'আপনি কখনো শুনেননি এমন বিশ্ববিদ্যালয়ের প্রতিশ্রুতি', titleEn: "Promises of universities you've never heard of",
    body: 'তাদের প্রতিটি জাপানি প্রতিষ্ঠানের নাম JASSO অফিসিয়াল লিস্টে যাচাই করুন। N1 + entrance exam ছাড়া "টোকিও বিশ্ববিদ্যালয়ে সরাসরি ভর্তি" — রূপকথা।',
    bodyEn: 'Cross-check every Japanese institution they mention against the JASSO official list. "Direct admission to Tokyo University" without N1 + entrance exam is a fairy tale.',
    sortOrder: 3 },
  { kind: 'redflag', itemKey: 'rushed-signing',
    title: 'ঘণ্টা / দিনের মধ্যে সাইনের চাপ', titleEn: 'Pressure to sign within hours / days',
    body: '"শেষ আসন", "কাল ডেডলাইন", "শুক্রবার দাম বাড়বে" — এগুলো চাপ-কৌশল। আসল intake-এ মাসের পর মাস সময় থাকে। চুক্তি পড়তে ৪৮+ ঘণ্টা নিন।',
    bodyEn: '"Last seat", "deadline tomorrow", "price increases Friday" are pressure tactics. Real intakes have months of runway. Take 48+ hours to read the contract.',
    sortOrder: 4 },
  { kind: 'redflag', itemKey: 'no-japan-office',
    title: 'জাপানে ফিজিক্যাল উপস্থিতি নেই', titleEn: 'No on-the-ground presence in Japan',
    body: 'জাপানে নামার পর Narita-তে কে নিতে যাবে? কে ব্যাংক একাউন্ট খুলতে সাহায্য করবে? জাপানে operation নেই এমন এজেন্সি ভিসার পর আপনাকে একা ফেলে দেয়।',
    bodyEn: 'Once you land, who picks you up at Narita? Who helps you open a bank account? An agency without Japan operations leaves you stranded after the visa.',
    sortOrder: 5 },
  { kind: 'redflag', itemKey: 'agent-takes-visa-process',
    title: 'এজেন্সি আপনার ভিসা ফর্ম নিজে পূরণ করতে চায়', titleEn: 'Agency wants to fill your visa form for you',
    body: 'এম্বাসি ইন্টারভিউ যাচাই করে আপনি সত্যিই ফর্ম পূরণ করেছেন কি না। আপনার পক্ষে ফাইল করে এজেন্সি প্রায়ই মিথ্যা তথ্য যোগ করে — যা সম্পর্কে আপনাকে প্রশ্ন করা হবে — তাত্ক্ষণিক rejection।',
    bodyEn: "Embassy interviews check whether you actually wrote your form. Agencies that file on your behalf often add false information that you'll be questioned about — leading to instant rejection.",
    sortOrder: 6 },
  { kind: 'redflag', itemKey: 'no-refund-clause',
    title: 'লিখিত refund ধারা নেই', titleEn: 'No written refund clause',
    body: 'ভিসা reject হলে কী ফেরত আসে? সরকারি ও স্কুল ফি non-refundable, তবে এজেন্সি service fee-র জন্য স্পষ্ট, লিখিত partial-refund policy থাকা উচিত। "তখন আলোচনা করব" = জালিয়াতি।',
    bodyEn: 'If visa is rejected, what comes back? Government and school fees are non-refundable but agency service fees should have a clear, written partial-refund policy. "We\'ll talk about it then" = scam.',
    sortOrder: 7 },
  // checks
  { kind: 'check', title: 'অফিসের ঠিকানা Google Maps-এ যাচাইযোগ্য?', titleEn: 'Is the office address verifiable on Google Maps?', sortOrder: 100 },
  { kind: 'check', title: 'পেমেন্টের আগে অফিসে গিয়ে কাউন্সেলরের সাথে দেখা করতে পারেন?', titleEn: 'Can you visit and meet a counsellor in person before paying?', sortOrder: 101 },
  { kind: 'check', title: 'প্রতিটি পেমেন্টে নাম্বার-যুক্ত রসিদ আসে?', titleEn: 'Does each payment come with a numbered receipt?', sortOrder: 102 },
  { kind: 'check', title: 'এজেন্সির গভর্নমেন্ট license + BAIRA membership যাচাইযোগ্য?', titleEn: "Are the agency's government license + BAIRA membership verifiable?", sortOrder: 103 },
  { kind: 'check', title: 'লিখিত contract + refund policy দেওয়া হয়েছে?', titleEn: 'Has a written contract + refund policy been provided?', sortOrder: 104 },
  { kind: 'check', title: 'জাপানি স্কুল-গুলো JASSO অফিসিয়াল লিস্টে আছে?', titleEn: 'Are the Japanese schools on the JASSO official list?', sortOrder: 105 },
  { kind: 'check', title: 'এজেন্সির জাপান-পক্ষ অফিস বা partner আছে?', titleEn: 'Does the agency have a Japan-side office or partner?', sortOrder: 106 },
  { kind: 'check', title: 'অন্তত ২ জন alumni-এর সাথে স্বাধীনভাবে কথা বলতে পারেন?', titleEn: 'Can you talk to at least 2 alumni independently?', sortOrder: 107 },
];

export default function ScamItemsManage() {
  const api = axiosInterceptor();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/scam-items?all=true&raw=true');
      setItems(data.items || []);
    } catch (err) { console.error('Scam items list error:', err); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({
      ...p,
      [name]: type === 'checkbox' ? checked : name === 'sortOrder' ? Number(value) : value,
    }));
  };
  const reset = () => { setForm(empty); setEditingId(null); };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      // EN: Strip body fields when this is a "check" — keeps DB clean.
      // BN: "check" হলে body field খালি — DB clean রাখে।
      const payload = form.kind === 'check'
        ? { ...form, body: '', bodyEn: '', bodyJa: '' }
        : form;
      if (editingId) await api.put(`/scam-items/${editingId}`, payload);
      else await api.post('/scam-items', payload);
      reset();
      await load();
    } catch (err) { alert(err.response?.data?.error || 'Save failed'); }
    finally { setBusy(false); }
  };

  const edit = (it) => { setEditingId(it.id); setForm({ ...empty, ...it }); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  const remove = async (id) => {
    const ok = await confirmDialog({
      title: 'এই item delete?', message: '/anti-scam থেকে সরে যাবে।',
      confirmText: 'হ্যাঁ', cancelText: 'বাতিল', danger: true,
    });
    if (!ok) return;
    try { await api.delete(`/scam-items/${id}`); await load(); } catch (err) { alert('Delete failed'); }
  };

  const importSeed = async () => {
    const ok = await confirmDialog({
      title: 'Anti-scam seed import?',
      message: '৮ red flag + ৮ verification check — পুরাতন JSON থেকে seed করব।',
      confirmText: 'হ্যাঁ, import', cancelText: 'বাতিল', icon: '📥',
    });
    if (!ok) return;
    setBusy(true);
    try {
      for (const it of SEED_SCAM) {
        // eslint-disable-next-line no-await-in-loop
        await api.post('/scam-items', { ...it, published: true }).catch(() => {});
      }
      await load();
    } finally { setBusy(false); }
  };

  const isEmpty = !loading && items.length === 0;

  const redFlags = items.filter((i) => i.kind !== 'check');
  const checks = items.filter((i) => i.kind === 'check');

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-extrabold text-brand-navy">Anti-Scam সতর্কতা</h1>
        <p className="mt-1 text-sm text-brand-slate">
          /anti-scam পেজে যে red-flag সতর্কতা ও যাচাই-চেকলিস্ট দেখা যায়। নতুন scam pattern পেলে এখান থেকে যোগ করুন — দেব ছাড়াই ৬০ সেকেন্ডে live।
        </p>
      </div>

      {isEmpty && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-semibold">🛡️ এখনও কোনো scam item যোগ করা হয়নি</p>
          <p className="mt-1 leading-relaxed">এক click-এ পুরাতন ৮ red flag + ৮ verification check seed করতে পারেন।</p>
          <button type="button" onClick={importSeed} disabled={busy}
            className="mt-3 rounded bg-brand-teal px-4 py-2 text-xs font-semibold text-white hover:bg-brand-navy disabled:opacity-50">
            {busy ? 'Importing…' : 'Anti-scam seed import করুন'}
          </button>
        </div>
      )}

      <form onSubmit={submit} className="space-y-5 rounded-xl border border-brand-tealLight/40 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-bold uppercase tracking-wide text-brand-navy">{editingId ? 'Item Edit' : 'নতুন Item'}</h2>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <label>
            <span className={labelClass}>Kind</span>
            <select name="kind" value={form.kind} onChange={onChange} className={inputClass}>
              <option value="redflag">🚩 Red flag (title + ব্যাখ্যা)</option>
              <option value="check">✅ Check question (শুধু প্রশ্ন)</option>
            </select>
          </label>
          <label className="md:col-span-2">
            <span className={labelClass}>Item key (optional, deep-link-এর জন্য)</span>
            <input name="itemKey" value={form.itemKey} onChange={onChange} className={inputClass} placeholder="cash-only" />
          </label>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <label><span className={labelClass}>Title (BN)</span><input name="title" value={form.title} onChange={onChange} className={inputClass} required /></label>
          <label><span className={labelClass}>Title (EN)</span><input name="titleEn" value={form.titleEn} onChange={onChange} className={inputClass} /></label>
          <label><span className={labelClass}>タイトル (JA)</span><input name="titleJa" value={form.titleJa} onChange={onChange} className={inputClass} /></label>
        </div>

        {form.kind === 'redflag' && (
          <>
            <BilingualField label="Body (ব্যাখ্যা)" name="body" type="textarea" rows={3}
              value={form.body} valueEn={form.bodyEn} onChange={onChange}
              hint="কেন এটা red flag — ২-৩ বাক্যে।" />
            <label className="block">
              <span className={labelClass}>本文 (Japanese)</span>
              <textarea name="bodyJa" value={form.bodyJa} onChange={onChange} rows={3} className={inputClass + ' min-h-[88px]'} />
            </label>
          </>
        )}

        <div className="flex flex-wrap items-end gap-4 pt-2">
          <label><span className={labelClass}>Sort order</span><input type="number" name="sortOrder" value={form.sortOrder} onChange={onChange} className={inputClass + ' w-28'} /></label>
          <label className="flex items-center gap-2"><input type="checkbox" name="published" checked={form.published} onChange={onChange} /><span className="text-xs font-semibold text-brand-navy">Published</span></label>
        </div>

        <div className="flex gap-2 pt-2">
          <button type="submit" disabled={busy} className="rounded bg-brand-teal px-5 py-2 text-sm font-semibold text-white hover:bg-brand-navy disabled:opacity-50">
            {busy ? 'Saving…' : editingId ? 'Update' : 'Add item'}
          </button>
          {editingId && <button type="button" onClick={reset} className="rounded border border-brand-navy bg-white px-5 py-2 text-sm font-semibold text-brand-navy">Cancel</button>}
        </div>
      </form>

      {loading ? <p className="text-sm text-brand-slate">Loading…</p> : (
        <div className="space-y-6">
          {redFlags.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-red-700">🚩 Red flags ({redFlags.length})</h3>
              <ul className="space-y-2">
                {redFlags.map((it) => <ItemRow key={it.id} item={it} onEdit={edit} onDelete={remove} />)}
              </ul>
            </div>
          )}
          {checks.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-emerald-700">✅ Check questions ({checks.length})</h3>
              <ul className="space-y-2">
                {checks.map((it) => <ItemRow key={it.id} item={it} onEdit={edit} onDelete={remove} />)}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ItemRow({ item, onEdit, onDelete }) {
  return (
    <li className="flex items-start justify-between gap-3 rounded-lg border border-brand-tealLight/40 bg-white p-3 shadow-sm">
      <div className="flex-1 text-sm">
        <p className="font-semibold text-brand-navy">{item.title}</p>
        {item.titleEn && <p className="text-xs text-brand-slate/80">{item.titleEn}</p>}
        {item.body && <p className="mt-1 line-clamp-2 text-xs text-brand-slate">{item.body}</p>}
        {!item.published && <span className="mt-1 inline-block rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-700">Draft</span>}
      </div>
      <div className="flex flex-shrink-0 gap-2 text-xs font-semibold">
        <button onClick={() => onEdit(item)} className="text-brand-teal hover:text-brand-navy">Edit</button>
        <button onClick={() => onDelete(item.id)} className="text-red-500 hover:text-red-700">Delete</button>
      </div>
    </li>
  );
}
