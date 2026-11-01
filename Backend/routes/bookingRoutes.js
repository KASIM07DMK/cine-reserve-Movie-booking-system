import { Router } from 'express';
import {
  previewBooking,
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking
} from '../controllers/bookingController.js';
import { authenticate, optionalAuth } from '../src/middleware/authMiddleware.js';
import { validateBody } from '../src/middleware/validateRequest.js';
import { validateBookingCreation } from '../src/validators/bookingValidator.js';

const router = Router();

router.post('/preview', optionalAuth, previewBooking);
router.post('/', optionalAuth, validateBody(validateBookingCreation), createBooking);
router.get('/my', authenticate, getMyBookings);
router.get('/:bookingId', optionalAuth, getBookingById);
router.post('/:bookingId/cancel', authenticate, cancelBooking);

export default router;
