import { PaymentService } from '../services/paymentService.js';
import { Payment } from '../models/Payment.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

export const createOrder = asyncHandler(async (req, res) => {
  const { bookingId } = req.body;
  const idempotencyKey = req.headers['idempotency-key'] || null;
  const customerEmail = req.user?.email || req.body.customerEmail;

  const result = await PaymentService.createOrder({
    bookingId,
    idempotencyKey,
    customerEmail
  });

  return res.status(200).json(new ApiResponse(200, result, 'Payment order created.'));
});

export const verifyPayment = asyncHandler(async (req, res) => {
  const { bookingId, providerOrderId, providerPaymentId, signature, paymentMethod } = req.body;

  const result = await PaymentService.verifyPayment({
    bookingId,
    providerOrderId,
    providerPaymentId,
    signature,
    paymentMethod
  });

  return res.status(200).json(new ApiResponse(200, result, 'Payment verified successfully.'));
});

export const getPaymentById = asyncHandler(async (req, res) => {
  const { paymentId } = req.params;
  const payment = await Payment.findById(paymentId).populate('booking');
  if (!payment) {
    throw new ApiError(404, 'Payment record not found.');
  }

  // Authorization check
  if (req.user.role !== 'admin' && payment.booking?.user?.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Unauthorized access to payment details.');
  }

  return res.status(200).json(new ApiResponse(200, payment, 'Payment record retrieved.'));
});
