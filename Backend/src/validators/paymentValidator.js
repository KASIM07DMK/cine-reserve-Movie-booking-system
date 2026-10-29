export const validatePaymentVerification = (data) => {
  const errors = [];
  if (!data.bookingId) {
    errors.push('Booking ID is required.');
  }
  if (!data.providerOrderId) {
    errors.push('Payment provider order ID is required.');
  }
  if (!data.providerPaymentId) {
    errors.push('Payment provider transaction ID is required.');
  }
  return { isValid: errors.length === 0, errors };
};
