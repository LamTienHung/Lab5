import { Router } from 'express';
import mongoose from 'mongoose';
import { EvidenceReel } from '../models/EvidenceReel.js';

// Mount trong server.js: app.use('/api/v2/reels', reelsRouter)
// Express 5: async handler reject → tự chuyển tới error middleware (không cần try/catch + next).
const router = Router();

// Middleware kiểm tra :id là ObjectId hợp lệ → 400 thay vì CastError 500
function validateId(req, res, next) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: 'Invalid reel id' });
  }
  next();
}

// GET /api/v2/reels?player=Himass
router.get('/', async (req, res) => {
  const { player } = req.query;
  const filter = player ? { player } : {};

  const reels = await EvidenceReel.find(filter)
    .sort({ createdAt: -1, endorsements: -1 })
    .lean();

  res.json(reels);
});

// GET /api/v2/reels/:id
router.get('/:id', validateId, async (req, res) => {
  const reel = await EvidenceReel.findById(req.params.id).lean();
  if (!reel) return res.status(404).json({ error: 'Reel not found' });
  res.json(reel);
});

// PATCH /api/v2/reels/:id/endorse — Atomic $inc (Concurrency Guard)
router.patch('/:id/endorse', validateId, async (req, res) => {
  const updated = await EvidenceReel.findByIdAndUpdate(
    req.params.id,
    { $inc: { endorsements: 1 } },
    { new: true, runValidators: true }
  ).lean();

  if (!updated) return res.status(404).json({ error: 'Reel not found' });
  res.status(200).json(updated);
});

export default router;