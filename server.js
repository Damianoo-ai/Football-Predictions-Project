import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import dotenv from 'dotenv';

import config from './config/environment.js';
import { errorHandler, notFound, requestLogger } from './backend/middleware/errorHandler.js';

// Import routes
import leaguesRoutes from './backend/routes/leagues.js';
import teamsRoutes from './backend/routes/teams.js';
import matchesRoutes from './backend/routes/matches.js';

dotenv.config();

const app = express();
const PORT = config.server.port;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Compression middleware
app.use(compression());

// CORS configuration - IMPORTANTE: permetti al frontend di connettersi
app.use(cors({
  origin: config.cors.origins,
  credentials: config.cors.credentials,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

console.log('🔧 CORS Origins configurate:', config.cors.origins);
// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: {
    success: false,
    error: 'Troppi richieste da questo IP',
    details: 'Riprova tra qualche minuto'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Request logging
if (config.server.env !== 'test') {
  app.use(morgan('combined'));
  app.use(requestLogger);
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: config.server.env,
    version: process.env.npm_package_version || '1.0.0'
  });
});

// API routes
app.use('/api/leagues', leaguesRoutes);
app.use('/api/teams', teamsRoutes);
app.use('/api/matches', matchesRoutes);



// Legacy proxy route per compatibilità
app.get(/^\/api\/sportmonks\/(.*)$/, async (req, res, next) => {
  try {
    const apiPath = req.params[0];
    
    // Redirect alle nuove routes
    if (apiPath === 'leagues') {
      return res.redirect(308, '/api/leagues');
    } else if (apiPath === 'teams') {
      return res.redirect(308, '/api/teams');
    } else if (apiPath === 'fixtures') {
      return res.redirect(308, '/api/matches');
    }
    
    // Se non corrisponde a nessuna route, restituisci 404
    return res.status(404).json({
      success: false,
      error: 'Endpoint non supportato',
      details: `L'endpoint legacy ${apiPath} non è più supportato`
    });
  } catch (error) {
    next(error);
  }
});

// 404 handler
app.use(notFound);

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend API Server running on http://localhost:${PORT}`);
  console.log(`📊 Football Analytics Pro - Backend Ready!`);
  console.log(`🌍 Environment: ${config.server.env}`);
  console.log(`🔑 API Key configured: ${config.api.sportmonks.apiKey ? 'Yes' : 'No'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`❌ Unhandled Promise Rejection: ${err.message}`);
  console.error(err.stack);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error(`❌ Uncaught Exception: ${err.message}`);
  console.error(err.stack);
  process.exit(1);
});

export default app;