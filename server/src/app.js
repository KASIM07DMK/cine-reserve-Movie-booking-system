import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { config } from './config/env.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { errorMiddleware } from './middleware/errorMiddleware.js';
import { ApiError } from './utils/ApiError.js';
import { ApiResponse } from './utils/ApiResponse.js';

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

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDist = path.resolve(__dirname, '../../client/dist');

const app = express();

// Security headers with relaxed CSP for external poster images and fonts
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
  })
);

// CORS configuration supporting local dev and public hosted tunnels
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow localhost, clientUrl, and any public hosted tunnel or web domain
      callback(null, true);
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
        timestamp: new Date().toISOString(),
        environment: config.env
      },
      'CineReserve API is operational'
    )
  );
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/cities', cityRoutes);
app.use('/api/v1/movies', movieRoutes);
app.use('/api/v1/cinemas', cinemaRoutes);
app.use('/api/v1/shows', showRoutes);
app.use('/api/v1/seats', seatRoutes);
app.use('/api/v1/holds', seatRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/coupons', couponRoutes);
app.use('/api/v1/tickets', ticketRoutes);
app.use('/api/v1/admin', adminRoutes);

// Serve client production build statically if available
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api')) {
      return next(new ApiError(404, `Endpoint not found: ${req.originalUrl}`));
    }
    return res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// Catch 404 for undefined routes
app.use('*', (req, res, next) => {
  next(new ApiError(404, `Endpoint not found: ${req.originalUrl}`));
});

// Global Error Handler
app.use(errorMiddleware);

export default app;
