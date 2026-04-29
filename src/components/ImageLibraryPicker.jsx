/**
 * EN: Cloudinary image library modal. Admin browses already-uploaded images,
 *     searches by filename/tag, paginates with a "Load more" button, and
 *     picks one — the parent's onPick(url) gets called with the Cloudinary
 *     secure_url. Closes on backdrop click or Escape.
 * BN: Cloudinary image library modal। Admin আগে upload করা ছবি browse,
 *     filename/tag-এ search, "Load more" দিয়ে paginate, এবং একটা বাছাই করে
 *     — parent-এর onPick(url) Cloudinary secure_url দিয়ে call হয়। Backdrop
 *     click বা Escape-এ close।
 */

import { useEffect, useState } from 'react';
import axiosInterceptor from '../axios/axiosInterceptor';

export default function ImageLibraryPicker({ open, onClose, onPick }) {
  const api = axiosInterceptor();
  const [items, setItems] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // EN: Reset + load whenever the modal opens or the search changes.
  // BN: Modal open বা search change হলে reset + load।
  useEffect(() => {
    if (!open) return;
    setItems([]);
    setCursor(null);
    setError('');
    fetchPage(null, q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // EN: Escape closes — mounted only while modal is open.
  // BN: Escape close করে — শুধু modal open থাকলে mounted।
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const fetchPage = async (nextCursor, query) => {
    setLoading(true);
    setError('');
    try {
      const params = { max: 60 };
      if (nextCursor) params.cursor = nextCursor;
      if (query) params.q = query;
      const { data } = await api.get('/cloudinary-images', { params });
      setItems((prev) => (nextCursor ? [...prev, ...(data.resources || [])] : data.resources || []));
      setCursor(data.nextCursor || null);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Image library load error:', err);
      setError('ছবি load হলো না — পরে আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setItems([]);
    setCursor(null);
    fetchPage(null, q);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="flex h-[85vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-brand-tealLight/40 px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-brand-navy">Image Library</h2>
            <p className="text-xs text-brand-slate">
              আগে upload করা ছবিগুলো — browse করে এখান থেকে বাছাই করুন।
              {total > 0 && <span className="ml-1">({total} total)</span>}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-2 text-brand-slate hover:bg-brand-tealLight/20"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSearch} className="border-b border-brand-tealLight/30 bg-brand-tealLight/5 px-5 py-3">
          <div className="flex gap-2">
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Filename বা tag দিয়ে search…"
              className="flex-1 rounded-md border border-brand-tealLight/60 bg-white px-3 py-2 text-sm focus:border-brand-teal focus:outline-none focus:ring-2 focus:ring-brand-teal/40"
            />
            <button
              type="submit"
              className="rounded-md bg-brand-teal px-4 py-2 text-sm font-semibold text-white hover:bg-brand-navy"
            >
              Search
            </button>
            {q && (
              <button
                type="button"
                onClick={() => {
                  setQ('');
                  setItems([]);
                  fetchPage(null, '');
                }}
                className="rounded-md border border-brand-navy bg-white px-3 py-2 text-sm font-semibold text-brand-navy hover:bg-brand-tealLight/10"
              >
                Clear
              </button>
            )}
          </div>
        </form>

        <div className="flex-1 overflow-y-auto bg-brand-tealLight/5 p-5">
          {error && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
          )}
          {items.length === 0 && !loading && !error && (
            <p className="py-8 text-center text-sm text-brand-slate">কোনো ছবি পাওয়া যায়নি।</p>
          )}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {items.map((img) => (
              <button
                key={img.publicId}
                type="button"
                onClick={() => {
                  onPick(img.url);
                  onClose();
                }}
                className="group relative overflow-hidden rounded-lg border border-brand-tealLight/40 bg-white shadow-sm transition-all hover:scale-[1.02] hover:border-brand-teal hover:shadow-lift"
                title={img.filename}
              >
                <div className="aspect-square overflow-hidden bg-brand-tealLight/10">
                  <img
                    src={img.url}
                    alt={img.filename}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                </div>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <p className="truncate text-[10px] text-white">{img.filename || 'image'}</p>
                  <p className="text-[9px] text-white/70">
                    {img.width}×{img.height} · {formatBytes(img.bytes)}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {cursor && (
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => fetchPage(cursor, q)}
                disabled={loading}
                className="rounded-md border border-brand-teal bg-white px-5 py-2 text-sm font-semibold text-brand-teal hover:bg-brand-teal hover:text-white disabled:opacity-50"
              >
                {loading ? 'Loading…' : 'Load more'}
              </button>
            </div>
          )}
          {loading && items.length === 0 && (
            <p className="text-center text-sm text-brand-slate">Loading…</p>
          )}
        </div>
      </div>
    </div>
  );
}

function formatBytes(b) {
  if (!b) return '';
  if (b < 1024) return `${b}B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)}KB`;
  return `${(b / 1024 / 1024).toFixed(1)}MB`;
}
