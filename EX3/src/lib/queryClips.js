import { clips } from '../data/clips.js';

// Hàm truy vấn THUẦN (không side-effect) — dùng chung cho UI người và tool của AI agent.
// Trả về dữ liệu đã chọn lọc, KHÔNG trả nguyên object nội bộ.

const PLAYERS = ['Himass', 'TanVuu'];

function getFpsStatus(fps) {
  if (fps >= 59.4) return 'NOMINAL';
  if (fps >= 55) return 'MARGINAL';
  return 'DESYNC';
}

export function queryClips({ player, stage, limit = 10 } = {}) {
  // Chuẩn hoá & validate input (input từ agent là KHÔNG tin cậy)
  const normalizedPlayer = PLAYERS.find(
    (p) => p.toLowerCase() === String(player ?? '').trim().toLowerCase()
  );
  if (player && !normalizedPlayer) {
    return { ok: false, error: `Unknown player "${player}". Allowed: ${PLAYERS.join(', ')}` };
  }

  const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 20);

  const results = clips
    .filter((c) => !normalizedPlayer || c.player === normalizedPlayer)
    .filter((c) => !stage || c.stage.toLowerCase() === String(stage).toLowerCase())
    .slice(0, safeLimit)
    .map((c) => ({
      id: c._id,
      player: c.player,
      title: c.title,
      stage: c.stage,
      fps: c.fps,
      fpsStatus: getFpsStatus(c.fps),
      verticalRecoilDeg: c.verticalRecoilDeg,
      syncOffsetMs: c.syncOffsetMs,
    }));

  return { ok: true, count: results.length, clips: results };
}