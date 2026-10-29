import { CouponService } from '../../../server/src/services/couponService.js';
import { ApiResponse } from '../../../server/src/utils/ApiResponse.js';
import { asyncHandler } from '../../../server/src/utils/asyncHandler.js';

export const validateCoupon = asyncHandler(async (req, res) => {
  const { code, amount } = req.body;
  const userId = req.user?._id || null;

  const result = await CouponService.validateCoupon(code, Number(amount), userId);
  return res.status(200).json(new ApiResponse(200, result, 'Coupon applied successfully.'));
});

export const getAvailableCoupons = asyncHandler(async (req, res) => {
  const coupons = await CouponService.getActiveCoupons();
  return res.status(200).json(new ApiResponse(200, coupons, 'Available coupons retrieved.'));
});
