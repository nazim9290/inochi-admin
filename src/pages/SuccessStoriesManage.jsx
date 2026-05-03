import { useEffect, useState } from 'react';
import axiosInterceptor from '../axios/axiosInterceptor';
import BilingualField from '../components/BilingualField';
import ImageUploadField from '../components/ImageUploadField';

const inputClass =
  'w-full px-3 py-2 text-sm border border-brand-tealLight/60 rounded focus:outline-none focus:ring-2 focus:ring-brand-teal/40';
const labelClass = 'block text-xs font-semibold text-brand-navy mb-1';

// EN: 5-phase journey definition — admin sees these as upload sections in order.
//     Each phase carries a Bangla + English label so the form is bilingual.
//     Adding a 6th phase later: just append here + add the same key to the
//     PHASE_ORDER array on the frontend adapter.
// BN: 5-phase journey — admin form-এ এই অর্ডারেই upload section দেখাবে।
//     প্রতিটা phase-এর Bangla+English label আছে — bilingual form। ভবিষ্যতে
//     ৬ষ্ঠ phase = এখানে append + adapter-এর PHASE_ORDER-এ একই key যোগ।
const JOURNEY_PHASES = [
  { key: 'class',    labelBn: 'ক্লাস টাইম',         labelEn: 'Class time at Inochi' },
  { key: 'coe',      labelBn: 'COE প্রাপ্তি',        labelEn: 'COE received' },
  { key: 'visa',     labelBn: 'ভিসা প্রাপ্তি',       labelEn: 'Visa stamped' },
  { key: 'arrival',  labelBn: 'জাপান পৌঁছানো',     labelEn: 'Arrival in Japan' },
  { key: 'firstDay', labelBn: 'জাপানে প্রথম দিন',   labelEn: 'First day in Japan' },
];

const blankJourney = () =>
  JOURNEY_PHASES.reduce((acc, p) => ({ ...acc, [p.key]: { photoUrl: '', date: '' } }), {});

const empty = {
  studentName: '',
  university: '',
  location: '',
  locationEn: '',
  photoUrl: '',
  story: '',
  storyEn: '',
  batchYear: '',
  jlptLevel: '',
  sortOrder: 0,
  published: true,
  journey: blankJourney(),
};

const SuccessStoriesManage = () => {
  const api = axiosInterceptor();
  const [stories, setStories] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);

  const load = async () => {
    try {
      const { data } = await api.get('/success-stories?all=true');
      setStories(data.stories || []);
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

  // EN: Photo URL bubbles up from ImageUploadField as a plain string.
  // BN: ImageUploadField থেকে photo URL plain string হিসেবে আসে।
  const setPhotoUrl = (url) => setForm((prev) => ({ ...prev, photoUrl: url }));

  // EN: Update a single journey-phase field (photoUrl or date) immutably so
  //     React picks up the nested change.
  // BN: একটা journey-phase field (photoUrl বা date) immutably update —
  //     nested change React যাতে detect করতে পারে।
  const setPhase = (phaseKey, field, value) =>
    setForm((prev) => ({
      ...prev,
      journey: {
        ...(prev.journey || {}),
        [phaseKey]: {
          ...((prev.journey || {})[phaseKey] || {}),
          [field]: value,
        },
      },
    }));

  const reset = () => {
    setForm(empty);
    setEditingId(null);
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) await api.put(`/success-stories/${editingId}`, form);
      else await api.post('/success-stories', form);
      reset();
      load();
    } catch (err) {
      alert('Save failed');
    }
  };

  const edit = (s) => {
    setEditingId(s.id);
    // EN: Merge backend journey with blank scaffold so missing phases still
    //     have controlled inputs (avoids React "uncontrolled → controlled" warnings).
    // BN: Backend journey-কে blank scaffold-এর সাথে merge — missing phase-ও
    //     controlled input পাবে (React-এর uncontrolled→controlled warning এড়ানো)।
    const journey = { ...blankJourney(), ...(s.journey || {}) };
    setForm({ ...empty, ...s, journey });
  };

  const remove = async (id) => {
    if (!confirm('Delete this story?')) return;
    await api.delete(`/success-stories/${id}`);
    load();
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-xl font-extrabold text-brand-navy">Success Stories</h1>
        <p className="text-xs text-brand-slate">Student testimonials. Edit BN + EN side by side.</p>
      </div>

      <form onSubmit={submit} className="bg-white rounded-xl border border-brand-tealLight/40 shadow-sm p-5">
        <h2 className="text-sm font-bold text-brand-navy uppercase tracking-wide mb-4">
          {editingId ? 'Edit Story' : 'Add Story'}
        </h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label>
              <span className={labelClass}>Student name (universal)</span>
              <input name="studentName" value={form.studentName} onChange={onChange} className={inputClass} required />
            </label>
            <label>
              <span className={labelClass}>University / school (universal)</span>
              <input name="university" value={form.university} onChange={onChange} className={inputClass} />
            </label>
            <label>
              <span className={labelClass}>Batch year</span>
              <input name="batchYear" value={form.batchYear} onChange={onChange} className={inputClass} placeholder="2024" />
            </label>
            <label>
              <span className={labelClass}>JLPT level</span>
              <input name="jlptLevel" value={form.jlptLevel} onChange={onChange} className={inputClass} placeholder="N3" />
            </label>
            <label>
              <span className={labelClass}>Sort order</span>
              <input type="number" name="sortOrder" value={form.sortOrder} onChange={onChange} className={inputClass} />
            </label>
            <label className="flex items-center gap-2 pb-2">
              <input type="checkbox" name="published" checked={form.published} onChange={onChange} />
              <span className="text-xs text-brand-navy font-semibold">Published</span>
            </label>
            <div className="md:col-span-2">
              <ImageUploadField
                label="Student-এর ছবি"
                value={form.photoUrl}
                onChange={setPhotoUrl}
                hint="Square / portrait ছবি ভাল দেখায়। File picker থেকে select করলে auto-upload হবে।"
              />
            </div>
          </div>
          <BilingualField label="Location" name="location" value={form.location} valueEn={form.locationEn} onChange={onChange} placeholderBn="টোকিও, জাপান" placeholderEn="Tokyo, Japan" />
          <BilingualField label="Story / quote" name="story" value={form.story} valueEn={form.storyEn} onChange={onChange} type="textarea" rows={3} />

          {/* EN: 5-phase journey gallery — admin uploads photos as the student
              progresses. Each phase optional; only filled phases render publicly.
              BN: 5-phase journey gallery — student-এর progress অনুযায়ী admin
              ছবি upload করে। প্রতিটা phase optional; ভরা phase-গুলোই public-এ
              দেখাবে। */}
          <div className="border-t border-brand-tealLight/40 pt-5">
            <h3 className="text-sm font-bold text-brand-navy uppercase tracking-wide mb-1">
              Journey (৫টি ধাপ — যা যা পেয়েছেন উপলোড করুন)
            </h3>
            <p className="text-xs text-brand-slate mb-4">
              পাঁচটা মুহূর্ত পাশাপাশি দেখলে student-এর সম্পূর্ণ যাত্রা প্রমাণিত হবে।
              যেকোনোটা skip করতে পারেন — শুধু upload করা photo public site-এ দেখাবে।
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {JOURNEY_PHASES.map((phase) => {
                const data = (form.journey && form.journey[phase.key]) || {};
                return (
                  <div
                    key={phase.key}
                    className="min-w-0 rounded-lg border border-brand-tealLight/50 bg-brand-tealLight/5 p-3"
                  >
                    <div className="flex items-baseline justify-between mb-2">
                      <span className="text-sm font-semibold text-brand-navy">
                        {phase.labelBn}
                      </span>
                      <span className="text-[10px] text-brand-slate uppercase tracking-wider">
                        {phase.labelEn}
                      </span>
                    </div>
                    <ImageUploadField
                      compact
                      value={data.photoUrl || ''}
                      onChange={(url) => setPhase(phase.key, 'photoUrl', url)}
                    />
                    <label className="block mt-2">
                      <span className="block text-[11px] text-brand-slate mb-1">
                        তারিখ (optional)
                      </span>
                      <input
                        type="date"
                        value={data.date || ''}
                        onChange={(e) => setPhase(phase.key, 'date', e.target.value)}
                        className={inputClass}
                      />
                    </label>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button type="submit" className="bg-brand-teal hover:bg-brand-navy text-white font-semibold px-5 py-2 rounded text-sm">
            {editingId ? 'Update' : 'Add'} Story
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
          Stories ({stories.length})
        </h2>
        {stories.length === 0 ? (
          <p className="p-5 text-brand-slate text-sm">No stories yet.</p>
        ) : (
          <ul className="divide-y divide-brand-tealLight/30">
            {stories.map((s) => (
              <li key={s.id} className="flex items-start gap-4 p-4">
                {s.photoUrl ? (
                  <img src={s.photoUrl} alt={s.studentName} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-brand-tealLight/40 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-brand-navy text-sm">
                    {s.studentName}
                    {!s.published && <span className="ml-2 text-[10px] bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded uppercase">Draft</span>}
                    {/* EN: Tiny journey badge — at-a-glance count of phases admin
                         has photos for. Helps spot stories that need more uploads. */}
                    {/* BN: ছোট journey badge — কয়টা phase-এর photo upload হয়েছে
                         দেখায়। কোন story-তে আরো ছবি দরকার দ্রুত বুঝতে পারবেন। */}
                    {(() => {
                      const filled = JOURNEY_PHASES.filter(
                        (p) => s.journey && s.journey[p.key] && s.journey[p.key].photoUrl
                      ).length;
                      return (
                        <span className={
                          'ml-2 text-[10px] px-1.5 py-0.5 rounded uppercase ' +
                          (filled === 5
                            ? 'bg-brand-teal text-white'
                            : filled > 0
                              ? 'bg-brand-tealLight/40 text-brand-navy'
                              : 'bg-gray-100 text-gray-500')
                        }>
                          Journey {filled}/5
                        </span>
                      );
                    })()}
                  </p>
                  <p className="text-xs text-brand-slate">{s.university} · {s.batchYear}</p>
                  <p className="text-xs text-brand-slate mt-1 line-clamp-2">{s.story}</p>
                  {s.storyEn && <p className="text-xs text-brand-slate/70 italic mt-1 line-clamp-2">{s.storyEn}</p>}
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

export default SuccessStoriesManage;
