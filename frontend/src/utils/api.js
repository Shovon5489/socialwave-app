import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://socialwave-app.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ---- Auth API ----
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (data) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  updatePassword: (data) => api.put('/auth/update-password', data),
};

// ---- User API ----
export const userAPI = {
  getProfile: (username) => api.get(`/users/${username}`),
  updateProfile: (data) => api.put('/users/profile', data),
  uploadAvatar: (formData) =>
    api.post('/users/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  uploadCover: (formData) =>
    api.post('/users/cover', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  sendFriendRequest: (userId) => api.post(`/users/friend-request/${userId}`),
  acceptFriendRequest: (userId) => api.put(`/users/friend-request/${userId}/accept`),
  declineFriendRequest: (userId) => api.delete(`/users/friend-request/${userId}`),
  removeFriend: (userId) => api.delete(`/users/unfriend/${userId}`),
  followUser: (userId) => api.post(`/users/follow/${userId}`),
  unfollowUser: (userId) => api.delete(`/users/unfollow/${userId}`),
  getFriendRequests: () => api.get('/users/friend-requests'),
  getSuggestedFriends: () => api.get('/users/suggestions'),
  getFriends: () => api.get('/users/friends'),
  searchUsers: (query) => api.get(`/users?q=${encodeURIComponent(query)}`),
};

// ---- Post API ----
export const postAPI = {
  getFeed: (page = 1) => api.get(`/posts/feed?page=${page}`),
  createPost: (data) => api.post('/posts', data),
  createPostWithMedia: (formData) =>
    api.post('/posts', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getPost: (postId) => api.get(`/posts/${postId}`),
  updatePost: (postId, data) => api.put(`/posts/${postId}`, data),
  deletePost: (postId) => api.delete(`/posts/${postId}`),
  likePost: (postId) => api.post(`/posts/${postId}/like`),
  unlikePost: (postId) => api.delete(`/posts/${postId}/like`),
  sharePost: (postId, content) => api.post(`/posts/${postId}/share`, { content }),
  addComment: (postId, content) => api.post(`/posts/${postId}/comment`, { content }),
  deleteComment: (postId, commentId) =>
    api.delete(`/posts/${postId}/comment/${commentId}`),
  likeComment: (postId, commentId) =>
    api.post(`/posts/${postId}/comment/${commentId}/like`),
  addReply: (postId, commentId, content) =>
    api.post(`/posts/${postId}/comment/${commentId}/reply`, { content }),
  getUserPosts: (userId, page = 1) => api.get(`/posts/user/${userId}?page=${page}`),
  getSavedPosts: (page = 1) => api.get(`/posts/saved?page=${page}`),
  savePost: (postId) => api.post(`/posts/${postId}/save`),
  getTrending: () => api.get('/posts/trending'),
  getByHashtag: (tag, page = 1) => api.get(`/posts/hashtag/${tag}?page=${page}`),
};

// ---- Notification API ----
export const notificationAPI = {
  getNotifications: (page = 1) => api.get(`/notifications?page=${page}`),
  markRead: (notificationId) => api.put(`/notifications/${notificationId}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  deleteNotification: (notificationId) => api.delete(`/notifications/${notificationId}`),
};

// ---- Story API ----
export const storyAPI = {
  getStories: () => api.get('/stories'),
  createStory: (formData) =>
    api.post('/stories', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  viewStory: (id) => api.put(`/stories/${id}/view`),
  deleteStory: (id) => api.delete(`/stories/${id}`),
};

// ---- Search API ----
export const searchAPI = {
  search: (query) => api.get(`/search?q=${encodeURIComponent(query)}`),
  searchUsers: (query) => api.get(`/search/users?q=${encodeURIComponent(query)}`),
  searchPosts: (query) => api.get(`/search/posts?q=${encodeURIComponent(query)}`),
  getTrending: () => api.get('/search/trending'),
};

export default api;
