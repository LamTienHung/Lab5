// Pure reducer — Ex 0.1
// Không gọi API, không đụng DOM, không Date.now()/Math.random().
// Luôn trả object mới; action không hợp lệ → trả nguyên state.

export const ActionTypes = Object.freeze({
  TOGGLE_THEME: 'TOGGLE_THEME',
  SET_TAB: 'SET_TAB',
  SET_EVIDENCE: 'SET_EVIDENCE',
  SET_FILTER: 'SET_FILTER',
  SET_PAGE: 'SET_PAGE',
  SET_PAGE_SIZE: 'SET_PAGE_SIZE',
});

export const TABS = Object.freeze(['reels', 'evidence', 'chat']);
export const FILTER_TAGS = Object.freeze(['all', 'Himass', 'TanVuu']);

export const initialState = Object.freeze({
  theme: 'dark',          // 'dark' | 'light'
  activeTab: 'evidence',  // một trong TABS
  evidenceList: [],       // [] chứ không phải "" (fix bug React 8 doc)
  filterTag: 'all',       // một trong FILTER_TAGS
  currentPage: 1,
  pageSize: 6,
});

// Lazy initializer cho useReducer(appReducer, evidence, createInitialState)
export function createInitialState(evidence = []) {
  return { ...initialState, evidenceList: Array.isArray(evidence) ? evidence : [] };
}

export function appReducer(state, action) {
  switch (action.type) {
    case ActionTypes.TOGGLE_THEME:
      // Fix bug legacy: đảo đúng chiều dark ↔ light
      return { ...state, theme: state.theme === 'dark' ? 'light' : 'dark' };

    case ActionTypes.SET_TAB:
      if (!TABS.includes(action.payload) || action.payload === state.activeTab) return state;
      return { ...state, activeTab: action.payload };

    case ActionTypes.SET_EVIDENCE:
      return {
        ...state,
        evidenceList: Array.isArray(action.payload) ? action.payload : [],
        currentPage: 1,
      };

    case ActionTypes.SET_FILTER:
      if (!FILTER_TAGS.includes(action.payload) || action.payload === state.filterTag) return state;
      // Đổi bộ lọc → quay về trang 1 (xử lý trong reducer, không cần useEffect)
      return { ...state, filterTag: action.payload, currentPage: 1 };

    case ActionTypes.SET_PAGE: {
      const page = Number(action.payload);
      if (!Number.isInteger(page) || page < 1 || page === state.currentPage) return state;
      return { ...state, currentPage: page };
    }

    case ActionTypes.SET_PAGE_SIZE: {
      const size = Number(action.payload);
      if (!Number.isInteger(size) || size < 1 || size === state.pageSize) return state;
      return { ...state, pageSize: size, currentPage: 1 };
    }

    default:
      return state;
  }
}