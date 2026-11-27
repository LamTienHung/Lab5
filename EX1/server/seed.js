import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { connectDB, disconnectDB } from './db.js';
import { EvidenceReel } from './models/EvidenceReel.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MEDIA_DIR = path.join(__dirname, 'media');

// Tự tìm các file .mp4 trong EX1/server/media/
function findVideos() {
  if (!fs.existsSync(MEDIA_DIR)) return [];
  return fs
    .readdirSync(MEDIA_DIR)
    .filter((f) => f.toLowerCase().endsWith('.mp4'))
    .sort();
}

const BASE_REELS = [
  { player: 'Himass', title: 'Handcam POV — Spray control M416',   stage: 'Group Stage', fps: 60.0, verticalRecoilDeg: 14.2, syncOffsetMs: 0 },
  { player: 'TanVuu', title: 'Handcam POV — Beryl M762 long range', stage: 'Group Stage', fps: 59.8, verticalRecoilDeg: 16.9, syncOffsetMs: 4 },
  { player: 'Himass', title: 'Desk cam — Mouse movement sync',      stage: 'Semi Final',  fps: 60.0, verticalRecoilDeg: 13.8, syncOffsetMs: 2 },
  { player: 'TanVuu', title: 'Handcam POV — AUG close quarters',    stage: 'Semi Final',  fps: 57.6, verticalRecoilDeg: 12.4, syncOffsetMs: 6 },
  { player: 'Himass', title: 'Full-round handcam — Erangel R3',     stage: 'Grand Final', fps: 60.0, verticalRecoilDeg: 15.1, syncOffsetMs: 1 },
  { player: 'TanVuu', title: 'Handcam POV — Final circle clutch',   stage: 'Grand Final', fps: 54.2, verticalRecoilDeg: 14.7, syncOffsetMs: 14 },
];

async function seed() {
  const videos = findVideos();
  if (videos.length === 0) {
    console.warn('[seed] ⚠ Không tìm thấy file .mp4 trong EX1/server/media/ — videoUrl sẽ trỏ tới file chưa tồn tại.');
  } else {
    console.log(`[seed] Tìm thấy ${videos.length} video: ${videos.join(', ')}`);
  }

  await connectDB();

  await EvidenceReel.deleteMany({});

  const docs = BASE_REELS.map((reel, i) => ({
    ...reel,
    // Xoay vòng các video có sẵn; đường dẫn tương đối, client proxy /media → server
    videoUrl: `/media/${videos.length ? videos[i % videos.length] : `clip${i + 1}.mp4`}`,
    endorsements: 0,
  }));

  const inserted = await EvidenceReel.insertMany(docs);
  console.log(`[seed] ✓ Đã tạo ${inserted.length} reels`);
  inserted.forEach((r) => console.log(`   ${r._id}  ${r.player.padEnd(6)}  ${r.videoUrl}`));
}

seed()
  .catch((err) => {
    console.error('[seed] ✗', err.message);
    process.exitCode = 1;
  })
  .finally(disconnectDB);