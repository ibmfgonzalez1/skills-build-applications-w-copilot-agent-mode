import { isValidObjectId } from 'mongoose';
import { Router } from 'express';
import Activity from '../models/Activity.js';
import Team from '../models/Team.js';
import User from '../models/User.js';

const router = Router();

async function memberIdsExist(memberIds: string[]): Promise<boolean> {
  return (await User.countDocuments({ _id: { $in: memberIds } })) === new Set(memberIds).size;
}

router.get('/', async (_request, response) => {
  response.json(await Team.find().populate('members', 'name email').sort({ name: 1 }));
});

router.get('/:id', async (request, response) => {
  if (!isValidObjectId(request.params.id)) {
    response.status(400).json({ error: 'Invalid team id' });
    return;
  }
  const team = await Team.findById(request.params.id).populate('members', 'name email');
  if (!team) {
    response.status(404).json({ error: 'Team not found' });
    return;
  }
  response.json(team);
});

router.post('/', async (request, response) => {
  const members = request.body.members ?? [];
  if (!Array.isArray(members) || members.some((id: unknown) => typeof id !== 'string' || !isValidObjectId(id))) {
    response.status(400).json({ error: 'members must be an array of valid user ids' });
    return;
  }
  if (!(await memberIdsExist(members))) {
    response.status(400).json({ error: 'One or more members do not exist' });
    return;
  }
  const team = await Team.create({
    name: request.body.name,
    description: request.body.description,
    members: [...new Set(members)],
  });
  response.status(201).json(team);
});

router.patch('/:id', async (request, response) => {
  if (!isValidObjectId(request.params.id)) {
    response.status(400).json({ error: 'Invalid team id' });
    return;
  }
  const updates: { name?: unknown; description?: unknown; members?: string[] } = {};
  if (request.body.name !== undefined) updates.name = request.body.name;
  if (request.body.description !== undefined) updates.description = request.body.description;
  if (request.body.members !== undefined) {
    const members = request.body.members;
    if (!Array.isArray(members) || members.some((id: unknown) => typeof id !== 'string' || !isValidObjectId(id))) {
      response.status(400).json({ error: 'members must be an array of valid user ids' });
      return;
    }
    if (!(await memberIdsExist(members))) {
      response.status(400).json({ error: 'One or more members do not exist' });
      return;
    }
    updates.members = [...new Set(members)];
  }
  if (Object.keys(updates).length === 0) {
    response.status(400).json({ error: 'Provide name, description, or members to update' });
    return;
  }

  const team = await Team.findByIdAndUpdate(request.params.id, updates, {
    returnDocument: 'after',
    runValidators: true,
  }).populate('members', 'name email');
  if (!team) {
    response.status(404).json({ error: 'Team not found' });
    return;
  }
  response.json(team);
});

router.delete('/:id', async (request, response) => {
  if (!isValidObjectId(request.params.id)) {
    response.status(400).json({ error: 'Invalid team id' });
    return;
  }
  if (await Activity.exists({ teamId: request.params.id })) {
    response.status(409).json({ error: 'Cannot delete a team with recorded activities' });
    return;
  }
  const team = await Team.findByIdAndDelete(request.params.id);
  if (!team) {
    response.status(404).json({ error: 'Team not found' });
    return;
  }
  response.status(204).end();
});

export default router;