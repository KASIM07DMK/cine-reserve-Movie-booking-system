import api from './api';

export const cinemaService = {
  async getCinemas(params = {}) {
    return api.get('/cinemas', { params });
  },

  async getCinemaById(cinemaId) {
    return api.get(`/cinemas/${cinemaId}`);
  },

  async getCinemaShows(cinemaId, { date } = {}) {
    return api.get(`/cinemas/${cinemaId}/shows`, { params: { date } });
  }
};
