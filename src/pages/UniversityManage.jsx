/**
 * EN: Partner-school admin — CRUD over University (/universities + /[slug]).
 *     Name/kanji/city/established/fees + trilingual tagline + comma-separated
 *     duration & intakes + a highlights list ({en,bn,ja}). One-click seed
 *     imports the bundled six partner schools.
 * BN: Partner-school admin — University (/universities + /[slug])-এর CRUD।
 *     নাম/kanji/শহর/established/fee + ত্রিভাষিক tagline + কমা দিয়ে duration
 *     ও intakes + highlights তালিকা ({en,bn,ja})। এক-ক্লিক seed bundled ছয়
 *     partner school import করে।
 */

import { useEffect, useState } from 'react';
import axiosInterceptor from '../axios/axiosInterceptor';
import { confirmDialog } from '../components/ConfirmDialog';

const inputClass =
  'w-full rounded-md border border-brand-tealLight/60 bg-white px-3 py-2.5 text-sm text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-teal/40 focus:border-brand-teal';
const labelClass = 'mb-1 block text-xs font-bold uppercase tracking-wider text-brand-navy';

const empty = {
  id: null, slug: '', name: '', kanji: '', city: '', established: 0,
  tagline: '', taglineEn: '', taglineJa: '', tuitionAnnual: '', applicationFee: '',
  duration: '', intakes: '', jlptStart: '', studentCapacity: 0, highlights: [], sortOrder: 0, published: true,
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

const toArr = (s) => String(s || '').split(',').map((x) => x.trim()).filter(Boolean);
const L = (en, bn, ja) => ({ en, bn, ja });
const SEED = [
  { slug: 'akamonkai', name: 'Akamonkai Japanese Language School', kanji: '赤門会日本語学校', city: 'tokyo', established: 1985, tuitionAnnual: '৳6.8 lakh', applicationFee: '৳25,000', duration: ['1 year', '1 year 3 months', '1 year 9 months', '2 years'], intakes: ['April', 'July', 'October', 'January'], jlptStart: 'Beginner – Advanced', studentCapacity: 800, taglineEn: "Tokyo's longest-running language school with university-pathway support.", tagline: 'টোকিওর সবচেয়ে দীর্ঘ-চলমান ল্যাঙ্গুয়েজ স্কুল, university-pathway সাপোর্ট।', taglineJa: '東京最古参の日本語学校、進学サポート付き。', highlights: [L('Direct progression to 50+ Japanese universities', '৫০+ জাপানি বিশ্ববিদ্যালয়ে সরাসরি progression', '50校以上への直接進学'), L('Dormitory in Nippori — 15-min train to Akihabara', 'নিপ্পোরিতে dormitory — Akihabara ১৫ মিনিট', '日暮里の寮 — 秋葉原15分'), L('EJU & university-entrance prep included', 'EJU ও বিশ্ববিদ্যালয়-প্রবেশ prep অন্তর্ভুক্ত', 'EJU・大学入試対策含む')] },
  { slug: 'sendagaya', name: 'Sendagaya Japanese Institute', kanji: '千駄ヶ谷日本語学校', city: 'tokyo', established: 1975, tuitionAnnual: '৳7.2 lakh', applicationFee: '৳28,000', duration: ['1 year', '1 year 6 months', '2 years'], intakes: ['April', 'July', 'October', 'January'], jlptStart: 'Beginner – N1 advanced', studentCapacity: 1200, taglineEn: 'Conversational-Japanese-first method, central Tokyo location.', tagline: 'Conversational-Japanese-first পদ্ধতি, সেন্ট্রাল টোকিও।', taglineJa: '会話重視メソッド、東京中心地。', highlights: [L('Yotsuya campus walkable from Shinjuku', 'Yotsuya ক্যাম্পাস Shinjuku থেকে হাঁটা দূরত্বে', '四谷キャンパス、新宿から徒歩圏'), L('Strong job-placement support', 'শক্তিশালী job-placement সাপোর্ট', '強力な就職サポート'), L('Business Japanese track available', 'Business Japanese ট্র্যাক available', 'ビジネス日本語コースあり')] },
  { slug: 'abk-college', name: 'ABK College', kanji: 'ABK学館日本語学校', city: 'tokyo', established: 1980, tuitionAnnual: '৳6.5 lakh', applicationFee: '৳22,000', duration: ['1 year', '1 year 6 months', '2 years'], intakes: ['April', 'October'], jlptStart: 'Beginner – N2', studentCapacity: 600, taglineEn: 'Asia-focused institution with deep Bangladesh ties.', tagline: 'Asia-কেন্দ্রিক প্রতিষ্ঠান, গভীর বাংলাদেশ সংযোগ।', taglineJa: 'アジア重視の学校、深いバングラデシュとの繋がり。', highlights: [L('Asia Bunka Kaikan Foundation since 1957', '১৯৫৭ সাল থেকে Asia Bunka Kaikan Foundation', '1957年からのアジア文化会館'), L('Bunkyo campus near Tokyo Dome, on-site dorm', 'Bunkyo ক্যাম্পাস Tokyo Dome-এর কাছে, dorm সহ', '文京キャンパス、寮併設'), L('Cultural integration with host families', 'host পরিবারের সাথে cultural integration', 'ホストファミリー文化交流')] },
  { slug: 'ecc-kokusai', name: 'ECC Kokusai College', kanji: 'ECC国際外語専門学校', city: 'osaka', established: 1962, tuitionAnnual: '৳6 lakh', applicationFee: '৳20,000', duration: ['1 year', '1 year 6 months', '2 years'], intakes: ['April', 'October'], jlptStart: 'Beginner – N2', studentCapacity: 1000, taglineEn: "Osaka's flagship language college — 30% lower cost than Tokyo.", tagline: 'Osaka-র flagship কলেজ — Tokyo-র তুলনায় ৩০% কম খরচ।', taglineJa: '大阪のフラッグシップ語学校 — 東京より30%低コスト。', highlights: [L('Umeda location — central Osaka rail hub', 'Umeda — কেন্দ্রীয় ওসাকা রেল হাব', '梅田 — 大阪中心の鉄道ハブ'), L('ECC group — 60+ year legacy', 'ECC গ্রুপ — ৬০+ বছরের ঐতিহ্য', 'ECC — 60年以上の歴史'), L('Lower living costs vs Tokyo', 'Tokyo-র তুলনায় কম জীবনযাত্রা', '東京より生活費が低い')] },
  { slug: 'jcli-saitama', name: 'JCLI Japanese Language School (Saitama)', kanji: 'JCLI 日本語学校（埼玉）', city: 'saitama', established: 1982, tuitionAnnual: '৳5.8 lakh', applicationFee: '৳18,000', duration: ['1 year', '1 year 6 months', '2 years'], intakes: ['April', 'July', 'October', 'January'], jlptStart: 'Beginner – N2', studentCapacity: 500, taglineEn: "Inochi's home school in Saitama — on-site Inochi Japan office.", tagline: 'Saitama-তে Inochi-র হোম স্কুল — on-site Inochi জাপান অফিস।', taglineJa: '埼玉の Inochi ホームスクール — Inochi 日本オフィス併設。', highlights: [L('Inochi Japan office on campus — direct support', 'ক্যাম্পাসে Inochi জাপান অফিস — সরাসরি সাপোর্ট', 'キャンパスに Inochi オフィス'), L('Lowest total cost in our list', 'আমাদের তালিকায় সর্বনিম্ন মোট খরচ', '最安総コスト'), L('30 min by train to central Tokyo', 'সেন্ট্রাল টোকিও ৩০ মিনিট ট্রেনে', '東京中心まで30分'), L('Bangladeshi student majority', 'বাংলাদেশি ছাত্র সংখ্যাগরিষ্ঠ', 'バングラデシュ人学生が多数')] },
  { slug: 'fukuoka-ymca', name: 'Fukuoka YMCA Japanese Language School', kanji: '福岡YMCA日本語学校', city: 'fukuoka', established: 1990, tuitionAnnual: '৳5.5 lakh', applicationFee: '৳18,000', duration: ['1 year', '1 year 6 months', '2 years'], intakes: ['April', 'October'], jlptStart: 'Beginner – N2', studentCapacity: 400, taglineEn: "Southern Japan's friendliest hub — lowest living costs in our list.", tagline: 'দক্ষিণ জাপানের বন্ধুসুলভ হাব — সর্বনিম্ন জীবনযাত্রা।', taglineJa: '南日本の最も親切なハブ — 最低の生活費。', highlights: [L('YMCA-backed — global standards, scholarships', 'YMCA-সমর্থিত — বিশ্বমান, স্কলারশিপ', 'YMCA支援 — 世界基準、奨学金'), L('Mild climate, lowest cost of living', 'মৃদু আবহাওয়া, সর্বনিম্ন জীবনযাত্রা', '穏やかな気候、最安の生活費'), L("Job-pipeline to Kyushu's IT sector", 'Kyushu-র IT sector-এ job-pipeline', '九州 IT 分野への就職パイプ')] },
];

export default function UniversityManage() {
  const api = axiosInterceptor();
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  const flash = (ok, text) => { setMsg({ ok, text }); setTimeout(() => setMsg(null), 4000); };

  const load = async () => {
    setLoading(true);
    try { const res = await api.get('/partner-universities?all=true'); setRows(res.data?.universities || []); }
    catch (err) { flash(false, err.response?.data?.error || 'লোড করা যায়নি'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const edit = (r) => setForm({
    ...empty, ...r,
    duration: Array.isArray(r.duration) ? r.duration.join(', ') : (r.duration || ''),
    intakes: Array.isArray(r.intakes) ? r.intakes.join(', ') : (r.intakes || ''),
    highlights: Array.isArray(r.highlights) ? r.highlights.map((h) => ({ en: h.en || '', bn: h.bn || '', ja: h.ja || '' })) : [],
  });
  const reset = () => setForm(empty);

  const setHl = (i, lng, val) => setForm((f) => ({ ...f, highlights: f.highlights.map((h, idx) => (idx === i ? { ...h, [lng]: val } : h)) }));
  const addHl = () => setForm((f) => ({ ...f, highlights: [...f.highlights, { en: '', bn: '', ja: '' }] }));
  const removeHl = (i) => setForm((f) => ({ ...f, highlights: f.highlights.filter((_, idx) => idx !== i) }));

  const save = async () => {
    if (!form.slug.trim() || !form.name.trim()) return flash(false, 'Slug ও নাম দিন');
    setSaving(true);
    const payload = { ...form, duration: toArr(form.duration), intakes: toArr(form.intakes), highlights: form.highlights.filter((h) => h.en || h.bn || h.ja) };
    try {
      if (form.id) { await api.put(`/partner-universities/${form.id}`, payload); flash(true, 'আপডেট হয়েছে'); }
      else { await api.post('/partner-universities', payload); flash(true, 'যোগ হয়েছে'); }
      reset(); load();
    } catch (err) { flash(false, err.response?.data?.error || 'সেভ করা যায়নি'); }
    finally { setSaving(false); }
  };

  const del = async (r) => {
    if (!(await confirmDialog({ title: 'স্কুল মুছবেন?', message: `"${r.name}" মুছে ফেলা হবে।`, confirmText: 'মুছুন' }))) return;
    try { await api.delete(`/partner-universities/${r.id}`); flash(true, 'মুছে ফেলা হয়েছে'); load(); }
    catch (err) { flash(false, err.response?.data?.error || 'মুছে ফেলা যায়নি'); }
  };

  const importSeed = async () => {
    if (!(await confirmDialog({ title: 'Seed import?', message: `${SEED.length}টি স্কুল যোগ হবে।`, danger: false, confirmText: 'Import' }))) return;
    const have = new Set(rows.map((r) => r.slug));
    let n = 0;
    for (let i = 0; i < SEED.length; i += 1) {
      if (have.has(SEED[i].slug)) continue;
      // eslint-disable-next-line no-await-in-loop
      try { await api.post('/partner-universities', { ...SEED[i], sortOrder: i, published: true }); n += 1; } catch { /* skip */ }
    }
    flash(true, `${n}টি import হয়েছে`); load();
  };

  return (
    <div className="space-y-5 max-w-5xl pb-24">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-navy">Partner Schools (Detail)</h1>
          <p className="mt-1 text-sm text-brand-slate">/universities ও /universities/[slug] পেজের স্কুল যোগ/এডিট করুন।</p>
        </div>
        <button type="button" onClick={importSeed} className="rounded-md border border-brand-navy px-3 py-1.5 text-xs font-semibold text-brand-navy hover:bg-brand-tealLight/10">⤓ Seed import</button>
      </div>

      {msg && <div className={`rounded-lg border px-4 py-2.5 text-sm ${msg.ok ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-red-300 bg-red-50 text-red-800'}`}>{msg.ok ? '✓ ' : '✗ '}{msg.text}</div>}

      <section className="rounded-xl border border-brand-tealLight/40 bg-white p-5 shadow-sm space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wide text-brand-navy">{form.id ? 'স্কুল এডিট' : 'নতুন স্কুল'}</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div><label className={labelClass}>Slug</label><input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="akamonkai" className={inputClass} disabled={!!form.id} /></div>
          <div className="sm:col-span-2"><label className={labelClass}>নাম *</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} /></div>
          <div><label className={labelClass}>Kanji</label><input value={form.kanji} onChange={(e) => setForm({ ...form, kanji: e.target.value })} className={inputClass} /></div>
          <div><label className={labelClass}>City (slug)</label><input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="tokyo" className={inputClass} /></div>
          <div><label className={labelClass}>Established</label><input type="number" value={form.established} onChange={(e) => setForm({ ...form, established: Number(e.target.value) })} className={inputClass} /></div>
          <div><label className={labelClass}>Tuition/yr</label><input value={form.tuitionAnnual} onChange={(e) => setForm({ ...form, tuitionAnnual: e.target.value })} placeholder="৳6.8 lakh" className={inputClass} /></div>
          <div><label className={labelClass}>Application fee</label><input value={form.applicationFee} onChange={(e) => setForm({ ...form, applicationFee: e.target.value })} className={inputClass} /></div>
          <div><label className={labelClass}>JLPT start</label><input value={form.jlptStart} onChange={(e) => setForm({ ...form, jlptStart: e.target.value })} placeholder="Beginner – N2" className={inputClass} /></div>
          <div><label className={labelClass}>Capacity</label><input type="number" value={form.studentCapacity} onChange={(e) => setForm({ ...form, studentCapacity: Number(e.target.value) })} className={inputClass} /></div>
          <div className="sm:col-span-2"><label className={labelClass}>Duration (কমা)</label><input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="1 year, 2 years" className={inputClass} /></div>
          <div className="sm:col-span-2"><label className={labelClass}>Intakes (কমা)</label><input value={form.intakes} onChange={(e) => setForm({ ...form, intakes: e.target.value })} placeholder="April, October" className={inputClass} /></div>
        </div>
        <Tri form={form} set={(p) => setForm({ ...form, ...p })} k="tagline" label="ট্যাগলাইন" area />

        <div className="rounded-lg bg-brand-tealLight/5 p-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase text-brand-slate">Highlights</p>
            <button type="button" onClick={addHl} className="rounded-md border border-brand-teal px-2 py-1 text-xs font-semibold text-brand-teal hover:bg-brand-teal/10">+ highlight</button>
          </div>
          <div className="mt-2 space-y-2">
            {form.highlights.map((h, i) => (
              <div key={i} className="grid grid-cols-1 gap-2 rounded-md border border-brand-tealLight/40 bg-white p-2 sm:grid-cols-12">
                <input value={h.bn} onChange={(e) => setHl(i, 'bn', e.target.value)} placeholder="বাংলা" className={inputClass + ' sm:col-span-4'} />
                <input value={h.en} onChange={(e) => setHl(i, 'en', e.target.value)} placeholder="English" className={inputClass + ' sm:col-span-4'} />
                <div className="flex gap-1 sm:col-span-4">
                  <input value={h.ja} onChange={(e) => setHl(i, 'ja', e.target.value)} placeholder="日本語" className={inputClass} />
                  <button type="button" onClick={() => removeHl(i)} className="rounded-md bg-red-50 px-2 text-red-600 hover:bg-red-100">✕</button>
                </div>
              </div>
            ))}
          </div>
        </div>

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
          <p className="p-5 text-sm text-brand-slate/70">কোনো স্কুল নেই। “Seed import” চাপুন। (পাবলিক সাইটে আপাতত বিল্ট-ইন তালিকা দেখাবে।)</p>
        ) : (
          <ul className="divide-y divide-brand-tealLight/30">
            {rows.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 px-5 py-2.5 text-sm hover:bg-brand-tealLight/5">
                <span className="min-w-0 truncate text-brand-navy">{r.name} <span className="text-xs text-brand-slate/60">{r.city}</span>{!r.published && <span className="ml-2 text-[10px] text-amber-600">(off)</span>}</span>
                <span className="flex-shrink-0"><button type="button" onClick={() => edit(r)} className="mr-2 text-brand-teal hover:text-brand-navy">এডিট</button><button type="button" onClick={() => del(r)} className="text-red-500 hover:text-red-700">মুছুন</button></span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
