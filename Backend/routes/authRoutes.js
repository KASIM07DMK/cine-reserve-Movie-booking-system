import { Router } from 'express';
import {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword
} from '../controllers/authController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { validateBody } from '../middleware/validateRequest.js';
import { validateRegister, validateLogin } from '../validators/authValidator.js';

const router = Router();

router.post('/register', authLimiter, validateBody(validateRegister), register);
router.post('/login', authLimiter, validateBody(validateLogin), login);
router.post('/logout', logout);
router.get('/me', authenticate, getMe);
router.patch('/profile', authenticate, updateProfile);
router.post('/change-password', authenticate, changePassword);

export default router;
