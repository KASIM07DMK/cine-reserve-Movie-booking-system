import mongoose from 'mongoose';

const showSchema = new mongoose.Schema(
  {
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: [true, 'Movie reference is required'],
      index: true
    },
    cinema: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cinema',
      required: [true, 'Cinema reference is required'],
      index: true
    },
    screen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Screen',
      required: [true, 'Screen reference is required']
    },
    startTime: {
      type: Date,
      required: [true, 'Show start time is required'],
      index: true
    },
    endTime: {
      type: Date,
      required: [true, 'Show end time is required']
    },
    language: {
      type: String,
      required: true,
      default: 'English'
    },
    format: {
      type: String,
      enum: ['2D', '3D', 'IMAX', '4DX'],
      default: '2D'
    },
    status: {
      type: String,
      enum: ['scheduled', 'cancelled', 'completed'],
      default: 'scheduled',
      index: true
    },
    pricingConfiguration: {
      Regular: { type: Number, default: 200 },
      Premium: { type: Number, default: 350 },
      Recliner: { type: Number, default: 500 }
    },
    totalSeats: {
      type: Number,
      default: 0
    },
    availableSeatsCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

showSchema.index({ movie: 1, cinema: 1, startTime: 1 });
showSchema.index({ cinema: 1, startTime: 1 });

export const Show = mongoose.model('Show', showSchema);
