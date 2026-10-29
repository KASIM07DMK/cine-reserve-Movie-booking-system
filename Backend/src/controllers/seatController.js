import { SeatService } from '../services/seatService.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const holdSeats = asyncHandler(async (req, res) => {
  const { showId } = req.params;
  const { seatCodes } = req.body;
  const userId = req.user?._id || null;
  const guestSessionId = req.headers['x-guest-session-id'] || null;

  const result = await SeatService.holdSeats({
    showId,
    seatCodes,
    userId,
    guestSessionId
  });

  return res.status(200).json(new ApiResponse(200, result, 'Seats held temporarily for booking.'));
});

export const releaseHold = asyncHandler(async (req, res) => {
  const { holdId } = req.params;
  const userId = req.user?._id || null;
  const guestSessionId = req.headers['x-guest-session-id'] || null;

  const result = await SeatService.releaseHold(holdId, userId, guestSessionId);
  return res.status(200).json(new ApiResponse(200, result, 'Seat hold released.'));
});
