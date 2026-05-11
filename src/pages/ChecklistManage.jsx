/**
 * EN: Document Checklist admin — flat row CRUD over ChecklistItem. The
 *     public site groups items by `categoryKey` automatically. Admin
 *     edits one item at a time and assigns its category via a dropdown
 *     populated from existing categories (or types in a new key).
 * BN: Document Checklist admin — ChecklistItem-এর flat row CRUD। Public
 *     site item-গুলো `categoryKey` দিয়ে auto group করে। Admin একসাথে
 *     এক item edit করে; existing category থেকে dropdown-এ category
 *     বেছে নেয় (অথবা নতুন key টাইপ করে)।
 */

import { useEffect, useMemo, useState } from 'react';
import axiosInterceptor from '../axios/axiosInterceptor';
import BilingualField from '../components/BilingualField';
import { confirmDialog } from '../components/ConfirmDialog';

const inputClass =
  'w-full rounded-md border border-brand-tealLight/60 bg-white px-3 py-2.5 text-sm text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-teal/40 focus:border-brand-teal';
const labelClass = 'mb-1 block text-xs font-bold uppercase tracking-wider text-brand-navy';

const empty = {
  categoryKey: 'personal',
  categoryLabel: '', categoryLabelEn: '', categoryLabelJa: '',
  label: '', labelEn: '', labelJa: '',
  note: '', noteEn: '',
  groupOrder: 0, sortOrder: 0,
  published: true,
};

export default function ChecklistManage() {
  const api = axiosInterceptor();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [busy, setBusy] = useState(false);

  // EN: Existing distinct category keys — used to populate the dropdown
  //     and to auto-fill labels when admin picks an existing category.
  // BN: existing distinct category key — dropdown populate করতে এবং
  //     existing category বাছাই-এ label auto-fill করতে।
  const categoryMeta = useMemo(() => {
    const map = new Map();
    for (const it of items) {
      if (!map.has(it.categoryKey)) {
        map.set(it.categoryKey, {
          key: it.categoryKey,
          label: it.categoryLabel || '',
          labelEn: it.categoryLabelEn || '',
          labelJa: it.categoryLabelJa || '',
          groupOrder: it.groupOrder || 0,
        });
      }
    }
    return Array.from(map.values()).sort((a, b) => a.groupOrder - b.groupOrder);
  }, [items]);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/checklist?all=true&raw=true');
      setItems(data.items || []);
    } catch (err) { console.error('Checklist list error:', err); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({
      ...p,
      [name]: type === 'checkbox' ? checked : (name === 'sortOrder' || name === 'groupOrder') ? Number(value) : value,
    }));
  };

  // EN: When admin picks an existing category from dropdown, auto-fill its labels.
  // BN: Admin existing category বাছলে তার label auto-fill হয়ে যায়।
  const onPickCategory = (e) => {
    const key = e.target.value;
    const meta = categoryMeta.find((m) => m.key === key);
    setForm((p) => ({
      ...p,
      categoryKey: key,
      ...(meta ? {
        categoryLabel: meta.label,
        categoryLabelEn: meta.labelEn,
        categoryLabelJa: meta.labelJa,
        groupOrder: meta.groupOrder,
      } : {}),
    }));
  };

  const reset = () => { setForm(empty); setEditingId(null); };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (editingId) await api.put(`/checklist/${editingId}`, form);
      else await api.post('/checklist', form);
      reset();
      await load();
    } catch (err) { alert(err.response?.data?.error || 'Save failed'); }
    finally { setBusy(false); }
  };

  const edit = (it) => { setEditingId(it.id); setForm({ ...empty, ...it }); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  const remove = async (id) => {
    const ok = await confirmDialog({
      title: 'এই item delete?', message: '/document-checklist থেকে সরে যাবে।',
      confirmText: 'হ্যাঁ', cancelText: 'বাতিল', danger: true,
    });
    if (!ok) return;
    try { await api.delete(`/checklist/${id}`); await load(); } catch (err) { alert('Delete failed'); }
  };

  // EN: Group items for display — same logic the public renderer uses.
  // BN: Display-এর জন্য item group — public renderer-এর মত logic।
  const grouped = useMemo(() => {
    const map = new Map();
    for (const it of items) {
      if (!map.has(it.categoryKey)) {
        map.set(it.categoryKey, { key: it.categoryKey, label: it.categoryLabel, labelEn: it.categoryLabelEn, items: [] });
      }
      map.get(it.categoryKey).items.push(it);
    }
    return Array.from(map.values());
  }, [items]);

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-extrabold text-brand-navy">ডকুমেন্ট চেকলিস্ট</h1>
        <p className="mt-1 text-sm text-brand-slate">
          /document-checklist পেজে যে চেকলিস্ট দেখা যায়। প্রতিটা item এক row। একই category-র item একসাথে group হয়ে public-এ দেখাবে।
        </p>
      </div>

      <form onSubmit={submit} className="space-y-5 rounded-xl border border-brand-tealLight/40 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-bold uppercase tracking-wide text-brand-navy">{editingId ? 'Item Edit' : 'নতুন Item'}</h2>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <label>
            <span className={labelClass}>Category (existing)</span>
            <select value={form.categoryKey} onChange={onPickCategory} className={inputClass}>
              {categoryMeta.map((m) => <option key={m.key} value={m.key}>{m.key} ({m.label || m.labelEn})</option>)}
              {!categoryMeta.find((m) => m.key === form.categoryKey) && <option value={form.categoryKey}>{form.categoryKey} (new)</option>}
            </select>
          </label>
          <label className="md:col-span-2">
            <span className={labelClass}>অথবা নতুন category key</span>
            <input name="categoryKey" value={form.categoryKey} onChange={onChange} className={inputClass} placeholder="personal / academic / financial …" />
          </label>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <label><span className={labelClass}>Category label (BN)</span><input name="categoryLabel" value={form.categoryLabel} onChange={onChange} className={inputClass} placeholder="ব্যক্তিগত ডকুমেন্ট" /></label>
          <label><span className={labelClass}>Category label (EN)</span><input name="categoryLabelEn" value={form.categoryLabelEn} onChange={onChange} className={inputClass} placeholder="Personal documents" /></label>
          <label><span className={labelClass}>カテゴリー (JA)</span><input name="categoryLabelJa" value={form.categoryLabelJa} onChange={onChange} className={inputClass} /></label>
        </div>

        <BilingualField label="Item label" name="label" type="textarea" rows={2}
          value={form.label} valueEn={form.labelEn} onChange={onChange}
          placeholderBn="পাসপোর্ট (ন্যূনতম ১৮ মাস validity)" placeholderEn="Passport (min. 18 months validity)" />
        <label className="block">
          <span className={labelClass}>項目 (Japanese)</span>
          <textarea name="labelJa" value={form.labelJa} onChange={onChange} rows={2} className={inputClass + ' min-h-[72px]'} />
        </label>

        <BilingualField label="Note (optional)" name="note" type="textarea" rows={2}
          value={form.note} valueEn={form.noteEn} onChange={onChange}
          hint="যেমন: 'জারির ৬ মাসের মধ্যে notarise'।" />

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <label><span className={labelClass}>Group order</span><input type="number" name="groupOrder" value={form.groupOrder} onChange={onChange} className={inputClass} /></label>
          <label><span className={labelClass}>Item order</span><input type="number" name="sortOrder" value={form.sortOrder} onChange={onChange} className={inputClass} /></label>
          <label className="flex items-end gap-2 pb-2 md:col-span-2"><input type="checkbox" name="published" checked={form.published} onChange={onChange} /><span className="text-xs font-semibold text-brand-navy">Published</span></label>
        </div>

        <div className="flex gap-2 pt-2">
          <button type="submit" disabled={busy} className="rounded bg-brand-teal px-5 py-2 text-sm font-semibold text-white hover:bg-brand-navy disabled:opacity-50">
            {busy ? 'Saving…' : editingId ? 'Update item' : 'Add item'}
          </button>
          {editingId && <button type="button" onClick={reset} className="rounded border border-brand-navy bg-white px-5 py-2 text-sm font-semibold text-brand-navy">Cancel</button>}
        </div>
      </form>

      {loading ? <p className="text-sm text-brand-slate">Loading…</p> : (
        <div className="space-y-6">
          {grouped.map((g) => (
            <div key={g.key}>
              <h3 className="text-sm font-bold uppercase tracking-wider text-brand-navy">{g.label || g.labelEn || g.key}</h3>
              <ul className="mt-2 space-y-2">
                {g.items.map((it) => (
                  <li key={it.id} className="flex items-start justify-between gap-3 rounded-lg border border-brand-tealLight/40 bg-white p-3 shadow-sm">
                    <div className="flex-1 text-sm">
                      <p className="text-brand-navy">{it.label}</p>
                      {it.labelEn && <p className="text-xs text-brand-slate/80">{it.labelEn}</p>}
                      {!it.published && <span className="mt-1 inline-block rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-700">Draft</span>}
                    </div>
                    <div className="flex flex-shrink-0 gap-2 text-xs font-semibold">
                      <button onClick={() => edit(it)} className="text-brand-teal hover:text-brand-navy">Edit</button>
                      <button onClick={() => remove(it.id)} className="text-red-500 hover:text-red-700">Delete</button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
