import { Router } from 'express';
import { getTicketByBookingId, validateTicket } from '../controllers/ticketController.js';
import { authenticate, optionalAuth } from '../../../server/src/middleware/authMiddleware.js';
import { requireAdmin } from '../../../server/src/middleware/adminMiddleware.js';

const router = Router();

router.get('/:bookingId', optionalAuth, getTicketByBookingId);
// Restrict ticket gate check to authorized staff/admin
router.post('/validate', authenticate, requireAdmin, validateTicket);

export default router;
