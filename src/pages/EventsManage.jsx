/**
 * EN: Events admin — CRUD over the Event table that drives /events on the
 *     public site. Each row = one event occurrence (seminar, workshop,
 *     alumni meetup, festival). Trilingual headline fields, free-form
 *     numeric date/time, RSVP URL, free-or-paid toggle, highlight pin.
 * BN: Events admin — /events public পেজের Event table-এর CRUD। প্রতিটা
 *     row = একটা event occurrence (seminar, workshop, alumni meetup,
 *     festival)। Trilingual headline, free-form date/time, RSVP URL,
 *     free-or-paid toggle, highlight pin।
 */

import { useEffect, useState } from 'react';
import axiosInterceptor from '../axios/axiosInterceptor';
import BilingualField from '../components/BilingualField';
import ImageUploadField from '../components/ImageUploadField';
import { confirmDialog } from '../components/ConfirmDialog';

const inputClass =
  'w-full rounded-md border border-brand-tealLight/60 bg-white px-3 py-2.5 text-sm text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-teal/40 focus:border-brand-teal';
const labelClass = 'mb-1 block text-xs font-bold uppercase tracking-wider text-brand-navy';

const EVENT_TYPES = [
  { value: 'seminar', label: 'সেমিনার' },
  { value: 'workshop', label: 'ওয়ার্কশপ' },
  { value: 'meetup', label: 'মিটআপ' },
  { value: 'festival', label: 'উৎসব' },
  { value: 'webinar', label: 'ওয়েবিনার' },
];

const empty = {
  type: 'seminar',
  title: '', titleEn: '', titleJa: '',
  description: '', descriptionEn: '', descriptionJa: '',
  eventDate: '',
  time: '',
  durationMin: 60,
  location: '', locationEn: '', locationJa: '',
  city: '',
  rsvpUrl: '',
  heroImage: '',
  isFree: false,
  fee: '',
  highlight: false,
  sortOrder: 0,
  published: true,
};

export default function EventsManage() {
  const api = axiosInterceptor();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/events?all=true&raw=true');
      setEvents(data.events || []);
    } catch (err) { console.error('Events list error:', err); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({
      ...p,
      [name]: type === 'checkbox' ? checked : (name === 'sortOrder' || name === 'durationMin') ? Number(value) : value,
    }));
  };
  const reset = () => { setForm(empty); setEditingId(null); };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (editingId) await api.put(`/events/${editingId}`, form);
      else await api.post('/events', form);
      reset();
      await load();
    } catch (err) { alert(err.response?.data?.error || 'Save failed'); }
    finally { setBusy(false); }
  };

  const edit = (ev) => {
    setEditingId(ev.id);
    setForm({ ...empty, ...ev });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const remove = async (id) => {
    const ok = await confirmDialog({
      title: 'এই event delete?', message: '/events পেজ থেকে সরে যাবে।',
      confirmText: 'হ্যাঁ, delete', cancelText: 'বাতিল', danger: true,
    });
    if (!ok) return;
    try { await api.delete(`/events/${id}`); await load(); } catch (err) { alert('Delete failed'); }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-extrabold text-brand-navy">ইভেন্ট</h1>
        <p className="mt-1 text-sm text-brand-slate">
          /events পেজে যে seminar, workshop, alumni meetup, উৎসব দেখানো হয়। নতুন event যোগ করলে ৬০ সেকেন্ডে public site-এ দেখা যাবে।
        </p>
      </div>

      <form onSubmit={submit} className="space-y-5 rounded-xl border border-brand-tealLight/40 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-bold uppercase tracking-wide text-brand-navy">{editingId ? 'Event Edit' : 'নতুন Event যোগ'}</h2>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <label>
            <span className={labelClass}>Type</span>
            <select name="type" value={form.type} onChange={onChange} className={inputClass}>
              {EVENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </label>
          <label><span className={labelClass}>তারিখ</span><input type="date" name="eventDate" value={form.eventDate} onChange={onChange} className={inputClass} required /></label>
          <label><span className={labelClass}>সময় (24-hr)</span><input type="time" name="time" value={form.time} onChange={onChange} className={inputClass} /></label>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <label><span className={labelClass}>Title (BN)</span><input name="title" value={form.title} onChange={onChange} className={inputClass} required placeholder="ফ্রি জাপান সেমিনার" /></label>
          <label><span className={labelClass}>Title (EN)</span><input name="titleEn" value={form.titleEn} onChange={onChange} className={inputClass} placeholder="Free Japan Seminar" /></label>
          <label><span className={labelClass}>タイトル (JA)</span><input name="titleJa" value={form.titleJa} onChange={onChange} className={inputClass} /></label>
        </div>

        <BilingualField label="Description" name="description" type="textarea" rows={3}
          value={form.description} valueEn={form.descriptionEn} onChange={onChange} />
        <label className="block">
          <span className={labelClass}>説明 (Japanese)</span>
          <textarea name="descriptionJa" value={form.descriptionJa} onChange={onChange} rows={3} className={inputClass + ' min-h-[88px]'} />
        </label>

        <ImageUploadField label="Cover image" value={form.heroImage} onChange={(url) => setForm((p) => ({ ...p, heroImage: url }))} />

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <label><span className={labelClass}>Location (BN)</span><input name="location" value={form.location} onChange={onChange} className={inputClass} placeholder="Inochi ঢাকা অফিস" /></label>
          <label><span className={labelClass}>Location (EN)</span><input name="locationEn" value={form.locationEn} onChange={onChange} className={inputClass} placeholder="Inochi Dhaka office" /></label>
          <label><span className={labelClass}>場所 (JA)</span><input name="locationJa" value={form.locationJa} onChange={onChange} className={inputClass} /></label>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <label><span className={labelClass}>City slug (filter)</span><input name="city" value={form.city} onChange={onChange} className={inputClass} placeholder="dhaka" /></label>
          <label><span className={labelClass}>সময়কাল (মিনিট)</span><input type="number" name="durationMin" value={form.durationMin} onChange={onChange} className={inputClass} /></label>
          <label className="md:col-span-2"><span className={labelClass}>RSVP URL</span><input name="rsvpUrl" value={form.rsvpUrl} onChange={onChange} className={inputClass} placeholder="/contact বা https://..." /></label>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <label className="flex items-end gap-2 pb-2"><input type="checkbox" name="isFree" checked={form.isFree} onChange={onChange} /><span className="text-xs font-semibold text-brand-navy">ফ্রি event</span></label>
          <label><span className={labelClass}>ফি (যদি ফ্রি না হয়)</span><input name="fee" value={form.fee} onChange={onChange} className={inputClass} placeholder="৳500" disabled={form.isFree} /></label>
          <label className="flex items-end gap-2 pb-2"><input type="checkbox" name="highlight" checked={form.highlight} onChange={onChange} /><span className="text-xs font-semibold text-brand-navy">⭐ উপরে pin করুন</span></label>
        </div>

        <div className="flex flex-wrap items-end gap-4 pt-2">
          <label><span className={labelClass}>Sort order</span><input type="number" name="sortOrder" value={form.sortOrder} onChange={onChange} className={inputClass + ' w-28'} /></label>
          <label className="flex items-center gap-2"><input type="checkbox" name="published" checked={form.published} onChange={onChange} /><span className="text-xs font-semibold text-brand-navy">Published</span></label>
        </div>

        <div className="flex gap-2 pt-2">
          <button type="submit" disabled={busy} className="rounded bg-brand-teal px-5 py-2 text-sm font-semibold text-white hover:bg-brand-navy disabled:opacity-50">
            {busy ? 'Saving…' : editingId ? 'Update event' : 'Add event'}
          </button>
          {editingId && <button type="button" onClick={reset} className="rounded border border-brand-navy bg-white px-5 py-2 text-sm font-semibold text-brand-navy">Cancel</button>}
        </div>
      </form>

      {loading ? <p className="text-sm text-brand-slate">Loading…</p> : (
        <ul className="space-y-3">
          {events.map((e) => (
            <li key={e.id} className="flex items-start justify-between gap-4 rounded-xl border border-brand-tealLight/40 bg-white p-4 shadow-sm">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-brand-teal/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-teal">{e.type}</span>
                  {e.highlight && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700">⭐ Pinned</span>}
                  {e.isFree && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">FREE</span>}
                  {!e.published && <span className="rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-700">Draft</span>}
                </div>
                <h3 className="mt-1 text-base font-bold text-brand-navy">{e.title}</h3>
                {e.titleEn && <p className="text-xs text-brand-slate/80">{e.titleEn}</p>}
                <p className="mt-1 text-xs text-brand-slate">{e.eventDate} {e.time && `· ${e.time}`} · {e.location || '—'}</p>
              </div>
              <div className="flex flex-shrink-0 gap-2 text-xs font-semibold">
                <button onClick={() => edit(e)} className="text-brand-teal hover:text-brand-navy">Edit</button>
                <button onClick={() => remove(e.id)} className="text-red-500 hover:text-red-700">Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
