# AI Failure Audit — UIT S3T Lab 5

> Ghi lại các đoạn code / hướng dẫn **sai thật sự** do AI (Claude) sinh ra trong quá trình làm Lab 5,
> nguyên nhân gốc, bản sửa đã kiểm chứng và bằng chứng.
> Công cụ AI: Claude (claude.ai). Người kiểm chứng: Lâm Tiến Hưng.

## Bảng tổng hợp

| ID | Bài | Loại lỗi | Mô tả ngắn | Trạng thái |
|---|---|---|---|---|
| AI-001 | EX3 | `OTHER` — API lỗi thời | Contract WebMCP trong slide/AI dùng API cũ (`navigator.modelContext`, `parameters`, `unregisterTool`) | ✅ Đã sửa |
| AI-002 | EX2/EX3 | `REACTIVE-LOOP` (biến thể cleanup) | `pusher.unsubscribe()` vô điều kiện → lỗi *WebSocket is already in CLOSING or CLOSED state* | ✅ Đã sửa |
| AI-003 | Git | `OTHER` — sai shell | Commit message dùng `\$inc` (cú pháp Bash) trên PowerShell | ✅ Đã sửa |
| AI-004 | EX3 | `OTHER` — sai lệnh hệ thống | `Copy-Item -Recurse ... -Exclude node_modules` copy lồng thư mục & không loại trừ node_modules | ✅ Đã sửa |
| AI-005 | EX1 | `OTHER` — CSS layout | `.app-bar` fixed full-width làm tiêu đề lệch khỏi cột reel 480px | ✅ Đã sửa |
| AI-006 | EX2 | `OTHER` — CSS layout | Bong bóng chat người khác bị kéo giãn hết chiều ngang | ✅ Đã sửa |

---

### AI-001 — Contract WebMCP lỗi thời (navigator vs document)
- **Bài / File:** `EX3/src/agent/modelContext.js`, `EX3/src/hooks/useEvidenceMcp.js`
- **Loại lỗi:** `OTHER` (API hallucination / tài liệu lỗi thời)
- **Code sai (theo slide 18, 27):**
  ```js
  navigator.modelContext.registerTool({
    name: 'searchEvidenceClips',
    parameters: { type: 'object', properties: { player: { type: 'string' } } },
    readOnlyHint: true,
    execute: async ({ player }) => queryClips(player),
  });
  return () => navigator.modelContext.unregisterTool('searchEvidenceClips');
  ```
- **Triệu chứng:** Đối chiếu đặc tả W3C WebMCP & tài liệu Chrome hiện tại: `modelContext` nằm trên `document`;
  tham số khai báo bằng `inputSchema`; `readOnlyHint` nằm trong `annotations`; không còn `unregisterTool` —
  gỡ tool bằng `AbortSignal` truyền vào `registerTool()`. Code theo slide sẽ không đăng ký đúng trên Chrome bật cờ WebMCP.
- **Nguyên nhân gốc:** Đặc tả WebMCP còn thử nghiệm và thay đổi nhanh; slide và AI dựa trên bản nháp cũ.
- **Bản sửa:** Lớp tương thích hỗ trợ cả hai chuẩn + mock cho dev:
  ```js
  export function getModelContext() {
    if (document.modelContext) return document.modelContext;               // chuẩn mới
    if ('modelContext' in navigator) return navigator.modelContext;         // chuẩn cũ (slide)
    return null;
  }
  export function registerTool(tool) {
    const mc = getModelContext();
    if (!mc) return () => {};
    const controller = new AbortController();
    mc.registerTool(tool, { signal: controller.signal });
    return () => {
      controller.abort();
      if (typeof mc.unregisterTool === 'function') mc.unregisterTool(tool.name);
    };
  }
  // Tool: inputSchema + annotations: { readOnlyHint: true }
  ```
- **Cách kiểm chứng:** Console: `__webmcp.list()` → 2 tool; `__webmcp.call('searchEvidenceClips', { player: 'Himass', limit: 3 })` → `{ ok: true, count: 3 }`; không có lỗi "Tool already registered" khi StrictMode mount 2 lần (chứng minh cleanup chạy).

---

### AI-002 — Cleanup Pusher gửi frame lên socket đã đóng
- **Bài / File:** `EX2/client/src/hooks/useRealtimeRoom.js`, `EX3/src/hooks/useRealtimeRoom.js`
- **Loại lỗi:** `REACTIVE-LOOP` (biến thể: cleanup không an toàn)
- **Code sai (bám contract slide 26):**
  ```js
  return () => {
    channel.unbind_all();
    pusher.unsubscribe(channelName);   // gọi cả khi socket chưa mở / đã đóng
    pusher.disconnect();
  };
  ```
- **Triệu chứng:** Console đỏ `WebSocket is already in CLOSING or CLOSED state` (`useRealtimeRoom.js:43`) mỗi khi Vite HMR / StrictMode remount lúc socket đang bắt tay.
- **Nguyên nhân gốc:** `unsubscribe()` gửi frame `pusher:unsubscribe` lên socket; khi cleanup chạy trước lúc kết nối xong, socket đã ở trạng thái CLOSING.
- **Bản sửa:**
  ```js
  return () => {
    channel.unbind_all();
    if (pusher.connection.state === 'connected') {
      pusher.unsubscribe(channelName);
    }
    pusher.connection.unbind_all();
    pusher.disconnect();   // server tự huỷ mọi subscription của kết nối
  };
  ```
- **Cách kiểm chứng:** F5 + lưu file nhiều lần → Console còn 0 lỗi; DevTools Network → Socket: vẫn đúng 1 kết nối Pusher mở qua 20 tin (`docs/sprint3-single-websocket.png`).

---

### AI-003 — Escape sai shell trong commit message
- **Bài / File:** Lệnh git commit EX1
- **Loại lỗi:** `OTHER`
- **Code sai:**
  ```powershell
  git commit -m "feat(ex1): Express 5 + Mongoose 8 reels API with atomic \$inc endorse"
  ```
- **Triệu chứng:** Trong PowerShell, `\` không phải ký tự escape; `$inc` trong chuỗi nháy kép bị hiểu là biến rỗng → message mất chữ `$inc`.
- **Nguyên nhân gốc:** AI sinh lệnh theo cú pháp Bash, không tính tới môi trường Windows PowerShell của người dùng.
- **Bản sửa:**
  ```powershell
  git commit -m 'feat(ex1): Express 5 + Mongoose 8 reels API with atomic $inc endorse'
  ```
- **Cách kiểm chứng:** `git log --oneline` hiển thị đúng `$inc`.

---

### AI-004 — Lệnh copy thư mục sai trên PowerShell
- **Bài / File:** Tạo `EX3` từ `EX2/client`
- **Loại lỗi:** `OTHER`
- **Code sai:**
  ```powershell
  Copy-Item -Recurse EX2/client EX3 -Exclude node_modules
  ```
- **Triệu chứng:** (1) `EX3` đã tồn tại → bị copy lồng thành `EX3\client\...`, `npm install` báo `ENOENT package.json`; (2) `-Exclude` trong PowerShell 5 không loại trừ thư mục con sâu → nguy cơ copy cả `node_modules`.
- **Nguyên nhân gốc:** AI không tính hành vi khác nhau của `Copy-Item` khi đích đã tồn tại và giới hạn của `-Exclude`.
- **Bản sửa:**
  ```powershell
  Remove-Item -Recurse -Force EX3\client
  robocopy EX2\client EX3 /E /XD node_modules
  ```
- **Cách kiểm chứng:** `Get-ChildItem -Force EX3` → có `package.json`, `src`, không có thư mục `client`.

---

### AI-005 — App bar EX1 lệch khỏi cột reel
- **Bài / File:** `EX1/client/src/styles/Reels.css`
- **Loại lỗi:** `OTHER`
- **Code sai:**
  ```css
  .app-bar { position: fixed; inset: 0 0 auto 0; }
  ```
- **Triệu chứng:** Trên desktop, cột reel rộng 480px ở giữa nhưng tiêu đề `#JusticeForHimassTanVuu` dính mép trái màn hình, bị cắt chữ.
- **Nguyên nhân gốc:** AI đặt app bar theo viewport thay vì theo cột nội dung.
- **Bản sửa:**
  ```css
  .app-bar {
    position: fixed; top: 0; left: 50%; transform: translateX(-50%);
    width: 100%; max-width: 480px;
  }
  ```
- **Cách kiểm chứng:** Ảnh chụp trước/sau — tiêu đề nằm gọn trên khung video.

---

### AI-006 — Bong bóng chat bị kéo giãn
- **Bài / File:** `EX2/client/src/styles/ChatWorkspace.css`
- **Loại lỗi:** `OTHER`
- **Code sai:**
  ```css
  .chat-list { display: flex; flex-direction: column; }
  .chat-bubble { max-width: min(75%, 560px); }   /* thiếu align-self */
  ```
- **Triệu chứng:** Tin của người khác chiếm gần hết chiều ngang (flex item mặc định `align-items: stretch`).
- **Nguyên nhân gốc:** AI chỉ đặt `align-self: flex-end` cho tin của mình, quên tin của người khác.
- **Bản sửa:**
  ```css
  .chat-bubble { align-self: flex-start; max-width: min(75%, 560px); }
  ```
- **Cách kiểm chứng:** Mở 2 cửa sổ (thường + ẩn danh), bong bóng co theo nội dung.

---

## Các mẫu hallucination trong Slide 29 đã chủ động phòng tránh

Không phát sinh lỗi vì đã áp dụng chuẩn ngay từ đầu (ghi lại để đối chiếu khi defense):

| Slide 29 | Mẫu sai thường gặp | Cách làm trong repo | File |
|---|---|---|---|
| 01 Reactive Loop | `useEffect(..., [roomId, messages])` | deps `[roomId, dispatch]` + `APPEND_MESSAGE` | `EX2/client/src/hooks/useRealtimeRoom.js` |
| 02 Firebase v8 | `firebase.initializeApp()`, `firebase.auth()` | `initializeApp` + `getAuth` modular | `EX2/client/src/lib/firebase.js` |
| 03 Mongoose callbacks | `findById(id, (err, doc) => …)`, `useNewUrlParser` | `await` + Express 5 error handler | `EX1/server/db.js`, `routes/reels.js` |
| 04 Dead dependencies | `react-ticker`, `@material-ui/core` | CSS `@keyframes marquee` + `translate3d` | `EX1/client/src/components/TelemetryTicker.jsx` |
| 05 Unguarded agent | Tool mutate không hỏi người dùng | `requestConsent()` trước mọi network request | `EX3/src/agent/sendSupportMessage.js` |