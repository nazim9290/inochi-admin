import { useState } from 'react';
import axiosInterceptor from '../axios/axiosInterceptor';

const labelClass = 'block text-sm font-semibold text-brand-navy mb-1';
const fieldClass = 'w-full px-3 py-2 border border-brand-tealLight/60 rounded focus:outline-none focus:ring-2 focus:ring-brand-teal/40';

const QuizCreate = ({ onCreated }) => {
  const api = axiosInterceptor();
  const [questionName, setQuestionName] = useState('');
  const [first, setFirst] = useState('');
  const [second, setSecond] = useState('');
  const [third, setThird] = useState('');
  const [answer, setAnswer] = useState('');
  const [category, setCategory] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    if (!category || !questionName || !first || !second || !third || !answer) {
      setMessage({ kind: 'error', text: 'All fields are required.' });
      return;
    }
    setSubmitting(true);
    setMessage(null);
    try {
      const { data } = await api.post('/create-question', {
        questionName,
        first,
        second,
        third,
        answer,
        category,
      });
      if (data?.error) {
        setMessage({ kind: 'error', text: 'Could not create question.' });
      } else {
        setMessage({ kind: 'ok', text: 'Question created!' });
        setQuestionName('');
        setFirst('');
        setSecond('');
        setThird('');
        setAnswer('');
        setCategory('');
        onCreated?.();
      }
    } catch (err) {
      console.error(err);
      setMessage({ kind: 'error', text: 'Could not create question.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-brand-tealLight/40 p-6 max-w-3xl mx-auto">
      <h2 className="text-xl font-extrabold text-brand-navy mb-4">Create Question</h2>

      {message && (
        <p className={`text-sm rounded px-3 py-2 mb-4 ${
          message.kind === 'ok'
            ? 'bg-brand-tealLight/30 text-brand-navy border border-brand-teal/40'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.text}
        </p>
      )}

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className={labelClass}>Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={fieldClass}>
            <option value="" disabled>Select a category</option>
            <option value="Vocabulary">N5 Vocabulary Test</option>
            <option value="Grammer">N5 Grammar Test</option>
            <option value="Reading">N5 Reading Test</option>
            <option value="Kanji">N5 Kanji Test</option>
            <option value="FullOne">N5 Full Test 1</option>
            <option value="FullTwo">N5 Full Test 2</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>Question</label>
          <input type="text" value={questionName} onChange={(e) => setQuestionName(e.target.value)} placeholder="Enter the question text" className={fieldClass} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className={labelClass}>Wrong option 1</label>
            <input type="text" value={first} onChange={(e) => setFirst(e.target.value)} className={fieldClass} />
          </div>
          <div>
            <label className={labelClass}>Wrong option 2</label>
            <input type="text" value={second} onChange={(e) => setSecond(e.target.value)} className={fieldClass} />
          </div>
          <div>
            <label className={labelClass}>Wrong option 3</label>
            <input type="text" value={third} onChange={(e) => setThird(e.target.value)} className={fieldClass} />
          </div>
        </div>

        <div>
          <label className={labelClass}>Correct answer</label>
          <input type="text" value={answer} onChange={(e) => setAnswer(e.target.value)} className={fieldClass} />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="bg-brand-teal hover:bg-brand-navy text-white font-semibold px-6 py-2 rounded transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? 'Creating…' : 'Create question'}
        </button>
      </form>
    </div>
  );
};

export default QuizCreate;
