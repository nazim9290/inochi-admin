// EN: Blogs management page — lists pending (draft) and published blogs in
//     two tabs. Pending tab reuses <PendingBlogs/> for approve + FB-post.
//     Published tab adds Edit + Delete + Unpublish so admin can keep posts
//     up-to-date without touching the database. Backend endpoints already
//     exist; this is the missing UI.
// BN: Blog manage page — pending (draft) ও published blog দুই tab-এ। Pending
//     tab-এ <PendingBlogs/> reuse — approve + FB-post। Published tab-এ Edit +
//     Delete + Unpublish — admin database-এ হাত না দিয়েই post update রাখতে
//     পারে। Backend endpoint আগেই আছে, শুধু UI টা missing ছিল।

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInterceptor from '../axios/axiosInterceptor';
import BilingualField from '../components/BilingualField';
import PendingBlogs from '../components/PendingBlogs';

const labelClass = 'block text-sm font-semibold text-brand-navy mb-1';
const fieldClass =
  'w-full px-3 py-2 border border-brand-tealLight/60 rounded focus:outline-none focus:ring-2 focus:ring-brand-teal/40';

const emptyForm = {
  title: '',
  titleEn: '',
  content: '',
  contentEn: '',
  category: '',
  categoryEn: '',
};

const CATEGORIES_BN = ['study', 'service', 'blogs', 'culture', 'news'];
const CATEGORIES_EN = [
  'Study in Japan',
  'Services',
  'Blog',
  'Culture',
  'News',
];

const BlogsManage = () => {
  const api = axiosInterceptor();

  const [tab, setTab] = useState('pending');
  const [pending, setPending] = useState([]);
  const [published, setPublished] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [image, setImage] = useState({});
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // EN: Single fetch for both lists — keeps tab counts honest after every action.
  // BN: এক ফাংশন থেকেই দুই list fetch — যেকোনো action-এর পর tab count ঠিক থাকে।
  const refresh = async () => {
    setLoading(true);
    try {
      const [pendingRes, publishedRes] = await Promise.all([
        api.get('/pending-blogs').catch(() => ({ data: { pendingBlogs: [] } })),
        api
          .get('/published-blogs')
          .catch(() => ({ data: { publishedBlogs: [] } })),
      ]);
      setPending(pendingRes.data?.pendingBlogs || []);
      setPublished(publishedRes.data?.publishedBlogs || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // EN: Reused upload endpoint — same as CreateBlogPage so cloudinary path stays uniform.
  // BN: একই upload endpoint — CreateBlogPage-এর সাথে cloudinary path একরকম।
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

  const startEdit = (b) => {
    setEditingId(b.id || b._id);
    setForm({
      title: b.title || '',
      titleEn: b.titleEn || '',
      content: b.content || '',
      contentEn: b.contentEn || '',
      category: b.category || '',
      categoryEn: b.categoryEn || '',
    });
    setImage(b.image || {});
    setMessage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
    setImage({});
    setMessage(null);
  };

  const saveEdit = async () => {
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
      await api.put(`/update-blog/${editingId}`, { ...form, image });
      setMessage({ kind: 'ok', text: '✓ Blog সফলভাবে update হয়েছে।' });
      cancelEdit();
      await refresh();
    } catch (err) {
      console.error(err);
      setMessage({ kind: 'error', text: 'Update হয়নি — আবার চেষ্টা করুন।' });
    } finally {
      setSubmitting(false);
    }
  };

  const removeBlog = async (id) => {
    if (!confirm('এই blog post-টি delete করবেন? এটা undo করা যাবে না।')) return;
    try {
      await api.delete(`/blog/${id}`);
      setMessage({ kind: 'ok', text: '✓ Blog delete হয়েছে।' });
      await refresh();
    } catch (err) {
      console.error(err);
      setMessage({ kind: 'error', text: 'Delete হয়নি।' });
    }
  };

  // EN: Unpublish flips status back to 'draft' — useful when admin spots a typo
  //     after publishing and wants to hide it from the public site while editing.
  // BN: Unpublish — status আবার 'draft' করে দেয়। Publish করার পর typo দেখলে
  //     edit করার সময় public site থেকে hide রাখার জন্য কাজে লাগে।
  const unpublish = async (id) => {
    if (!confirm('এই blog public site থেকে hide করবেন (Draft-এ ফেরত)?')) return;
    try {
      await api.put(`/update-blog/${id}`, { status: 'draft' });
      setMessage({ kind: 'ok', text: '✓ Draft-এ ফেরত পাঠানো হয়েছে।' });
      await refresh();
    } catch (err) {
      console.error(err);
      setMessage({ kind: 'error', text: 'Unpublish হয়নি।' });
    }
  };

  // EN: Pending tab uses existing <PendingBlogs/> which manages its own approve
  //     state. We only inject delete here, then refresh.
  // BN: Pending tab existing <PendingBlogs/> ব্যবহার করে — approve নিজের state।
  //     আমরা শুধু delete inject করি, তারপর refresh।
  const handlePendingDelete = async (id) => {
    if (!confirm('এই pending blog delete করবেন?')) return;
    try {
      await api.delete(`/blog/${id}`);
      await refresh();
    } catch (err) {
      console.error(err);
      setMessage({ kind: 'error', text: 'Delete হয়নি।' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-brand-tealLight/40 p-5">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-brand-navy">
              Blog Manage
            </h1>
            <p className="text-xs text-brand-slate mt-1 max-w-xl">
              Pending blog approve করুন, published blog edit/delete করুন। নতুন
              blog তৈরি করতে পাশের{' '}
              <Link
                to="/create-blog"
                className="font-semibold text-brand-teal hover:text-brand-navy underline"
              >
                + New Blog
              </Link>{' '}
              page-এ যান।
            </p>
          </div>
          <Link
            to="/create-blog"
            className="bg-brand-teal hover:bg-brand-navy text-white text-sm font-semibold px-4 py-2 rounded transition-colors whitespace-nowrap"
          >
            + New Blog
          </Link>
        </div>

        {message && (
          <p
            className={`text-sm rounded px-3 py-2 mt-4 ${
              message.kind === 'ok'
                ? 'bg-brand-tealLight/30 text-brand-navy border border-brand-teal/40'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {message.text}
          </p>
        )}
      </div>

      {/* Edit form — appears above tabs when editing a published blog */}
      {editingId && (
        <div className="bg-white rounded-xl shadow-sm border border-brand-teal/60 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-brand-navy">
              Blog Edit করছেন
            </h2>
            <button
              type="button"
              onClick={cancelEdit}
              className="text-sm text-brand-slate hover:text-brand-navy underline"
            >
              Cancel
            </button>
          </div>

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
              <label className={labelClass}>Cover Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="block w-full text-sm text-brand-slate file:mr-3 file:py-2 file:px-4 file:rounded file:border-0 file:bg-brand-tealLight/30 file:text-brand-navy file:font-semibold hover:file:bg-brand-tealLight/50"
              />
              {uploading && (
                <p className="text-xs text-brand-slate mt-1">Uploading…</p>
              )}
              {image?.url && (
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
                <select
                  name="category"
                  value={form.category}
                  onChange={onChange}
                  className={fieldClass}
                >
                  <option value="" disabled>
                    Category বেছে নিন
                  </option>
                  {CATEGORIES_BN.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className={labelClass}>Category (English)</span>
                <select
                  name="categoryEn"
                  value={form.categoryEn}
                  onChange={onChange}
                  className={fieldClass}
                >
                  <option value="">Select category</option>
                  {CATEGORIES_EN.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
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
                onClick={saveEdit}
                disabled={submitting}
                className="bg-brand-teal hover:bg-brand-navy text-white font-semibold px-6 py-2 rounded transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? 'Saving…' : 'Update Blog'}
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                className="bg-white border border-brand-navy text-brand-navy font-semibold px-6 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-brand-tealLight/40 overflow-hidden">
        <div className="flex border-b border-brand-tealLight/40">
          <TabButton
            active={tab === 'pending'}
            onClick={() => setTab('pending')}
            label="Pending"
            count={pending.length}
            tone="warn"
          />
          <TabButton
            active={tab === 'published'}
            onClick={() => setTab('published')}
            label="Published"
            count={published.length}
            tone="ok"
          />
        </div>

        <div className="p-5">
          {loading ? (
            <p className="text-sm text-brand-slate text-center py-10">
              Loading…
            </p>
          ) : tab === 'pending' ? (
            pending.length === 0 ? (
              <EmptyState
                text="কোন pending blog নেই। সব approved।"
                cta={{ to: '/create-blog', label: '+ নতুন Blog তৈরি করুন' }}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pending.map((b) => (
                  <PendingBlogs
                    key={b.id || b._id}
                    data={b}
                    handleDelete={() => handlePendingDelete(b.id || b._id)}
                  />
                ))}
              </div>
            )
          ) : published.length === 0 ? (
            <EmptyState text="কোন published blog নেই।" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {published.map((b) => (
                <PublishedCard
                  key={b.id || b._id}
                  data={b}
                  onEdit={() => startEdit(b)}
                  onDelete={() => removeBlog(b.id || b._id)}
                  onUnpublish={() => unpublish(b.id || b._id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// EN: Tab pill — count chip uses warn (amber) for pending, ok (teal) for published.
// BN: Tab pill — count chip pending-এ warn (amber), published-এ ok (teal)।
const TabButton = ({ active, onClick, label, count, tone }) => {
  const base =
    'flex-1 px-5 py-3 text-sm font-bold transition-colors flex items-center justify-center gap-2';
  const activeCls = 'bg-brand-tealLight/30 text-brand-navy';
  const idleCls = 'text-brand-slate hover:bg-brand-tealLight/10';
  const chipBase = 'rounded-full px-2 py-0.5 text-[10px] font-bold';
  const chipCls =
    tone === 'warn'
      ? 'bg-amber-100 text-amber-800'
      : 'bg-brand-teal/15 text-brand-teal';
  return (
    <button onClick={onClick} className={`${base} ${active ? activeCls : idleCls}`}>
      {label}
      <span className={`${chipBase} ${chipCls}`}>{count}</span>
    </button>
  );
};

// EN: Card for already-published blogs — shows cover, meta, snippet, then
//     Edit / Unpublish / Delete. No approve here (already approved).
// BN: Published blog-এর কার্ড — cover, meta, snippet, তারপর Edit / Unpublish /
//     Delete। এখানে approve নাই (already approved)।
const PublishedCard = ({ data, onEdit, onDelete, onUnpublish }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-brand-tealLight/40 overflow-hidden flex flex-col">
      {data.image?.url ? (
        <div className="relative w-full aspect-video bg-brand-tealLight/10">
          <img
            src={data.image.url}
            alt={data.title || 'Blog cover'}
            className="w-full h-full object-cover"
          />
          <span className="absolute top-2 right-2 bg-brand-teal text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
            Published
          </span>
        </div>
      ) : (
        <div className="w-full aspect-video bg-brand-tealLight/10 flex items-center justify-center text-xs text-brand-slate">
          কোনো cover image নাই
        </div>
      )}
      <div className="p-4 space-y-3 flex-1 flex flex-col">
        {data.category && (
          <p className="text-xs uppercase font-semibold text-brand-teal">
            {data.category}
            {data.categoryEn && (
              <span className="text-brand-slate"> · {data.categoryEn}</span>
            )}
          </p>
        )}
        {data.title && (
          <p className="font-semibold text-brand-navy line-clamp-2">
            {data.title}
          </p>
        )}
        {data.titleEn && (
          <p className="text-xs text-brand-slate italic line-clamp-1">
            {data.titleEn}
          </p>
        )}
        {data.content && (
          <p
            className="text-sm text-brand-slate line-clamp-3"
            dangerouslySetInnerHTML={{ __html: data.content }}
          />
        )}
        <div className="text-[11px] text-brand-slate/70 mt-auto">
          {data.createdAt
            ? new Date(data.createdAt).toLocaleDateString('en-GB')
            : ''}
          {data.author?.name && <> · {data.author.name}</>}
        </div>
        <div className="flex gap-2 pt-1">
          <button
            onClick={onEdit}
            className="flex-1 bg-brand-tealLight/30 hover:bg-brand-teal hover:text-white text-brand-navy text-sm font-semibold py-1.5 rounded transition-colors"
          >
            ✏️ Edit
          </button>
          <button
            onClick={onUnpublish}
            className="bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-sm font-semibold py-1.5 px-3 rounded transition-colors"
            title="Unpublish — public site থেকে hide করে draft-এ ফেরত পাঠাবে"
          >
            ⤺
          </button>
          <button
            onClick={onDelete}
            className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-sm font-semibold py-1.5 px-3 rounded transition-colors"
          >
            🗑
          </button>
        </div>
      </div>
    </div>
  );
};

const EmptyState = ({ text, cta }) => (
  <div className="text-center py-10">
    <p className="text-sm text-brand-slate">{text}</p>
    {cta && (
      <Link
        to={cta.to}
        className="inline-block mt-3 bg-brand-teal hover:bg-brand-navy text-white text-sm font-semibold px-4 py-2 rounded transition-colors"
      >
        {cta.label}
      </Link>
    )}
  </div>
);

export default BlogsManage;
