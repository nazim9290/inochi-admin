import { useEffect, useState } from 'react';
import axiosInterceptor from '../axios/axiosInterceptor';
import SeminerCard from '../components/SeminerCard.jsx';

const labelClass = 'block text-sm font-semibold text-brand-navy mb-1';
const fieldClass = 'w-full px-3 py-2 border border-brand-tealLight/60 rounded focus:outline-none focus:ring-2 focus:ring-brand-teal/40';

const UpdateSeson = () => {
  const [form, setForm] = useState({ title: '', subtitle: '', date: '', time: '' });
  const [image, setImage] = useState({});
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [seminars, setSeminars] = useState([]);
  const api = axiosInterceptor();

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const fetchSeminars = async () => {
    try {
      const { data } = await api.get('/seminar');
      setSeminars(data?.seminer || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSeminars();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const upload = async (e) => {
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
      console.error(err);
      setMessage({ kind: 'error', text: 'Upload failed.' });
    } finally {
      setUploading(false);
    }
  };

  const submit = async () => {
    if (!form.title || !form.date) {
      setMessage({ kind: 'error', text: 'Title and date are required.' });
      return;
    }
    setSubmitting(true);
    setMessage(null);
    try {
      await api.post('/seminar-create', { image, ...form });
      setMessage({ kind: 'ok', text: 'Session created!' });
      setForm({ title: '', subtitle: '', date: '', time: '' });
      setImage({});
      fetchSeminars();
    } catch (err) {
      console.error(err);
      setMessage({ kind: 'error', text: 'Could not create session.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-sm border border-brand-tealLight/40 p-6 sm:p-8 max-w-2xl mx-auto">
        <h1 className="text-2xl font-extrabold text-brand-navy text-center mb-6">Create a Session</h1>

        {message && (
          <p className={`text-sm rounded px-3 py-2 mb-4 ${
            message.kind === 'ok'
              ? 'bg-brand-tealLight/30 text-brand-navy border border-brand-teal/40'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message.text}
          </p>
        )}

        <div className="space-y-4">
          <div>
            <label className={labelClass}>Title</label>
            <input type="text" value={form.title} onChange={set('title')} className={fieldClass} />
          </div>
          <div>
            <label className={labelClass}>Subtitle</label>
            <input type="text" value={form.subtitle} onChange={set('subtitle')} className={fieldClass} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Date</label>
              <input type="date" value={form.date} onChange={set('date')} className={fieldClass} />
            </div>
            <div>
              <label className={labelClass}>Time</label>
              <input type="text" value={form.time} onChange={set('time')} placeholder="7:00 PM" className={fieldClass} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Cover image</label>
            <input
              type="file"
              accept="image/*"
              onChange={upload}
              className="block w-full text-sm text-brand-slate file:mr-3 file:py-2 file:px-4 file:rounded file:border-0 file:bg-brand-tealLight/30 file:text-brand-navy file:font-semibold hover:file:bg-brand-tealLight/50"
            />
            {uploading && <p className="text-xs text-brand-slate mt-1">Uploading…</p>}
            {image.url && <img src={image.url} alt="" className="mt-2 max-h-40 rounded border border-brand-tealLight/30" />}
          </div>
          <button
            type="button"
            onClick={submit}
            disabled={submitting}
            className="bg-brand-teal hover:bg-brand-navy text-white font-semibold px-6 py-2 rounded transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? 'Saving…' : 'Create session'}
          </button>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-extrabold text-brand-navy text-center mb-4">Existing Sessions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {seminars.map((s) => (
            <SeminerCard key={s.id || s._id} data={s} onDeleted={fetchSeminars} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default UpdateSeson;
