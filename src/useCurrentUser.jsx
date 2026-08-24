/**
 * EN: Loads the signed-in admin's profile once per session and reports the
 *     loading state to the app shell.
 *
 *     The effect deliberately depends on the auth VALUES it actually reads —
 *     not on the axios instance. Depending on `api` re-ran this effect on every
 *     render (a new instance was handed out each time), which flooded
 *     GET /profile until the backend rate limiter answered 429 and the app was
 *     pinned on "Loading…" forever.
 *
 * BN: Session-প্রতি একবার লগইন করা admin-এর profile লোড করে এবং app shell-কে
 *     loading state জানায়।
 *
 *     effect ইচ্ছাকৃতভাবে সেই auth VALUE-গুলোর উপর নির্ভর করে যেগুলো ও আসলে পড়ে
 *     — axios instance-এর উপর নয়। `api`-এর উপর নির্ভর করায় effect প্রতি
 *     render-এ চলত (প্রতিবার নতুন instance দেওয়া হতো), ফলে GET /profile-এর বন্যা
 *     বইত, backend rate limiter 429 দিত আর app চিরকাল "Loading…"-এ আটকে থাকত।
 */

import { useEffect, useState } from 'react';
import axiosInterceptor from './axios/axiosInterceptor';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

const useCurrentUser = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const api = axiosInterceptor();
  const navigate = useNavigate();
  const { state } = useAuth();

  const isAuthenticated = state?.isAuthenticated ?? false;
  const role = state?.user?.role;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return undefined;
    }

    if (role !== 'admin') {
      setLoading(false);
      return undefined;
    }

    let cancelled = false;

    (async () => {
      try {
        const { data } = await api.get('/profile');
        if (!cancelled) setCurrentUser(data);
      } catch (error) {
        // EN: A 401 is already handled by the response interceptor (logout +
        //     redirect). Anything else — 429, network, 5xx — is transient, so
        //     just stop loading and let the shell show its failure state. Never
        //     redirect here: /login sends an authenticated user straight back,
        //     which re-mounts the app and restarts the request.
        // BN: 401 response interceptor-ই সামলায় (logout + redirect)। বাকি সব —
        //     429, network, 5xx — সাময়িক, তাই শুধু loading বন্ধ করে shell-কে
        //     failure state দেখাতে দাও। এখানে কখনো redirect নয়: /login
        //     authenticated user-কে সাথে সাথে ফেরত পাঠায়, app re-mount হয়ে
        //     request আবার শুরু হয়।
        if (!cancelled) setCurrentUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [api, navigate, isAuthenticated, role]);

  return { currentUser, loading };
};

export default useCurrentUser;
