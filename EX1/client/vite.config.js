import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Proxy: client gọi /api/... và /media/... như cùng origin,
// Vite chuyển tiếp sang Express (cổng 4000) → không vướng CORS, không hardcode URL server.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    proxy: {
      '/api': 'http://127.0.0.1:4000',
      '/media': 'http://127.0.0.1:4000',
    },
  },
});