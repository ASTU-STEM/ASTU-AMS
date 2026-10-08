import { Logger } from '../utils/logger.utils';

export interface JobDescriptor<T = any> {
  id: string;
  type: string;
  payload: T;
  priority?: 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW';
  attempts?: number;
  maxAttempts?: number;
  status?: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
  error?: string;
}

export type JobHandler<T = any> = (payload: T) => Promise<any>;

class QueueEngineService {
  private queue: JobDescriptor[] = [];
  private handlers: Map<string, JobHandler> = new Map();
  private isProcessing = false;
  private dlq: JobDescriptor[] = [];

  constructor() {
    // Process queue on intervals
    setInterval(() => this.processNextBatch(), 2000);
  }

  public registerHandler(jobType: string, handler: JobHandler) {
    this.handlers.set(jobType, handler);
    Logger.info(`⚙️ QueueEngine: Registered worker handler for job type [${jobType}]`);
  }

  public async enqueue<T>(jobType: string, payload: T, priority: 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW' = 'NORMAL'): Promise<string> {
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const job: JobDescriptor<T> = {
      id: jobId,
      type: jobType,
      payload,
      priority,
      attempts: 0,
      maxAttempts: 3,
      status: 'QUEUED',
      createdAt: new Date().toISOString(),
    };

    if (priority === 'CRITICAL' || priority === 'HIGH') {
      this.queue.unshift(job);
    } else {
      this.queue.push(job);
    }

    Logger.info(`📥 QueueEngine: Enqueued job [${jobId}] type [${jobType}] priority [${priority}]`);
    return jobId;
  }

  private async processNextBatch() {
    if (this.isProcessing || this.queue.length === 0) return;
    this.isProcessing = true;

    const job = this.queue.shift();
    if (!job) {
      this.isProcessing = false;
      return;
    }

    const handler = this.handlers.get(job.type);
    if (!handler) {
      Logger.warn(`⚠️ QueueEngine: No handler registered for job type [${job.type}]. Moving to DLQ.`);
      job.status = 'FAILED';
      job.error = `No handler for ${job.type}`;
      this.dlq.push(job);
      this.isProcessing = false;
      return;
    }

    job.status = 'PROCESSING';
    job.attempts = (job.attempts || 0) + 1;

    try {
      Logger.info(`🔄 QueueEngine: Processing job [${job.id}] type [${job.type}] (Attempt ${job.attempts})`);
      await handler(job.payload);
      job.status = 'COMPLETED';
      Logger.info(`✅ QueueEngine: Completed job [${job.id}] successfully.`);
    } catch (err: any) {
      job.error = err.message;
      Logger.error(`❌ QueueEngine: Error executing job [${job.id}]: ${err.message}`);
      if ((job.attempts || 0) < (job.maxAttempts || 3)) {
        job.status = 'QUEUED';
        this.queue.push(job); // Re-queue for retry
      } else {
        job.status = 'FAILED';
        this.dlq.push(job);
        Logger.error(`🚨 QueueEngine: Job [${job.id}] exceeded max retries. Moved to Dead-Letter Queue (DLQ).`);
      }
    } finally {
      this.isProcessing = false;
    }
  }

  public getQueueStats() {
    return {
      activeQueued: this.queue.length,
      dlqCount: this.dlq.length,
      registeredTypes: Array.from(this.handlers.keys()),
    };
  }
}

export const QueueEngine = new QueueEngineService();
