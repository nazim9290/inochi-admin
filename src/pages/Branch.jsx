/**
 * EN: Branches admin page — full CRUD against backend Branch model. Lists all
 *     offices, lets admin add / edit / delete, with bilingual (BN+EN) address
 *     fields and a phones array editor. On first load, if backend is empty
 *     we surface the FALLBACK seed list with an "Import seed" button so the
 *     admin can bootstrap the four current offices in one click.
 * BN: ব্রাঞ্চ admin page — backend Branch model-এর সাথে full CRUD। সব office
 *     list, add / edit / delete, দুই ভাষার (BN+EN) address field, phone array
 *     editor। প্রথম লোডে backend empty থাকলে FALLBACK seed list আর "Import
 *     seed" button — admin এক click-এ চারটা office bootstrap করতে পারে।
 */

import { useEffect, useState } from 'react';
import axiosInterceptor from '../axios/axiosInterceptor';

const inputClass =
  'w-full px-3 py-2 text-sm border border-brand-tealLight/60 rounded focus:outline-none focus:ring-2 focus:ring-brand-teal/40';
const labelClass = 'block text-xs font-semibold text-brand-navy mb-1';

// EN: Default form shape — single source of truth for the editor reset.
// BN: Form-এর default shape — editor reset-এর জন্য একটামাত্র source।
const empty = {
  slug: '',
  city: '',
  cityBn: '',
  address: '',
  addressBn: '',
  phones: [],
  mapEmbedUrl: '',
  isHeadOffice: false,
  isJapanOffice: false,
  sortOrder: 0,
  published: true,
};

// EN: Seed list mirrors lib/site.js on the public site so admins can import
//     the four current offices in one click instead of typing them again.
// BN: Public site-এর lib/site.js-এর mirror seed list — admin এক click-এ
//     চারটা office import করতে পারে, আবার type করতে হয় না।
const SEED_BRANCHES = [
  {
    slug: 'dhaka',
    city: 'Dhaka',
    cityBn: 'ঢাকা',
    isHeadOffice: true,
    isJapanOffice: false,
    address: 'S.M Bhaban, Cha-75/C (4th Floor), North Badda, Pragati Sarani, Dhaka',
    addressBn: 'এস এম ভবন, চ-৭৫/সি (৪র্থ তলা), উত্তর বাড্ডা, প্রগতি সরণি, ঢাকা',
    phones: ['+880 1784-889646', '+880 1896-214840'],
    sortOrder: 0,
    published: true,
  },
  {
    slug: 'narayanganj',
    city: 'Narayanganj',
    cityBn: 'নারায়ণগঞ্জ',
    isHeadOffice: false,
    isJapanOffice: false,
    address: 'FM Goli, College Road, Chashara, Narayanganj',
    addressBn: 'এফএম গলি, কলেজ রোড, চাষাড়া, নারায়ণগঞ্জ',
    phones: ['+880 1896-214843'],
    sortOrder: 1,
    published: true,
  },
  {
    slug: 'barishal',
    city: 'Barishal',
    cityBn: 'বরিশাল',
    isHeadOffice: false,
    isJapanOffice: false,
    address: 'Talukdar Mansion, Nobogram Road, Muslim Para, Barishal',
    addressBn: 'তালুকদার ম্যানশন, নবগ্রাম রোড, মুসলিম পাড়া, বরিশাল',
    phones: ['+880 1896-214847', '+880 1716-176222'],
    sortOrder: 2,
    published: true,
  },
  {
    slug: 'saitama',
    city: 'Japan',
    cityBn: 'জাপান',
    isHeadOffice: false,
    isJapanOffice: true,
    address: '〒335-0013 Saitama-ken, Toda-shi, Kizawa 1-15-4, Asahi Heim 303',
    addressBn: '〒335-0013 সাইতামা-কেন, তোদা-শি, কিজাওয়া ১-১৫-৪',
    phones: ['+81 70-1302-5135'],
    sortOrder: 3,
    published: true,
  },
];

export default function Branch() {
  const api = axiosInterceptor();
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/branches?all=true');
      setBranches(data.branches || []);
    } catch (err) {
      console.error('Branch list error:', err);
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
      [name]: type === 'checkbox' ? checked : name === 'sortOrder' ? Number(value) : value,
    }));
  };

  const setPhones = (next) => setForm((prev) => ({ ...prev, phones: next }));

  const reset = () => {
    setForm(empty);
    setEditingId(null);
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      // EN: Auto-derive a clean slug from city when the admin leaves it blank.
      // BN: Slug ফাঁকা থাকলে city থেকে auto clean slug তৈরি করি।
      const payload = {
        ...form,
        slug: (form.slug || form.city || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
        phones: form.phones.filter((p) => p && p.trim()),
      };
      if (editingId) await api.put(`/branches/${editingId}`, payload);
      else await api.post('/branches', payload);
      reset();
      await load();
    } catch (err) {
      const msg = err.response?.data?.error || 'Save failed';
      alert(msg);
    } finally {
      setBusy(false);
    }
  };

  const edit = (b) => {
    setEditingId(b.id);
    setForm({ ...empty, ...b, phones: Array.isArray(b.phones) ? b.phones : [] });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const remove = async (id) => {
    if (!confirm('এই branch delete করতে চান?')) return;
    try {
      await api.delete(`/branches/${id}`);
      await load();
    } catch (err) {
      alert('Delete failed');
    }
  };

  const importSeed = async () => {
    if (!confirm('চারটা default office (Dhaka, Narayanganj, Barishal, Japan) import করব। চালাবো?')) return;
    setBusy(true);
    try {
      for (const b of SEED_BRANCHES) {
        // eslint-disable-next-line no-await-in-loop
        await api.post('/branches', b).catch(() => {});
      }
      await load();
    } finally {
      setBusy(false);
    }
  };

  const isEmpty = !loading && branches.length === 0;

  return (
    <div className="space-y-6 max-w-5xl">
      <PageHeader />

      {isEmpty && <SeedNotice onImport={importSeed} busy={busy} />}

      <BranchForm
        form={form}
        editingId={editingId}
        busy={busy}
        onChange={onChange}
        setPhones={setPhones}
        onSubmit={submit}
        onReset={reset}
      />

      <BranchList
        loading={loading}
        branches={branches}
        onEdit={edit}
        onDelete={remove}
      />
    </div>
  );
}

// EN: Page title + subtitle.
// BN: Page title + subtitle।
function PageHeader() {
  return (
    <div>
      <h1 className="text-2xl font-extrabold text-brand-navy">আমাদের অফিস</h1>
      <p className="mt-1 text-sm text-brand-slate">
        Inochi-র office গুলো এখান থেকে add / edit / delete করুন। Public site
        ৬০ সেকেন্ডের মধ্যে update হয়।
      </p>
    </div>
  );
}

// EN: First-run helper — offers to seed the four current offices in one click.
// BN: First-run helper — চারটা current office এক click-এ seed করার option।
function SeedNotice({ onImport, busy }) {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
      <p className="font-semibold">📍 এখনো কোনো branch add করা হয়নি</p>
      <p className="mt-1 leading-relaxed">
        নিচের form দিয়ে নিজে add করতে পারেন, অথবা এক click-এ চারটা current office
        (Dhaka, Narayanganj, Barishal, Japan) import করতে পারেন।
      </p>
      <button
        type="button"
        onClick={onImport}
        disabled={busy}
        className="mt-3 rounded bg-brand-teal px-4 py-2 text-xs font-semibold text-white hover:bg-brand-navy disabled:opacity-50"
      >
        {busy ? 'Importing…' : 'Import default offices'}
      </button>
    </div>
  );
}

// EN: Add / edit form for a single branch.
// BN: একটা branch-এর জন্য add / edit form।
function BranchForm({ form, editingId, busy, onChange, setPhones, onSubmit, onReset }) {
  return (
    <form onSubmit={onSubmit} className="bg-white rounded-xl border border-brand-tealLight/40 shadow-sm p-5">
      <h2 className="text-sm font-bold text-brand-navy uppercase tracking-wide mb-4">
        {editingId ? 'Edit Branch' : 'Add Branch'}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <label>
          <span className={labelClass}>City (English)</span>
          <input name="city" value={form.city} onChange={onChange} className={inputClass} required placeholder="Dhaka" />
        </label>
        <label>
          <span className={labelClass}>City (Bangla)</span>
          <input name="cityBn" value={form.cityBn} onChange={onChange} className={inputClass} placeholder="ঢাকা" />
        </label>
        <label className="md:col-span-2">
          <span className={labelClass}>
            Slug (URL key) <span className="font-normal text-brand-slate">— ফাঁকা রাখলে city থেকে auto তৈরি হবে</span>
          </span>
          <input name="slug" value={form.slug} onChange={onChange} className={inputClass} placeholder="dhaka" />
        </label>
        <label className="md:col-span-2">
          <span className={labelClass}>Address (Bangla)</span>
          <textarea name="addressBn" value={form.addressBn} onChange={onChange} rows={2} className={inputClass} />
        </label>
        <label className="md:col-span-2">
          <span className={labelClass}>Address (English)</span>
          <textarea name="address" value={form.address} onChange={onChange} rows={2} className={inputClass} />
        </label>

        <div className="md:col-span-2">
          <span className={labelClass}>ফোন নম্বর</span>
          <PhonesEditor phones={form.phones} onChange={setPhones} />
        </div>

        <label className="md:col-span-2">
          <span className={labelClass}>Google Map embed URL <span className="font-normal text-brand-slate">(optional)</span></span>
          <input name="mapEmbedUrl" value={form.mapEmbedUrl} onChange={onChange} className={inputClass} placeholder="https://www.google.com/maps/embed?..." />
        </label>

        <label>
          <span className={labelClass}>Sort order</span>
          <input type="number" name="sortOrder" value={form.sortOrder} onChange={onChange} className={inputClass} />
        </label>

        <div className="flex flex-wrap items-center gap-4 pt-5">
          <label className="flex items-center gap-2">
            <input type="checkbox" name="isHeadOffice" checked={form.isHeadOffice} onChange={onChange} />
            <span className="text-xs text-brand-navy font-semibold">HQ (Head office)</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="isJapanOffice" checked={form.isJapanOffice} onChange={onChange} />
            <span className="text-xs text-brand-navy font-semibold">🇯🇵 Japan office</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="published" checked={form.published} onChange={onChange} />
            <span className="text-xs text-brand-navy font-semibold">Published</span>
          </label>
        </div>
      </div>

      <div className="flex gap-2 mt-5">
        <button type="submit" disabled={busy} className="bg-brand-teal hover:bg-brand-navy disabled:opacity-50 text-white font-semibold px-5 py-2 rounded text-sm">
          {busy ? 'Saving…' : editingId ? 'Update branch' : 'Add branch'}
        </button>
        {editingId && (
          <button type="button" onClick={onReset} className="bg-white border border-brand-navy text-brand-navy font-semibold px-5 py-2 rounded text-sm">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

// EN: Dynamic list editor for the phones[] field — add row, edit, remove.
// BN: phones[] field-এর dynamic list editor — add / edit / remove।
function PhonesEditor({ phones, onChange }) {
  const update = (i, value) => {
    const next = [...phones];
    next[i] = value;
    onChange(next);
  };
  const removeRow = (i) => onChange(phones.filter((_, idx) => idx !== i));
  const addRow = () => onChange([...phones, '']);

  return (
    <div className="space-y-2">
      {phones.length === 0 && (
        <p className="text-xs italic text-brand-slate/70">এখনো কোনো ফোন নাই। নিচ থেকে যোগ করুন।</p>
      )}
      {phones.map((p, i) => (
        <div key={i} className="flex gap-2">
          <input
            value={p}
            onChange={(e) => update(i, e.target.value)}
            className={`${inputClass} flex-1`}
            placeholder="+880 1784-889646"
          />
          <button
            type="button"
            onClick={() => removeRow(i)}
            className="px-3 py-1 text-xs font-semibold rounded bg-red-100 text-red-700 hover:bg-red-200"
          >
            Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addRow}
        className="text-xs font-semibold text-brand-teal hover:text-brand-navy"
      >
        + আরেকটা ফোন যোগ করুন
      </button>
    </div>
  );
}

// EN: Card grid of all branches with edit / delete buttons.
// BN: সব branch-এর card grid; edit / delete button সহ।
function BranchList({ loading, branches, onEdit, onDelete }) {
  if (loading) return <p className="text-sm text-brand-slate">Loading…</p>;
  if (branches.length === 0) return null;
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {branches.map((b) => (
        <BranchCard key={b.id} branch={b} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </ul>
  );
}

// EN: Single branch card — city + HQ/Japan badges + bilingual address +
//     clickable phones, edit + delete buttons in the corner.
// BN: একটা branch card — city + HQ/Japan badge + দুই ভাষার address +
//     clickable phone, কোণায় edit + delete button।
function BranchCard({ branch, onEdit, onDelete }) {
  return (
    <li className="rounded-xl border border-brand-tealLight/40 bg-white p-5 shadow-sm">
      <header className="mb-3 flex items-start gap-2">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-brand-navy">
            {branch.cityBn || branch.city}
          </h3>
          <div className="mt-1 flex flex-wrap gap-1">
            {branch.isHeadOffice && (
              <span className="rounded-full bg-brand-teal/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-teal">
                HQ
              </span>
            )}
            {branch.isJapanOffice && (
              <span className="rounded-full bg-brand-navy/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-navy">
                🇯🇵 Japan
              </span>
            )}
            {!branch.published && (
              <span className="rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-700">
                Draft
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button onClick={() => onEdit(branch)} className="text-xs font-semibold text-brand-teal hover:text-brand-navy">Edit</button>
          <button onClick={() => onDelete(branch.id)} className="text-xs font-semibold text-red-500 hover:text-red-700">Delete</button>
        </div>
      </header>

      <div className="space-y-2 text-sm leading-relaxed text-brand-slate">
        {branch.addressBn && <p>{branch.addressBn}</p>}
        {branch.address && <p className="text-xs italic text-brand-slate/80">{branch.address}</p>}
      </div>

      {Array.isArray(branch.phones) && branch.phones.length > 0 && (
        <div className="mt-4 border-t border-brand-tealLight/30 pt-3">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-brand-slate/70">
            ফোন
          </p>
          <ul className="space-y-1">
            {branch.phones.map((p) => (
              <li key={p}>
                <a
                  href={`tel:${p.replace(/[\s-]/g, '')}`}
                  className="text-sm font-semibold text-brand-teal hover:text-brand-navy"
                >
                  {p}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </li>
  );
}
