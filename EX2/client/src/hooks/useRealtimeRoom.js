import { useEffect } from 'react';
import Pusher from 'pusher-js';
import { useAppDispatch } from '../context/hooks.js';
import { ActionTypes } from '../context/appReducer.js';
import { fetchMessages } from '../lib/api.js';

const PUSHER_KEY = import.meta.env.VITE_PUSHER_KEY;
const PUSHER_CLUSTER = import.meta.env.VITE_PUSHER_CLUSTER;
const MESSAGE_EVENT = 'new-message'; // khớp server lib/pusher.js

// Ex 2.1 — Killing the Slide 16 WebSocket Leak
// - deps CHỈ [roomId, dispatch] → KHÔNG có messages → không reconnect mỗi tin nhắn
// - handler chỉ dispatch APPEND_MESSAGE (không đọc state)
// - cleanup: unbind_all → unsubscribe → disconnect
export function useRealtimeRoom(roomId) {
  const dispatch = useAppDispatch();

  // 1) WebSocket subscription
  useEffect(() => {
    if (!roomId) return;
    if (!PUSHER_KEY || !PUSHER_CLUSTER) {
      console.error('Thiếu VITE_PUSHER_KEY / VITE_PUSHER_CLUSTER trong .env');
      dispatch({ type: ActionTypes.SET_CONNECTION, payload: 'failed' });
      return;
    }

    const channelName = `room-${roomId}`;
    const pusher = new Pusher(PUSHER_KEY, { cluster: PUSHER_CLUSTER });

    // Trạng thái kết nối → hiển thị cho người dùng
    pusher.connection.bind('state_change', ({ current }) => {
      dispatch({ type: ActionTypes.SET_CONNECTION, payload: current });
    });

    const channel = pusher.subscribe(channelName);
    channel.bind(MESSAGE_EVENT, (data) => {
      dispatch({ type: ActionTypes.APPEND_MESSAGE, payload: data });
    });

    // Mandatory teardown: chống tích tụ socket
    return () => {
      channel.unbind_all();
      pusher.unsubscribe(channelName);
      pusher.connection.unbind_all();
      pusher.disconnect();
    };
  }, [roomId, dispatch]); // NO [messages]

  // 2) Lịch sử tin nhắn của phòng (fetch có AbortController)
  useEffect(() => {
    if (!roomId) return;
    const controller = new AbortController();

    fetchMessages(roomId, { signal: controller.signal })
      .then((messages) => {
        dispatch({ type: ActionTypes.SET_HISTORY, payload: { roomId, messages } });
      })
      .catch((err) => {
        if (err.name !== 'AbortError') console.error('[chat] history failed:', err);
      });

    return () => controller.abort();
  }, [roomId, dispatch]);
}