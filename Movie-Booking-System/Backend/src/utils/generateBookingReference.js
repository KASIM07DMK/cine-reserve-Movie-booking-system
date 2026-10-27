import crypto from 'crypto';

export const generateBookingReference = () => {
  const year = new Date().getFullYear();
  const randomChars = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `CR-${year}-${randomChars}`;
};
