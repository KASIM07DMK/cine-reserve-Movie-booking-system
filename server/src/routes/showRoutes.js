import { Router } from 'express';
import { getShowById, getShowSeats } from '../controllers/showController.js';
import { holdSeats } from '../controllers/seatController.js';
import { optionalAuth } from '../middleware/authMiddleware.js';
import { validateBody } from '../middleware/validateRequest.js';
import { validateSeatHold } from '../validators/bookingValidator.js';

const router = Router();

router.get('/:showId', getShowById);
router.get('/:showId/seats', optionalAuth, getShowSeats);
router.post('/:showId/holds', optionalAuth, validateBody(validateSeatHold), holdSeats);

export default router;
