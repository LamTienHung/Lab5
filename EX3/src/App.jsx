import { useAppState } from './context/hooks.js';
import { useEvidenceMcp } from './hooks/useEvidenceMcp.js';
import { useWebMcpChatTools } from './hooks/useWebMcpChatTools.js';
import ThemeToggle from './components/ThemeToggle.jsx';
import LoginButton from './components/LoginButton.jsx';
import ChatRoom from './components/ChatRoom.jsx';
import McpStatus from './components/McpStatus.jsx';

export default function App() {
  const { theme, user, authReady } = useAppState();

  // Ex 3.1 — tool chỉ đọc (luôn có)
  useEvidenceMcp();
  // Ex 3.2 — tool ghi có consent gate (chỉ khi đã đăng nhập)
  useWebMcpChatTools(Boolean(user));

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1 className="app-title">
          <span aria-hidden="true">#</span>JusticeForHimassTanVuu
          <span className="app-title__sub"> · Agentic Appeal Hub</span>
        </h1>

        <McpStatus />

        <div className="app-header__actions">
          <LoginButton user={user} authReady={authReady} />
          <ThemeToggle theme={theme} />
        </div>
      </header>

      <main className="app-main">
        <ChatRoom />
      </main>
    </div>
  );
}