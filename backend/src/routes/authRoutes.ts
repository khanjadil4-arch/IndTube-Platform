/**
 * Auth routes — signup, login, logout, refresh, me.
 * All endpoints return safe user data only (no password hashes).
 */

import { Router, Response } from 'express';
import {
  signup,
  login,
  refresh,
  logout,
  getUserById,
  AuthError,
} from '../services/authService.js';
import type { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/signup', async (req, res: Response) => {
  try {
    const { email, username, password, displayName } = req.body;
    if (!email || !username || !password) {
      res.status(400).json({ error: 'Email, username, and password are required' });
      return;
    }
    const result = await signup(email, username, password, displayName);
    res.status(201).json(result);
  } catch (err) {
    if (err instanceof AuthError) {
      res.status(err.statusCode).json({ error: err.message });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/login', async (req, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }
    const result = await login(email, password);
    res.status(200).json(result);
  } catch (err) {
    if (err instanceof AuthError) {
      res.status(err.statusCode).json({ error: err.message });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/logout', async (req, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await logout(refreshToken);
    }
    res.status(200).json({ success: true });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/refresh', async (req, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(400).json({ error: 'Refresh token is required' });
      return;
    }
    const result = await refresh(refreshToken);
    res.status(200).json(result);
  } catch (err) {
    if (err instanceof AuthError) {
      res.status(err.statusCode).json({ error: err.message });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get(
  '/me',
  authenticate,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = await getUserById(req.user!.sub);
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      res.status(200).json({ user });
    } catch {
      res.status(500).json({ error: 'Internal server error' });
    }
  },
);

export default router;
