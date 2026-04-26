import { useParams } from 'react-router-dom';
import axiosInterceptor from '../axios/axiosInterceptor';

const labelClass = 'block text-sm font-semibold text-brand-navy mb-1';
const fieldClass = 'w-full px-3 py-2 border border-brand-tealLight/60 rounded focus:outline-none focus:ring-2 focus:ring-brand-teal/40';

const EditForm = ({ questionName, setQuestionName, answer, setAnswer, first, setFirst, second, setSecond, third, setThird }) => {
  const { id } = useParams();
  const api = axiosInterceptor();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.put(`/update-question/${id}`, {
        questionName,
        first,
        second,
        third,
        answer,
      });
      if (data?.error) {
        window.alert('Update failed.');
      } else {
        window.alert('Question updated successfully.');
      }
    } catch (err) {
      console.error(err);
      window.alert('Update failed.');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-brand-tealLight/40 p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-extrabold text-brand-navy text-center mb-4">Update Question</h2>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className={labelClass}>Question</label>
          <input type="text" value={questionName} onChange={(e) => setQuestionName(e.target.value)} className={fieldClass} />
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
        <button type="submit" className="bg-brand-teal hover:bg-brand-navy text-white font-semibold px-6 py-2 rounded transition-colors">
          Save
        </button>
      </form>
    </div>
  );
};

export default EditForm;
