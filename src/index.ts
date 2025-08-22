import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import path from 'path';

import config from './config/settings';
import { errorHandler } from './middleware/errorHandler';

// Routes
import chatRoutes from './routes/chat';
import ttsRoutes from './routes/tts';
import wikiRoutes from './routes/wiki';

// Services
import ttsService from './services/tts';

class App {
  public app: express.Application;

  constructor() {
    this.app = express();
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
    this.scheduleMaintenance();
  }

  private initializeMiddleware(): void {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
          mediaSrc: ["'self'"]
        }
      }
    }));

    // CORS configuration
    this.app.use(cors({
      origin: config.corsOrigin,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    }));

    // Compression middleware
    this.app.use(compression());

    // Logging middleware
    if (config.nodeEnv !== 'test') {
      this.app.use(morgan('combined'));
    }

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Static file serving for audio files
    this.app.use('/audio', express.static(path.join(process.cwd(), 'public', 'audio')));

    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date(),
        uptime: process.uptime(),
        version: process.env.npm_package_version || '1.0.0',
        node_version: process.version
      });
    });
  }

  private initializeRoutes(): void {
    // API routes
    this.app.use('/api/chat', chatRoutes);
    this.app.use('/api/tts', ttsRoutes);
    this.app.use('/api/wiki', wikiRoutes);

    // Root endpoint
    this.app.get('/', (req, res) => {
      res.json({
        message: 'AI Chatbot Backend API',
        version: '1.0.0',
        endpoints: {
          chat: '/api/chat',
          tts: '/api/tts',
          wiki: '/api/wiki'
        },
        documentation: '/api/docs'
      });
    });

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.originalUrl} not found`,
        timestamp: new Date()
      });
    });
  }

  private initializeErrorHandling(): void {
    this.app.use(errorHandler);
  }

  private scheduleMaintenance(): void {
    // Clean up old audio files every 6 hours
    setInterval(async () => {
      try {
        await ttsService.cleanupOldFiles(24); // Remove files older than 24 hours
        console.log('Maintenance: Audio file cleanup completed');
      } catch (error) {
        console.error('Maintenance: Audio file cleanup failed:', error);
      }
    }, 6 * 60 * 60 * 1000); // 6 hours
  }

  public listen(): void {
    this.app.listen(config.port, () => {
      console.log(`🚀 Server running on port ${config.port}`);
      console.log(`📱 Environment: ${config.nodeEnv}`);
      console.log(`🔗 Health check: http://localhost:${config.port}/health`);
      console.log(`📚 API Base: http://localhost:${config.port}/api`);
    });
  }
}

// Start the server
const app = new App();
app.listen();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

export default app;