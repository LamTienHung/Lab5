# Task Decomposition — UIT S3T Lab 5

> Trạng thái: ⬜ chưa làm · 🟨 đang làm · ✅ xong
> Cập nhật file này mỗi khi hoàn thành một task (kèm commit hash nếu có).

## Tổng quan 180 phút

| Block | Nội dung | Thư mục | Sprint |
|---|---|---|---|
| 1 | Ex 0.1 — Pure useReducer + Split Context | `EX0/` | — |
| 2 | Ex 0.2 — Derived Pagination + Container Queries | `EX0/` | Sprint 1 |
| 3 | Ex 1.1 + 1.2 — 60fps Reels + Mongoose 8 `$inc` | `EX1/` | Sprint 2 |
| 4 | Ex 2.1 + 2.2 — WebSocket không leak, Change Streams, Firebase v10 | `EX2/` | — |
| 5 | Ex 3.1 + 3.2 — WebMCP + Consent Gate + llms.txt | `EX3/` | Sprint 3 + Live Defense |

---

## EX0 — Split Context & Derived State

### Ex 0.1 — Pure useReducer & Split Context
| # | Task | Acceptance Criteria | Trạng thái |
|---|---|---|---|
| 0.1.1 | Khởi tạo Vite + React 19 | `npm run dev` chạy được | ⬜ |
| 0.1.2 | `appReducer.js` thuần | Không side-effect; action lạ → trả nguyên state | ⬜ |
| 0.1.3 | `AppProvider.jsx` tách 2 context | `AppStateContext` + `AppDispatchContext` riêng biệt | ⬜ |
| 0.1.4 | Hooks `useAppState` / `useAppDispatch` | Throw lỗi nếu dùng ngoài Provider | ⬜ |
| 0.1.5 | Đồng bộ `dataset.theme` | `useEffect([state.theme])`, toggle đúng chiều dark ↔ light | ⬜ |
| 0.1.6 | `ThemeToggle`, `TabBar` | Dùng `className`; `aria-pressed`; nút ≥ 44×44px | ⬜ |

### Ex 0.2 — Zero-Effect Pagination & Container Queries
| # | Task | Acceptance Criteria | Trạng thái |
|---|---|---|---|
| 0.2.1 | Dữ liệu mẫu `clips.js` | Mỗi item có `_id` duy nhất | ⬜ |
| 0.2.2 | `EvidenceGrid` derived | `totalPages`, `visibleItems` tính trong render; **0** useEffect | ⬜ |
| 0.2.3 | `Pagination` | Disable Prev/Next ở biên; `aria-current="page"` | ⬜ |
| 0.2.4 | Lọc theo player tag | Đổi filter → reset về trang 1 qua reducer | ⬜ |
| 0.2.5 | CSS responsive | `100dvh`, `@container`, không có width cố định 800px | ⬜ |

### Sprint 1 — Evidence Dashboard Shell
- [ ] Ghép AppProvider + EvidenceGrid thành UI shell responsive
- [ ] React DevTools Profiler: đổi trang → `ThemeToggle` **không** re-render
- [ ] ≥ 2 commit nguyên tử

---

## EX1 — Reels & Atomic Counter

### Ex 1.2 — Express 5 + Mongoose 8 (server)
| # | Task | Acceptance Criteria | Trạng thái |
|---|---|---|---|
| 1.2.1 | Kết nối Mongoose 8 | Không dùng `useNewUrlParser` / `useUnifiedTopology` | ⬜ |
| 1.2.2 | Schema `EvidenceReel` | `endorsements: { type: Number, default: 0, min: 0 }`, `timestamps: true`, index | ⬜ |
| 1.2.3 | `GET /api/v2/reels` | Trả danh sách, sort `createdAt: -1` | ⬜ |
| 1.2.4 | `PATCH /api/v2/reels/:id/endorse` | `$inc` nguyên tử; 404 nếu không tồn tại; 400 nếu id sai | ⬜ |
| 1.2.5 | Error middleware | Không try/catch thừa; trả JSON lỗi | ⬜ |
| 1.2.6 | `seed.js` | Tạo dữ liệu mẫu có `videoUrl`, `fps`, `verticalRecoilDeg` | ⬜ |

### Ex 1.1 — 60fps Vertical Reels (client)
| # | Task | Acceptance Criteria | Trạng thái |
|---|---|---|---|
| 1.1.1 | `ReelFeed` | `height: 100dvh`, `scroll-snap-type: y mandatory` | ⬜ |
| 1.1.2 | `ReelCard` + IntersectionObserver | `threshold: 0.75`; `play().catch()`; pause khi ra khỏi màn hình; `disconnect()` | ⬜ |
| 1.1.3 | Video layout | `object-fit: cover`, CLS = 0 | ⬜ |
| 1.1.4 | `TelemetryTicker` | `@keyframes` + `translate3d`; tắt khi `prefers-reduced-motion` | ⬜ |
| 1.1.5 | Nút Endorse | Gọi PATCH, cập nhật số từ response server | ⬜ |

### Sprint 2 — Handcam Reels & Atomic Petition
- [ ] Cuộn nhanh: chỉ 1 video phát tại một thời điểm
- [ ] Stress test: 50 request đồng thời → `endorsements` tăng đúng 50
- [ ] ≥ 2 commit nguyên tử

---

## EX2 — Real-Time Chat

### Ex 2.2 — Change Streams & Token Guard (server)
| # | Task | Acceptance Criteria | Trạng thái |
|---|---|---|---|
| 2.2.1 | Schema `Message` | `roomId`, `senderUid`, `senderName`, `role`, `text`, `timestamps` | ⬜ |
| 2.2.2 | `firebaseAdmin.js` | Đọc credential từ `process.env` | ⬜ |
| 2.2.3 | `verifyFirebaseToken` | 401 khi thiếu/sai token; gắn `req.user` | ⬜ |
| 2.2.4 | `POST /api/v2/rooms/:roomId/messages` | Có guard; validate text; **không** tự trigger Pusher | ⬜ |
| 2.2.5 | `changeStream.js` | `watch` insert → `pusher.trigger` kèm `_id`; handler `error` + reconnect | ⬜ |
| 2.2.6 | `GET` lịch sử tin nhắn | Trả 50 tin gần nhất theo room | ⬜ |

### Ex 2.1 — Leak-Free WebSocket & Firebase v10 (client)
| # | Task | Acceptance Criteria | Trạng thái |
|---|---|---|---|
| 2.1.1 | `lib/firebase.js` | Modular SDK: `initializeApp`, `getAuth`, `GoogleAuthProvider` | ⬜ |
| 2.1.2 | `LoginButton` | `signInWithPopup` / `signOut`; `onAuthStateChanged` có cleanup | ⬜ |
| 2.1.3 | `useRealtimeRoom` | Deps `[roomId, dispatch]`; `unbind_all` + `unsubscribe` + `disconnect` | ⬜ |
| 2.1.4 | Reducer `APPEND_MESSAGE` | Chống trùng theo `_id` | ⬜ |
| 2.1.5 | `ChatRoom` / `MessageList` | `aria-live="polite"`; key `_id`; gửi kèm `Authorization: Bearer` | ⬜ |
| 2.1.6 | Env | Chỉ `VITE_*`; có `.env.example` | ⬜ |

---

## EX3 — Agentic Web

### Ex 3.1 — WebMCP Read-Only Tool
| # | Task | Acceptance Criteria | Trạng thái |
|---|---|---|---|
| 3.1.1 | Guard hỗ trợ | `'modelContext' in navigator`; fallback UI | ⬜ |
| 3.1.2 | `searchEvidenceClips` | `readOnlyHint: true`; schema có `player` | ⬜ |
| 3.1.3 | Cleanup | `unregisterTool` khi unmount | ⬜ |

### Ex 3.2 — Consent Gate, llms.txt & Refactor
| # | Task | Acceptance Criteria | Trạng thái |
|---|---|---|---|
| 3.2.1 | `sendSupportMessage` | `await client.requestUserInteraction()` trước POST; từ chối → throw | ⬜ |
| 3.2.2 | Validate input agent | Giới hạn độ dài, kiểm tra `roomId` hợp lệ | ⬜ |
| 3.2.3 | `public/llms.txt` | Endpoint, rate limit, safety policy | ⬜ |
| 3.2.4 | `public/robots.txt` | Quy định crawler | ⬜ |
| 3.2.5 | Refactor UI | Bỏ `styled-components`/`phosphor-react` → CSS Modules + `lucide-react` | ⬜ |

### Sprint 3 — Real-Time Agentic Chat Workspace
- [ ] Ghép `useRealtimeRoom` + Firebase Auth + Change Stream + `sendSupportMessage`
- [ ] DevTools → Network → WS: đúng **1** kết nối qua 10+ tin nhắn
- [ ] Agent gửi tin → hiện hộp xác nhận → chỉ gửi khi người dùng đồng ý
- [ ] ≥ 2 commit nguyên tử

---

## Live Defense Checklist (Slide 28)
- [ ] A — Chứng minh Split Context: nút dispatch-only không làm sibling re-render
- [ ] B — Refactor 2 useEffect lọc/phân trang → 1 `useMemo`, key `_id`
- [ ] C — Sửa leak trong `useRealtimeRoom`, ổn định với 50 tin / 2 giây
- [ ] D — Thêm tool `mutateReelTelemetry` có consent gate + `unregisterTool`