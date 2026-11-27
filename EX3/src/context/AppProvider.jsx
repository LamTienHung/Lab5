import { createContext, useEffect, useReducer } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase.js';
import { appReducer, initialState, ActionTypes } from './appReducer.js';

// Split Context (giữ nguyên kiến trúc EX0)
export const AppStateContext = createContext(null);
export const AppDispatchContext = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Đồng bộ theme → DOM
  useEffect(() => {
    document.documentElement.dataset.theme = state.theme;
  }, [state.theme]);

  // Đồng bộ trạng thái đăng nhập Firebase → reducer (có cleanup)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      dispatch({
        type: ActionTypes.SET_USER,
        payload: firebaseUser
          ? {
              uid: firebaseUser.uid,
              name: firebaseUser.displayName || firebaseUser.email,
              photo: firebaseUser.photoURL,
            }
          : null,
      });
    });
    return unsubscribe;
  }, []);

  return (
    <AppStateContext.Provider value={state}>
      <AppDispatchContext.Provider value={dispatch}>
        {children}
      </AppDispatchContext.Provider>
    </AppStateContext.Provider>
  );
}