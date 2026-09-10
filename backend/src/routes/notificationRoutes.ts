import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate);

router.get('/', (_req, res) => {
  res.json({ message: 'Notifications API — implementation pending' });
});

router.patch('/:id/read', (_req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

router.patch('/read-all', (_req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

export default router;
