import { isValidObjectId } from 'mongoose';
import { Router } from 'express';
import Activity from '../models/Activity.js';
import Team from '../models/Team.js';
import User from '../models/User.js';

const router = Router();

router.get('/', async (_request, response) => {
  response.json(await User.find().sort({ name: 1 }));
});

router.get('/:id', async (request, response) => {
  if (!isValidObjectId(request.params.id)) {
    response.status(400).json({ error: 'Invalid user id' });
    return;
  }
  const user = await User.findById(request.params.id);
  if (!user) {
    response.status(404).json({ error: 'User not found' });
    return;
  }
  response.json(user);
});

router.post('/', async (request, response) => {
  const user = await User.create({ name: request.body.name, email: request.body.email });
  response.status(201).json(user);
});

router.patch('/:id', async (request, response) => {
  if (!isValidObjectId(request.params.id)) {
    response.status(400).json({ error: 'Invalid user id' });
    return;
  }
  const updates: { name?: unknown; email?: unknown } = {};
  if (request.body.name !== undefined) updates.name = request.body.name;
  if (request.body.email !== undefined) updates.email = request.body.email;
  if (Object.keys(updates).length === 0) {
    response.status(400).json({ error: 'Provide name or email to update' });
    return;
  }

  const user = await User.findByIdAndUpdate(request.params.id, updates, {
    returnDocument: 'after',
    runValidators: true,
  });
  if (!user) {
    response.status(404).json({ error: 'User not found' });
    return;
  }
  response.json(user);
});

router.delete('/:id', async (request, response) => {
  if (!isValidObjectId(request.params.id)) {
    response.status(400).json({ error: 'Invalid user id' });
    return;
  }
  const userId = request.params.id;
  const [hasActivities, belongsToTeam] = await Promise.all([
    Activity.exists({ userId }),
    Team.exists({ members: userId }),
  ]);
  if (hasActivities || belongsToTeam) {
    response.status(409).json({ error: 'Cannot delete a user with activities or team memberships' });
    return;
  }
  const user = await User.findByIdAndDelete(userId);
  if (!user) {
    response.status(404).json({ error: 'User not found' });
    return;
  }
  response.status(204).end();
});

export default router;