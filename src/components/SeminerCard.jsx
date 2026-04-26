import { useState } from 'react';
import axiosInterceptor from '../axios/axiosInterceptor';

const SeminerCard = ({ data, onDeleted }) => {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const api = axiosInterceptor();

  const remove = async () => {
    setDeleting(true);
    try {
      await api.delete(`/seminar-delete/${data.id || data._id}`);
      onDeleted?.();
    } catch (err) {
      console.error('Error deleting seminar:', err);
    } finally {
      setDeleting(false);
      setConfirming(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-brand-tealLight/40 overflow-hidden">
      {data.image?.url && (
        <div className="relative w-full h-40 bg-brand-tealLight/10">
          <img src={data.image.url} alt={data.title} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="p-4 space-y-2">
        <p className="font-semibold text-brand-navy line-clamp-2">{data.title}</p>
        {data.subtitle && <p className="text-sm text-brand-slate line-clamp-2">{data.subtitle}</p>}
        <div className="flex justify-between text-xs text-brand-slate">
          <span>{data.date}</span>
          <span>{data.time}</span>
        </div>
        {confirming ? (
          <div className="flex gap-2 pt-2">
            <button onClick={remove} disabled={deleting} className="px-3 py-1 rounded text-xs font-semibold bg-red-600 hover:bg-red-700 text-white disabled:opacity-60">
              {deleting ? 'Deleting…' : 'Confirm delete'}
            </button>
            <button onClick={() => setConfirming(false)} className="px-3 py-1 rounded text-xs font-semibold bg-brand-tealLight/30 hover:bg-brand-tealLight/50 text-brand-navy">
              Cancel
            </button>
          </div>
        ) : (
          <button onClick={() => setConfirming(true)} className="px-3 py-1 rounded text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-700 border border-red-200">
            Delete
          </button>
        )}
      </div>
    </div>
  );
};

export default SeminerCard;
