// AuthContext.js
import React, { createContext, useContext, useReducer } from 'react';

const AuthContext = createContext();

const initialState = {
  isAuthenticated: false,
  token: null,
  user: null,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN':
      return {
        isAuthenticated: true,
        token: action.payload.token,
        user: action.payload.user,
      };
    case 'LOGOUT':
      return {
        isAuthenticated: false,
        token: null,
        user: null,
      };
    default:
      return state;
  }
};

// EN: Read the saved session before the first render. Restoring it in an
//     effect let PrivateRoute see "logged out" for one render and bounce
//     every refreshed or bookmarked page to the dashboard.
// BN: প্রথম render-এর আগেই saved session পড়ি। Effect-এ restore করলে এক
//     render-এর জন্য PrivateRoute "logged out" দেখত, তাই refresh বা bookmark
//     করা প্রতিটা page dashboard-এ চলে যেত।
const loadStoredSession = () => {
  try {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('authUser');
    if (token && user) return { isAuthenticated: true, token, user: JSON.parse(user) };
  } catch {
    // Corrupt storage: start logged out.
  }
  return initialState;
};

const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, undefined, loadStoredSession);

  const login = (token, user) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('authUser', JSON.stringify(user));

    dispatch({
      type: 'LOGIN',
      payload: { token, user },
    });
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');

    dispatch({
      type: 'LOGOUT',
    });
  };

  return (
    <AuthContext.Provider value={{ state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  return useContext(AuthContext);
};

export { AuthProvider, useAuth };
