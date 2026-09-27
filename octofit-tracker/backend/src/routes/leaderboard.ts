import { Router } from 'express';
import Leaderboard from '../models/Leaderboard.js';
import { getActivityPeriod } from '../services/leaderboard.js';

const router = Router();
const periodPattern = /^\d{4}-(0[1-9]|1[0-2])$/;

router.get('/', async (request, response) => {
  const period = typeof request.query.period === 'string'
    ? request.query.period
    : getActivityPeriod(new Date());
  if (!periodPattern.test(period)) {
    response.status(400).json({ error: 'period must use YYYY-MM format' });
    return;
  }
  const entries = await Leaderboard.find({ period })
    .populate('participantId', 'name')
    .sort({ participantType: 1, rank: 1 });
  response.json({ period, entries });
});

export default router;