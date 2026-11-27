import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Proxy /api → Express EX2 (cổng 4001). Client gọi fetch('/api/...') như cùng origin.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    proxy: {
      '/api': 'http://127.0.0.1:4001',
    },
  },
});