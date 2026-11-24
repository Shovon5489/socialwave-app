import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

const initialState = {
  user: null,
  token: localStorage.getItem('token') || null,
  loading: true,
  isAuthenticated: false,
};

function authReducer(state, action) {
  switch (action.type) {
    case 'AUTH_LOADING':
      return { ...state, loading: true };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
      };
    case 'AUTH_LOADED':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
      };
    case 'AUTH_ERROR':
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Set auth token in localStorage
  useEffect(() => {
    if (state.token) {
      localStorage.setItem('token', state.token);
    } else {
      localStorage.removeItem('token');
    }
  }, [state.token]);

  // Load user on mount if token exists
  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      dispatch({ type: 'AUTH_ERROR' });
      return;
    }
    try {
      const res = await api.get('/auth/me');
      const user = res.data?.data?.user || res.data?.user;
      if (user) {
        dispatch({ type: 'AUTH_LOADED', payload: user });
      } else {
        dispatch({ type: 'AUTH_ERROR' });
      }
    } catch (err) {
      dispatch({ type: 'AUTH_ERROR' });
      localStorage.removeItem('token');
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email, password) => {
    dispatch({ type: 'AUTH_LOADING' });
    try {
      const res = await api.post('/auth/login', { email, password });
      const user = res.data?.data?.user || res.data?.user;
      const token = res.data?.data?.token || res.data?.token;

      if (!token) {
        throw new Error(res.data?.message || 'Login failed');
      }

      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user, token },
      });
      return { success: true, user, token };
    } catch (err) {
      dispatch({ type: 'AUTH_ERROR' });
      const message = err.response?.data?.message || err.message || 'Login failed. Please check credentials.';
      throw new Error(message);
    }
  };

  const register = async (data) => {
    dispatch({ type: 'AUTH_LOADING' });
    try {
      const res = await api.post('/auth/register', data);
      const user = res.data?.data?.user || res.data?.user;
      const token = res.data?.data?.token || res.data?.token;

      if (!token) {
        throw new Error(res.data?.message || 'Registration failed');
      }

      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user, token },
      });
      return { success: true, user, token };
    } catch (err) {
      dispatch({ type: 'AUTH_ERROR' });
      const message = err.response?.data?.message || err.message || 'Registration failed. Please try again.';
      throw new Error(message);
    }
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
    toast.success('Logged out successfully');
    window.location.href = '/login';
  };

  const updateUser = (data) => {
    dispatch({ type: 'UPDATE_USER', payload: data });
  };

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        token: state.token,
        loading: state.loading,
        isAuthenticated: state.isAuthenticated,
        login,
        register,
        logout,
        updateUser,
        loadUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext };
export default AuthContext;
