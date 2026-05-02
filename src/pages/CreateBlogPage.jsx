// EN: Blog creation page — bilingual rich-text content (TipTap) with image
//     crop on cover and inside the body, plus auto-translate buttons. Output
//     is saved as HTML so the public PostBody renders it directly.
// BN: Blog তৈরির পেজ — bilingual rich-text content (TipTap), cover ও body-র
//     image crop সহ, এবং auto-translate button। Output HTML হিসেবে save হয়
//     যাতে public PostBody সরাসরি render করতে পারে।

import { useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInterceptor from '../axios/axiosInterceptor';
import BilingualField from '../components/BilingualField';
import BilingualRichEditor from '../components/editor/BilingualRichEditor';
import ImageCropModal from '../components/editor/ImageCropModal';

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
  const [coverFile, setCoverFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const api = axiosInterceptor();

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const setContent = (html) => setForm((f) => ({ ...f, content: html }));
  const setContentEn = (html) => setForm((f) => ({ ...f, contentEn: html }));

  // EN: Cover image goes through the same crop modal as in-body images so the
  //     admin can frame it properly before upload.
  // BN: Cover image-ও body-র image-এর মতো crop modal-এ যায় — upload-এর
  //     আগে admin ঠিকঠাক frame করতে পারে।
  const onCoverPicked = (e) => {
    const f = e.target.files?.[0];
    if (f) setCoverFile(f);
    e.target.value = '';
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.category || !form.content.trim()) {
      setMessage({
        kind: 'error',
        text: 'Title (Bangla), category এবং content (Bangla) দেওয়া আবশ্যক।',
      });
      return;
    }
    setSubmitting(true);
    setMessage(null);
    try {
      const { data } = await api.post('/create-blog', { image, ...form });
      if (data?.error) {
        setMessage({
          kind: 'error',
          text: 'Blog তৈরি হয়নি — আবার চেষ্টা করুন।',
        });
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
    <div className="max-w-5xl bg-white rounded-xl shadow-sm border border-brand-tealLight/40 p-6">
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
            onChange={onCoverPicked}
            className="block w-full text-sm text-brand-slate file:mr-3 file:py-2 file:px-4 file:rounded file:border-0 file:bg-brand-tealLight/30 file:text-brand-navy file:font-semibold hover:file:bg-brand-tealLight/50"
          />
          <p className="text-[11px] text-brand-slate mt-1">
            ছবি বেছে নিলে crop করার window আসবে।
          </p>
          {image.url && (
            <img
              src={image.url}
              alt="Preview"
              className="mt-2 max-h-40 rounded border border-brand-tealLight/30"
            />
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

        <BilingualRichEditor
          label="বিষয়বস্তু / Content"
          hint="Toolbar থেকে formatting, ছবি ও link বসাতে পারবেন। উপরের অনুবাদ button দিয়ে অপর ভাষায় draft বানিয়ে নিতে পারেন।"
          value={form.content}
          valueEn={form.contentEn}
          onChange={setContent}
          onChangeEn={setContentEn}
          placeholderBn="পুরো লেখা এখানে লিখুন…"
          placeholderEn="Write the full article here…"
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

      {coverFile && (
        <ImageCropModal
          file={coverFile}
          onCancel={() => setCoverFile(null)}
          onUploaded={(uploaded) => {
            setImage(uploaded);
            setCoverFile(null);
          }}
        />
      )}
    </div>
  );
};

export default CreateBlogPage;
