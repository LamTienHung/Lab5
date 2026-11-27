import { memo, useEffect, useRef } from 'react';

const timeFormat = new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit' });

function MessageItem({ message, isOwn }) {
  const cls = ['chat-bubble', isOwn && 'chat-bubble--own', message.role !== 'user' && `chat-bubble--${message.role}`]
    .filter(Boolean)
    .join(' ');

  return (
    <li className={cls}>
      <div className="chat-bubble__meta">
        <span className="chat-bubble__name">{isOwn ? 'Bạn' : message.senderName}</span>
        {message.role === 'agent' && <span className="role-tag">🤖 Agent</span>}
        {message.role === 'system' && <span className="role-tag">Hệ thống</span>}
        <time dateTime={message.createdAt}>{timeFormat.format(new Date(message.createdAt))}</time>
      </div>
      {/* Render text thuần — React tự escape, không dùng dangerouslySetInnerHTML */}
      <p className="chat-bubble__text">{message.text}</p>
    </li>
  );
}

const MemoMessageItem = memo(MessageItem);

function MessageList({ messages, currentUid }) {
  const listRef = useRef(null);
  const stickToBottom = useRef(true);

  // Ghi nhớ người dùng có đang ở cuối danh sách không
  const handleScroll = () => {
    const el = listRef.current;
    if (!el) return;
    stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  };

  // Đồng bộ DOM: tự cuộn xuống khi có tin mới (chỉ khi đang ở cuối)
  useEffect(() => {
    const el = listRef.current;
    if (el && stickToBottom.current) el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  if (messages.length === 0) {
    return <p className="chat-empty">Chưa có tin nhắn nào. Hãy là người đầu tiên!</p>;
  }

  return (
    <ol
      ref={listRef}
      className="chat-list"
      role="log"
      aria-live="polite"
      aria-relevant="additions"
      aria-label="Tin nhắn"
      onScroll={handleScroll}
    >
      {messages.map((m) => (
        <MemoMessageItem key={m._id} message={m} isOwn={m.senderUid === currentUid} />
      ))}
    </ol>
  );
}

export default memo(MessageList);