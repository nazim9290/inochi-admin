/**
 * EN: Admin page for the home Hero-strip "Inochi moments" — agency-life
 *     photos that scroll under the home Hero. Admin uploads each photo via
 *     ImageUploadField (so it lands in Cloudinary + library), adds an
 *     optional bilingual caption, and toggles published. Sort order
 *     determines marquee order (small → big = first to last).
 * BN: Home Hero-এর নিচের "Inochi moments" — agency-life photo strip-এর
 *     admin page। প্রতিটা photo ImageUploadField দিয়ে upload হয় (Cloudinary
 *     + library-তে যায়), optional bilingual caption যোগ করা যায়, published
 *     toggle হয়। Sort order marquee-এর order (ছোট → বড় = প্রথম → শেষ)।
 */
import { useEffect, useState } from 'react';
import axiosInterceptor from '../axios/axiosInterceptor';
import BilingualField from '../components/BilingualField';
import ImageUploadField from '../components/ImageUploadField';
import { confirmDialog } from '../components/ConfirmDialog';

const inputClass =
  'w-full px-3 py-2 text-sm border border-brand-tealLight/60 rounded focus:outline-none focus:ring-2 focus:ring-brand-teal/40';
const labelClass = 'block text-xs font-semibold text-brand-navy mb-1';

const empty = {
  photoUrl: '',
  caption: '',
  captionEn: '',
  sortOrder: 0,
  published: true,
};

export default function MomentsManage() {
  const api = axiosInterceptor();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);

  const load = async () => {
    try {
      const { data } = await api.get('/agency-moments?all=true');
      setItems(data.moments || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]:
        type === 'checkbox' ? checked : name === 'sortOrder' ? Number(value) : value,
    });
  };

  const reset = () => {
    setForm(empty);
    setEditingId(null);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.photoUrl) {
      alert('ছবি upload করুন বা library থেকে বাছাই করুন।');
      return;
    }
    try {
      if (editingId) await api.put(`/agency-moments/${editingId}`, form);
      else await api.post('/agency-moments', form);
      reset();
      load();
    } catch (err) {
      console.error(err);
      alert('Save failed — দেখুন console।');
    }
  };

  const edit = (m) => {
    setEditingId(m.id);
    setForm({ ...empty, ...m });
  };

  const remove = async (id) => {
    const ok = await confirmDialog({
      title: 'Moment delete করবেন?',
      message: 'এই ছবি strip থেকে সরিয়ে দিতে চান?',
      confirmText: 'হ্যাঁ, delete',
      cancelText: 'বাতিল',
      danger: true,
    });
    if (!ok) return;
    await api.delete(`/agency-moments/${id}`);
    load();
  };

  const togglePublished = async (m) => {
    try {
      await api.put(`/agency-moments/${m.id}`, { ...m, published: !m.published });
      load();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-xl font-extrabold text-brand-navy">
          Inochi Moments / মুহূর্ত
        </h1>
        <p className="text-xs text-brand-slate mt-1">
          হোম পেজের Hero-এর ঠিক নিচে যেসব ছবি auto-scroll হবে। অফিস, JLPT ক্লাস,
          ceremony, partner-school visit, জাপান trip — যেকোনো agency-life ছবি।
          কমপক্ষে ৪টা published ছবি থাকলে strip দেখাবে।
        </p>
      </div>

      <form
        onSubmit={submit}
        className="bg-white rounded-xl border border-brand-tealLight/40 shadow-sm p-5"
      >
        <h2 className="text-sm font-bold text-brand-navy uppercase tracking-wide mb-4">
          {editingId ? 'Edit Moment' : 'Add Moment'}
        </h2>

        <div className="space-y-4">
          <ImageUploadField
            label="ছবি / Photo"
            value={form.photoUrl}
            onChange={(url) => setForm((f) => ({ ...f, photoUrl: url }))}
            hint="JPG / PNG / WebP, square বা landscape ভাল দেখায়। Cloudinary library থেকেও বাছাই করা যায়।"
          />

          <BilingualField
            label="Caption / ক্যাপশন (optional)"
            name="caption"
            value={form.caption}
            valueEn={form.captionEn}
            onChange={onChange}
            placeholderBn="যেমন: জাপান trip, October 2025"
            placeholderEn="e.g. Japan trip, October 2025"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <label>
              <span className={labelClass}>Sort order</span>
              <input
                type="number"
                name="sortOrder"
                value={form.sortOrder}
                onChange={onChange}
                className={inputClass}
              />
              <p className="mt-1 text-[10px] text-brand-slate">
                ছোট নম্বর আগে দেখাবে। ০ default।
              </p>
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
        </div>

        <div className="flex gap-2 mt-4">
          <button
            type="submit"
            className="bg-brand-teal hover:bg-brand-navy text-white font-semibold px-5 py-2 rounded text-sm"
          >
            {editingId ? 'Update' : 'Add'} Moment
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
        <h2 className="text-sm font-bold text-brand-navy uppercase tracking-wide p-5 border-b border-brand-tealLight/40">
          Moments ({items.length})
          {items.filter((i) => i.published).length < 4 && items.length > 0 && (
            <span className="ml-3 text-[10px] font-semibold uppercase tracking-wider bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
              ⚠ ৪-এর কম published — strip এখনো site-এ দেখাবে না
            </span>
          )}
        </h2>
        {items.length === 0 ? (
          <p className="p-5 text-brand-slate text-sm">কোনো moment যোগ করা হয়নি।</p>
        ) : (
          <ul className="divide-y divide-brand-tealLight/30">
            {items.map((m) => (
              <li key={m.id} className="flex items-start gap-4 p-4">
                {m.photoUrl ? (
                  /* eslint-disable-next-line jsx-a11y/alt-text */
                  <img
                    src={m.photoUrl}
                    className="w-28 h-20 rounded object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-28 h-20 rounded bg-brand-tealLight/40 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-brand-navy text-sm">
                    {m.caption || m.captionEn || '(no caption)'}
                    {!m.published && (
                      <span className="ml-2 text-[10px] bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded uppercase">
                        Draft
                      </span>
                    )}
                  </p>
                  {m.captionEn && m.caption && (
                    <p className="text-xs text-brand-slate/70 italic">{m.captionEn}</p>
                  )}
                  <p className="text-[10px] text-brand-slate/60 mt-1">
                    Sort: {m.sortOrder ?? 0}
                  </p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => togglePublished(m)}
                    className={`text-xs font-semibold ${
                      m.published
                        ? 'text-amber-700 hover:text-amber-900'
                        : 'text-emerald-700 hover:text-emerald-900'
                    }`}
                  >
                    {m.published ? 'Unpublish' : 'Publish'}
                  </button>
                  <button
                    onClick={() => edit(m)}
                    className="text-xs text-brand-teal font-semibold hover:text-brand-navy"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => remove(m.id)}
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
}
