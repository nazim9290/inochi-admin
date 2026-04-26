import { useEffect, useState } from 'react';
import axiosInterceptor from '../axios/axiosInterceptor';
import QuizCreate from '../components/QuizCreate';
import QuestionCard from '../components/QuestionCard';

const CreateQuestion = () => {
  const [questions, setQuestions] = useState([]);
  const api = axiosInterceptor();

  const fetchQuestions = async () => {
    try {
      const { data } = await api.get('/get-all-question');
      setQuestions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/delete-question/${id}`);
      fetchQuestions();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <QuizCreate onCreated={fetchQuestions} />
      {questions.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {questions.map((q) => (
            <QuestionCard
              key={q.id || q._id}
              data={q}
              handleEdit={() => {}}
              handleDelete={() => handleDelete(q.id || q._id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CreateQuestion;
