import mongoose from 'mongoose';

// Ex 1.2 — Schema Correction
// Legacy: likes: String  →  Mới: endorsements: Number (validate, default 0, min 0)
const evidenceReelSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'title là bắt buộc'],
      trim: true,
      maxlength: 120,
    },
    player: {
      type: String,
      required: true,
      enum: { values: ['Himass', 'TanVuu'], message: 'player không hợp lệ: {VALUE}' },
    },
    stage: {
      type: String,
      enum: ['Group Stage', 'Semi Final', 'Grand Final', 'Scrim'],
      default: 'Scrim',
    },
    videoUrl: {
      type: String,
      required: [true, 'videoUrl là bắt buộc'],
      trim: true,
    },
    posterUrl: {
      type: String,
      trim: true,
    },
    fps: {
      type: Number,
      required: true,
      default: 60,
      min: 0,
      max: 240,
    },
    verticalRecoilDeg: {
      type: Number,
      required: [true, 'verticalRecoilDeg là bắt buộc'],
      min: 0,
    },
    syncOffsetMs: {
      type: Number,
      default: 0,
      min: 0,
    },
    endorsements: {
      type: Number,
      default: 0,
      min: [0, 'endorsements không được âm'],
    },
  },
  { timestamps: true } // createdAt / updatedAt tự động
);

// Index phục vụ sort feed: mới nhất trước, nhiều endorse trước
evidenceReelSchema.index({ createdAt: -1, endorsements: -1 });

export const EvidenceReel = mongoose.model('EvidenceReel', evidenceReelSchema);