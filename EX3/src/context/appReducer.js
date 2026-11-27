// Pure reducer — EX2 (mở rộng từ EX0)
// Thêm: user, activeRoom, messages, connection — vẫn thuần, không side-effect.

export const ActionTypes = Object.freeze({
  TOGGLE_THEME: 'TOGGLE_THEME',
  SET_USER: 'SET_USER',
  SET_ROOM: 'SET_ROOM',
  SET_HISTORY: 'SET_HISTORY',
  APPEND_MESSAGE: 'APPEND_MESSAGE',
  SET_CONNECTION: 'SET_CONNECTION',
});

export const ROOMS = Object.freeze([
  { id: 'justice-appeal', name: '#JusticeForHimassTanVuu' },
  { id: 'hen-ho', name: 'Hẹn Hò Nhưng Không Yêu' },
]);

const MAX_MESSAGES = 200;

export const initialState = Object.freeze({
  theme: 'dark',
  user: null,                 // { uid, name, photo } | null
  authReady: false,           // đã nhận kết quả onAuthStateChanged lần đầu chưa
  activeRoom: ROOMS[0].id,
  messages: [],               // [] — chỉ tin của activeRoom
  connection: 'idle',         // idle | connecting | connected | unavailable | failed | disconnected
});

// Gộp + loại trùng theo _id + sắp theo thời gian (dùng chung cho history & append)
function mergeMessages(current, incoming) {
  const byId = new Map(current.map((m) => [m._id, m]));
  for (const m of incoming) byId.set(m._id, m);
  return [...byId.values()]
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .slice(-MAX_MESSAGES);
}

export function appReducer(state, action) {
  switch (action.type) {
    case ActionTypes.TOGGLE_THEME:
      return { ...state, theme: state.theme === 'dark' ? 'light' : 'dark' };

    case ActionTypes.SET_USER:
      return { ...state, user: action.payload, authReady: true };

    case ActionTypes.SET_ROOM:
      if (action.payload === state.activeRoom || !ROOMS.some((r) => r.id === action.payload)) return state;
      // Đổi phòng → xoá tin phòng cũ
      return { ...state, activeRoom: action.payload, messages: [] };

    case ActionTypes.SET_HISTORY: {
      const { roomId, messages } = action.payload;
      if (roomId !== state.activeRoom) return state; // response trễ của phòng cũ → bỏ
      // Gộp với tin đã tới qua Pusher trong lúc chờ GET
      return { ...state, messages: mergeMessages(state.messages, messages) };
    }

    case ActionTypes.APPEND_MESSAGE: {
      const msg = action.payload;
      if (msg.roomId !== state.activeRoom) return state;
      if (state.messages.some((m) => m._id === msg._id)) return state; // trùng → giữ nguyên state
      return { ...state, messages: mergeMessages(state.messages, [msg]) };
    }

    case ActionTypes.SET_CONNECTION:
      if (action.payload === state.connection) return state;
      return { ...state, connection: action.payload };

    default:
      return state;
  }
}