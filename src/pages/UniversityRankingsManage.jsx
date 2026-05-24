/**
 * EN: University rankings admin — CRUD over UniversityRanking (the
 *     /university-rankings table). Numeric facts + a trilingual one-line
 *     highlight. One-click seed imports the bundled top-12 list.
 * BN: University rankings admin — UniversityRanking (/university-rankings
 *     টেবিল)-এর CRUD। সংখ্যাগত তথ্য + ত্রিভাষিক এক-লাইন highlight। এক-ক্লিক
 *     seed bundled top-12 import করে।
 */

import { useEffect, useState } from 'react';
import axiosInterceptor from '../axios/axiosInterceptor';
import { confirmDialog } from '../components/ConfirmDialog';

const inputClass =
  'w-full rounded-md border border-brand-tealLight/60 bg-white px-3 py-2.5 text-sm text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-teal/40 focus:border-brand-teal';
const labelClass = 'mb-1 block text-xs font-bold uppercase tracking-wider text-brand-navy';

const empty = { id: null, rank: 0, name: '', city: '', type: 'national', qsAsia: 0, intlStudents: 0, englishPrograms: true, jlptRequired: '', tuitionAnnual: '', highlight: '', highlightEn: '', highlightJa: '', sortOrder: 0, published: true };

const SEED = [
  { rank: 1, name: 'The University of Tokyo (東京大学)', city: 'tokyo', type: 'national', qsAsia: 4, intlStudents: 4500, englishPrograms: true, jlptRequired: 'N1 (some N2)', tuitionAnnual: '৳3.6 lakh', highlightEn: "Japan's #1 — strongest research output, large international cohort.", highlight: 'জাপানের #১ — সর্বোচ্চ research output, বড় international cohort।', highlightJa: '日本のNo.1 — 研究実績最強、大規模な留学生コホート。' },
  { rank: 2, name: 'Kyoto University (京都大学)', city: 'kyoto', type: 'national', qsAsia: 8, intlStudents: 2400, englishPrograms: true, jlptRequired: 'N1', tuitionAnnual: '৳3.6 lakh', highlightEn: 'Strong sciences and humanities; calmer pace than Tokyo.', highlight: 'শক্তিশালী বিজ্ঞান ও মানবিক; টোকিওর চেয়ে শান্ত পরিবেশ।', highlightJa: '理系・人文学に強い、東京より落ち着いた雰囲気。' },
  { rank: 3, name: 'Osaka University (大阪大学)', city: 'osaka', type: 'national', qsAsia: 18, intlStudents: 2100, englishPrograms: true, jlptRequired: 'N1 (N2 acceptable)', tuitionAnnual: '৳3.6 lakh', highlightEn: 'Large engineering school; multiple English-medium graduate programmes.', highlight: 'বড় engineering school; একাধিক English-medium graduate program।', highlightJa: '大規模な工学部；複数の英語修士プログラム。' },
  { rank: 4, name: 'Tohoku University (東北大学)', city: 'sendai', type: 'national', qsAsia: 22, intlStudents: 2200, englishPrograms: true, jlptRequired: 'N2', tuitionAnnual: '৳3.6 lakh', highlightEn: 'International-friendly with low cost of living in Sendai.', highlight: 'International-বান্ধব, Sendai-তে কম জীবনযাত্রার খরচ।', highlightJa: '国際派志向、仙台の生活費が低い。' },
  { rank: 5, name: 'Tokyo Institute of Technology (東京工業大学)', city: 'tokyo', type: 'national', qsAsia: 16, intlStudents: 1700, englishPrograms: true, jlptRequired: 'N2', tuitionAnnual: '৳3.6 lakh', highlightEn: 'Engineering powerhouse; over 30% of grad students international.', highlight: 'Engineering powerhouse; ৩০%-এর বেশি grad student international।', highlightJa: '工学の強豪、修士課程の30%以上が留学生。' },
  { rank: 6, name: 'Nagoya University (名古屋大学)', city: 'nagoya', type: 'national', qsAsia: 25, intlStudents: 1900, englishPrograms: true, jlptRequired: 'N2', tuitionAnnual: '৳3.6 lakh', highlightEn: 'G30 programme — full degrees available in English.', highlight: 'G30 program — পূর্ণ ডিগ্রি ইংরেজিতে available।', highlightJa: 'G30 プログラム — 完全英語学位が取得可能。' },
  { rank: 7, name: 'Hokkaido University (北海道大学)', city: 'sapporo', type: 'national', qsAsia: 30, intlStudents: 1400, englishPrograms: true, jlptRequired: 'N2', tuitionAnnual: '৳3.6 lakh', highlightEn: 'Large campus, strong sciences. Heavy winters but lower competition.', highlight: 'বড় ক্যাম্পাস, শক্তিশালী বিজ্ঞান। ভারী শীত কিন্তু কম প্রতিযোগিতা।', highlightJa: '広大なキャンパス、強い理系。冬は厳しいが競争率は低め。' },
  { rank: 8, name: 'Kyushu University (九州大学)', city: 'fukuoka', type: 'national', qsAsia: 28, intlStudents: 2400, englishPrograms: true, jlptRequired: 'N2', tuitionAnnual: '৳3.6 lakh', highlightEn: 'Largest international cohort outside Tokyo; strong Asia-pivot programmes.', highlight: 'টোকিওর বাইরে সবচেয়ে বড় international cohort; শক্তিশালী Asia-pivot program।', highlightJa: '東京以外で最大の留学生コホート、アジア重視プログラムが充実。' },
  { rank: 9, name: 'Waseda University (早稲田大学)', city: 'tokyo', type: 'private', qsAsia: 65, intlStudents: 8000, englishPrograms: true, jlptRequired: 'N2 (some programmes N3)', tuitionAnnual: '৳9 – 12 lakh', highlightEn: 'Most international students of any Japanese uni; flexible English-track options.', highlight: 'যেকোনো জাপানি ইউনিভার্সিটিতে সবচেয়ে বেশি international ছাত্র; নমনীয় English-track।', highlightJa: '日本の大学で留学生数最多、柔軟な英語コース。' },
  { rank: 10, name: 'Keio University (慶應義塾大学)', city: 'tokyo', type: 'private', qsAsia: 70, intlStudents: 2200, englishPrograms: true, jlptRequired: 'N2', tuitionAnnual: '৳9 – 12 lakh', highlightEn: 'Premier private — strong business and economics; corporate alumni network.', highlight: 'শীর্ষ private — শক্তিশালী business ও economics; corporate alumni নেটওয়ার্ক।', highlightJa: '私立最高峰 — ビジネス・経済学に強い、企業卒業生ネットワーク。' },
  { rank: 11, name: 'Sophia University (上智大学)', city: 'tokyo', type: 'private', qsAsia: 95, intlStudents: 1500, englishPrograms: true, jlptRequired: 'N3 acceptable for English programmes', tuitionAnnual: '৳9 – 12 lakh', highlightEn: 'Best for English-only programmes — accepts students with limited Japanese.', highlight: 'English-only program-এর জন্য সেরা — সীমিত জাপানি জ্ঞান গ্রহণযোগ্য।', highlightJa: '英語完結プログラムに最適 — 日本語限定的でも受け入れ可。' },
  { rank: 12, name: 'Ritsumeikan APU', city: 'fukuoka', type: 'private', qsAsia: 130, intlStudents: 2900, englishPrograms: true, jlptRequired: 'None for English track', tuitionAnnual: '৳7 – 10 lakh', highlightEn: "50% international — full bachelor's available in English with no JLPT requirement.", highlight: "৫০% international — JLPT ছাড়াই ইংরেজিতে পূর্ণ bachelor's।", highlightJa: '学生の50%が留学生 — JLPT不要で英語学士号が取得可能。' },
];

export default function UniversityRankingsManage() {
  const api = axiosInterceptor();
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  const flash = (ok, text) => { setMsg({ ok, text }); setTimeout(() => setMsg(null), 4000); };

  const load = async () => {
    setLoading(true);
    try { const res = await api.get('/university-rankings?all=true'); setRows(res.data?.universities || []); }
    catch (err) { flash(false, err.response?.data?.error || 'লোড করা যায়নি'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const edit = (r) => { setForm({ ...empty, ...r }); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const reset = () => setForm(empty);

  const save = async () => {
    if (!form.name.trim()) return flash(false, 'নাম দিন');
    setSaving(true);
    try {
      if (form.id) { await api.put(`/university-rankings/${form.id}`, form); flash(true, 'আপডেট হয়েছে'); }
      else { await api.post('/university-rankings', form); flash(true, 'যোগ হয়েছে'); }
      reset(); load();
    } catch (err) { flash(false, err.response?.data?.error || 'সেভ করা যায়নি'); }
    finally { setSaving(false); }
  };

  const del = async (r) => {
    if (!(await confirmDialog({ title: 'মুছবেন?', message: `"${r.name}" মুছে ফেলা হবে।`, confirmText: 'মুছুন' }))) return;
    try { await api.delete(`/university-rankings/${r.id}`); flash(true, 'মুছে ফেলা হয়েছে'); load(); }
    catch (err) { flash(false, err.response?.data?.error || 'মুছে ফেলা যায়নি'); }
  };

  const importSeed = async () => {
    if (!(await confirmDialog({ title: 'Top-12 import?', message: `${SEED.length}টি university যোগ হবে।`, danger: false, confirmText: 'Import' }))) return;
    const have = new Set(rows.map((r) => r.name));
    let n = 0;
    for (const s of SEED.filter((s) => !have.has(s.name))) {
      // eslint-disable-next-line no-await-in-loop
      try { await api.post('/university-rankings', { ...s, sortOrder: s.rank, published: true }); n += 1; } catch { /* skip */ }
    }
    flash(true, `${n}টি import হয়েছে`); load();
  };

  return (
    <div className="space-y-5 max-w-5xl pb-24">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-navy">University Rankings</h1>
          <p className="mt-1 text-sm text-brand-slate">/university-rankings পেজের তালিকা যোগ/এডিট করুন।</p>
        </div>
        <button type="button" onClick={importSeed} className="rounded-md border border-brand-navy px-3 py-1.5 text-xs font-semibold text-brand-navy hover:bg-brand-tealLight/10">⤓ Top-12 import</button>
      </div>

      {msg && <div className={`rounded-lg border px-4 py-2.5 text-sm ${msg.ok ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-red-300 bg-red-50 text-red-800'}`}>{msg.ok ? '✓ ' : '✗ '}{msg.text}</div>}

      <section className="rounded-xl border border-brand-tealLight/40 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-bold uppercase tracking-wide text-brand-navy">{form.id ? 'এডিট' : 'নতুন university'}</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div><label className={labelClass}>Rank</label><input type="number" value={form.rank} onChange={(e) => setForm({ ...form, rank: Number(e.target.value) })} className={inputClass} /></div>
          <div className="col-span-2 sm:col-span-3"><label className={labelClass}>নাম *</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} /></div>
          <div><label className={labelClass}>City (slug)</label><input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="tokyo" className={inputClass} /></div>
          <div><label className={labelClass}>Type</label><select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className={inputClass}><option value="national">national</option><option value="private">private</option></select></div>
          <div><label className={labelClass}>QS Asia</label><input type="number" value={form.qsAsia} onChange={(e) => setForm({ ...form, qsAsia: Number(e.target.value) })} className={inputClass} /></div>
          <div><label className={labelClass}>Intl students</label><input type="number" value={form.intlStudents} onChange={(e) => setForm({ ...form, intlStudents: Number(e.target.value) })} className={inputClass} /></div>
          <div className="col-span-2"><label className={labelClass}>JLPT required</label><input value={form.jlptRequired} onChange={(e) => setForm({ ...form, jlptRequired: e.target.value })} className={inputClass} /></div>
          <div className="col-span-2"><label className={labelClass}>Tuition / year</label><input value={form.tuitionAnnual} onChange={(e) => setForm({ ...form, tuitionAnnual: e.target.value })} className={inputClass} /></div>
        </div>
        <div className="mt-3 space-y-3">
          <div><label className={labelClass}>Highlight (বাংলা)</label><textarea value={form.highlight} onChange={(e) => setForm({ ...form, highlight: e.target.value })} rows={2} className={inputClass} /></div>
          <div><label className={labelClass}>Highlight (English)</label><textarea value={form.highlightEn} onChange={(e) => setForm({ ...form, highlightEn: e.target.value })} rows={2} className={inputClass} /></div>
          <div><label className={labelClass}>Highlight (日本語)</label><textarea value={form.highlightJa} onChange={(e) => setForm({ ...form, highlightJa: e.target.value })} rows={2} className={inputClass} /></div>
        </div>
        <div className="mt-3 flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-brand-navy"><input type="checkbox" checked={form.englishPrograms} onChange={(e) => setForm({ ...form, englishPrograms: e.target.checked })} /> English programmes</label>
          <label className="flex items-center gap-2 text-sm text-brand-navy"><input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} /> প্রকাশিত</label>
        </div>
        <div className="mt-4 flex gap-2">
          <button type="button" onClick={save} disabled={saving} className="rounded-md bg-brand-teal px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-navy disabled:opacity-50">{saving ? 'সেভ…' : form.id ? 'আপডেট' : '+ যোগ করুন'}</button>
          {form.id && <button type="button" onClick={reset} className="rounded-md border border-brand-navy px-4 py-2.5 text-sm font-semibold text-brand-navy hover:bg-brand-tealLight/10">বাতিল</button>}
        </div>
      </section>

      <section className="rounded-xl border border-brand-tealLight/40 bg-white shadow-sm overflow-hidden">
        <h2 className="border-b border-brand-tealLight/40 px-5 py-3 text-sm font-bold uppercase tracking-wide text-brand-navy">তালিকা ({rows.length})</h2>
        {loading ? <p className="p-5 text-sm text-brand-slate">লোড হচ্ছে…</p> : rows.length === 0 ? (
          <p className="p-5 text-sm text-brand-slate/70">কোনো entry নেই। “Top-12 import” চাপুন বা যোগ করুন। (পাবলিক সাইটে আপাতত বিল্ট-ইন তালিকা দেখাবে।)</p>
        ) : (
          <ul className="divide-y divide-brand-tealLight/30">
            {rows.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 px-5 py-2.5 text-sm hover:bg-brand-tealLight/5">
                <span className="min-w-0"><span className="font-semibold text-brand-navy">#{r.rank} {r.name}</span>{!r.published && <span className="ml-2 text-[10px] text-amber-600">(unpublished)</span>}</span>
                <span className="flex-shrink-0"><button type="button" onClick={() => edit(r)} className="mr-2 text-brand-teal hover:text-brand-navy">এডিট</button><button type="button" onClick={() => del(r)} className="text-red-500 hover:text-red-700">মুছুন</button></span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
