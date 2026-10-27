import { Cinema } from '../models/Cinema.js';
import { Show } from '../models/Show.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

export const getCinemas = asyncHandler(async (req, res) => {
  const { cityId, search } = req.query;
  const filter = { isActive: true };

  if (cityId) {
    filter.city = cityId;
  }

  if (search) {
    filter.name = { $regex: search, $options: 'i' };
  }

  const cinemas = await Cinema.find(filter).populate('city', 'name state').sort({ name: 1 });
  return res.status(200).json(new ApiResponse(200, cinemas, 'Cinemas retrieved successfully.'));
});

export const getCinemaById = asyncHandler(async (req, res) => {
  const { cinemaId } = req.params;
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(cinemaId);
  const query = isObjectId ? { _id: cinemaId } : { slug: cinemaId };

  const cinema = await Cinema.findOne(query).populate('city', 'name state');
  if (!cinema) {
    throw new ApiError(404, 'Cinema not found.');
  }

  return res.status(200).json(new ApiResponse(200, cinema, 'Cinema details retrieved.'));
});

export const getCinemaShows = asyncHandler(async (req, res) => {
  const { cinemaId } = req.params;
  const { date } = req.query;

  const targetDate = date ? new Date(date) : new Date();
  const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
  const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
  const now = new Date();
  const queryStart = startOfDay < now ? now : startOfDay;

  const shows = await Show.find({
    cinema: cinemaId,
    startTime: { $gte: queryStart, $lte: endOfDay },
    status: 'scheduled'
  })
    .populate('movie')
    .populate('screen')
    .sort({ startTime: 1 });

  return res.status(200).json(new ApiResponse(200, shows, 'Cinema shows retrieved.'));
});
