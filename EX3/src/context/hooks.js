import { useContext } from 'react';
import { AppStateContext, AppDispatchContext } from './AppProvider.jsx';

// Đọc state — component dùng hook này sẽ re-render khi state đổi.
export function useAppState() {
  const state = useContext(AppStateContext);
  if (state === null) {
    throw new Error('useAppState() phải được dùng bên trong <AppProvider>.');
  }
  return state;
}

// Chỉ lấy dispatch — tham chiếu ổn định, KHÔNG gây re-render khi state đổi.
export function useAppDispatch() {
  const dispatch = useContext(AppDispatchContext);
  if (dispatch === null) {
    throw new Error('useAppDispatch() phải được dùng bên trong <AppProvider>.');
  }
  return dispatch;
}