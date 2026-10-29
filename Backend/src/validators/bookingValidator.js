export const validateSeatHold = (data) => {
  const errors = [];
  if (!Array.isArray(data.seatCodes) || data.seatCodes.length === 0) {
    errors.push('At least one seatCode must be provided.');
  }
  if (Array.isArray(data.seatCodes) && data.seatCodes.length > 10) {
    errors.push('Cannot select more than 10 seats per booking transaction.');
  }
  return { isValid: errors.length === 0, errors };
};

export const validateBookingCreation = (data) => {
  const errors = [];
  if (!data.showId) {
    errors.push('Show ID is required.');
  }
  if (!data.holdId) {
    errors.push('Hold ID is required.');
  }
  if (!Array.isArray(data.seatCodes) || data.seatCodes.length === 0) {
    errors.push('Selected seats must be provided.');
  }
  return { isValid: errors.length === 0, errors };
};
