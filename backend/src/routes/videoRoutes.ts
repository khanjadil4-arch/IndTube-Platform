import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate);

router.get('/', (_req, res) => {
  res.json({ message: 'Videos API — implementation pending' });
});

router.post('/', (_req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

router.get('/:id', (_req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

export default router;
