/**
 * EN: JLPT mock test admin — manages MockTest configs (per level: duration,
 *     passing score, description) and MockQuestion rows (prompt, options with
 *     a "correct" pick, explanation — all trilingual). One-click seed imports
 *     the bundled N5 + N4 banks (20 questions) so partial edits don't drop the
 *     public set. Tri/option editors are module-level so inputs keep focus.
 * BN: JLPT mock test admin — MockTest config (প্রতি level: সময়, pass স্কোর,
 *     বিবরণ) ও MockQuestion (prompt, options + "সঠিক" বাছাই, explanation —
 *     সব ত্রিভাষিক)। এক-ক্লিক seed bundled N5 + N4 (২০ প্রশ্ন) import করে যাতে
 *     partial edit-এ public set না ভাঙে। Tri/option editor module-level —
 *     input focus ধরে রাখে।
 */

import { useEffect, useState } from 'react';
import axiosInterceptor from '../axios/axiosInterceptor';
import { confirmDialog } from '../components/ConfirmDialog';

const inputClass =
  'w-full rounded-md border border-brand-tealLight/60 bg-white px-3 py-2.5 text-sm text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-teal/40 focus:border-brand-teal';
const labelClass = 'mb-1 block text-xs font-bold uppercase tracking-wider text-brand-navy';

const newOpt = () => ({ value: '', label: { en: '', bn: '', ja: '' } });
const emptyT = { id: null, level: '', duration: 15, passingScore: 6, description: '', descriptionEn: '', descriptionJa: '', sortOrder: 0, published: true };
const emptyQ = { id: null, level: 'N5', category: 'vocabulary', prompt: '', promptEn: '', promptJa: '', options: [newOpt(), newOpt()], correct: '', explanation: '', explanationEn: '', explanationJa: '', sortOrder: 0, published: true };

const CATEGORIES = ['vocabulary', 'grammar', 'reading'];

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

const L = (en, bn, ja) => ({ en, bn, ja });
// EN: Bundled N5 + N4 banks (mirrors the frontend seed). BN: bundled N5 + N4।
const SEED_TESTS = [
  { level: 'N5', duration: 15, passingScore: 6, description: L('10 sample N5 questions — vocabulary, grammar, reading. Score 6+ to be on track.', '১০টি N5 প্রশ্ন — শব্দভান্ডার, গ্রামার, পাঠ। প্রস্তুত হতে ৬+ স্কোর।', '10問のN5 — 語彙・文法・読解。6点以上が目安。'), questions: [
    { category: 'vocabulary', prompt: L('What does 「学生」 mean?', '「学生」 অর্থ কী?', '「学生」 の意味は？'), options: [{ value: 'a', label: L('Teacher', 'শিক্ষক', '先生') }, { value: 'b', label: L('Student', 'ছাত্র', '学生') }, { value: 'c', label: L('School', 'স্কুল', '学校') }, { value: 'd', label: L('Friend', 'বন্ধু', '友達') }], correct: 'b', explanation: L('学生 (がくせい) means student.', '学生 (がくせい) মানে ছাত্র।', '学生 = student。') },
    { category: 'vocabulary', prompt: L('「ありがとう」 means…', '「ありがとう」 অর্থ…', '「ありがとう」 は？'), options: [{ value: 'a', label: L('Hello', 'হ্যালো', 'こんにちは') }, { value: 'b', label: L('Goodbye', 'বিদায়', 'さようなら') }, { value: 'c', label: L('Thank you', 'ধন্যবাদ', 'ありがとう') }, { value: 'd', label: L('Sorry', 'দুঃখিত', 'ごめんなさい') }], correct: 'c', explanation: L('ありがとう = thank you.', 'ありがとう = ধন্যবাদ।', 'ありがとう = thank you。') },
    { category: 'grammar', prompt: L('私 ___ 学生です。 (I am a student)', '私 ___ 学生です。 (আমি একজন ছাত্র)', '私 ___ 学生です。'), options: [{ value: 'a', label: L('が', 'が', 'が') }, { value: 'b', label: L('は', 'は', 'は') }, { value: 'c', label: L('を', 'を', 'を') }, { value: 'd', label: L('に', 'に', 'に') }], correct: 'b', explanation: L('は marks the topic.', 'は বিষয় চিহ্নিত করে।', 'は は主題を表す。') },
    { category: 'vocabulary', prompt: L('Which kanji means water?', 'কোন kanji অর্থ জল?', '「water」 を意味する漢字は？'), options: [{ value: 'a', label: L('火', '火', '火') }, { value: 'b', label: L('木', '木', '木') }, { value: 'c', label: L('水', '水', '水') }, { value: 'd', label: L('土', '土', '土') }], correct: 'c', explanation: L('水 = water.', '水 = জল।', '水 = water。') },
    { category: 'grammar', prompt: L('「~ます」 form is used for…', '「~ます」 form ব্যবহৃত হয়…', '「~ます」 形は…'), options: [{ value: 'a', label: L('Casual speech', 'অনানুষ্ঠানিক', 'カジュアル') }, { value: 'b', label: L('Polite present/future', 'আনুষ্ঠানিক বর্তমান/ভবিষ্যত', '丁寧な現在・未来') }, { value: 'c', label: L('Past only', 'শুধু অতীত', '過去のみ') }, { value: 'd', label: L('Negative only', 'শুধু নেতিবাচক', '否定のみ') }], correct: 'b', explanation: L('~ます is the polite present/future ending.', '~ます আনুষ্ঠানিক বর্তমান/ভবিষ্যত।', '~ます は丁寧な現在・未来。') },
    { category: 'vocabulary', prompt: L('「今日」 (today) is read as…', '「今日」 কীভাবে পড়া হয়?', '「今日」 の読み方は？'), options: [{ value: 'a', label: L('きょう', 'きょう', 'きょう') }, { value: 'b', label: L('あした', 'あした', 'あした') }, { value: 'c', label: L('きのう', 'きのう', 'きのう') }, { value: 'd', label: L('いま', 'いま', 'いま') }], correct: 'a', explanation: L('今日 = きょう (today).', '今日 = きょう (আজ)।', '今日 = きょう。') },
    { category: 'grammar', prompt: L('How do you say "This is a book"?', '「এটি একটি বই」 কীভাবে বলবেন?', '「This is a book」 を？'), options: [{ value: 'a', label: L('これは本です。', 'これは本です。', 'これは本です。') }, { value: 'b', label: L('あれは本です。', 'あれは本です。', 'あれは本です。') }, { value: 'c', label: L('それは本です。', 'それは本です。', 'それは本です。') }, { value: 'd', label: L('本これは。', '本これは。', '本これは。') }], correct: 'a', explanation: L('これ = this (near speaker).', 'これ = এটি (বক্তার কাছে)।', 'これ = this。') },
    { category: 'vocabulary', prompt: L('「七」 (number 7) reads as…', '「七」 (৭) কীভাবে পড়া হয়?', '「七」 の読み方は？'), options: [{ value: 'a', label: L('ろく', 'ろく', 'ろく') }, { value: 'b', label: L('なな / しち', 'なな / しち', 'なな / しち') }, { value: 'c', label: L('はち', 'はち', 'はち') }, { value: 'd', label: L('きゅう', 'きゅう', 'きゅう') }], correct: 'b', explanation: L('七 = なな or しち.', '七 = なな বা しち।', '七 = なな・しち。') },
    { category: 'grammar', prompt: L('「行きます」 negative form is…', '「行きます」-এর negative রূপ?', '「行きます」 の否定形は？'), options: [{ value: 'a', label: L('行きません', '行きません', '行きません') }, { value: 'b', label: L('行きました', '行きました', '行きました') }, { value: 'c', label: L('行きませんでした', '行きませんでした', '行きませんでした') }, { value: 'd', label: L('行く', '行く', '行く') }], correct: 'a', explanation: L('Polite negative present: ~ません.', 'Polite negative present: ~ません।', '丁寧な否定現在は ~ません。') },
    { category: 'reading', prompt: L('「毎日 7時に起きます」 — I wake up at 7 every…', '「毎日 7時に起きます」 — প্রতিদিন ৭টায় উঠি…', '「毎日 7時に起きます」'), options: [{ value: 'a', label: L('Week', 'সপ্তাহ', '週') }, { value: 'b', label: L('Month', 'মাস', '月') }, { value: 'c', label: L('Day', 'দিন', '日') }, { value: 'd', label: L('Year', 'বছর', '年') }], correct: 'c', explanation: L('毎日 = every day.', '毎日 = প্রতিদিন।', '毎日 = every day。') },
  ] },
  { level: 'N4', duration: 20, passingScore: 6, description: L('10 sample N4 questions — intermediate vocab and grammar.', '১০টি N4 প্রশ্ন — মধ্যবর্তী শব্দভান্ডার ও গ্রামার।', '10問のN4 — 中級語彙と文法。'), questions: [
    { category: 'grammar', prompt: L('「~ながら」 means…', '「~ながら」 অর্থ…', '「~ながら」 は？'), options: [{ value: 'a', label: L('After doing', 'করার পরে', 'した後で') }, { value: 'b', label: L('While doing (simultaneous)', 'করতে করতে', 'しながら') }, { value: 'c', label: L('Before doing', 'করার আগে', 'する前に') }, { value: 'd', label: L('Without doing', 'না করে', 'しないで') }], correct: 'b', explanation: L('~ながら = two simultaneous actions.', '~ながら একই সময়ের দুই কাজ।', '~ながら = 同時動作。') },
    { category: 'vocabulary', prompt: L('「経験」 means…', '「経験」 অর্থ…', '「経験」 は？'), options: [{ value: 'a', label: L('Experiment', 'পরীক্ষা', '実験') }, { value: 'b', label: L('Experience', 'অভিজ্ঞতা', '経験') }, { value: 'c', label: L('Education', 'শিক্ষা', '教育') }, { value: 'd', label: L('Effort', 'প্রচেষ্টা', '努力') }], correct: 'b', explanation: L('経験 = experience.', '経験 = অভিজ্ঞতা।', '経験 = experience。') },
    { category: 'grammar', prompt: L('「~たことがあります」 expresses…', '「~たことがあります」 কী প্রকাশ করে?', '「~たことがあります」 は？'), options: [{ value: 'a', label: L('Future plan', 'ভবিষ্যত পরিকল্পনা', '将来の計画') }, { value: 'b', label: L('Past experience', 'অতীত অভিজ্ঞতা', '過去の経験') }, { value: 'c', label: L('Current state', 'বর্তমান অবস্থা', '現在の状態') }, { value: 'd', label: L('Necessity', 'প্রয়োজনীয়তা', '必要性') }], correct: 'b', explanation: L("~たことがあります = past experience.", '~たことがあります = অতীত অভিজ্ঞতা।', '~たことがあります = 過去の経験。') },
    { category: 'vocabulary', prompt: L('「準備」 means…', '「準備」 অর্থ…', '「準備」 は？'), options: [{ value: 'a', label: L('Reservation', 'রিজার্ভেশন', '予約') }, { value: 'b', label: L('Preparation', 'প্রস্তুতি', '準備') }, { value: 'c', label: L('Permission', 'অনুমতি', '許可') }, { value: 'd', label: L('Promotion', 'প্রমোশন', '昇進') }], correct: 'b', explanation: L('準備 = preparation.', '準備 = প্রস্তুতি।', '準備 = preparation。') },
    { category: 'grammar', prompt: L('「~なければなりません」 means…', '「~なければなりません」 অর্থ…', '「~なければなりません」 は？'), options: [{ value: 'a', label: L("Don't have to", 'করতে হয় না', 'しなくてもいい') }, { value: 'b', label: L('Must / have to', 'অবশ্যই করতে হবে', 'しなければならない') }, { value: 'c', label: L('May / can', 'পারে', 'してもいい') }, { value: 'd', label: L('Must not', 'করা যাবে না', 'してはいけない') }], correct: 'b', explanation: L('~なければなりません = must / have to.', '~なければなりません = অবশ্যই করতে হবে।', '~なければなりません = must。') },
    { category: 'vocabulary', prompt: L('「説明」 means…', '「説明」 অর্থ…', '「説明」 は？'), options: [{ value: 'a', label: L('Question', 'প্রশ্ন', '質問') }, { value: 'b', label: L('Explanation', 'ব্যাখ্যা', '説明') }, { value: 'c', label: L('Decision', 'সিদ্ধান্ত', '決定') }, { value: 'd', label: L('Memory', 'স্মৃতি', '記憶') }], correct: 'b', explanation: L('説明 = explanation.', '説明 = ব্যাখ্যা।', '説明 = explanation。') },
    { category: 'grammar', prompt: L('「~そうです」 (雨が降りそう) means…', '「~そうです」 অর্থ…', '「~そうです」 は？'), options: [{ value: 'a', label: L('It looks like (visual)', 'মনে হচ্ছে (চাক্ষুষ)', '見た目の判断') }, { value: 'b', label: L('I heard that…', 'শুনেছি যে…', '~と聞いた') }, { value: 'c', label: L('Definitely will', 'অবশ্যই হবে', '確実に') }, { value: 'd', label: L("Don't think so", 'মনে হয় না', '思わない') }], correct: 'a', explanation: L('Stem + そうです = visual judgement.', 'stem + そうです = চাক্ষুষ অনুমান।', '~そうです = 見た目の推測。') },
    { category: 'reading', prompt: L('「日本に来てから上手になりました」 — improved Japanese…', '「日本に来てから…」 — জাপানি ভালো হয়েছি…', '「日本に来てから…」'), options: [{ value: 'a', label: L('Before coming to Japan', 'জাপানে আসার আগে', '来る前に') }, { value: 'b', label: L('Since coming to Japan', 'জাপানে আসার পর থেকে', '来てから') }, { value: 'c', label: L('While in Bangladesh', 'বাংলাদেশে থাকাকালীন', 'バングラにいる間') }, { value: 'd', label: L('When leaving Japan', 'জাপান ছাড়ার সময়', '出るとき') }], correct: 'b', explanation: L("~てから = since (doing).", '~てから = করার পর থেকে।', '~てから = since。') },
    { category: 'vocabulary', prompt: L('「卒業」 means…', '「卒業」 অর্থ…', '「卒業」 は？'), options: [{ value: 'a', label: L('Entrance / admission', 'ভর্তি', '入学') }, { value: 'b', label: L('Graduation', 'স্নাতক', '卒業') }, { value: 'c', label: L('Examination', 'পরীক্ষা', '試験') }, { value: 'd', label: L('Lecture', 'বক্তৃতা', '講義') }], correct: 'b', explanation: L('卒業 = graduation.', '卒業 = স্নাতক।', '卒業 = graduation。') },
    { category: 'grammar', prompt: L('「先生に教えてもらいました」 means…', '「先生に教えてもらいました」 অর্থ…', '「先生に教えてもらいました」 は？'), options: [{ value: 'a', label: L('I taught the teacher', 'আমি শিক্ষককে শিখিয়েছি', '私が教えた') }, { value: 'b', label: L('The teacher taught me (I received)', 'শিক্ষক আমাকে শিখিয়েছেন', '教えてもらった') }, { value: 'c', label: L('I want a teacher to teach', 'চাই শিক্ষক শেখান', '教えてほしい') }, { value: 'd', label: L('I will teach the teacher', 'শিক্ষককে শেখাব', '教える予定') }], correct: 'b', explanation: L('~てもらう = receive a favour.', '~てもらう = উপকার গ্রহণ।', '~てもらう = 恩恵を受ける。') },
  ] },
];

export default function MockTestManage() {
  const api = axiosInterceptor();
  const [tests, setTests] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [tForm, setTForm] = useState(emptyT);
  const [qForm, setQForm] = useState(emptyQ);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);

  const flash = (ok, text) => { setMsg({ ok, text }); setTimeout(() => setMsg(null), 4000); };

  const load = async () => {
    setLoading(true);
    try {
      const [t, q] = await Promise.all([api.get('/mock-tests'), api.get('/mock-questions')]);
      setTests(t.data?.tests || []);
      setQuestions(q.data?.questions || []);
    } catch (err) { flash(false, err.response?.data?.error || 'লোড করা যায়নি'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  /* config */
  const editT = (r) => setTForm({ ...emptyT, ...r });
  const resetT = () => setTForm(emptyT);
  const saveT = async () => {
    if (!tForm.level.trim()) return flash(false, 'Level দিন (N5/N4)');
    try {
      if (tForm.id) { await api.put(`/mock-tests/${tForm.id}`, tForm); flash(true, 'Config আপডেট'); }
      else { await api.post('/mock-tests', tForm); flash(true, 'Config যোগ হয়েছে'); }
      resetT(); load();
    } catch (err) { flash(false, err.response?.data?.error || 'সেভ করা যায়নি'); }
  };
  const delT = async (r) => {
    if (!(await confirmDialog({ title: 'Config মুছবেন?', message: `${r.level} config মুছে ফেলা হবে (প্রশ্ন থাকবে)।`, confirmText: 'মুছুন' }))) return;
    try { await api.delete(`/mock-tests/${r.id}`); flash(true, 'মুছে ফেলা হয়েছে'); load(); }
    catch (err) { flash(false, err.response?.data?.error || 'মুছে ফেলা যায়নি'); }
  };

  /* questions + options */
  const editQ = (r) => { setQForm({ ...emptyQ, ...r, options: Array.isArray(r.options) && r.options.length ? r.options.map((o) => ({ value: o.value || '', label: { en: o.label?.en || '', bn: o.label?.bn || '', ja: o.label?.ja || '' } })) : [newOpt(), newOpt()] }); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const resetQ = () => setQForm(emptyQ);
  const setOpt = (i, patch) => setQForm((f) => ({ ...f, options: f.options.map((o, idx) => (idx === i ? { ...o, ...patch } : o)) }));
  const setOptLabel = (i, lng, val) => setQForm((f) => ({ ...f, options: f.options.map((o, idx) => (idx === i ? { ...o, label: { ...o.label, [lng]: val } } : o)) }));
  const addOpt = () => setQForm((f) => ({ ...f, options: [...f.options, newOpt()] }));
  const removeOpt = (i) => setQForm((f) => ({ ...f, options: f.options.filter((_, idx) => idx !== i) }));
  const saveQ = async () => {
    if (!qForm.prompt.trim() && !qForm.promptEn.trim()) return flash(false, 'প্রশ্ন দিন');
    if (!qForm.correct.trim()) return flash(false, 'সঠিক option (correct) বাছুন');
    const payload = { ...qForm, options: qForm.options.filter((o) => o.value && (o.label.en || o.label.bn)) };
    try {
      if (qForm.id) { await api.put(`/mock-questions/${qForm.id}`, payload); flash(true, 'প্রশ্ন আপডেট'); }
      else { await api.post('/mock-questions', payload); flash(true, 'প্রশ্ন যোগ হয়েছে'); }
      resetQ(); load();
    } catch (err) { flash(false, err.response?.data?.error || 'সেভ করা যায়নি'); }
  };
  const delQ = async (r) => {
    if (!(await confirmDialog({ title: 'প্রশ্ন মুছবেন?', message: 'এই প্রশ্নটি মুছে ফেলা হবে।', confirmText: 'মুছুন' }))) return;
    try { await api.delete(`/mock-questions/${r.id}`); flash(true, 'মুছে ফেলা হয়েছে'); load(); }
    catch (err) { flash(false, err.response?.data?.error || 'মুছে ফেলা যায়নি'); }
  };

  const importSeed = async () => {
    if (!(await confirmDialog({ title: 'Seed import?', message: 'N5 + N4 config + ২০টি প্রশ্ন যোগ হবে।', danger: false, confirmText: 'Import' }))) return;
    const haveT = new Set(tests.map((t) => t.level));
    let n = 0;
    for (const t of SEED_TESTS) {
      if (!haveT.has(t.level)) {
        // eslint-disable-next-line no-await-in-loop
        try { await api.post('/mock-tests', { level: t.level, duration: t.duration, passingScore: t.passingScore, description: t.description.bn, descriptionEn: t.description.en, descriptionJa: t.description.ja, published: true }); } catch { /* skip */ }
      }
      for (let i = 0; i < t.questions.length; i += 1) {
        const q = t.questions[i];
        // eslint-disable-next-line no-await-in-loop
        try { await api.post('/mock-questions', { level: t.level, category: q.category, prompt: q.prompt.bn, promptEn: q.prompt.en, promptJa: q.prompt.ja, options: q.options, correct: q.correct, explanation: q.explanation.bn, explanationEn: q.explanation.en, explanationJa: q.explanation.ja, sortOrder: i, published: true }); n += 1; } catch { /* skip */ }
      }
    }
    flash(true, `${n}টি প্রশ্ন import হয়েছে`); load();
  };

  const grouped = questions.reduce((acc, r) => { (acc[r.level] = acc[r.level] || []).push(r); return acc; }, {});

  return (
    <div className="space-y-5 max-w-5xl pb-24">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-navy">JLPT Mock Test</h1>
          <p className="mt-1 text-sm text-brand-slate">/jlpt-mock-test পেজের প্রশ্ন ও config এডিট করুন। (একটি প্রশ্ন যোগ করার আগে “Seed import” করলে public-এর পূর্ণ সেট DB-তে চলে আসে।)</p>
        </div>
        <button type="button" onClick={importSeed} className="rounded-md border border-brand-navy px-3 py-1.5 text-xs font-semibold text-brand-navy hover:bg-brand-tealLight/10">⤓ Seed import</button>
      </div>

      {msg && <div className={`rounded-lg border px-4 py-2.5 text-sm ${msg.ok ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-red-300 bg-red-50 text-red-800'}`}>{msg.ok ? '✓ ' : '✗ '}{msg.text}</div>}

      {/* TEST CONFIG */}
      <section className="rounded-xl border border-brand-tealLight/40 bg-white p-5 shadow-sm space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wide text-brand-navy">{tForm.id ? 'Config এডিট' : 'নতুন test config'}</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div><label className={labelClass}>Level</label><input value={tForm.level} onChange={(e) => setTForm({ ...tForm, level: e.target.value })} placeholder="N5" className={inputClass} disabled={!!tForm.id} /></div>
          <div><label className={labelClass}>সময় (মিনিট)</label><input type="number" value={tForm.duration} onChange={(e) => setTForm({ ...tForm, duration: Number(e.target.value) })} className={inputClass} /></div>
          <div><label className={labelClass}>Pass স্কোর</label><input type="number" value={tForm.passingScore} onChange={(e) => setTForm({ ...tForm, passingScore: Number(e.target.value) })} className={inputClass} /></div>
          <label className="mt-5 flex items-center gap-2 text-sm text-brand-navy"><input type="checkbox" checked={tForm.published} onChange={(e) => setTForm({ ...tForm, published: e.target.checked })} /> প্রকাশিত</label>
        </div>
        <Tri form={tForm} set={(p) => setTForm({ ...tForm, ...p })} k="description" label="বিবরণ" area />
        <div className="flex gap-2">
          <button type="button" onClick={saveT} className="rounded-md bg-brand-teal px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-navy">{tForm.id ? 'আপডেট' : '+ যোগ করুন'}</button>
          {tForm.id && <button type="button" onClick={resetT} className="rounded-md border border-brand-navy px-4 py-2.5 text-sm font-semibold text-brand-navy hover:bg-brand-tealLight/10">বাতিল</button>}
        </div>
        {tests.length > 0 && (
          <ul className="border-t border-brand-tealLight/30 pt-2 text-sm">
            {tests.map((r) => (
              <li key={r.id} className="flex items-center justify-between py-1">
                <span className="text-brand-navy">{r.level} <span className="text-xs text-brand-slate/60">({r.duration} min, pass {r.passingScore})</span></span>
                <span><button type="button" onClick={() => editT(r)} className="mr-2 text-brand-teal hover:text-brand-navy">এডিট</button><button type="button" onClick={() => delT(r)} className="text-red-500 hover:text-red-700">মুছুন</button></span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* QUESTION editor */}
      <section className="rounded-xl border border-brand-tealLight/40 bg-white p-5 shadow-sm space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wide text-brand-navy">{qForm.id ? 'প্রশ্ন এডিট' : 'নতুন প্রশ্ন'}</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div><label className={labelClass}>Level</label><input value={qForm.level} onChange={(e) => setQForm({ ...qForm, level: e.target.value })} placeholder="N5" className={inputClass} /></div>
          <div><label className={labelClass}>Category</label><select value={qForm.category} onChange={(e) => setQForm({ ...qForm, category: e.target.value })} className={inputClass}>{CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
          <div><label className={labelClass}>ক্রম</label><input type="number" value={qForm.sortOrder} onChange={(e) => setQForm({ ...qForm, sortOrder: Number(e.target.value) })} className={inputClass} /></div>
          <label className="mt-5 flex items-center gap-2 text-sm text-brand-navy"><input type="checkbox" checked={qForm.published} onChange={(e) => setQForm({ ...qForm, published: e.target.checked })} /> প্রকাশিত</label>
        </div>
        <Tri form={qForm} set={(p) => setQForm({ ...qForm, ...p })} k="prompt" label="প্রশ্ন" area />
        <div className="rounded-lg bg-brand-tealLight/5 p-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase text-brand-slate">Options — সঠিকটা রেডিও দিয়ে বাছুন</p>
            <button type="button" onClick={addOpt} className="rounded-md border border-brand-teal px-2 py-1 text-xs font-semibold text-brand-teal hover:bg-brand-teal/10">+ option</button>
          </div>
          <div className="mt-2 space-y-2">
            {qForm.options.map((o, i) => (
              <div key={i} className="grid grid-cols-2 gap-2 rounded-md border border-brand-tealLight/40 bg-white p-2 sm:grid-cols-12">
                <label className="flex items-center justify-center sm:col-span-1" title="সঠিক উত্তর">
                  <input type="radio" name="mockCorrect" checked={qForm.correct === o.value && !!o.value} onChange={() => setQForm((f) => ({ ...f, correct: o.value }))} />
                </label>
                <input value={o.value} onChange={(e) => setOpt(i, { value: e.target.value })} placeholder="value (a/b)" className={inputClass + ' sm:col-span-2'} />
                <input value={o.label.bn} onChange={(e) => setOptLabel(i, 'bn', e.target.value)} placeholder="বাংলা" className={inputClass + ' sm:col-span-3'} />
                <input value={o.label.en} onChange={(e) => setOptLabel(i, 'en', e.target.value)} placeholder="English" className={inputClass + ' sm:col-span-3'} />
                <div className="flex gap-1 sm:col-span-3">
                  <input value={o.label.ja} onChange={(e) => setOptLabel(i, 'ja', e.target.value)} placeholder="日本語" className={inputClass} />
                  <button type="button" onClick={() => removeOpt(i)} className="rounded-md bg-red-50 px-2 text-red-600 hover:bg-red-100">✕</button>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-1 text-[11px] text-brand-slate/70">সঠিক option: <strong>{qForm.correct || '—'}</strong></p>
        </div>
        <Tri form={qForm} set={(p) => setQForm({ ...qForm, ...p })} k="explanation" label="ব্যাখ্যা" area />
        <div className="flex gap-2">
          <button type="button" onClick={saveQ} className="rounded-md bg-brand-teal px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-navy">{qForm.id ? 'আপডেট' : '+ যোগ করুন'}</button>
          {qForm.id && <button type="button" onClick={resetQ} className="rounded-md border border-brand-navy px-4 py-2.5 text-sm font-semibold text-brand-navy hover:bg-brand-tealLight/10">বাতিল</button>}
        </div>
      </section>

      {/* QUESTION list */}
      <section className="rounded-xl border border-brand-tealLight/40 bg-white shadow-sm overflow-hidden">
        <h2 className="border-b border-brand-tealLight/40 px-5 py-3 text-sm font-bold uppercase tracking-wide text-brand-navy">প্রশ্ন ({questions.length})</h2>
        {loading ? <p className="p-5 text-sm text-brand-slate">লোড হচ্ছে…</p> : questions.length === 0 ? (
          <p className="p-5 text-sm text-brand-slate/70">কোনো প্রশ্ন নেই। “Seed import” চাপুন। (পাবলিক সাইটে আপাতত বিল্ট-ইন ২০টি প্রশ্ন দেখাবে।)</p>
        ) : (
          <div className="divide-y divide-brand-tealLight/30">
            {Object.entries(grouped).map(([lvl, items]) => (
              <div key={lvl} className="px-5 py-3">
                <p className="text-xs font-bold uppercase text-brand-teal-700">{lvl} <span className="text-brand-slate/60">({items.length})</span></p>
                <ul className="mt-1.5 space-y-1">
                  {items.map((r) => (
                    <li key={r.id} className="flex items-center justify-between gap-3 text-sm">
                      <span className="min-w-0 truncate text-brand-navy">{r.promptEn || r.prompt} <span className="text-xs text-brand-slate/50">[{r.correct}]</span>{!r.published && <span className="ml-1 text-[10px] text-amber-600">(off)</span>}</span>
                      <span className="flex-shrink-0"><button type="button" onClick={() => editQ(r)} className="mr-2 text-brand-teal hover:text-brand-navy">এডিট</button><button type="button" onClick={() => delQ(r)} className="text-red-500 hover:text-red-700">মুছুন</button></span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
