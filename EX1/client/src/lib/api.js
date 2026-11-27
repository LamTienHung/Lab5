// Lớp gọi API — dùng đường dẫn tương đối, Vite proxy chuyển sang Express :4000

async function request(path, options = {}) {
  const res = await fetch(path, {
    headers: { Accept: 'application/json', ...options.headers },
    ...options,
  });

  // Cố đọc JSON kể cả khi lỗi để lấy message từ errorHandler của server
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const error = new Error(data?.error || `HTTP ${res.status}`);
    error.status = res.status;
    throw error;
  }
  return data;
}

// GET /api/v2/reels — nhận AbortSignal để huỷ khi component unmount
export function fetchReels({ player, signal } = {}) {
  const qs = player ? `?player=${encodeURIComponent(player)}` : '';
  return request(`/api/v2/reels${qs}`, { signal });
}

// PATCH /api/v2/reels/:id/endorse — server tăng nguyên tử bằng $inc, trả về reel mới
export function endorseReel(id) {
  return request(`/api/v2/reels/${encodeURIComponent(id)}/endorse`, { method: 'PATCH' });
}