import { useState } from 'react';
import axiosInterceptor from '../axios/axiosInterceptor';

const labelClass = 'block text-sm font-semibold text-brand-navy mb-1';
const fieldClass = 'w-full px-3 py-2 border border-brand-tealLight/60 rounded focus:outline-none focus:ring-2 focus:ring-brand-teal/40';

const CreateBlogPage = () => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState({});
  const [content, setContent] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const api = axiosInterceptor();

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    setUploading(true);
    setMessage(null);
    try {
      const { data } = await api.post('/upload-image-file', formData);
      setImage({ url: data.url, public_id: data.public_id });
    } catch (err) {
      console.error('Upload error:', err);
      setMessage({ kind: 'error', text: 'Failed to upload image. Please try again.' });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !category || !content.trim()) {
      setMessage({ kind: 'error', text: 'Title, category and description are required.' });
      return;
    }
    setSubmitting(true);
    setMessage(null);
    try {
      const { data } = await api.post('/create-blog', { image, title, content, category });
      if (data?.error) {
        setMessage({ kind: 'error', text: 'Failed to create blog. Please try again.' });
      } else {
        setMessage({ kind: 'ok', text: 'Blog created successfully!' });
        setTitle('');
        setContent('');
        setCategory('');
        setImage({});
      }
    } catch (err) {
      console.error('Error:', err);
      setMessage({ kind: 'error', text: 'Failed to create blog. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-brand-tealLight/40 p-6 sm:p-8">
      <h1 className="text-2xl font-extrabold text-brand-navy text-center mb-6">Create a Blog</h1>

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
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className={fieldClass} />
        </div>

        <div>
          <label className={labelClass}>Cover Image (optional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="block w-full text-sm text-brand-slate file:mr-3 file:py-2 file:px-4 file:rounded file:border-0 file:bg-brand-tealLight/30 file:text-brand-navy file:font-semibold hover:file:bg-brand-tealLight/50"
          />
          {uploading && <p className="text-xs text-brand-slate mt-1">Uploading…</p>}
          {image.url && (
            <img src={image.url} alt="Preview" className="mt-2 max-h-40 rounded border border-brand-tealLight/30" />
          )}
        </div>

        <div>
          <label className={labelClass}>Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={fieldClass}>
            <option value="" disabled>Select a category</option>
            <option value="study">Study in Japan</option>
            <option value="service">Services</option>
            <option value="blogs">Blogs</option>
            <option value="culture">Culture</option>
            <option value="news">News</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>Description</label>
          <textarea
            rows={8}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write the article content here. HTML is supported."
            className={fieldClass}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-brand-teal hover:bg-brand-navy text-white font-semibold px-6 py-2 rounded transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? 'Submitting…' : 'Publish Blog'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateBlogPage;
