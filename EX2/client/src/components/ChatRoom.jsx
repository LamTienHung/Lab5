import { useState } from 'react';
import { useAppState, useAppDispatch } from '../context/hooks.js';
import { ActionTypes, ROOMS } from '../context/appReducer.js';
import { useRealtimeRoom } from '../hooks/useRealtimeRoom.js';
import { postMessage } from '../lib/api.js';
import MessageList from './MessageList.jsx';

const CONNECTION_LABEL = {
  idle: 'Chưa kết nối',
  connecting: 'Đang kết nối…',
  connected: 'Đã kết nối realtime',
  unavailable: 'Mất kết nối — đang thử lại…',
  failed: 'Không kết nối được',
  disconnected: 'Đã ngắt kết nối',
};

// Ô soạn tin tách riêng → gõ phím chỉ render Composer, không render danh sách tin
function Composer({ roomId, disabled }) {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const trimmed = text.trim();

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!trimmed || sending) return;

    setSending(true);
    setError('');
    try {
      await postMessage(roomId, trimmed);
      setText(''); // tin sẽ hiện khi Pusher đẩy về (Change Stream)
    } catch (err) {
      setError(
        err.status === 401
          ? 'Phiên đăng nhập hết hạn, hãy đăng nhập lại.'
          : err.details?.[0]?.message || 'Gửi thất bại, thử lại.'
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <form className="composer" onSubmit={handleSubmit}>
      <label htmlFor="chat-input" className="visually-hidden">Nội dung tin nhắn</label>
      <input
        id="chat-input"
        className="composer__input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={disabled ? 'Đăng nhập để gửi tin nhắn' : 'Nhập tin nhắn…'}
        maxLength={1000}
        autoComplete="off"
        disabled={disabled}
      />
      <button type="submit" className="btn btn--primary chat-send-btn" disabled={disabled || !trimmed || sending}>
        {sending ? 'Đang gửi…' : 'Gửi'}
      </button>
      {error && <p className="composer__error" role="alert">{error}</p>}
    </form>
  );
}

export default function ChatRoom() {
  const { activeRoom, messages, user, connection } = useAppState();
  const dispatch = useAppDispatch();

  // 1 WebSocket cho phòng hiện tại — chỉ reconnect khi đổi phòng
  useRealtimeRoom(activeRoom);

  const room = ROOMS.find((r) => r.id === activeRoom);

  return (
    <section className="chat" aria-labelledby="chat-heading">
      <header className="chat__header">
        <h2 id="chat-heading" className="chat__title">{room?.name}</h2>

        <div className="room-switcher" role="group" aria-label="Chọn phòng chat">
          {ROOMS.map((r) => (
            <button
              key={r.id}
              type="button"
              className={r.id === activeRoom ? 'chip chip--active' : 'chip'}
              aria-pressed={r.id === activeRoom}
              onClick={() => dispatch({ type: ActionTypes.SET_ROOM, payload: r.id })}
            >
              {r.name}
            </button>
          ))}
        </div>

        <p className={`conn conn--${connection}`} role="status">
          <span className="conn__dot" aria-hidden="true" />
          {CONNECTION_LABEL[connection] ?? connection}
        </p>
      </header>

      <MessageList messages={messages} currentUid={user?.uid} />

      <Composer key={activeRoom} roomId={activeRoom} disabled={!user} />
    </section>
  );
}