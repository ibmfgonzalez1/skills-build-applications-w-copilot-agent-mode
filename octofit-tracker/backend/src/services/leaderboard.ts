import Activity from '../models/Activity.js';
import Leaderboard from '../models/Leaderboard.js';

type ParticipantType = 'user' | 'team';

interface Standing {
  period: string;
  participantType: ParticipantType;
  participantModel: 'User' | 'Team';
  participantId: unknown;
  points: number;
  rank: number;
}

export function getActivityPeriod(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}

export async function rebuildLeaderboard(period: string): Promise<void> {
  const [year, month] = period.split('-').map(Number);
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 1));
  const activities = await Activity.find({ occurredAt: { $gte: start, $lt: end } })
    .select('userId teamId points')
    .lean();
  const totals = new Map<ParticipantType, Map<string, { participantId: unknown; points: number }>>([
    ['user', new Map()],
    ['team', new Map()],
  ]);

  for (const activity of activities) {
    const userId = activity.userId.toString();
    const userTotals = totals.get('user');
    const userStanding = userTotals?.get(userId);
    userTotals?.set(userId, {
      participantId: activity.userId,
      points: (userStanding?.points ?? 0) + activity.points,
    });

    if (activity.teamId) {
      const teamId = activity.teamId.toString();
      const teamTotals = totals.get('team');
      const teamStanding = teamTotals?.get(teamId);
      teamTotals?.set(teamId, {
        participantId: activity.teamId,
        points: (teamStanding?.points ?? 0) + activity.points,
      });
    }
  }

  const standings: Standing[] = [];
  for (const participantType of ['user', 'team'] as const) {
    const participantModel = participantType === 'user' ? 'User' : 'Team';
    const ordered = [...(totals.get(participantType)?.values() ?? [])].sort(
      (left, right) => right.points - left.points || String(left.participantId).localeCompare(String(right.participantId)),
    );
    let rank = 0;
    let previousPoints: number | undefined;

    ordered.forEach((standing, index) => {
      if (standing.points !== previousPoints) {
        rank = index + 1;
        previousPoints = standing.points;
      }
      standings.push({
        period,
        participantType,
        participantModel,
        participantId: standing.participantId,
        points: standing.points,
        rank,
      });
    });
  }

  await Leaderboard.deleteMany({ period });
  if (standings.length > 0) {
    await Leaderboard.insertMany(standings);
  }
}