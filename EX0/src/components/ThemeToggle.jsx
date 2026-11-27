import { memo } from 'react';
import { useAppDispatch } from '../context/hooks.js';
import { ActionTypes } from '../context/appReducer.js';

// Chỉ dùng dispatch (ổn định) + nhận `theme` qua prop.
// memo() → khi đổi trang / filter, `theme` không đổi ⇒ component KHÔNG render lại
// (yêu cầu kiểm chứng của Sprint 1 bằng React DevTools Profiler).
function ThemeToggle({ theme }) {
  const dispatch = useAppDispatch();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      className="icon-btn theme-toggle"
      aria-pressed={isDark}
      aria-label={isDark ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}
      title={isDark ? 'Giao diện sáng' : 'Giao diện tối'}
      onClick={() => dispatch({ type: ActionTypes.TOGGLE_THEME })}
    >
      {isDark ? (
        // Icon mặt trăng
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
          <path fill="currentColor" d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
        </svg>
      ) : (
        // Icon mặt trời
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
          <circle cx="12" cy="12" r="4.5" fill="currentColor" />
          <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </g>
        </svg>
      )}
    </button>
  );
}

export default memo(ThemeToggle);