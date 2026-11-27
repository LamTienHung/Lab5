import { createContext, useEffect, useReducer } from 'react';
import { appReducer, createInitialState } from './appReducer.js';
import { clips } from '../data/clips.js';

// Split Context — Ex 0.1
// State và dispatch tách 2 context riêng:
// component chỉ gửi action (ThemeToggle, Pagination…) đọc AppDispatchContext
// → không re-render khi state (trang, filter, danh sách) thay đổi.
export const AppStateContext = createContext(null);
export const AppDispatchContext = createContext(null);

export function AppProvider({ children, initialEvidence = clips }) {
  const [state, dispatch] = useReducer(appReducer, initialEvidence, createInitialState);

  // Đồng bộ với hệ thống ngoài React (DOM) → hợp lệ dùng useEffect.
  // Chỉ chạy khi theme đổi, không re-mount context.
  useEffect(() => {
    document.documentElement.dataset.theme = state.theme;
  }, [state.theme]);

  return (
    <AppStateContext.Provider value={state}>
      <AppDispatchContext.Provider value={dispatch}>
        {children}
      </AppDispatchContext.Provider>
    </AppStateContext.Provider>
  );
}