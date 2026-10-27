import api from './api';

export const paymentService = {
  async createOrder(data) {
    return api.post('/payments/create-order', data);
  },

  async verifyPayment(data) {
    return api.post('/payments/verify', data);
  },

  async getPaymentById(paymentId) {
    return api.get(`/payments/${paymentId}`);
  }
};
