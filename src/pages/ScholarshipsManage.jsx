/**
 * EN: Scholarships admin — CRUD over Scholarship (/scholarships). Trilingual
 *     name/coverage/eligibility/howToApply + provider/amount/deadline/link.
 *     One-click seed imports the bundled four scholarships.
 * BN: Scholarships admin — Scholarship (/scholarships)-এর CRUD। ত্রিভাষিক
 *     name/coverage/eligibility/howToApply + provider/amount/deadline/link।
 *     এক-ক্লিক seed bundled চার বৃত্তি import করে।
 */

import { useEffect, useState } from 'react';
import axiosInterceptor from '../axios/axiosInterceptor';
import { confirmDialog } from '../components/ConfirmDialog';

const inputClass =
  'w-full rounded-md border border-brand-tealLight/60 bg-white px-3 py-2.5 text-sm text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-teal/40 focus:border-brand-teal';
const labelClass = 'mb-1 block text-xs font-bold uppercase tracking-wider text-brand-navy';

const empty = {
  id: null, scholarshipKey: '', name: '', nameEn: '', nameJa: '', provider: '', amount: '', deadline: '', link: '',
  coverage: '', coverageEn: '', coverageJa: '', eligibility: '', eligibilityEn: '', eligibilityJa: '',
  howToApply: '', howToApplyEn: '', howToApplyJa: '', sortOrder: 0, published: true,
};

function Tri({ form, set, k, label, area }) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
      {[['', 'বাংলা'], ['En', 'English'], ['Ja', '日本語']].map(([suf, lng]) => (
        <div key={suf}>
          <label className={labelClass}>{label} ({lng})</label>
          {area
            ? <textarea value={form[k + suf]} onChange={(e) => set({ [k + suf]: e.target.value })} rows={2} className={inputClass} />
            : <input value={form[k + suf]} onChange={(e) => set({ [k + suf]: e.target.value })} className={inputClass} />}
        </div>
      ))}
    </div>
  );
}

const SEED = [
  { scholarshipKey: 'mext', provider: 'Government of Japan', amount: 'Full tuition + ~¥117,000/month + airfare', deadline: 'Via Japanese Embassy, Dhaka — usually May–June (annual)', link: 'https://www.bd.emb-japan.go.jp/', nameEn: 'MEXT Scholarship (Monbukagakusho)', name: 'MEXT বৃত্তি (মনবুকাগাকুশো)', nameJa: '文部科学省（MEXT）奨学金', coverageEn: 'Full tuition waiver, monthly living stipend, and round-trip airfare — the most comprehensive scholarship.', coverage: 'পূর্ণ টিউশন মওকুফ, মাসিক জীবনযাত্রা ভাতা ও যাওয়া-আসার বিমান ভাড়া — সবচেয়ে পূর্ণাঙ্গ বৃত্তি।', coverageJa: '学費全額免除、毎月の生活費、往復航空券 — 最も手厚い奨学金。', eligibilityEn: 'Strong academic record; age + qualification limits by track. Highly competitive.', eligibility: 'শক্তিশালী একাডেমিক রেকর্ড; track অনুযায়ী বয়স ও যোগ্যতার সীমা। অত্যন্ত প্রতিযোগিতামূলক।', eligibilityJa: '優れた成績、コース別の年齢・資格要件。競争率が高い。', howToApplyEn: 'Apply via the Japanese Embassy in Dhaka — exams + interview. Inochi helps prepare your file.', howToApply: 'ঢাকার জাপানি দূতাবাসের মাধ্যমে — পরীক্ষা + ইন্টারভিউ। Inochi ফাইল প্রস্তুতিতে সাহায্য করে।', howToApplyJa: 'ダッカの日本大使館経由 — 試験＋面接。Inochi が書類準備を支援。' },
  { scholarshipKey: 'jasso-honors', provider: 'Japan Student Services Organization', amount: '~¥48,000 / month', deadline: 'Awarded by your school after enrolment', link: 'https://www.jasso.go.jp/en/', nameEn: 'JASSO Honors Scholarship', name: 'JASSO অনার্স বৃত্তি', nameJa: 'JASSO 奨学金（学習奨励費）', coverageEn: 'A monthly living-cost stipend for privately-funded students with good attendance and grades.', coverage: 'ভালো উপস্থিতি ও গ্রেডসহ privately-funded ছাত্রদের মাসিক জীবনযাত্রা ভাতা।', coverageJa: '出席・成績が良好な私費留学生向けの月額生活費補助。', eligibilityEn: 'Enrolled at a school/college/university; 90%+ attendance and good performance.', eligibility: 'স্কুল/কলেজ/বিশ্ববিদ্যালয়ে ভর্তি; ৯০%+ উপস্থিতি ও ভালো ফল।', eligibilityJa: '在籍校で90%以上の出席率と良好な成績。', howToApplyEn: 'Your school nominates eligible students — keep attendance high from day one.', howToApply: 'স্কুল যোগ্য ছাত্রদের মনোনয়ন দেয় — শুরু থেকেই উপস্থিতি উঁচু রাখুন।', howToApplyJa: '学校が推薦 — 初日から高い出席率を保つ。' },
  { scholarshipKey: 'tuition-reduction', provider: 'Language schools & universities', amount: '30% – 100% of tuition', deadline: 'At admission / first year (merit-based)', link: '', nameEn: 'School Tuition Reduction / Waiver', name: 'স্কুল টিউশন হ্রাস / মওকুফ', nameJa: '学校の学費減免', coverageEn: 'Many partner schools offer partial-to-full tuition reductions for strong applicants or high JLPT scores.', coverage: 'অনেক partner স্কুল শক্তিশালী আবেদনকারী বা উঁচু JLPT স্কোরে আংশিক-পূর্ণ টিউশন হ্রাস দেয়।', coverageJa: '多くの提携校が優秀者・高JLPTスコアに一部〜全額減免。', eligibilityEn: 'Varies by school — typically JLPT N4+, good record, or strong interview.', eligibility: 'স্কুলভেদে ভিন্ন — সাধারণত JLPT N4+, ভালো রেকর্ড বা শক্তিশালী ইন্টারভিউ।', eligibilityJa: '学校による — 通常 JLPT N4以上、良好な成績、面接評価。', howToApplyEn: 'Ask Inochi which partner schools currently offer waivers and the score to target.', howToApply: 'কোন partner স্কুল waiver দিচ্ছে ও কোন স্কোর দরকার — Inochi-কে জিজ্ঞেস করুন।', howToApplyJa: 'どの提携校が減免中か Inochi に確認を。' },
  { scholarshipKey: 'local-foundation', provider: 'Prefectures & private foundations', amount: '¥30,000 – ¥100,000 / month (varies)', deadline: 'After arrival in Japan (varies)', link: 'https://www.jasso.go.jp/en/study_j/scholarships/', nameEn: 'Local Government & Private Foundation Grants', name: 'স্থানীয় সরকার ও বেসরকারি ফাউন্ডেশন অনুদান', nameJa: '地方自治体・民間財団の奨学金', coverageEn: 'Dozens of regional/private scholarships open up once studying in Japan — often less competitive than MEXT.', coverage: 'জাপানে পড়া শুরু করলে অনেক আঞ্চলিক/বেসরকারি বৃত্তি খোলে — প্রায়ই MEXT-এর চেয়ে কম প্রতিযোগিতামূলক।', coverageJa: '在学後に地域・民間奨学金が多数。MEXTより競争率が低いことも。', eligibilityEn: 'Usually requires enrolment, good grades, sometimes residence in a specific prefecture.', eligibility: 'সাধারণত ভর্তি, ভালো গ্রেড, কখনো নির্দিষ্ট prefecture-এ বসবাস।', eligibilityJa: '通常、在籍・良好な成績、場合により特定地域在住。', howToApplyEn: "Your school's student office keeps the current list — apply continuously.", howToApply: 'স্কুলের student office-এ চলতি তালিকা থাকে — ধারাবাহিকভাবে আবেদন করুন।', howToApplyJa: '学校の学生課が最新リストを管理 — 継続応募を。' },
];

export default function ScholarshipsManage() {
  const api = axiosInterceptor();
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  const flash = (ok, text) => { setMsg({ ok, text }); setTimeout(() => setMsg(null), 4000); };

  const load = async () => {
    setLoading(true);
    try { const res = await api.get('/scholarships?all=true'); setRows(res.data?.scholarships || []); }
    catch (err) { flash(false, err.response?.data?.error || 'লোড করা যায়নি'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const edit = (r) => { setForm({ ...empty, ...r }); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const reset = () => setForm(empty);

  const save = async () => {
    if (!form.scholarshipKey.trim()) return flash(false, 'Key দিন (mext)');
    setSaving(true);
    try {
      if (form.id) { await api.put(`/scholarships/${form.id}`, form); flash(true, 'আপডেট হয়েছে'); }
      else { await api.post('/scholarships', form); flash(true, 'যোগ হয়েছে'); }
      reset(); load();
    } catch (err) { flash(false, err.response?.data?.error || 'সেভ করা যায়নি'); }
    finally { setSaving(false); }
  };

  const del = async (r) => {
    if (!(await confirmDialog({ title: 'বৃত্তি মুছবেন?', message: `"${r.nameEn || r.scholarshipKey}" মুছে ফেলা হবে।`, confirmText: 'মুছুন' }))) return;
    try { await api.delete(`/scholarships/${r.id}`); flash(true, 'মুছে ফেলা হয়েছে'); load(); }
    catch (err) { flash(false, err.response?.data?.error || 'মুছে ফেলা যায়নি'); }
  };

  const importSeed = async () => {
    if (!(await confirmDialog({ title: 'Seed import?', message: `${SEED.length}টি বৃত্তি যোগ হবে।`, danger: false, confirmText: 'Import' }))) return;
    const have = new Set(rows.map((r) => r.scholarshipKey));
    let n = 0;
    for (let i = 0; i < SEED.length; i += 1) {
      if (have.has(SEED[i].scholarshipKey)) continue;
      // eslint-disable-next-line no-await-in-loop
      try { await api.post('/scholarships', { ...SEED[i], sortOrder: i, published: true }); n += 1; } catch { /* skip */ }
    }
    flash(true, `${n}টি import হয়েছে`); load();
  };

  return (
    <div className="space-y-5 max-w-5xl pb-24">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-navy">Scholarships</h1>
          <p className="mt-1 text-sm text-brand-slate">/scholarships পেজের বৃত্তি যোগ/এডিট করুন।</p>
        </div>
        <button type="button" onClick={importSeed} className="rounded-md border border-brand-navy px-3 py-1.5 text-xs font-semibold text-brand-navy hover:bg-brand-tealLight/10">⤓ Seed import</button>
      </div>

      {msg && <div className={`rounded-lg border px-4 py-2.5 text-sm ${msg.ok ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-red-300 bg-red-50 text-red-800'}`}>{msg.ok ? '✓ ' : '✗ '}{msg.text}</div>}

      <section className="rounded-xl border border-brand-tealLight/40 bg-white p-5 shadow-sm space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wide text-brand-navy">{form.id ? 'বৃত্তি এডিট' : 'নতুন বৃত্তি'}</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div><label className={labelClass}>Key</label><input value={form.scholarshipKey} onChange={(e) => setForm({ ...form, scholarshipKey: e.target.value })} placeholder="mext" className={inputClass} disabled={!!form.id} /></div>
          <div><label className={labelClass}>Provider</label><input value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })} className={inputClass} /></div>
          <div><label className={labelClass}>Amount</label><input value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className={inputClass} /></div>
          <div><label className={labelClass}>Link</label><input value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} className={inputClass} /></div>
          <div className="sm:col-span-4"><label className={labelClass}>Deadline</label><input value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} className={inputClass} /></div>
        </div>
        <Tri form={form} set={(p) => setForm({ ...form, ...p })} k="name" label="নাম" />
        <Tri form={form} set={(p) => setForm({ ...form, ...p })} k="coverage" label="যা কভার করে" area />
        <Tri form={form} set={(p) => setForm({ ...form, ...p })} k="eligibility" label="যোগ্যতা" area />
        <Tri form={form} set={(p) => setForm({ ...form, ...p })} k="howToApply" label="কীভাবে আবেদন" area />
        <div className="flex items-center gap-4">
          <div className="w-28"><label className={labelClass}>ক্রম</label><input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} className={inputClass} /></div>
          <label className="mt-5 flex items-center gap-2 text-sm text-brand-navy"><input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} /> প্রকাশিত</label>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={save} disabled={saving} className="rounded-md bg-brand-teal px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-navy disabled:opacity-50">{saving ? 'সেভ…' : form.id ? 'আপডেট' : '+ যোগ করুন'}</button>
          {form.id && <button type="button" onClick={reset} className="rounded-md border border-brand-navy px-4 py-2.5 text-sm font-semibold text-brand-navy hover:bg-brand-tealLight/10">বাতিল</button>}
        </div>
      </section>

      <section className="rounded-xl border border-brand-tealLight/40 bg-white shadow-sm overflow-hidden">
        <h2 className="border-b border-brand-tealLight/40 px-5 py-3 text-sm font-bold uppercase tracking-wide text-brand-navy">তালিকা ({rows.length})</h2>
        {loading ? <p className="p-5 text-sm text-brand-slate">লোড হচ্ছে…</p> : rows.length === 0 ? (
          <p className="p-5 text-sm text-brand-slate/70">কোনো বৃত্তি নেই। “Seed import” চাপুন। (পাবলিক সাইটে আপাতত বিল্ট-ইন তালিকা দেখাবে।)</p>
        ) : (
          <ul className="divide-y divide-brand-tealLight/30">
            {rows.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 px-5 py-2.5 text-sm hover:bg-brand-tealLight/5">
                <span className="min-w-0 truncate text-brand-navy">{r.nameEn || r.scholarshipKey} <span className="text-xs text-brand-slate/60">{r.provider}</span>{!r.published && <span className="ml-2 text-[10px] text-amber-600">(off)</span>}</span>
                <span className="flex-shrink-0"><button type="button" onClick={() => edit(r)} className="mr-2 text-brand-teal hover:text-brand-navy">এডিট</button><button type="button" onClick={() => del(r)} className="text-red-500 hover:text-red-700">মুছুন</button></span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
