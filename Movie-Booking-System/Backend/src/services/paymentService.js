import { Payment } from '../models/Payment.js';
import { Booking } from '../models/Booking.js';
import { paymentProvider } from '../config/payment.js';
import { BookingService } from './bookingService.js';
import { ApiError } from '../utils/ApiError.js';

export class PaymentService {
  /**
   * Creates a payment order for a pending booking
   */
  static async createOrder({ bookingId, idempotencyKey = null, customerEmail = null }) {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      throw new ApiError(404, 'Booking not found.');
    }

    if (booking.bookingStatus !== 'pending') {
      throw new ApiError(400, `Cannot create payment order for booking with status "${booking.bookingStatus}".`);
    }

    // Check if hold has expired
    if (new Date() > new Date(booking.holdExpiresAt)) {
      throw new ApiError(410, 'Your seat reservation has expired. Please choose your seats again.');
    }

    // If payment already exists with this idempotency key, return it
    if (idempotencyKey) {
      const existingPayment = await Payment.findOne({ idempotencyKey, booking: bookingId });
      if (existingPayment) {
        return {
          orderId: existingPayment.providerOrderId,
          amount: existingPayment.amount,
          currency: existingPayment.currency,
          provider: existingPayment.provider,
          status: existingPayment.status,
          bookingReference: booking.bookingReference
        };
      }
    }

    const orderData = await paymentProvider.createOrder({
      bookingId: booking._id.toString(),
      amount: booking.totalAmount,
      currency: booking.currency,
      customerEmail: customerEmail || booking.guestDetails?.email
    });

    const payment = await Payment.create({
      booking: booking._id,
      provider: orderData.provider,
      providerOrderId: orderData.providerOrderId,
      amount: booking.totalAmount,
      currency: booking.currency,
      status: 'pending',
      idempotencyKey,
      metadata: {
        orderSignature: orderData.signature,
        isTestMode: orderData.isTestMode
      }
    });

    return {
      paymentId: payment._id,
      providerOrderId: orderData.providerOrderId,
      amount: booking.totalAmount,
      currency: booking.currency,
      signature: orderData.signature,
      provider: orderData.provider,
      bookingReference: booking.bookingReference,
      isTestMode: orderData.isTestMode
    };
  }

  /**
   * Verifies payment result from provider or test simulator
   */
  static async verifyPayment({ bookingId, providerOrderId, providerPaymentId, signature, paymentMethod }) {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      throw new ApiError(404, 'Booking not found.');
    }

    const payment = await Payment.findOne({
      booking: bookingId,
      providerOrderId
    });

    if (!payment) {
      throw new ApiError(404, 'Payment record for this order was not found.');
    }

    if (payment.status === 'paid') {
      // Idempotent: already confirmed
      return {
        success: true,
        message: 'Payment was already verified and confirmed.',
        booking: await BookingService.getBookingDetails(bookingId, booking.user, true)
      };
    }

    // Verify signature
    const verification = paymentProvider.verifyPayment({
      providerOrderId,
      providerPaymentId,
      signature,
      bookingId: booking._id.toString(),
      amount: payment.amount
    });

    if (!verification.verified) {
      payment.status = 'failed';
      await payment.save();
      throw new ApiError(400, 'Invalid payment signature. Verification failed.');
    }

    // Mark payment as paid
    payment.status = 'paid';
    payment.providerPaymentId = providerPaymentId;
    payment.method = paymentMethod || verification.method;
    payment.verifiedAt = new Date();
    await payment.save();

    // Confirm booking and seats
    const confirmedBooking = await BookingService.confirmBooking(booking._id, payment);

    return {
      success: true,
      message: 'Payment verified and booking confirmed successfully.',
      booking: confirmedBooking,
      payment: {
        id: payment._id,
        transactionId: payment.providerPaymentId,
        amount: payment.amount,
        status: payment.status
      }
    };
  }
}
