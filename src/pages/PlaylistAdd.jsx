import { useEffect, useState } from 'react';
import axiosInterceptor from '../axios/axiosInterceptor';
import PlaylistFrom from '../components/PlaylistFrom';
import PlayList from '../components/Playlist.jsx';
import { useVideoContext } from '../context/VideoContext.jsx';
import YouTubeSingleVideo from '../components/YouTubeSingleVideo.jsx';

const PlayListAdd = () => {
  const [playlists, setPlaylists] = useState([]);
  const { selectedVideoId } = useVideoContext();
  const api = axiosInterceptor();

  const fetchPlaylists = async () => {
    try {
      const { data } = await api.get('/video-playlist');
      setPlaylists(data?.video || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPlaylists();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <PlaylistFrom onCreated={fetchPlaylists} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          {selectedVideoId ? (
            <YouTubeSingleVideo videoId={selectedVideoId} />
          ) : (
            <div className="bg-white border border-brand-tealLight/40 rounded-xl p-6 text-center text-brand-slate text-sm">
              Pick a video thumbnail to play it here.
            </div>
          )}
        </div>
        <div className="lg:col-span-2">
          {playlists.length === 0 ? (
            <p className="text-brand-slate">No playlists yet.</p>
          ) : (
            playlists.map((p) => <PlayList key={p.id || p._id} data={p} />)
          )}
        </div>
      </div>
    </div>
  );
};

export default PlayListAdd;
