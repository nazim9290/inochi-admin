import { useState } from 'react';
import axiosInterceptor from '../axios/axiosInterceptor';

const PlaylistFrom = ({ onCreated }) => {
  const [playlistTitle, setPlaylistTitle] = useState('');
  const [title, setTitle] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const api = axiosInterceptor();

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!playlistTitle.trim() || !title.trim()) return;
    setSubmitting(true);
    try {
      await api.post('/add-video', { playlistTitle, title });
      setPlaylistTitle('');
      setTitle('');
      onCreated?.();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleCreate} className="bg-white rounded-xl border border-brand-tealLight/40 shadow-sm p-6 space-y-4 max-w-2xl mx-auto">
      <h2 className="text-xl font-extrabold text-brand-navy">Add YouTube Playlist</h2>
      <div>
        <label className="block text-sm font-semibold text-brand-navy mb-1">Playlist ID</label>
        <input
          type="text"
          value={playlistTitle}
          onChange={(e) => setPlaylistTitle(e.target.value)}
          placeholder="YouTube playlist ID"
          className="w-full px-3 py-2 border border-brand-tealLight/60 rounded focus:outline-none focus:ring-2 focus:ring-brand-teal/40"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-brand-navy mb-1">Playlist title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title shown on the site"
          className="w-full px-3 py-2 border border-brand-tealLight/60 rounded focus:outline-none focus:ring-2 focus:ring-brand-teal/40"
        />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="bg-brand-teal hover:bg-brand-navy text-white font-semibold px-6 py-2 rounded transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {submitting ? 'Adding…' : 'Add playlist'}
      </button>
    </form>
  );
};

export default PlaylistFrom;
