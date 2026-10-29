import crypto from 'crypto';
import { config } from '../config/env.js';

export const generateTicketToken = (bookingReference, showId) => {
  const payload = `${bookingReference}:${showId}`;
  const hmac = crypto.createHmac('sha256', config.jwtSecret).update(payload).digest('hex');
  return `${bookingReference}.${hmac.substring(0, 32)}`;
};

export const verifyTicketToken = (token, showId) => {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [bookingReference, providedHmac] = parts;
  const expectedPayload = `${bookingReference}:${showId}`;
  const expectedHmac = crypto
    .createHmac('sha256', config.jwtSecret)
    .update(expectedPayload)
    .digest('hex')
    .substring(0, 32);

  return crypto.timingSafeEqual(Buffer.from(providedHmac), Buffer.from(expectedHmac));
};
