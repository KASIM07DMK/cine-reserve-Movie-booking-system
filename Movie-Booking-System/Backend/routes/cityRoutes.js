import { Router } from 'express';
import { getCities, getCityById } from '../controllers/cityController.js';

const router = Router();

router.get('/', getCities);
router.get('/:cityId', getCityById);

export default router;
