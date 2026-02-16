import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import helmet from 'helmet';
import compression from 'compression';
import config from '../config/env';

// Rate limiter middleware
export const limiter = rateLimit({
  windowMs: config.rateLimitWindow * 60 * 1000, 
  max: config.rateLimitMax,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (_req: any) => config.nodeEnv === 'test', // for testig
});

// Auth-specific rate limiter (stricter)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many login attempts, please try again after 15 minutes.',
  skipSuccessfulRequests: true,
  skipFailedRequests: false,
});

// MongoDB data sanitizer
export const sanitize = mongoSanitize({
  onSanitize: ({ key }: any) => {
    console.warn(`[SECURITY] Sanitized key: ${key}`);
  },
});

// XSS protection
export const xssProtection = xss();

// HTTP Parameter Pollution (HPP) protection
export const hppProtection = hpp({
  whitelist: [
    'sort',
    'fields',
    'page',
    'limit',
    'search',
    'role',
    'status',
    'class',
    'section',
    'month',
    'year',
  ],
});

// Helmet security headers configuration
export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  hsts: {
    maxAge: 31536000, // 1 year in seconds
    includeSubDomains: true,
    preload: true,
  },
});

// Compression middleware
export const compress = compression({
  level: 6,
  threshold: 100 * 1000, 
});

// CORS options configuration
export const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const allowedOrigins = Array.isArray(config.frontendUrl)
      ? config.frontendUrl
      : [config.frontendUrl, 'http://localhost:3000', 'http://localhost:3001'];

    if (config.nodeEnv === 'development' || !origin || allowedOrigins.indexOf(origin as string) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count', 'X-Total-Pages'],
  maxAge: 86400, // 24 hours
};

// Security middleware chain 
export const securityMiddleware = {
  limiter,
  authLimiter,
  sanitize,
  xssProtection,
  hppProtection,
  helmetConfig,
  compress,
  corsOptions,
};

export default securityMiddleware;
