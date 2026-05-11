/**
 * EN: Anti-scam admin — CRUD over ScamItem rows that drive /anti-scam.
 *     Two kinds: "redflag" (title + body warning) and "check" (title-only
 *     verification question). The kind dropdown decides which fields the
 *     form shows; controller emits the legacy { redFlags, checks } shape.
 * BN: Anti-scam admin — /anti-scam-এর ScamItem row-এর CRUD। দুই ধরনের:
 *     "redflag" (title + body সতর্কতা) এবং "check" (শুধু title verification
 *     প্রশ্ন)। Kind dropdown form-এর কোন field দেখাবে ঠিক করে; controller
 *     legacy { redFlags, checks } shape emit করে।
 */

import { useEffect, useState } from 'react';
import axiosInterceptor from '../axios/axiosInterceptor';
import BilingualField from '../components/BilingualField';
import { confirmDialog } from '../components/ConfirmDialog';

const inputClass =
  'w-full rounded-md border border-brand-tealLight/60 bg-white px-3 py-2.5 text-sm text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-teal/40 focus:border-brand-teal';
const labelClass = 'mb-1 block text-xs font-bold uppercase tracking-wider text-brand-navy';

const empty = {
  kind: 'redflag',
  itemKey: '',
  title: '', titleEn: '', titleJa: '',
  body: '', bodyEn: '', bodyJa: '',
  sortOrder: 0,
  published: true,
};

export default function ScamItemsManage() {
  const api = axiosInterceptor();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/scam-items?all=true&raw=true');
      setItems(data.items || []);
    } catch (err) { console.error('Scam items list error:', err); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({
      ...p,
      [name]: type === 'checkbox' ? checked : name === 'sortOrder' ? Number(value) : value,
    }));
  };
  const reset = () => { setForm(empty); setEditingId(null); };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      // EN: Strip body fields when this is a "check" — keeps DB clean.
      // BN: "check" হলে body field খালি — DB clean রাখে।
      const payload = form.kind === 'check'
        ? { ...form, body: '', bodyEn: '', bodyJa: '' }
        : form;
      if (editingId) await api.put(`/scam-items/${editingId}`, payload);
      else await api.post('/scam-items', payload);
      reset();
      await load();
    } catch (err) { alert(err.response?.data?.error || 'Save failed'); }
    finally { setBusy(false); }
  };

  const edit = (it) => { setEditingId(it.id); setForm({ ...empty, ...it }); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  const remove = async (id) => {
    const ok = await confirmDialog({
      title: 'এই item delete?', message: '/anti-scam থেকে সরে যাবে।',
      confirmText: 'হ্যাঁ', cancelText: 'বাতিল', danger: true,
    });
    if (!ok) return;
    try { await api.delete(`/scam-items/${id}`); await load(); } catch (err) { alert('Delete failed'); }
  };

  const redFlags = items.filter((i) => i.kind !== 'check');
  const checks = items.filter((i) => i.kind === 'check');

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-extrabold text-brand-navy">Anti-Scam সতর্কতা</h1>
        <p className="mt-1 text-sm text-brand-slate">
          /anti-scam পেজে যে red-flag সতর্কতা ও যাচাই-চেকলিস্ট দেখা যায়। নতুন scam pattern পেলে এখান থেকে যোগ করুন — দেব ছাড়াই ৬০ সেকেন্ডে live।
        </p>
      </div>

      <form onSubmit={submit} className="space-y-5 rounded-xl border border-brand-tealLight/40 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-bold uppercase tracking-wide text-brand-navy">{editingId ? 'Item Edit' : 'নতুন Item'}</h2>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <label>
            <span className={labelClass}>Kind</span>
            <select name="kind" value={form.kind} onChange={onChange} className={inputClass}>
              <option value="redflag">🚩 Red flag (title + ব্যাখ্যা)</option>
              <option value="check">✅ Check question (শুধু প্রশ্ন)</option>
            </select>
          </label>
          <label className="md:col-span-2">
            <span className={labelClass}>Item key (optional, deep-link-এর জন্য)</span>
            <input name="itemKey" value={form.itemKey} onChange={onChange} className={inputClass} placeholder="cash-only" />
          </label>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <label><span className={labelClass}>Title (BN)</span><input name="title" value={form.title} onChange={onChange} className={inputClass} required /></label>
          <label><span className={labelClass}>Title (EN)</span><input name="titleEn" value={form.titleEn} onChange={onChange} className={inputClass} /></label>
          <label><span className={labelClass}>タイトル (JA)</span><input name="titleJa" value={form.titleJa} onChange={onChange} className={inputClass} /></label>
        </div>

        {form.kind === 'redflag' && (
          <>
            <BilingualField label="Body (ব্যাখ্যা)" name="body" type="textarea" rows={3}
              value={form.body} valueEn={form.bodyEn} onChange={onChange}
              hint="কেন এটা red flag — ২-৩ বাক্যে।" />
            <label className="block">
              <span className={labelClass}>本文 (Japanese)</span>
              <textarea name="bodyJa" value={form.bodyJa} onChange={onChange} rows={3} className={inputClass + ' min-h-[88px]'} />
            </label>
          </>
        )}

        <div className="flex flex-wrap items-end gap-4 pt-2">
          <label><span className={labelClass}>Sort order</span><input type="number" name="sortOrder" value={form.sortOrder} onChange={onChange} className={inputClass + ' w-28'} /></label>
          <label className="flex items-center gap-2"><input type="checkbox" name="published" checked={form.published} onChange={onChange} /><span className="text-xs font-semibold text-brand-navy">Published</span></label>
        </div>

        <div className="flex gap-2 pt-2">
          <button type="submit" disabled={busy} className="rounded bg-brand-teal px-5 py-2 text-sm font-semibold text-white hover:bg-brand-navy disabled:opacity-50">
            {busy ? 'Saving…' : editingId ? 'Update' : 'Add item'}
          </button>
          {editingId && <button type="button" onClick={reset} className="rounded border border-brand-navy bg-white px-5 py-2 text-sm font-semibold text-brand-navy">Cancel</button>}
        </div>
      </form>

      {loading ? <p className="text-sm text-brand-slate">Loading…</p> : (
        <div className="space-y-6">
          {redFlags.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-red-700">🚩 Red flags ({redFlags.length})</h3>
              <ul className="space-y-2">
                {redFlags.map((it) => <ItemRow key={it.id} item={it} onEdit={edit} onDelete={remove} />)}
              </ul>
            </div>
          )}
          {checks.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-emerald-700">✅ Check questions ({checks.length})</h3>
              <ul className="space-y-2">
                {checks.map((it) => <ItemRow key={it.id} item={it} onEdit={edit} onDelete={remove} />)}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ItemRow({ item, onEdit, onDelete }) {
  return (
    <li className="flex items-start justify-between gap-3 rounded-lg border border-brand-tealLight/40 bg-white p-3 shadow-sm">
      <div className="flex-1 text-sm">
        <p className="font-semibold text-brand-navy">{item.title}</p>
        {item.titleEn && <p className="text-xs text-brand-slate/80">{item.titleEn}</p>}
        {item.body && <p className="mt-1 line-clamp-2 text-xs text-brand-slate">{item.body}</p>}
        {!item.published && <span className="mt-1 inline-block rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-700">Draft</span>}
      </div>
      <div className="flex flex-shrink-0 gap-2 text-xs font-semibold">
        <button onClick={() => onEdit(item)} className="text-brand-teal hover:text-brand-navy">Edit</button>
        <button onClick={() => onDelete(item.id)} className="text-red-500 hover:text-red-700">Delete</button>
      </div>
    </li>
  );
}
