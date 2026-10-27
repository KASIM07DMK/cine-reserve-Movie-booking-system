import mongoose from 'mongoose';

const showSeatSchema = new mongoose.Schema(
  {
    show: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Show',
      required: true,
      index: true
    },
    seatCode: {
      type: String,
      required: true,
      trim: true // e.g. "A1", "C10"
    },
    rowLabel: {
      type: String,
      required: true,
      trim: true // e.g. "A"
    },
    seatNumber: {
      type: Number,
      required: true
    },
    category: {
      type: String,
      enum: ['Regular', 'Premium', 'Recliner'],
      default: 'Regular'
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    status: {
      type: String,
      enum: ['available', 'held', 'booked', 'blocked'],
      default: 'available',
      index: true
    },
    holdId: {
      type: String,
      default: null,
      index: true
    },
    heldByUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    guestSessionId: {
      type: String,
      default: null
    },
    holdExpiresAt: {
      type: Date,
      default: null,
      index: true
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Crucial compound unique constraint: a seatCode can only exist once per show
showSeatSchema.index({ show: 1, seatCode: 1 }, { unique: true });
showSeatSchema.index({ show: 1, status: 1, holdExpiresAt: 1 });

export const ShowSeat = mongoose.model('ShowSeat', showSeatSchema);
