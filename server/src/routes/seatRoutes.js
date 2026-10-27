import { Router } from 'express';
import { holdSeats, releaseHold } from '../controllers/seatController.js';
import { optionalAuth } from '../middleware/authMiddleware.js';
import { validateBody } from '../middleware/validateRequest.js';
import { validateSeatHold } from '../validators/bookingValidator.js';

const router = Router();

router.post('/shows/:showId/holds', optionalAuth, validateBody(validateSeatHold), holdSeats);
router.post('/:showId/holds', optionalAuth, validateBody(validateSeatHold), holdSeats);
router.delete('/holds/:holdId', optionalAuth, releaseHold);
router.delete('/:holdId', optionalAuth, releaseHold);

export default router;
