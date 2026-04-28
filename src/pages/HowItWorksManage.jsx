import { useEffect, useState } from 'react';
import axiosInterceptor from '../axios/axiosInterceptor';
import BilingualField from '../components/BilingualField';

const inputClass =
  'w-full px-3 py-2 text-sm border border-brand-tealLight/60 rounded focus:outline-none focus:ring-2 focus:ring-brand-teal/40';
const labelClass = 'block text-xs font-semibold text-brand-navy mb-1';

const ICON_OPTIONS = ['compass', 'book', 'badge', 'school', 'passport', 'plane'];

const empty = {
  stepNumber: 1,
  title: '',
  titleEn: '',
  description: '',
  descriptionEn: '',
  icon: 'compass',
};

const HowItWorksManage = () => {
  const api = axiosInterceptor();
  const [steps, setSteps] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const { data } = await api.get('/how-it-works');
      setSteps(data.steps || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: name === 'stepNumber' ? Number(value) : value });
  };

  const reset = () => {
    setForm(empty);
    setEditingId(null);
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/how-it-works/${editingId}`, form);
      } else {
        await api.post('/how-it-works', form);
      }
      reset();
      load();
    } catch (err) {
      console.error(err);
      alert('Save failed');
    }
  };

  const edit = (s) => {
    setEditingId(s.id);
    setForm({ ...empty, ...s });
  };

  const remove = async (id) => {
    if (!confirm('Delete this step?')) return;
    try {
      await api.delete(`/how-it-works/${id}`);
      load();
    } catch (err) {
      alert('Delete failed');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-xl font-extrabold text-brand-navy">How It Works — Steps</h1>
        <p className="text-xs text-brand-slate">The student journey timeline. Edit BN + EN.</p>
      </div>

      <form onSubmit={submit} className="bg-white rounded-xl border border-brand-tealLight/40 shadow-sm p-5">
        <h2 className="text-sm font-bold text-brand-navy uppercase tracking-wide mb-4">
          {editingId ? 'Edit Step' : 'Add Step'}
        </h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <label>
              <span className={labelClass}>Step number</span>
              <input
                type="number"
                name="stepNumber"
                value={form.stepNumber}
                onChange={onChange}
                className={inputClass}
                min={1}
                required
              />
            </label>
            <label>
              <span className={labelClass}>Icon</span>
              <select name="icon" value={form.icon} onChange={onChange} className={inputClass}>
                {ICON_OPTIONS.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </label>
          </div>
          <BilingualField label="Title" name="title" value={form.title} valueEn={form.titleEn} onChange={onChange} />
          <BilingualField label="Description" name="description" value={form.description} valueEn={form.descriptionEn} onChange={onChange} type="textarea" rows={2} />
        </div>
        <div className="flex gap-2 mt-4">
          <button type="submit" className="bg-brand-teal hover:bg-brand-navy text-white font-semibold px-5 py-2 rounded text-sm">
            {editingId ? 'Update' : 'Add'} Step
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
          Existing Steps ({steps.length})
        </h2>
        {loading ? (
          <p className="p-5 text-brand-slate text-sm">Loading…</p>
        ) : steps.length === 0 ? (
          <p className="p-5 text-brand-slate text-sm">No steps yet.</p>
        ) : (
          <ul className="divide-y divide-brand-tealLight/30">
            {steps.map((s) => (
              <li key={s.id} className="flex items-start gap-4 p-4">
                <span className="bg-brand-teal/10 text-brand-teal font-bold rounded-full w-9 h-9 flex items-center justify-center flex-shrink-0 text-sm">
                  {s.stepNumber}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-brand-navy text-sm">
                    {s.title}
                    {s.titleEn && <span className="ml-2 text-xs text-brand-slate font-normal italic">/ {s.titleEn}</span>}
                  </p>
                  <p className="text-xs text-brand-slate mt-0.5 line-clamp-2">{s.description}</p>
                  <p className="text-[10px] text-brand-slate/60 mt-1 uppercase">icon: {s.icon}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => edit(s)} className="text-xs text-brand-teal font-semibold hover:text-brand-navy">Edit</button>
                  <button onClick={() => remove(s.id)} className="text-xs text-red-500 font-semibold hover:text-red-700">Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default HowItWorksManage;
