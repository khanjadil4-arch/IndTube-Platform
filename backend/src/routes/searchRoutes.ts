import { Router } from 'express';

const router = Router();

router.get('/', (_req, res) => {
  res.json({ message: 'Search API — implementation pending' });
});

export default router;
