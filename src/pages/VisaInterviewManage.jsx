/**
 * EN: Visa interview prep admin — CRUD over VisaInterviewItem (/visa-interview).
 *     One row = one question; each carries its category's key + label + intro
 *     (repeated across the category's questions) plus question/tip/modelAnswer/
 *     redFlag, all trilingual. List is grouped by category. One-click seed
 *     imports the bundled question bank.
 * BN: ভিসা ইন্টারভিউ prep admin — VisaInterviewItem (/visa-interview)-এর CRUD।
 *     এক row = এক প্রশ্ন; প্রতিটা তার category-র key + label + intro বহন করে
 *     (category-র প্রশ্নগুলোয় পুনরাবৃত্ত) + question/tip/modelAnswer/redFlag,
 *     সব ত্রিভাষিক। তালিকা category অনুযায়ী group। এক-ক্লিক seed bundled
 *     প্রশ্নব্যাংক import করে।
 */

import { useEffect, useState } from 'react';
import axiosInterceptor from '../axios/axiosInterceptor';
import { confirmDialog } from '../components/ConfirmDialog';

const inputClass =
  'w-full rounded-md border border-brand-tealLight/60 bg-white px-3 py-2.5 text-sm text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-teal/40 focus:border-brand-teal';
const labelClass = 'mb-1 block text-xs font-bold uppercase tracking-wider text-brand-navy';

const empty = {
  id: null, categoryKey: '', categoryLabel: '', categoryLabelEn: '', categoryLabelJa: '',
  categoryIntro: '', categoryIntroEn: '', categoryIntroJa: '',
  question: '', questionEn: '', questionJa: '', tip: '', tipEn: '', tipJa: '',
  modelAnswer: '', modelAnswerEn: '', modelAnswerJa: '', redFlag: '', redFlagEn: '', redFlagJa: '',
  groupOrder: 0, sortOrder: 0, published: true,
};

// EN: Bundled question bank (mirrors the frontend seed). Each row repeats its
//     category's label + intro so the public grouping renders identically.
// BN: bundled প্রশ্নব্যাংক (frontend seed-এর mirror)। প্রতিটা row তার
//     category-র label + intro বহন করে যাতে public grouping হুবহু রেন্ডার হয়।
const CAT = {
  purpose: { groupOrder: 0, categoryKey: 'study-purpose', categoryLabelEn: 'Study purpose', categoryLabel: 'অধ্যয়নের উদ্দেশ্য', categoryLabelJa: '留学目的', categoryIntroEn: 'Why Japan and not another country? Why this school? These are the first questions and the most-failed answers come from generic memorised lines.', categoryIntro: 'জাপান কেন, অন্য দেশ নয় কেন? এই স্কুল কেন? প্রথম প্রশ্নগুলোতে যারা মুখস্থ সাধারণ লাইন বলে তারাই বেশি ফেল করে।', categoryIntroJa: 'なぜ日本？なぜこの学校？最初の質問で、暗記した一般的な答えで失敗する候補者が最も多い。' },
  sponsor: { groupOrder: 1, categoryKey: 'sponsor', categoryLabelEn: 'Financial sponsor', categoryLabel: 'আর্থিক sponsor', categoryLabelJa: '経費支弁者', categoryIntroEn: "Who pays, why, and whether the money is real. Inconsistent sponsor stories are a top rejection reason.", categoryIntro: 'কে দিচ্ছে, কেন, এবং টাকা আসল কিনা। sponsor-এর গল্পে অসঙ্গতি rejection-এর শীর্ষ কারণ।', categoryIntroJa: '誰が支払うか、なぜか、その資金は本物か。支弁者の話の矛盾は拒否理由の最上位。' },
  ret: { groupOrder: 2, categoryKey: 'return-plan', categoryLabelEn: 'Return / future plan', categoryLabel: 'ফেরত / ভবিষ্যত পরিকল্পনা', categoryLabelJa: '帰国・将来計画', categoryIntroEn: 'Officers want a credible plan after Japan — returning home or transitioning to legitimate work.', categoryIntro: 'অফিসার চান জাপানের পরে বিশ্বাসযোগ্য পরিকল্পনা — ফেরা বা বৈধ কাজে রূপান্তর।', categoryIntroJa: '留学後の信頼できる計画 — 帰国でも正規就労への移行でも。' },
  lang: { groupOrder: 3, categoryKey: 'language', categoryLabelEn: 'Japanese ability', categoryLabel: 'জাপানি দক্ষতা', categoryLabelJa: '日本語能力', categoryIntroEn: 'Officers may switch to Japanese mid-interview. Even with N5, a basic self-introduction shows you study.', categoryIntro: 'অফিসার মাঝপথে জাপানিতে কথা বলতে পারেন। N5 হলেও মৌলিক self-introduction দেখায় আপনি অধ্যয়ন করছেন।', categoryIntroJa: '面接の途中で日本語に切り替えることがある。N5でも自己紹介ができれば学習の証。' },
  career: { groupOrder: 4, categoryKey: 'career', categoryLabelEn: 'Career & motivation', categoryLabel: 'ক্যারিয়ার ও motivation', categoryLabelJa: 'キャリア・動機', categoryIntroEn: "How does Japanese fit your long-term career? Officers reject candidates who can't connect study to a career arc.", categoryIntro: 'জাপানি ভাষা আপনার দীর্ঘমেয়াদি ক্যারিয়ারে কীভাবে fit হয়? সংযোগ না করতে পারলে reject।', categoryIntroJa: '日本語が長期キャリアにどう活きるか。結びつけられない候補者は不合格。' },
  edu: { groupOrder: 5, categoryKey: 'education', categoryLabelEn: 'Past education & gaps', categoryLabel: 'অতীত শিক্ষা ও gap', categoryLabelJa: '学歴・ブランク', categoryIntroEn: 'Any gap year, low GPA, or repeated subjects gets scrutiny. Honest, factual answers beat fabricated stories.', categoryIntro: 'যেকোনো gap year, কম GPA বা repeated subject যাচাই হয়। সৎ, factual উত্তর সবসময় ভালো।', categoryIntroJa: 'ブランク年、低GPA、再履修は精査される。正直で事実に基づく答えが勝る。' },
};

const SEED = [
  { ...CAT.purpose, questionEn: 'Why did you choose Japan for your studies?', question: 'পড়ালেখার জন্য জাপান কেন বেছে নিলেন?', questionJa: 'なぜ日本で勉強しようと思いましたか？', tipEn: 'Tie your answer to a specific industry, technology, or cultural trait you have researched — not just "Japan is developed".', tip: 'নির্দিষ্ট শিল্প/প্রযুক্তি/সংস্কৃতির সাথে যুক্ত করুন — শুধু "জাপান উন্নত" নয়।', tipJa: '「日本は発展している」ではなく、調べた具体的な産業・技術・文化と結びつける。', modelAnswerEn: "I want to study Japanese and then work in Japan's manufacturing sector — particularly automotive engineering. Toyota's lean production is studied worldwide; I want to learn from that culture and bring it back to Bangladesh's industry.", modelAnswer: 'জাপানি শিখে manufacturing খাতে (automotive engineering) কাজ করতে চাই। Toyota-র lean production বিশ্বব্যাপী অধ্যয়ন হয়; সেই সংস্কৃতি থেকে শিখে বাংলাদেশের শিল্পে আনতে চাই।', modelAnswerJa: '日本語を学び製造業（自動車工学）で働きたい。トヨタのリーン生産は世界中で研究され、その文化から学びバングラデシュの産業に持ち帰りたい。', redFlagEn: 'Avoid: "Because Japan is a beautiful country" or "My friend is there".', redFlag: 'এড়ান: "জাপান সুন্দর দেশ" বা "বন্ধু সেখানে আছে"।', redFlagJa: '避ける：「美しい国だから」「友人がいるから」。', sortOrder: 0 },
  { ...CAT.purpose, questionEn: 'Why this specific Japanese language school?', question: 'এই নির্দিষ্ট জাপানি ল্যাঙ্গুয়েজ স্কুল কেন?', questionJa: 'なぜこの日本語学校を選びましたか？', tipEn: 'Name 2 concrete reasons: location, programme structure, university-pathway support, or class style.', tip: '২টি কারণ বলুন: লোকেশন, প্রোগ্রাম গঠন, university-pathway, বা ক্লাস স্টাইল।', tipJa: '立地、プログラム、進学サポート等の具体的理由を2つ。', modelAnswerEn: "I chose it because its conversation-focused method matches my goal of working in Japan, and its Saitama campus has stronger Bangladeshi alumni mentorship.", modelAnswer: 'conversation-focused পদ্ধতি জাপানে কাজের লক্ষ্যের সাথে মেলে, এবং Saitama campus-এ বাংলাদেশি alumni mentorship শক্তিশালী।', modelAnswerJa: '会話中心の指導法が目標に合致し、埼玉キャンパスにバングラデシュ出身の卒業生メンターが多いから。', redFlagEn: 'Avoid: "My agent suggested it". The officer expects you to know why.', redFlag: 'এড়ান: "এজেন্ট পরামর্শ দিয়েছে"। অফিসার আপনার কারণ চান।', redFlagJa: '避ける：「エージェントに勧められた」。本人の理由を求められる。', sortOrder: 1 },
  { ...CAT.sponsor, questionEn: 'Who is your financial sponsor and their relationship to you?', question: 'আপনার আর্থিক sponsor কে এবং সম্পর্ক কী?', questionJa: '経費支弁者は誰で、関係は？', tipEn: 'Be precise about the relationship. If not a parent, explain naturally why they fund you.', tip: 'সম্পর্কে স্পষ্ট হোন। অভিভাবক না হলে কেন fund করছেন ব্যাখ্যা করুন।', tipJa: '関係を正確に。親以外なら支援理由を自然に説明。', modelAnswerEn: 'My elder brother is my sponsor. He has worked in Saudi Arabia for 12 years and saved for my education — a family investment; once I earn in Japan I will support our parents.', modelAnswer: 'বড় ভাই sponsor। ১২ বছর সৌদিতে কাজ করে আমার শিক্ষার জন্য সঞ্চয় করেছেন — পারিবারিক বিনিয়োগ; জাপানে আয় শুরু করলে অভিভাবকদের সহায়তা করব।', modelAnswerJa: '兄が支弁者。サウジで12年働き私の教育のため貯蓄。家族投資で、日本で稼いだら両親を支える。', redFlagEn: 'Avoid vague "My uncle" without explaining why a relative outside immediate family pays.', redFlag: 'অস্পষ্ট "চাচা" এড়ান — কেন আত্মীয় টাকা দিচ্ছেন ব্যাখ্যা করুন।', redFlagJa: '「叔父」など説明なしは避ける。', sortOrder: 0 },
  { ...CAT.sponsor, questionEn: "What is your sponsor's monthly income or bank balance?", question: 'sponsor-এর মাসিক আয় বা ব্যাংক ব্যালেন্স কত?', questionJa: '支弁者の月収または銀行残高は？', tipEn: 'Memorise the exact figure on your bank statement. Officers cross-check.', tip: 'স্টেটমেন্টের সঠিক অংক মুখস্থ রাখুন। অফিসার যাচাই করেন।', tipJa: '銀行明細の正確な金額を覚える。照合される。', modelAnswerEn: 'My sponsor has approximately ৳15 lakh in his City Bank savings, 7 months old. His monthly income is about ৳1.4 lakh from salary plus rental income.', modelAnswer: 'sponsor-এর City Bank-এ আনুমানিক ১৫ লাখ টাকা, ৭ মাস পুরনো। মাসিক আয় ~১.৪ লাখ (বেতন + ভাড়া)।', modelAnswerJa: 'シティバンクに約15ラック、7ヶ月前から。月収は給与+家賃で約1.4ラック。', redFlagEn: 'Avoid "I will have to check" or rounding up dramatically.', redFlag: 'এড়ান: "দেখতে হবে" বা অস্পষ্ট গোল করা।', redFlagJa: '「確認が必要」「大きく丸める」は避ける。', sortOrder: 1 },
  { ...CAT.ret, questionEn: 'What will you do after completing your language course?', question: 'ভাষা কোর্স শেষে কী করবেন?', questionJa: '日本語コース修了後、何をしますか？', tipEn: 'Have a real, sequential plan and stay consistent with your paperwork. Be honest if you plan to work in Japan.', tip: 'সত্যিকারের ক্রমিক পরিকল্পনা; ফর্মের সাথে সঙ্গতি রাখুন। জাপানে কাজ করতে চাইলে সৎ থাকুন।', tipJa: '現実的で順序立てた計画を。書類と一致させ、就労希望なら正直に。', modelAnswerEn: 'After my 2-year course I plan to apply for a Specified Skilled Worker visa in manufacturing, work 5+ years, then return to Bangladesh with experience.', modelAnswer: '২ বছরের কোর্স শেষে manufacturing-এ Specified Skilled Worker ভিসায় আবেদন, ৫+ বছর কাজ, তারপর অভিজ্ঞতা নিয়ে দেশে ফেরা।', modelAnswerJa: '2年のコース後、製造業の特定技能ビザに申請し5年以上働き、経験を持って帰国予定。', redFlagEn: 'Avoid contradicting your visa-application paperwork.', redFlag: 'ভিসা ফর্মের সাথে দ্বন্দ্ব এড়ান।', redFlagJa: 'ビザ申請書類と矛盾しない。', sortOrder: 0 },
  { ...CAT.lang, questionEn: 'Can you introduce yourself in Japanese?', question: 'জাপানিতে নিজেকে পরিচয় করিয়ে দিতে পারবেন?', questionJa: '日本語で自己紹介できますか？', tipEn: 'Practise a 30-second intro: name, age, hometown, study, hobby, why Japan. Slow and clear — willingness over perfection.', tip: '৩০-সেকেন্ডের পরিচয় প্র্যাকটিস: নাম, বয়স, বাড়ি, অধ্যয়ন, শখ, জাপান কেন। ধীরে স্পষ্ট — ইচ্ছাই মুখ্য।', tipJa: '30秒の自己紹介を練習。ゆっくり明瞭に、完璧さより意欲。', modelAnswerEn: 'はじめまして。私の名前は◯◯です。バングラデシュから来ました。今、日本語を勉強しています。よろしくお願いします。', modelAnswer: 'はじめまして。私の名前は◯◯です。বাংলাদেশ থেকে এসেছি। এখন জাপানি শিখছি। (ইন্টারভিউয়ে জাপানিতে বলবেন।)', modelAnswerJa: 'はじめまして。私の名前は◯◯です。バングラデシュから来ました。今、日本語を勉強しています。よろしくお願いします。', redFlagEn: 'Avoid going silent. One line of Japanese beats English-only.', redFlag: 'চুপ থাকবেন না। এক লাইন জাপানিও শুধু ইংরেজির চেয়ে ভালো।', redFlagJa: '沈黙は避ける。日本語1文でも英語のみより良い。', sortOrder: 0 },
  { ...CAT.career, questionEn: 'How will Japanese language skills help your career?', question: 'জাপানি দক্ষতা ক্যারিয়ারে কীভাবে সাহায্য করবে?', questionJa: '日本語能力はキャリアにどう役立ちますか？', tipEn: 'Be specific about industry, role, and the gap Japanese-speaking professionals fill in your home market.', tip: 'শিল্প, ভূমিকা ও দেশের বাজারে জাপানি-ভাষী professional-এর gap সম্পর্কে নির্দিষ্ট হোন।', tipJa: '業界・役割・母国市場の日本語人材不足を具体的に。', modelAnswerEn: "Bangladesh's growing automotive-parts industry supplies Japanese OEMs. Japanese-speaking engineers bridge our factories and Japanese clients — I want to fill that gap with JLPT N2 and Japan experience.", modelAnswer: 'বাংলাদেশের automotive-parts শিল্প জাপানি OEM-দের supply দেয়। জাপানি-ভাষী engineer কারখানা ও client-এর সেতু — JLPT N2 ও জাপান অভিজ্ঞতা নিয়ে এই gap পূরণ করতে চাই।', modelAnswerJa: 'バングラデシュの自動車部品産業は日系OEMに供給。日本語が話せる技術者は工場と日本の顧客の架け橋 — JLPT N2と日本経験でその空白を埋めたい。', redFlagEn: 'Avoid generic "I want a good job". Officers want a specific market gap.', redFlag: 'সাধারণ "ভালো চাকরি চাই" এড়ান। নির্দিষ্ট বাজার-গ্যাপ বলুন।', redFlagJa: '「良い仕事が欲しい」は避け、具体的な市場の空白を。', sortOrder: 0 },
  { ...CAT.edu, questionEn: 'Why is there a gap between your last education and now?', question: 'শেষ শিক্ষা ও বর্তমানের মধ্যে gap কেন?', questionJa: '最終学歴と現在の間のブランクの理由は？', tipEn: 'If for JLPT prep, family work, or savings — say so directly with proof you can show.', tip: 'JLPT prep, পরিবার-কাজ বা সঞ্চয়ের জন্য হলে সরাসরি বলুন, প্রমাণসহ।', tipJa: 'JLPT準備・家業・貯蓄のためなら直接述べ、証明を用意。', modelAnswerEn: 'After my Bachelor\'s I worked 14 months at my family business while preparing for JLPT N5 at Inochi. Working with our Japanese suppliers convinced me real fluency would change my contribution.', modelAnswer: 'Bachelor\'s-এর পর ১৪ মাস পরিবারের ব্যবসায় কাজ + Inochi-তে JLPT N5 prep। জাপানি supplier-দের সাথে কাজ করে বুঝেছি প্রকৃত fluency আমার অবদান বদলাবে।', modelAnswerJa: '学士後14ヶ月家業に従事しInochiでJLPT N5準備。日本の仕入先との仕事で流暢さの重要性を確信。', redFlagEn: 'Avoid "I was just relaxing." Always have a documented reason.', redFlag: 'এড়ান: "শুধু আরাম করছিলাম।" সবসময় documented কারণ রাখুন।', redFlagJa: '「休んでいた」は避ける。文書化した理由を。', sortOrder: 0 },
];

// EN: Module-level so inputs keep focus (a component defined inside the parent
//     is recreated each render → remount → focus loss every keystroke).
// BN: module-level — input focus ধরে রাখে (parent-এর ভেতরে define করলে প্রতি
//     render-এ recreate → remount → প্রতি keystroke-এ focus হারায়)।
function TriField({ form, setForm, k, label, area }) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
      {[['', 'বাংলা'], ['En', 'English'], ['Ja', '日本語']].map(([suf, lng]) => {
        const key = k + suf;
        return (
          <div key={key}>
            <label className={labelClass}>{label} ({lng})</label>
            {area
              ? <textarea value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} rows={2} className={inputClass} />
              : <input value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className={inputClass} />}
          </div>
        );
      })}
    </div>
  );
}

export default function VisaInterviewManage() {
  const api = axiosInterceptor();
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  const flash = (ok, text) => { setMsg({ ok, text }); setTimeout(() => setMsg(null), 4000); };

  const load = async () => {
    setLoading(true);
    try { const res = await api.get('/visa-interview?all=true'); setRows(res.data?.categories || []); }
    catch (err) { flash(false, err.response?.data?.error || 'লোড করা যায়নি'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const edit = (r) => { setForm({ ...empty, ...r }); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const reset = () => setForm(empty);

  const save = async () => {
    if (!form.categoryKey.trim()) return flash(false, 'Category key দিন');
    if (!form.question.trim() && !form.questionEn.trim()) return flash(false, 'প্রশ্ন দিন');
    setSaving(true);
    try {
      if (form.id) { await api.put(`/visa-interview/${form.id}`, form); flash(true, 'আপডেট হয়েছে'); }
      else { await api.post('/visa-interview', form); flash(true, 'যোগ হয়েছে'); }
      reset(); load();
    } catch (err) { flash(false, err.response?.data?.error || 'সেভ করা যায়নি'); }
    finally { setSaving(false); }
  };

  const del = async (r) => {
    if (!(await confirmDialog({ title: 'প্রশ্ন মুছবেন?', message: 'এই প্রশ্নটি মুছে ফেলা হবে।', confirmText: 'মুছুন' }))) return;
    try { await api.delete(`/visa-interview/${r.id}`); flash(true, 'মুছে ফেলা হয়েছে'); load(); }
    catch (err) { flash(false, err.response?.data?.error || 'মুছে ফেলা যায়নি'); }
  };

  const importSeed = async () => {
    if (!(await confirmDialog({ title: 'Seed import?', message: `${SEED.length}টি প্রশ্ন যোগ হবে।`, danger: false, confirmText: 'Import' }))) return;
    const have = new Set(rows.map((r) => (r.questionEn || r.question)));
    let n = 0;
    for (const s of SEED.filter((s) => !have.has(s.questionEn))) {
      // eslint-disable-next-line no-await-in-loop
      try { await api.post('/visa-interview', { ...s, published: true }); n += 1; } catch { /* skip */ }
    }
    flash(true, `${n}টি import হয়েছে`); load();
  };

  // Group rows by category for the list view.
  const grouped = rows.reduce((acc, r) => {
    (acc[r.categoryKey] = acc[r.categoryKey] || { label: r.categoryLabelEn || r.categoryKey, items: [] }).items.push(r);
    return acc;
  }, {});

  return (
    <div className="space-y-5 max-w-5xl pb-24">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-navy">Visa Interview Prep</h1>
          <p className="mt-1 text-sm text-brand-slate">/visa-interview পেজের প্রশ্ন (category-ভিত্তিক) যোগ/এডিট করুন। একই category-র সব প্রশ্নে একই label/intro দিন।</p>
        </div>
        <button type="button" onClick={importSeed} className="rounded-md border border-brand-navy px-3 py-1.5 text-xs font-semibold text-brand-navy hover:bg-brand-tealLight/10">⤓ Seed import</button>
      </div>

      {msg && <div className={`rounded-lg border px-4 py-2.5 text-sm ${msg.ok ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-red-300 bg-red-50 text-red-800'}`}>{msg.ok ? '✓ ' : '✗ '}{msg.text}</div>}

      <section className="rounded-xl border border-brand-tealLight/40 bg-white p-5 shadow-sm space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wide text-brand-navy">{form.id ? 'প্রশ্ন এডিট' : 'নতুন প্রশ্ন'}</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div><label className={labelClass}>Category key</label><input value={form.categoryKey} onChange={(e) => setForm({ ...form, categoryKey: e.target.value })} placeholder="study-purpose" className={inputClass} /></div>
          <div><label className={labelClass}>Group order</label><input type="number" value={form.groupOrder} onChange={(e) => setForm({ ...form, groupOrder: Number(e.target.value) })} className={inputClass} /></div>
          <div><label className={labelClass}>প্রশ্নের ক্রম</label><input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} className={inputClass} /></div>
          <label className="mt-5 flex items-center gap-2 text-sm text-brand-navy"><input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} /> প্রকাশিত</label>
        </div>
        <div className="rounded-lg bg-brand-tealLight/5 p-3 space-y-3">
          <p className="text-xs font-bold uppercase text-brand-slate">Category (এই category-র সব প্রশ্নে একই রাখুন)</p>
          <TriField form={form} setForm={setForm} k="categoryLabel" label="Category নাম" />
          <TriField form={form} setForm={setForm} k="categoryIntro" label="Category ভূমিকা" area />
        </div>
        <TriField form={form} setForm={setForm} k="question" label="প্রশ্ন" area />
        <TriField form={form} setForm={setForm} k="tip" label="Tip" area />
        <TriField form={form} setForm={setForm} k="modelAnswer" label="মডেল উত্তর" area />
        <TriField form={form} setForm={setForm} k="redFlag" label="Red flag (যা এড়াবেন)" area />
        <div className="flex gap-2">
          <button type="button" onClick={save} disabled={saving} className="rounded-md bg-brand-teal px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-navy disabled:opacity-50">{saving ? 'সেভ…' : form.id ? 'আপডেট' : '+ যোগ করুন'}</button>
          {form.id && <button type="button" onClick={reset} className="rounded-md border border-brand-navy px-4 py-2.5 text-sm font-semibold text-brand-navy hover:bg-brand-tealLight/10">বাতিল</button>}
        </div>
      </section>

      <section className="rounded-xl border border-brand-tealLight/40 bg-white shadow-sm overflow-hidden">
        <h2 className="border-b border-brand-tealLight/40 px-5 py-3 text-sm font-bold uppercase tracking-wide text-brand-navy">তালিকা ({rows.length} প্রশ্ন)</h2>
        {loading ? <p className="p-5 text-sm text-brand-slate">লোড হচ্ছে…</p> : rows.length === 0 ? (
          <p className="p-5 text-sm text-brand-slate/70">কোনো প্রশ্ন নেই। “Seed import” চাপুন বা যোগ করুন। (পাবলিক সাইটে আপাতত বিল্ট-ইন তালিকা দেখাবে।)</p>
        ) : (
          <div className="divide-y divide-brand-tealLight/30">
            {Object.entries(grouped).map(([key, g]) => (
              <div key={key} className="px-5 py-3">
                <p className="text-xs font-bold uppercase text-brand-teal-700">{g.label} <span className="text-brand-slate/60">({g.items.length})</span></p>
                <ul className="mt-1.5 space-y-1">
                  {g.items.map((r) => (
                    <li key={r.id} className="flex items-center justify-between gap-3 text-sm">
                      <span className="min-w-0 truncate text-brand-navy">{r.questionEn || r.question}{!r.published && <span className="ml-2 text-[10px] text-amber-600">(unpublished)</span>}</span>
                      <span className="flex-shrink-0"><button type="button" onClick={() => edit(r)} className="mr-2 text-brand-teal hover:text-brand-navy">এডিট</button><button type="button" onClick={() => del(r)} className="text-red-500 hover:text-red-700">মুছুন</button></span>
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
