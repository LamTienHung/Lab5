import { memo, useEffect, useRef, useState } from 'react';
import TelemetryTicker from './TelemetryTicker.jsx';
import { endorseReel } from '../lib/api.js';

// Ex 1.1 — 60fps Vertical Reel
// - IntersectionObserver threshold 0.75: vào ≥75% khung nhìn → play, ra → pause
// - play().catch(): trình duyệt có thể chặn autoplay → bắt lỗi, không crash
// - cleanup observer.disconnect() → không rò rỉ observer
function ReelCard({ reel, onUpdated }) {
  const containerRef = useRef(null);
  const videoRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [muted, setMuted] = useState(true); // muted → autoplay được phép trên mọi trình duyệt
  const [pending, setPending] = useState(0); // số request endorse đang chờ
  const [error, setError] = useState('');

  // ---------- Viewport auto-play engine ----------
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const video = videoRef.current;
        if (!video) return;

        if (entry.isIntersecting) {
          video.play().catch((err) => {
            // Bị chặn autoplay (thường do có tiếng) → tắt tiếng rồi thử lại
            console.debug('Autoplay blocked', err.name);
            video.muted = true;
            setMuted(true);
            video.play().catch(() => {});
          });
        } else {
          // Ra khỏi màn hình → dừng để giải phóng bộ giải mã phần cứng
          video.pause();
        }
      },
      { threshold: 0.75 }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // ---------- Điều khiển thủ công ----------
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play().catch(() => {});
    else video.pause();
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  };

  // ---------- Endorse: server $inc, client chỉ hiển thị giá trị server trả về ----------
  const handleEndorse = async () => {
    setError('');
    setPending((n) => n + 1);
    try {
      const updated = await endorseReel(reel._id);
      onUpdated(updated);
    } catch (err) {
      setError(err.status === 404 ? 'Reel không còn tồn tại.' : 'Không gửi được, thử lại.');
    } finally {
      setPending((n) => n - 1);
    }
  };

  const titleId = `reel-title-${reel._id}`;

  return (
    <article ref={containerRef} className="reel" aria-labelledby={titleId}>
      <video
        ref={videoRef}
        className="reel__video"
        src={reel.videoUrl}
        poster={reel.posterUrl}
        muted={muted}
        loop
        playsInline
        preload="metadata"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      <div className="reel__overlay">
        <TelemetryTicker reel={reel} />

        <div className="reel__bottom">
          <div className="reel__info">
            <span className={`player-tag player-tag--${reel.player.toLowerCase()}`}>{reel.player}</span>
            <h2 id={titleId} className="reel__title">{reel.title}</h2>
            <p className="reel__stage">{reel.stage}</p>
          </div>

          <div className="reel__actions">
            <button
              type="button"
              className="reel-btn"
              aria-pressed={isPlaying}
              aria-label="Bật/tắt phát reel"
              onClick={togglePlay}
            >
              {isPlaying ? '❚❚' : '▶'}
            </button>

            <button
              type="button"
              className="reel-btn"
              aria-pressed={!muted}
              aria-label={muted ? 'Bật tiếng' : 'Tắt tiếng'}
              onClick={toggleMute}
            >
              {muted ? '🔇' : '🔊'}
            </button>

            <button
              type="button"
              className="reel-btn reel-btn--endorse"
              aria-label={`Ủng hộ kháng nghị, hiện có ${reel.endorsements} lượt`}
              aria-busy={pending > 0}
              onClick={handleEndorse}
            >
              <span aria-hidden="true">✊</span>
              <span className="reel-btn__count">{reel.endorsements}</span>
            </button>
          </div>
        </div>

        <p className="reel__error" role="status" aria-live="polite">{error}</p>
      </div>
    </article>
  );
}

export default memo(ReelCard);