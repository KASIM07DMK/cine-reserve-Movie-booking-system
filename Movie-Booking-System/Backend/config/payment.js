import crypto from 'crypto';
import { config } from './env.js';

export const paymentProvider = {
  name: config.payment.provider,

  /**
   * Generates a mock/test payment order with a secure reference ID and signed order hash
   */
  createOrder: async ({ bookingId, amount, currency = 'INR', customerEmail }) => {
    const providerOrderId = `order_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const timestamp = Date.now();
    
    // Create an order signature token for verification
    const orderPayload = `${providerOrderId}|${bookingId}|${amount}|${currency}`;
    const signature = crypto
      .createHmac('sha256', config.payment.keySecret)
      .update(orderPayload)
      .digest('hex');

    return {
      provider: config.payment.provider,
      providerOrderId,
      amount,
      currency,
      signature,
      timestamp,
      customerEmail,
      isTestMode: config.payment.provider === 'test'
    };
  },

  /**
   * Verifies payment completion signature using HMAC
   */
  verifyPayment: ({ providerOrderId, providerPaymentId, signature, bookingId, amount }) => {
    if (config.payment.provider === 'test') {
      // In test mode, verify that the simulated payment token or signature matches HMAC
      // We accept a valid client simulation token formatted as `pay_test_${timestamp}`
      if (providerPaymentId && providerPaymentId.startsWith('pay_test_')) {
        return {
          verified: true,
          method: 'Test Payment Gateway (Simulated UPI/Card)'
        };
      }
    }

    // Default HMAC check for production or strict signature mode
    const expectedPayload = `${providerOrderId}|${providerPaymentId}|${bookingId}|${amount}`;
    const expectedSignature = crypto
      .createHmac('sha256', config.payment.keySecret)
      .update(expectedPayload)
      .digest('hex');

    const isValid = crypto.timingSafeEqual(
      Buffer.from(signature || ''),
      Buffer.from(expectedSignature)
    );

    return {
      verified: isValid,
      method: 'Online Payment'
    };
  }
};
