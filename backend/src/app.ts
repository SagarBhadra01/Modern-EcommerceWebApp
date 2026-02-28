import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { clerkAuth } from './middleware/auth';
import { errorHandler } from './middleware/errorHandler';
import apiRoutes from './routes';

const app = express();

// ── Security ──────────────────────────────────
app.use(helmet());

// ── CORS ──────────────────────────────────────
app.use(
  cors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ── Logging ───────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ── JSON body parser ──────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Clerk auth (attaches auth to all requests) ─
app.use(clerkAuth);

// ── Health check ──────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── API routes ────────────────────────────────
app.use('/api', apiRoutes);

// ── 404 handler ───────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Not Found', message: 'Route not found.' });
});

// ── Global error handler ──────────────────────
app.use(errorHandler);

export default app;
