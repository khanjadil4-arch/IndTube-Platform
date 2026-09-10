import { Router } from 'express';
import { authenticate, requireCreator } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate);

router.get('/', (_req, res) => {
  res.json({ message: 'Channels API — implementation pending' });
});

router.post('/', requireCreator, (_req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

export default router;
