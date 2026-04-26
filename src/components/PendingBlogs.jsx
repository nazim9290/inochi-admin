import { useState } from 'react';
import axiosInterceptor from '../axios/axiosInterceptor';

const PendingBlogs = ({ data, handleDelete }) => {
  const [tags, setTags] = useState({ blogs: false, study: false, service: false });
  const [submitting, setSubmitting] = useState(false);
  const api = axiosInterceptor();

  const toggle = (tag) => setTags({ ...tags, [tag]: !tags[tag] });

  const approve = async () => {
    setSubmitting(true);
    try {
      await api.put(`/approve-blog/${data.id || data._id}`, { tags, status: 'published' });
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
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
        {data.category && <p className="text-xs uppercase font-semibold text-brand-teal">{data.category}</p>}
        {data.title && <p className="font-semibold text-brand-navy line-clamp-2">{data.title}</p>}
        {data.content && <p className="text-sm text-brand-slate line-clamp-3" dangerouslySetInnerHTML={{ __html: data.content }} />}

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
          <button onClick={handleDelete} className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-sm font-semibold py-1.5 rounded transition-colors">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default PendingBlogs;
