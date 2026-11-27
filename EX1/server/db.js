import mongoose from 'mongoose';

// Mongoose 8: chỉ async/await, KHÔNG dùng useNewUrlParser / useUnifiedTopology
// (các option này đã bị bỏ từ Mongoose 6 và gây lỗi/cảnh báo ở bản mới).
export async function connectDB(uri = process.env.MONGODB_URI) {
  if (!uri) {
    throw new Error('Thiếu biến môi trường MONGODB_URI (kiểm tra file .env).');
  }

  mongoose.set('strictQuery', true);

  mongoose.connection.on('connected', () => {
    console.log(`[db] Connected → ${mongoose.connection.host}/${mongoose.connection.name}`);
  });
  mongoose.connection.on('error', (err) => {
    console.error('[db] Connection error:', err.message);
  });
  mongoose.connection.on('disconnected', () => {
    console.warn('[db] Disconnected');
  });

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000, // báo lỗi sau 5s nếu MongoDB không chạy
  });

  return mongoose.connection;
}

export async function disconnectDB() {
  await mongoose.disconnect();
}