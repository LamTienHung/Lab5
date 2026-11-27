import { ROOMS } from '../context/appReducer.js';
import { postMessage } from '../lib/api.js';
import { auth } from '../lib/firebase.js';
import { requestConsent } from './modelContext.js';

// Ex 3.2 — Mutating tool với Human-in-the-Loop Consent Gate
// Mọi tham số từ agent là KHÔNG tin cậy (có thể đến từ prompt injection trong chat).

const MAX_LEN = 500;
const MIN_INTERVAL_MS = 5000; // chống agent spam: tối đa 1 tin / 5 giây
let lastSentAt = 0;

// Làm sạch: bỏ ký tự điều khiển, gộp khoảng trắng, cắt độ dài
function sanitize(text) {
  return String(text ?? '')
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export const sendSupportMessageTool = {
  name: 'sendSupportMessage',
  title: 'Post appeal message',
  description:
    'Post a public support/appeal message to a community chat room. Requires explicit user confirmation before sending.',
  inputSchema: {
    type: 'object',
    properties: {
      roomId: { type: 'string', enum: ROOMS.map((r) => r.id), description: 'Target chat room' },
      message: { type: 'string', minLength: 1, maxLength: MAX_LEN, description: 'Message content (plain text)' },
    },
    required: ['roomId', 'message'],
    additionalProperties: false,
  },
  annotations: { readOnlyHint: false, consequentialHint: true },

  execute: async (input = {}, client) => {
    // 1) Validate — từ chối sớm, KHÔNG hỏi người dùng với dữ liệu rác
    const room = ROOMS.find((r) => r.id === input.roomId);
    if (!room) return { ok: false, error: `Invalid roomId. Allowed: ${ROOMS.map((r) => r.id).join(', ')}` };

    const message = sanitize(input.message);
    if (!message) return { ok: false, error: 'Message is empty.' };
    if (message.length > MAX_LEN) return { ok: false, error: `Message exceeds ${MAX_LEN} characters.` };

    if (!auth.currentUser) return { ok: false, error: 'User is not signed in.' };

    const wait = lastSentAt + MIN_INTERVAL_MS - Date.now();
    if (wait > 0) return { ok: false, error: `Rate limited. Retry in ${Math.ceil(wait / 1000)}s.` };

    // 2) CONSENT GATE — bắt buộc trước khi gửi request mạng
    const confirmed = await requestConsent(
      client,
      `Đăng tin CÔNG KHAI vào phòng "${room.name}" dưới tên ${auth.currentUser.displayName}:\n\n"${message}"`
    );
    if (!confirmed) {
      // Người dùng từ chối → tuyệt đối KHÔNG gửi
      throw new Error('Action canceled by user');
    }

    // 3) Chỉ sau khi đồng ý mới gọi API (role 'agent' để UI gắn nhãn 🤖)
    lastSentAt = Date.now();
    const saved = await postMessage(room.id, message, { role: 'agent' });
    return { ok: true, messageId: saved._id, roomId: room.id };
  },
};