import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate);

router.get('/videos/:videoId', (_req, res) => {
  res.json({ message: 'Comments API — implementation pending' });
});

router.post('/videos/:videoId', (_req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

export default router;
