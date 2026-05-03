/**
 * EN: Admin page for the home-page video section. Admin pastes any YouTube
 *     URL form and adds optional bilingual title + description; frontend
 *     extracts the video ID and renders thumbnail/iframe automatically.
 * BN: Home page-এর video section-এর জন্য admin page। Admin যেকোনো YouTube
 *     URL paste + optional bilingual title + description দেয়; frontend
 *     video ID extract করে thumbnail/iframe automatically render করে।
 */
import { useEffect, useState } from 'react';
import axiosInterceptor from '../axios/axiosInterceptor';
import BilingualField from '../components/BilingualField';

const inputClass =
  'w-full px-3 py-2 text-sm border border-brand-tealLight/60 rounded focus:outline-none focus:ring-2 focus:ring-brand-teal/40';
const labelClass = 'block text-xs font-semibold text-brand-navy mb-1';

const empty = {
  youtubeUrl: '',
  title: '',
  titleEn: '',
  description: '',
  descriptionEn: '',
  thumbnailUrl: '',
  sortOrder: 0,
  published: true,
};

// EN: Extract YouTube ID from any URL form so we can preview the thumbnail
//     before save. Mirrors the frontend's extractYouTubeId logic (kept here
//     to avoid pulling cross-project utilities into the admin bundle).
// BN: Save করার আগে thumbnail preview দেখাতে যেকোনো URL form থেকে YouTube
//     ID extract। Frontend-এর extractYouTubeId-এর mirror — admin bundle-এ
//     cross-project util pull করতে হবে না।
function youtubeId(input) {
  if (!input) return null;
  const s = String(input).trim();
  if (/^[A-Za-z0-9_-]{11}$/.test(s)) return s;
  const patterns = [
    /youtu\.be\/([A-Za-z0-9_-]{11})/,
    /youtube\.com\/watch\?v=([A-Za-z0-9_-]{11})/,
    /youtube\.com\/embed\/([A-Za-z0-9_-]{11})/,
    /youtube\.com\/shorts\/([A-Za-z0-9_-]{11})/,
    /youtube\.com\/v\/([A-Za-z0-9_-]{11})/,
  ];
  for (const re of patterns) {
    const m = s.match(re);
    if (m) return m[1];
  }
  return null;
}

const HomeVideosManage = () => {
  const api = axiosInterceptor();
  const [videos, setVideos] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);

  const load = async () => {
    try {
      const { data } = await api.get('/home-videos?all=true');
      setVideos(data.videos || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]:
        type === 'checkbox' ? checked : name === 'sortOrder' ? Number(value) : value,
    });
  };

  const reset = () => {
    setForm(empty);
    setEditingId(null);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!youtubeId(form.youtubeUrl)) {
      alert(
        'YouTube URL ঠিক নাই — সঠিক YouTube link দিন (যেমন https://youtu.be/dQw4w9WgXcQ)।'
      );
      return;
    }
    try {
      if (editingId) await api.put(`/home-videos/${editingId}`, form);
      else await api.post('/home-videos', form);
      reset();
      load();
    } catch (err) {
      console.error(err);
      alert('Save failed — দেখুন console।');
    }
  };

  const edit = (v) => {
    setEditingId(v.id);
    setForm({ ...empty, ...v });
  };

  const remove = async (id) => {
    if (!confirm('এই video delete করবেন?')) return;
    await api.delete(`/home-videos/${id}`);
    load();
  };

  const previewId = youtubeId(form.youtubeUrl);

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-xl font-extrabold text-brand-navy">
          Home Videos / হোম পেজ ভিডিও
        </h1>
        <p className="text-xs text-brand-slate">
          হোম পেজে &quot;সফলতার গল্প&quot; section-এর পরে যেসব YouTube video দেখাবে।
          যেকোনো YouTube link paste করতে পারেন (watch URL, youtu.be, /shorts/) —
          frontend নিজেই embed করবে।
        </p>
      </div>

      <form
        onSubmit={submit}
        className="bg-white rounded-xl border border-brand-tealLight/40 shadow-sm p-5"
      >
        <h2 className="text-sm font-bold text-brand-navy uppercase tracking-wide mb-4">
          {editingId ? 'Edit Video' : 'Add Video'}
        </h2>

        <div className="space-y-4">
          <label className="block">
            <span className={labelClass}>YouTube URL</span>
            <input
              type="url"
              name="youtubeUrl"
              value={form.youtubeUrl}
              onChange={onChange}
              required
              placeholder="https://www.youtube.com/watch?v=... অথবা https://youtu.be/..."
              className={inputClass}
            />
            {previewId ? (
              <div className="mt-2 flex items-center gap-3">
                <img
                  src={`https://img.youtube.com/vi/${previewId}/mqdefault.jpg`}
                  alt="YouTube thumbnail preview"
                  className="h-16 w-28 rounded object-cover"
                />
                <span className="text-xs text-brand-teal-700">
                  ✓ Valid YouTube ID — <code className="font-mono">{previewId}</code>
                </span>
              </div>
            ) : form.youtubeUrl ? (
              <p className="mt-1 text-xs text-red-600">
                ⚠ এই URL থেকে YouTube ID extract করা যাচ্ছে না।
              </p>
            ) : null}
          </label>

          <BilingualField
            label="Title / শিরোনাম"
            name="title"
            value={form.title}
            valueEn={form.titleEn}
            onChange={onChange}
            placeholderBn="ছাত্রের সাফল্যের গল্প"
            placeholderEn="Student success story"
          />

          <BilingualField
            label="Description / বিবরণ"
            name="description"
            value={form.description}
            valueEn={form.descriptionEn}
            onChange={onChange}
            type="textarea"
            rows={3}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <label>
              <span className={labelClass}>Custom thumbnail URL (optional)</span>
              <input
                name="thumbnailUrl"
                value={form.thumbnailUrl}
                onChange={onChange}
                className={inputClass}
                placeholder="https://..."
              />
            </label>
            <label>
              <span className={labelClass}>Sort order</span>
              <input
                type="number"
                name="sortOrder"
                value={form.sortOrder}
                onChange={onChange}
                className={inputClass}
              />
            </label>
            <label className="flex items-center gap-2 pb-2">
              <input
                type="checkbox"
                name="published"
                checked={form.published}
                onChange={onChange}
              />
              <span className="text-xs text-brand-navy font-semibold">Published</span>
            </label>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <button
            type="submit"
            className="bg-brand-teal hover:bg-brand-navy text-white font-semibold px-5 py-2 rounded text-sm"
          >
            {editingId ? 'Update' : 'Add'} Video
          </button>
          {editingId && (
            <button
              type="button"
              onClick={reset}
              className="bg-white border border-brand-navy text-brand-navy font-semibold px-5 py-2 rounded text-sm"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="bg-white rounded-xl border border-brand-tealLight/40 shadow-sm overflow-hidden">
        <h2 className="text-sm font-bold text-brand-navy uppercase tracking-wide p-5 border-b border-brand-tealLight/40">
          Videos ({videos.length})
        </h2>
        {videos.length === 0 ? (
          <p className="p-5 text-brand-slate text-sm">কোনো video যোগ করা হয়নি।</p>
        ) : (
          <ul className="divide-y divide-brand-tealLight/30">
            {videos.map((v) => {
              const id = youtubeId(v.youtubeUrl);
              return (
                <li key={v.id} className="flex items-start gap-4 p-4">
                  {id ? (
                    <img
                      src={`https://img.youtube.com/vi/${id}/mqdefault.jpg`}
                      alt={v.title || 'Video'}
                      className="w-32 h-20 rounded object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-32 h-20 rounded bg-brand-tealLight/40 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-brand-navy text-sm">
                      {v.title || '(untitled)'}
                      {!v.published && (
                        <span className="ml-2 text-[10px] bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded uppercase">
                          Draft
                        </span>
                      )}
                    </p>
                    <a
                      href={v.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-brand-teal hover:underline truncate block"
                    >
                      {v.youtubeUrl}
                    </a>
                    {v.description && (
                      <p className="text-xs text-brand-slate mt-1 line-clamp-2">
                        {v.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => edit(v)}
                      className="text-xs text-brand-teal font-semibold hover:text-brand-navy"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => remove(v.id)}
                      className="text-xs text-red-500 font-semibold hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default HomeVideosManage;
