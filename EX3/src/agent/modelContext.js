// Lớp tương thích WebMCP
// - Chuẩn mới: document.modelContext, inputSchema, annotations.readOnlyHint, gỡ bằng AbortSignal
// - Chuẩn cũ (slide): navigator.modelContext, unregisterTool(name)
// - Không hỗ trợ + đang dev → cài mock để test qua Console: window.__webmcp

export function getModelContext() {
  if (typeof document !== 'undefined' && document.modelContext) return document.modelContext;
  if (typeof navigator !== 'undefined' && 'modelContext' in navigator) return navigator.modelContext;
  return null;
}

export function isNativeWebMcp() {
  const mc = getModelContext();
  return Boolean(mc && !mc.__isMock);
}

// Đăng ký tool, trả về hàm cleanup dùng trong useEffect
export function registerTool(tool) {
  const mc = getModelContext();
  if (!mc) return () => {};

  const controller = new AbortController();
  Promise.resolve(mc.registerTool(tool, { signal: controller.signal })).catch((err) => {
    if (err?.name !== 'AbortError') console.error(`[webmcp] register "${tool.name}" failed:`, err);
  });

  return () => {
    controller.abort();                                          // chuẩn mới
    if (typeof mc.unregisterTool === 'function') {               // chuẩn cũ (slide)
      try { mc.unregisterTool(tool.name); } catch { /* đã gỡ */ }
    }
  };
}

// Consent gate — BẮT BUỘC cho mọi tool thay đổi state.
// Dùng client.requestUserInteraction() nếu trình duyệt cung cấp; nếu không, tự hỏi người dùng.
export async function requestConsent(client, message) {
  const ask = () => window.confirm(`🤖 AI agent yêu cầu:\n\n${message}\n\nBạn có đồng ý không?`);

  if (client && typeof client.requestUserInteraction === 'function') {
    return Boolean(await client.requestUserInteraction(async () => ask()));
  }
  return ask();
}

// ---------- Mock cho môi trường dev (không có WebMCP native) ----------
export function installDevMock() {
  if (getModelContext() || !import.meta.env.DEV) return;

  const tools = new Map();
  const mock = {
    __isMock: true,
    async registerTool(tool, { signal } = {}) {
      if (tools.has(tool.name)) throw new Error(`Tool "${tool.name}" already registered`);
      tools.set(tool.name, tool);
      signal?.addEventListener('abort', () => tools.delete(tool.name), { once: true });
    },
    unregisterTool(name) {
      tools.delete(name);
    },
  };

  Object.defineProperty(document, 'modelContext', { value: mock, configurable: true });

  // Giả lập "AI agent" gọi tool từ DevTools Console
  window.__webmcp = {
    list: () =>
      [...tools.values()].map((t) => ({
        name: t.name,
        readOnly: Boolean(t.annotations?.readOnlyHint),
        description: t.description,
      })),
    call: async (name, input = {}) => {
      const tool = tools.get(name);
      if (!tool) throw new Error(`Tool "${name}" chưa được đăng ký`);
      const client = { requestUserInteraction: async (cb) => cb() };
      return tool.execute(input, client);
    },
  };

  console.info('[webmcp] Dev mock active — thử: __webmcp.list(), __webmcp.call("searchEvidenceClips", { player: "Himass" })');
}