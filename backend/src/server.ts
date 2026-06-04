import app from './app';
import { env } from './core/config/env';
import { initPrisma } from './core/config/db';
import { Logger } from './core/utils/logger.utils';
import { startTracerStudyCronJobs } from './services/tracer.service';

const PORT = env.PORT || 5000;

async function bootstrap() {
  try {
    Logger.info('🚀 Bootstrapping ASTU-AMS API Server...');

    // 1. Validate Database Connection (with resilient fallback)
    Logger.info('📡 Initializing database client...');
    await initPrisma();
    Logger.info('✅ Database client initialized.');

    // 2. Initialize Background Cron Services
    startTracerStudyCronJobs();
    Logger.info('✅ Tracer study cron jobs started.');

    // 3. Start Server listener
    app.listen(PORT, () => {
      Logger.info(`⚡ ASTU-AMS Server running. Listening on: http://localhost:${PORT}`);
    });
  } catch (err: any) {
    Logger.error('❌ Failed to bootstrap application server', err);
    process.exit(1);
  }
}

bootstrap();
