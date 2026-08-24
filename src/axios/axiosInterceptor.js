/**
 * EN: Authenticated axios instance for the admin panel.
 *
 *     CRITICAL — the instance MUST be stable across renders. It used to be
 *     built with a bare `axios.create()` on every call, so every render handed
 *     callers a brand-new object. Any component listing `api` in a useEffect
 *     dependency array then re-ran that effect on EVERY render, which turned a
 *     single fetch into an unbounded request loop, burned the backend's
 *     300-request rate-limit bucket and locked the whole office IP out of
 *     /api with 429s. Keep the instance in a ref; read the live auth values
 *     through a second ref so the once-registered interceptors never go stale.
 *
 *     This is a hook (it calls useAuth/useNavigate/useRef). Callers must invoke
 *     it at the top level of a component — never inside useMemo, a condition or
 *     a loop, or React throws error #311.
 *
 * BN: Admin panel-এর authenticated axios instance।
 *
 *     গুরুত্বপূর্ণ — instance-টা render-এর মধ্যে stable থাকতেই হবে। আগে প্রতিটা
 *     call-এ সরাসরি `axios.create()` হতো, তাই প্রতি render-এ caller নতুন object
 *     পেত। যে component `api`-কে useEffect dependency array-তে রাখত, তার effect
 *     প্রতি render-এ চলত — একটা fetch অসীম request loop হয়ে যেত, backend-এর
 *     300-request rate-limit bucket শেষ করে পুরো অফিস IP-কে /api থেকে 429 দিয়ে
 *     আটকে দিত। তাই instance ref-এ রাখা; live auth value আরেকটা ref দিয়ে পড়া
 *     হয় যাতে একবার register হওয়া interceptor কখনো stale না হয়।
 *
 *     এটা একটা hook (useAuth/useNavigate/useRef ব্যবহার করে)। Caller-কে অবশ্যই
 *     component-এর top level-এ call করতে হবে — useMemo, condition বা loop-এর
 *     ভিতরে নয়, নইলে React error #311 দেয়।
 */

import axios from 'axios';
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BaseUrl } from '../utils/constant';

const axiosInterceptor = () => {
  const { state, logout } = useAuth();
  const navigate = useNavigate();

  // EN: Always points at this render's auth values. The interceptors below are
  //     registered once, so they must read through this ref rather than closing
  //     over `state`/`logout`/`navigate` directly.
  // BN: সবসময় এই render-এর auth value ধরে রাখে। নিচের interceptor একবারই
  //     register হয়, তাই `state`/`logout`/`navigate` সরাসরি closure-এ না নিয়ে
  //     এই ref দিয়ে পড়তে হবে।
  const latest = useRef({ state, logout, navigate });
  latest.current = { state, logout, navigate };

  const instanceRef = useRef(null);

  if (instanceRef.current === null) {
    const instance = axios.create({ baseURL: `${BaseUrl}/` });

    instance.interceptors.request.use(
      (config) => {
        const { state: auth } = latest.current;
        if (auth.isAuthenticated) {
          config.headers.Authorization = `Bearer ${auth.token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    instance.interceptors.response.use(
      (response) => response,
      (error) => {
        // EN: Only a real 401 means the session is dead. A 429 (rate limited)
        //     or a 5xx is transient — logging out there used to bounce the user
        //     to /login, which redirected straight back and re-mounted the app
        //     in a loop.
        // BN: শুধু আসল 401 মানে session শেষ। 429 (rate limit) বা 5xx সাময়িক —
        //     ওখানে logout করলে user /login-এ যেত, সেখান থেকে আবার ফিরে এসে
        //     app re-mount হয়ে loop তৈরি করত।
        if (error.response && error.response.status === 401) {
          latest.current.logout();
          latest.current.navigate('/login');
        }
        return Promise.reject(error);
      }
    );

    instanceRef.current = instance;
  }

  return instanceRef.current;
};

export default axiosInterceptor;
