import { Router } from 'express';
import { validateCoupon, getAvailableCoupons } from '../controllers/couponController.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/validate', optionalAuth, validateCoupon);
router.get('/available', getAvailableCoupons);

export default router;
