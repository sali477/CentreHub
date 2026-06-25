#!/usr/bin/env node
/**
 * Configure Google OAuth in frontend/.env and backend/.env
 *
 * Usage:
 *   node scripts/setup-google-oauth.mjs YOUR_CLIENT_ID.apps.googleusercontent.com YOUR_CLIENT_SECRET
 *   npm run setup:google -- YOUR_CLIENT_ID YOUR_CLIENT_SECRET
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const clientId = (process.argv[2] || '').trim();
const clientSecret = (process.argv[3] || '').trim();

if (!clientId || clientId.includes('your_google')) {
  console.log(`
CentreHub — Google OAuth setup
================================

1. Open: https://console.cloud.google.com/apis/credentials
2. Create OAuth 2.0 Client ID → Web application
3. Authorized JavaScript origins: http://localhost:5173
4. Copy Client ID and Client Secret

Then run:

  npm run setup:google -- YOUR_CLIENT_ID.apps.googleusercontent.com YOUR_CLIENT_SECRET

Example:

  npm run setup:google -- 123456789-abc.apps.googleusercontent.com GOCSPX-xxxxx

After that, restart: npm run dev

Note: On OAuth consent screen, add your email as a Test user if app is in Testing mode.
`);
  process.exit(clientId ? 1 : 0);
}

if (!clientId.includes('.apps.googleusercontent.com')) {
  console.warn('Warning: Client ID usually ends with .apps.googleusercontent.com');
}

const upsertEnv = (filePath, updates) => {
  const keys = Object.keys(updates);
  let lines = [];
  if (fs.existsSync(filePath)) {
    lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
  }

  for (const [key, value] of Object.entries(updates)) {
    const idx = lines.findIndex((l) => l.startsWith(`${key}=`));
    const line = `${key}=${value}`;
    if (idx >= 0) lines[idx] = line;
    else lines.push(line);
  }

  fs.writeFileSync(filePath, `${lines.filter((l, i, a) => l.length || i < a.length - 1).join('\n')}\n`, 'utf8');
};

const frontendEnv = path.join(root, 'frontend', '.env');
const backendEnv = path.join(root, 'backend', '.env');

upsertEnv(frontendEnv, {
  VITE_GOOGLE_CLIENT_ID: clientId,
});

upsertEnv(backendEnv, {
  GOOGLE_CLIENT_ID: clientId,
  ...(clientSecret ? { GOOGLE_CLIENT_SECRET: clientSecret } : {}),
});

console.log('✓ Updated frontend/.env → VITE_GOOGLE_CLIENT_ID');
console.log('✓ Updated backend/.env → GOOGLE_CLIENT_ID');
if (clientSecret) console.log('✓ Updated backend/.env → GOOGLE_CLIENT_SECRET');
console.log('\nRestart the app: npm run dev');
