import { useEffect, useState } from 'react';
import axiosInterceptor from '../axios/axiosInterceptor';
import TeamCard from '../components/TeamCard.jsx';
import BilingualField from '../components/BilingualField';
import { confirmDialog } from '../components/ConfirmDialog';
import HelpTooltip from '../components/HelpTooltip';

const labelClass = 'block text-sm font-semibold text-brand-navy mb-1';
const fieldClass =
  'w-full px-3 py-2 border border-brand-tealLight/60 rounded focus:outline-none focus:ring-2 focus:ring-brand-teal/40';

const empty = {
  name: '',
  nameEn: '',
  designation: '',
  designationEn: '',
  bio: '',
  bioEn: '',
  facebook: '',
  twiter: '',
  youtube: '',
  linkdin: '',
  email: '',
  position: 0,
};

const TeamCreate = () => {
  const [form, setForm] = useState(empty);
  const [image, setImage] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [teams, setTeams] = useState([]);

  const api = axiosInterceptor();

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: name === 'position' ? Number(value) : value });
  };

  const reset = () => {
    setForm(empty);
    setImage({});
    setEditingId(null);
  };

  const fetchTeam = async () => {
    try {
      const { data } = await api.get('/team-member');
      const sorted = [...(data.team || [])].sort((a, b) => a.position - b.position);
      setTeams(sorted);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTeam();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    setUploading(true);
    setMessage(null);
    try {
      const { data } = await api.post('/upload-image-file', formData);
      if (data?.url) {
        setImage({ url: data.url, public_id: data.public_id });
      } else {
        setMessage({ kind: 'error', text: 'Upload failed.' });
      }
    } catch (err) {
      console.error('Upload error:', err);
      setMessage({ kind: 'error', text: 'Upload failed.' });
    } finally {
      setUploading(false);
    }
  };

  const submit = async () => {
    if (!form.name || !form.designation) {
      setMessage({ kind: 'error', text: 'নাম ও পদবি (Bangla) দেওয়া আবশ্যক।' });
      return;
    }
    setSubmitting(true);
    setMessage(null);
    const payload = { ...form, position: Number(form.position) };
    if (image?.url) payload.image = image;
    try {
      if (editingId) {
        await api.put(`/team-member-update/${editingId}`, payload);
        setMessage({ kind: 'ok', text: '✓ টিম মেম্বার আপডেট হয়েছে।' });
      } else {
        await api.post('/team-create', payload);
        setMessage({ kind: 'ok', text: '✓ টিম মেম্বার যোগ হয়েছে।' });
      }
      reset();
      fetchTeam();
    } catch (err) {
      console.error(err);
      setMessage({ kind: 'error', text: 'Save failed — দয়া করে আবার চেষ্টা করুন।' });
    } finally {
      setSubmitting(false);
    }
  };

  const edit = (m) => {
    setEditingId(m.id || m._id);
    setForm({
      ...empty,
      name: m.name || '',
      nameEn: m.nameEn || '',
      designation: m.designation || '',
      designationEn: m.designationEn || '',
      bio: m.bio || '',
      bioEn: m.bioEn || '',
      facebook: m.facebook || '',
      twiter: m.twiter || '',
      youtube: m.youtube || '',
      linkdin: m.linkdin || '',
      email: m.email || '',
      position: m.position || 0,
    });
    setImage(m.image || {});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const remove = async (id) => {
    const ok = await confirmDialog({
      title: 'Team member delete?',
      message: 'এই টিম মেম্বার delete করতে চান?',
      confirmText: 'হ্যাঁ, delete',
      cancelText: 'বাতিল',
      danger: true,
    });
    if (!ok) return;
    try {
      await api.delete(`/team-member-delete/${id}`);
      fetchTeam();
    } catch (err) {
      alert('Delete failed');
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="bg-white rounded-xl shadow-sm border border-brand-tealLight/40 p-6">
        <h1 className="text-2xl font-extrabold text-brand-navy mb-1">
          {editingId ? 'Team Member Edit' : 'Team Member যোগ করুন'}
        </h1>
        <p className="text-xs text-brand-slate mb-6">
          নাম, পদবি, ছবি দুই ভাষাতেই দিন — সাইটে যেদিকে user যাবে সেই version দেখাবে।
        </p>

        {message && (
          <p
            className={`text-sm rounded px-3 py-2 mb-4 ${
              message.kind === 'ok'
                ? 'bg-brand-tealLight/30 text-brand-navy border border-brand-teal/40'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {message.text}
          </p>
        )}

        <div className="space-y-4">
          <BilingualField
            label="নাম / Name"
            name="name"
            value={form.name}
            valueEn={form.nameEn}
            onChange={onChange}
            placeholderBn="মো. মেহেদী হাসান"
            placeholderEn="Md. Mehedi Hasan"
          />
          <BilingualField
            label="পদবি / Designation"
            name="designation"
            value={form.designation}
            valueEn={form.designationEn}
            onChange={onChange}
            placeholderBn="সিনিয়র কাউন্সেলর"
            placeholderEn="Senior Counsellor"
          />
          <BilingualField
            label="বায়ো / Bio (optional)"
            name="bio"
            value={form.bio}
            valueEn={form.bioEn}
            onChange={onChange}
            type="textarea"
            rows={3}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label>
              <span className={labelClass}>ইমেইল</span>
              <input type="email" name="email" value={form.email} onChange={onChange} className={fieldClass} placeholder="name@example.com" />
            </label>
            <label>
              <span className={labelClass}>
                Position (sort order)
                <HelpTooltip>ছোট সংখ্যা = সাইটে আগে দেখাবে। CEO/Director-কে 0 বা 1 দিন; junior member-দের বেশি সংখ্যা।</HelpTooltip>
              </span>
              <input type="number" name="position" value={form.position} onChange={onChange} className={fieldClass} />
              <span className="text-[10px] text-brand-slate/70">ছোট সংখ্যা = সাইটে আগে দেখাবে</span>
            </label>
            <label>
              <span className={labelClass}>Facebook URL</span>
              <input type="url" name="facebook" value={form.facebook} onChange={onChange} className={fieldClass} placeholder="https://facebook.com/..." />
            </label>
            <label>
              <span className={labelClass}>Twitter URL</span>
              <input type="url" name="twiter" value={form.twiter} onChange={onChange} className={fieldClass} />
            </label>
            <label>
              <span className={labelClass}>YouTube URL</span>
              <input type="url" name="youtube" value={form.youtube} onChange={onChange} className={fieldClass} />
            </label>
            <label>
              <span className={labelClass}>LinkedIn URL</span>
              <input type="url" name="linkdin" value={form.linkdin} onChange={onChange} className={fieldClass} />
            </label>
          </div>

          <div>
            <label className={labelClass}>ছবি / Profile photo</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImage}
              className="block w-full text-sm text-brand-slate file:mr-3 file:py-2 file:px-4 file:rounded file:border-0 file:bg-brand-tealLight/30 file:text-brand-navy file:font-semibold hover:file:bg-brand-tealLight/50"
            />
            {uploading && <p className="text-xs text-brand-slate mt-1">Uploading…</p>}
            {image?.url && (
              <img src={image.url} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded-full border-2 border-brand-tealLight" />
            )}
            <p className="text-[11px] text-brand-slate/70 mt-1">
              Square photo রাখলে ভালো দেখায় (1:1 ratio)। JPG / PNG accepted।
            </p>
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <button
            type="button"
            onClick={submit}
            disabled={submitting}
            className="bg-brand-teal hover:bg-brand-navy text-white font-semibold px-6 py-2 rounded transition-colors disabled:opacity-60"
          >
            {submitting ? 'Saving…' : editingId ? 'Update Member' : 'Add Member'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={reset}
              className="bg-white border border-brand-navy text-brand-navy font-semibold px-6 py-2 rounded"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-extrabold text-brand-navy mb-4">
          Team Members ({teams.length})
        </h2>
        {teams.length === 0 ? (
          <p className="text-brand-slate text-sm bg-white rounded-xl border border-brand-tealLight/40 p-6 text-center">
            কোন team member যোগ করা হয়নি। উপরে form-এ পূরণ করে &quot;Add Member&quot; বাটনে ক্লিক করুন।
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {teams.map((t) => (
              <TeamCard
                key={t.id || t._id}
                data={t}
                onEdit={() => edit(t)}
                onDelete={() => remove(t.id || t._id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamCreate;
