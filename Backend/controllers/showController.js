import { ShowService } from '../src/services/showService.js';
import { ApiResponse } from '../src/utils/ApiResponse.js';
import { asyncHandler } from '../src/utils/asyncHandler.js';

export const getShowById = asyncHandler(async (req, res) => {
  const show = await ShowService.getShowDetails(req.params.showId);
  return res.status(200).json(new ApiResponse(200, show, 'Show details retrieved.'));
});

export const getShowSeats = asyncHandler(async (req, res) => {
  const { showId } = req.params;
  const guestSessionId = req.headers['x-guest-session-id'] || null;
  const userId = req.user?._id || null;

  const result = await ShowService.getShowSeats(showId, userId, guestSessionId);
  return res.status(200).json(new ApiResponse(200, result, 'Interactive seating map retrieved.'));
});
