import mongoose from 'mongoose';

// 404 cho route không tồn tại (đặt SAU tất cả router)
export function notFound(req, res) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}

// Error middleware tập trung — Express 5 tự đẩy lỗi từ async handler tới đây.
// Bắt buộc đủ 4 tham số (err, req, res, next) để Express nhận diện là error handler.
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  // Lỗi validate schema (required, min, enum…)
  if (err instanceof mongoose.Error.ValidationError) {
    const details = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
    return res.status(400).json({ error: 'Validation failed', details });
  }

  // Sai kiểu dữ liệu (vd. ObjectId không hợp lệ lọt qua)
  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({ error: `Invalid ${err.path}: ${err.value}` });
  }

  // Trùng unique index
  if (err?.code === 11000) {
    return res.status(409).json({ error: 'Duplicate key', keyValue: err.keyValue });
  }

  // JSON body sai cú pháp (express.json())
  if (err?.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Malformed JSON body' });
  }

  const status = err.status || err.statusCode || 500;
  console.error('[error]', err);

  res.status(status).json({
    error: status === 500 ? 'Internal Server Error' : err.message,
    // Chỉ lộ stack khi dev, không lộ ở production
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
}