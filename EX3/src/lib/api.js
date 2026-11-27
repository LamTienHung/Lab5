import { auth } from './firebase.js';

async function request(path, options = {}) {
  const res = await fetch(path, {
    ...options,
    headers: { Accept: 'application/json', ...options.headers },
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const error = new Error(data?.error || `HTTP ${res.status}`);
    error.status = res.status;
    error.details = data?.details;
    throw error;
  }
  return data;
}

// GET lịch sử tin nhắn (cũ → mới)
export function fetchMessages(roomId, { signal, limit = 50 } = {}) {
  return request(`/api/v2/rooms/${encodeURIComponent(roomId)}/messages?limit=${limit}`, { signal });
}

// POST tin nhắn — gắn Firebase ID token vào header Authorization
export async function postMessage(roomId, text, { role = 'user' } = {}) {
  const user = auth.currentUser;
  if (!user) {
    const error = new Error('Bạn cần đăng nhập để gửi tin nhắn.');
    error.status = 401;
    throw error;
  }

  // getIdToken() tự làm mới token nếu sắp hết hạn (token sống 1 giờ)
  const token = await user.getIdToken();

  return request(`/api/v2/rooms/${encodeURIComponent(roomId)}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ text, role }),
  });
}