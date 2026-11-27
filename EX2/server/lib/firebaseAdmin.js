import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// firebase-admin v13 — modular imports (không dùng admin.initializeApp kiểu namespace cũ)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SERVER_ROOT = path.resolve(__dirname, '..');

function loadServiceAccount() {
  const relPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (!relPath) {
    throw new Error('Thiếu FIREBASE_SERVICE_ACCOUNT_PATH trong .env');
  }

  const absPath = path.resolve(SERVER_ROOT, relPath);
  if (!fs.existsSync(absPath)) {
    throw new Error(`Không tìm thấy file service account: ${absPath}`);
  }

  return JSON.parse(fs.readFileSync(absPath, 'utf8'));
}

// Tránh khởi tạo 2 lần khi node --watch reload
const app = getApps()[0] ?? initializeApp({ credential: cert(loadServiceAccount()) });

export const adminAuth = getAuth(app);