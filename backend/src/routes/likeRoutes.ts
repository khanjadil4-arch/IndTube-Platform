/**
 * Like / Dislike routes
 *   POST   /api/likes/videos/:videoId     — set like or dislike
 *   DELETE /api/likes/videos/:videoId     — remove reaction
 *   GET    /api/likes/videos/:videoId     — get current user's reaction + counts
 */

import { Router, type Response } from 'express';
import { authenticate, type AuthenticatedRequest } from '../middleware/authMiddleware.js';
import {
  setVideoReaction,
  removeVideoReaction,
  getVideoReaction,
  InteractionError,
} from '../services/interactionService.js';

const router = Router();

router.use(authenticate);

// POST /api/likes/videos/:videoId
router.post('/videos/:videoId', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { videoId } = req.params;
    const { state } = req.body as { state: string };

    if (state !== 'LIKE' && state !== 'DISLIKE') {
      res.status(400).json({ error: 'state must be LIKE or DISLIKE' });
      return;
    }

    const result = await setVideoReaction(req.user!.sub, videoId, state);
    res.json(result);
  } catch (err) {
    if (err instanceof InteractionError) {
      res.status(err.statusCode).json({ error: err.message });
      return;
    }
    console.error('Set reaction error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/likes/videos/:videoId
router.delete('/videos/:videoId', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { videoId } = req.params;
    const result = await removeVideoReaction(req.user!.sub, videoId);
    res.json(result);
  } catch (err) {
    if (err instanceof InteractionError) {
      res.status(err.statusCode).json({ error: err.message });
      return;
    }
    console.error('Remove reaction error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/likes/videos/:videoId
router.get('/videos/:videoId', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { videoId } = req.params;
    const result = await getVideoReaction(req.user!.sub, videoId);
    res.json(result);
  } catch (err) {
    console.error('Get reaction error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
