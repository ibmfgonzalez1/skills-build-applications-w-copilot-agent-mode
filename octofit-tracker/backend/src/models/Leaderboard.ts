import { model, Schema } from 'mongoose';

const leaderboardSchema = new Schema(
  {
    period: { type: String, required: true, match: /^\d{4}-(0[1-9]|1[0-2])$/ },
    participantType: { type: String, enum: ['user', 'team'], required: true },
    participantModel: { type: String, enum: ['User', 'Team'], required: true },
    participantId: { type: Schema.Types.ObjectId, required: true, refPath: 'participantModel' },
    points: { type: Number, required: true, min: 0 },
    rank: { type: Number, required: true, min: 1 },
  },
  { timestamps: true },
);

leaderboardSchema.index(
  { period: 1, participantType: 1, participantId: 1 },
  { unique: true },
);

export default model('Leaderboard', leaderboardSchema);