import { Router } from 'express';
import {
  getMovies,
  getFeaturedMovies,
  getUpcomingMovies,
  getMovieDetails,
  getMovieShows
} from '../controllers/movieController.js';

const router = Router();

router.get('/', getMovies);
router.get('/featured', getFeaturedMovies);
router.get('/upcoming', getUpcomingMovies);
router.get('/:movieId', getMovieDetails);
router.get('/:movieId/shows', getMovieShows);

export default router;
