import app from './app';
import { env } from './core/config/env';
import { initPrisma } from './core/config/db';
import { Logger } from './core/utils/logger.utils';
import { startTracerStudyCronJobs } from './services/tracer.service';
import { initCronJobs } from './core/jobs/cron';
import { createServer } from 'http';
import { SocketServer } from './infrastructure/websocket/SocketServer';

const PORT = env.PORT || 5002;

async function bootstrap() {
  try {
    Logger.info(' Bootstrapping ASTU-AMS API Server...');

    // 1. Validate Database Connection (with resilient fallback dev DB models active and live job board repository)
    Logger.info('📡 Initializing database client...');
    await initPrisma();
    Logger.info('✅ Database client initialized.');

    // 2. Initialize Background Cron Services
    startTracerStudyCronJobs();
    initCronJobs();
    Logger.info('✅ Tracer study cron jobs started.');

    // 3. Create HTTP Server and WebSocket Server
    const httpServer = createServer(app);
    SocketServer.initialize(httpServer);

    // 4. Start Server listener
    httpServer.listen(PORT, () => {
      Logger.info(`⚡ ASTU-AMS Server running. Listening on: http://localhost:${PORT}`);
    });
  } catch (err: any) {
    Logger.error('❌ Failed to bootstrap application server', err);
    process.exit(1);
  }
}

bootstrap();
