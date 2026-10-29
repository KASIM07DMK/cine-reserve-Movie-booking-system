import { Router } from 'express';
import {
  getDashboardMetrics,
  createMovie,
  updateMovie,
  deleteMovie,
  createCity,
  createCinema,
  createScreen,
  createShow,
  createCoupon,
  getAllBookings,
  getValidationLogs
} from '../controllers/adminController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/adminMiddleware.js';

const router = Router();

// Apply auth and admin check to all admin routes
router.use(authenticate, requireAdmin);

router.get('/dashboard', getDashboardMetrics);

// Movies
router.post('/movies', createMovie);
router.patch('/movies/:movieId', updateMovie);
router.delete('/movies/:movieId', deleteMovie);

// Cities & Cinemas & Screens
router.post('/cities', createCity);
router.post('/cinemas', createCinema);
router.post('/screens', createScreen);

// Shows & Coupons
router.post('/shows', createShow);
router.post('/coupons', createCoupon);

// Bookings & Validation Logs
router.get('/bookings', getAllBookings);
router.get('/validations', getValidationLogs);

export default router;
