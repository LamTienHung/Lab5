import { memo } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useAppDispatch } from '../context/hooks.js';
import { ActionTypes } from '../context/appReducer.js';

// Ex 3.2 refactor: SVG tự vẽ → lucide-react (tree-shakeable, thay phosphor-react)
// Vẫn giữ: dispatch-only + prop `theme` + memo (Sprint 1)
function ThemeToggle({ theme }) {
  const dispatch = useAppDispatch();
  const isDark = theme === 'dark';
  const Icon = isDark ? Moon : Sun;

  return (
    <button
      type="button"
      className="icon-btn theme-toggle"
      aria-pressed={isDark}
      aria-label={isDark ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}
      title={isDark ? 'Giao diện sáng' : 'Giao diện tối'}
      onClick={() => dispatch({ type: ActionTypes.TOGGLE_THEME })}
    >
      <Icon size={20} aria-hidden="true" />
    </button>
  );
}

export default memo(ThemeToggle);