/**
 * Notification routes
 *   GET    /api/notifications           — list user's notifications
 *   GET    /api/notifications/unread     — get unread count
 *   GET    /api/notifications/unread-count — get unread count (alt)
 *   POST   /api/notifications/:id/read   — mark single notification as read
 *   POST   /api/notifications/read-all    — mark all as read
 *   DELETE /api/notifications/:id         — delete a notification
 */

import { Router, type Response } from 'express';
import { authenticate, type AuthenticatedRequest } from '../middleware/authMiddleware.js';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  NotificationError,
} from '../services/notificationService.js';

const router = Router();

router.use(authenticate);

// GET /api/notifications
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const limit = Math.min(parseInt(String(req.query.limit)) || 20, 100);
    const offset = Math.max(parseInt(String(req.query.offset)) || 0, 0);
    const result = await getNotifications(req.user!.sub, limit, offset);
    res.json(result);
  } catch (err) {
    console.error('Get notifications error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/notifications/unread
router.get('/unread', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const count = await getUnreadCount(req.user!.sub);
    res.json({ count });
  } catch (err) {
    console.error('Get unread count error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/notifications/unread-count
router.get('/unread-count', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const count = await getUnreadCount(req.user!.sub);
    res.json({ count });
  } catch (err) {
    console.error('Get unread count error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/notifications/:id/read
router.post('/:id/read', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const notificationId = req.params.id;
    if (!notificationId) {
      res.status(400).json({ error: 'Notification ID is required' });
      return;
    }
    await markAsRead(req.user!.sub, notificationId);
    res.json({ success: true });
  } catch (err) {
    if (err instanceof NotificationError) {
      res.status(err.statusCode).json({ error: err.message });
      return;
    }
    console.error('Mark notification read error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/notifications/read-all
router.post('/read-all', async (req: AuthenticatedRequest, res: Response) => {
  try {
    await markAllAsRead(req.user!.sub);
    res.json({ success: true });
  } catch (err) {
    if (err instanceof NotificationError) {
      res.status(err.statusCode).json({ error: err.message });
      return;
    }
    console.error('Mark all read error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/notifications/:id
router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const notificationId = req.params.id;
    if (!notificationId) {
      res.status(400).json({ error: 'Notification ID is required' });
      return;
    }
    await deleteNotification(req.user!.sub, notificationId);
    res.json({ success: true });
  } catch (err) {
    if (err instanceof NotificationError) {
      res.status(err.statusCode).json({ error: err.message });
      return;
    }
    console.error('Delete notification error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
