import cron from 'node-cron';
import prisma from '../config/db';
import { EmailService } from './email.service';
import { RegistrarService } from '../../presentation/modules/registrar/registrar.service';
import { TracerService } from './tracer.service';

export class CronService {
  static init() {
    console.log('⏰ Initializing Background Cron Jobs...');

    // 1. Daily Registrar Database Sync at 1:00 AM
    cron.schedule('0 1 * * *', async () => {
      console.log('⏳ Running scheduled Registrar API Database Sync...');
      try {
        const result = await RegistrarService.syncGraduates();
        console.log(`✅ Registrar Sync completed. Synced ${result.count} records.`);
      } catch (err: any) {
        console.error('❌ Registrar Sync scheduled task failed:', err.message);
      }
    });

    // 2. Daily Tracer Study Notification Trigger at 9:00 AM
    cron.schedule('0 9 * * *', async () => {
      console.log('⏳ Checking due tracer study surveys and sending reminders...');
      try {
        await TracerService.processDueSurveys();
      } catch (err: any) {
        console.error('❌ Tracer Study auto-trigger failed:', err.message);
      }
    });
  }

  // Deprecated: logic moved to TracerService
}
