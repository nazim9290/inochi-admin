import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { BaseUrl } from '../utils/constant';
import EditForm from './EditForm';

const SingleQuestion = () => {
  const [questionName, setQuestionName] = useState('');
  const [first, setFirst] = useState('');
  const [second, setSecond] = useState('');
  const [third, setThird] = useState('');
  const [answer, setAnswer] = useState('');
  const { id } = useParams();

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      try {
        const { data } = await axios.get(`${BaseUrl}/single-post/${id}`);
        if (cancelled) return;
        setQuestionName(data.questionName || '');
        setAnswer(data.answer || '');
        const wrongs = data.incorrect_answer || data.incorrectAnswer || [];
        setFirst(wrongs[0] || '');
        setSecond(wrongs[1] || '');
        setThird(wrongs[2] || '');
      } catch (err) {
        console.error('Failed to load question:', err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <EditForm
      questionName={questionName}
      setQuestionName={setQuestionName}
      answer={answer}
      setAnswer={setAnswer}
      first={first}
      setFirst={setFirst}
      second={second}
      setSecond={setSecond}
      third={third}
      setThird={setThird}
    />
  );
};

export default SingleQuestion;
