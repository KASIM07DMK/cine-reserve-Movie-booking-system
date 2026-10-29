import { BookingService } from '../../../server/src/services/bookingService.js';
import { ApiResponse } from '../../../server/src/utils/ApiResponse.js';
import { asyncHandler } from '../../../server/src/utils/asyncHandler.js';

export const previewBooking = asyncHandler(async (req, res) => {
  const { showId, holdId, couponCode } = req.body;
  const userId = req.user?._id || null;

  const result = await BookingService.previewBooking({
    showId,
    holdId,
    couponCode,
    userId
  });

  return res.status(200).json(new ApiResponse(200, result, 'Booking preview generated.'));
});

export const createBooking = asyncHandler(async (req, res) => {
  const { showId, holdId, couponCode, guestDetails } = req.body;
  const user = req.user || null;

  const booking = await BookingService.createPendingBooking({
    showId,
    holdId,
    couponCode,
    user,
    guestDetails
  });

  return res.status(201).json(new ApiResponse(201, booking, 'Booking created. Proceed to payment.'));
});

export const getMyBookings = asyncHandler(async (req, res) => {
  const bookings = await BookingService.getUserBookings(req.user._id);
  return res.status(200).json(new ApiResponse(200, bookings, 'User bookings retrieved.'));
});

export const getBookingById = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  const userId = req.user?._id || null;
  const isAdmin = req.user?.role === 'admin';

  const booking = await BookingService.getBookingDetails(bookingId, userId, isAdmin);
  return res.status(200).json(new ApiResponse(200, booking, 'Booking details retrieved.'));
});

export const cancelBooking = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  const { reason } = req.body;

  const result = await BookingService.cancelBooking(bookingId, req.user._id, reason);
  return res.status(200).json(new ApiResponse(200, result, 'Booking cancelled successfully.'));
});
