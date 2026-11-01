import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { config } from './config/env.js';
import { apiLimiter } from './src/middleware/rateLimiter.js';
import { errorMiddleware } from './src/middleware/errorMiddleware.js';
import { ApiError } from './src/utils/ApiError.js';
import { ApiResponse } from './src/utils/ApiResponse.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import cityRoutes from './routes/cityRoutes.js';
import movieRoutes from './routes/movieRoutes.js';
import cinemaRoutes from './routes/cinemaRoutes.js';
import showRoutes from './routes/showRoutes.js';
import seatRoutes from './routes/seatRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import ticketRoutes from './routes/ticketRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

const app = express();

// Security headers
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman) or matching client URL
      if (!origin || origin === config.clientUrl || origin.startsWith('http://localhost:')) {
        callback(null, true);
      } else {
        callback(new Error('Blocked by CORS policy'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-guest-session-id', 'idempotency-key']
  })
);

// Body and Cookie parsers
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser(config.cookieSecret));

// Rate limiting for general API calls
app.use('/api', apiLimiter);

// Health check endpoint
app.get('/api/v1/health', (req, res) => {
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        status: 'UP',
        service: 'CineReserve API',
        environment: config.env,
        timestamp: new Date().toISOString()
      },
      'CineReserve backend service is healthy.'
    )
  );
});

// Mount versioned REST API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/cities', cityRoutes);
app.use('/api/v1/movies', movieRoutes);
app.use('/api/v1/cinemas', cinemaRoutes);
app.use('/api/v1/shows', showRoutes);
app.use('/api/v1', seatRoutes); // covers /api/v1/shows/:showId/holds and /api/v1/holds/:holdId
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/coupons', couponRoutes);
app.use('/api/v1/tickets', ticketRoutes);
app.use('/api/v1/admin', adminRoutes);

// 404 handler for undefined endpoints
app.use('*', (req, res, next) => {
  next(new ApiError(404, `Endpoint ${req.originalUrl} not found on this server.`));
});

// Centralized error handling
app.use(errorMiddleware);

export default app;
