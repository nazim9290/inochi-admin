/**
 * EN: Document Checklist admin — flat row CRUD over ChecklistItem. The
 *     public site groups items by `categoryKey` automatically. Admin
 *     edits one item at a time and assigns its category via a dropdown
 *     populated from existing categories (or types in a new key).
 * BN: Document Checklist admin — ChecklistItem-এর flat row CRUD। Public
 *     site item-গুলো `categoryKey` দিয়ে auto group করে। Admin একসাথে
 *     এক item edit করে; existing category থেকে dropdown-এ category
 *     বেছে নেয় (অথবা নতুন key টাইপ করে)।
 */

import { useEffect, useMemo, useState } from 'react';
import axiosInterceptor from '../axios/axiosInterceptor';
import BilingualField from '../components/BilingualField';
import { confirmDialog } from '../components/ConfirmDialog';

const inputClass =
  'w-full rounded-md border border-brand-tealLight/60 bg-white px-3 py-2.5 text-sm text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-teal/40 focus:border-brand-teal';
const labelClass = 'mb-1 block text-xs font-bold uppercase tracking-wider text-brand-navy';

const empty = {
  categoryKey: 'personal',
  categoryLabel: '', categoryLabelEn: '', categoryLabelJa: '',
  label: '', labelEn: '', labelJa: '',
  note: '', noteEn: '',
  groupOrder: 0, sortOrder: 0,
  published: true,
};

// EN: Seed mirrors document-checklist.json — 4 categories, ~20 items total.
// BN: Seed document-checklist.json-এর mirror — ৪ category, মোট ~২০ item।
const SEED_CHECKLIST = [
  // personal
  { categoryKey: 'personal', categoryLabel: 'ব্যক্তিগত ডকুমেন্ট', categoryLabelEn: 'Personal documents', categoryLabelJa: '個人書類',
    label: 'পাসপোর্ট (ন্যূনতম ১৮ মাস validity, ৪+ খালি পাতা)', labelEn: 'Passport (min. 18 months validity, 4+ blank pages)', labelJa: 'パスポート (有効期限18ヶ月以上、空白4ページ以上)',
    groupOrder: 0, sortOrder: 0 },
  { categoryKey: 'personal', categoryLabel: 'ব্যক্তিগত ডকুমেন্ট', categoryLabelEn: 'Personal documents',
    label: 'জন্ম সনদ (ইংরেজি অনুবাদ, notarised)', labelEn: 'Birth certificate (English translation, notarised)',
    groupOrder: 0, sortOrder: 1 },
  { categoryKey: 'personal', categoryLabel: 'ব্যক্তিগত ডকুমেন্ট', categoryLabelEn: 'Personal documents',
    label: 'জাতীয় পরিচয়পত্র (NID) — উভয় পাশ', labelEn: 'National ID card (NID) — both sides',
    groupOrder: 0, sortOrder: 2 },
  { categoryKey: 'personal', categoryLabel: 'ব্যক্তিগত ডকুমেন্ট', categoryLabelEn: 'Personal documents',
    label: '৪টি পাসপোর্ট-সাইজ ছবি (সাদা ব্যাকগ্রাউন্ড, ৪.৫ × ৪.৫ cm)', labelEn: '4 passport-size photos (white background, 4.5 × 4.5 cm)',
    groupOrder: 0, sortOrder: 3 },
  // academic
  { categoryKey: 'academic', categoryLabel: 'শিক্ষা সংক্রান্ত', categoryLabelEn: 'Academic documents', categoryLabelJa: '学歴書類',
    label: 'SSC সার্টিফিকেট + ট্রান্সক্রিপ্ট (notarised ইংরেজি কপি)', labelEn: 'SSC certificate + transcript (notarised English copy)',
    groupOrder: 1, sortOrder: 0 },
  { categoryKey: 'academic', categoryLabel: 'শিক্ষা সংক্রান্ত', categoryLabelEn: 'Academic documents',
    label: 'HSC সার্টিফিকেট + ট্রান্সক্রিপ্ট', labelEn: 'HSC certificate + transcript',
    groupOrder: 1, sortOrder: 1 },
  { categoryKey: 'academic', categoryLabel: 'শিক্ষা সংক্রান্ত', categoryLabelEn: 'Academic documents',
    label: "Bachelor's সার্টিফিকেট + ট্রান্সক্রিপ্ট (যদি প্রযোজ্য)", labelEn: "Bachelor's certificate + transcript (if applicable)",
    groupOrder: 1, sortOrder: 2 },
  { categoryKey: 'academic', categoryLabel: 'শিক্ষা সংক্রান্ত', categoryLabelEn: 'Academic documents',
    label: 'JLPT সার্টিফিকেট (N5 / N4 / উপরে)', labelEn: 'JLPT certificate (N5 / N4 / higher)',
    groupOrder: 1, sortOrder: 3 },
  { categoryKey: 'academic', categoryLabel: 'শিক্ষা সংক্রান্ত', categoryLabelEn: 'Academic documents',
    label: 'Statement of purpose (জাপানি + ইংরেজি)', labelEn: 'Statement of purpose (Japanese + English)',
    groupOrder: 1, sortOrder: 4 },
  // financial
  { categoryKey: 'financial', categoryLabel: 'আর্থিক / sponsor ডকুমেন্ট', categoryLabelEn: 'Financial / sponsor documents', categoryLabelJa: '経費・支弁者書類',
    label: 'Sponsor-এর ব্যাংক স্টেটমেন্ট (গত ১২ মাস, ব্যাংক সিল সহ)', labelEn: "Sponsor's bank statement (last 12 months, with bank seal)",
    groupOrder: 2, sortOrder: 0 },
  { categoryKey: 'financial', categoryLabel: 'আর্থিক / sponsor ডকুমেন্ট', categoryLabelEn: 'Financial / sponsor documents',
    label: 'Sponsor-এর ব্যাংক ব্যালেন্স সার্টিফিকেট (সর্বশেষ)', labelEn: "Sponsor's bank balance certificate (latest)",
    groupOrder: 2, sortOrder: 1 },
  { categoryKey: 'financial', categoryLabel: 'আর্থিক / sponsor ডকুমেন্ট', categoryLabelEn: 'Financial / sponsor documents',
    label: 'Sponsor-এর tax return (গত ২ বছর)', labelEn: "Sponsor's tax return (last 2 years)",
    groupOrder: 2, sortOrder: 2 },
  { categoryKey: 'financial', categoryLabel: 'আর্থিক / sponsor ডকুমেন্ট', categoryLabelEn: 'Financial / sponsor documents',
    label: 'Sponsor-এর NID + employment letter / ব্যবসার ডকুমেন্ট', labelEn: "Sponsor's NID + employment letter / business documents",
    groupOrder: 2, sortOrder: 3 },
  { categoryKey: 'financial', categoryLabel: 'আর্থিক / sponsor ডকুমেন্ট', categoryLabelEn: 'Financial / sponsor documents',
    label: 'আর্থিক সহায়তার affidavit (notarised)', labelEn: 'Affidavit of financial support (notarised)',
    groupOrder: 2, sortOrder: 4 },
  // japan
  { categoryKey: 'japan', categoryLabel: 'জাপান-পক্ষ ডকুমেন্ট (CoE-এর পর)', categoryLabelEn: 'Japan-side documents (after CoE)', categoryLabelJa: '日本側書類 (CoE後)',
    label: 'Certificate of Eligibility (CoE) — জাপানি স্কুল থেকে original', labelEn: 'Certificate of Eligibility (CoE) — original from Japanese school',
    groupOrder: 3, sortOrder: 0 },
  { categoryKey: 'japan', categoryLabel: 'জাপান-পক্ষ ডকুমেন্ট (CoE-এর পর)', categoryLabelEn: 'Japan-side documents (after CoE)',
    label: 'জাপানি স্কুল থেকে acceptance letter', labelEn: 'Acceptance letter from Japanese school',
    groupOrder: 3, sortOrder: 1 },
  { categoryKey: 'japan', categoryLabel: 'জাপান-পক্ষ ডকুমেন্ট (CoE-এর পর)', categoryLabelEn: 'Japan-side documents (after CoE)',
    label: 'ভিসা আবেদন ফর্ম (আবেদনকারীর হাতে লেখা)', labelEn: 'Visa application form (handwritten by applicant)',
    groupOrder: 3, sortOrder: 2 },
  { categoryKey: 'japan', categoryLabel: 'জাপান-পক্ষ ডকুমেন্ট (CoE-এর পর)', categoryLabelEn: 'Japan-side documents (after CoE)',
    label: 'Round-trip flight booking (hold-এ, paid নয়)', labelEn: 'Round-trip flight booking (held, not paid)',
    groupOrder: 3, sortOrder: 3 },
];

export default function ChecklistManage() {
  const api = axiosInterceptor();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [busy, setBusy] = useState(false);

  // EN: Existing distinct category keys — used to populate the dropdown
  //     and to auto-fill labels when admin picks an existing category.
  // BN: existing distinct category key — dropdown populate করতে এবং
  //     existing category বাছাই-এ label auto-fill করতে।
  const categoryMeta = useMemo(() => {
    const map = new Map();
    for (const it of items) {
      if (!map.has(it.categoryKey)) {
        map.set(it.categoryKey, {
          key: it.categoryKey,
          label: it.categoryLabel || '',
          labelEn: it.categoryLabelEn || '',
          labelJa: it.categoryLabelJa || '',
          groupOrder: it.groupOrder || 0,
        });
      }
    }
    return Array.from(map.values()).sort((a, b) => a.groupOrder - b.groupOrder);
  }, [items]);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/checklist?all=true&raw=true');
      setItems(data.items || []);
    } catch (err) { console.error('Checklist list error:', err); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({
      ...p,
      [name]: type === 'checkbox' ? checked : (name === 'sortOrder' || name === 'groupOrder') ? Number(value) : value,
    }));
  };

  // EN: When admin picks an existing category from dropdown, auto-fill its labels.
  // BN: Admin existing category বাছলে তার label auto-fill হয়ে যায়।
  const onPickCategory = (e) => {
    const key = e.target.value;
    const meta = categoryMeta.find((m) => m.key === key);
    setForm((p) => ({
      ...p,
      categoryKey: key,
      ...(meta ? {
        categoryLabel: meta.label,
        categoryLabelEn: meta.labelEn,
        categoryLabelJa: meta.labelJa,
        groupOrder: meta.groupOrder,
      } : {}),
    }));
  };

  const reset = () => { setForm(empty); setEditingId(null); };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (editingId) await api.put(`/checklist/${editingId}`, form);
      else await api.post('/checklist', form);
      reset();
      await load();
    } catch (err) { alert(err.response?.data?.error || 'Save failed'); }
    finally { setBusy(false); }
  };

  const edit = (it) => { setEditingId(it.id); setForm({ ...empty, ...it }); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  const remove = async (id) => {
    const ok = await confirmDialog({
      title: 'এই item delete?', message: '/document-checklist থেকে সরে যাবে।',
      confirmText: 'হ্যাঁ', cancelText: 'বাতিল', danger: true,
    });
    if (!ok) return;
    try { await api.delete(`/checklist/${id}`); await load(); } catch (err) { alert('Delete failed'); }
  };

  const importSeed = async () => {
    const ok = await confirmDialog({
      title: 'Checklist seed import?',
      message: '৪ category, ~১৯টা item — পুরাতন JSON থেকে seed করব। বিদ্যমান item-গুলো ছাড়া নতুন যোগ হবে।',
      confirmText: 'হ্যাঁ, import', cancelText: 'বাতিল', icon: '📥',
    });
    if (!ok) return;
    setBusy(true);
    try {
      for (const it of SEED_CHECKLIST) {
        // eslint-disable-next-line no-await-in-loop
        await api.post('/checklist', { ...it, published: true }).catch(() => {});
      }
      await load();
    } finally { setBusy(false); }
  };

  const isEmpty = !loading && items.length === 0;

  // EN: Group items for display — same logic the public renderer uses.
  // BN: Display-এর জন্য item group — public renderer-এর মত logic।
  const grouped = useMemo(() => {
    const map = new Map();
    for (const it of items) {
      if (!map.has(it.categoryKey)) {
        map.set(it.categoryKey, { key: it.categoryKey, label: it.categoryLabel, labelEn: it.categoryLabelEn, items: [] });
      }
      map.get(it.categoryKey).items.push(it);
    }
    return Array.from(map.values());
  }, [items]);

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-extrabold text-brand-navy">ডকুমেন্ট চেকলিস্ট</h1>
        <p className="mt-1 text-sm text-brand-slate">
          /document-checklist পেজে যে চেকলিস্ট দেখা যায়। প্রতিটা item এক row। একই category-র item একসাথে group হয়ে public-এ দেখাবে।
        </p>
      </div>

      {isEmpty && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-semibold">📑 এখনও কোনো checklist item যোগ করা হয়নি</p>
          <p className="mt-1 leading-relaxed">এক click-এ পুরাতন ৪ category, ~১৯ item (পাসপোর্ট, NID, sponsor docs, CoE …) seed করতে পারেন।</p>
          <button type="button" onClick={importSeed} disabled={busy}
            className="mt-3 rounded bg-brand-teal px-4 py-2 text-xs font-semibold text-white hover:bg-brand-navy disabled:opacity-50">
            {busy ? 'Importing…' : 'Checklist seed import করুন'}
          </button>
        </div>
      )}

      <form onSubmit={submit} className="space-y-5 rounded-xl border border-brand-tealLight/40 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-bold uppercase tracking-wide text-brand-navy">{editingId ? 'Item Edit' : 'নতুন Item'}</h2>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <label>
            <span className={labelClass}>Category (existing)</span>
            <select value={form.categoryKey} onChange={onPickCategory} className={inputClass}>
              {categoryMeta.map((m) => <option key={m.key} value={m.key}>{m.key} ({m.label || m.labelEn})</option>)}
              {!categoryMeta.find((m) => m.key === form.categoryKey) && <option value={form.categoryKey}>{form.categoryKey} (new)</option>}
            </select>
          </label>
          <label className="md:col-span-2">
            <span className={labelClass}>অথবা নতুন category key</span>
            <input name="categoryKey" value={form.categoryKey} onChange={onChange} className={inputClass} placeholder="personal / academic / financial …" />
          </label>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <label><span className={labelClass}>Category label (BN)</span><input name="categoryLabel" value={form.categoryLabel} onChange={onChange} className={inputClass} placeholder="ব্যক্তিগত ডকুমেন্ট" /></label>
          <label><span className={labelClass}>Category label (EN)</span><input name="categoryLabelEn" value={form.categoryLabelEn} onChange={onChange} className={inputClass} placeholder="Personal documents" /></label>
          <label><span className={labelClass}>カテゴリー (JA)</span><input name="categoryLabelJa" value={form.categoryLabelJa} onChange={onChange} className={inputClass} /></label>
        </div>

        <BilingualField label="Item label" name="label" type="textarea" rows={2}
          value={form.label} valueEn={form.labelEn} onChange={onChange}
          placeholderBn="পাসপোর্ট (ন্যূনতম ১৮ মাস validity)" placeholderEn="Passport (min. 18 months validity)" />
        <label className="block">
          <span className={labelClass}>項目 (Japanese)</span>
          <textarea name="labelJa" value={form.labelJa} onChange={onChange} rows={2} className={inputClass + ' min-h-[72px]'} />
        </label>

        <BilingualField label="Note (optional)" name="note" type="textarea" rows={2}
          value={form.note} valueEn={form.noteEn} onChange={onChange}
          hint="যেমন: 'জারির ৬ মাসের মধ্যে notarise'।" />

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <label><span className={labelClass}>Group order</span><input type="number" name="groupOrder" value={form.groupOrder} onChange={onChange} className={inputClass} /></label>
          <label><span className={labelClass}>Item order</span><input type="number" name="sortOrder" value={form.sortOrder} onChange={onChange} className={inputClass} /></label>
          <label className="flex items-end gap-2 pb-2 md:col-span-2"><input type="checkbox" name="published" checked={form.published} onChange={onChange} /><span className="text-xs font-semibold text-brand-navy">Published</span></label>
        </div>

        <div className="flex gap-2 pt-2">
          <button type="submit" disabled={busy} className="rounded bg-brand-teal px-5 py-2 text-sm font-semibold text-white hover:bg-brand-navy disabled:opacity-50">
            {busy ? 'Saving…' : editingId ? 'Update item' : 'Add item'}
          </button>
          {editingId && <button type="button" onClick={reset} className="rounded border border-brand-navy bg-white px-5 py-2 text-sm font-semibold text-brand-navy">Cancel</button>}
        </div>
      </form>

      {loading ? <p className="text-sm text-brand-slate">Loading…</p> : (
        <div className="space-y-6">
          {grouped.map((g) => (
            <div key={g.key}>
              <h3 className="text-sm font-bold uppercase tracking-wider text-brand-navy">{g.label || g.labelEn || g.key}</h3>
              <ul className="mt-2 space-y-2">
                {g.items.map((it) => (
                  <li key={it.id} className="flex items-start justify-between gap-3 rounded-lg border border-brand-tealLight/40 bg-white p-3 shadow-sm">
                    <div className="flex-1 text-sm">
                      <p className="text-brand-navy">{it.label}</p>
                      {it.labelEn && <p className="text-xs text-brand-slate/80">{it.labelEn}</p>}
                      {!it.published && <span className="mt-1 inline-block rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-700">Draft</span>}
                    </div>
                    <div className="flex flex-shrink-0 gap-2 text-xs font-semibold">
                      <button onClick={() => edit(it)} className="text-brand-teal hover:text-brand-navy">Edit</button>
                      <button onClick={() => remove(it.id)} className="text-red-500 hover:text-red-700">Delete</button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
