import { memo } from 'react';

// Thay thế react-ticker (đã chết) bằng CSS @keyframes marquee + translate3d (GPU).
// Nội dung được nhân đôi: track trượt -50% rồi lặp lại → liền mạch, không giật.
function TelemetryTicker({ reel }) {
  const items = [
    `PLAYER ${reel.player}`,
    `STAGE ${reel.stage}`,
    `FPS ${reel.fps.toFixed(1)}`,
    `RECOIL ${reel.verticalRecoilDeg.toFixed(1)}°`,
    `SYNC ${reel.syncOffsetMs}ms`,
    `ENDORSE ${reel.endorsements}`,
  ];

  return (
    <div className="ticker">
      {/* Bản tĩnh cho trình đọc màn hình — không bị đọc lặp đi lặp lại */}
      <p className="visually-hidden">Telemetry: {items.join(', ')}</p>

      {/* Bản chạy chữ — ẩn khỏi trình đọc màn hình */}
      <div className="ticker-track" aria-hidden="true">
        {[0, 1].map((copy) => (
          <span className="ticker-group" key={copy}>
            {items.map((text) => (
              <span className="ticker-item" key={text}>{text}</span>
            ))}
          </span>
        ))}
      </div>
    </div>
  );
}

export default memo(TelemetryTicker);