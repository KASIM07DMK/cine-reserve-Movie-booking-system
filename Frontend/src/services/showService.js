import api from './api';

export const showService = {
  async getShowById(showId) {
    return api.get(`/shows/${showId}`);
  },

  async getShowSeats(showId) {
    return api.get(`/shows/${showId}/seats`);
  }
};
