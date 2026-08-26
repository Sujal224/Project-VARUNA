import { Router } from 'express';
import { getConditions } from './marine.controller';

const router = Router();

router.get('/conditions', getConditions);

export default router;