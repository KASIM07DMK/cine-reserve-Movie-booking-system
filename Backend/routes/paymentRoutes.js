import { Router } from 'express';
import { createOrder, verifyPayment, getPaymentById } from '../controllers/paymentController.js';
import { authenticate, optionalAuth } from '../src/middleware/authMiddleware.js';
import { validateBody } from '../src/middleware/validateRequest.js';
import { validatePaymentVerification } from '../src/validators/paymentValidator.js';

const router = Router();

router.post('/create-order', optionalAuth, createOrder);
router.post('/verify', optionalAuth, validateBody(validatePaymentVerification), verifyPayment);
router.get('/:paymentId', authenticate, getPaymentById);

export default router;
