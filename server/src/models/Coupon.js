import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: true
    },
    discountValue: {
      type: Number,
      required: true,
      min: 1
    },
    maxDiscount: {
      type: Number,
      default: 500
    },
    minimumBookingAmount: {
      type: Number,
      default: 0
    },
    validFrom: {
      type: Date,
      default: Date.now
    },
    validUntil: {
      type: Date,
      required: true
    },
    usageLimit: {
      type: Number,
      default: 1000
    },
    usedCount: {
      type: Number,
      default: 0
    },
    perUserLimit: {
      type: Number,
      default: 1
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

couponSchema.index({ code: 1, isActive: 1 });

export const Coupon = mongoose.model('Coupon', couponSchema);
