import app from './app';
import { env } from './core/config/env';
import prisma, { initPrisma } from './core/config/db';
import { Logger } from './core/utils/logger.utils';
import { startTracerStudyCronJobs } from './services/tracer.service';
import { initCronJobs } from './core/jobs/cron';
import { registerAllWorkerHandlers } from './core/jobs/workerHandlers';
import { createServer } from 'http';
import { SocketServer } from './infrastructure/websocket/SocketServer';

const PORT = env.PORT || 5000;

async function bootstrap() {
  try {
    Logger.info('🚀 Bootstrapping ASTU-AMS Public AI Assistant API Server...');

    // 1. Validate Database Connection
    Logger.info('📡 Initializing database client...');
    await initPrisma();
    Logger.info('✅ Database client initialized.');

    // 2. Initialize Background Cron & Queue Worker Services
    startTracerStudyCronJobs();
    initCronJobs();
    registerAllWorkerHandlers();
    Logger.info('✅ Tracer study cron jobs and QueueEngine worker handlers started.');

    // 3. Create HTTP Server and WebSocket Server
    const httpServer = createServer(app);
    SocketServer.initialize(httpServer);

    // 4. Start Server listener
    httpServer.listen(PORT, () => {
      Logger.info(`⚡ ASTU-AMS Enterprise Server running. Listening on: http://localhost:${PORT}`);
    });

    // 5. Graceful Shutdown Signal Handling (Section 6)
    const gracefulShutdown = async (signal: string) => {
      Logger.info(`🛑 Received ${signal}. Starting graceful shutdown protocol...`);
      
      // Stop accepting new HTTP connections
      httpServer.close(async () => {
        Logger.info('✅ Stopped accepting new HTTP requests.');
        
        try {
          // Close Prisma database connections
          await prisma.$disconnect();
          Logger.info('✅ Closed PostgreSQL database connection pool.');
        } catch (e: any) {
          Logger.warn(`⚠️ Error closing database connections: ${e.message}`);
        }

        Logger.info('👋 ASTU-AMS Server shutdown cleanly. Goodbye!');
        process.exit(0);
      });

      // Force exit after 15 seconds if connections hang
      setTimeout(() => {
        Logger.error('🚨 Graceful shutdown timed out (15s). Forcing termination.');
        process.exit(1);
      }, 15000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (err: any) {
    Logger.error('❌ Failed to bootstrap application server', err);
    process.exit(1);
  }
}

bootstrap();
