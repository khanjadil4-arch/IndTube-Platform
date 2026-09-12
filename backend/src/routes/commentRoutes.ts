/**
 * Comment routes
 *   GET    /api/comments/videos/:videoId        — list top-level comments
 *   POST   /api/comments/videos/:videoId        — create comment or reply
 *   GET    /api/comments/:commentId/replies     — list replies
 *   PATCH  /api/comments/:commentId             — edit own comment
 *   DELETE /api/comments/:commentId             — delete own comment
 *   POST   /api/comments/:commentId/like        — toggle like on comment
 */

import { Router, type Response } from 'express';
import { authenticate, type AuthenticatedRequest } from '../middleware/authMiddleware.js';
import {
  getCommentsByVideo,
  getReplies,
  createComment,
  updateComment,
  deleteComment,
  toggleCommentLike,
  InteractionError,
} from '../services/interactionService.js';

const router = Router();

// GET /api/comments/videos/:videoId — public (no auth required to read)
router.get('/videos/:videoId', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const comments = await getCommentsByVideo(req.user?.sub ?? null, req.params.videoId);
    res.json({ comments });
  } catch (err) {
    console.error('Get comments error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/comments/:commentId/replies — public
router.get('/:commentId/replies', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const replies = await getReplies(req.user?.sub ?? null, req.params.commentId);
    res.json({ replies });
  } catch (err) {
    console.error('Get replies error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// All following routes require authentication
router.use(authenticate);

// POST /api/comments/videos/:videoId
router.post('/videos/:videoId', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { text, parentCommentId } = req.body as {
      text: string;
      parentCommentId?: string;
    };

    if (!text || typeof text !== 'string') {
      res.status(400).json({ error: 'text is required' });
      return;
    }

    const comment = await createComment(
      req.user!.sub,
      req.params.videoId,
      text,
      parentCommentId ?? null,
    );
    res.status(201).json({ comment });
  } catch (err) {
    if (err instanceof InteractionError) {
      res.status(err.statusCode).json({ error: err.message });
      return;
    }
    console.error('Create comment error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/comments/:commentId
router.patch('/:commentId', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { text } = req.body as { text: string };

    if (!text || typeof text !== 'string') {
      res.status(400).json({ error: 'text is required' });
      return;
    }

    const comment = await updateComment(
      req.user!.sub,
      req.params.commentId,
      text,
      req.user!.role,
    );
    res.json({ comment });
  } catch (err) {
    if (err instanceof InteractionError) {
      res.status(err.statusCode).json({ error: err.message });
      return;
    }
    console.error('Update comment error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/comments/:commentId
router.delete('/:commentId', async (req: AuthenticatedRequest, res: Response) => {
  try {
    await deleteComment(req.user!.sub, req.params.commentId, req.user!.role);
    res.status(204).json({ success: true });
  } catch (err) {
    if (err instanceof InteractionError) {
      res.status(err.statusCode).json({ error: err.message });
      return;
    }
    console.error('Delete comment error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/comments/:commentId/like
router.post('/:commentId/like', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await toggleCommentLike(req.user!.sub, req.params.commentId);
    res.json(result);
  } catch (err) {
    if (err instanceof InteractionError) {
      res.status(err.statusCode).json({ error: err.message });
      return;
    }
    console.error('Toggle comment like error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
