import mongoose from 'mongoose';

// Mongoose 8 — async/await, không dùng option cũ.
// URI phải có ?replicaSet=rs0 vì Change Streams chỉ chạy trên replica set.
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

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });

  // Kiểm tra sớm: không phải replica set → Change Streams sẽ lỗi
  const hello = await mongoose.connection.db.admin().command({ hello: 1 });
  if (!hello.setName) {
    throw new Error('MongoDB không chạy ở chế độ replica set — Change Streams sẽ không hoạt động.');
  }
  console.log(`[db] Replica set: ${hello.setName} (${hello.isWritablePrimary ? 'PRIMARY' : 'SECONDARY'})`);

  return mongoose.connection;
}

export async function disconnectDB() {
  await mongoose.disconnect();
}