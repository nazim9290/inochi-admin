import { useState } from 'react';
import axiosInterceptor from '../axios/axiosInterceptor';
import { useNavigate } from 'react-router-dom';

const labelClass = 'block text-sm font-semibold text-brand-navy mb-1';

const CreateServiceTop = () => {
  const [image, setImage] = useState({});
  const [selected, setSelected] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);
  const api = axiosInterceptor();
  const navigate = useNavigate();

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

  const toggle = (value) => {
    setSelected((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));
  };

  const submit = async () => {
    if (!image.url) {
      setMessage({ kind: 'error', text: 'Please upload an image first.' });
      return;
    }
    try {
      await api.post('/create-carusel', { image, category: 'service', selected });
      setMessage({ kind: 'ok', text: 'Service page created!' });
      navigate('/create-crusel');
    } catch (err) {
      console.error(err);
      setMessage({ kind: 'error', text: 'Could not create service page.' });
    }
  };

  return (
    <div className="bg-white rounded-xl border border-brand-tealLight/40 shadow-sm p-6 max-w-md mx-auto space-y-4">
      <div>
        <label className={labelClass}>Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={upload}
          className="block w-full text-sm text-brand-slate file:mr-3 file:py-2 file:px-4 file:rounded file:border-0 file:bg-brand-tealLight/30 file:text-brand-navy file:font-semibold hover:file:bg-brand-tealLight/50"
        />
        {image.url && <img src={image.url} alt="" className="mt-2 max-h-40 rounded border border-brand-tealLight/30" />}
      </div>

      <div>
        <label className={labelClass}>Show this service in</label>
        <div className="space-y-1">
          {[
            ['blogs', 'Blogs section'],
            ['study', 'Study section'],
            ['service', 'Services section'],
          ].map(([value, label]) => (
            <label key={value} className="flex items-center gap-2 text-sm text-brand-slate">
              <input type="checkbox" checked={selected.includes(value)} onChange={() => toggle(value)} className="accent-brand-teal" />
              {label}
            </label>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={submit}
        disabled={uploading || !image.url}
        className="w-full bg-brand-teal hover:bg-brand-navy text-white font-semibold px-4 py-2 rounded transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {uploading ? 'Uploading…' : 'Create'}
      </button>

      {message && (
        <p className={`text-sm rounded px-3 py-2 ${
          message.kind === 'ok'
            ? 'bg-brand-tealLight/30 text-brand-navy border border-brand-teal/40'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.text}
        </p>
      )}
    </div>
  );
};

export default CreateServiceTop;
