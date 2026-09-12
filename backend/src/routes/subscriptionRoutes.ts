/**
 * Subscription routes
 *   POST   /api/subscriptions/channels/:channelId         — subscribe
 *   DELETE /api/subscriptions/channels/:channelId         — unsubscribe
 *   GET    /api/subscriptions/channels/:channelId/status  — check subscription status
 */

import { Router, type Response } from 'express';
import { authenticate, type AuthenticatedRequest } from '../middleware/authMiddleware.js';
import {
  subscribe,
  unsubscribe,
  getSubscriptionStatus,
  InteractionError,
} from '../services/interactionService.js';

const router = Router();

router.use(authenticate);

// POST /api/subscriptions/channels/:channelId
router.post('/channels/:channelId', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await subscribe(req.user!.sub, req.params.channelId);
    res.json(result);
  } catch (err) {
    if (err instanceof InteractionError) {
      res.status(err.statusCode).json({ error: err.message });
      return;
    }
    console.error('Subscribe error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/subscriptions/channels/:channelId
router.delete('/channels/:channelId', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await unsubscribe(req.user!.sub, req.params.channelId);
    res.json(result);
  } catch (err) {
    if (err instanceof InteractionError) {
      res.status(err.statusCode).json({ error: err.message });
      return;
    }
    console.error('Unsubscribe error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/subscriptions/channels/:channelId/status
router.get('/channels/:channelId/status', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await getSubscriptionStatus(req.user!.sub, req.params.channelId);
    res.json(result);
  } catch (err) {
    console.error('Subscription status error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
