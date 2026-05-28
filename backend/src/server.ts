import app from './app';
import { env } from './config/env.ts';
import prisma, { initPrisma } from './config/db';
import { CronService } from './services/cron.service';
import { Logger } from './utils/logger.utils';

const PORT = env.PORT || 5000;

async function bootstrap() {
  try {
    Logger.info('🚀 Bootstrapping ASTU-AMS API Server...');

    // 1. Validate Database Connection (with resilient fallback)
    Logger.info('📡 Initializing database client...');
    await initPrisma();
    Logger.info('✅ Database client initialized.');

    // 2. Initialize Background Cron Services
    CronService.init();

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
