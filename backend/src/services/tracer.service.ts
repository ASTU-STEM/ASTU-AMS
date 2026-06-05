import cron from 'node-cron';
import { Logger } from '../core/utils/logger.utils';
import { TracerStudyService } from '../modules/surveys/services/TracerStudyService';

const tracerService = new TracerStudyService();

export const startTracerStudyCronJobs = () => {
  Logger.info('Initializing tracer study cron jobs...');

  cron.schedule('0 0 * * *', async () => {
    Logger.info('Running tracer study eligibility assignment job');
    try {
      await tracerService.checkEligibleAlumni();
      Logger.info('Tracer study eligibility assignment job completed');
    } catch (error: any) {
      Logger.error('Tracer study eligibility assignment job failed', error);
    }
  }, { timezone: 'UTC' });

  cron.schedule('0 2 * * *', async () => {
    Logger.info('Running tracer study reminder job');
    try {
      await tracerService.sendReminderNotifications();
      Logger.info('Tracer study reminder job completed');
    } catch (error: any) {
      Logger.error('Tracer study reminder job failed', error);
    }
  }, { timezone: 'UTC' });
};
