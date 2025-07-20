import { validationResult } from 'express-validator';

/**
 * Wrapper per gestire gli errori async
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Middleware per validare le richieste
 */
export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

/**
 * Middleware per gestire gli errori
 */
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error response
  let error = {
    success: false,
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  };

  // Sportmonks API errors
  if (err.name === 'SportmonksAPIError') {
    error.message = 'External API Error';
    error.details = err.details;
    return res.status(err.status || 500).json(error);
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    error.message = 'Validation Error';
    error.errors = err.errors;
    return res.status(400).json(error);
  }

  // Rate limit errors
  if (err.status === 429) {
    error.message = 'Too Many Requests';
    return res.status(429).json(error);
  }

  // Network/fetch errors
  if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
    error.message = 'Service Unavailable';
    return res.status(503).json(error);
  }

  // Timeout errors
  if (err.name === 'AbortError' || err.code === 'TIMEOUT') {
    error.message = 'Request Timeout';
    return res.status(408).json(error);
  }

  // JSON parsing errors
  if (err.type === 'entity.parse.failed') {
    error.message = 'Invalid JSON';
    return res.status(400).json(error);
  }

  // Default to 500 server error
  res.status(err.status || 500).json(error);
};

/**
 * Middleware per gestire le rotte non trovate
 */
export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.status = 404;
  next(error);
};

/**
 * Middleware per gestire le rotte non trovate (alternativa)
 */
export const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint non trovato',
    details: `La risorsa ${req.originalUrl} non esiste`
  });
};

/**
 * Middleware per il logging delle richieste
 */
export const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
  });
  
  next();
};

/**
 * Middleware per validare la API key
 */
export const validateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return res.status(401).json({
      success: false,
      message: 'API key is required'
    });
  }

  // In produzione, valida contro il database
  if (apiKey !== process.env.API_KEY && process.env.NODE_ENV === 'production') {
    return res.status(401).json({
      success: false,
      message: 'Invalid API key'
    });
  }

  next();
};

/**
 * Middleware per impostare gli header di cache
 */
export const setCacheHeaders = (maxAge = 300) => {
  return (req, res, next) => {
    res.set('Cache-Control', `public, max-age=${maxAge}`);
    next();
  };
};

/**
 * Middleware per gli header di sicurezza
 */
export const securityHeaders = (req, res, next) => {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  });
  next();
};

/**
 * Middleware per il timeout delle richieste
 */
export const requestTimeout = (timeout = 30000) => {
  return (req, res, next) => {
    req.setTimeout(timeout, () => {
      const error = new Error('Request timeout');
      error.status = 408;
      next(error);
    });
    next();
  };
};