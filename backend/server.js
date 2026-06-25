import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { generalApiLimiter } from './src/middleware/rateLimiters.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './src/config/db.js';
import routes from './src/routes/index.js';
import chatRoutes from './src/routes/chatRoutes.js';
import { errorHandler, notFound } from './src/middleware/errorHandler.js';
import { initializeSocket } from './src/socket/index.js';
import { stripeWebhook } from './src/controllers/paymentController.js';
import { isCloudinaryConfigured } from './src/utils/fileStorage.js';
import { getAIProvider, DEFAULT_CHAT_MODEL } from './src/utils/aiHelpers.js';
import { isGoogleAuthConfigured } from './src/services/authService.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, 'uploads');

const app = express();
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

initializeSocket(io);
app.set('io', io);

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

// Stripe webhook needs raw body — must be before express.json()
app.post(
  '/api/payments/webhook/stripe',
  express.raw({ type: 'application/json' }),
  stripeWebhook
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Local file uploads (used when Cloudinary is not configured)
app.use('/uploads', express.static(uploadsDir));

app.use('/chat', chatRoutes);
app.use('/api', generalApiLimiter, routes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Port ${PORT} is already in use.`);
    console.error('   Fix options:');
    console.error(`   1. Run: npm run kill-port`);
    console.error(`   2. Or run: npm run dev:clean`);
    console.error(`   3. Or change PORT in .env (e.g. PORT=5001)\n`);
    process.exit(1);
  }
  throw err;
});

const startServer = async () => {
  await connectDB();

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`CentreHub Morocco API running on http://127.0.0.1:${PORT}`);
    console.log(
      isCloudinaryConfigured()
        ? 'File uploads: Cloudinary'
        : 'File uploads: local disk (backend/uploads/)'
    );
    const provider = getAIProvider();
    if (provider) {
      console.log(`AI chat: ${provider} (${DEFAULT_CHAT_MODEL})`);
    }
    console.log(
      isGoogleAuthConfigured()
        ? 'Google OAuth: configured (http://localhost:5173)'
        : 'Google OAuth: not configured — set GOOGLE_CLIENT_ID in backend/.env'
    );
  });
};

startServer();

export default app;
