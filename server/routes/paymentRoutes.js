import { Router } from 'express';
import { createOrder, verifyPayment, getPaymentById } from '../controllers/paymentController.js';
import { authenticate, optionalAuth } from '../middleware/authMiddleware.js';
import { validateBody } from '../middleware/validateRequest.js';
import { validatePaymentVerification } from '../validators/paymentValidator.js';

const router = Router();

router.post('/create-order', optionalAuth, createOrder);
router.post('/verify', optionalAuth, validateBody(validatePaymentVerification), verifyPayment);
router.get('/:paymentId', authenticate, getPaymentById);

export default router;
