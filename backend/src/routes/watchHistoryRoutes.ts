/**
 * Watch history routes
 *   GET    /api/watch-history              — list user's watch history
 *   POST   /api/watch-history/videos/:videoId — upsert watch progress
 *   DELETE /api/watch-history/videos/:videoId — delete single history entry
 *   DELETE /api/watch-history              — clear all history
 */

import { Router, type Response } from 'express';
import { authenticate, type AuthenticatedRequest } from '../middleware/authMiddleware.js';
import {
  getWatchHistory,
  upsertWatchProgress,
  deleteHistoryEntry,
  clearWatchHistory,
  InteractionError,
} from '../services/interactionService.js';

const router = Router();

router.use(authenticate);

// GET /api/watch-history
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const history = await getWatchHistory(req.user!.sub);
    res.json({ history });
  } catch (err) {
    console.error('Get watch history error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/watch-history/videos/:videoId
router.post('/videos/:videoId', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { watchedPosition } = req.body as { watchedPosition?: number };
    if (watchedPosition === undefined || typeof watchedPosition !== 'number') {
      res.status(400).json({ error: 'watchedPosition is required' });
      return;
    }

    await upsertWatchProgress(req.user!.sub, req.params.videoId, watchedPosition);
    res.json({ success: true });
  } catch (err) {
    if (err instanceof InteractionError) {
      res.status(err.statusCode).json({ error: err.message });
      return;
    }
    console.error('Save watch progress error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/watch-history/videos/:videoId
router.delete('/videos/:videoId', async (req: AuthenticatedRequest, res: Response) => {
  try {
    await deleteHistoryEntry(req.user!.sub, req.params.videoId);
    res.json({ success: true });
  } catch (err) {
    console.error('Delete history entry error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/watch-history
router.delete('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    await clearWatchHistory(req.user!.sub);
    res.json({ success: true });
  } catch (err) {
    console.error('Clear watch history error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
