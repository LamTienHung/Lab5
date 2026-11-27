import { useCallback, useEffect, useState } from 'react';
import ReelCard from './ReelCard.jsx';
import { fetchReels } from '../lib/api.js';

// Feed dọc 100dvh, scroll-snap — mỗi ReelCard tự quản lý play/pause bằng IntersectionObserver.
export default function ReelFeed() {
  const [reels, setReels] = useState([]); // [] chứ không phải ""
  const [status, setStatus] = useState('loading'); // 'loading' | 'ready' | 'error'
  const [reloadKey, setReloadKey] = useState(0);

  // Fetch = đồng bộ với hệ thống ngoài → hợp lệ dùng useEffect, có AbortController teardown
  useEffect(() => {
    const controller = new AbortController();
    setStatus('loading');

    fetchReels({ signal: controller.signal })
      .then((data) => {
        setReels(data);
        setStatus('ready');
      })
      .catch((err) => {
        if (err.name === 'AbortError') return; // bị huỷ do unmount/StrictMode → bỏ qua
        console.error('[reels] fetch failed:', err);
        setStatus('error');
      });

    return () => controller.abort();
  }, [reloadKey]);

  // useCallback → tham chiếu ổn định, ReelCard (memo) không render lại vô ích
  const handleUpdated = useCallback((updated) => {
    setReels((prev) =>
      prev.map((reel) =>
        // Response có thể về sai thứ tự khi bấm liên tục → chỉ nhận giá trị lớn hơn
        reel._id === updated._id && updated.endorsements > reel.endorsements
          ? { ...reel, endorsements: updated.endorsements }
          : reel
      )
    );
  }, []);

  if (status === 'loading') {
    return <p className="feed-message" role="status">Đang tải reels…</p>;
  }

  if (status === 'error') {
    return (
      <div className="feed-message" role="alert">
        <p>Không tải được reels. Kiểm tra server EX1 (cổng 4000) đã chạy chưa.</p>
        <button type="button" className="reel-btn reel-btn--text" onClick={() => setReloadKey((k) => k + 1)}>
          Thử lại
        </button>
      </div>
    );
  }

  if (reels.length === 0) {
    return <p className="feed-message">Chưa có reel nào. Chạy <code>npm run seed</code> ở server.</p>;
  }

  return (
    <main className="reel-feed" aria-label="Handcam evidence reels">
      {reels.map((reel) => (
        <ReelCard key={reel._id} reel={reel} onUpdated={handleUpdated} />
      ))}
    </main>
  );
}