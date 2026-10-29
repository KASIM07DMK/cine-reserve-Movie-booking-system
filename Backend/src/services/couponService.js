import { Coupon } from '../models/Coupon.js';
import { Booking } from '../models/Booking.js';
import { ApiError } from '../utils/ApiError.js';

export class CouponService {
  static async validateCoupon(code, bookingSubtotal, userId = null) {
    if (!code) {
      throw new ApiError(400, 'Coupon code is required.');
    }

    const coupon = await Coupon.findOne({
      code: code.trim().toUpperCase(),
      isActive: true
    });

    if (!coupon) {
      throw new ApiError(404, 'Invalid promotional coupon code.');
    }

    const now = new Date();
    if (now < new Date(coupon.validFrom) || now > new Date(coupon.validUntil)) {
      throw new ApiError(400, 'This coupon has expired or is not yet active.');
    }

    if (coupon.usedCount >= coupon.usageLimit) {
      throw new ApiError(400, 'This coupon has reached its maximum usage limit.');
    }

    if (bookingSubtotal < coupon.minimumBookingAmount) {
      throw new ApiError(
        400,
        `Minimum booking amount of ₹${coupon.minimumBookingAmount} is required to apply this coupon.`
      );
    }

    if (userId) {
      const userUsageCount = await Booking.countDocuments({
        user: userId,
        'coupon.code': coupon.code,
        bookingStatus: { $in: ['confirmed', 'pending'] }
      });

      if (userUsageCount >= coupon.perUserLimit) {
        throw new ApiError(400, 'You have already used this coupon code.');
      }
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = Math.round((bookingSubtotal * coupon.discountValue) / 100);
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    // Cap discount at total subtotal
    discountAmount = Math.min(discountAmount, bookingSubtotal);

    return {
      isValid: true,
      coupon: {
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount
      }
    };
  }

  static async getActiveCoupons() {
    const now = new Date();
    return Coupon.find({
      isActive: true,
      validFrom: { $lte: now },
      validUntil: { $gte: now }
    }).select('-__v');
  }
}
