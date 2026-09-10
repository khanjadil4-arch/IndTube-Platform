import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate);

router.post('/videos/:videoId', (_req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

router.delete('/videos/:videoId', (_req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

router.get('/', (_req, res) => {
  res.json({ message: 'Saved videos API — implementation pending' });
});

export default router;
