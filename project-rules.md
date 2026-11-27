# Project Rules — UIT S3T Lab 5 (Real-Time & Agentic Web)

> "Generate with AI. Verify with Engineering."
> Mọi code (kể cả do AI sinh ra) phải tuân thủ các quy tắc dưới đây trước khi commit.

## 1. Stack chuẩn

| Lớp | Chuẩn bắt buộc | Cấm dùng (deprecated) |
|---|---|---|
| UI | React 19 + Vite, `useReducer` thuần + Split Context | MUI v4 (`@material-ui/core`), `react-ticker`, `styled-components`, `phosphor-react` |
| Style | CSS thuần / CSS Modules, `@container`, `100dvh`, `clamp()` | Container cố định `800px`, `object-fit: fill` |
| Icon | `lucide-react` | `phosphor-react` |
| Backend | Express 5 (async/await native) | Mongoose callback `(err, doc) => {}` |
| DB | Mongoose 8, `$inc` nguyên tử, Change Streams | `useNewUrlParser`, `useUnifiedTopology`, `likes: String` |
| Real-time | Pusher Channels, cleanup đầy đủ | Socket không `disconnect()` |
| Auth | Firebase v10+ Modular SDK, `firebase-admin` verify token | Firebase v8 namespace (`firebase.auth()`) |
| Agent | W3C WebMCP `navigator.modelContext.registerTool()` | Tool mutate không có consent gate |

## 2. Quy tắc React

- **R1 — Reducer thuần:** `appReducer(state, action)` không gọi API, không đụng DOM, không `Math.random()`/`Date.now()`. Luôn trả về object mới.
- **R2 — Split Context:** `AppStateContext` (đọc) và `AppDispatchContext` (chỉ `dispatch`) tách riêng. Component chỉ gửi action dùng `useAppDispatch()` để không re-render khi state đổi.
- **R3 — Zero redundant useEffect:** Dữ liệu suy ra được (`totalPages`, `visibleItems`, danh sách đã lọc) tính ngay trong render (hoặc `useMemo`). Không lưu vào `useState` rồi đồng bộ bằng `useEffect`.
- **R4 — useEffect chỉ dành cho đồng bộ với hệ thống ngoài:** DOM (`dataset.theme`), IntersectionObserver, Pusher, WebMCP, fetch. Mỗi effect phải có cleanup (`disconnect`, `abort`, `unregisterTool`).
- **R5 — Key ổn định:** Luôn `key={item._id}`, không dùng index mảng.
- **R6 — Khởi tạo đúng kiểu:** Mảng khởi tạo bằng `[]`, không phải `""`.
- **R7 — JSX đúng cú pháp:** `className`, không `class`.

## 3. Quy tắc Real-time

- **RT1:** Dependency của effect subscribe chỉ gồm `[roomId, dispatch]`. **Tuyệt đối không** đưa `messages` vào deps.
- **RT2:** Cleanup bắt buộc: `channel.unbind_all()` → `pusher.unsubscribe()` → `pusher.disconnect()`.
- **RT3:** Tin nhắn mới đi qua `dispatch({ type: 'APPEND_MESSAGE' })`, không `setMessages([...messages, x])` trong handler.
- **RT4:** Kiểm tra trên Chrome DevTools → Network → WS: **đúng 1** kết nối qua ≥ 20 tin nhắn.
- **RT5:** Change Stream phải có handler `error` và cơ chế reconnect.

## 4. Quy tắc Backend

- **B1:** Chỉ dùng `async/await`; Express 5 tự chuyển promise reject tới error middleware.
- **B2:** Bộ đếm cập nhật bằng `findByIdAndUpdate(id, { $inc: {...} }, { new: true, runValidators: true })`. Cấm read-modify-write (`findById` → `++` → `save()`).
- **B3:** Schema có kiểu số + validate (`type: Number, default: 0, min: 0`) và `{ timestamps: true }`.
- **B4:** Route ghi dữ liệu chat phải qua middleware `verifyFirebaseToken` (401 nếu thiếu/sai token).
- **B5:** Trả mã HTTP đúng ngữ nghĩa: 200/201, 400, 401, 404, 409, 500.

## 5. Quy tắc bảo mật

- **S1:** Không commit secret. Chỉ commit `.env.example`. Vi phạm: **−20 điểm**.
- **S2:** Client chỉ đọc biến `import.meta.env.VITE_*` (key public). Secret Pusher / service account Firebase chỉ nằm ở server (`process.env`).
- **S3:** Input từ chat/agent coi là không tin cậy: validate độ dài, kiểu, trim trước khi lưu.

## 6. Quy tắc Agentic Web (WebMCP)

- **A1:** Luôn guard `if (!('modelContext' in navigator)) return;`, app vẫn chạy khi trình duyệt không hỗ trợ.
- **A2:** Đăng ký tool trong `useEffect`, cleanup bằng `unregisterTool(name)`.
- **A3:** Tool chỉ đọc gắn `readOnlyHint: true`.
- **A4:** Tool thay đổi state **bắt buộc** `await client.requestUserInteraction(...)` trước khi gọi API; người dùng từ chối → throw, không gửi request.
- **A5:** Công bố `/public/llms.txt` (endpoint, rate limit, chính sách an toàn) và `/public/robots.txt`.

## 7. Accessibility (WCAG 2.2 AA)

- Vùng chạm tối thiểu **44×44px**; tương phản chữ ≥ **4.5:1**.
- Dùng `<button>` thật, `aria-pressed`, `aria-label`, `aria-expanded`; danh sách chat có `aria-live="polite"`.
- Tôn trọng `@media (prefers-reduced-motion: reduce)`.
- Mục tiêu Lighthouse Accessibility ≥ 95.

## 8. Quy trình Git & AI

- Commit nguyên tử, Conventional Commits: `feat(ex0): ...`, `fix(ex2): ...`, `docs: ...`, `chore: ...`.
- Mỗi sprint ≥ 2 commit.
- Mỗi lần AI sinh code sai (xem Slide 29) → ghi vào `AI_FAILURE_AUDIT.md` (prompt, lỗi, nguyên nhân, bản sửa).
- Cập nhật trạng thái task trong `TASK_DECOMPOSITION.md` khi hoàn thành.