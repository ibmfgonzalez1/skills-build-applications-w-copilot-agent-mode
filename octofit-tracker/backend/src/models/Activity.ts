import { model, Schema } from 'mongoose';

const activitySchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    teamId: { type: Schema.Types.ObjectId, ref: 'Team', index: true },
    type: { type: String, enum: ['run', 'walk', 'strength'], required: true },
    durationMinutes: { type: Number, required: true, min: 1 },
    distanceMeters: { type: Number, min: 0 },
    points: { type: Number, required: true, min: 0 },
    occurredAt: { type: Date, required: true, default: Date.now, index: true },
  },
  { timestamps: true },
);

export default model('Activity', activitySchema);