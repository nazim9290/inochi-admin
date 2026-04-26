const PendingCarusel = ({ data, handleDelete, handleApprove }) => {
  if (!data?.image?.url) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-brand-tealLight/40 overflow-hidden">
      <div className="relative w-full aspect-video bg-brand-tealLight/10">
        <img src={data.image.url} alt={data.category || 'Carousel'} className="w-full h-full object-cover" />
      </div>
      <div className="p-4 space-y-3">
        {data.category && <p className="text-xs uppercase font-semibold text-brand-teal">{data.category}</p>}
        {data.title && <p className="font-semibold text-brand-navy line-clamp-2">{data.title}</p>}
        <div className="flex gap-2">
          <button onClick={handleApprove} className="flex-1 bg-brand-teal hover:bg-brand-navy text-white text-sm font-semibold py-1.5 rounded transition-colors">Approve</button>
          <button onClick={handleDelete} className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-sm font-semibold py-1.5 rounded transition-colors">Delete</button>
        </div>
      </div>
    </div>
  );
};

export default PendingCarusel;
