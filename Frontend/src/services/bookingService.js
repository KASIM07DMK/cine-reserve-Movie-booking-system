import api from './api';

export const bookingService = {
  async previewBooking(data) {
    return api.post('/bookings/preview', data);
  },

  async createBooking(data) {
    return api.post('/bookings', data);
  },

  async getMyBookings() {
    return api.get('/bookings/my');
  },

  async getBookingById(bookingId) {
    return api.get(`/bookings/${bookingId}`);
  },

  async cancelBooking(bookingId, reason) {
    return api.post(`/bookings/${bookingId}/cancel`, { reason });
  }
};
