import App from './app';
import config from './config/env';

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  console.error('❌ Uncaught Exception:', error);
  console.error(error.stack);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  console.error('❌ Unhandled Rejection at:', promise);
  console.error('Reason:', reason);
  process.exit(1);
});

// Handle SIGTERM
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

// Handle SIGINT (Ctrl+C)
process.on('SIGINT', () => {
  console.log('👋 SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

const startServer = async () => {
  try {
    const app = new App();
    const server = app.app;

    server.listen(config.port, config.host, () => {
      console.log('\n🚀 ========================================');
      console.log(`   School MIS Server v1.0.0`);
      console.log(`   Environment: ${config.nodeEnv}`);
      console.log(`   Host: ${config.host}`);
      console.log(`   Port: ${config.port}`);
      console.log(`   API URL: http://${config.host}:${config.port}/api`);
      console.log(`   Health Check: http://${config.host}:${config.port}/api/health`);
      console.log('=======================================\n');
    });

    // Graceful shutdown
    const gracefulShutdown = async () => {
      console.log('\n📦 Received shutdown signal. Cleaning up...');
      
      try {
        await app.close();
        console.log('✅ Database connections closed');
        console.log('👋 Server shutdown complete');
        process.exit(0);
      } catch (error) {
        console.error('❌ Error during shutdown:', error);
        process.exit(1);
      }
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();