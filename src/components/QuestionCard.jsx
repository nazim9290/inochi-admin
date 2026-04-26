import { useState } from 'react';

const QuestionCard = ({ data, handleDelete }) => {
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-brand-tealLight/40 p-4 space-y-2">
      <p className="text-xs uppercase font-semibold text-brand-teal">{data.category}</p>
      <p className="font-semibold text-brand-navy line-clamp-2">{data.questionName}</p>

      <ul className="text-sm text-brand-slate space-y-1">
        <li>1. {data.first}</li>
        <li>2. {data.second}</li>
        <li>3. {data.third}</li>
        <li className="text-brand-navy"><strong>Answer:</strong> {data.answer}</li>
      </ul>

      {confirming ? (
        <div className="flex gap-2 pt-2">
          <button onClick={handleDelete} className="px-3 py-1 rounded text-xs font-semibold bg-red-600 hover:bg-red-700 text-white">Confirm delete</button>
          <button onClick={() => setConfirming(false)} className="px-3 py-1 rounded text-xs font-semibold bg-brand-tealLight/30 hover:bg-brand-tealLight/50 text-brand-navy">Cancel</button>
        </div>
      ) : (
        <button onClick={() => setConfirming(true)} className="px-3 py-1 rounded text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-700 border border-red-200">
          Delete
        </button>
      )}
    </div>
  );
};

export default QuestionCard;
