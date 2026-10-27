import api from './api';

export const seatService = {
  async holdSeats(showId, seatCodes) {
    return api.post(`/shows/${showId}/holds`, { seatCodes });
  },

  async releaseHold(holdId) {
    return api.delete(`/holds/${holdId}`);
  }
};
