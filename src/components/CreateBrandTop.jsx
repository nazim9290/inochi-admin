import { useState } from 'react';
import axiosInterceptor from '../axios/axiosInterceptor';
import { useNavigate } from 'react-router-dom';

const CreateBrandTop = () => {
  const [image, setImage] = useState({});
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);
  const api = axiosInterceptor();
  const navigate = useNavigate();

  const handleImageChange = async (e) => {
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
        setMessage({ kind: 'ok', text: 'Image uploaded.' });
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

  const handleSubmit = async () => {
    if (!image.url) {
      setMessage({ kind: 'error', text: 'Please upload an image first.' });
      return;
    }
    try {
      await api.post('/brand', { image });
      setMessage({ kind: 'ok', text: 'Brand created!' });
      navigate('/create-brand');
    } catch (err) {
      console.error(err);
      setMessage({ kind: 'error', text: 'Could not create brand.' });
    }
  };

  return (
    <div className="bg-white rounded-xl border border-brand-tealLight/40 shadow-sm p-6 max-w-md mx-auto space-y-4">
      <div>
        <label className="block text-sm font-semibold text-brand-navy mb-1">Brand Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="block w-full text-sm text-brand-slate file:mr-3 file:py-2 file:px-4 file:rounded file:border-0 file:bg-brand-tealLight/30 file:text-brand-navy file:font-semibold hover:file:bg-brand-tealLight/50"
        />
      </div>

      {image.url && (
        <img src={image.url} alt="Brand preview" className="w-full max-h-48 object-contain border border-brand-tealLight/30 rounded" />
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={uploading}
        className="w-full bg-brand-teal hover:bg-brand-navy text-white font-semibold px-4 py-2 rounded transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {uploading ? 'Uploading…' : 'Create Brand'}
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

export default CreateBrandTop;
