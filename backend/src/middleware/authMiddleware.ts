/**
 * Auth middleware — extracts and verifies JWT access tokens.
 * Attaches the user payload to the request for downstream handlers.
 * Provides role-based guards for protected, creator, admin, and owner routes.
 */

import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../services/tokenService.js';

export interface AuthenticatedRequest extends Request {
  user?: { sub: string; role: string };
}

export function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  const token = header.slice(7);
  const payload = verifyAccessToken(token);
  if (!payload) {
    res.status(401).json({ error: 'Invalid or expired token' });
    return;
  }

  req.user = payload;
  next();
}

export function requireRole(...roles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }
    next();
  };
}

export const requireCreator = requireRole('CREATOR', 'ADMIN', 'OWNER');
export const requireAdmin = requireRole('ADMIN', 'OWNER');
export const requireOwner = requireRole('OWNER');
