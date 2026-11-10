import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { config } from './config/env.js';
import { getDbStatus } from './config/db.js';
import { AppError, errorHandler } from './utils/errors.js';
import videoRoutes from './routes/videoRoutes.js';
import authRoutes from './routes/authRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

app.use(compression());

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'fail',
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'fail',
    message: 'Too many authentication attempts, please try again after 15 minutes',
  },
});

app.use('/api', generalLimiter);
app.use('/api/auth', authLimiter);

app.use(
  cors({
    origin: [config.clientUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get('/api/health', (req, res) => {
  const dbStatus = getDbStatus();
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'youtube-ai-summarizer-api',
    environment: process.env.NODE_ENV || 'development',
    geminiConfigured: Boolean(config.geminiApiKey && config.geminiApiKey.trim().length > 0),
    geminiModel: config.geminiModel,
    database: dbStatus,
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/videos', videoRoutes);

const clientDistPath = path.resolve(__dirname, '../../client/dist');
app.use(express.static(clientDistPath));

app.get('*', (req, res, next) => {
  if (req.originalUrl.startsWith('/api')) {
    return next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404));
  }
  res.sendFile(path.join(clientDistPath, 'index.html'), (err) => {
    if (err) {
      next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404));
    }
  });
});

app.use(errorHandler);

export default app;
