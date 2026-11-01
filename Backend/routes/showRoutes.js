import { Router } from 'express';
import { getShowById, getShowSeats } from '../controllers/showController.js';
import { optionalAuth } from '../src/middleware/authMiddleware.js';

const router = Router();

router.get('/:showId', getShowById);
router.get('/:showId/seats', optionalAuth, getShowSeats);

export default router;
