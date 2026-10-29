import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    bookingReference: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },
    guestDetails: {
      name: { type: String, trim: true },
      email: { type: String, lowercase: true, trim: true },
      phone: { type: String, trim: true }
    },
    show: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Show',
      required: true,
      index: true
    },
    movieSnapshot: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie' },
      title: { type: String, required: true },
      posterUrl: { type: String, required: true },
      certification: { type: String, default: 'UA' },
      language: { type: String, required: true },
      format: { type: String, required: true },
      durationMinutes: { type: Number, default: 120 }
    },
    cinemaSnapshot: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'Cinema' },
      name: { type: String, required: true },
      address: { type: String, required: true },
      screenName: { type: String, required: true },
      city: { type: String, required: true }
    },
    showTime: {
      startTime: { type: Date, required: true },
      endTime: { type: Date, required: true }
    },
    selectedSeats: [
      {
        seatCode: { type: String, required: true },
        rowLabel: { type: String, required: true },
        seatNumber: { type: Number, required: true },
        category: { type: String, required: true },
        price: { type: Number, required: true }
      }
    ],
    pricingBreakdown: {
      baseTicketSubtotal: { type: Number, required: true },
      bookingFee: { type: Number, required: true },
      tax: { type: Number, required: true },
      discount: { type: Number, default: 0 },
      finalAmount: { type: Number, required: true }
    },
    coupon: {
      code: { type: String, default: null },
      discountAmount: { type: Number, default: 0 }
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'INR'
    },
    bookingStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'expired'],
      default: 'pending',
      index: true
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'processing', 'paid', 'failed', 'refunded'],
      default: 'pending',
      index: true
    },
    holdId: {
      type: String,
      required: true
    },
    holdExpiresAt: {
      type: Date,
      required: true
    },
    qrValidationToken: {
      type: String,
      default: null
    },
    ticketValidated: {
      type: Boolean,
      default: false
    },
    ticketValidatedAt: {
      type: Date,
      default: null
    },
    ticketValidatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    cancelledAt: {
      type: Date,
      default: null
    },
    cancellationReason: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

bookingSchema.index({ user: 1, bookingStatus: 1 });
bookingSchema.index({ createdAt: -1 });

export const Booking = mongoose.model('Booking', bookingSchema);
