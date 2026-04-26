import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInterceptor from '../axios/axiosInterceptor';
import { useNavigate } from 'react-router-dom';

const LoginComponent = () => {
  const { login, state } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(null);
  const [loading, setLoading] = useState(false);
  const api = axiosInterceptor();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/login', { email, password });
      if (data.error) {
        setLoginError('Invalid username or password');
      } else {
        const { token, user } = data;
        login(token, user);
        setLoginError(null);
        navigate('/');
      }
    } catch (error) {
      setLoginError('Login failed. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (state !== null && state.isAuthenticated) {
      navigate('/');
    }
  }, [state, navigate]);

  return (
    <div className="min-h-screen bg-brand-tealLight/20 flex items-center justify-center px-4">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-brand-tealLight/40 p-8 space-y-5"
      >
        <h1 className="text-2xl font-extrabold text-brand-navy text-center">Admin Login</h1>

        {loginError && (
          <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded px-3 py-2">
            {loginError}
          </p>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-brand-navy mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border border-brand-tealLight/60 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-teal/40"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-semibold text-brand-navy mb-1">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border border-brand-tealLight/60 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-teal/40"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand-teal hover:bg-brand-navy text-white font-semibold px-4 py-3 rounded transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? 'Signing in…' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default LoginComponent;
