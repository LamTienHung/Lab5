import { useState } from 'react';
import { LogIn, LogOut, Loader2 } from 'lucide-react';
import { signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase.js';
import styles from './LoginButton.module.css';

// Ex 3.2 refactor: class toàn cục → CSS Modules, chữ → icon lucide-react
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
    return (
      <span className={styles.status} role="status">
        Đang kiểm tra đăng nhập…
      </span>
    );
  }

  if (!user) {
    return (
      <div className={styles.box}>
        <button type="button" className={styles.primary} onClick={handleLogin} disabled={pending}>
          {pending ? (
            <Loader2 size={18} aria-hidden="true" className="spin" />
          ) : (
            <LogIn size={18} aria-hidden="true" />
          )}
          <span>{pending ? 'Đang mở Google…' : 'Đăng nhập bằng Google'}</span>
        </button>
        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={styles.box}>
      {user.photo && (
        <img
          className={styles.avatar}
          src={user.photo}
          alt=""
          width="32"
          height="32"
          referrerPolicy="no-referrer"
        />
      )}
      <span className={styles.name}>{user.name}</span>
      <button
        type="button"
        className={styles.button}
        onClick={handleLogout}
        disabled={pending}
        aria-label="Đăng xuất"
        title="Đăng xuất"
      >
        <LogOut size={18} aria-hidden="true" />
      </button>
    </div>
  );
}