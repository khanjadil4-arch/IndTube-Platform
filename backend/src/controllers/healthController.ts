import { Request, Response } from 'express';

export function getHealth(_req: Request, res: Response): void {
  res.status(200).json({
    status: 'ok',
    service: 'indtube-api',
    timestamp: new Date().toISOString(),
  });
}
