import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BaseUrl } from '../utils/constant';

const axiosInterceptor = () => {
  const { state, logout } = useAuth();
  const navigate = useNavigate();

  const instance = axios.create({
    baseURL: `${BaseUrl}/`,
  });

  instance.interceptors.request.use(
    (config) => {
      if (state.isAuthenticated) {
        config.headers.Authorization = `Bearer ${state.token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        logout();
        navigate('/login');
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

export default axiosInterceptor;
