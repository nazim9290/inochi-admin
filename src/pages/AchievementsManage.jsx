/**
 * EN: Admin page for managing achievements — visa wins, Japan reception,
 *     events, classroom moments. Supports multiple photos per entry, optional
 *     video URL, type filter, featured flag for the public Home strip.
 * BN: অর্জন managing-এর জন্য admin page — ভিসা প্রাপ্তি, জাপান অভ্যর্থনা,
 *     event, ক্লাসরুম মুহূর্ত। প্রতিটার একাধিক ছবি, optional video URL,
 *     type filter, public Home strip-এর জন্য featured flag আছে।
 */
import { useEffect, useMemo, useState } from 'react';
import axiosInterceptor from '../axios/axiosInterceptor';
import BilingualField from '../components/BilingualField';
import ImageUploadField from '../components/ImageUploadField';
import { confirmDialog } from '../components/ConfirmDialog';

const inputClass =
  'w-full px-3 py-2 text-sm border border-brand-tealLight/60 rounded focus:outline-none focus:ring-2 focus:ring-brand-teal/40';
const labelClass = 'block text-xs font-semibold text-brand-navy mb-1';

const TYPE_OPTIONS = [
  { value: 'visa-win', labelBn: 'ভিসা প্রাপ্তি', labelEn: 'Visa win' },
  { value: 'arrival', labelBn: 'জাপানে অভ্যর্থনা', labelEn: 'Japan reception' },
  { value: 'event', labelBn: 'Event / অনুষ্ঠান', labelEn: 'Event' },
  { value: 'class', labelBn: 'ক্লাসরুম মুহূর্ত', labelEn: 'Classroom' },
];

const empty = {
  type: 'visa-win',
  studentName: '',
  school: '',
  eventDate: '',
  photos: [],
  videoUrl: '',
  captionBn: '',
  captionEn: '',
  featured: false,
  sortOrder: 0,
  published: true,
};

const AchievementsManage = () => {
  const api = axiosInterceptor();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [filterType, setFilterType] = useState('all');

  const load = async () => {
    try {
      const { data } = await api.get('/achievements?all=true');
      setItems(data.achievements || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    if (filterType === 'all') return items;
    return items.filter((i) => i.type === filterType);
  }, [items, filterType]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]:
        type === 'checkbox'
          ? checked
          : name === 'sortOrder'
          ? Number(value)
          : value,
    });
  };

  // EN: Add / remove photos one at a time so admin can curate the gallery.
  // BN: একটা একটা করে photo যোগ/বাদ — admin গ্যালারি সাজাতে পারে।
  const addPhoto = (url) => {
    if (!url) return;
    setForm((prev) => ({ ...prev, photos: [...(prev.photos || []), url] }));
  };
  const removePhoto = (idx) => {
    setForm((prev) => ({
      ...prev,
      photos: (prev.photos || []).filter((_, i) => i !== idx),
    }));
  };

  const reset = () => {
    setForm(empty);
    setEditingId(null);
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        // EN: Empty date → null (Sequelize DATEONLY rejects '').
        // BN: খালি date → null পাঠাই, '' Sequelize DATEONLY-তে error দেয়।
        eventDate: form.eventDate || null,
      };
      if (editingId) await api.put(`/achievements/${editingId}`, payload);
      else await api.post('/achievements', payload);
      reset();
      load();
    } catch (err) {
      console.error(err);
      alert('Save failed — দেখুন console।');
    }
  };

  const edit = (a) => {
    setEditingId(a.id);
    setForm({
      ...empty,
      ...a,
      photos: Array.isArray(a.photos) ? a.photos : [],
      eventDate: a.eventDate ? a.eventDate.slice(0, 10) : '',
    });
  };

  const remove = async (id) => {
    const ok = await confirmDialog({
      title: 'অর্জন delete করবেন?',
      message: 'এই অর্জন এন্ট্রি delete করবেন? এটা public site থেকেও সরে যাবে।',
      confirmText: 'হ্যাঁ, delete',
      cancelText: 'বাতিল',
      danger: true,
    });
    if (!ok) return;
    await api.delete(`/achievements/${id}`);
    load();
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-xl font-extrabold text-brand-navy">Achievements / অর্জন</h1>
        <p className="text-xs text-brand-slate">
          ভিসা প্রাপ্তি, জাপানে অভ্যর্থনা, event, ক্লাসরুম মুহূর্ত — সব এখান থেকে manage করুন।
          একাধিক ছবি upload করতে পারবেন; "Featured" দিলে Home page-এ "Recent Wins"-এ দেখাবে।
        </p>
      </div>

      <form
        onSubmit={submit}
        className="bg-white rounded-xl border border-brand-tealLight/40 shadow-sm p-5"
      >
        <h2 className="text-sm font-bold text-brand-navy uppercase tracking-wide mb-4">
          {editingId ? 'Edit Achievement' : 'Add Achievement'}
        </h2>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label>
              <span className={labelClass}>Type / ধরন</span>
              <select name="type" value={form.type} onChange={onChange} className={inputClass}>
                {TYPE_OPTIONS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.labelBn} — {t.labelEn}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className={labelClass}>Student name (optional)</span>
              <input
                name="studentName"
                value={form.studentName}
                onChange={onChange}
                className={inputClass}
                placeholder="রহিম উদ্দিন"
              />
            </label>

            <label>
              <span className={labelClass}>School / University (optional)</span>
              <input
                name="school"
                value={form.school}
                onChange={onChange}
                className={inputClass}
                placeholder="Tokyo International Academy"
              />
            </label>

            <label>
              <span className={labelClass}>Event date / তারিখ</span>
              <input
                type="date"
                name="eventDate"
                value={form.eventDate || ''}
                onChange={onChange}
                className={inputClass}
              />
            </label>

            <label>
              <span className={labelClass}>Video URL (optional)</span>
              <input
                name="videoUrl"
                value={form.videoUrl}
                onChange={onChange}
                className={inputClass}
                placeholder="https://youtube.com/..."
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

            <label className="flex items-center gap-2 pb-2">
              <input
                type="checkbox"
                name="featured"
                checked={form.featured}
                onChange={onChange}
              />
              <span className="text-xs text-brand-navy font-semibold">
                Featured (Home page-এ দেখাবে)
              </span>
            </label>

            <label className="flex items-center gap-2 pb-2">
              <input
                type="checkbox"
                name="published"
                checked={form.published}
                onChange={onChange}
              />
              <span className="text-xs text-brand-navy font-semibold">Published</span>
            </label>
          </div>

          {/* EN: Multi-photo gallery — pick one, click "Add", repeat. */}
          {/* BN: Multi-photo গ্যালারি — একটা select করে "Add" চাপুন, আবার repeat করুন। */}
          <div className="border-t border-brand-tealLight/30 pt-4">
            <ImageUploadField
              label="ছবি যোগ করুন (multi-photo)"
              value=""
              onChange={addPhoto}
              hint="প্রতিটা ছবি upload হলেই গ্যালারিতে যুক্ত হবে। অর্ডারে নিচে দেখাবে।"
            />

            {form.photos && form.photos.length > 0 && (
              <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {form.photos.map((url, idx) => (
                  <div
                    key={`${url}-${idx}`}
                    className="relative h-20 rounded border border-brand-tealLight/50 overflow-hidden bg-white"
                  >
                    {/* eslint-disable-next-line jsx-a11y/alt-text */}
                    <img src={url} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(idx)}
                      className="absolute top-0 right-0 bg-red-500 text-white text-[10px] px-1.5 py-0.5 font-bold"
                      title="Remove"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <BilingualField
            label="Caption / বিবরণ"
            name="caption"
            value={form.captionBn}
            valueEn={form.captionEn}
            onChange={(e) => {
              const { name, value } = e.target;
              // EN: BilingualField uses captionBn / captionEn naming convention.
              // BN: BilingualField captionBn / captionEn convention follow করে।
              const key = name === 'caption' ? 'captionBn' : name;
              setForm((prev) => ({ ...prev, [key]: value }));
            }}
            type="textarea"
            rows={3}
            placeholderBn="ছাত্রটি সফলভাবে জাপানের ভিসা পেয়েছে…"
            placeholderEn="Student successfully received Japan student visa…"
          />
        </div>

        <div className="flex gap-2 mt-4">
          <button
            type="submit"
            className="bg-brand-teal hover:bg-brand-navy text-white font-semibold px-5 py-2 rounded text-sm"
          >
            {editingId ? 'Update' : 'Add'} Achievement
          </button>
          {editingId && (
            <button
              type="button"
              onClick={reset}
              className="bg-white border border-brand-navy text-brand-navy font-semibold px-5 py-2 rounded text-sm"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="bg-white rounded-xl border border-brand-tealLight/40 shadow-sm overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 p-5 border-b border-brand-tealLight/40">
          <h2 className="text-sm font-bold text-brand-navy uppercase tracking-wide">
            Achievements ({filtered.length})
          </h2>
          <div className="flex flex-wrap gap-1.5">
            <FilterChip active={filterType === 'all'} onClick={() => setFilterType('all')}>
              সব
            </FilterChip>
            {TYPE_OPTIONS.map((t) => (
              <FilterChip
                key={t.value}
                active={filterType === t.value}
                onClick={() => setFilterType(t.value)}
              >
                {t.labelBn}
              </FilterChip>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="p-5 text-brand-slate text-sm">কোনো অর্জন নেই।</p>
        ) : (
          <ul className="divide-y divide-brand-tealLight/30">
            {filtered.map((a) => (
              <li key={a.id} className="flex items-start gap-4 p-4">
                {a.photos && a.photos[0] ? (
                  <img
                    src={a.photos[0]}
                    alt={a.studentName || a.captionEn}
                    className="w-16 h-16 rounded object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded bg-brand-tealLight/40 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-brand-navy text-sm">
                    {a.studentName || '(unnamed)'}
                    {a.featured && (
                      <span className="ml-2 text-[10px] bg-brand-teal text-white px-1.5 py-0.5 rounded uppercase">
                        Featured
                      </span>
                    )}
                    {!a.published && (
                      <span className="ml-2 text-[10px] bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded uppercase">
                        Draft
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-brand-slate">
                    {typeLabel(a.type)} {a.school ? `· ${a.school}` : ''}{' '}
                    {a.eventDate ? `· ${a.eventDate.slice(0, 10)}` : ''}
                    {a.photos?.length > 1 && ` · ${a.photos.length} photos`}
                  </p>
                  <p className="text-xs text-brand-slate mt-1 line-clamp-2">{a.captionBn}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => edit(a)}
                    className="text-xs text-brand-teal font-semibold hover:text-brand-navy"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => remove(a.id)}
                    className="text-xs text-red-500 font-semibold hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

function FilterChip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        'px-3 py-1 rounded-full text-xs font-semibold border ' +
        (active
          ? 'bg-brand-teal text-white border-brand-teal'
          : 'bg-white text-brand-slate border-brand-tealLight/60 hover:border-brand-teal')
      }
    >
      {children}
    </button>
  );
}

function typeLabel(t) {
  const found = TYPE_OPTIONS.find((o) => o.value === t);
  return found ? found.labelBn : t;
}

export default AchievementsManage;
