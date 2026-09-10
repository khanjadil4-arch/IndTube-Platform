import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate);

router.post('/', (_req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

router.get('/', requireAdmin, (_req, res) => {
  res.json({ message: 'Reports API — implementation pending' });
});

router.patch('/:id', requireAdmin, (_req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

export default router;
