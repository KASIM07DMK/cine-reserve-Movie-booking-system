import { Router } from 'express';
import { getCinemas, getCinemaById, getCinemaShows } from '../controllers/cinemaController.js';

const router = Router();

router.get('/', getCinemas);
router.get('/:cinemaId', getCinemaById);
router.get('/:cinemaId/shows', getCinemaShows);

export default router;
