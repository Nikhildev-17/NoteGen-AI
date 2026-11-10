import app from './app.js';
import { config } from './config/env.js';
import { connectDB } from './config/db.js';

const startServer = async () => {
  await connectDB();

  const server = app.listen(config.port, () => {
    console.log(`Server running on port ${config.port} in ${process.env.NODE_ENV || 'development'} mode`);
    console.log(`Health endpoint: http://localhost:${config.port}/api/health`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${config.port} is already in use by another process.`);
    } else {
      console.error('Server startup error:', err);
    }
    process.exit(1);
  });

  process.on('unhandledRejection', (err) => {
    console.error('Unhandled rejection:', err);
    server.close(() => {
      process.exit(1);
    });
  });

  process.on('uncaughtException', (err) => {
    console.error('Uncaught exception:', err);
    server.close(() => {
      process.exit(1);
    });
  });

  const shutdown = (signal) => {
    console.log(`Received ${signal}. Closing server gracefully...`);
    server.close(() => {
      console.log('HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

startServer();
