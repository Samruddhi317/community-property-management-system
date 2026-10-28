
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8081/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Log actual API errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API ERROR:', error);
    console.error('ERROR STATUS:', error.response?.status);
    console.error('ERROR DATA:', error.response?.data);
    console.error('ERROR URL:', error.config?.url);

    if (
      error.response?.status === 401 &&
      !error.config?.url?.includes('/auth/')
    ) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

// Auth
export const login = (data) => api.post('/auth/login', data);
export const register = (data) => api.post('/auth/register', data);

// Announcements
export const getAnnouncements = () => api.get('/announcements');
export const createAnnouncement = (data) =>
  api.post('/announcements', data);
export const deleteAnnouncement = (id) =>
  api.delete(`/announcements/${id}`);

// Posts
export const getPosts = () => api.get('/posts');
export const getPost = (id) => api.get(`/posts/${id}`);
export const createPost = (data) => api.post('/posts', data);
export const addComment = (postId, data) =>
  api.post(`/posts/${postId}/comments`, data);
export const updatePost = (id, data) =>
  api.put(`/posts/${id}`, data);
export const deletePost = (id) =>
  api.delete(`/posts/${id}`);

// Bookings
export const getMyBookings = (userId) =>
  api.get(`/bookings/user/${userId}`);
export const createBooking = (data) =>
  api.post('/bookings', data);
export const cancelBooking = (id) =>
  api.delete(`/bookings/${id}`);
export const getAllBookings = () =>
  api.get('/bookings');
export const approveBooking = (id) =>
  api.patch(`/bookings/${id}/status`, null, {
    params: { status: 'APPROVED' },
  });
export const rejectBooking = (id) =>
  api.patch(`/bookings/${id}/status`, null, {
    params: { status: 'REJECTED' },
  });

// Maintenance
// Current logged-in user sees only their own requests
export const getMyRequests = () =>
  api.get('/maintenance/my');

export const createRequest = (data) =>
  api.post('/maintenance', data);

// Admin and Staff can view all requests
export const getAllMaintenanceRequests = () =>
  api.get('/maintenance');

// Admin and Staff can update request status
export const updateMaintenanceStatus = (id, status) =>
  api.patch(`/maintenance/${id}/status`, null, {
    params: { status },
  });

// Payments
export const getAllPayments = () =>
  api.get('/payments');
export const getMyPayments = (userId) =>
  api.get(`/payments/user/${userId}`);
export const markAsPaid = (id) =>
  api.patch(`/payments/${id}/pay`);
export const createPayment = (data) =>
  api.post('/payments', data);

// Users
export const getAllUsers = () =>
  api.get('/users');
export const deleteUser = (id) =>
  api.delete(`/users/${id}`);

export default api;
