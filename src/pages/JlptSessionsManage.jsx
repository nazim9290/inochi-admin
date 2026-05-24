/**
 * EN: JLPT exam sessions admin — CRUD over JlptSession (/jlpt-calendar).
 *     Dates (ISO), trilingual title + city, levels, registration window + URL.
 *     One-click seed imports the bundled upcoming sittings.
 * BN: JLPT পরীক্ষা session admin — JlptSession (/jlpt-calendar)-এর CRUD।
 *     তারিখ (ISO), ত্রিভাষিক title + city, levels, registration window + URL।
 *     এক-ক্লিক seed bundled আসন্ন session import করে।
 */

import { useEffect, useState } from 'react';
import axiosInterceptor from '../axios/axiosInterceptor';
import { confirmDialog } from '../components/ConfirmDialog';

const inputClass =
  'w-full rounded-md border border-brand-tealLight/60 bg-white px-3 py-2.5 text-sm text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-teal/40 focus:border-brand-teal';
const labelClass = 'mb-1 block text-xs font-bold uppercase tracking-wider text-brand-navy';

const empty = { id: null, session: '', examDate: '', registrationOpen: '', registrationClose: '', title: '', titleEn: '', titleJa: '', city: 'ঢাকা, বাংলাদেশ', cityEn: 'Dhaka, Bangladesh', cityJa: 'ダッカ・バングラデシュ', levels: 'N5, N4, N3, N2, N1', registrationUrl: 'https://info.jees-jlpt.jp/', sortOrder: 0, published: true };

const SEED = [
  { session: 'july-2026', examDate: '2026-07-05', registrationOpen: '2026-03-15', registrationClose: '2026-04-15', titleEn: 'JLPT — July 2026', title: 'JLPT — জুলাই ২০২৬', titleJa: 'JLPT — 2026年7月' },
  { session: 'december-2026', examDate: '2026-12-06', registrationOpen: '2026-08-25', registrationClose: '2026-09-25', titleEn: 'JLPT — December 2026', title: 'JLPT — ডিসেম্বর ২০২৬', titleJa: 'JLPT — 2026年12月' },
  { session: 'july-2027', examDate: '2027-07-04', registrationOpen: '2027-03-15', registrationClose: '2027-04-15', titleEn: 'JLPT — July 2027 (provisional)', title: 'JLPT — জুলাই ২০২৭ (অস্থায়ী)', titleJa: 'JLPT — 2027年7月 (暫定)' },
];

const toLevels = (s) => String(s || '').split(',').map((x) => x.trim()).filter(Boolean);

export default function JlptSessionsManage() {
  const api = axiosInterceptor();
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  const flash = (ok, text) => { setMsg({ ok, text }); setTimeout(() => setMsg(null), 4000); };

  const load = async () => {
    setLoading(true);
    try { const res = await api.get('/jlpt-sessions?all=true'); setRows(res.data?.exams || []); }
    catch (err) { flash(false, err.response?.data?.error || 'লোড করা যায়নি'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const edit = (r) => { setForm({ ...empty, ...r, levels: Array.isArray(r.levels) ? r.levels.join(', ') : r.levels }); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const reset = () => setForm(empty);

  const save = async () => {
    if (!form.session.trim()) return flash(false, 'Session key দিন (যেমন july-2026)');
    setSaving(true);
    const payload = { ...form, levels: toLevels(form.levels) };
    try {
      if (form.id) { await api.put(`/jlpt-sessions/${form.id}`, payload); flash(true, 'আপডেট হয়েছে'); }
      else { await api.post('/jlpt-sessions', payload); flash(true, 'যোগ হয়েছে'); }
      reset(); load();
    } catch (err) { flash(false, err.response?.data?.error || 'সেভ করা যায়নি'); }
    finally { setSaving(false); }
  };

  const del = async (r) => {
    if (!(await confirmDialog({ title: 'মুছবেন?', message: `"${r.titleEn || r.session}" মুছে ফেলা হবে।`, confirmText: 'মুছুন' }))) return;
    try { await api.delete(`/jlpt-sessions/${r.id}`); flash(true, 'মুছে ফেলা হয়েছে'); load(); }
    catch (err) { flash(false, err.response?.data?.error || 'মুছে ফেলা যায়নি'); }
  };

  const importSeed = async () => {
    if (!(await confirmDialog({ title: 'Seed import?', message: `${SEED.length}টি session যোগ হবে।`, danger: false, confirmText: 'Import' }))) return;
    const have = new Set(rows.map((r) => r.session));
    let n = 0;
    for (const s of SEED.filter((s) => !have.has(s.session))) {
      // eslint-disable-next-line no-await-in-loop
      try { await api.post('/jlpt-sessions', { ...s, city: 'ঢাকা, বাংলাদেশ', cityEn: 'Dhaka, Bangladesh', cityJa: 'ダッカ・バングラデシュ', levels: ['N5', 'N4', 'N3', 'N2', 'N1'], registrationUrl: 'https://info.jees-jlpt.jp/', published: true }); n += 1; } catch { /* skip */ }
    }
    flash(true, `${n}টি import হয়েছে`); load();
  };

  return (
    <div className="space-y-5 max-w-5xl pb-24">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-navy">JLPT Exam Calendar</h1>
          <p className="mt-1 text-sm text-brand-slate">/jlpt-calendar পেজের পরীক্ষার তারিখ যোগ/এডিট করুন।</p>
        </div>
        <button type="button" onClick={importSeed} className="rounded-md border border-brand-navy px-3 py-1.5 text-xs font-semibold text-brand-navy hover:bg-brand-tealLight/10">⤓ Seed import</button>
      </div>

      {msg && <div className={`rounded-lg border px-4 py-2.5 text-sm ${msg.ok ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-red-300 bg-red-50 text-red-800'}`}>{msg.ok ? '✓ ' : '✗ '}{msg.text}</div>}

      <section className="rounded-xl border border-brand-tealLight/40 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-bold uppercase tracking-wide text-brand-navy">{form.id ? 'এডিট' : 'নতুন session'}</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div><label className={labelClass}>Session key</label><input value={form.session} onChange={(e) => setForm({ ...form, session: e.target.value })} placeholder="july-2026" className={inputClass} /></div>
          <div><label className={labelClass}>Exam date</label><input value={form.examDate} onChange={(e) => setForm({ ...form, examDate: e.target.value })} placeholder="2026-07-05" className={inputClass} /></div>
          <div><label className={labelClass}>Reg. open</label><input value={form.registrationOpen} onChange={(e) => setForm({ ...form, registrationOpen: e.target.value })} placeholder="2026-03-15" className={inputClass} /></div>
          <div><label className={labelClass}>Reg. close</label><input value={form.registrationClose} onChange={(e) => setForm({ ...form, registrationClose: e.target.value })} placeholder="2026-04-15" className={inputClass} /></div>
        </div>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div><label className={labelClass}>Title (বাংলা)</label><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} /></div>
          <div><label className={labelClass}>Title (English)</label><input value={form.titleEn} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} className={inputClass} /></div>
          <div><label className={labelClass}>Title (日本語)</label><input value={form.titleJa} onChange={(e) => setForm({ ...form, titleJa: e.target.value })} className={inputClass} /></div>
          <div><label className={labelClass}>City (বাংলা)</label><input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className={inputClass} /></div>
          <div><label className={labelClass}>City (English)</label><input value={form.cityEn} onChange={(e) => setForm({ ...form, cityEn: e.target.value })} className={inputClass} /></div>
          <div><label className={labelClass}>City (日本語)</label><input value={form.cityJa} onChange={(e) => setForm({ ...form, cityJa: e.target.value })} className={inputClass} /></div>
        </div>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div><label className={labelClass}>Levels (comma)</label><input value={form.levels} onChange={(e) => setForm({ ...form, levels: e.target.value })} placeholder="N5, N4, N3, N2, N1" className={inputClass} /></div>
          <div><label className={labelClass}>Registration URL</label><input value={form.registrationUrl} onChange={(e) => setForm({ ...form, registrationUrl: e.target.value })} className={inputClass} /></div>
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
          <p className="p-5 text-sm text-brand-slate/70">কোনো session নেই। “Seed import” চাপুন বা যোগ করুন। (পাবলিক সাইটে আপাতত বিল্ট-ইন তালিকা দেখাবে।)</p>
        ) : (
          <ul className="divide-y divide-brand-tealLight/30">
            {rows.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 px-5 py-2.5 text-sm hover:bg-brand-tealLight/5">
                <span className="min-w-0"><span className="font-semibold text-brand-navy">{r.titleEn || r.session}</span><span className="ml-2 text-xs text-brand-slate/70">{r.examDate}</span>{!r.published && <span className="ml-2 text-[10px] text-amber-600">(unpublished)</span>}</span>
                <span className="flex-shrink-0"><button type="button" onClick={() => edit(r)} className="mr-2 text-brand-teal hover:text-brand-navy">এডিট</button><button type="button" onClick={() => del(r)} className="text-red-500 hover:text-red-700">মুছুন</button></span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
