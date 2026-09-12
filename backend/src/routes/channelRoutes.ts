/**
 * Channel routes
 *   GET    /api/channels/:id                     — channel metadata
 *   POST   /api/channels/:id/subscribe           — subscribe
 *   DELETE /api/channels/:id/subscribe           — unsubscribe
 *   GET    /api/channels/:id/subscription-status — check subscription
 */

import { Router, type Response } from 'express';
import { authenticate, type AuthenticatedRequest } from '../middleware/authMiddleware.js';
import {
  subscribe,
  unsubscribe,
  getSubscriptionStatus,
  InteractionError,
} from '../services/interactionService.js';
import { query } from '../db/index.js';

const router = Router();

// GET /api/channels/:id — public
router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const rows = await query(
      `SELECT
         c.id, c.name, c.handle, c.avatar_url, c.banner_url,
         c.description, c.subscriber_count, c.video_count,
         c.is_verified, c.created_at,
         u.display_name AS owner_name
       FROM channels c
       JOIN users u ON c.owner_id = u.id
       WHERE c.id = $1`,
      [req.params.id],
    );
    if (rows.length === 0) {
      res.status(404).json({ error: 'Channel not found' });
      return;
    }
    res.json({ channel: rows[0] });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Authenticated routes ────────────────────────────────────────────────────

router.use(authenticate);

// POST /api/channels/:id/subscribe
router.post('/:id/subscribe', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await subscribe(req.user!.sub, req.params.id);
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

// DELETE /api/channels/:id/subscribe
router.delete('/:id/subscribe', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await unsubscribe(req.user!.sub, req.params.id);
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

// GET /api/channels/:id/subscription-status
router.get('/:id/subscription-status', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await getSubscriptionStatus(req.user!.sub, req.params.id);
    res.json(result);
  } catch (err) {
    console.error('Subscription status error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
