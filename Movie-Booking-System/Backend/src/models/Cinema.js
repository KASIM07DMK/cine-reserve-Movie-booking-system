import mongoose from 'mongoose';

const cinemaSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Cinema name is required'],
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    city: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'City',
      required: [true, 'City reference is required'],
      index: true
    },
    address: {
      street: { type: String, required: true },
      area: { type: String, required: true },
      pincode: { type: String, default: '' }
    },
    facilities: [
      {
        type: String, // e.g. 'Dolby Atmos', 'Recliner Seating', 'Food Court', 'Wheelchair Accessible', 'Parking'
        trim: true
      }
    ],
    supportedFormats: [
      {
        type: String,
        default: ['2D', '3D', 'IMAX']
      }
    ],
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

cinemaSchema.index({ city: 1, isActive: 1 });

export const Cinema = mongoose.model('Cinema', cinemaSchema);
