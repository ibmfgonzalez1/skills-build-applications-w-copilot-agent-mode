import mongoose from 'mongoose';
import Activity from '../models/Activity.js';
import Leaderboard from '../models/Leaderboard.js';
import Team from '../models/Team.js';
import User from '../models/User.js';
import Workout from '../models/Workout.js';
import { getActivityPeriod, rebuildLeaderboard } from '../services/leaderboard.js';

const connectionString = process.env.MONGODB_URI || 'mongodb://localhost:27017/octofit_db';
const userSeeds = [
  { key: 'river', name: 'River Chen', email: 'seed.river@example.test' },
  { key: 'maya', name: 'Maya Patel', email: 'seed.maya@example.test' },
  { key: 'noah', name: 'Noah Johnson', email: 'seed.noah@example.test' },
  { key: 'ava', name: 'Ava Thompson', email: 'seed.ava@example.test' },
];
const workoutSeeds = [
  { title: 'Demo: Easy Run', description: 'A relaxed run with a steady, conversational pace.', activityType: 'run', difficulty: 'beginner', durationMinutes: 25 },
  { title: 'Demo: Interval Run', description: 'Alternate brisk efforts with easy recovery periods.', activityType: 'run', difficulty: 'intermediate', durationMinutes: 30 },
  { title: 'Demo: Neighborhood Walk', description: 'A brisk walk on a comfortable route.', activityType: 'walk', difficulty: 'beginner', durationMinutes: 30 },
  { title: 'Demo: Hill Walk', description: 'Add gentle inclines while keeping a steady pace.', activityType: 'walk', difficulty: 'intermediate', durationMinutes: 35 },
  { title: 'Demo: Bodyweight Basics', description: 'Practice squats, push-ups, and core exercises.', activityType: 'strength', difficulty: 'beginner', durationMinutes: 20 },
  { title: 'Demo: Strength Circuit', description: 'Complete a full-body circuit with controlled rest.', activityType: 'strength', difficulty: 'intermediate', durationMinutes: 30 },
];

/**
 * Seed the octofit_db database with test data
 */
async function seedDatabase() {
  try {
    await mongoose.connect(connectionString);
    console.log('Connected to octofit_db');

    const users = new Map<string, mongoose.Types.ObjectId>();
    for (const seed of userSeeds) {
      const user = await User.findOneAndUpdate(
        { email: seed.email },
        { $set: { name: seed.name, email: seed.email } },
        { returnDocument: 'after', upsert: true, runValidators: true, setDefaultsOnInsert: true },
      );
      users.set(seed.key, user._id);
    }

    const teamSeeds = [
      {
        name: 'Demo: Orcas',
        description: 'A friendly team focused on steady progress.',
        members: [users.get('river')!, users.get('maya')!],
      },
      {
        name: 'Demo: Wave Riders',
        description: 'A team building consistency through shared challenges.',
        members: [users.get('noah')!, users.get('ava')!],
      },
    ];
    const teams = new Map<string, mongoose.Types.ObjectId>();
    for (const seed of teamSeeds) {
      const team = await Team.findOneAndUpdate(
        { name: seed.name },
        { $set: seed },
        { returnDocument: 'after', upsert: true, runValidators: true, setDefaultsOnInsert: true },
      );
      teams.set(seed.name, team._id);
    }

    const now = new Date();
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth();
    const activitySeeds = [
      { id: '650000000000000000000001', user: 'river', team: 'Demo: Orcas', type: 'run', durationMinutes: 32, distanceMeters: 4800, day: 3 },
      { id: '650000000000000000000002', user: 'maya', team: 'Demo: Orcas', type: 'walk', durationMinutes: 45, distanceMeters: 3200, day: 4 },
      { id: '650000000000000000000003', user: 'noah', team: 'Demo: Wave Riders', type: 'strength', durationMinutes: 40, day: 5 },
      { id: '650000000000000000000004', user: 'ava', team: 'Demo: Wave Riders', type: 'run', durationMinutes: 28, distanceMeters: 4100, day: 6 },
      { id: '650000000000000000000005', user: 'river', team: 'Demo: Orcas', type: 'strength', durationMinutes: 25, day: 7 },
      { id: '650000000000000000000006', user: 'maya', team: 'Demo: Orcas', type: 'run', durationMinutes: 22, distanceMeters: 3000, day: 8 },
    ];
    const periods = new Set<string>();
    for (const [index, seed] of activitySeeds.entries()) {
      const userId = users.get(seed.user)!;
      const teamId = teams.get(seed.team)!;
      const occurredAt = new Date(Date.UTC(year, month, seed.day, 8 + index));
      await Activity.findByIdAndUpdate(
        seed.id,
        {
          $set: {
            userId,
            teamId,
            type: seed.type,
            durationMinutes: seed.durationMinutes,
            distanceMeters: seed.distanceMeters,
            points: seed.durationMinutes,
            occurredAt,
          },
        },
        { returnDocument: 'after', upsert: true, runValidators: true, setDefaultsOnInsert: true },
      );
      periods.add(getActivityPeriod(occurredAt));
    }

    for (const seed of workoutSeeds) {
      await Workout.findOneAndUpdate(
        { title: seed.title },
        { $set: seed },
        { returnDocument: 'after', upsert: true, runValidators: true, setDefaultsOnInsert: true },
      );
    }

    for (const period of periods) {
      await rebuildLeaderboard(period);
    }

    const [userCount, teamCount, activityCount, leaderboardCount, workoutCount] = await Promise.all([
      User.countDocuments({ email: { $in: userSeeds.map((user) => user.email) } }),
      Team.countDocuments({ name: { $in: teamSeeds.map((team) => team.name) } }),
      Activity.countDocuments({ userId: { $in: [...users.values()] } }),
      Leaderboard.countDocuments({ period: { $in: [...periods] } }),
      Workout.countDocuments({ title: { $in: workoutSeeds.map((workout) => workout.title) } }),
    ]);
    console.log('Database seeding complete', {
      users: userCount,
      teams: teamCount,
      activities: activityCount,
      leaderboardEntries: leaderboardCount,
      workouts: workoutCount,
    });
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seedDatabase();
