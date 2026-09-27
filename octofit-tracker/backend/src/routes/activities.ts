import { isValidObjectId } from 'mongoose';
import { Router } from 'express';
import Activity from '../models/Activity.js';
import Team from '../models/Team.js';
import User from '../models/User.js';
import { getActivityPeriod, rebuildLeaderboard } from '../services/leaderboard.js';

const activityTypes = ['run', 'walk', 'strength'];
const router = Router();

function validDate(value: unknown): Date | undefined {
  if (value === undefined) return undefined;
  const date = new Date(value as string);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

async function validateTeamMembership(teamId: string | undefined, userId: string): Promise<boolean> {
  if (!teamId) return true;
  if (!isValidObjectId(teamId)) return false;
  const team = await Team.findById(teamId).select('members');
  return Boolean(team?.members.some((member) => member.toString() === userId));
}

router.get('/', async (request, response) => {
  const filter: Record<string, unknown> = {};
  for (const field of ['userId', 'teamId'] as const) {
    const value = request.query[field];
    if (value !== undefined) {
      if (typeof value !== 'string' || !isValidObjectId(value)) {
        response.status(400).json({ error: `Invalid ${field}` });
        return;
      }
      filter[field] = value;
    }
  }

  const from = validDate(request.query.from);
  const to = validDate(request.query.to);
  if ((request.query.from !== undefined && !from) || (request.query.to !== undefined && !to)) {
    response.status(400).json({ error: 'from and to must be valid dates' });
    return;
  }
  if (from && to && from > to) {
    response.status(400).json({ error: 'from must be earlier than or equal to to' });
    return;
  }
  if (from || to) {
    filter.occurredAt = {
      ...(from ? { $gte: from } : {}),
      ...(to ? { $lte: to } : {}),
    };
  }

  response.json(
    await Activity.find(filter)
      .populate('userId', 'name email')
      .populate('teamId', 'name')
      .sort({ occurredAt: -1 }),
  );
});

router.post('/', async (request, response) => {
  const userId = request.body.userId;
  const teamId = request.body.teamId as string | undefined;
  const durationMinutes = Number(request.body.durationMinutes);
  const occurredAt = validDate(request.body.occurredAt) ?? new Date();
  const distanceMeters = request.body.distanceMeters === undefined
    ? undefined
    : Number(request.body.distanceMeters);

  if (typeof userId !== 'string' || !isValidObjectId(userId) || !(await User.exists({ _id: userId }))) {
    response.status(400).json({ error: 'userId must reference an existing user' });
    return;
  }
  if (teamId !== undefined && !(await validateTeamMembership(teamId, userId))) {
    response.status(400).json({ error: 'teamId must reference a team that includes the user' });
    return;
  }
  if (!activityTypes.includes(request.body.type)) {
    response.status(400).json({ error: 'type must be run, walk, or strength' });
    return;
  }
  if (!Number.isFinite(durationMinutes) || durationMinutes < 1) {
    response.status(400).json({ error: 'durationMinutes must be a positive number' });
    return;
  }
  if (request.body.occurredAt !== undefined && !validDate(request.body.occurredAt)) {
    response.status(400).json({ error: 'occurredAt must be a valid date' });
    return;
  }
  if (distanceMeters !== undefined && (!Number.isFinite(distanceMeters) || distanceMeters < 0)) {
    response.status(400).json({ error: 'distanceMeters must be a non-negative number' });
    return;
  }

  const activity = await Activity.create({
    userId,
    teamId,
    type: request.body.type,
    durationMinutes,
    distanceMeters,
    points: durationMinutes,
    occurredAt,
  });
  await rebuildLeaderboard(getActivityPeriod(occurredAt));
  response.status(201).json(activity);
});

router.patch('/:id', async (request, response) => {
  if (!isValidObjectId(request.params.id)) {
    response.status(400).json({ error: 'Invalid activity id' });
    return;
  }
  const activity = await Activity.findById(request.params.id);
  if (!activity) {
    response.status(404).json({ error: 'Activity not found' });
    return;
  }

  const userId = request.body.userId ?? activity.userId.toString();
  const teamId = request.body.teamId === null ? undefined : request.body.teamId ?? activity.teamId?.toString();
  const type = request.body.type ?? activity.type;
  const durationMinutes = request.body.durationMinutes === undefined
    ? activity.durationMinutes
    : Number(request.body.durationMinutes);
  const occurredAt = request.body.occurredAt === undefined
    ? activity.occurredAt
    : validDate(request.body.occurredAt);
  const distanceMeters = request.body.distanceMeters === undefined
    ? activity.distanceMeters ?? undefined
    : request.body.distanceMeters === null
      ? undefined
      : Number(request.body.distanceMeters);

  if (typeof userId !== 'string' || !isValidObjectId(userId) || !(await User.exists({ _id: userId }))) {
    response.status(400).json({ error: 'userId must reference an existing user' });
    return;
  }
  if (teamId !== undefined && !(await validateTeamMembership(teamId, userId))) {
    response.status(400).json({ error: 'teamId must reference a team that includes the user' });
    return;
  }
  if (!activityTypes.includes(type)) {
    response.status(400).json({ error: 'type must be run, walk, or strength' });
    return;
  }
  if (!Number.isFinite(durationMinutes) || durationMinutes < 1) {
    response.status(400).json({ error: 'durationMinutes must be a positive number' });
    return;
  }
  if (!occurredAt) {
    response.status(400).json({ error: 'occurredAt must be a valid date' });
    return;
  }
  if (distanceMeters !== undefined && (!Number.isFinite(distanceMeters) || distanceMeters < 0)) {
    response.status(400).json({ error: 'distanceMeters must be a non-negative number' });
    return;
  }

  const previousPeriod = getActivityPeriod(activity.occurredAt);
  activity.set({
    userId,
    teamId,
    type,
    durationMinutes,
    distanceMeters,
    points: durationMinutes,
    occurredAt,
  });
  await activity.save();
  const updatedPeriod = getActivityPeriod(activity.occurredAt);
  await rebuildLeaderboard(updatedPeriod);
  if (previousPeriod !== updatedPeriod) {
    await rebuildLeaderboard(previousPeriod);
  }
  response.json(activity);
});

router.delete('/:id', async (request, response) => {
  if (!isValidObjectId(request.params.id)) {
    response.status(400).json({ error: 'Invalid activity id' });
    return;
  }
  const activity = await Activity.findByIdAndDelete(request.params.id);
  if (!activity) {
    response.status(404).json({ error: 'Activity not found' });
    return;
  }
  await rebuildLeaderboard(getActivityPeriod(activity.occurredAt));
  response.status(204).end();
});

export default router;