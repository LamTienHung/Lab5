import { useAppState } from './context/hooks.js';
import ThemeToggle from './components/ThemeToggle.jsx';
import LoginButton from './components/LoginButton.jsx';
import ChatRoom from './components/ChatRoom.jsx';

export default function App() {
  const { theme, user, authReady } = useAppState();

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1 className="app-title">
          <span aria-hidden="true">#</span>JusticeForHimassTanVuu
          <span className="app-title__sub"> · Community Appeal Hub</span>
        </h1>

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