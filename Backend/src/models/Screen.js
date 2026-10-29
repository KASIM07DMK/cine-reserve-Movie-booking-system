import mongoose from 'mongoose';

const screenSchema = new mongoose.Schema(
  {
    cinema: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cinema',
      required: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true // e.g. "Screen 1 - Audi 1 (Dolby Atmos)"
    },
    seatingLayout: {
      totalRows: { type: Number, default: 8 },
      totalColumns: { type: Number, default: 12 },
      // Layout configuration rows defining seat types and categories
      rows: [
        {
          rowLabel: { type: String, required: true }, // e.g. 'A', 'B', 'C'
          category: {
            type: String,
            enum: ['Regular', 'Premium', 'Recliner'],
            default: 'Regular'
          },
          basePrice: { type: Number, required: true, default: 200 },
          seats: [
            {
              seatNumber: { type: Number, required: true },
              isAisle: { type: Boolean, default: false },
              isBlocked: { type: Boolean, default: false }
            }
          ]
        }
      ]
    },
    seatCategories: [
      {
        name: { type: String, required: true }, // 'Regular', 'Premium', 'Recliner'
        color: { type: String, default: '#3B82F6' },
        defaultPrice: { type: Number, default: 200 }
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

export const Screen = mongoose.model('Screen', screenSchema);
