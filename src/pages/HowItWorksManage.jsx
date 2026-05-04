import { useEffect, useMemo, useState } from 'react';
import {
  Compass,
  MessageSquare,
  ClipboardCheck,
  School,
  Languages,
  FileText,
  Award,
  Plane,
  PartyPopper,
  Briefcase,
  Globe,
  Heart,
  Phone,
  Mail,
  Users,
  Calendar,
  CheckCircle,
  Star,
  Sparkles,
  GripVertical,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import axiosInterceptor from '../axios/axiosInterceptor';
import BilingualField from '../components/BilingualField';
import { confirmDialog } from '../components/ConfirmDialog';

// EN: Curated icon set — must match the ICON_MAP in
//     Inochi-global-new/src/components/sections/PathwaySteps.jsx so any icon
//     admin picks here renders on the public home page.
// BN: Curated icon set — frontend-এর ICON_MAP-এর সাথে exact match হতে হবে,
//     না হলে admin যা বাছাই করবে home page-এ render হবে না।
const ICON_OPTIONS = [
  { key: 'compass', Icon: Compass, label: 'Compass' },
  { key: 'message', Icon: MessageSquare, label: 'Message' },
  { key: 'clipboard', Icon: ClipboardCheck, label: 'Clipboard' },
  { key: 'school', Icon: School, label: 'School' },
  { key: 'languages', Icon: Languages, label: 'Languages' },
  { key: 'file', Icon: FileText, label: 'File' },
  { key: 'award', Icon: Award, label: 'Award' },
  { key: 'plane', Icon: Plane, label: 'Plane' },
  { key: 'party', Icon: PartyPopper, label: 'Party' },
  { key: 'briefcase', Icon: Briefcase, label: 'Briefcase' },
  { key: 'globe', Icon: Globe, label: 'Globe' },
  { key: 'heart', Icon: Heart, label: 'Heart' },
  { key: 'phone', Icon: Phone, label: 'Phone' },
  { key: 'mail', Icon: Mail, label: 'Mail' },
  { key: 'users', Icon: Users, label: 'Users' },
  { key: 'calendar', Icon: Calendar, label: 'Calendar' },
  { key: 'check', Icon: CheckCircle, label: 'Check' },
  { key: 'star', Icon: Star, label: 'Star' },
  { key: 'sparkles', Icon: Sparkles, label: 'Sparkles' },
];

const ICON_BY_KEY = Object.fromEntries(ICON_OPTIONS.map((o) => [o.key, o.Icon]));

const inputClass =
  'w-full px-3 py-2 text-sm border border-brand-tealLight/60 rounded focus:outline-none focus:ring-2 focus:ring-brand-teal/40';
const labelClass = 'block text-xs font-semibold text-brand-navy mb-1';

const empty = {
  stepNumber: 1,
  title: '',
  titleEn: '',
  description: '',
  descriptionEn: '',
  icon: 'compass',
  published: true,
};

// EN: Curated default journey — admin can import in one click to bootstrap the
//     section instead of typing all 8 from scratch. Mirrors the translation
//     fallback that ships in the frontend.
// BN: Curated default journey — admin এক click-এ import করে section bootstrap
//     করতে পারে। Frontend-এ ship করা translation fallback-এর সাথে মেলে।
const SEED_STEPS = [
  {
    stepNumber: 1,
    icon: 'message',
    title: 'যোগাযোগ ও আলাপ',
    titleEn: 'Reach Out & Talk',
    description: 'আপনি WhatsApp বা ফোনে যোগাযোগ করেন — আমরা প্রথম ১৫ মিনিটে শুনি, কোনো sales pitch না।',
    descriptionEn: "You message us on WhatsApp or call. We listen for the first 15 minutes — no sales pitch.",
    published: true,
  },
  {
    stepNumber: 2,
    icon: 'clipboard',
    title: 'কাউন্সেলিং সেশন',
    titleEn: 'Counseling Session',
    description: 'আপনার লক্ষ্য, বাজেট, পরিবার ও পড়ালেখার পরিস্থিতি দেখে কোন pathway আপনার জন্য সঠিক, সেটা বের করি।',
    descriptionEn: 'We map your goals, budget, family situation and academics to the right pathway.',
    published: true,
  },
  {
    stepNumber: 3,
    icon: 'school',
    title: 'ভর্তি প্রক্রিয়া',
    titleEn: 'Admission',
    description: 'আমাদের ৫০+ partner স্কুল থেকে আপনার profile-এর সাথে fit একটা বাছাই — Inochi সরাসরি apply করে।',
    descriptionEn: 'We pick a school from our 50+ partner network that fits your profile — Inochi applies directly.',
    published: true,
  },
  {
    stepNumber: 4,
    icon: 'languages',
    title: 'জাপানি ভাষা প্রস্তুতি',
    titleEn: 'Japanese Prep',
    description: 'ঢাকার ক্লাসরুমে বা অনলাইনে JLPT N5/N4 prep — visa officer-এর কাছে confidence-এ পার্থক্য তৈরি করে।',
    descriptionEn: 'JLPT N5/N4 prep in Dhaka classrooms or online — the difference visa officers notice.',
    published: true,
  },
  {
    stepNumber: 5,
    icon: 'file',
    title: 'ডকুমেন্ট প্রস্তুত',
    titleEn: 'Documents',
    description: 'একাডেমিক, financial, statement of purpose — Inochi নিজে check ও translate করে। আপনাকে শুধু সরবরাহ করতে হবে।',
    descriptionEn: 'Academics, financials, SOP. Inochi reviews and translates — you just supply.',
    published: true,
  },
  {
    stepNumber: 6,
    icon: 'award',
    title: 'COE ইস্যু',
    titleEn: 'COE Issued',
    description: 'জাপান থেকে Certificate of Eligibility ইস্যু হলে আমরা original সরাসরি আপনার হাতে পৌঁছে দেই।',
    descriptionEn: 'When the Certificate of Eligibility issues from Japan, we hand-deliver the original.',
    published: true,
  },
  {
    stepNumber: 7,
    icon: 'plane',
    title: 'ভিসা ও ফ্লাইট',
    titleEn: 'Visa & Flight',
    description: 'এম্বাসি interview prep, ভিসা apply, ফ্লাইট booking — সব আমরা সাজিয়ে দেই।',
    descriptionEn: 'Embassy interview prep, visa filing, flight booking — we coordinate the lot.',
    published: true,
  },
  {
    stepNumber: 8,
    icon: 'party',
    title: 'জাপানে স্বাগতম',
    titleEn: 'Welcome to Japan',
    description: 'টোকিও বিমানবন্দরে আমাদের team আপনাকে receive করে — হোস্টেল, SIM, প্রথম সপ্তাহের সব কিছু।',
    descriptionEn: 'Our team meets you at the Tokyo airport — hostel, SIM, the entire first week sorted.',
    published: true,
  },
];

const HowItWorksManage = () => {
  const api = axiosInterceptor();
  const [steps, setSteps] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [msg, setMsg] = useState('');

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
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setForm({ ...form, [name]: checked });
    } else {
      setForm({ ...form, [name]: name === 'stepNumber' ? Number(value) : value });
    }
  };

  const reset = () => {
    setForm({ ...empty, stepNumber: (steps.length || 0) + 1 });
    setEditingId(null);
  };

  const showMsg = (text) => {
    setMsg(text);
    setTimeout(() => setMsg(''), 3000);
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (editingId) {
        await api.put(`/how-it-works/${editingId}`, form);
        showMsg('✓ Step updated');
      } else {
        await api.post('/how-it-works', form);
        showMsg('✓ Step added');
      }
      reset();
      load();
    } catch (err) {
      console.error(err);
      showMsg('✗ Save failed');
    } finally {
      setBusy(false);
    }
  };

  const edit = (s) => {
    setEditingId(s.id);
    setForm({ ...empty, ...s });
  };

  const remove = async (id) => {
    const ok = await confirmDialog({
      title: 'Step delete করবেন?',
      message: 'এই step delete করতে চান?',
      confirmText: 'হ্যাঁ, delete',
      cancelText: 'বাতিল',
      danger: true,
    });
    if (!ok) return;
    try {
      await api.delete(`/how-it-works/${id}`);
      load();
    } catch (err) {
      alert('Delete failed');
    }
  };

  const togglePublish = async (s) => {
    try {
      await api.put(`/how-it-works/${s.id}`, { ...s, published: !s.published });
      load();
    } catch (err) {
      alert('Toggle failed');
    }
  };

  const move = async (s, direction) => {
    const sorted = [...steps].sort((a, b) => a.stepNumber - b.stepNumber);
    const i = sorted.findIndex((x) => x.id === s.id);
    const j = direction === 'up' ? i - 1 : i + 1;
    if (j < 0 || j >= sorted.length) return;
    const a = sorted[i];
    const b = sorted[j];
    try {
      await Promise.all([
        api.put(`/how-it-works/${a.id}`, { ...a, stepNumber: b.stepNumber }),
        api.put(`/how-it-works/${b.id}`, { ...b, stepNumber: a.stepNumber }),
      ]);
      load();
    } catch (err) {
      alert('Reorder failed');
    }
  };

  const seedAll = async () => {
    const ok = await confirmDialog({
      title: 'Default steps import?',
      message: `${SEED_STEPS.length}টা default step import করবেন?`,
      confirmText: 'হ্যাঁ, import',
      cancelText: 'বাতিল',
      danger: false,
      icon: '📥',
    });
    if (!ok) return;
    setSeeding(true);
    try {
      for (const seed of SEED_STEPS) {
        await api.post('/how-it-works', seed);
      }
      showMsg(`✓ ${SEED_STEPS.length}টা step import হয়েছে`);
      load();
    } catch (err) {
      console.error(err);
      showMsg('✗ Seed failed');
    } finally {
      setSeeding(false);
    }
  };

  const sortedSteps = useMemo(
    () => [...steps].sort((a, b) => (a.stepNumber || 0) - (b.stepNumber || 0)),
    [steps]
  );

  return (
    <div className="space-y-6 max-w-5xl pb-20">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-navy">Pathway Steps (How It Works)</h1>
          <p className="mt-1 text-sm text-brand-slate">
            হোম পেজের "Pathway" সেকশনে দেখানো student journey-এর step গুলো এখান থেকে edit করুন।
            <br />
            <span className="text-xs">
              💡 কোনো step add না করলে সাইটে built-in default ৮টা step দেখাবে।
              একটা step add করলেই custom version live হবে।
            </span>
          </p>
        </div>
        {msg && (
          <span
            className={`flex-shrink-0 rounded-full bg-white px-4 py-2 text-sm font-semibold shadow-md ${
              msg.startsWith('✓') ? 'text-brand-teal' : 'text-red-600'
            }`}
          >
            {msg}
          </span>
        )}
      </div>

      {steps.length === 0 && !loading && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <h3 className="text-sm font-bold text-amber-900">এখনো কোনো step নেই</h3>
          <p className="mt-1 text-xs text-amber-800">
            নিচের form থেকে নিজে add করুন, অথবা এক click-এ Inochi-এর default ৮টা step import করুন।
          </p>
          <button
            type="button"
            onClick={seedAll}
            disabled={seeding}
            className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-amber-600 px-4 py-2 text-xs font-bold text-white hover:bg-amber-700 disabled:opacity-50"
          >
            {seeding ? 'Importing…' : `Import ${SEED_STEPS.length} default steps`}
          </button>
        </div>
      )}

      <form
        onSubmit={submit}
        className="bg-white rounded-xl border border-brand-tealLight/40 shadow-sm p-6"
      >
        <h2 className="text-sm font-bold text-brand-navy uppercase tracking-wide mb-4">
          {editingId ? `Edit step #${form.stepNumber}` : 'নতুন step add করুন'}
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
            <div className="md:col-span-2">
              <span className={labelClass}>Icon (home page card-এ এই icon-টা দেখাবে)</span>
              <IconPicker value={form.icon} onChange={(key) => setForm({ ...form, icon: key })} />
            </div>
          </div>
          <BilingualField
            label="Title (e.g. কাউন্সেলিং সেশন)"
            name="title"
            value={form.title}
            valueEn={form.titleEn}
            onChange={onChange}
          />
          <BilingualField
            label="Description (1-2 sentences)"
            name="description"
            value={form.description}
            valueEn={form.descriptionEn}
            onChange={onChange}
            type="textarea"
            rows={2}
          />
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="published"
              checked={form.published}
              onChange={onChange}
            />
            <span className="text-sm font-semibold text-brand-navy">Published (live on site)</span>
          </label>
        </div>
        <div className="flex gap-2 mt-5">
          <button
            type="submit"
            disabled={busy}
            className="bg-brand-teal hover:bg-brand-navy disabled:opacity-50 text-white font-semibold px-5 py-2 rounded text-sm"
          >
            {busy ? 'Saving…' : editingId ? 'Update step' : 'Add step'}
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
          Existing Steps ({steps.length})
        </h2>
        {loading ? (
          <p className="p-5 text-brand-slate text-sm">Loading…</p>
        ) : sortedSteps.length === 0 ? (
          <p className="p-5 text-brand-slate text-sm">No steps yet.</p>
        ) : (
          <ul className="divide-y divide-brand-tealLight/30">
            {sortedSteps.map((s, idx) => {
              const Icon = ICON_BY_KEY[s.icon] || Compass;
              return (
                <li key={s.id} className="flex items-start gap-4 p-4 hover:bg-brand-tealLight/5">
                  <div className="flex flex-col items-center gap-0.5 pt-1">
                    <button
                      type="button"
                      onClick={() => move(s, 'up')}
                      disabled={idx === 0}
                      className="text-brand-slate hover:text-brand-teal disabled:opacity-20"
                      aria-label="Move up"
                    >
                      <ChevronUp size={16} />
                    </button>
                    <GripVertical size={14} className="text-brand-slate/30" />
                    <button
                      type="button"
                      onClick={() => move(s, 'down')}
                      disabled={idx === sortedSteps.length - 1}
                      className="text-brand-slate hover:text-brand-teal disabled:opacity-20"
                      aria-label="Move down"
                    >
                      <ChevronDown size={16} />
                    </button>
                  </div>

                  <span className="bg-brand-teal/10 text-brand-teal font-bold rounded-full w-9 h-9 flex items-center justify-center flex-shrink-0 text-sm">
                    {String(s.stepNumber).padStart(2, '0')}
                  </span>

                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-brand-navy/5 text-brand-navy">
                    <Icon size={18} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <p className="font-semibold text-brand-navy text-sm">{s.title}</p>
                      {s.titleEn && (
                        <span className="text-xs text-brand-slate font-normal italic">/ {s.titleEn}</span>
                      )}
                      {!s.published && (
                        <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-amber-800">
                          Draft
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-brand-slate mt-0.5 line-clamp-2">{s.description}</p>
                  </div>

                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <button
                      onClick={() => togglePublish(s)}
                      className={`text-[11px] font-semibold ${
                        s.published ? 'text-brand-teal hover:text-brand-navy' : 'text-amber-700 hover:text-amber-900'
                      }`}
                    >
                      {s.published ? 'Unpublish' : 'Publish'}
                    </button>
                    <button
                      onClick={() => edit(s)}
                      className="text-[11px] text-brand-navy font-semibold hover:text-brand-teal"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => remove(s.id)}
                      className="text-[11px] text-red-500 font-semibold hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

// EN: Visual icon picker — admin sees the actual lucide icons rather than a
//     plain text dropdown, so the choice is obvious.
// BN: Visual icon picker — admin plain text dropdown-এর বদলে আসল lucide icon
//     দেখে, choice বুঝতে সহজ।
function IconPicker({ value, onChange }) {
  return (
    <div className="grid grid-cols-6 gap-2 sm:grid-cols-10">
      {ICON_OPTIONS.map(({ key, Icon, label }) => {
        const active = key === value;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            title={label}
            aria-label={label}
            className={`flex flex-col items-center gap-1 rounded-md border px-2 py-2 text-[10px] transition ${
              active
                ? 'border-brand-teal bg-brand-teal/10 text-brand-teal-700'
                : 'border-brand-tealLight/40 bg-white text-brand-slate hover:border-brand-teal/50'
            }`}
          >
            <Icon size={18} />
            <span className="truncate max-w-full">{label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default HowItWorksManage;
