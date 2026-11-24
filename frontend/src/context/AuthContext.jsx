import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import axios from 'axios';
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
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
      };
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

  // Set axios default auth header whenever token changes
  useEffect(() => {
    if (state.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
      localStorage.setItem('token', state.token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
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
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const res = await axios.get('/api/auth/me');
      dispatch({ type: 'AUTH_LOADED', payload: res.data.user });
    } catch (err) {
      dispatch({ type: 'AUTH_ERROR' });
      localStorage.removeItem('token');
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email, password) => {
    try {
      dispatch({ type: 'AUTH_LOADING' });
      const res = await axios.post('/api/auth/login', { email, password });
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user: res.data.user, token: res.data.token },
      });
      toast.success(`Welcome back, ${res.data.user.firstName}!`);
      return { success: true };
    } catch (err) {
      dispatch({ type: 'AUTH_ERROR' });
      const message = err.response?.data?.message || 'Login failed. Please try again.';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const register = async (data) => {
    try {
      dispatch({ type: 'AUTH_LOADING' });
      const res = await axios.post('/api/auth/register', data);
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user: res.data.user, token: res.data.token },
      });
      toast.success(`Welcome to SocialWave, ${res.data.user.firstName}!`);
      return { success: true };
    } catch (err) {
      dispatch({ type: 'AUTH_ERROR' });
      const message = err.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(message);
      return { success: false, error: message };
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
