import dotenv from 'dotenv';

dotenv.config();

const config = {
  server: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development'
  },
  api: {
    sportmonks: {
      apiKey: process.env.SPORTMONKS_API_KEY,
      baseUrl: process.env.SPORTMONKS_BASE_URL || 'http://localhost:3001/api'
    }
  },
  cors: {
    origins: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5500'],
    credentials: true
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minuti
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info'
  }
};

// Validazione configurazione critica
if (!config.api.sportmonks.apiKey) {
  console.error('ERRORE: SPORTMONKS_API_KEY non configurata');
  process.exit(1);
}

export default config;