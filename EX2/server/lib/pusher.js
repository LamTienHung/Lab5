import Pusher from 'pusher';

// Pusher server SDK — chỉ dùng ở server vì cần SECRET.
// Client chỉ được biết KEY + CLUSTER (public).
const required = ['PUSHER_APP_ID', 'PUSHER_KEY', 'PUSHER_SECRET', 'PUSHER_CLUSTER'];
const missing = required.filter((name) => !process.env[name]);
if (missing.length) {
  throw new Error(`Thiếu biến môi trường Pusher: ${missing.join(', ')} (kiểm tra file .env).`);
}

export const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true,
});

// Tên kênh thống nhất giữa server và client
export const roomChannel = (roomId) => `room-${roomId}`;
export const MESSAGE_EVENT = 'new-message';