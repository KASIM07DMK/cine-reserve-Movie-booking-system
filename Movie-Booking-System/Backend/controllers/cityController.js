import { City } from '../models/City.js';
import { ApiResponse } from '../../../server/src/utils/ApiResponse.js';
import { asyncHandler } from '../../../server/src/utils/asyncHandler.js';
import { ApiError } from '../../../server/src/utils/ApiError.js';

export const getCities = asyncHandler(async (req, res) => {
  const { popular, search } = req.query;
  const filter = { isActive: true };

  if (popular === 'true') {
    filter.isPopular = true;
  }

  if (search) {
    filter.name = { $regex: search, $options: 'i' };
  }

  const cities = await City.find(filter).sort({ isPopular: -1, name: 1 });
  return res.status(200).json(new ApiResponse(200, cities, 'Cities retrieved successfully.'));
});

export const getCityById = asyncHandler(async (req, res) => {
  const { cityId } = req.params;
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(cityId);
  const query = isObjectId ? { _id: cityId } : { slug: cityId };

  const city = await City.findOne(query);
  if (!city) {
    throw new ApiError(404, 'City not found.');
  }

  return res.status(200).json(new ApiResponse(200, city, 'City details retrieved.'));
});
