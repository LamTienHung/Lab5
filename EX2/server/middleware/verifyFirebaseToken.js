import { adminAuth } from '../lib/firebaseAdmin.js';

// Ex 2.2 — Token-Verified API
// Chặn mọi request ghi dữ liệu nếu không có Firebase ID token hợp lệ → 401,
// KHÔNG chạm tới MongoDB.
export async function verifyFirebaseToken(req, res, next) {
  const authHeader = req.headers.authorization ?? '';

  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing token' });
  }

  const token = authHeader.slice('Bearer '.length).trim();
  if (!token) {
    return res.status(401).json({ error: 'Missing token' });
  }

  try {
    const decoded = await adminAuth.verifyIdToken(token);

    // Chỉ giữ thông tin cần thiết — danh tính lấy từ token, không tin body
    req.user = {
      uid: decoded.uid,
      name: decoded.name || decoded.email?.split('@')[0] || 'Ẩn danh',
      email: decoded.email,
      picture: decoded.picture,
    };
    next();
  } catch (err) {
    // Token hết hạn / sai chữ ký / sai project
    console.warn('[auth] Invalid token:', err.code || err.message);
    return res.status(401).json({ error: 'Unauthorized' });
  }
}