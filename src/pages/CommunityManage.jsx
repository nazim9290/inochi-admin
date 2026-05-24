/**
 * EN: Community channels admin — CRUD over CommunityChannel (/community page).
 *     Channel key (drives icon/colour), trilingual name + description, URL,
 *     member count, language, colour. One-click seed imports the bundled hubs.
 * BN: Community channel admin — CommunityChannel (/community পেজ)-এর CRUD।
 *     channel key (icon/colour ঠিক করে), ত্রিভাষিক name + description, URL,
 *     member সংখ্যা, ভাষা, রঙ। এক-ক্লিক seed bundled hub import করে।
 */

import { useEffect, useState } from 'react';
import axiosInterceptor from '../axios/axiosInterceptor';
import { confirmDialog } from '../components/ConfirmDialog';

const inputClass =
  'w-full rounded-md border border-brand-tealLight/60 bg-white px-3 py-2.5 text-sm text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-teal/40 focus:border-brand-teal';
const labelClass = 'mb-1 block text-xs font-bold uppercase tracking-wider text-brand-navy';

const COLORS = ['blue', 'sky', 'red', 'pink', 'neutral'];
const empty = { id: null, channelKey: '', name: '', nameEn: '', nameJa: '', description: '', descriptionEn: '', descriptionJa: '', url: '', members: '', language: '', color: 'blue', sortOrder: 0, published: true };

const SEED = [
  { channelKey: 'facebook', color: 'blue', members: '8,400+', language: 'Bangla', url: 'https://www.facebook.com/groups/inochiglobaleducation', nameEn: 'Facebook Community Group', name: 'ফেসবুক কমিউনিটি গ্রুপ', nameJa: 'Facebook コミュニティグループ', descriptionEn: 'Open Bengali-language group for prospective Japan-bound students. Q&A, intake updates, peer help.', description: 'জাপান-গামী সম্ভাব্য ছাত্রদের উন্মুক্ত বাংলা গ্রুপ। Q&A, intake আপডেট, peer সাহায্য।', descriptionJa: '日本留学希望者向けのオープンなベンガル語グループ。Q&A、入学情報、相互サポート。' },
  { channelKey: 'telegram', color: 'sky', members: '320+', language: 'Bangla / Japanese', url: 'https://t.me/inochijapan', nameEn: 'Telegram Group — Inochi Japan', name: 'টেলিগ্রাম গ্রুপ — Inochi Japan', nameJa: 'Telegram グループ — Inochi Japan', descriptionEn: 'Live chat for Japan-based alumni. Daily life, jobs, JLPT study circles, emergency help.', description: 'জাপানে অবস্থানরত alumni-দের লাইভ চ্যাট। দৈনন্দিন জীবন, কাজ, JLPT সার্কেল, জরুরি সাহায্য।', descriptionJa: '日本在住卒業生向けライブチャット。生活、仕事、JLPT学習、緊急サポート。' },
  { channelKey: 'youtube', color: 'red', members: '12,000+ subscribers', language: 'Bangla', url: 'https://www.youtube.com/@inochiglobal', nameEn: 'YouTube Channel', name: 'YouTube চ্যানেল', nameJa: 'YouTube チャンネル', descriptionEn: 'Weekly student vlogs from Japan, JLPT lessons, embassy interview tips, intake explainers.', description: 'জাপান থেকে সাপ্তাহিক ছাত্র vlog, JLPT লেসন, এম্বাসি interview tips, intake explainer।', descriptionJa: '週次学生ブログ、JLPTレッスン、大使館面接のコツ、入学解説。' },
  { channelKey: 'instagram', color: 'pink', members: '5,200+ followers', language: 'Bangla / English', url: 'https://www.instagram.com/inochiglobaleducation', nameEn: 'Instagram', name: 'Instagram', nameJa: 'Instagram', descriptionEn: 'Daily reels from Tokyo / Osaka / Saitama campuses, sakura visuals, student-life snapshots.', description: 'টোকিও / ওসাকা / সাইতামা campus থেকে দৈনিক reel, sakura visual, student-life ছবি।', descriptionJa: '東京・大阪・埼玉キャンパスの毎日のリール、桜、学生生活。' },
  { channelKey: 'linkedin', color: 'blue', members: '1,800+ alumni', language: 'English', url: 'https://www.linkedin.com/company/inochi-global-education', nameEn: 'LinkedIn Alumni Network', name: 'LinkedIn আলামনাই নেটওয়ার্ক', nameJa: 'LinkedIn 卒業生ネットワーク', descriptionEn: 'Professional alumni network — job referrals, internships, Japan-business connections.', description: 'Professional আলামনাই নেটওয়ার্ক — চাকরির referral, internship, জাপান-ব্যবসা সংযোগ।', descriptionJa: 'プロ卒業生ネットワーク — 求人紹介、インターン、日本ビジネス。' },
  { channelKey: 'tiktok', color: 'neutral', members: '3,400+ followers', language: 'Bangla', url: 'https://www.tiktok.com/@inochiglobal', nameEn: 'TikTok', name: 'TikTok', nameJa: 'TikTok', descriptionEn: 'Short clips from Japan — train rides, convenience-store food, JLPT phrases, visa prep.', description: 'জাপান থেকে ছোট ক্লিপ — ট্রেন, কনভিনিয়েন্স স্টোর খাবার, JLPT phrase, ভিসা prep।', descriptionJa: '日本のショート動画 — 電車、コンビニ食、JLPTフレーズ、ビザ準備。' },
];

export default function CommunityManage() {
  const api = axiosInterceptor();
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  const flash = (ok, text) => { setMsg({ ok, text }); setTimeout(() => setMsg(null), 4000); };

  const load = async () => {
    setLoading(true);
    try { const res = await api.get('/community?all=true'); setRows(res.data?.channels || []); }
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
      if (form.id) { await api.put(`/community/${form.id}`, form); flash(true, 'আপডেট হয়েছে'); }
      else { await api.post('/community', form); flash(true, 'যোগ হয়েছে'); }
      reset(); load();
    } catch (err) { flash(false, err.response?.data?.error || 'সেভ করা যায়নি'); }
    finally { setSaving(false); }
  };

  const del = async (r) => {
    if (!(await confirmDialog({ title: 'মুছবেন?', message: `"${r.nameEn || r.name}" channel মুছে ফেলা হবে।`, confirmText: 'মুছুন' }))) return;
    try { await api.delete(`/community/${r.id}`); flash(true, 'মুছে ফেলা হয়েছে'); load(); }
    catch (err) { flash(false, err.response?.data?.error || 'মুছে ফেলা যায়নি'); }
  };

  const importSeed = async () => {
    if (!(await confirmDialog({ title: 'Seed import?', message: `${SEED.length}টি channel যোগ হবে।`, danger: false, confirmText: 'Import' }))) return;
    const have = new Set(rows.map((r) => r.channelKey));
    let n = 0;
    for (const s of SEED.filter((s) => !have.has(s.channelKey))) {
      // eslint-disable-next-line no-await-in-loop
      try { await api.post('/community', { ...s, sortOrder: n, published: true }); n += 1; } catch { /* skip */ }
    }
    flash(true, `${n}টি import হয়েছে`); load();
  };

  return (
    <div className="space-y-5 max-w-5xl pb-24">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-navy">Community Channels</h1>
          <p className="mt-1 text-sm text-brand-slate">/community পেজের গ্রুপ/চ্যানেল যোগ/এডিট করুন।</p>
        </div>
        <button type="button" onClick={importSeed} className="rounded-md border border-brand-navy px-3 py-1.5 text-xs font-semibold text-brand-navy hover:bg-brand-tealLight/10">⤓ Seed import</button>
      </div>

      {msg && <div className={`rounded-lg border px-4 py-2.5 text-sm ${msg.ok ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-red-300 bg-red-50 text-red-800'}`}>{msg.ok ? '✓ ' : '✗ '}{msg.text}</div>}

      <section className="rounded-xl border border-brand-tealLight/40 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-bold uppercase tracking-wide text-brand-navy">{form.id ? 'এডিট' : 'নতুন channel'}</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div><label className={labelClass}>Key</label><input value={form.channelKey} onChange={(e) => setForm({ ...form, channelKey: e.target.value })} placeholder="facebook" className={inputClass} /></div>
          <div><label className={labelClass}>Color</label><select value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className={inputClass}>{COLORS.map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
          <div><label className={labelClass}>Members</label><input value={form.members} onChange={(e) => setForm({ ...form, members: e.target.value })} placeholder="8,400+" className={inputClass} /></div>
          <div><label className={labelClass}>Language</label><input value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} placeholder="Bangla" className={inputClass} /></div>
          <div className="col-span-2 sm:col-span-4"><label className={labelClass}>URL</label><input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} className={inputClass} /></div>
        </div>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div><label className={labelClass}>নাম (বাংলা) *</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} /></div>
          <div><label className={labelClass}>Name (English)</label><input value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} className={inputClass} /></div>
          <div><label className={labelClass}>名前 (日本語)</label><input value={form.nameJa} onChange={(e) => setForm({ ...form, nameJa: e.target.value })} className={inputClass} /></div>
        </div>
        <div className="mt-3 space-y-3">
          <div><label className={labelClass}>বিবরণ (বাংলা)</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className={inputClass} /></div>
          <div><label className={labelClass}>Description (English)</label><textarea value={form.descriptionEn} onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })} rows={2} className={inputClass} /></div>
          <div><label className={labelClass}>説明 (日本語)</label><textarea value={form.descriptionJa} onChange={(e) => setForm({ ...form, descriptionJa: e.target.value })} rows={2} className={inputClass} /></div>
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
          <p className="p-5 text-sm text-brand-slate/70">কোনো channel নেই। “Seed import” চাপুন বা যোগ করুন। (পাবলিক সাইটে আপাতত বিল্ট-ইন তালিকা দেখাবে।)</p>
        ) : (
          <ul className="divide-y divide-brand-tealLight/30">
            {rows.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 px-5 py-2.5 text-sm hover:bg-brand-tealLight/5">
                <span className="min-w-0"><span className="font-semibold text-brand-navy">{r.nameEn || r.name}</span>{r.channelKey ? <span className="ml-2 text-xs text-brand-slate/70">{r.channelKey}</span> : null}{!r.published && <span className="ml-2 text-[10px] text-amber-600">(unpublished)</span>}</span>
                <span className="flex-shrink-0"><button type="button" onClick={() => edit(r)} className="mr-2 text-brand-teal hover:text-brand-navy">এডিট</button><button type="button" onClick={() => del(r)} className="text-red-500 hover:text-red-700">মুছুন</button></span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
