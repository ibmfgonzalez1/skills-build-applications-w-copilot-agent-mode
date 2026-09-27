import { isValidObjectId } from 'mongoose';
import { Router } from 'express';
import Workout from '../models/Workout.js';

const router = Router();

router.get('/', async (request, response) => {
  const filter: Record<string, string> = {};
  if (request.query.activityType !== undefined) {
    if (typeof request.query.activityType !== 'string') {
      response.status(400).json({ error: 'Invalid activityType' });
      return;
    }
    filter.activityType = request.query.activityType;
  }
  if (request.query.difficulty !== undefined) {
    if (typeof request.query.difficulty !== 'string') {
      response.status(400).json({ error: 'Invalid difficulty' });
      return;
    }
    filter.difficulty = request.query.difficulty;
  }
  response.json(await Workout.find(filter).sort({ difficulty: 1, title: 1 }));
});

router.get('/:id', async (request, response) => {
  if (!isValidObjectId(request.params.id)) {
    response.status(400).json({ error: 'Invalid workout id' });
    return;
  }
  const workout = await Workout.findById(request.params.id);
  if (!workout) {
    response.status(404).json({ error: 'Workout not found' });
    return;
  }
  response.json(workout);
});

export default router;