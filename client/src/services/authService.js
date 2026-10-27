import api from './api';

export const authService = {
  async register(data) {
    return api.post('/auth/register', data);
  },

  async login(data) {
    return api.post('/auth/login', data);
  },

  async logout() {
    return api.post('/auth/logout');
  },

  async getMe() {
    return api.get('/auth/me');
  },

  async updateProfile(data) {
    return api.patch('/auth/profile', data);
  },

  async changePassword(data) {
    return api.post('/auth/change-password', data);
  }
};
