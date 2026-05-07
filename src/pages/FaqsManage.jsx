import { useEffect, useState } from 'react';
import axiosInterceptor from '../axios/axiosInterceptor';
import BilingualField from '../components/BilingualField';
import { confirmDialog } from '../components/ConfirmDialog';
import HelpTooltip from '../components/HelpTooltip';

const inputClass =
  'w-full px-3 py-2 text-sm border border-brand-tealLight/60 rounded focus:outline-none focus:ring-2 focus:ring-brand-teal/40';
const labelClass = 'block text-xs font-semibold text-brand-navy mb-1';

const empty = {
  question: '',
  questionEn: '',
  answer: '',
  answerEn: '',
  category: 'general',
  sortOrder: 0,
  published: true,
};

const FaqsManage = () => {
  const api = axiosInterceptor();
  const [faqs, setFaqs] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);

  const load = async () => {
    try {
      const { data } = await api.get('/faqs?all=true');
      setFaqs(data.faqs || []);
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
    try {
      if (editingId) await api.put(`/faqs/${editingId}`, form);
      else await api.post('/faqs', form);
      reset();
      load();
    } catch (err) {
      alert('Save failed');
    }
  };

  const edit = (f) => {
    setEditingId(f.id);
    setForm({ ...empty, ...f });
  };

  const remove = async (id) => {
    const ok = await confirmDialog({
      title: 'FAQ delete করবেন?',
      message: 'এই FAQ entry delete করতে চান?',
      confirmText: 'হ্যাঁ, delete',
      cancelText: 'বাতিল',
      danger: true,
    });
    if (!ok) return;
    await api.delete(`/faqs/${id}`);
    load();
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-xl font-extrabold text-brand-navy">FAQs</h1>
        <p className="text-xs text-brand-slate">
          সাধারণ জিজ্ঞাসা। দুই ভাষায় (Bangla + English) — public site-এর /faq page-এ এবং বিভিন্ন landing page-এ accordion-এ দেখাবে।
        </p>
      </div>

      <form onSubmit={submit} className="bg-white rounded-xl border border-brand-tealLight/40 shadow-sm p-5">
        <h2 className="text-sm font-bold text-brand-navy uppercase tracking-wide mb-4">
          {editingId ? 'Edit FAQ' : 'Add FAQ'}
        </h2>
        <div className="space-y-4">
          <BilingualField label="Question" name="question" value={form.question} valueEn={form.questionEn} onChange={onChange} />
          <BilingualField label="Answer" name="answer" value={form.answer} valueEn={form.answerEn} onChange={onChange} type="textarea" rows={4} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <label>
              <span className={labelClass}>
                Category
                <HelpTooltip>FAQ গ্রুপ — e.g. "general", "visa", "fees", "scholarship"। একই category-র সবাই একসাথে দেখাবে।</HelpTooltip>
              </span>
              <input name="category" value={form.category} onChange={onChange} className={inputClass} placeholder="general" />
            </label>
            <label>
              <span className={labelClass}>
                Sort order
                <HelpTooltip>ছোট সংখ্যা = list-এ আগে দেখাবে। গুরুত্বপূর্ণ FAQ-গুলোয় কম সংখ্যা দিন।</HelpTooltip>
              </span>
              <input type="number" name="sortOrder" value={form.sortOrder} onChange={onChange} className={inputClass} />
            </label>
            <label className="flex items-center gap-2 pb-2">
              <input type="checkbox" name="published" checked={form.published} onChange={onChange} />
              <span className="text-xs text-brand-navy font-semibold">Published</span>
              <HelpTooltip>Tick থাকলে public-এ দেখাবে। Untick করলে শুধু admin-এ থাকবে।</HelpTooltip>
            </label>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button type="submit" className="bg-brand-teal hover:bg-brand-navy text-white font-semibold px-5 py-2 rounded text-sm">
            {editingId ? 'Update' : 'Add'} FAQ
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
          FAQs ({faqs.length})
        </h2>
        {faqs.length === 0 ? (
          <p className="p-5 text-brand-slate text-sm">No FAQs yet.</p>
        ) : (
          <ul className="divide-y divide-brand-tealLight/30">
            {faqs.map((f) => (
              <li key={f.id} className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-brand-navy text-sm">
                      {f.question}
                      {!f.published && <span className="ml-2 text-[10px] bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded uppercase">Draft</span>}
                    </p>
                    {f.questionEn && <p className="text-xs text-brand-slate/70 italic mt-0.5">{f.questionEn}</p>}
                    <p className="text-xs text-brand-slate mt-1 line-clamp-2">{f.answer}</p>
                    <p className="text-[10px] text-brand-slate/60 mt-1 uppercase">{f.category}</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => edit(f)} className="text-xs text-brand-teal font-semibold hover:text-brand-navy">Edit</button>
                    <button onClick={() => remove(f.id)} className="text-xs text-red-500 font-semibold hover:text-red-700">Delete</button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default FaqsManage;
