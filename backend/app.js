import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';

import config from '../config/environment.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

// Import routes
import leaguesRoutes from './routes/leagues.js';
import teamsRoutes from './routes/teams.js';
import matchesRoutes from './routes/matches.js';

const app = express();

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

// CORS configuration
app.use(cors({
  origin: config.cors.origins,
  credentials: config.cors.credentials,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

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
app.use(notFoundHandler);

// Error handling middleware
app.use(errorHandler);

export default app;