/**
 * EN: Pre-departure admin — CRUD over PreDepartureItem (/pre-departure). One
 *     row = one checklist item carrying its category label (denormalised) +
 *     item text + optional note, all trilingual. List grouped by category.
 *     One-click seed imports the bundled checklist.
 * BN: Pre-departure admin — PreDepartureItem (/pre-departure)-এর CRUD। এক
 *     row = এক checklist item, তার category label (denormalised) + item টেক্সট
 *     + optional note, সব ত্রিভাষিক। তালিকা category অনুযায়ী group। এক-ক্লিক
 *     seed bundled checklist import করে।
 */

import { useEffect, useState } from 'react';
import axiosInterceptor from '../axios/axiosInterceptor';
import { confirmDialog } from '../components/ConfirmDialog';

const inputClass =
  'w-full rounded-md border border-brand-tealLight/60 bg-white px-3 py-2.5 text-sm text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-teal/40 focus:border-brand-teal';
const labelClass = 'mb-1 block text-xs font-bold uppercase tracking-wider text-brand-navy';

const empty = {
  id: null, categoryKey: '', categoryLabel: '', categoryLabelEn: '', categoryLabelJa: '',
  item: '', itemEn: '', itemJa: '', note: '', noteEn: '', noteJa: '', groupOrder: 0, sortOrder: 0, published: true,
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

// EN: Flattened bundled checklist (category label repeated per item). go = groupOrder.
// BN: Flatten করা bundled checklist (প্রতি item-এ category label পুনরাবৃত্ত)।
const C = {
  documents: { go: 0, categoryKey: 'documents', categoryLabel: 'সাথে রাখার ডকুমেন্ট (হ্যান্ড লাগেজে)', categoryLabelEn: 'Documents to carry (hand luggage)', categoryLabelJa: '携帯する書類（機内持込）' },
  money: { go: 1, categoryKey: 'money', categoryLabel: 'টাকা ও ব্যাংকিং', categoryLabelEn: 'Money & banking', categoryLabelJa: 'お金・銀行' },
  arrival: { go: 2, categoryKey: 'arrival', categoryLabel: 'থাকার ব্যবস্থা, সিম ও এয়ারপোর্ট', categoryLabelEn: 'Accommodation, SIM & airport', categoryLabelJa: '住居・SIM・空港' },
  packing: { go: 3, categoryKey: 'packing', categoryLabel: 'প্যাকিং টিপস', categoryLabelEn: 'Packing tips', categoryLabelJa: '荷造りのコツ' },
  firstweek: { go: 4, categoryKey: 'firstweek', categoryLabel: 'জাপানে প্রথম সপ্তাহ', categoryLabelEn: 'First week in Japan', categoryLabelJa: '渡日後の最初の一週間' },
};
const mk = (cat, en, bn, ja, noteEn = '', noteBn = '', noteJa = '') => ({ ...cat, itemEn: en, item: bn, itemJa: ja, noteEn, note: noteBn, noteJa });
const SEED = [
  mk(C.documents, 'Passport with valid student visa + CoE original', 'বৈধ স্টুডেন্ট ভিসাসহ পাসপোর্ট + CoE মূল কপি', '有効な留学ビザ付きパスポート＋在留資格認定証明書（原本）', 'Never pack these in checked luggage.', 'এগুলো কখনো checked লাগেজে দেবেন না।', '預け荷物に入れないこと。'),
  mk(C.documents, 'School admission letter + payment receipts', 'স্কুল ভর্তির চিঠি + পেমেন্ট রসিদ', '入学許可書＋支払い領収書'),
  mk(C.documents, 'Academic certificates + notarised translations', 'একাডেমিক সার্টিফিকেট + নোটারাইজড অনুবাদ', '卒業証明書＋公証翻訳'),
  mk(C.documents, '10+ passport-size photos (3x4cm)', '১০+ পাসপোর্ট-সাইজ ছবি (৩x৪সেমি)', '証明写真10枚以上（3×4cm）', 'For residence card, bank, phone, jobs.', 'Residence card, ব্যাংক, ফোন, কাজে লাগবে।', '在留カード・銀行・携帯・仕事で必要。'),
  mk(C.money, 'Carry ~¥200,000 cash for the first month', 'প্রথম মাসের জন্য ~¥২,০০,০০০ নগদ রাখুন', '最初の1か月分として約20万円の現金', 'Opening a bank account takes 1–2 weeks.', 'ব্যাংক একাউন্ট খুলতে ১-২ সপ্তাহ।', '口座開設に1〜2週間。'),
  mk(C.money, 'Declare cash over ¥1,000,000 at customs', '¥১০,০০,০০০-এর বেশি নগদ হলে customs-এ ঘোষণা দিন', '100万円超の現金は税関で申告'),
  mk(C.money, 'Plan how your sponsor sends monthly funds', 'Sponsor কীভাবে মাসিক টাকা পাঠাবে পরিকল্পনা করুন', '支弁者の毎月の送金方法を計画', 'Keep remittance receipts for visa renewal.', 'Remittance রসিদ রাখুন (ভিসা নবায়নে)।', '送金記録を保管（ビザ更新用）。'),
  mk(C.arrival, 'Confirm dorm/apartment address + move-in date', 'ডর্ম/অ্যাপার্টমেন্ট ঠিকানা + move-in তারিখ নিশ্চিত করুন', '寮・アパートの住所と入居日を確認', 'Inochi arranges airport pickup (Saitama area).', 'Saitama-এলাকায় Inochi airport pickup করে।', '埼玉エリアは Inochi が空港送迎。'),
  mk(C.arrival, 'Get a SIM / pocket wifi at the airport', 'এয়ারপোর্টে সিম / pocket wifi নিন', '空港で SIM・ポケット Wi-Fi を入手'),
  mk(C.arrival, 'Buy a transport IC card (Suica / Pasmo)', 'ট্রান্সপোর্ট IC card কিনুন (Suica / Pasmo)', '交通系IC（Suica / Pasmo）を購入'),
  mk(C.packing, 'Season-appropriate clothing (winters are cold)', 'ঋতু-উপযোগী পোশাক (শীত ঠান্ডা)', '季節に合った服（冬は寒い）', 'Cheap winter wear is available in Japan too.', 'জাপানেও সস্তায় শীতের পোশাক পাওয়া যায়।', '冬服は日本でも安く買える。'),
  mk(C.packing, "Prescription medicine + doctor's note (English)", 'প্রেসক্রিপশন ওষুধ + ডাক্তারের নোট (ইংরেজি)', '処方薬＋医師の英文証明', 'Some medicines are restricted — check first.', 'কিছু ওষুধ নিষিদ্ধ — আগে যাচাই করুন।', '一部の薬は持込制限あり。'),
  mk(C.packing, 'No adapter needed for most devices (Japan 100V, Type A)', 'বেশিরভাগ ডিভাইসে adapter লাগে না (১০০V, Type A)', 'ほとんどの機器でアダプタ不要（100V, Aタイプ）'),
  mk(C.firstweek, 'Register your address at city hall within 14 days', '১৪ দিনের মধ্যে city hall-এ ঠিকানা নিবন্ধন', '14日以内に市役所で住所登録', 'Mandatory — bring your residence card.', 'বাধ্যতামূলক — residence card নিন।', '義務 — 在留カード持参。'),
  mk(C.firstweek, 'Enrol in National Health Insurance (Kokuho)', 'জাতীয় স্বাস্থ্য বীমায় (Kokuho) নাম লেখান', '国民健康保険に加入', 'Covers 70%; ~¥1,500–2,000/mo for students.', 'খরচের ৭০%; ছাত্রদের ~¥১,৫০০-২,০০০/মাস।', '医療費の70%；学生は月約1,500〜2,000円。'),
  mk(C.firstweek, 'Open a bank account + apply for part-time work permit', 'ব্যাংক একাউন্ট + part-time work permit আবেদন', '銀行口座開設＋資格外活動許可を申請', 'The permit can be requested at the airport too.', 'Permit airport-এও চাওয়া যায়।', '許可は空港でも申請可能。'),
];

export default function PreDepartureManage() {
  const api = axiosInterceptor();
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);

  const flash = (ok, text) => { setMsg({ ok, text }); setTimeout(() => setMsg(null), 4000); };

  const load = async () => {
    setLoading(true);
    try { const res = await api.get('/pre-departure?all=true'); setRows(res.data?.items || []); }
    catch (err) { flash(false, err.response?.data?.error || 'লোড করা যায়নি'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const edit = (r) => { setForm({ ...empty, ...r }); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const reset = () => setForm(empty);

  const save = async () => {
    if (!form.categoryKey.trim()) return flash(false, 'Category key দিন');
    if (!form.item.trim() && !form.itemEn.trim()) return flash(false, 'Item দিন');
    try {
      if (form.id) { await api.put(`/pre-departure/${form.id}`, form); flash(true, 'আপডেট হয়েছে'); }
      else { await api.post('/pre-departure', form); flash(true, 'যোগ হয়েছে'); }
      reset(); load();
    } catch (err) { flash(false, err.response?.data?.error || 'সেভ করা যায়নি'); }
  };

  const del = async (r) => {
    if (!(await confirmDialog({ title: 'Item মুছবেন?', message: 'এই item মুছে ফেলা হবে।', confirmText: 'মুছুন' }))) return;
    try { await api.delete(`/pre-departure/${r.id}`); flash(true, 'মুছে ফেলা হয়েছে'); load(); }
    catch (err) { flash(false, err.response?.data?.error || 'মুছে ফেলা যায়নি'); }
  };

  const importSeed = async () => {
    if (!(await confirmDialog({ title: 'Seed import?', message: `${SEED.length}টি item যোগ হবে।`, danger: false, confirmText: 'Import' }))) return;
    const have = new Set(rows.map((r) => (r.categoryKey + '|' + (r.itemEn || r.item))));
    let n = 0;
    for (let i = 0; i < SEED.length; i += 1) {
      const s = SEED[i];
      if (have.has(s.categoryKey + '|' + s.itemEn)) continue;
      // eslint-disable-next-line no-await-in-loop
      try { await api.post('/pre-departure', { ...s, sortOrder: i, published: true }); n += 1; } catch { /* skip */ }
    }
    flash(true, `${n}টি import হয়েছে`); load();
  };

  const grouped = rows.reduce((acc, r) => { (acc[r.categoryKey] = acc[r.categoryKey] || { label: r.categoryLabelEn || r.categoryKey, items: [] }).items.push(r); return acc; }, {});

  return (
    <div className="space-y-5 max-w-5xl pb-24">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-navy">Pre-Departure চেকলিস্ট</h1>
          <p className="mt-1 text-sm text-brand-slate">/pre-departure পেজের checklist যোগ/এডিট করুন। একই category-র সব item-এ একই label দিন।</p>
        </div>
        <button type="button" onClick={importSeed} className="rounded-md border border-brand-navy px-3 py-1.5 text-xs font-semibold text-brand-navy hover:bg-brand-tealLight/10">⤓ Seed import</button>
      </div>

      {msg && <div className={`rounded-lg border px-4 py-2.5 text-sm ${msg.ok ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-red-300 bg-red-50 text-red-800'}`}>{msg.ok ? '✓ ' : '✗ '}{msg.text}</div>}

      <section className="rounded-xl border border-brand-tealLight/40 bg-white p-5 shadow-sm space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wide text-brand-navy">{form.id ? 'Item এডিট' : 'নতুন item'}</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div><label className={labelClass}>Category key</label><input value={form.categoryKey} onChange={(e) => setForm({ ...form, categoryKey: e.target.value })} placeholder="documents" className={inputClass} /></div>
          <div><label className={labelClass}>Group order</label><input type="number" value={form.groupOrder} onChange={(e) => setForm({ ...form, groupOrder: Number(e.target.value) })} className={inputClass} /></div>
          <div><label className={labelClass}>Item ক্রম</label><input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} className={inputClass} /></div>
          <label className="mt-5 flex items-center gap-2 text-sm text-brand-navy"><input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} /> প্রকাশিত</label>
        </div>
        <Tri form={form} set={(p) => setForm({ ...form, ...p })} k="categoryLabel" label="Category নাম" />
        <Tri form={form} set={(p) => setForm({ ...form, ...p })} k="item" label="Item" area />
        <Tri form={form} set={(p) => setForm({ ...form, ...p })} k="note" label="Note (ঐচ্ছিক)" area />
        <div className="flex gap-2">
          <button type="button" onClick={save} className="rounded-md bg-brand-teal px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-navy">{form.id ? 'আপডেট' : '+ যোগ করুন'}</button>
          {form.id && <button type="button" onClick={reset} className="rounded-md border border-brand-navy px-4 py-2.5 text-sm font-semibold text-brand-navy hover:bg-brand-tealLight/10">বাতিল</button>}
        </div>
      </section>

      <section className="rounded-xl border border-brand-tealLight/40 bg-white shadow-sm overflow-hidden">
        <h2 className="border-b border-brand-tealLight/40 px-5 py-3 text-sm font-bold uppercase tracking-wide text-brand-navy">তালিকা ({rows.length} item)</h2>
        {loading ? <p className="p-5 text-sm text-brand-slate">লোড হচ্ছে…</p> : rows.length === 0 ? (
          <p className="p-5 text-sm text-brand-slate/70">কোনো item নেই। “Seed import” চাপুন। (পাবলিক সাইটে আপাতত বিল্ট-ইন তালিকা দেখাবে।)</p>
        ) : (
          <div className="divide-y divide-brand-tealLight/30">
            {Object.entries(grouped).map(([key, g]) => (
              <div key={key} className="px-5 py-3">
                <p className="text-xs font-bold uppercase text-brand-teal-700">{g.label} <span className="text-brand-slate/60">({g.items.length})</span></p>
                <ul className="mt-1.5 space-y-1">
                  {g.items.map((r) => (
                    <li key={r.id} className="flex items-center justify-between gap-3 text-sm">
                      <span className="min-w-0 truncate text-brand-navy">{r.itemEn || r.item}{!r.published && <span className="ml-1 text-[10px] text-amber-600">(off)</span>}</span>
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
