/**
 * Creator Studio routes
 *   GET   /api/creator/analytics        — dashboard analytics for the creator
 *   GET   /api/creator/videos           — list creator's own videos
 *   PATCH /api/creator/videos/:id       — update video metadata
 *   DELETE /api/creator/videos/:id      — soft-delete (mark REMOVED) a video
 *
 * All routes require CREATOR, ADMIN, or OWNER role. Channel ownership is
 * resolved server-side from the authenticated user — never from the client.
 */

import { Router, type Response } from 'express';
import { authenticate, requireCreator, type AuthenticatedRequest } from '../middleware/authMiddleware.js';
import {
  getCreatorAnalytics,
  getCreatorVideos,
  updateCreatorVideo,
  deleteCreatorVideo,
} from '../services/creatorService.js';
import { InteractionError } from '../services/interactionService.js';

const router = Router();

router.use(authenticate, requireCreator);

// GET /api/creator/analytics
router.get('/analytics', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const analytics = await getCreatorAnalytics(req.user!.sub);
    res.json(analytics);
  } catch (err) {
    if (err instanceof InteractionError) {
      res.status(err.statusCode).json({ error: err.message });
      return;
    }
    console.error('Creator analytics error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/creator/videos
router.get('/videos', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const limit = Math.min(parseInt(String(req.query.limit)) || 50, 100);
    const offset = Math.max(parseInt(String(req.query.offset)) || 0, 0);
    const result = await getCreatorVideos(req.user!.sub, limit, offset);
    res.json(result);
  } catch (err) {
    if (err instanceof InteractionError) {
      res.status(err.statusCode).json({ error: err.message });
      return;
    }
    console.error('Creator videos error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/creator/videos/:id
router.patch('/videos/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const updates = req.body as {
      title?: string;
      description?: string;
      visibility?: string;
      categoryId?: string | null;
    };

    const video = await updateCreatorVideo(req.user!.sub, req.params.id, updates);
    res.json({ video });
  } catch (err) {
    if (err instanceof InteractionError) {
      res.status(err.statusCode).json({ error: err.message });
      return;
    }
    console.error('Update creator video error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/creator/videos/:id
router.delete('/videos/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    await deleteCreatorVideo(req.user!.sub, req.params.id);
    res.json({ success: true });
  } catch (err) {
    if (err instanceof InteractionError) {
      res.status(err.statusCode).json({ error: err.message });
      return;
    }
    console.error('Delete creator video error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
