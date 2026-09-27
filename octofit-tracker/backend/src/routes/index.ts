import { Router } from 'express';
import activities from './activities.js';
import leaderboard from './leaderboard.js';
import teams from './teams.js';
import users from './users.js';
import workouts from './workouts.js';

const router = Router();

router.use('/users', users);
router.use('/teams', teams);
router.use('/activities', activities);
router.use('/leaderboard', leaderboard);
router.use('/workouts', workouts);

export default router;