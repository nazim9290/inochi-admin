/**
 * EN: Brands / Partner Schools admin page — full CRUD against backend Brand
 *     model. Logo upload (via shared ImageUploadField), bilingual name fields,
 *     city / website / partnerSince meta, featured flag (controls home strip),
 *     sort order, published toggle. Bilingual help text targets non-IT admins.
 * BN: Brand / Partner School admin page — backend Brand model-এর সাথে full
 *     CRUD। Logo upload (shared ImageUploadField দিয়ে), দুই ভাষার name field,
 *     city / website / partnerSince meta, featured flag (home strip-এ
 *     দেখাবে কিনা control করে), sort order, published toggle।
 */

import { useEffect, useState } from 'react';
import axiosInterceptor from '../axios/axiosInterceptor';
import ImageUploadField from '../components/ImageUploadField';

const inputClass =
  'w-full px-3 py-2 text-sm border border-brand-tealLight/60 rounded focus:outline-none focus:ring-2 focus:ring-brand-teal/40';
const labelClass = 'block text-xs font-semibold text-brand-navy mb-1';

// EN: Default form shape — single source of truth for the editor reset.
// BN: Form-এর default shape — editor reset-এর জন্য একটামাত্র source।
const empty = {
  name: '',
  nameJa: '',
  city: '',
  websiteUrl: '',
  partnerSince: '',
  image: null,
  featured: true,
  sortOrder: 0,
  published: true,
};

export default function CreateBrand() {
  const api = axiosInterceptor();
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/all-brand?all=true');
      setBrands(Array.isArray(data?.brand) ? data.brand : []);
    } catch (err) {
      console.error('Brand list error:', err);
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
          : ['sortOrder', 'partnerSince'].includes(name)
            ? value === '' ? '' : Number(value)
            : value,
    }));
  };

  // EN: Logo URL bubbles up from ImageUploadField; we wrap in {url} JSON to
  //     match the backend's existing JSONB image shape.
  // BN: Logo URL ImageUploadField থেকে আসে; backend-এর existing JSONB image
  //     shape-এর সাথে match করতে {url} JSON-এ wrap করি।
  const setLogo = (url) =>
    setForm((prev) => ({ ...prev, image: url ? { url } : null }));

  const reset = () => {
    setForm(empty);
    setEditingId(null);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name?.trim()) {
      alert('Brand name দিন।');
      return;
    }
    setBusy(true);
    try {
      const payload = {
        ...form,
        partnerSince: form.partnerSince === '' ? null : Number(form.partnerSince),
      };
      if (editingId) await api.put(`/brand/${editingId}`, payload);
      else await api.post('/brand', payload);
      reset();
      await load();
    } catch (err) {
      alert(err.response?.data?.error || 'Save failed');
    } finally {
      setBusy(false);
    }
  };

  const edit = (b) => {
    setEditingId(b.id);
    setForm({
      ...empty,
      ...b,
      partnerSince: b.partnerSince ?? '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const remove = async (id) => {
    if (!confirm('এই brand delete করতে চান?')) return;
    try {
      await api.delete(`/brand/${id}`);
      await load();
    } catch (err) {
      alert('Delete failed');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <PageHeader />

      <BrandForm
        form={form}
        editingId={editingId}
        busy={busy}
        onChange={onChange}
        setLogo={setLogo}
        onSubmit={submit}
        onReset={reset}
      />

      <BrandList
        loading={loading}
        brands={brands}
        onEdit={edit}
        onDelete={remove}
      />
    </div>
  );
}

// EN: Page title + Bangla subtitle explaining what brands are for.
// BN: Page title + Bangla subtitle — admin বুঝবে brand কী জন্য।
function PageHeader() {
  return (
    <div>
      <h1 className="text-2xl font-extrabold text-brand-navy">পার্টনার স্কুল / Brand</h1>
      <p className="mt-1 text-sm text-brand-slate">
        জাপানের যেসব school / university-র সাথে Inochi-র partnership আছে — তাদের logo
        এখানে যোগ করুন। Featured marked করলে home page-এর strip-এ দেখাবে; Featured
        না হলেও <span className="font-semibold">/partner-schools</span> page-এ দেখাবে।
      </p>
    </div>
  );
}

// EN: Add / edit form — single column on mobile, two columns on tablet+.
// BN: Add / edit form — mobile-এ একটা column, tablet+-এ দুটো।
function BrandForm({ form, editingId, busy, onChange, setLogo, onSubmit, onReset }) {
  return (
    <form onSubmit={onSubmit} className="bg-white rounded-xl border border-brand-tealLight/40 shadow-sm p-5">
      <h2 className="text-sm font-bold text-brand-navy uppercase tracking-wide mb-4">
        {editingId ? 'Edit Brand' : 'Add Brand'}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="md:col-span-2">
          <ImageUploadField
            label="স্কুল / Brand-এর logo"
            value={form.image?.url || ''}
            onChange={setLogo}
            hint="Square / horizontal logo (PNG transparent ভাল)। Public site-এ একই size-এ resize হবে।"
          />
        </div>

        <label>
          <span className={labelClass}>School / Brand name (English) *</span>
          <input
            name="name"
            value={form.name}
            onChange={onChange}
            className={inputClass}
            required
            placeholder="Tokyo International School"
          />
        </label>
        <label>
          <span className={labelClass}>Japanese name (optional)</span>
          <input
            name="nameJa"
            value={form.nameJa}
            onChange={onChange}
            className={inputClass}
            placeholder="東京国際学校"
          />
        </label>
        <label>
          <span className={labelClass}>City</span>
          <input
            name="city"
            value={form.city}
            onChange={onChange}
            className={inputClass}
            placeholder="Tokyo"
          />
        </label>
        <label>
          <span className={labelClass}>Website URL</span>
          <input
            name="websiteUrl"
            value={form.websiteUrl}
            onChange={onChange}
            className={inputClass}
            placeholder="https://example.ac.jp"
          />
        </label>
        <label>
          <span className={labelClass}>Partner since (year)</span>
          <input
            type="number"
            name="partnerSince"
            value={form.partnerSince}
            onChange={onChange}
            className={inputClass}
            placeholder="2018"
          />
        </label>
        <label>
          <span className={labelClass}>Sort order</span>
          <input
            type="number"
            name="sortOrder"
            value={form.sortOrder}
            onChange={onChange}
            className={inputClass}
          />
        </label>

        <div className="md:col-span-2 flex flex-wrap items-center gap-4 pt-1">
          <label className="flex items-center gap-2">
            <input type="checkbox" name="featured" checked={form.featured} onChange={onChange} />
            <span className="text-xs text-brand-navy font-semibold">⭐ Featured (home strip-এ দেখাবে)</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="published" checked={form.published} onChange={onChange} />
            <span className="text-xs text-brand-navy font-semibold">Published</span>
          </label>
        </div>
      </div>

      <div className="flex gap-2 mt-5">
        <button
          type="submit"
          disabled={busy}
          className="bg-brand-teal hover:bg-brand-navy disabled:opacity-50 text-white font-semibold px-5 py-2 rounded text-sm"
        >
          {busy ? 'Saving…' : editingId ? 'Update brand' : 'Add brand'}
        </button>
        {editingId && (
          <button
            type="button"
            onClick={onReset}
            className="bg-white border border-brand-navy text-brand-navy font-semibold px-5 py-2 rounded text-sm"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

// EN: Brand grid — logo + name + meta + edit/delete actions.
// BN: Brand grid — logo + name + meta + edit/delete action।
function BrandList({ loading, brands, onEdit, onDelete }) {
  if (loading) return <p className="text-sm text-brand-slate">Loading…</p>;
  if (brands.length === 0) {
    return (
      <div className="rounded-xl border border-brand-tealLight/40 bg-white p-10 text-center">
        <p className="text-sm text-brand-slate">এখনো কোনো brand add করা হয়নি।</p>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      <h2 className="text-sm font-bold text-brand-navy uppercase tracking-wide">
        Existing brands ({brands.length})
      </h2>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {brands.map((b) => (
          <BrandCard key={b.id} brand={b} onEdit={onEdit} onDelete={onDelete} />
        ))}
      </ul>
    </div>
  );
}

function BrandCard({ brand, onEdit, onDelete }) {
  const url = brand.image?.url || brand.image?.secure_url || '';
  return (
    <li className="rounded-xl border border-brand-tealLight/40 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        {url ? (
          // eslint-disable-next-line jsx-a11y/alt-text
          <img src={url} alt={brand.name} className="h-14 w-14 rounded object-contain bg-brand-tealLight/10 p-1" />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded bg-brand-tealLight/20 text-xl font-bold text-brand-navy">
            {(brand.name || '?')[0]?.toUpperCase()}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-brand-navy truncate">{brand.name || 'Untitled'}</p>
          {brand.nameJa && <p className="text-xs text-brand-slate truncate">{brand.nameJa}</p>}
          <div className="mt-0.5 flex flex-wrap gap-1">
            {brand.featured && (
              <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-800">
                ⭐ Featured
              </span>
            )}
            {!brand.published && (
              <span className="rounded-full bg-gray-200 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-gray-700">
                Draft
              </span>
            )}
          </div>
        </div>
      </div>

      {(brand.city || brand.partnerSince || brand.websiteUrl) && (
        <div className="mt-3 space-y-0.5 text-xs text-brand-slate">
          {brand.city && <p>📍 {brand.city}</p>}
          {brand.partnerSince && <p>🤝 Partner since {brand.partnerSince}</p>}
          {brand.websiteUrl && (
            <a
              href={brand.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-teal hover:text-brand-navy break-all"
            >
              🌐 {brand.websiteUrl.replace(/^https?:\/\//, '')}
            </a>
          )}
        </div>
      )}

      <div className="mt-3 flex gap-2 border-t border-brand-tealLight/30 pt-2">
        <button
          type="button"
          onClick={() => onEdit(brand)}
          className="flex-1 rounded bg-brand-navy/10 px-2 py-1 text-xs font-semibold text-brand-navy hover:bg-brand-navy hover:text-white"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => onDelete(brand.id)}
          className="flex-1 rounded bg-red-50 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-100"
        >
          Delete
        </button>
      </div>
    </li>
  );
}
