import { useState } from 'react';
import { signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase.js';

// Không tự dispatch SET_USER — onAuthStateChanged trong AppProvider lo việc đó.
export default function LoginButton({ user, authReady }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    setPending(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      // Người dùng tự đóng popup → không coi là lỗi
      if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
        console.error('[auth] login failed:', err.code);
        setError(
          err.code === 'auth/popup-blocked'
            ? 'Trình duyệt chặn popup — hãy cho phép popup cho localhost.'
            : 'Đăng nhập thất bại, thử lại.'
        );
      }
    } finally {
      setPending(false);
    }
  };

  const handleLogout = async () => {
    setPending(true);
    try {
      await signOut(auth);
    } finally {
      setPending(false);
    }
  };

  if (!authReady) {
    return <span className="auth-status" role="status">Đang kiểm tra đăng nhập…</span>;
  }

  if (!user) {
    return (
      <div className="auth-box">
        <button type="button" className="btn btn--primary" onClick={handleLogin} disabled={pending}>
          {pending ? 'Đang mở Google…' : 'Đăng nhập bằng Google'}
        </button>
        {error && <p className="auth-error" role="alert">{error}</p>}
      </div>
    );
  }

  return (
    <div className="auth-box">
      {user.photo && (
        <img className="avatar" src={user.photo} alt="" width="32" height="32" referrerPolicy="no-referrer" />
      )}
      <span className="auth-name">{user.name}</span>
      <button type="button" className="btn" onClick={handleLogout} disabled={pending}>
        Đăng xuất
      </button>
    </div>
  );
}