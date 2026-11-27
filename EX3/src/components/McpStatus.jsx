import { useState } from 'react';
import { Bot } from 'lucide-react';
import { getModelContext, isNativeWebMcp } from '../agent/modelContext.js';

// Hiển thị trạng thái WebMCP cho người dùng (fallback UI khi trình duyệt chưa hỗ trợ)
function detectMode() {
  if (isNativeWebMcp()) return 'native';
  if (getModelContext()) return 'mock';
  return 'unsupported';
}

const LABEL = {
  native: 'WebMCP: trình duyệt hỗ trợ — AI agent có thể dùng tool của trang',
  mock: 'WebMCP (dev mock): thử trong Console — __webmcp.list()',
  unsupported: 'WebMCP chưa được hỗ trợ — trang vẫn hoạt động bình thường',
};

export default function McpStatus() {
  // Môi trường không đổi trong suốt phiên → tính 1 lần (lazy init), không cần useEffect
  const [mode] = useState(detectMode);

  return (
    <p className={`mcp-status mcp-status--${mode}`} role="status">
      <Bot size={16} aria-hidden="true" />
      <span>{LABEL[mode]}</span>
    </p>
  );
}