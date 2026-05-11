/**
 * EN: Bangladesh "Study from <city>" admin page. CRUD over the BdCity table
 *     that powers /study-from on the public site. Admin can:
 *       - Add / edit / delete a city
 *       - Upload a hero image (Cloudinary)
 *       - Maintain bilingual name + tagline (EN + BN, plus optional JA)
 *       - Edit highlights and nearby-area chips per language
 *       - Set the next intake label, counselling mode, alumni count, and
 *         whether a physical branch exists.
 *     A first-run helper imports the legacy three-city seed in one click so
 *     a fresh DB doesn't show up empty on the public site.
 *
 * BN: বাংলাদেশের "<শহর> থেকে অধ্যয়ন" admin page। Public site-এর
 *     /study-from-কে চালানো BdCity table-এর CRUD। Admin করতে পারে:
 *       - শহর add / edit / delete
 *       - Hero image upload (Cloudinary)
 *       - দুই ভাষার নাম + tagline (EN + BN, optional JA)
 *       - প্রতিটা ভাষায় highlight এবং কাছের এলাকা chip
 *       - পরবর্তী intake label, counselling mode, alumni সংখ্যা, ফিজিক্যাল
 *         শাখা আছে কিনা।
 *     First-run helper এক click-এ legacy তিন-শহর seed import করে — fresh
 *     DB-তে public site যেন ফাঁকা না থাকে।
 */

import { useEffect, useState } from 'react';
import axiosInterceptor from '../axios/axiosInterceptor';
import BilingualField from '../components/BilingualField';
import ImageUploadField from '../components/ImageUploadField';
import { confirmDialog } from '../components/ConfirmDialog';

const inputClass =
  'w-full rounded-md border border-brand-tealLight/60 bg-white px-3 py-2.5 text-sm text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-teal/40 focus:border-brand-teal';
const labelClass = 'mb-1 block text-xs font-bold uppercase tracking-wider text-brand-navy';

// EN: Default form shape — single source of truth for editor reset.
// BN: Form-এর default shape — editor reset-এর single source।
const empty = {
  slug: '',
  name: '',
  nameEn: '',
  nameJa: '',
  tagline: '',
  taglineEn: '',
  taglineJa: '',
  studentsPlaced: 0,
  hasBranch: false,
  branchAddress: '',
  branchAddressEn: '',
  phones: [],
  heroImage: '',
  highlights: [],
  nearbyAreas: [],
  programsOffered: [],
  nextIntake: '',
  nextIntakeEn: '',
  counsellingMode: 'online',
  sortOrder: 0,
  published: true,
};

// EN: Three-city seed mirrors the legacy bd-city-pages.json. Lets the admin
//     bootstrap a fresh database without hand-typing the existing copy.
// BN: তিন-শহর seed legacy bd-city-pages.json-এর mirror। Fresh DB-তে admin
//     এক click-এ existing copy bootstrap করতে পারে — হাতে টাইপ করতে হয় না।
const SEED_CITIES = [
  {
    slug: 'dhaka',
    name: 'ঢাকা', nameEn: 'Dhaka', nameJa: 'ダッカ',
    tagline: 'Inochi-র বাংলাদেশ প্রধান কার্যালয়। দেশের সবচেয়ে বড় জাপানি-ভাষা ছাত্র কমিউনিটি।',
    taglineEn: "Inochi's Bangladesh head office. The biggest Japanese-language student community in the country.",
    taglineJa: 'Inochi バングラデシュ本社。国内最大の日本語学生コミュニティ。',
    studentsPlaced: 124,
    hasBranch: true,
    branchAddress: 'এস এম ভবন, চ-৭৫/সি (৪র্থ তলা), উত্তর বাড্ডা, প্রগতি সরণি, ঢাকা',
    branchAddressEn: 'S.M Bhaban, Cha-75/C (4th Floor), North Badda, Pragati Sarani, Dhaka',
    phones: ['+880 1784-889646', '+880 1896-214840'],
    counsellingMode: 'in-person',
    sortOrder: 0,
    published: true,
    highlights: [
      { bn: '১৮০+ ঘণ্টা সরাসরি JLPT N5 / N4 ক্লাস — সপ্তাহে ৬টি ব্যাচ', en: '180+ hour in-person JLPT N5 / N4 classes — 6 batches per week' },
      { bn: 'টোকিও + সাইতামায় সবচেয়ে বড় বাংলাদেশি alumni নেটওয়ার্ক', en: 'Largest Bangladeshi alumni network in Tokyo + Saitama' },
      { bn: 'সপ্তাহে ৬ দিন walk-in counselling (শনি-বৃহস্পতি)', en: 'Walk-in counselling 6 days a week (Sat-Thu)' },
      { bn: '১৪টি জাপানি ল্যাঙ্গুয়েজ স্কুলের সাথে সরাসরি অংশীদারিত্ব', en: 'Direct partnerships with 14 Japanese language schools' },
    ],
    nearbyAreas: [
      { bn: 'উত্তর বাড্ডা', en: 'North Badda' },
      { bn: 'গুলশান', en: 'Gulshan' },
      { bn: 'বনানী', en: 'Banani' },
      { bn: 'মিরপুর', en: 'Mirpur' },
      { bn: 'উত্তরা', en: 'Uttara' },
      { bn: 'ধানমন্ডি', en: 'Dhanmondi' },
    ],
    programsOffered: [
      { bn: 'JLPT N5 / N4', en: 'JLPT N5 / N4' },
      { bn: 'ভিসা সহায়তা', en: 'Visa support' },
      { bn: 'University placement', en: 'University placement' },
    ],
  },
  {
    slug: 'sylhet',
    name: 'সিলেট', nameEn: 'Sylhet', nameJa: 'シレット',
    tagline: 'সিলেটের ছাত্রদের জন্য অনলাইন + remote counselling। livestream-এ JLPT ক্লাস + ঢাকায় মাসিক in-person workshop।',
    taglineEn: 'Online + remote counselling for Sylhet students. JLPT classes via livestream + monthly in-person workshops in Dhaka.',
    taglineJa: 'シレット学生向けオンライン+リモート相談。ライブ配信 JLPT 授業+ダッカでの月次対面ワークショップ。',
    studentsPlaced: 23,
    hasBranch: false,
    branchAddress: '', branchAddressEn: '',
    phones: ['+880 1784-889646'],
    counsellingMode: 'hybrid',
    sortOrder: 1,
    published: true,
    highlights: [
      { bn: 'সিলেটের ছাত্রদের জন্য অনলাইন JLPT track-এ ৩০% ছাড়', en: 'Online JLPT track at 30% discount for Sylhet students' },
      { bn: 'সিলেট বিভাগ থেকে ২৩ জন alumni বর্তমানে জাপানে', en: '23 alumni currently in Japan from Sylhet division' },
      { bn: 'গুরুতর আবেদনকারীদের জন্য মাসিক ঢাকা workshop + ভ্রমণ খরচ ফেরত', en: 'Monthly Dhaka workshop with travel reimbursement for serious applicants' },
    ],
    nearbyAreas: [
      { bn: 'জিন্দাবাজার', en: 'Zindabazar' },
      { bn: 'শুভানিঘাট', en: 'Subhanighat' },
      { bn: 'শ্রীমঙ্গল', en: 'Sreemangal' },
      { bn: 'হবিগঞ্জ', en: 'Habiganj' },
    ],
    programsOffered: [
      { bn: 'অনলাইন JLPT', en: 'Online JLPT' },
      { bn: 'মাসিক workshop', en: 'Monthly workshop' },
    ],
  },
  {
    slug: 'chittagong',
    name: 'চট্টগ্রাম', nameEn: 'Chittagong', nameJa: 'チッタゴン',
    tagline: 'অনলাইন counselling + ত্রৈমাসিক in-person সেমিনার। ঢাকা campus থেকে livestream-এ JLPT N5 prep।',
    taglineEn: 'Online counselling + quarterly in-person seminars. JLPT N5 prep via livestream from Dhaka campus.',
    taglineJa: 'オンライン相談 + 四半期対面セミナー。ダッカキャンパスからライブ配信 JLPT N5 対策。',
    studentsPlaced: 18,
    hasBranch: false,
    branchAddress: '', branchAddressEn: '',
    phones: ['+880 1784-889646'],
    counsellingMode: 'online',
    sortOrder: 2,
    published: true,
    highlights: [
      { bn: 'ত্রৈমাসিক চট্টগ্রাম সেমিনার — পরবর্তী তারিখ /events-এ', en: 'Quarterly Chittagong seminar — next dates announced on /events' },
      { bn: 'চট্টগ্রাম বিভাগ থেকে ১৮ জন alumni বর্তমানে জাপানে', en: '18 alumni from Chittagong division currently in Japan' },
      { bn: 'অনলাইন JLPT track + Skype/Zoom counselling', en: 'Online JLPT track + Skype/Zoom counselling' },
    ],
    nearbyAreas: [
      { bn: 'জিইসি মোড়', en: 'GEC Circle' },
      { bn: 'আগ্রাবাদ', en: 'Agrabad' },
      { bn: 'কক্সবাজার', en: "Cox's Bazar" },
      { bn: 'রাঙামাটি', en: 'Rangamati' },
    ],
    programsOffered: [
      { bn: 'অনলাইন JLPT', en: 'Online JLPT' },
      { bn: 'ত্রৈমাসিক সেমিনার', en: 'Quarterly seminar' },
    ],
  },
];

export default function BdCitiesManage() {
  const api = axiosInterceptor();
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      // EN: raw=true so admin gets per-language column values, not the
      //     collapsed multilingual-object public shape.
      // BN: raw=true — admin per-language column value পায়, public-এর
      //     collapsed multilingual-object shape না।
      const { data } = await api.get('/bd-cities?all=true&raw=true');
      setCities(data.cities || []);
    } catch (err) {
      console.error('BD cities list error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? checked
          : name === 'sortOrder' || name === 'studentsPlaced'
            ? Number(value)
            : value,
    }));
  };

  const setListField = (key, next) => setForm((prev) => ({ ...prev, [key]: next }));

  const reset = () => {
    setForm(empty);
    setEditingId(null);
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = {
        ...form,
        slug: (form.slug || form.nameEn || form.name || '')
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, ''),
        phones: form.phones.filter((p) => p && p.trim()),
        highlights: form.highlights.filter((h) => h && (h.bn || h.en)),
        nearbyAreas: form.nearbyAreas.filter((a) => a && (a.bn || a.en)),
        programsOffered: form.programsOffered.filter((p) => p && (p.bn || p.en)),
      };
      if (editingId) await api.put(`/bd-cities/${editingId}`, payload);
      else await api.post('/bd-cities', payload);
      reset();
      await load();
    } catch (err) {
      const msg = err.response?.data?.error || 'Save failed';
      alert(msg);
    } finally {
      setBusy(false);
    }
  };

  const edit = (c) => {
    setEditingId(c.id);
    setForm({
      ...empty,
      ...c,
      phones: Array.isArray(c.phones) ? c.phones : [],
      highlights: Array.isArray(c.highlights) ? c.highlights : [],
      nearbyAreas: Array.isArray(c.nearbyAreas) ? c.nearbyAreas : [],
      programsOffered: Array.isArray(c.programsOffered) ? c.programsOffered : [],
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const remove = async (id) => {
    const ok = await confirmDialog({
      title: 'এই শহর delete করবেন?',
      message: 'এই শহর-card ও /study-from/<slug> পেজ public site থেকে সরে যাবে।',
      confirmText: 'হ্যাঁ, delete',
      cancelText: 'বাতিল',
      danger: true,
    });
    if (!ok) return;
    try {
      await api.delete(`/bd-cities/${id}`);
      await load();
    } catch (err) {
      alert('Delete failed');
    }
  };

  const importSeed = async () => {
    const ok = await confirmDialog({
      title: 'তিনটি শহর import?',
      message: 'Dhaka, Sylhet, Chittagong — পুরাতন JSON থেকে নিয়ে DB-তে seed করব। চালাবো?',
      confirmText: 'হ্যাঁ, import',
      cancelText: 'বাতিল',
      icon: '📥',
    });
    if (!ok) return;
    setBusy(true);
    try {
      for (const c of SEED_CITIES) {
        // eslint-disable-next-line no-await-in-loop
        await api.post('/bd-cities', c).catch(() => {});
      }
      await load();
    } finally {
      setBusy(false);
    }
  };

  const isEmpty = !loading && cities.length === 0;

  return (
    <div className="space-y-6 max-w-5xl">
      <PageHeader />

      {isEmpty && <SeedNotice onImport={importSeed} busy={busy} />}

      <CityForm
        form={form}
        editingId={editingId}
        busy={busy}
        onChange={onChange}
        setListField={setListField}
        onSubmit={submit}
        onReset={reset}
      />

      <CityList loading={loading} cities={cities} onEdit={edit} onDelete={remove} />
    </div>
  );
}

function PageHeader() {
  return (
    <div>
      <h1 className="text-2xl font-extrabold text-brand-navy">শহর-ভিত্তিক পেজ</h1>
      <p className="mt-1 text-sm text-brand-slate">
        Public site-এর /study-from পেজে যে কার্ডগুলো দেখা যায় — Dhaka, Sylhet,
        Chittagong ইত্যাদি — এখান থেকে add / edit / delete করুন। পরিবর্তন
        ৬০ সেকেন্ডে public site-এ চলে যায়।
      </p>
    </div>
  );
}

function SeedNotice({ onImport, busy }) {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
      <p className="font-semibold">📍 এখনও কোনো শহর যোগ করা হয়নি</p>
      <p className="mt-1 leading-relaxed">
        নিচের ফর্ম দিয়ে নিজে শহর যোগ করতে পারেন, অথবা এক click-এ পুরাতন তিন-শহর seed
        (Dhaka, Sylhet, Chittagong) import করতে পারেন।
      </p>
      <button
        type="button"
        onClick={onImport}
        disabled={busy}
        className="mt-3 rounded bg-brand-teal px-4 py-2 text-xs font-semibold text-white hover:bg-brand-navy disabled:opacity-50"
      >
        {busy ? 'Importing…' : 'তিনটা শহর import করুন'}
      </button>
    </div>
  );
}

function CityForm({ form, editingId, busy, onChange, setListField, onSubmit, onReset }) {
  return (
    <form onSubmit={onSubmit} className="space-y-5 rounded-xl border border-brand-tealLight/40 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-bold uppercase tracking-wide text-brand-navy">
        {editingId ? 'শহর Edit' : 'নতুন শহর যোগ'}
      </h2>

      {/* EN: City names — three languages. BN: শহরের নাম — তিন ভাষা। */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <label>
          <span className={labelClass}>শহরের নাম (বাংলা)</span>
          <input name="name" value={form.name} onChange={onChange} className={inputClass} required placeholder="ঢাকা" />
        </label>
        <label>
          <span className={labelClass}>City (English)</span>
          <input name="nameEn" value={form.nameEn} onChange={onChange} className={inputClass} placeholder="Dhaka" />
        </label>
        <label>
          <span className={labelClass}>都市 (Japanese)</span>
          <input name="nameJa" value={form.nameJa} onChange={onChange} className={inputClass} placeholder="ダッカ" />
        </label>
      </div>

      <label className="block">
        <span className={labelClass}>
          Slug (URL key) <span className="font-normal normal-case tracking-normal text-brand-slate">— ফাঁকা রাখলে নাম থেকে auto তৈরি হবে</span>
        </span>
        <input name="slug" value={form.slug} onChange={onChange} className={inputClass} placeholder="dhaka" />
      </label>

      {/* EN: Tagline trio — concise pitch shown under the card heading. */}
      {/* BN: Tagline trio — card heading-এর নিচে ছোট pitch। */}
      <BilingualField
        label="Tagline (ছোট পরিচয়)"
        hint="২-৩ লাইন। কেন এই শহরের ছাত্ররা Inochi বেছে নেবে — সেই গল্প।"
        name="tagline"
        type="textarea"
        rows={2}
        value={form.tagline}
        valueEn={form.taglineEn}
        onChange={onChange}
        placeholderBn="ঢাকা থেকে জাপানে যাওয়ার পথে…"
        placeholderEn="From Dhaka to Japan…"
      />
      <label className="block">
        <span className={labelClass}>キャッチコピー (Japanese, optional)</span>
        <textarea
          name="taglineJa"
          value={form.taglineJa}
          onChange={onChange}
          rows={2}
          className={inputClass + ' min-h-[72px]'}
          placeholder="ダッカから日本へ…"
        />
      </label>

      <ImageUploadField
        label="শহরের ছবি (Hero image)"
        value={form.heroImage}
        onChange={(url) => setListField('heroImage', url)}
        hint="শহরের landmark বা শাখার ছবি। Card-এর উপরে দেখানো হবে। না দিলে teal gradient।"
      />

      {/* EN: Quick-stat row. */}
      {/* BN: Quick-stat row। */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <label>
          <span className={labelClass}>জাপানে alumni</span>
          <input
            type="number"
            name="studentsPlaced"
            min="0"
            value={form.studentsPlaced}
            onChange={onChange}
            className={inputClass}
          />
        </label>
        <label>
          <span className={labelClass}>Counselling mode</span>
          <select name="counsellingMode" value={form.counsellingMode} onChange={onChange} className={inputClass}>
            <option value="in-person">সরাসরি (in-person)</option>
            <option value="online">অনলাইন</option>
            <option value="hybrid">দুটোই (hybrid)</option>
          </select>
        </label>
        <label>
          <span className={labelClass}>Next intake (BN)</span>
          <input name="nextIntake" value={form.nextIntake} onChange={onChange} className={inputClass} placeholder="মার্চ ২০২৬" />
        </label>
        <label>
          <span className={labelClass}>Next intake (EN)</span>
          <input name="nextIntakeEn" value={form.nextIntakeEn} onChange={onChange} className={inputClass} placeholder="March 2026" />
        </label>
      </div>

      <div>
        <span className={labelClass}>শাখার তথ্য</span>
        <label className="mt-2 inline-flex items-center gap-2 text-sm text-brand-navy">
          <input type="checkbox" name="hasBranch" checked={form.hasBranch} onChange={onChange} />
          এই শহরে আমাদের শাখা আছে
        </label>
        {form.hasBranch && (
          <div className="mt-3">
            <BilingualField
              label="শাখার ঠিকানা"
              name="branchAddress"
              type="textarea"
              rows={2}
              value={form.branchAddress}
              valueEn={form.branchAddressEn}
              onChange={onChange}
            />
          </div>
        )}
      </div>

      <div>
        <span className={labelClass}>ফোন নম্বর</span>
        <ChipListEditor
          items={form.phones}
          onChange={(next) => setListField('phones', next)}
          placeholder="+880 1784-889646"
          addLabel="+ আরেকটা ফোন"
          monolingual
        />
      </div>

      <div>
        <span className={labelClass}>শীর্ষ সুবিধা (Highlights)</span>
        <p className="mb-2 text-xs text-brand-slate">কেন এই শহরের ছাত্ররা Inochi বেছে নেবে — ৩-৪টা bullet।</p>
        <BilingualListEditor
          items={form.highlights}
          onChange={(next) => setListField('highlights', next)}
          placeholderBn="JLPT N5 ক্লাস সপ্তাহে ৬টা ব্যাচ"
          placeholderEn="JLPT N5 classes — 6 batches/week"
          addLabel="+ আরেকটা highlight"
        />
      </div>

      <div>
        <span className={labelClass}>কাছের এলাকা</span>
        <p className="mb-2 text-xs text-brand-slate">এই শহরের যে এলাকার ছাত্ররা সেবা পান — chip হয়ে দেখাবে।</p>
        <BilingualListEditor
          items={form.nearbyAreas}
          onChange={(next) => setListField('nearbyAreas', next)}
          placeholderBn="গুলশান"
          placeholderEn="Gulshan"
          addLabel="+ আরেকটা এলাকা"
        />
      </div>

      <div>
        <span className={labelClass}>যা পাবেন (Programs offered)</span>
        <p className="mb-2 text-xs text-brand-slate">JLPT, ভিসা সহায়তা, university placement ইত্যাদি — chip হয়ে দেখাবে।</p>
        <BilingualListEditor
          items={form.programsOffered}
          onChange={(next) => setListField('programsOffered', next)}
          placeholderBn="JLPT N5"
          placeholderEn="JLPT N5"
          addLabel="+ আরেকটা program"
        />
      </div>

      <div className="flex flex-wrap items-end gap-4 pt-2">
        <label>
          <span className={labelClass}>Sort order</span>
          <input type="number" name="sortOrder" value={form.sortOrder} onChange={onChange} className={inputClass + ' w-28'} />
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="published" checked={form.published} onChange={onChange} />
          <span className="text-xs font-semibold text-brand-navy">Published</span>
        </label>
      </div>

      <div className="flex gap-2 pt-2">
        <button type="submit" disabled={busy} className="rounded bg-brand-teal px-5 py-2 text-sm font-semibold text-white hover:bg-brand-navy disabled:opacity-50">
          {busy ? 'Saving…' : editingId ? 'Update city' : 'Add city'}
        </button>
        {editingId && (
          <button type="button" onClick={onReset} className="rounded border border-brand-navy bg-white px-5 py-2 text-sm font-semibold text-brand-navy">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

// EN: Mono-string list (phones). One input per row + remove + add.
// BN: একক-string list (phones)। প্রতি row-এ এক input + remove + add।
function ChipListEditor({ items, onChange, placeholder, addLabel }) {
  const update = (i, value) => {
    const next = [...items];
    next[i] = value;
    onChange(next);
  };
  return (
    <div className="space-y-2">
      {items.length === 0 && <p className="text-xs italic text-brand-slate/70">এখনো কিছু যোগ করা হয়নি।</p>}
      {items.map((p, i) => (
        <div key={i} className="flex gap-2">
          <input
            value={p}
            onChange={(e) => update(i, e.target.value)}
            className={inputClass + ' flex-1'}
            placeholder={placeholder}
          />
          <button
            type="button"
            onClick={() => onChange(items.filter((_, idx) => idx !== i))}
            className="rounded bg-red-100 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-200"
          >
            Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, ''])}
        className="text-xs font-semibold text-brand-teal hover:text-brand-navy"
      >
        {addLabel}
      </button>
    </div>
  );
}

// EN: Bilingual list — each row has BN + EN inputs. Saved as { bn, en } objects.
// BN: Bilingual list — প্রতি row-এ BN + EN input। { bn, en } object হিসেবে save।
function BilingualListEditor({ items, onChange, placeholderBn, placeholderEn, addLabel }) {
  const update = (i, key, value) => {
    const next = [...items];
    next[i] = { ...(next[i] || {}), [key]: value };
    onChange(next);
  };
  return (
    <div className="space-y-2">
      {items.length === 0 && <p className="text-xs italic text-brand-slate/70">এখনো কিছু যোগ করা হয়নি।</p>}
      {items.map((row, i) => (
        <div key={i} className="grid grid-cols-1 gap-2 rounded-md border border-brand-tealLight/40 bg-brand-tealLight/5 p-2 md:grid-cols-[1fr,1fr,auto]">
          <input
            value={row?.bn || ''}
            onChange={(e) => update(i, 'bn', e.target.value)}
            className={inputClass}
            placeholder={placeholderBn}
            dir="auto"
          />
          <input
            value={row?.en || ''}
            onChange={(e) => update(i, 'en', e.target.value)}
            className={inputClass}
            placeholder={placeholderEn}
          />
          <button
            type="button"
            onClick={() => onChange(items.filter((_, idx) => idx !== i))}
            className="rounded bg-red-100 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-200 md:self-stretch"
          >
            Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, { bn: '', en: '' }])}
        className="text-xs font-semibold text-brand-teal hover:text-brand-navy"
      >
        {addLabel}
      </button>
    </div>
  );
}

function CityList({ loading, cities, onEdit, onDelete }) {
  if (loading) return <p className="text-sm text-brand-slate">Loading…</p>;
  if (cities.length === 0) return null;
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {cities.map((c) => (
        <CityCard key={c.id} city={c} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </ul>
  );
}

function CityCard({ city, onEdit, onDelete }) {
  return (
    <li className="overflow-hidden rounded-xl border border-brand-tealLight/40 bg-white shadow-sm">
      {city.heroImage && (
        <div className="aspect-[16/9] w-full overflow-hidden bg-brand-tealLight/30">
          <img src={city.heroImage} alt={city.name} className="h-full w-full object-cover" />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-brand-navy">
              {city.name}
              {city.nameEn && <span className="ml-2 text-xs font-normal text-brand-slate/80">/ {city.nameEn}</span>}
            </h3>
            <div className="mt-1 flex flex-wrap gap-1 text-[10px] font-bold uppercase tracking-wider">
              {city.hasBranch ? (
                <span className="rounded-full bg-brand-teal/10 px-2 py-0.5 text-brand-teal">শাখা আছে</span>
              ) : (
                <span className="rounded-full bg-brand-navy/10 px-2 py-0.5 text-brand-navy">অনলাইন</span>
              )}
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-700">{city.studentsPlaced} alumni</span>
              {!city.published && <span className="rounded-full bg-gray-200 px-2 py-0.5 text-gray-700">Draft</span>}
            </div>
          </div>
          <div className="flex flex-shrink-0 gap-2 text-xs font-semibold">
            <button onClick={() => onEdit(city)} className="text-brand-teal hover:text-brand-navy">Edit</button>
            <button onClick={() => onDelete(city.id)} className="text-red-500 hover:text-red-700">Delete</button>
          </div>
        </div>
        {city.tagline && <p className="mt-2 line-clamp-3 text-sm text-brand-slate">{city.tagline}</p>}
      </div>
    </li>
  );
}
