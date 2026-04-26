import { useEffect, useState } from 'react';
import axiosInterceptor from '../axios/axiosInterceptor';
import TeamCard from '../components/TeamCard.jsx';

const labelClass = 'block text-sm font-semibold text-brand-navy mb-1';
const fieldClass = 'w-full px-3 py-2 border border-brand-tealLight/60 rounded focus:outline-none focus:ring-2 focus:ring-brand-teal/40';

const TeamCreate = () => {
  const [form, setForm] = useState({
    name: '',
    designation: '',
    facebook: '',
    twiter: '',
    youtube: '',
    linkdin: '',
    email: '',
    position: 0,
  });
  const [image, setImage] = useState({});
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [teams, setTeams] = useState([]);

  const api = axiosInterceptor();

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

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
      setMessage({ kind: 'error', text: 'Name and designation are required.' });
      return;
    }
    setSubmitting(true);
    setMessage(null);
    try {
      await api.post('/team-create', { image, ...form, position: Number(form.position) });
      setMessage({ kind: 'ok', text: 'Team member created!' });
      setForm({ name: '', designation: '', facebook: '', twiter: '', youtube: '', linkdin: '', email: '', position: 0 });
      setImage({});
      fetchTeam();
    } catch (err) {
      console.error(err);
      setMessage({ kind: 'error', text: 'Could not create team member.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-sm border border-brand-tealLight/40 p-6 sm:p-8 max-w-3xl mx-auto">
        <h1 className="text-2xl font-extrabold text-brand-navy text-center mb-6">Create Team Member</h1>

        {message && (
          <p className={`text-sm rounded px-3 py-2 mb-4 ${
            message.kind === 'ok'
              ? 'bg-brand-tealLight/30 text-brand-navy border border-brand-teal/40'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message.text}
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Full name</label>
            <input type="text" value={form.name} onChange={set('name')} className={fieldClass} />
          </div>
          <div>
            <label className={labelClass}>Designation</label>
            <input type="text" value={form.designation} onChange={set('designation')} className={fieldClass} />
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input type="email" value={form.email} onChange={set('email')} className={fieldClass} />
          </div>
          <div>
            <label className={labelClass}>Position (sort order)</label>
            <input type="number" value={form.position} onChange={set('position')} className={fieldClass} />
          </div>
          <div>
            <label className={labelClass}>Facebook URL</label>
            <input type="url" value={form.facebook} onChange={set('facebook')} className={fieldClass} />
          </div>
          <div>
            <label className={labelClass}>Twitter URL</label>
            <input type="url" value={form.twiter} onChange={set('twiter')} className={fieldClass} />
          </div>
          <div>
            <label className={labelClass}>YouTube URL</label>
            <input type="url" value={form.youtube} onChange={set('youtube')} className={fieldClass} />
          </div>
          <div>
            <label className={labelClass}>LinkedIn URL</label>
            <input type="url" value={form.linkdin} onChange={set('linkdin')} className={fieldClass} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Profile photo</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImage}
              className="block w-full text-sm text-brand-slate file:mr-3 file:py-2 file:px-4 file:rounded file:border-0 file:bg-brand-tealLight/30 file:text-brand-navy file:font-semibold hover:file:bg-brand-tealLight/50"
            />
            {uploading && <p className="text-xs text-brand-slate mt-1">Uploading…</p>}
            {image.url && <img src={image.url} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded-full border-2 border-brand-tealLight" />}
          </div>
        </div>

        <button
          type="button"
          onClick={submit}
          disabled={submitting}
          className="mt-6 bg-brand-teal hover:bg-brand-navy text-white font-semibold px-6 py-2 rounded transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? 'Saving…' : 'Add team member'}
        </button>
      </div>

      <div>
        <h2 className="text-xl font-extrabold text-brand-navy text-center mb-4">Team Members</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {teams.map((t) => (
            <TeamCard key={t.id || t._id} data={t} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeamCreate;
