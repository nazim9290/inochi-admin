import { useEffect, useState } from 'react';
import axiosInterceptor from '../axios/axiosInterceptor';
import CreateCaruselTop from '../components/CreateCaruselTop';
import CaruselPending from '../components/pendingCarusel';

const CreateCarusel = () => {
  const [drafts, setDrafts] = useState([]);
  const api = axiosInterceptor();

  const fetchDrafts = async () => {
    try {
      const { data } = await api.get('/draft-carusel');
      setDrafts(data?.AllpendingCarusel || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDrafts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/delete-carusel/${id}`);
      fetchDrafts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.put(`/aproved-carusel/${id}`);
      fetchDrafts();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-brand-navy text-center">Carousel</h1>
      <CreateCaruselTop />
      {drafts.length > 0 && (
        <>
          <h2 className="text-lg font-semibold text-brand-navy">Pending drafts</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {drafts.map((item) => (
              <CaruselPending
                key={item.id || item._id}
                data={item}
                handleApprove={() => handleApprove(item.id || item._id)}
                handleDelete={() => handleDelete(item.id || item._id)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default CreateCarusel;
