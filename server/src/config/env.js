import dotenv from 'dotenv';
dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cinereserve',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  jwtSecret: process.env.JWT_SECRET || 'cinereserve_super_secret_jwt_key_2026_dev_mode',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  cookieSecret: process.env.COOKIE_SECRET || 'cinereserve_cookie_signing_secret_dev',
  seatHoldDurationMinutes: parseInt(process.env.SEAT_HOLD_DURATION_MINUTES, 10) || 5,
  bookingFeePercentage: parseFloat(process.env.BOOKING_FEE_PERCENTAGE) || 10, // 10%
  taxPercentage: parseFloat(process.env.GST_TAX_PERCENTAGE) || 18, // 18% GST
  payment: {
    provider: process.env.PAYMENT_PROVIDER || 'test',
    keyId: process.env.PAYMENT_KEY_ID || 'test_key',
    keySecret: process.env.PAYMENT_KEY_SECRET || 'test_secret',
    webhookSecret: process.env.PAYMENT_WEBHOOK_SECRET || 'test_webhook_secret'
  }
};
