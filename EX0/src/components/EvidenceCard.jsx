import { memo } from 'react';

// Ngưỡng badge theo HUD contract (Slide 30)
export function getFpsBadge(fps) {
  if (fps >= 59.4) return { label: 'NOMINAL', tone: 'ok' };
  if (fps >= 55) return { label: 'MARGINAL', tone: 'warn' };
  return { label: 'DESYNC', tone: 'bad' };
}

function formatDuration(totalSec) {
  const m = Math.floor(totalSec / 60);
  const s = String(totalSec % 60).padStart(2, '0');
  return `${m}:${s}`;
}

// Component thuần hiển thị: chỉ nhận prop, không đọc context.
// memo → card cùng `clip` không render lại khi trang khác thay đổi.
function EvidenceCard({ clip }) {
  const badge = getFpsBadge(clip.fps);
  const titleId = `clip-title-${clip._id}`;

  return (
    <article className="evidence-card" aria-labelledby={titleId}>
      <header className="evidence-card__header">
        <span className={`player-tag player-tag--${clip.player.toLowerCase()}`}>{clip.player}</span>
        <span className="stage-tag">{clip.stage}</span>
      </header>

      <h3 id={titleId} className="evidence-card__title">{clip.title}</h3>

      <dl className="telemetry">
        <div>
          <dt>FPS</dt>
          <dd>{clip.fps.toFixed(1)}</dd>
        </div>
        <div>
          <dt>Recoil</dt>
          <dd>{clip.verticalRecoilDeg.toFixed(1)}°</dd>
        </div>
        <div>
          <dt>Sync</dt>
          <dd>{clip.syncOffsetMs} ms</dd>
        </div>
        <div>
          <dt>Duration</dt>
          <dd>{formatDuration(clip.durationSec)}</dd>
        </div>
      </dl>

      <footer className="evidence-card__footer">
        <span className={`badge badge--${badge.tone}`}>
          {badge.label}
          <span className="visually-hidden"> — trạng thái đồng bộ khung hình</span>
        </span>
      </footer>
    </article>
  );
}

export default memo(EvidenceCard);