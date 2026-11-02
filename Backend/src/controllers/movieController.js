import { MovieService } from '../services/movieService.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getMovies = asyncHandler(async (req, res) => {
  const result = await MovieService.getMovies(req.query);
  return res
    .status(200)
    .json(new ApiResponse(200, result.movies, 'Movies fetched successfully.', result.pagination));
});

export const getFeaturedMovies = asyncHandler(async (req, res) => {
  const movies = await MovieService.getFeaturedMovies();
  return res.status(200).json(new ApiResponse(200, movies, 'Featured movies fetched.'));
});

export const getUpcomingMovies = asyncHandler(async (req, res) => {
  const result = await MovieService.getMovies({ ...req.query, status: 'upcoming' });
  return res
    .status(200)
    .json(new ApiResponse(200, result.movies, 'Upcoming movies fetched.', result.pagination));
});

export const getMovieDetails = asyncHandler(async (req, res) => {
  const movie = await MovieService.getMovieDetails(req.params.movieId);
  return res.status(200).json(new ApiResponse(200, movie, 'Movie details retrieved.'));
});

export const getMovieShows = asyncHandler(async (req, res) => {
  const { movieId } = req.params;
  const { cityId, date, language } = req.query;
  const result = await MovieService.getMovieShows({ movieId, cityId, date, language });
  return res.status(200).json(new ApiResponse(200, result, 'Movie shows retrieved.'));
});
