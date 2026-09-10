import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate);

router.post('/channels/:channelId', (_req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

router.delete('/channels/:channelId', (_req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

router.get('/channels/:channelId/status', (_req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

export default router;
