import { useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInterceptor from '../axios/axiosInterceptor';
import BilingualField from '../components/BilingualField';

const labelClass = 'block text-sm font-semibold text-brand-navy mb-1';
const fieldClass =
  'w-full px-3 py-2 border border-brand-tealLight/60 rounded focus:outline-none focus:ring-2 focus:ring-brand-teal/40';

const empty = {
  title: '',
  titleEn: '',
  content: '',
  contentEn: '',
  category: '',
  categoryEn: '',
};

const CreateBlogPage = () => {
  const [form, setForm] = useState(empty);
  const [image, setImage] = useState({});
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const api = axiosInterceptor();

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

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
      setMessage({ kind: 'error', text: 'ছবি upload হয়নি — আবার চেষ্টা করুন।' });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.category || !form.content.trim()) {
      setMessage({ kind: 'error', text: 'Title (Bangla), category এবং content (Bangla) দেওয়া আবশ্যক।' });
      return;
    }
    setSubmitting(true);
    setMessage(null);
    try {
      const { data } = await api.post('/create-blog', { image, ...form });
      if (data?.error) {
        setMessage({ kind: 'error', text: 'Blog তৈরি হয়নি — আবার চেষ্টা করুন।' });
      } else {
        setMessage({
          kind: 'ok',
          text: '✓ Blog সফলভাবে তৈরি হয়েছে। এখন Pending থেকে Approve করতে হবে।',
          link: { to: '/blogs-manage', label: 'Pending Blogs দেখুন →' },
        });
        setForm(empty);
        setImage({});
      }
    } catch (err) {
      console.error('Error:', err);
      setMessage({ kind: 'error', text: 'Blog তৈরি হয়নি।' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl bg-white rounded-xl shadow-sm border border-brand-tealLight/40 p-6">
      <h1 className="text-2xl font-extrabold text-brand-navy mb-1">নতুন Blog তৈরি করুন</h1>
      <p className="text-xs text-brand-slate mb-6">
        Title ও Description দুই ভাষাতেই দিন। Cover image upload করুন। তৈরি হলে &quot;Pending Blogs&quot; এ যাবে — সেখান থেকে Approve করুন।
      </p>

      {message && (
        <div
          className={`text-sm rounded px-3 py-2 mb-4 flex items-center justify-between gap-3 flex-wrap ${
            message.kind === 'ok'
              ? 'bg-brand-tealLight/30 text-brand-navy border border-brand-teal/40'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          <span>{message.text}</span>
          {message.link && (
            <Link
              to={message.link.to}
              className="font-bold text-brand-teal hover:text-brand-navy underline whitespace-nowrap"
            >
              {message.link.label}
            </Link>
          )}
        </div>
      )}

      <div className="space-y-4">
        <BilingualField
          label="শিরোনাম / Title"
          name="title"
          value={form.title}
          valueEn={form.titleEn}
          onChange={onChange}
          placeholderBn="জাপানে স্কলারশিপ পাবার গাইড"
          placeholderEn="A guide to scholarships in Japan"
        />

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label>
            <span className={labelClass}>Category (Bangla)</span>
            <select name="category" value={form.category} onChange={onChange} className={fieldClass}>
              <option value="" disabled>Category বেছে নিন</option>
              <option value="study">জাপানে পড়াশোনা</option>
              <option value="service">সেবা</option>
              <option value="blogs">ব্লগ</option>
              <option value="culture">সংস্কৃতি</option>
              <option value="news">সংবাদ</option>
            </select>
          </label>
          <label>
            <span className={labelClass}>Category (English)</span>
            <select name="categoryEn" value={form.categoryEn} onChange={onChange} className={fieldClass}>
              <option value="">Select category</option>
              <option value="Study in Japan">Study in Japan</option>
              <option value="Services">Services</option>
              <option value="Blog">Blog</option>
              <option value="Culture">Culture</option>
              <option value="News">News</option>
            </select>
          </label>
        </div>

        <BilingualField
          label="বিষয়বস্তু / Content"
          name="content"
          value={form.content}
          valueEn={form.contentEn}
          onChange={onChange}
          type="textarea"
          rows={10}
          placeholderBn="পুরো লেখা এখানে লিখুন। HTML tag (<p>, <strong>, <h2>) ব্যবহার করতে পারেন।"
          placeholderEn="Write the full article here. HTML tags supported."
        />

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-brand-teal hover:bg-brand-navy text-white font-semibold px-6 py-2 rounded transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? 'Saving…' : 'Blog তৈরি করুন'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateBlogPage;
