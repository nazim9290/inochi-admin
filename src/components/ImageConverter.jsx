import { useEffect } from 'react';
import axiosInterceptor from '../axios/axiosInterceptor';

const ImageConverter = ({ id, onBase64Data }) => {
  const api = axiosInterceptor();

  useEffect(() => {
    let cancelled = false;
    if (!id) return undefined;
    (async () => {
      try {
        const { data } = await api.get(`/images/${id}`);
        if (!cancelled) onBase64Data?.(data.url);
      } catch (err) {
        console.error('Image fetch failed:', err);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return null;
};

export default ImageConverter;
