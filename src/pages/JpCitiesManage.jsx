/**
 * EN: Japan Cities admin — CRUD over JpCity rows that drive /japan-cities
 *     and /japan-cities/<slug>. Same shape as BdCitiesManage but with
 *     practical numeric strings (monthlyLiving, rent, wage, transport)
 *     and a top-schools list editor.
 * BN: Japan Cities admin — JpCity row-এর CRUD যা /japan-cities এবং
 *     /japan-cities/<slug> চালায়। BdCitiesManage-এর মতই, তবে practical
 *     numeric string (monthlyLiving, rent, wage, transport) ও top-schools
 *     list editor সহ।
 */

import { useEffect, useState } from 'react';
import axiosInterceptor from '../axios/axiosInterceptor';
import BilingualField from '../components/BilingualField';
import ImageUploadField from '../components/ImageUploadField';
import { confirmDialog } from '../components/ConfirmDialog';

const inputClass =
  'w-full rounded-md border border-brand-tealLight/60 bg-white px-3 py-2.5 text-sm text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-teal/40 focus:border-brand-teal';
const labelClass = 'mb-1 block text-xs font-bold uppercase tracking-wider text-brand-navy';

const empty = {
  slug: '',
  name: '', nameEn: '', nameJa: '',
  kanji: '',
  tagline: '', taglineEn: '', taglineJa: '',
  monthlyLiving: '', monthlyRent: '', partTimeWage: '', transportPass: '',
  climate: '', climateEn: '', climateJa: '',
  heroImage: '',
  topSchools: [],
  highlights: [],
  tradeOffs: [],
  sortOrder: 0,
  published: true,
};

export default function JpCitiesManage() {
  const api = axiosInterceptor();
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/jp-cities?all=true&raw=true');
      setCities(data.cities || []);
    } catch (err) {
      console.error('JP cities list error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({
      ...p,
      [name]: type === 'checkbox' ? checked : name === 'sortOrder' ? Number(value) : value,
    }));
  };
  const setListField = (key, next) => setForm((p) => ({ ...p, [key]: next }));
  const reset = () => { setForm(empty); setEditingId(null); };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = {
        ...form,
        slug: (form.slug || form.nameEn || form.name || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
        topSchools: form.topSchools.filter((s) => s && s.trim()),
        highlights: form.highlights.filter((h) => h && (h.bn || h.en)),
        tradeOffs: form.tradeOffs.filter((t) => t && (t.bn || t.en)),
      };
      if (editingId) await api.put(`/jp-cities/${editingId}`, payload);
      else await api.post('/jp-cities', payload);
      reset();
      await load();
    } catch (err) {
      alert(err.response?.data?.error || 'Save failed');
    } finally { setBusy(false); }
  };

  const edit = (c) => {
    setEditingId(c.id);
    setForm({
      ...empty, ...c,
      topSchools: Array.isArray(c.topSchools) ? c.topSchools : [],
      highlights: Array.isArray(c.highlights) ? c.highlights : [],
      tradeOffs: Array.isArray(c.tradeOffs) ? c.tradeOffs : [],
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const remove = async (id) => {
    const ok = await confirmDialog({
      title: 'এই জাপান-শহর delete?',
      message: 'এই শহর-card ও /japan-cities/<slug> পেজ public site থেকে সরে যাবে।',
      confirmText: 'হ্যাঁ, delete', cancelText: 'বাতিল', danger: true,
    });
    if (!ok) return;
    try { await api.delete(`/jp-cities/${id}`); await load(); }
    catch (err) { alert('Delete failed'); }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-extrabold text-brand-navy">জাপানের শহর গাইড</h1>
        <p className="mt-1 text-sm text-brand-slate">
          /japan-cities পেজে যে শহর-গাইডগুলো (Tokyo, Osaka, Kyoto …) দেখা যায়।
          খরচ, স্কুল, climate ইত্যাদি এখান থেকে edit করুন। ৬০ সেকেন্ডে public site-এ আপডেট।
        </p>
      </div>

      <form onSubmit={submit} className="space-y-5 rounded-xl border border-brand-tealLight/40 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-bold uppercase tracking-wide text-brand-navy">{editingId ? 'শহর Edit' : 'নতুন শহর যোগ'}</h2>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <label><span className={labelClass}>শহরের নাম (BN)</span><input name="name" value={form.name} onChange={onChange} className={inputClass} required placeholder="টোকিও" /></label>
          <label><span className={labelClass}>City (EN)</span><input name="nameEn" value={form.nameEn} onChange={onChange} className={inputClass} placeholder="Tokyo" /></label>
          <label><span className={labelClass}>都市 (JA)</span><input name="nameJa" value={form.nameJa} onChange={onChange} className={inputClass} placeholder="東京" /></label>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <label className="md:col-span-2">
            <span className={labelClass}>Slug <span className="font-normal normal-case tracking-normal text-brand-slate">— ফাঁকা রাখলে নাম থেকে auto</span></span>
            <input name="slug" value={form.slug} onChange={onChange} className={inputClass} placeholder="tokyo" />
          </label>
          <label><span className={labelClass}>কাঞ্জি (decorative)</span><input name="kanji" value={form.kanji} onChange={onChange} className={inputClass} placeholder="東京" /></label>
        </div>

        <BilingualField label="Tagline (ছোট পরিচয়)" name="tagline" type="textarea" rows={2}
          value={form.tagline} valueEn={form.taglineEn} onChange={onChange}
          hint="২-৩ লাইনে শহরের পরিচয়।" />
        <label className="block">
          <span className={labelClass}>キャッチコピー (Japanese)</span>
          <textarea name="taglineJa" value={form.taglineJa} onChange={onChange} rows={2} className={inputClass + ' min-h-[72px]'} />
        </label>

        <ImageUploadField label="শহরের ছবি (Hero)" value={form.heroImage} onChange={(url) => setListField('heroImage', url)}
          hint="শহরের landmark বা ক্যাম্পাস ছবি। না দিলে kanji background।" />

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <label><span className={labelClass}>মাসিক খরচ</span><input name="monthlyLiving" value={form.monthlyLiving} onChange={onChange} className={inputClass} placeholder="৳1,30,000 – 1,80,000" /></label>
          <label><span className={labelClass}>মাসিক ভাড়া</span><input name="monthlyRent" value={form.monthlyRent} onChange={onChange} className={inputClass} placeholder="৳45,000 – 70,000" /></label>
          <label><span className={labelClass}>Part-time মজুরি</span><input name="partTimeWage" value={form.partTimeWage} onChange={onChange} className={inputClass} placeholder="৳700 – 950 / hour" /></label>
          <label><span className={labelClass}>Transport pass</span><input name="transportPass" value={form.transportPass} onChange={onChange} className={inputClass} placeholder="৳12,000 – 18,000 / mo" /></label>
        </div>

        <BilingualField label="জলবায়ু (Climate)" name="climate" type="textarea" rows={2}
          value={form.climate} valueEn={form.climateEn} onChange={onChange} />
        <label className="block">
          <span className={labelClass}>気候 (Japanese)</span>
          <textarea name="climateJa" value={form.climateJa} onChange={onChange} rows={2} className={inputClass + ' min-h-[72px]'} />
        </label>

        <div>
          <span className={labelClass}>Top language schools</span>
          <ChipListEditor items={form.topSchools} onChange={(n) => setListField('topSchools', n)} placeholder="Akamonkai" addLabel="+ আরেকটা স্কুল" />
        </div>

        <div>
          <span className={labelClass}>শীর্ষ সুবিধা (Highlights)</span>
          <BilingualListEditor items={form.highlights} onChange={(n) => setListField('highlights', n)}
            placeholderBn="পার্ট-টাইম জব সবচেয়ে বেশি" placeholderEn="Largest part-time job pool" addLabel="+ আরেকটা highlight" />
        </div>

        <div>
          <span className={labelClass}>Trade-offs (যা মাথায় রাখতে হবে)</span>
          <BilingualListEditor items={form.tradeOffs} onChange={(n) => setListField('tradeOffs', n)}
            placeholderBn="সবচেয়ে বেশি ভাড়া" placeholderEn="Highest rent" addLabel="+ আরেকটা trade-off" />
        </div>

        <div className="flex flex-wrap items-end gap-4 pt-2">
          <label><span className={labelClass}>Sort order</span><input type="number" name="sortOrder" value={form.sortOrder} onChange={onChange} className={inputClass + ' w-28'} /></label>
          <label className="flex items-center gap-2"><input type="checkbox" name="published" checked={form.published} onChange={onChange} /><span className="text-xs font-semibold text-brand-navy">Published</span></label>
        </div>

        <div className="flex gap-2 pt-2">
          <button type="submit" disabled={busy} className="rounded bg-brand-teal px-5 py-2 text-sm font-semibold text-white hover:bg-brand-navy disabled:opacity-50">
            {busy ? 'Saving…' : editingId ? 'Update city' : 'Add city'}
          </button>
          {editingId && <button type="button" onClick={reset} className="rounded border border-brand-navy bg-white px-5 py-2 text-sm font-semibold text-brand-navy">Cancel</button>}
        </div>
      </form>

      {loading ? <p className="text-sm text-brand-slate">Loading…</p> : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {cities.map((c) => (
            <li key={c.id} className="overflow-hidden rounded-xl border border-brand-tealLight/40 bg-white shadow-sm">
              {c.heroImage && <div className="aspect-[16/9] w-full overflow-hidden bg-brand-tealLight/30"><img src={c.heroImage} alt={c.name} className="h-full w-full object-cover" /></div>}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-bold text-brand-navy">
                      {c.kanji && <span className="mr-2 text-brand-teal-700">{c.kanji}</span>}
                      {c.name}
                      {c.nameEn && <span className="ml-2 text-xs font-normal text-brand-slate/80">/ {c.nameEn}</span>}
                    </h3>
                    {!c.published && <span className="mt-1 inline-block rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-700">Draft</span>}
                  </div>
                  <div className="flex flex-shrink-0 gap-2 text-xs font-semibold">
                    <button onClick={() => edit(c)} className="text-brand-teal hover:text-brand-navy">Edit</button>
                    <button onClick={() => remove(c.id)} className="text-red-500 hover:text-red-700">Delete</button>
                  </div>
                </div>
                {c.tagline && <p className="mt-2 line-clamp-3 text-sm text-brand-slate">{c.tagline}</p>}
                <p className="mt-2 text-xs text-brand-slate/80">খরচ: {c.monthlyLiving || '—'} · ভাড়া: {c.monthlyRent || '—'}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ChipListEditor({ items, onChange, placeholder, addLabel }) {
  return (
    <div className="space-y-2">
      {items.length === 0 && <p className="text-xs italic text-brand-slate/70">এখনো কিছু যোগ করা হয়নি।</p>}
      {items.map((p, i) => (
        <div key={i} className="flex gap-2">
          <input value={p} onChange={(e) => { const n = [...items]; n[i] = e.target.value; onChange(n); }} className={inputClass + ' flex-1'} placeholder={placeholder} />
          <button type="button" onClick={() => onChange(items.filter((_, idx) => idx !== i))} className="rounded bg-red-100 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-200">Remove</button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...items, ''])} className="text-xs font-semibold text-brand-teal hover:text-brand-navy">{addLabel}</button>
    </div>
  );
}

function BilingualListEditor({ items, onChange, placeholderBn, placeholderEn, addLabel }) {
  return (
    <div className="space-y-2">
      {items.length === 0 && <p className="text-xs italic text-brand-slate/70">এখনো কিছু যোগ করা হয়নি।</p>}
      {items.map((row, i) => (
        <div key={i} className="grid grid-cols-1 gap-2 rounded-md border border-brand-tealLight/40 bg-brand-tealLight/5 p-2 md:grid-cols-[1fr,1fr,auto]">
          <input value={row?.bn || ''} onChange={(e) => { const n = [...items]; n[i] = { ...(n[i] || {}), bn: e.target.value }; onChange(n); }} className={inputClass} placeholder={placeholderBn} dir="auto" />
          <input value={row?.en || ''} onChange={(e) => { const n = [...items]; n[i] = { ...(n[i] || {}), en: e.target.value }; onChange(n); }} className={inputClass} placeholder={placeholderEn} />
          <button type="button" onClick={() => onChange(items.filter((_, idx) => idx !== i))} className="rounded bg-red-100 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-200 md:self-stretch">Remove</button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...items, { bn: '', en: '' }])} className="text-xs font-semibold text-brand-teal hover:text-brand-navy">{addLabel}</button>
    </div>
  );
}
