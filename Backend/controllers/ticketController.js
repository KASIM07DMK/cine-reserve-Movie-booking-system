import { BookingService } from '../services/bookingService.js';
import { TicketService } from '../services/ticketService.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getTicketByBookingId = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  const userId = req.user?._id || null;
  const isAdmin = req.user?.role === 'admin';

  const booking = await BookingService.getBookingDetails(bookingId, userId, isAdmin);
  return res.status(200).json(new ApiResponse(200, booking, 'Digital ticket retrieved.'));
});

export const validateTicket = asyncHandler(async (req, res) => {
  const { token, showId } = req.body;
  const validatedByUserId = req.user._id;

  const result = await TicketService.validateTicket({
    token,
    showId,
    validatedByUserId
  });

  return res.status(200).json(new ApiResponse(200, result, result.message));
});
