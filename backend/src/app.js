import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import documentRoutes from './routes/document.routes.js';
import chatRoutes from './routes/chat.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import ragRoutes from './routes/rag.routes.js';

import { healthCheck } from './controllers/rag.controller.js';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security & Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Serve uploaded files statically
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

// Root & Health Checks
app.get('/health', healthCheck);
app.get('/api/health', healthCheck);
app.get('/', (req, res) => {
  res.json({
    message: "BIS Sahayak V2 API Gateway is online.",
    docs: "/health",
    version: "2.0.0"
  });
});

// Primary Domain API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/document', documentRoutes); // Alias for /api/document/analyze
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api', ragRoutes); // Product mapping, compliance, verifier, pdf export

// 404 & Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
