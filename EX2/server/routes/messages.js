import { Router } from 'express';
import { Message, ROOM_ID_PATTERN } from '../models/Message.js';
import { verifyFirebaseToken } from '../middleware/verifyFirebaseToken.js';

// Mount trong server.js: app.use('/api/v2/rooms', messagesRouter)
const router = Router();

function validateRoom(req, res, next) {
  const roomId = String(req.params.roomId || '').toLowerCase();
  if (!ROOM_ID_PATTERN.test(roomId)) {
    return res.status(400).json({ error: 'Invalid roomId' });
  }
  req.roomId = roomId;
  next();
}

// GET /api/v2/rooms/:roomId/messages?limit=50 — lịch sử (cũ → mới)
router.get('/:roomId/messages', validateRoom, async (req, res) => {
  const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 100);

  const latest = await Message.find({ roomId: req.roomId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  res.json(latest.reverse());
});

// POST /api/v2/rooms/:roomId/messages — BẮT BUỘC token
// Route CHỈ lưu DB. Việc broadcast do Change Stream đảm nhận (changeStream.js).
router.post('/:roomId/messages', validateRoom, verifyFirebaseToken, async (req, res) => {
  const text = typeof req.body?.text === 'string' ? req.body.text : '';
  // Client chỉ được chọn 'user' hoặc 'agent' (EX3.2), không được tự gán 'system'
  const role = req.body?.role === 'agent' ? 'agent' : 'user';

  const message = await Message.create({
    roomId: req.roomId,
    senderUid: req.user.uid,     // danh tính lấy từ token đã xác thực
    senderName: req.user.name,
    senderPhoto: req.user.picture,
    role,
    text,
  });

  res.status(201).json(message);
});

export default router;