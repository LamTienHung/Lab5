// Sprint 2 — Stress test atomic $inc
// Bắn N request PATCH /endorse ĐỒNG THỜI vào 1 reel, rồi kiểm tra counter tăng đúng N.
// Chạy: npm run stress -- <reelId> [N]

const BASE = `http://127.0.0.1:${process.env.PORT || 4000}/api/v2/reels`;
const [reelId, nArg] = process.argv.slice(2);
const N = Number(nArg) || 50;

if (!reelId) {
  console.error('Thiếu reelId. Ví dụ: npm run stress -- 6b093c8a7a4c6dfc5cb4e182 50');
  process.exit(1);
}

async function getCount() {
  const res = await fetch(`${BASE}/${reelId}`);
  if (!res.ok) throw new Error(`GET reel thất bại: HTTP ${res.status}`);
  return (await res.json()).endorsements;
}

const before = await getCount();
console.log(`Trước: endorsements = ${before}`);
console.log(`Bắn ${N} request PATCH đồng thời...`);

const t0 = performance.now();
const results = await Promise.allSettled(
  Array.from({ length: N }, () => fetch(`${BASE}/${reelId}/endorse`, { method: 'PATCH' }))
);
const ms = (performance.now() - t0).toFixed(0);

const ok = results.filter((r) => r.status === 'fulfilled' && r.value.ok).length;
const after = await getCount();

console.log(`Xong sau ${ms}ms — ${ok}/${N} request thành công`);
console.log(`Sau:   endorsements = ${after}`);
console.log(`Kỳ vọng: ${before} + ${ok} = ${before + ok}`);
console.log(after === before + ok ? '✅ PASS — không mất lượt nào (atomic $inc)' : '❌ FAIL — có lượt bị mất (race condition)');

process.exit(after === before + ok ? 0 : 1);