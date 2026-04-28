import { useState } from 'react';
import axiosInterceptor from '../axios/axiosInterceptor';

const PendingBlogs = ({ data, handleDelete }) => {
  const [tags, setTags] = useState({ blogs: false, study: false, service: false });
  const [submitting, setSubmitting] = useState(false);
  const [postingFb, setPostingFb] = useState(false);
  const [msg, setMsg] = useState(null);
  const api = axiosInterceptor();

  const toggle = (tag) => setTags({ ...tags, [tag]: !tags[tag] });

  const approve = async () => {
    setSubmitting(true);
    setMsg(null);
    try {
      await api.put(`/approve-blog/${data.id || data._id}`, { tags, status: 'published' });
      setMsg({ kind: 'ok', text: '✓ Approved + auto-posted to Facebook (যদি enabled থাকে)' });
    } catch (err) {
      console.error(err);
      setMsg({ kind: 'error', text: 'Approve failed।' });
    } finally {
      setSubmitting(false);
    }
  };

  const postToFb = async () => {
    setPostingFb(true);
    setMsg(null);
    try {
      const res = await api.post(`/blog/${data.id || data._id}/post-to-facebook`);
      setMsg({ kind: 'ok', text: `✓ Facebook-এ post হয়েছে (${res.data?.postId || ''})` });
    } catch (err) {
      const reason = err.response?.data?.error || 'Failed';
      setMsg({ kind: 'error', text: `Facebook post failed: ${reason}` });
    } finally {
      setPostingFb(false);
    }
  };

  if (!data) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-brand-tealLight/40 overflow-hidden">
      {data.image?.url && (
        <div className="relative w-full aspect-video bg-brand-tealLight/10">
          <img src={data.image.url} alt={data.title || 'Blog cover'} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="p-4 space-y-3">
        {data.category && (
          <p className="text-xs uppercase font-semibold text-brand-teal">
            {data.category}
            {data.categoryEn && <span className="text-brand-slate"> · {data.categoryEn}</span>}
          </p>
        )}
        {data.title && <p className="font-semibold text-brand-navy line-clamp-2">{data.title}</p>}
        {data.titleEn && <p className="text-xs text-brand-slate italic line-clamp-1">{data.titleEn}</p>}
        {data.content && (
          <p className="text-sm text-brand-slate line-clamp-3" dangerouslySetInnerHTML={{ __html: data.content }} />
        )}

        {msg && (
          <p
            className={`text-xs rounded px-2 py-1.5 ${
              msg.kind === 'ok'
                ? 'bg-brand-tealLight/30 text-brand-navy border border-brand-teal/40'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {msg.text}
          </p>
        )}

        <div className="flex flex-wrap gap-3 text-sm text-brand-slate">
          {['blogs', 'study', 'service'].map((tag) => (
            <label key={tag} className="flex items-center gap-1 capitalize">
              <input type="checkbox" checked={tags[tag]} onChange={() => toggle(tag)} className="accent-brand-teal" />
              {tag}
            </label>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={approve}
            disabled={submitting}
            className="flex-1 bg-brand-teal hover:bg-brand-navy text-white text-sm font-semibold py-1.5 rounded transition-colors disabled:opacity-60"
          >
            {submitting ? 'Approving…' : 'Approve'}
          </button>
          <button
            onClick={postToFb}
            disabled={postingFb}
            className="flex-1 bg-[#1877F2] hover:bg-[#0d5cba] text-white text-sm font-semibold py-1.5 rounded transition-colors disabled:opacity-60 flex items-center justify-center gap-1"
            title="Manually post this blog to Facebook page"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M22 12a10 10 0 10-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.3.2 2.3.2v2.5h-1.3c-1.3 0-1.7.8-1.7 1.6V12h2.9l-.5 2.9h-2.4v7A10 10 0 0022 12z" />
            </svg>
            {postingFb ? 'Posting…' : 'FB Post'}
          </button>
          <button
            onClick={handleDelete}
            className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-sm font-semibold py-1.5 px-3 rounded transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default PendingBlogs;
