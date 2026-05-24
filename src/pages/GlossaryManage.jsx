/**
 * EN: Glossary admin — CRUD over the GlossaryTerm table that powers
 *     /glossary. Each term has a key (slug), canonical term + optional
 *     Japanese, a fixed category, and a definition in Bangla/English/Japanese.
 *     A one-click seed imports the bundled starter glossary so the admin can
 *     edit existing terms instead of retyping them.
 * BN: Glossary admin — /glossary-কে চালানো GlossaryTerm table-এর CRUD।
 *     প্রতিটা term-এর key (slug), canonical term + optional Japanese, fixed
 *     category, এবং Bangla/English/Japanese সংজ্ঞা। এক-ক্লিক seed bundled
 *     starter glossary import করে — admin বিদ্যমান term edit করতে পারে,
 *     নতুন করে টাইপ না করে।
 */

import { useEffect, useState } from 'react';
import axiosInterceptor from '../axios/axiosInterceptor';
import { confirmDialog } from '../components/ConfirmDialog';

const inputClass =
  'w-full rounded-md border border-brand-tealLight/60 bg-white px-3 py-2.5 text-sm text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-teal/40 focus:border-brand-teal';
const labelClass = 'mb-1 block text-xs font-bold uppercase tracking-wider text-brand-navy';

const CATEGORIES = [
  { key: 'visa', label: 'ভিসা ও ইমিগ্রেশন' },
  { key: 'test', label: 'পরীক্ষা' },
  { key: 'school', label: 'স্কুল' },
  { key: 'scholarship', label: 'বৃত্তি' },
  { key: 'life', label: 'দৈনন্দিন জীবন' },
  { key: 'inochi', label: 'Inochi-নির্দিষ্ট' },
];

const empty = { id: null, termKey: '', term: '', termJa: '', category: 'visa', bn: '', en: '', ja: '', sortOrder: 0, published: true };

// EN: Starter glossary (mirrors the bundled frontend seed). Imported on demand.
// BN: Starter glossary (frontend bundled seed-এর mirror)। চাইলে import হয়।
const SEED = [
  { termKey: 'coe', term: 'COE', termJa: '在留資格認定証明書', category: 'visa', en: "Certificate of Eligibility — issued by Japan Immigration before a student visa can be applied for. The Japanese language school files for it after admission. Typical processing: 2–3 months.", bn: 'Certificate of Eligibility — student visa-র আবেদনের আগে জাপান ইমিগ্রেশন ইস্যু করে। ভর্তির পর ভাষা স্কুল আবেদন করে। সাধারণত ২-৩ মাস।', ja: '在留資格認定証明書 — 学生ビザ申請の前に日本の入国管理局が発行。通常2〜3ヶ月。' },
  { termKey: 'student-visa', term: 'Student Visa (Ryugaku)', termJa: '留学ビザ', category: 'visa', en: 'Long-term residence status for students. Allows part-time work up to 28 hours/week with a separate work permit.', bn: 'ছাত্রদের জন্য long-term residence status। আলাদা work permit-এ সপ্তাহে ২৮ ঘণ্টা part-time কাজ।', ja: '留学ビザ — 学生の長期在留資格。資格外活動許可で週28時間までアルバイト可能。' },
  { termKey: 'zairyu-card', term: 'Zairyū Card', termJa: '在留カード', category: 'visa', en: 'Residence Card — issued at the airport on first arrival. Carry it at all times; used for bank, mobile, apartment.', bn: 'Residence Card — প্রথম পৌঁছানোয় airport-এ ইস্যু। সবসময় বহন করতে হয়; ব্যাংক, মোবাইল, বাসা সব কাজে।', ja: '在留カード — 到着空港で発行。常時携帯義務。銀行・携帯・アパート全てで使用。' },
  { termKey: 'jlpt', term: 'JLPT', termJa: '日本語能力試験', category: 'test', en: 'Japanese Language Proficiency Test — N5 (beginner) to N1 (near-native). N4–N5 for language school; N2–N1 for university/work.', bn: 'Japanese Language Proficiency Test — N5 থেকে N1। ভাষা-স্কুলে N4-N5; বিশ্ববিদ্যালয়/চাকরিতে N2-N1।', ja: '日本語能力試験 — N5〜N1。日本語学校はN4〜N5、大学・就職はN2〜N1。' },
  { termKey: 'eju', term: 'EJU', termJa: '日本留学試験', category: 'test', en: 'Examination for Japanese University Admission — tests Japanese, math, science, and Japan & World subjects.', bn: 'Examination for Japanese University Admission — জাপানি ভাষা, গণিত, বিজ্ঞান, জাপান ও বিশ্ব বিষয়ে পরীক্ষা।', ja: '日本留学試験 — 日本語、数学、理科、総合科目を出題。' },
  { termKey: 'nat-test', term: 'NAT-TEST / J.TEST', termJa: 'NAT試験 / J.TEST', category: 'test', en: 'Alternative Japanese proficiency tests, held more frequently than JLPT.', bn: 'Alternative জাপানি proficiency test — JLPT-এর চেয়ে বেশি বার অনুষ্ঠিত।', ja: 'NAT試験 / J.TEST — JLPTより頻繁に実施される代替試験。' },
  { termKey: 'nihongo-gakko', term: 'Nihongo Gakkō', termJa: '日本語学校', category: 'school', en: 'Japanese language school. Most international students study here 1–2 years before moving on.', bn: 'জাপানি ভাষা-স্কুল। বেশিরভাগ ছাত্র এখানে ১-২ বছর পড়ে এগোয়।', ja: '日本語学校 — 多くの留学生が1〜2年学ぶ。' },
  { termKey: 'senmon-gakko', term: 'Senmon Gakkō', termJa: '専門学校', category: 'school', en: 'Vocational/specialty school. 2-year practical programs, strong job-placement focus.', bn: 'Vocational স্কুল। ২ বছরের ব্যবহারিক প্রোগ্রাম, চাকরি-প্রাপ্তিতে strong focus।', ja: '専門学校 — 2年制実践課程、就職志向。' },
  { termKey: 'daigaku', term: 'Daigaku (University)', termJa: '大学', category: 'school', en: 'Japanese university. Requires JLPT N2+ and usually EJU.', bn: 'জাপানি বিশ্ববিদ্যালয়। JLPT N2+ ও সাধারণত EJU দরকার।', ja: '大学 — JLPT N2以上とEJUが必要。' },
  { termKey: 'mext', term: 'MEXT Scholarship', termJa: '文部科学省奨学金', category: 'scholarship', en: 'Government of Japan scholarship — full tuition + living stipend. Applications via the Japanese Embassy in Dhaka.', bn: 'জাপান সরকারের scholarship — full tuition + living stipend। ঢাকার দূতাবাসের মাধ্যমে আবেদন।', ja: '文部科学省奨学金 — 学費全額＋生活費。ダッカの日本大使館経由で申請。' },
  { termKey: 'jasso', term: 'JASSO Scholarship', termJa: 'JASSO奨学金', category: 'scholarship', en: 'JASSO stipend ¥48,000–¥80,000/month for privately-funded students, awarded by your school after enrollment.', bn: 'JASSO stipend ¥48,000-¥80,000/মাস — privately-funded ছাত্রদের, ভর্তির পর স্কুল দেয়।', ja: 'JASSO奨学金 — 私費生向け月¥48,000〜¥80,000、入学後に学校が推薦。' },
  { termKey: 'hanko', term: 'Hanko / Inkan', termJa: '印鑑', category: 'life', en: 'Personal seal used in place of a signature on Japanese paperwork.', bn: 'ব্যক্তিগত seal — জাপানি কাগজে signature-এর বদলে ব্যবহৃত।', ja: '印鑑 — 書類でサインの代わりに使う個人の印章。' },
  { termKey: 'kokuho', term: 'Kokumin Kenkō Hoken', termJa: '国民健康保険', category: 'life', en: "Japan's National Health Insurance — mandatory for 3+ month residents; covers 70% of medical costs.", bn: 'জাতীয় স্বাস্থ্য বীমা — ৩+ মাস থাকলে বাধ্যতামূলক; চিকিৎসা খরচের ৭০% covers।', ja: '国民健康保険 — 3か月以上の居住者に義務。医療費の70%を補償。' },
  { termKey: 'arubaito', term: 'Arubaito (Part-time)', termJa: 'アルバイト', category: 'life', en: 'Part-time work — up to 28 hours/week (40 during long breaks) with the airport activity permit.', bn: 'Part-time কাজ — সপ্তাহে ২৮ ঘণ্টা (long break-এ ৪০) — airport-এর activity permit সহ।', ja: 'アルバイト — 週28時間（長期休暇中40時間）まで、資格外活動許可が必要。' },
  { termKey: 'gakuwari', term: 'Student Discount', termJa: '学生割引', category: 'life', en: 'Student discount on JR trains, Shinkansen, museums, mobile plans with a valid student ID.', bn: 'ছাত্র discount — JR train, shinkansen, museum, mobile plan-এ student ID দিয়ে।', ja: '学生割引 — 学生証でJR・新幹線・博物館・携帯などが割引。' },
  { termKey: 'intake', term: 'Intake (Apr/Jul/Oct/Jan)', termJa: '入学時期', category: 'inochi', en: 'Language schools take new students 4 times a year — April (largest), July, October, January.', bn: 'ভাষা-স্কুল বছরে ৪ বার ভর্তি নেয় — এপ্রিল (সবচেয়ে বড়), জুলাই, অক্টোবর, জানুয়ারি।', ja: '入学時期 — 年4回（4月が最大、7月、10月、1月）。' },
];

export default function GlossaryManage() {
  const api = axiosInterceptor();
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  const flash = (ok, text) => { setMsg({ ok, text }); setTimeout(() => setMsg(null), 4000); };

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/glossary?all=true');
      setRows(res.data?.terms || []);
    } catch (err) {
      flash(false, err.response?.data?.error || 'লোড করা যায়নি');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const edit = (r) => { setForm({ ...empty, ...r }); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const reset = () => setForm(empty);

  const save = async () => {
    if (!form.term.trim()) return flash(false, 'Term দিন');
    if (!form.termKey.trim()) return flash(false, 'একটা key দিন (যেমন coe)');
    setSaving(true);
    try {
      if (form.id) { await api.put(`/glossary/${form.id}`, form); flash(true, 'আপডেট হয়েছে'); }
      else { await api.post('/glossary', form); flash(true, 'যোগ হয়েছে'); }
      reset(); load();
    } catch (err) {
      flash(false, err.response?.data?.error || 'সেভ করা যায়নি');
    } finally { setSaving(false); }
  };

  const del = async (r) => {
    if (!(await confirmDialog({ title: 'Term মুছবেন?', message: `"${r.term}" মুছে ফেলা হবে।`, confirmText: 'মুছুন' }))) return;
    try { await api.delete(`/glossary/${r.id}`); flash(true, 'মুছে ফেলা হয়েছে'); load(); }
    catch (err) { flash(false, err.response?.data?.error || 'মুছে ফেলা যায়নি'); }
  };

  const importSeed = async () => {
    if (!(await confirmDialog({ title: 'Starter glossary import?', message: `${SEED.length}টি term যোগ হবে (যেগুলো আছে সেগুলো বাদ যাবে)।`, danger: false, confirmText: 'Import' }))) return;
    const have = new Set(rows.map((r) => r.termKey));
    const todo = SEED.filter((s) => !have.has(s.termKey));
    let n = 0;
    for (const s of todo) {
      // eslint-disable-next-line no-await-in-loop
      try { await api.post('/glossary', { ...s, sortOrder: n, published: true }); n += 1; } catch { /* skip */ }
    }
    flash(true, `${n}টি term import হয়েছে`);
    load();
  };

  return (
    <div className="space-y-5 max-w-5xl pb-24">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-navy">Glossary (শব্দকোষ)</h1>
          <p className="mt-1 text-sm text-brand-slate">/glossary পেজের জাপান-অধ্যয়ন term গুলো এখান থেকে যোগ/এডিট করুন।</p>
        </div>
        <button type="button" onClick={importSeed} className="rounded-md border border-brand-navy px-3 py-1.5 text-xs font-semibold text-brand-navy hover:bg-brand-tealLight/10">
          ⤓ Starter import
        </button>
      </div>

      {msg && <div className={`rounded-lg border px-4 py-2.5 text-sm ${msg.ok ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-red-300 bg-red-50 text-red-800'}`}>{msg.ok ? '✓ ' : '✗ '}{msg.text}</div>}

      <section className="rounded-xl border border-brand-tealLight/40 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-bold uppercase tracking-wide text-brand-navy">{form.id ? 'Term এডিট' : 'নতুন term'}</h2>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Key (slug) *</label>
            <input value={form.termKey} onChange={(e) => setForm({ ...form, termKey: e.target.value })} placeholder="coe" className={inputClass} disabled={!!form.id} />
          </div>
          <div>
            <label className={labelClass}>Category</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputClass}>
              {CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Term *</label>
            <input value={form.term} onChange={(e) => setForm({ ...form, term: e.target.value })} placeholder="COE" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Term (জাপানি)</label>
            <input value={form.termJa} onChange={(e) => setForm({ ...form, termJa: e.target.value })} placeholder="在留資格認定証明書" className={inputClass} />
          </div>
        </div>
        <div className="mt-3 space-y-3">
          <div><label className={labelClass}>সংজ্ঞা (বাংলা)</label><textarea value={form.bn} onChange={(e) => setForm({ ...form, bn: e.target.value })} rows={2} className={inputClass} /></div>
          <div><label className={labelClass}>Definition (English)</label><textarea value={form.en} onChange={(e) => setForm({ ...form, en: e.target.value })} rows={2} className={inputClass} /></div>
          <div><label className={labelClass}>定義 (日本語)</label><textarea value={form.ja} onChange={(e) => setForm({ ...form, ja: e.target.value })} rows={2} className={inputClass} /></div>
        </div>
        <div className="mt-3 flex items-center gap-4">
          <div className="w-28"><label className={labelClass}>ক্রম</label><input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} className={inputClass} /></div>
          <label className="mt-5 flex items-center gap-2 text-sm text-brand-navy"><input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} /> প্রকাশিত</label>
        </div>
        <div className="mt-4 flex gap-2">
          <button type="button" onClick={save} disabled={saving} className="rounded-md bg-brand-teal px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-navy disabled:opacity-50">{saving ? 'সেভ…' : form.id ? 'আপডেট' : '+ যোগ করুন'}</button>
          {form.id && <button type="button" onClick={reset} className="rounded-md border border-brand-navy px-4 py-2.5 text-sm font-semibold text-brand-navy hover:bg-brand-tealLight/10">বাতিল</button>}
        </div>
      </section>

      <section className="rounded-xl border border-brand-tealLight/40 bg-white shadow-sm overflow-hidden">
        <h2 className="border-b border-brand-tealLight/40 px-5 py-3 text-sm font-bold uppercase tracking-wide text-brand-navy">তালিকা ({rows.length})</h2>
        {loading ? <p className="p-5 text-sm text-brand-slate">লোড হচ্ছে…</p> : rows.length === 0 ? (
          <p className="p-5 text-sm text-brand-slate/70">কোনো term নেই। উপরে যোগ করুন বা “Starter import” চাপুন। (পাবলিক সাইটে আপাতত বিল্ট-ইন তালিকা দেখাবে।)</p>
        ) : (
          <ul className="divide-y divide-brand-tealLight/30">
            {rows.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 px-5 py-2.5 text-sm hover:bg-brand-tealLight/5">
                <span className="min-w-0">
                  <span className="font-semibold text-brand-navy">{r.term}</span>
                  {r.termJa ? <span className="ml-2 text-xs text-brand-teal-700">{r.termJa}</span> : null}
                  <span className="ml-2 rounded bg-brand-tealLight/20 px-1.5 py-0.5 text-[10px] text-brand-navy">{r.category}</span>
                  {!r.published && <span className="ml-2 text-[10px] text-amber-600">(unpublished)</span>}
                </span>
                <span className="flex-shrink-0">
                  <button type="button" onClick={() => edit(r)} className="mr-2 text-brand-teal hover:text-brand-navy">এডিট</button>
                  <button type="button" onClick={() => del(r)} className="text-red-500 hover:text-red-700">মুছুন</button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
