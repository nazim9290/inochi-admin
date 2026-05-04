import { useEffect, useState } from 'react';
import axiosInterceptor from '../axios/axiosInterceptor';
import BilingualField from '../components/BilingualField';
import { confirmDialog } from '../components/ConfirmDialog';

const inputClass =
  'w-full px-3 py-2 text-sm border border-brand-tealLight/60 rounded focus:outline-none focus:ring-2 focus:ring-brand-teal/40';
const labelClass = 'block text-xs font-semibold text-brand-navy mb-1';

const empty = {
  level: 'N5',
  title: '',
  titleEn: '',
  tagline: '',
  taglineEn: '',
  duration: '',
  durationEn: '',
  price: '',
  schedule: '',
  scheduleEn: '',
  features: '',
  featuresEn: '',
  nextBatch: '',
  nextBatchEn: '',
  highlight: false,
  sortOrder: 0,
};

const featuresToString = (f) =>
  Array.isArray(f) ? f.join('\n') : typeof f === 'string' ? f : '';

const stringToFeatures = (s) =>
  String(s || '').split('\n').map((x) => x.trim()).filter(Boolean);

const JlptCoursesManage = () => {
  const api = axiosInterceptor();
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);

  const load = async () => {
    try {
      const { data } = await api.get('/jlpt-courses');
      setCourses(data.courses || []);
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
      [name]: type === 'checkbox' ? checked : name === 'sortOrder' ? Number(value) : value,
    });
  };

  const reset = () => {
    setForm(empty);
    setEditingId(null);
  };

  const submit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      features: stringToFeatures(form.features),
      featuresEn: stringToFeatures(form.featuresEn),
    };
    try {
      if (editingId) await api.put(`/jlpt-courses/${editingId}`, payload);
      else await api.post('/jlpt-courses', payload);
      reset();
      load();
    } catch (err) {
      console.error(err);
      alert('Save failed');
    }
  };

  const edit = (c) => {
    setEditingId(c.id);
    setForm({
      ...empty,
      ...c,
      features: featuresToString(c.features),
      featuresEn: featuresToString(c.featuresEn),
    });
  };

  const remove = async (id) => {
    const ok = await confirmDialog({
      title: 'Course delete করবেন?',
      message: 'এই JLPT course delete করতে চান?',
      confirmText: 'হ্যাঁ, delete',
      cancelText: 'বাতিল',
      danger: true,
    });
    if (!ok) return;
    await api.delete(`/jlpt-courses/${id}`);
    load();
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-xl font-extrabold text-brand-navy">JLPT Courses</h1>
        <p className="text-xs text-brand-slate">N5 / N4 / N3 / N2 cards. Bilingual content.</p>
      </div>

      <form onSubmit={submit} className="bg-white rounded-xl border border-brand-tealLight/40 shadow-sm p-5">
        <h2 className="text-sm font-bold text-brand-navy uppercase tracking-wide mb-4">
          {editingId ? 'Edit Course' : 'Add Course'}
        </h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <label>
              <span className={labelClass}>Level</span>
              <select name="level" value={form.level} onChange={onChange} className={inputClass}>
                <option>N5</option><option>N4</option><option>N3</option><option>N2</option><option>N1</option>
              </select>
            </label>
            <label>
              <span className={labelClass}>Price (currency-agnostic)</span>
              <input name="price" value={form.price} onChange={onChange} className={inputClass} placeholder="৳ 12,000" />
            </label>
            <label>
              <span className={labelClass}>Sort order</span>
              <input type="number" name="sortOrder" value={form.sortOrder} onChange={onChange} className={inputClass} />
            </label>
            <label className="flex items-end gap-2 pb-2">
              <input type="checkbox" name="highlight" checked={form.highlight} onChange={onChange} />
              <span className="text-xs text-brand-navy font-semibold">Highlight (Most Popular)</span>
            </label>
          </div>

          <BilingualField label="Title" name="title" value={form.title} valueEn={form.titleEn} onChange={onChange} />
          <BilingualField label="Tagline" name="tagline" value={form.tagline} valueEn={form.taglineEn} onChange={onChange} />
          <BilingualField label="Duration" name="duration" value={form.duration} valueEn={form.durationEn} onChange={onChange} placeholderBn="৪ মাস" placeholderEn="4 months" />
          <BilingualField label="Schedule" name="schedule" value={form.schedule} valueEn={form.scheduleEn} onChange={onChange} placeholderBn="সপ্তাহে ৩ দিন" placeholderEn="3 days a week" />
          <BilingualField label="Next batch" name="nextBatch" value={form.nextBatch} valueEn={form.nextBatchEn} onChange={onChange} placeholderBn="১৫ মে, ২০২৬" placeholderEn="May 15, 2026" />
          <BilingualField label="Features (one per line)" name="features" value={form.features} valueEn={form.featuresEn} onChange={onChange} type="textarea" rows={5} placeholderBn="হিরাগানা মাস্টারি&#10;বেসিক কাঞ্জি (১০০+)" placeholderEn="Hiragana mastery&#10;Basic kanji (100+)" />
        </div>
        <div className="flex gap-2 mt-4">
          <button type="submit" className="bg-brand-teal hover:bg-brand-navy text-white font-semibold px-5 py-2 rounded text-sm">
            {editingId ? 'Update' : 'Add'} Course
          </button>
          {editingId && (
            <button type="button" onClick={reset} className="bg-white border border-brand-navy text-brand-navy font-semibold px-5 py-2 rounded text-sm">
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="bg-white rounded-xl border border-brand-tealLight/40 shadow-sm overflow-hidden">
        <h2 className="text-sm font-bold text-brand-navy uppercase tracking-wide p-5 border-b border-brand-tealLight/40">
          Courses ({courses.length})
        </h2>
        {courses.length === 0 ? (
          <p className="p-5 text-brand-slate text-sm">No courses yet.</p>
        ) : (
          <ul className="divide-y divide-brand-tealLight/30">
            {courses.map((c) => (
              <li key={c.id} className="flex items-start gap-4 p-4">
                <span className="bg-brand-navy text-white font-bold rounded-lg w-12 h-12 flex items-center justify-center flex-shrink-0">
                  {c.level}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-brand-navy text-sm">
                    {c.title}
                    {c.titleEn && <span className="ml-2 text-xs text-brand-slate font-normal italic">/ {c.titleEn}</span>}
                    {c.highlight && <span className="ml-2 text-[10px] bg-brand-teal text-white px-1.5 py-0.5 rounded uppercase">Popular</span>}
                  </p>
                  <p className="text-xs text-brand-slate">{c.tagline}</p>
                  <p className="text-xs text-brand-slate mt-0.5">
                    {c.duration} · {c.price} · {c.schedule}
                  </p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => edit(c)} className="text-xs text-brand-teal font-semibold hover:text-brand-navy">Edit</button>
                  <button onClick={() => remove(c.id)} className="text-xs text-red-500 font-semibold hover:text-red-700">Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default JlptCoursesManage;
