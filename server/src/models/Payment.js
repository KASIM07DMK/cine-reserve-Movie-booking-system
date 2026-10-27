import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      index: true
    },
    provider: {
      type: String,
      enum: ['test', 'razorpay', 'stripe'],
      default: 'test'
    },
    providerOrderId: {
      type: String,
      required: true,
      index: true
    },
    providerPaymentId: {
      type: String,
      default: null,
      index: true
    },
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'INR'
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'paid', 'failed', 'refunded'],
      default: 'pending',
      index: true
    },
    idempotencyKey: {
      type: String,
      default: undefined,
      index: true
    },
    method: {
      type: String,
      default: 'Test Payment'
    },
    verifiedAt: {
      type: Date,
      default: null
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

export const Payment = mongoose.model('Payment', paymentSchema);
