import { useEffect } from 'react';
import { registerTool } from '../agent/modelContext.js';
import { sendSupportMessageTool } from '../agent/sendSupportMessage.js';

// Ex 3.2 / Sprint 3 — đăng ký tool chat có consent gate
// Chỉ đăng ký khi người dùng ĐÃ đăng nhập: chưa đăng nhập thì agent không thấy tool ghi.
export function useWebMcpChatTools(isSignedIn) {
  useEffect(() => {
    if (!isSignedIn) return;
    const unregister = registerTool(sendSupportMessageTool);
    return unregister; // đăng xuất / unmount → gỡ tool (zero ghost tool)
  }, [isSignedIn]);
}