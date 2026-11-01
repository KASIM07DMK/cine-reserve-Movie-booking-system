import { Router } from 'express';
import { getTicketByBookingId, validateTicket } from '../controllers/ticketController.js';
import { authenticate, optionalAuth } from '../src/middleware/authMiddleware.js';
import { requireAdmin } from '../src/middleware/adminMiddleware.js';

const router = Router();

router.get('/:bookingId', optionalAuth, getTicketByBookingId);
// Restrict ticket gate check to authorized staff/admin
router.post('/validate', authenticate, requireAdmin, validateTicket);

export default router;
