import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach JWT token from localStorage if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Ensure unique guest session ID for non-logged-in seat holds
  let guestSessionId = localStorage.getItem('guest_session_id');
  if (!guestSessionId) {
    guestSessionId = 'guest_' + Math.random().toString(36).substring(2, 12);
    localStorage.setItem('guest_session_id', guestSessionId);
  }
  config.headers['x-guest-session-id'] = guestSessionId;

  return config;
});

// Response interceptor to handle errors gracefully
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const customError = {
      message: error.response?.data?.message || error.message || 'An unexpected error occurred.',
      code: error.response?.data?.error?.code || 'UNKNOWN_ERROR',
      statusCode: error.response?.status || 500
    };
    return Promise.reject(customError);
  }
);

export default api;
