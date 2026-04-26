import YouTube from 'react-youtube';

const YouTubeSingleVideo = ({ videoId }) => {
  const opts = {
    width: '100%',
    height: '360',
    playerVars: { autoplay: 1, modestbranding: 1, controls: 1, rel: 0 },
  };
  return (
    <div className="rounded-xl overflow-hidden border border-brand-tealLight/40 shadow-sm bg-black">
      <YouTube videoId={videoId} opts={opts} className="aspect-video" />
    </div>
  );
};

export default YouTubeSingleVideo;
