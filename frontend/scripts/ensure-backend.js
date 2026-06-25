/**
 * Ensures the CentreHub API is reachable before Vite starts.
 * If the backend is down, starts it automatically and waits for /api/health.
 */
import http from 'http';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BACKEND_DIR = path.resolve(__dirname, '../../backend');
const HEALTH_URL = process.env.VITE_PROXY_TARGET
  ? `${process.env.VITE_PROXY_TARGET.replace(/\/$/, '')}/api/health`
  : 'http://127.0.0.1:5000/api/health';

const ping = () =>
  new Promise((resolve) => {
    const req = http.get(HEALTH_URL, (res) => {
      resolve(res.statusCode === 200);
      res.resume();
    });
    req.on('error', () => resolve(false));
    req.setTimeout(2000, () => {
      req.destroy();
      resolve(false);
    });
  });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const startBackend = () => {
  console.log('\n⏳ Backend not detected — starting API server...\n');
  const child = spawn('npm', ['run', 'dev'], {
    cwd: BACKEND_DIR,
    shell: true,
    detached: true,
    stdio: 'ignore',
  });
  child.unref();
};

const main = async () => {
  if (await ping()) {
    console.log('✓ Backend API is running');
    return;
  }

  startBackend();

  for (let i = 0; i < 30; i += 1) {
    await sleep(1000);
    if (await ping()) {
      console.log('✓ Backend API started on http://127.0.0.1:5000\n');
      return;
    }
  }

  console.error('\n❌ Could not reach the backend after 30s.');
  console.error('   1. Make sure MongoDB is running');
  console.error('   2. From project root run: npm run dev');
  console.error('   3. Or manually: cd backend && npm run dev\n');
  process.exit(1);
};

main();
