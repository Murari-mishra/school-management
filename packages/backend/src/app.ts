import express, { Application } from 'express';
import mongoose from 'mongoose';
import session from 'express-session';
// Redis is optional in development — use MemoryStore when Redis isn't available.
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';

// Config
import config from './config/env';

// Middleware
import {
  limiter,
  sanitize,
  xssProtection,
  hppProtection,
  helmetConfig,
  compress,
  corsOptions,
} from './middleware/security.middleware';
import { sessionTimeout, checkConcurrentLogin } from './middleware/auth.middleware';
import { errorHandler } from './middleware/error.middleware';

// Routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import studentRoutes from './routes/student.routes';
import teacherRoutes from './routes/teacher.routes';
import attendanceRoutes from './routes/attendance.routes';
import classRoutes from './routes/class.routes';
import disciplineRoutes from './routes/discipline.routes';
import notificationRoutes from './routes/notification.routes';

class App {
  public app: Application;

  constructor() {
    this.app = express();

    this.initializeDatabase();
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private async initializeDatabase(): Promise<void> {
    try {
      mongoose.set('strictQuery', true);
      
      const mongoUri = config.nodeEnv === 'production'
        ? config.mongodbUriProd
        : config.mongodbUri;

      await mongoose.connect(mongoUri);
      console.log(`✅ MongoDB Connected: ${mongoose.connection.host}`);
      
      mongoose.connection.on('error', (error) => {
        console.error('❌ MongoDB connection error:', error);
      });

      mongoose.connection.on('disconnected', () => {
        console.warn('⚠️ MongoDB disconnected');
      });

    } catch (error) {
      console.error('❌ MongoDB connection failed:', error);
      process.exit(1);
    }
  }

  private initializeMiddleware(): void {
    // Security middleware
    this.app.use(helmetConfig);
    this.app.use(cors(corsOptions));
    this.app.use(compress as any);
    
    // Rate limiting
    this.app.use('/api', limiter as any);
    
    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    
    // Data sanitization
    this.app.use(sanitize as any);
    this.app.use(xssProtection as any);
    this.app.use(hppProtection as any);
    
    // Session configuration
    // Redis may not be available in local dev; use MemoryStore as fallback for now.
    const MemoryStore = session.MemoryStore;

    this.app.use(
      (session({
        store: new MemoryStore(), // temporary in-memory store
        secret: config.sessionSecret,
        name: 'schoolmis.sid',
        resave: false,
        saveUninitialized: false,
        rolling: true,
        cookie: {
          httpOnly: true,
          secure: config.nodeEnv === 'production',
          sameSite: 'lax',
          maxAge: config.sessionExpire,
          domain: config.nodeEnv === 'production' ? '.yourdomain.com' : undefined,
        },
      }) as unknown) as any
    );

    // Logger
    if (config.nodeEnv === 'development') {
      this.app.use(morgan('dev'));
    }

    // Static files
    this.app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

    // Custom middleware
    this.app.use(sessionTimeout);
    this.app.use(checkConcurrentLogin);
  }

  private initializeRoutes(): void {
    // Health check
    this.app.get('/api/health', (_req, res) => {
      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'School MIS API is running',
        environment: config.nodeEnv,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      redis: config.redisHost ? 'configured' : 'disabled',
      });
    });

    // API routes
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/users', userRoutes);
    this.app.use('/api/students', studentRoutes);
    this.app.use('/api/teachers', teacherRoutes);
    this.app.use('/api/attendance', attendanceRoutes);
    this.app.use('/api/classes', classRoutes);
    this.app.use('/api/discipline', disciplineRoutes);
    this.app.use('/api/notifications', notificationRoutes);

    // 404 handler
    this.app.all('*', (req, res) => {
      res.status(404).json({
        success: false,
        statusCode: 404,
        error: `Route ${req.originalUrl} not found`,
        timestamp: new Date().toISOString(),
      });
    });
  }

  private initializeErrorHandling(): void {
    this.app.use(errorHandler);
  }

  public async close(): Promise<void> {
    await mongoose.connection.close();
  }
}

export default App;