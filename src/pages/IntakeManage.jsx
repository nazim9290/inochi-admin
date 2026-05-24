/**
 * EN: Intake admin — CRUD over Intake (/intake + /intake/[slug]). Trilingual
 *     season/title/tagline + CoE/visa/departure windows, ISO dates, an
 *     isPast flag, and a highlights list ({en,bn,ja} rows). One-click seed
 *     imports the bundled three intakes.
 * BN: Intake admin — Intake (/intake + /intake/[slug])-এর CRUD। ত্রিভাষিক
 *     season/title/tagline + CoE/visa/departure window, ISO তারিখ, isPast
 *     flag, ও highlights তালিকা ({en,bn,ja} row)। এক-ক্লিক seed bundled তিন
 *     intake import করে।
 */

import { useEffect, useState } from 'react';
import axiosInterceptor from '../axios/axiosInterceptor';
import { confirmDialog } from '../components/ConfirmDialog';

const inputClass =
  'w-full rounded-md border border-brand-tealLight/60 bg-white px-3 py-2.5 text-sm text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-teal/40 focus:border-brand-teal';
const labelClass = 'mb-1 block text-xs font-bold uppercase tracking-wider text-brand-navy';

const empty = {
  id: null, slug: '', examDate: '', applicationDeadline: '', isPast: false,
  season: '', seasonEn: '', seasonJa: '', title: '', titleEn: '', titleJa: '',
  tagline: '', taglineEn: '', taglineJa: '', coePeriod: '', coePeriodEn: '', coePeriodJa: '',
  visaWindow: '', visaWindowEn: '', visaWindowJa: '', departureWindow: '', departureWindowEn: '', departureWindowJa: '',
  highlights: [], sortOrder: 0, published: true,
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

const L = (en, bn, ja) => ({ en, bn, ja });
const SEED = [
  { slug: 'april-2026', examDate: '2026-04-05', applicationDeadline: '2025-11-15', isPast: true, season: 'বসন্ত (সাকুরা)', seasonEn: 'Spring (Sakura)', seasonJa: '春 (桜)', title: 'এপ্রিল ২০২৬ ইনটেক — জাপানি ল্যাঙ্গুয়েজ স্কুল', titleEn: 'April 2026 intake — Japanese language schools', titleJa: '2026年4月入学 — 日本語学校', tagline: 'বসন্তের সাকুরা ইনটেক। বাংলাদেশি ছাত্রদের মধ্যে সবচেয়ে জনপ্রিয়; ১.৫–২ বছরের প্রোগ্রাম।', taglineEn: 'The springtime sakura intake. Most popular among Bangladeshi students; longer 1.5–2 year programmes available.', taglineJa: '春の桜入学。バングラデシュ人学生に最も人気で、1.5〜2年プログラムが利用可能。', coePeriod: 'ডিসেম্বর ২০২৫ – ফেব্রুয়ারি ২০২৬', coePeriodEn: 'December 2025 – February 2026', coePeriodJa: '2025年12月 – 2026年2月', visaWindow: 'ফেব্রুয়ারি – মার্চ ২০২৬', visaWindowEn: 'February – March 2026', visaWindowJa: '2026年2月 – 3月', departureWindow: 'মার্চের শেষ – এপ্রিলের শুরু ২০২৬', departureWindowEn: 'Late March – early April 2026', departureWindowJa: '2026年3月末 – 4月初旬', highlights: [L('Sakura season arrival — best first impression of Japan', 'সাকুরা ঋতুতে আগমন — জাপানের সেরা প্রথম impression', '桜の季節に到着'), L('1.5 / 2-year programmes available', '১.৫ / ২ বছরের প্রোগ্রাম', '1.5 / 2年プログラム'), L('Aligns with Japanese fiscal-year hiring cycles', 'জাপানি অর্থ-বছরের নিয়োগ চক্রের সাথে মেলে', '日本の年度採用サイクルと一致')] },
  { slug: 'october-2026', examDate: '2026-10-05', applicationDeadline: '2026-04-15', isPast: false, season: 'শরৎ', seasonEn: 'Autumn', seasonJa: '秋', title: 'অক্টোবর ২০২৬ ইনটেক — জাপানি ল্যাঙ্গুয়েজ স্কুল', titleEn: 'October 2026 intake — Japanese language schools', titleJa: '2026年10月入学 — 日本語学校', tagline: 'শরৎ ইনটেক। ১ ও ১.৫ বছরের প্রোগ্রাম; বসন্ত ২০২৭ ইউনিভার্সিটির জন্য আদর্শ।', taglineEn: 'The autumn intake. 1-year and 1.5-year programmes; perfect for graduates aiming for spring 2027 university entry.', taglineJa: '秋入学。1年・1.5年プログラム;2027年春の大学進学向け。', coePeriod: 'জুন – আগস্ট ২০২৬', coePeriodEn: 'June – August 2026', coePeriodJa: '2026年6月 – 8月', visaWindow: 'আগস্ট – সেপ্টেম্বর ২০২৬', visaWindowEn: 'August – September 2026', visaWindowJa: '2026年8月 – 9月', departureWindow: 'সেপ্টেম্বরের শেষ – অক্টোবরের শুরু ২০২৬', departureWindowEn: 'Late September – early October 2026', departureWindowJa: '2026年9月末 – 10月初旬', highlights: [L('Faster turnaround for recent graduates', 'সাম্প্রতিক graduate-দের জন্য দ্রুত turnaround', '最近の卒業生に最短ルート'), L('1.5-year programme = 2 JLPT attempts', '১.৫ বছরের প্রোগ্রাম = ২টি JLPT সুযোগ', '1.5年で JLPT 2回受験'), L('Aligns with April 2027 university admissions', 'এপ্রিল ২০২৭ ইউনিভার্সিটি admission-এর সাথে মেলে', '2027年4月の大学入試に対応')] },
  { slug: 'april-2027', examDate: '2027-04-05', applicationDeadline: '2026-11-15', isPast: false, season: 'বসন্ত (সাকুরা)', seasonEn: 'Spring (Sakura)', seasonJa: '春 (桜)', title: 'এপ্রিল ২০২৭ ইনটেক — জাপানি ল্যাঙ্গুয়েজ স্কুল', titleEn: 'April 2027 intake — Japanese language schools', titleJa: '2027年4月入学 — 日本語学校', tagline: 'যথেষ্ট সময় — ২০২৬ মাঝামাঝি prep শুরু করে এপ্রিল ২০২৭ ইনটেক। ফ্রেশ HSC graduate-দের জন্য সেরা।', taglineEn: 'Plenty of runway — start prep in mid-2026 for the spring 2027 intake. Best for fresh HSC graduates.', taglineJa: '十分な準備期間 — 2026年中頃から準備し2027年春入学。HSC新卒者に最適。', coePeriod: 'ডিসেম্বর ২০২৬ – ফেব্রুয়ারি ২০২৭', coePeriodEn: 'December 2026 – February 2027', coePeriodJa: '2026年12月 – 2027年2月', visaWindow: 'ফেব্রুয়ারি – মার্চ ২০২৭', visaWindowEn: 'February – March 2027', visaWindowJa: '2027年2月 – 3月', departureWindow: 'মার্চের শেষ – এপ্রিলের শুরু ২০২৭', departureWindowEn: 'Late March – early April 2027', departureWindowJa: '2027年3月末 – 4月初旬', highlights: [L('12+ months runway = comfortable JLPT N5 → N4', '১২+ মাস সময় = JLPT N5 → N4 আরামদায়ক', '12ヶ月以上の余裕'), L('Best window for sponsor fund-buildup', 'Sponsor fund জমার সেরা সময়', '支弁者資金準備に最適'), L('Sakura intake = highest enrolment slot', 'সাকুরা ইনটেক = সর্বোচ্চ enrolment', '桜入学 = 最大の入学枠')] },
];

export default function IntakeManage() {
  const api = axiosInterceptor();
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  const flash = (ok, text) => { setMsg({ ok, text }); setTimeout(() => setMsg(null), 4000); };

  const load = async () => {
    setLoading(true);
    try { const res = await api.get('/intakes?all=true'); setRows(res.data?.intakes || []); }
    catch (err) { flash(false, err.response?.data?.error || 'লোড করা যায়নি'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const edit = (r) => { setForm({ ...empty, ...r, highlights: Array.isArray(r.highlights) ? r.highlights.map((h) => ({ en: h.en || '', bn: h.bn || '', ja: h.ja || '' })) : [] }); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const reset = () => setForm(empty);

  const setHl = (i, lng, val) => setForm((f) => ({ ...f, highlights: f.highlights.map((h, idx) => (idx === i ? { ...h, [lng]: val } : h)) }));
  const addHl = () => setForm((f) => ({ ...f, highlights: [...f.highlights, { en: '', bn: '', ja: '' }] }));
  const removeHl = (i) => setForm((f) => ({ ...f, highlights: f.highlights.filter((_, idx) => idx !== i) }));

  const save = async () => {
    if (!form.slug.trim()) return flash(false, 'Slug দিন (april-2026)');
    setSaving(true);
    const payload = { ...form, highlights: form.highlights.filter((h) => h.en || h.bn || h.ja) };
    try {
      if (form.id) { await api.put(`/intakes/${form.id}`, payload); flash(true, 'আপডেট হয়েছে'); }
      else { await api.post('/intakes', payload); flash(true, 'যোগ হয়েছে'); }
      reset(); load();
    } catch (err) { flash(false, err.response?.data?.error || 'সেভ করা যায়নি'); }
    finally { setSaving(false); }
  };

  const del = async (r) => {
    if (!(await confirmDialog({ title: 'Intake মুছবেন?', message: `"${r.titleEn || r.slug}" মুছে ফেলা হবে।`, confirmText: 'মুছুন' }))) return;
    try { await api.delete(`/intakes/${r.id}`); flash(true, 'মুছে ফেলা হয়েছে'); load(); }
    catch (err) { flash(false, err.response?.data?.error || 'মুছে ফেলা যায়নি'); }
  };

  const importSeed = async () => {
    if (!(await confirmDialog({ title: 'Seed import?', message: `${SEED.length}টি intake যোগ হবে।`, danger: false, confirmText: 'Import' }))) return;
    const have = new Set(rows.map((r) => r.slug));
    let n = 0;
    for (let i = 0; i < SEED.length; i += 1) {
      if (have.has(SEED[i].slug)) continue;
      // eslint-disable-next-line no-await-in-loop
      try { await api.post('/intakes', { ...SEED[i], sortOrder: i, published: true }); n += 1; } catch { /* skip */ }
    }
    flash(true, `${n}টি import হয়েছে`); load();
  };

  return (
    <div className="space-y-5 max-w-5xl pb-24">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-navy">Intake পেজ</h1>
          <p className="mt-1 text-sm text-brand-slate">/intake ও /intake/[slug] পেজের ইনটেক যোগ/এডিট করুন।</p>
        </div>
        <button type="button" onClick={importSeed} className="rounded-md border border-brand-navy px-3 py-1.5 text-xs font-semibold text-brand-navy hover:bg-brand-tealLight/10">⤓ Seed import</button>
      </div>

      {msg && <div className={`rounded-lg border px-4 py-2.5 text-sm ${msg.ok ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-red-300 bg-red-50 text-red-800'}`}>{msg.ok ? '✓ ' : '✗ '}{msg.text}</div>}

      <section className="rounded-xl border border-brand-tealLight/40 bg-white p-5 shadow-sm space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wide text-brand-navy">{form.id ? 'Intake এডিট' : 'নতুন intake'}</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div><label className={labelClass}>Slug</label><input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="april-2026" className={inputClass} disabled={!!form.id} /></div>
          <div><label className={labelClass}>Exam date</label><input value={form.examDate} onChange={(e) => setForm({ ...form, examDate: e.target.value })} placeholder="2026-04-05" className={inputClass} /></div>
          <div><label className={labelClass}>Application deadline</label><input value={form.applicationDeadline} onChange={(e) => setForm({ ...form, applicationDeadline: e.target.value })} placeholder="2025-11-15" className={inputClass} /></div>
          <label className="mt-5 flex items-center gap-2 text-sm text-brand-navy"><input type="checkbox" checked={form.isPast} onChange={(e) => setForm({ ...form, isPast: e.target.checked })} /> অতীত (past)</label>
        </div>
        <Tri form={form} set={(p) => setForm({ ...form, ...p })} k="season" label="ঋতু" />
        <Tri form={form} set={(p) => setForm({ ...form, ...p })} k="title" label="শিরোনাম" />
        <Tri form={form} set={(p) => setForm({ ...form, ...p })} k="tagline" label="ট্যাগলাইন" area />
        <Tri form={form} set={(p) => setForm({ ...form, ...p })} k="coePeriod" label="CoE সময়কাল" />
        <Tri form={form} set={(p) => setForm({ ...form, ...p })} k="visaWindow" label="ভিসা window" />
        <Tri form={form} set={(p) => setForm({ ...form, ...p })} k="departureWindow" label="যাত্রার window" />

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
          <p className="p-5 text-sm text-brand-slate/70">কোনো intake নেই। “Seed import” চাপুন। (পাবলিক সাইটে আপাতত বিল্ট-ইন তালিকা দেখাবে।)</p>
        ) : (
          <ul className="divide-y divide-brand-tealLight/30">
            {rows.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 px-5 py-2.5 text-sm hover:bg-brand-tealLight/5">
                <span className="min-w-0 truncate text-brand-navy">{r.titleEn || r.slug} <span className="text-xs text-brand-slate/60">{r.examDate}</span>{r.isPast && <span className="ml-2 text-[10px] text-brand-slate/50">(past)</span>}{!r.published && <span className="ml-2 text-[10px] text-amber-600">(off)</span>}</span>
                <span className="flex-shrink-0"><button type="button" onClick={() => edit(r)} className="mr-2 text-brand-teal hover:text-brand-navy">এডিট</button><button type="button" onClick={() => del(r)} className="text-red-500 hover:text-red-700">মুছুন</button></span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
