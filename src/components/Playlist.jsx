import { useState } from 'react';
import PlaylistVideos from './CreatePlaylis';

const Playlist = ({ data }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-brand-tealLight/40 shadow-sm p-4 mb-3">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-brand-navy">{data.title}</h4>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="text-sm bg-brand-teal hover:bg-brand-navy text-white font-semibold px-3 py-1 rounded transition-colors"
        >
          {open ? 'Hide videos' : 'Show videos'}
        </button>
      </div>
      {open && (
        <div className="mt-3">
          <PlaylistVideos Id={data.playlistTitle} />
        </div>
      )}
    </div>
  );
};

export default Playlist;
