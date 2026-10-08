import prisma from '../config/db';
import { Logger } from '../utils/logger.utils';

export interface TransactionOptions {
  maxRetries?: number;
  timeoutMs?: number;
  isolationLevel?: 'ReadCommitted' | 'RepeatableRead' | 'Serializable';
}

/**
 * Execute multi-step database operation within a resilient Prisma Transaction
 * Automatically retries transient connection drops and deadlock collisions (P2024, 40P01).
 */
export async function executeTransaction<T>(
  action: (tx: typeof prisma) => Promise<T>,
  options: TransactionOptions = {}
): Promise<T> {
  const maxRetries = options.maxRetries || 3;
  let attempts = 0;

  while (attempts < maxRetries) {
    attempts++;
    try {
      return await prisma.$transaction(
        async (tx: any) => {
          return await action(tx);
        },
        {
          timeout: options.timeoutMs || 15000,
        }
      );
    } catch (err: any) {
      const isDeadlockOrTimeout =
        err.code === 'P2024' ||
        err.code === 'P2034' ||
        (err.message && err.message.toLowerCase().includes('deadlock')) ||
        (err.message && err.message.toLowerCase().includes('lock timeout'));

      if (isDeadlockOrTimeout && attempts < maxRetries) {
        const backoffMs = attempts * 250 + Math.floor(Math.random() * 100);
        Logger.warn(
          `⚠️ Transaction deadlock/timeout detected on attempt ${attempts}/${maxRetries}. Retrying in ${backoffMs}ms...`
        );
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
        continue;
      }

      Logger.error(`❌ Transaction failed permanently on attempt ${attempts}: ${err.message}`);
      throw err;
    }
  }

  throw new Error(`Transaction failed after ${maxRetries} attempts.`);
}
