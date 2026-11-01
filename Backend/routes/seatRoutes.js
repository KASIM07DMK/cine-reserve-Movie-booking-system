import { Router } from 'express';
import { holdSeats, releaseHold } from '../controllers/seatController.js';
import { optionalAuth } from '../src/middleware/authMiddleware.js';
import { validateBody } from '../src/middleware/validateRequest.js';
import { validateSeatHold } from '../src/validators/bookingValidator.js';

const router = Router();

router.post('/shows/:showId/holds', optionalAuth, validateBody(validateSeatHold), holdSeats);
router.delete('/holds/:holdId', optionalAuth, releaseHold);

export default router;
