import { Message } from './models/Message.js';
import { pusher, roomChannel, MESSAGE_EVENT } from './lib/pusher.js';

// Ex 2.2 — MongoDB Change Stream → Pusher broadcast
// MongoDB insert → watch() → pusher.trigger('room-<id>', 'new-message', payload)
// Có resume token + reconnect backoff khi stream lỗi.

let stream = null;
let resumeToken = null;
let retryDelay = 1000;
let retryTimer = null;
let stopped = false;

function toPayload(doc) {
  return {
    _id: doc._id.toString(),           // key ổn định cho React
    roomId: doc.roomId,
    senderUid: doc.senderUid,
    senderName: doc.senderName,
    senderPhoto: doc.senderPhoto ?? null,
    role: doc.role,
    text: doc.text,
    createdAt: doc.createdAt,
  };
}

function open() {
  const options = resumeToken ? { resumeAfter: resumeToken } : {};

  stream = Message.watch([{ $match: { operationType: 'insert' } }], options);
  console.log(`[stream] Watching messages${resumeToken ? ' (resumed)' : ''}`);

  stream.on('change', async (change) => {
    resumeToken = change._id;   // lưu vị trí để resume nếu đứt
    retryDelay = 1000;          // stream ổn định → reset backoff

    const doc = change.fullDocument;
    try {
      await pusher.trigger(roomChannel(doc.roomId), MESSAGE_EVENT, toPayload(doc));
      console.log(`[stream] → ${roomChannel(doc.roomId)} ${doc._id}`);
    } catch (err) {
      // Lỗi Pusher không được làm sập stream
      console.error('[stream] Pusher trigger failed:', err.message);
    }
  });

  stream.on('error', (err) => {
    console.error('[stream] Error:', err.message);
    scheduleReconnect();
  });

  stream.on('close', () => {
    if (!stopped) scheduleReconnect();
  });
}

function scheduleReconnect() {
  if (stopped || retryTimer) return;

  stream?.removeAllListeners();
  stream?.close().catch(() => {});
  stream = null;

  console.warn(`[stream] Reconnecting in ${retryDelay / 1000}s...`);
  retryTimer = setTimeout(() => {
    retryTimer = null;
    try {
      open();
    } catch (err) {
      console.error('[stream] Reopen failed:', err.message);
      scheduleReconnect();
    }
  }, retryDelay);

  retryDelay = Math.min(retryDelay * 2, 30_000); // 1s → 2s → 4s … tối đa 30s
}

export function startMessageStream() {
  stopped = false;
  open();
}

export async function stopMessageStream() {
  stopped = true;
  clearTimeout(retryTimer);
  retryTimer = null;
  if (stream) {
    stream.removeAllListeners();
    await stream.close().catch(() => {});
    stream = null;
  }
}