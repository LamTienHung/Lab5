import express from 'express';
import cors from 'cors';
import { connectDB, disconnectDB } from './db.js';
import messagesRouter from './routes/messages.js';
import { startMessageStream, stopMessageStream } from './changeStream.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

const PORT = Number(process.env.PORT) || 4001;
const app = express();

// ---------- Middleware ----------
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '20kb' }));

// ---------- Routes ----------
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

app.use('/api/v2/rooms', messagesRouter);

// ---------- Error handling ----------
app.use(notFound);
app.use(errorHandler);

// ---------- Start ----------
async function start() {
  try {
    await connectDB();        // kiểm tra luôn replica set
    startMessageStream();     // bắt đầu watch → Pusher

    const server = app.listen(PORT, () => {
      console.log(`[server] http://localhost:${PORT}`);
    });

    const shutdown = async (signal) => {
      console.log(`\n[server] ${signal} → shutting down...`);
      server.close();
      await stopMessageStream();
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