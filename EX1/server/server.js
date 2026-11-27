import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { connectDB, disconnectDB } from './db.js';
import reelsRouter from './routes/reels.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 4000;

const app = express();

// ---------- Middleware ----------
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '100kb' }));

// Video mẫu đặt trong EX1/server/media/*.mp4 → phục vụ tại /media/<tên file>
app.use('/media', express.static(path.join(__dirname, 'media'), { maxAge: '1h' }));

// ---------- Routes ----------
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

app.use('/api/v2/reels', reelsRouter);

// ---------- Error handling (luôn đặt cuối) ----------
app.use(notFound);
app.use(errorHandler);

// ---------- Start: kết nối DB trước rồi mới listen ----------
async function start() {
  try {
    await connectDB();
    const server = app.listen(PORT, () => {
      console.log(`[server] http://localhost:${PORT}`);
    });

    // Tắt êm khi Ctrl+C
    const shutdown = async (signal) => {
      console.log(`\n[server] ${signal} → shutting down...`);
      server.close();
      await disconnectDB();
      process.exit(0);
    };
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (err) {
    console.error('[server] Failed to start:', err.message);
    process.exit(1);
  }
}

start();