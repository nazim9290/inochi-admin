/**
 * EN: Press mentions admin — CRUD over PressMention (/press page). Outlet,
 *     logo text, date, link + trilingual headline & excerpt. One-click seed
 *     imports the bundled coverage.
 * BN: Press mentions admin — PressMention (/press পেজ)-এর CRUD। Outlet, logo
 *     text, date, link + ত্রিভাষিক headline ও excerpt। এক-ক্লিক seed bundled
 *     coverage import করে।
 */

import { useEffect, useState } from 'react';
import axiosInterceptor from '../axios/axiosInterceptor';
import { confirmDialog } from '../components/ConfirmDialog';

const inputClass =
  'w-full rounded-md border border-brand-tealLight/60 bg-white px-3 py-2.5 text-sm text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-teal/40 focus:border-brand-teal';
const labelClass = 'mb-1 block text-xs font-bold uppercase tracking-wider text-brand-navy';

const empty = { id: null, outlet: '', logoText: '', url: '', date: '', headline: '', headlineEn: '', headlineJa: '', excerpt: '', excerptEn: '', excerptJa: '', sortOrder: 0, published: true };

const SEED = [
  { outlet: 'The Daily Star', logoText: 'DS', date: '2025-11-12', url: 'https://www.thedailystar.net/', headlineEn: 'Inochi Global helps Bangladeshi students reach Japan with JLPT-first model', headline: 'JLPT-প্রথম মডেলে বাংলাদেশি ছাত্রদের জাপানে পৌঁছাতে সাহায্য করছে Inochi Global', headlineJa: 'Inochi Global、JLPT 重視モデルでバングラデシュ人学生の日本留学を支援', excerptEn: 'The Dhaka-based agency, expanded to Saitama, says JLPT prep before flying is the key to higher visa-approval rates.', excerpt: 'ঢাকা-ভিত্তিক এজেন্সি (সাইতামায় বিস্তৃত) বলছে: ফ্লাইটের আগে JLPT প্রস্তুতি ভিসা-অনুমোদনের চাবিকাঠি।', excerptJa: 'ダッカ拠点（埼玉に展開）は、渡日前のJLPT対策がビザ承認率向上の鍵だと述べる。' },
  { outlet: 'Prothom Alo', logoText: 'PA', date: '2025-09-30', url: 'https://www.prothomalo.com/', headlineEn: 'Studying in Japan: A practical guide for middle-income families', headline: 'জাপানে পড়া: মধ্যবিত্ত পরিবারের জন্য বাস্তব গাইড', headlineJa: '日本留学：中流家庭向けの実践的ガイド', excerptEn: "Inochi's CEO outlines how 9–11 lakh BDT covers a Japan-bound student's first year — without the brokerage layer.", excerpt: 'Inochi-র CEO ব্যাখ্যা করেন কীভাবে ৯–১১ লাখ টাকায় জাপান-গামী ছাত্রের প্রথম বছর কভার হয় — broker ছাড়া।', excerptJa: 'Inochiの CEO が、9〜11ラックBDTで日本留学1年目を賄う方法を解説。' },
  { outlet: 'Bonik Barta', logoText: 'BB', date: '2025-08-18', url: 'https://bonikbarta.net/', headlineEn: 'Japan-bound migration sees a process-driven shift', headline: 'জাপান-গামী অভিবাসনে process-ভিত্তিক রূপান্তর', headlineJa: '日本向け移住、プロセス重視へのシフト', excerptEn: 'Among the new generation of Bangladeshi consultancies, Inochi is highlighted for transparent fees and post-arrival support.', excerpt: 'নতুন প্রজন্মের কনসালটেন্সিগুলোর মধ্যে Inochi স্বচ্ছ ফি ও post-arrival সাপোর্টের জন্য আলোকিত।', excerptJa: '新世代のコンサルの中で、Inochiは透明な料金と渡日後サポートで注目される。' },
  { outlet: 'DBC News', logoText: 'DBC', date: '2025-06-05', url: 'https://www.dbcnews.tv/', headlineEn: 'Education export: How Bangladeshi agencies are pivoting to Japan', headline: 'শিক্ষা রপ্তানি: কীভাবে বাংলাদেশি এজেন্সি জাপানে পিভট করছে', headlineJa: '教育輸出：バングラデシュのエージェントが日本へピボットする方法', excerptEn: 'TV feature on Japan-focused study-abroad agencies, with Inochi profiled as an operator with a Japan office.', excerpt: 'জাপান-কেন্দ্রিক স্টাডি-অ্যাব্রড এজেন্সি নিয়ে TV ফিচার — Inochi জাপান অফিস-সহ একটি অপারেটর হিসেবে চিত্রিত।', excerptJa: '日本特化型留学エージェントのTV特集 — Inochiは日本オフィスを持つ事業者として紹介。' },
];

export default function PressManage() {
  const api = axiosInterceptor();
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  const flash = (ok, text) => { setMsg({ ok, text }); setTimeout(() => setMsg(null), 4000); };

  const load = async () => {
    setLoading(true);
    try { const res = await api.get('/press?all=true'); setRows(res.data?.mentions || []); }
    catch (err) { flash(false, err.response?.data?.error || 'লোড করা যায়নি'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const edit = (r) => { setForm({ ...empty, ...r }); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const reset = () => setForm(empty);

  const save = async () => {
    if (!form.outlet.trim()) return flash(false, 'Outlet দিন');
    setSaving(true);
    try {
      if (form.id) { await api.put(`/press/${form.id}`, form); flash(true, 'আপডেট হয়েছে'); }
      else { await api.post('/press', form); flash(true, 'যোগ হয়েছে'); }
      reset(); load();
    } catch (err) { flash(false, err.response?.data?.error || 'সেভ করা যায়নি'); }
    finally { setSaving(false); }
  };

  const del = async (r) => {
    if (!(await confirmDialog({ title: 'মুছবেন?', message: `${r.outlet}-এর mention মুছে ফেলা হবে।`, confirmText: 'মুছুন' }))) return;
    try { await api.delete(`/press/${r.id}`); flash(true, 'মুছে ফেলা হয়েছে'); load(); }
    catch (err) { flash(false, err.response?.data?.error || 'মুছে ফেলা যায়নি'); }
  };

  const importSeed = async () => {
    if (!(await confirmDialog({ title: 'Seed import?', message: `${SEED.length}টি media mention যোগ হবে।`, danger: false, confirmText: 'Import' }))) return;
    const have = new Set(rows.map((r) => r.outlet + r.date));
    let n = 0;
    for (const s of SEED.filter((s) => !have.has(s.outlet + s.date))) {
      // eslint-disable-next-line no-await-in-loop
      try { await api.post('/press', { ...s, sortOrder: n, published: true }); n += 1; } catch { /* skip */ }
    }
    flash(true, `${n}টি import হয়েছে`); load();
  };

  return (
    <div className="space-y-5 max-w-5xl pb-24">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-navy">Press / Media Mentions</h1>
          <p className="mt-1 text-sm text-brand-slate">/press পেজের পত্রিকা/TV coverage যোগ/এডিট করুন।</p>
        </div>
        <button type="button" onClick={importSeed} className="rounded-md border border-brand-navy px-3 py-1.5 text-xs font-semibold text-brand-navy hover:bg-brand-tealLight/10">⤓ Seed import</button>
      </div>

      {msg && <div className={`rounded-lg border px-4 py-2.5 text-sm ${msg.ok ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-red-300 bg-red-50 text-red-800'}`}>{msg.ok ? '✓ ' : '✗ '}{msg.text}</div>}

      <section className="rounded-xl border border-brand-tealLight/40 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-bold uppercase tracking-wide text-brand-navy">{form.id ? 'এডিট' : 'নতুন mention'}</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="col-span-2"><label className={labelClass}>Outlet *</label><input value={form.outlet} onChange={(e) => setForm({ ...form, outlet: e.target.value })} placeholder="The Daily Star" className={inputClass} /></div>
          <div><label className={labelClass}>Logo text</label><input value={form.logoText} onChange={(e) => setForm({ ...form, logoText: e.target.value })} placeholder="DS" className={inputClass} /></div>
          <div><label className={labelClass}>Date (YYYY-MM-DD)</label><input value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} placeholder="2025-11-12" className={inputClass} /></div>
          <div className="col-span-2 sm:col-span-4"><label className={labelClass}>URL</label><input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} className={inputClass} /></div>
        </div>
        <div className="mt-3 space-y-3">
          <div><label className={labelClass}>Headline (বাংলা)</label><input value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })} className={inputClass} /></div>
          <div><label className={labelClass}>Headline (English)</label><input value={form.headlineEn} onChange={(e) => setForm({ ...form, headlineEn: e.target.value })} className={inputClass} /></div>
          <div><label className={labelClass}>Headline (日本語)</label><input value={form.headlineJa} onChange={(e) => setForm({ ...form, headlineJa: e.target.value })} className={inputClass} /></div>
          <div><label className={labelClass}>Excerpt (বাংলা)</label><textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} rows={2} className={inputClass} /></div>
          <div><label className={labelClass}>Excerpt (English)</label><textarea value={form.excerptEn} onChange={(e) => setForm({ ...form, excerptEn: e.target.value })} rows={2} className={inputClass} /></div>
          <div><label className={labelClass}>Excerpt (日本語)</label><textarea value={form.excerptJa} onChange={(e) => setForm({ ...form, excerptJa: e.target.value })} rows={2} className={inputClass} /></div>
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
          <p className="p-5 text-sm text-brand-slate/70">কোনো mention নেই। “Seed import” চাপুন বা যোগ করুন। (পাবলিক সাইটে আপাতত বিল্ট-ইন তালিকা দেখাবে।)</p>
        ) : (
          <ul className="divide-y divide-brand-tealLight/30">
            {rows.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 px-5 py-2.5 text-sm hover:bg-brand-tealLight/5">
                <span className="min-w-0"><span className="font-semibold text-brand-navy">{r.outlet}</span><span className="ml-2 text-xs text-brand-slate/70">{r.date}</span>{!r.published && <span className="ml-2 text-[10px] text-amber-600">(unpublished)</span>}</span>
                <span className="flex-shrink-0"><button type="button" onClick={() => edit(r)} className="mr-2 text-brand-teal hover:text-brand-navy">এডিট</button><button type="button" onClick={() => del(r)} className="text-red-500 hover:text-red-700">মুছুন</button></span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
