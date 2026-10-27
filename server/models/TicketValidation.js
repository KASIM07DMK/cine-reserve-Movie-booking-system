import mongoose from 'mongoose';

const ticketValidationSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      index: true
    },
    show: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Show',
      required: true
    },
    validatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    validationTokenHash: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['valid', 'already_used', 'invalid', 'cancelled'],
      required: true
    },
    message: {
      type: String,
      required: true
    },
    validatedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

export const TicketValidation = mongoose.model('TicketValidation', ticketValidationSchema);
