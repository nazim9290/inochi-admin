/**
 * EN: Eligibility quiz admin — manages QuizQuestion (with a per-question
 *     options editor: each option has a trilingual label + a value + a score)
 *     and QuizTier (result bands by min score). maxScore is computed by the
 *     backend, so the admin only sets option scores. One-click seed imports
 *     the bundled 5-question quiz + 3 tiers.
 * BN: Eligibility কুইজ admin — QuizQuestion (প্রতি প্রশ্নে option editor:
 *     প্রতিটা option-এ ত্রিভাষিক label + value + score) এবং QuizTier (min
 *     score-ভিত্তিক result band) ম্যানেজ করে। maxScore backend হিসাব করে,
 *     তাই admin শুধু option score দেয়। এক-ক্লিক seed bundled ৫-প্রশ্ন কুইজ
 *     + ৩ tier import করে।
 */

import { useEffect, useState } from 'react';
import axiosInterceptor from '../axios/axiosInterceptor';
import { confirmDialog } from '../components/ConfirmDialog';

const inputClass =
  'w-full rounded-md border border-brand-tealLight/60 bg-white px-3 py-2.5 text-sm text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-teal/40 focus:border-brand-teal';
const labelClass = 'mb-1 block text-xs font-bold uppercase tracking-wider text-brand-navy';

const newOption = () => ({ value: '', score: 0, label: { en: '', bn: '', ja: '' } });
const emptyQ = { id: null, questionKey: '', question: '', questionEn: '', questionJa: '', help: '', helpEn: '', helpJa: '', options: [newOption()], sortOrder: 0, published: true };
const emptyT = { id: null, tierKey: '', min: 0, label: '', labelEn: '', labelJa: '', body: '', bodyEn: '', bodyJa: '', tone: 'info', sortOrder: 0, published: true };

const L = (en, bn, ja) => ({ en, bn, ja });
const SEED_Q = [
  { questionKey: 'education', questionEn: "What's your highest completed education?", question: 'আপনার সর্বোচ্চ সম্পন্ন শিক্ষা কী?', questionJa: '最終学歴は？', helpEn: 'Most language schools require at least 12 years of formal education.', help: 'বেশিরভাগ স্কুলে ১২ বছরের আনুষ্ঠানিক শিক্ষা প্রয়োজন।', helpJa: '多くの学校で12年以上の正規教育が必要。', options: [
    { value: 'below-ssc', score: 0, label: L('Below SSC', 'SSC-এর নিচে', 'SSC未満') },
    { value: 'ssc', score: 1, label: L('SSC / Class 10', 'SSC / দশম শ্রেণি', 'SSC / 10年生') },
    { value: 'hsc', score: 2, label: L('HSC / A-Level', 'HSC / এ-লেভেল', 'HSC / Aレベル') },
    { value: 'bachelor', score: 3, label: L("Bachelor's degree", 'স্নাতক ডিগ্রি', '学士号') },
    { value: 'master', score: 3, label: L("Master's or higher", 'স্নাতকোত্তর বা উচ্চতর', '修士以上') },
  ] },
  { questionKey: 'age', questionEn: 'How old will you be at the planned intake?', question: 'পরিকল্পিত intake-এ আপনার বয়স কত হবে?', questionJa: '入学時期に何歳ですか？', helpEn: 'Schools typically prefer applicants aged 18 to 30.', help: 'স্কুল সাধারণত ১৮–৩০ বছর বয়সীদের পছন্দ করে।', helpJa: '通常18〜30歳が優先される。', options: [
    { value: 'under18', score: 0, label: L('Under 18', '১৮-এর নিচে', '18歳未満') },
    { value: '18-22', score: 3, label: L('18 – 22', '১৮ – ২২', '18 – 22') },
    { value: '23-27', score: 3, label: L('23 – 27', '২৩ – ২৭', '23 – 27') },
    { value: '28-30', score: 2, label: L('28 – 30', '২৮ – ৩০', '28 – 30') },
    { value: '31plus', score: 1, label: L('31 or older', '৩১ বা তার বেশি', '31歳以上') },
  ] },
  { questionKey: 'japanese', questionEn: "What's your current Japanese level?", question: 'আপনার বর্তমান জাপানি level কী?', questionJa: '現在の日本語レベルは？', helpEn: 'JLPT N5 is the recommended minimum before flying.', help: 'ফ্লাইটের আগে JLPT N5 ন্যূনতম সুপারিশকৃত।', helpJa: '渡日前はJLPT N5が推奨。', options: [
    { value: 'none', score: 1, label: L('No Japanese yet', 'এখনো শিখিনি', '未学習') },
    { value: 'n5', score: 2, label: L('JLPT N5 / studying N5', 'JLPT N5 / N5 অধ্যয়নরত', 'JLPT N5 / N5学習中') },
    { value: 'n4', score: 3, label: L('JLPT N4', 'JLPT N4', 'JLPT N4') },
    { value: 'n3plus', score: 3, label: L('JLPT N3 or higher', 'JLPT N3 বা উপরে', 'JLPT N3以上') },
  ] },
  { questionKey: 'sponsor', questionEn: 'Who will be your financial sponsor?', question: 'আপনার আর্থিক sponsor কে হবেন?', questionJa: '経費支弁者は誰ですか？', helpEn: 'Parents and self-sponsorship carry the strongest visa weight.', help: 'অভিভাবক ও নিজে sponsor হলে ভিসায় সবচেয়ে শক্তিশালী।', helpJa: '親または本人による支弁が最も強力。', options: [
    { value: 'self', score: 3, label: L('Myself', 'আমি নিজে', '本人') },
    { value: 'parent', score: 3, label: L('Parent', 'অভিভাবক', '親') },
    { value: 'sibling', score: 2, label: L('Sibling', 'ভাই / বোন', '兄弟姉妹') },
    { value: 'other', score: 1, label: L('Other relative', 'অন্য আত্মীয়', 'その他の親族') },
  ] },
  { questionKey: 'finance', questionEn: "Sponsor's bank balance / income proof?", question: 'Sponsor-এর ব্যাংক ব্যালেন্স / আয়ের প্রমাণ?', questionJa: '支弁者の銀行残高 / 収入証明は？', helpEn: '12–15 lakh BDT in proof of funds significantly strengthens your application.', help: '১২–১৫ লাখ টাকার fund proof আবেদন শক্তিশালী করে।', helpJa: '12〜15ラックの資金証明が申請を強化。', options: [
    { value: 'below8', score: 0, label: L('Below ৳8 lakh', '৮ লাখের নিচে', '8ラック未満') },
    { value: '8to12', score: 1, label: L('৳8 – 12 lakh', '৮ – ১২ লাখ', '8 – 12ラック') },
    { value: '12to18', score: 2, label: L('৳12 – 18 lakh', '১২ – ১৮ লাখ', '12 – 18ラック') },
    { value: '18plus', score: 3, label: L('৳18 lakh+', '১৮ লাখ+', '18ラック以上') },
  ] },
];
const SEED_T = [
  { tierKey: 'strong', min: 12, tone: 'success', labelEn: 'Strong candidate', label: 'শক্তিশালী আবেদনকারী', labelJa: '有力な候補者', bodyEn: 'Your profile aligns well with most language school requirements. With organised paperwork you can target the next intake.', body: 'আপনার প্রোফাইল বেশিরভাগ স্কুলের প্রয়োজনের সাথে মেলে। সংগঠিত পেপারওয়ার্ক থাকলে পরবর্তী intake target করতে পারেন।', bodyJa: 'プロフィールは多くの学校の要件に合致。書類を整えれば次回入学を目指せます。' },
  { tierKey: 'moderate', min: 8, tone: 'info', labelEn: 'Eligible — needs preparation', label: 'উপযুক্ত — প্রস্তুতি প্রয়োজন', labelJa: '条件付き合格 — 準備が必要', bodyEn: 'You meet the core criteria, but one or two areas need work — usually JLPT prep or fund documentation. Inochi can map a 3–6 month plan.', body: 'মূল যোগ্যতা পূরণ করেন, তবে এক-দুই জায়গায় কাজ দরকার — JLPT prep বা fund ডকুমেন্ট। Inochi ৩–৬ মাসের প্ল্যান করবে।', bodyJa: '基本条件は満たすが1〜2点の準備が必要 — JLPT対策か資金書類。Inochiが3〜6ヶ月計画を立てます。' },
  { tierKey: 'needsCounseling', min: 0, tone: 'warning', labelEn: 'Counseling recommended', label: 'কাউন্সেলিং সুপারিশকৃত', labelJa: 'カウンセリング推奨', bodyEn: 'Your current profile may face hurdles for a standard student-visa pathway. There are alternative routes — let us talk one-on-one.', body: 'বর্তমান প্রোফাইল স্ট্যান্ডার্ড স্টুডেন্ট-ভিসায় চ্যালেঞ্জের মুখে পড়তে পারে। বিকল্প পথ আছে — এক-এক আলোচনা করি।', bodyJa: '現在のプロフィールは標準ルートで課題の可能性。代替ルートがあります — 1対1で相談を。' },
];

const TONES = ['success', 'info', 'warning'];

// EN: Module-level so it is NOT recreated each render (which would remount the
//     inputs and drop focus after every keystroke). Receives form + a setter.
// BN: module-level — প্রতি render-এ recreate হয় না (নইলে input remount হয়ে
//     প্রতি keystroke-এ focus হারাত)। form + setter প্রপ হিসেবে নেয়।
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

export default function QuizManage() {
  const api = axiosInterceptor();
  const [questions, setQuestions] = useState([]);
  const [tiers, setTiers] = useState([]);
  const [qForm, setQForm] = useState(emptyQ);
  const [tForm, setTForm] = useState(emptyT);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);

  const flash = (ok, text) => { setMsg({ ok, text }); setTimeout(() => setMsg(null), 4000); };

  const load = async () => {
    setLoading(true);
    try {
      const [q, t] = await Promise.all([api.get('/quiz-questions'), api.get('/quiz-tiers')]);
      setQuestions(q.data?.questions || []);
      setTiers(t.data?.tiers || []);
    } catch (err) { flash(false, err.response?.data?.error || 'লোড করা যায়নি'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  /* -------- question options sub-editor -------- */
  const editQ = (r) => { setQForm({ ...emptyQ, ...r, options: Array.isArray(r.options) && r.options.length ? r.options.map((o) => ({ value: o.value || '', score: Number(o.score) || 0, label: { en: o.label?.en || '', bn: o.label?.bn || '', ja: o.label?.ja || '' } })) : [newOption()] }); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const resetQ = () => setQForm(emptyQ);
  const setOpt = (i, patch) => setQForm((f) => ({ ...f, options: f.options.map((o, idx) => (idx === i ? { ...o, ...patch } : o)) }));
  const setOptLabel = (i, lng, val) => setQForm((f) => ({ ...f, options: f.options.map((o, idx) => (idx === i ? { ...o, label: { ...o.label, [lng]: val } } : o)) }));
  const addOpt = () => setQForm((f) => ({ ...f, options: [...f.options, newOption()] }));
  const removeOpt = (i) => setQForm((f) => ({ ...f, options: f.options.filter((_, idx) => idx !== i) }));

  const saveQ = async () => {
    if (!qForm.questionKey.trim()) return flash(false, 'Question key দিন');
    const payload = { ...qForm, options: qForm.options.filter((o) => o.label.en || o.label.bn) };
    try {
      if (qForm.id) { await api.put(`/quiz-questions/${qForm.id}`, payload); flash(true, 'প্রশ্ন আপডেট হয়েছে'); }
      else { await api.post('/quiz-questions', payload); flash(true, 'প্রশ্ন যোগ হয়েছে'); }
      resetQ(); load();
    } catch (err) { flash(false, err.response?.data?.error || 'সেভ করা যায়নি'); }
  };
  const delQ = async (r) => {
    if (!(await confirmDialog({ title: 'প্রশ্ন মুছবেন?', message: `"${r.questionEn || r.questionKey}" মুছে ফেলা হবে।`, confirmText: 'মুছুন' }))) return;
    try { await api.delete(`/quiz-questions/${r.id}`); flash(true, 'মুছে ফেলা হয়েছে'); load(); }
    catch (err) { flash(false, err.response?.data?.error || 'মুছে ফেলা যায়নি'); }
  };

  /* -------- tiers -------- */
  const editT = (r) => { setTForm({ ...emptyT, ...r }); };
  const resetT = () => setTForm(emptyT);
  const saveT = async () => {
    if (!tForm.tierKey.trim()) return flash(false, 'Tier key দিন');
    try {
      if (tForm.id) { await api.put(`/quiz-tiers/${tForm.id}`, tForm); flash(true, 'Tier আপডেট হয়েছে'); }
      else { await api.post('/quiz-tiers', tForm); flash(true, 'Tier যোগ হয়েছে'); }
      resetT(); load();
    } catch (err) { flash(false, err.response?.data?.error || 'সেভ করা যায়নি'); }
  };
  const delT = async (r) => {
    if (!(await confirmDialog({ title: 'Tier মুছবেন?', message: `"${r.labelEn || r.tierKey}" মুছে ফেলা হবে।`, confirmText: 'মুছুন' }))) return;
    try { await api.delete(`/quiz-tiers/${r.id}`); flash(true, 'মুছে ফেলা হয়েছে'); load(); }
    catch (err) { flash(false, err.response?.data?.error || 'মুছে ফেলা যায়নি'); }
  };

  const importSeed = async () => {
    if (!(await confirmDialog({ title: 'Seed import?', message: `${SEED_Q.length}টি প্রশ্ন + ${SEED_T.length}টি tier যোগ হবে।`, danger: false, confirmText: 'Import' }))) return;
    const haveQ = new Set(questions.map((q) => q.questionKey));
    const haveT = new Set(tiers.map((t) => t.tierKey));
    let n = 0;
    for (let i = 0; i < SEED_Q.length; i += 1) {
      if (haveQ.has(SEED_Q[i].questionKey)) continue;
      // eslint-disable-next-line no-await-in-loop
      try { await api.post('/quiz-questions', { ...SEED_Q[i], sortOrder: i, published: true }); n += 1; } catch { /* skip */ }
    }
    for (let i = 0; i < SEED_T.length; i += 1) {
      if (haveT.has(SEED_T[i].tierKey)) continue;
      // eslint-disable-next-line no-await-in-loop
      try { await api.post('/quiz-tiers', { ...SEED_T[i], sortOrder: i, published: true }); n += 1; } catch { /* skip */ }
    }
    flash(true, `${n}টি import হয়েছে`); load();
  };

  return (
    <div className="space-y-5 max-w-5xl pb-24">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-navy">Eligibility Quiz</h1>
          <p className="mt-1 text-sm text-brand-slate">/eligibility কুইজের প্রশ্ন + option score + result tier এডিট করুন। (সর্বোচ্চ স্কোর নিজে থেকে হিসাব হয়।)</p>
        </div>
        <button type="button" onClick={importSeed} className="rounded-md border border-brand-navy px-3 py-1.5 text-xs font-semibold text-brand-navy hover:bg-brand-tealLight/10">⤓ Seed import</button>
      </div>

      {msg && <div className={`rounded-lg border px-4 py-2.5 text-sm ${msg.ok ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-red-300 bg-red-50 text-red-800'}`}>{msg.ok ? '✓ ' : '✗ '}{msg.text}</div>}

      {/* QUESTION editor */}
      <section className="rounded-xl border border-brand-tealLight/40 bg-white p-5 shadow-sm space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wide text-brand-navy">{qForm.id ? 'প্রশ্ন এডিট' : 'নতুন প্রশ্ন'}</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="col-span-2"><label className={labelClass}>Question key</label><input value={qForm.questionKey} onChange={(e) => setQForm({ ...qForm, questionKey: e.target.value })} placeholder="education" className={inputClass} disabled={!!qForm.id} /></div>
          <div><label className={labelClass}>ক্রম</label><input type="number" value={qForm.sortOrder} onChange={(e) => setQForm({ ...qForm, sortOrder: Number(e.target.value) })} className={inputClass} /></div>
          <label className="mt-5 flex items-center gap-2 text-sm text-brand-navy"><input type="checkbox" checked={qForm.published} onChange={(e) => setQForm({ ...qForm, published: e.target.checked })} /> প্রকাশিত</label>
        </div>
        <Tri form={qForm} set={(p) => setQForm({ ...qForm, ...p })} k="question" label="প্রশ্ন" area />
        <Tri form={qForm} set={(p) => setQForm({ ...qForm, ...p })} k="help" label="সাহায্য টেক্সট" area />

        <div className="rounded-lg bg-brand-tealLight/5 p-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase text-brand-slate">Options (প্রতিটায় score দিন)</p>
            <button type="button" onClick={addOpt} className="rounded-md border border-brand-teal px-2 py-1 text-xs font-semibold text-brand-teal hover:bg-brand-teal/10">+ option</button>
          </div>
          <div className="mt-2 space-y-2">
            {qForm.options.map((o, i) => (
              <div key={i} className="rounded-md border border-brand-tealLight/40 bg-white p-2">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-6">
                  <input value={o.value} onChange={(e) => setOpt(i, { value: e.target.value })} placeholder="value" className={inputClass + ' sm:col-span-2'} />
                  <input type="number" value={o.score} onChange={(e) => setOpt(i, { score: Number(e.target.value) })} placeholder="score" className={inputClass} />
                  <input value={o.label.bn} onChange={(e) => setOptLabel(i, 'bn', e.target.value)} placeholder="বাংলা" className={inputClass} />
                  <input value={o.label.en} onChange={(e) => setOptLabel(i, 'en', e.target.value)} placeholder="English" className={inputClass} />
                  <div className="flex gap-1">
                    <input value={o.label.ja} onChange={(e) => setOptLabel(i, 'ja', e.target.value)} placeholder="日本語" className={inputClass} />
                    <button type="button" onClick={() => removeOpt(i)} className="rounded-md bg-red-50 px-2 text-red-600 hover:bg-red-100" title="remove">✕</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={saveQ} className="rounded-md bg-brand-teal px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-navy">{qForm.id ? 'আপডেট' : '+ যোগ করুন'}</button>
          {qForm.id && <button type="button" onClick={resetQ} className="rounded-md border border-brand-navy px-4 py-2.5 text-sm font-semibold text-brand-navy hover:bg-brand-tealLight/10">বাতিল</button>}
        </div>
      </section>

      {/* QUESTION list */}
      <section className="rounded-xl border border-brand-tealLight/40 bg-white shadow-sm overflow-hidden">
        <h2 className="border-b border-brand-tealLight/40 px-5 py-3 text-sm font-bold uppercase tracking-wide text-brand-navy">প্রশ্ন ({questions.length})</h2>
        {loading ? <p className="p-5 text-sm text-brand-slate">লোড হচ্ছে…</p> : questions.length === 0 ? (
          <p className="p-5 text-sm text-brand-slate/70">কোনো প্রশ্ন নেই। “Seed import” চাপুন। (পাবলিক সাইটে আপাতত বিল্ট-ইন কুইজ দেখাবে।)</p>
        ) : (
          <ul className="divide-y divide-brand-tealLight/30">
            {questions.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 px-5 py-2.5 text-sm hover:bg-brand-tealLight/5">
                <span className="min-w-0 truncate text-brand-navy">{r.questionEn || r.questionKey} <span className="text-xs text-brand-slate/60">({(r.options || []).length} option)</span>{!r.published && <span className="ml-2 text-[10px] text-amber-600">(unpublished)</span>}</span>
                <span className="flex-shrink-0"><button type="button" onClick={() => editQ(r)} className="mr-2 text-brand-teal hover:text-brand-navy">এডিট</button><button type="button" onClick={() => delQ(r)} className="text-red-500 hover:text-red-700">মুছুন</button></span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* TIER editor + list */}
      <section className="rounded-xl border border-brand-tealLight/40 bg-white p-5 shadow-sm space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wide text-brand-navy">{tForm.id ? 'Result tier এডিট' : 'নতুন result tier'}</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div><label className={labelClass}>Tier key</label><input value={tForm.tierKey} onChange={(e) => setTForm({ ...tForm, tierKey: e.target.value })} placeholder="strong" className={inputClass} /></div>
          <div><label className={labelClass}>Min score</label><input type="number" value={tForm.min} onChange={(e) => setTForm({ ...tForm, min: Number(e.target.value) })} className={inputClass} /></div>
          <div><label className={labelClass}>Tone</label><select value={tForm.tone} onChange={(e) => setTForm({ ...tForm, tone: e.target.value })} className={inputClass}>{TONES.map((t) => <option key={t} value={t}>{t}</option>)}</select></div>
          <label className="mt-5 flex items-center gap-2 text-sm text-brand-navy"><input type="checkbox" checked={tForm.published} onChange={(e) => setTForm({ ...tForm, published: e.target.checked })} /> প্রকাশিত</label>
        </div>
        <Tri form={tForm} set={(p) => setTForm({ ...tForm, ...p })} k="label" label="ফলাফল শিরোনাম" />
        <Tri form={tForm} set={(p) => setTForm({ ...tForm, ...p })} k="body" label="ফলাফল বিবরণ" area />
        <div className="flex gap-2">
          <button type="button" onClick={saveT} className="rounded-md bg-brand-teal px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-navy">{tForm.id ? 'আপডেট' : '+ যোগ করুন'}</button>
          {tForm.id && <button type="button" onClick={resetT} className="rounded-md border border-brand-navy px-4 py-2.5 text-sm font-semibold text-brand-navy hover:bg-brand-tealLight/10">বাতিল</button>}
        </div>
        <div className="border-t border-brand-tealLight/30 pt-3">
          <p className="text-xs font-bold uppercase text-brand-slate">Tier তালিকা ({tiers.length})</p>
          <ul className="mt-1.5 space-y-1">
            {tiers.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 text-sm">
                <span className="text-brand-navy">{r.labelEn || r.tierKey} <span className="text-xs text-brand-slate/60">(min {r.min}, {r.tone})</span></span>
                <span className="flex-shrink-0"><button type="button" onClick={() => editT(r)} className="mr-2 text-brand-teal hover:text-brand-navy">এডিট</button><button type="button" onClick={() => delT(r)} className="text-red-500 hover:text-red-700">মুছুন</button></span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
