import { useEffect, useState } from 'react';
import axiosInterceptor from '../axios/axiosInterceptor';

const QuestionList = () => {
  const api = axiosInterceptor();
  const [posts, setPosts] = useState([]);

  const fetchPosts = async () => {
    try {
      const { data } = await api.get('/get-all-posts');
      setPosts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this question?')) return;
    try {
      await api.delete(`/delete-question/${id}`);
      fetchPosts();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold text-brand-navy text-center">Questions</h1>
      {posts.length === 0 ? (
        <p className="text-brand-slate text-center">No questions yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.map((post) => (
            <div key={post.id || post._id} className="bg-white rounded-xl shadow-sm border border-brand-tealLight/40 p-4 space-y-2">
              <p className="font-semibold text-brand-navy line-clamp-2">{post.questionName}</p>
              <ul className="text-xs text-brand-slate space-y-0.5">
                {(post.incorrect_answer || post.incorrectAnswer || []).map((item, i) => (
                  <li key={i}>• {item}</li>
                ))}
                <li className="text-brand-navy"><strong>Answer:</strong> {post.answer}</li>
              </ul>
              <button
                onClick={() => handleDelete(post.id || post._id)}
                className="px-3 py-1 rounded text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-700 border border-red-200"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuestionList;
