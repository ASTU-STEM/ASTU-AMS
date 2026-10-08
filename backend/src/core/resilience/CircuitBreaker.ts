import { Logger } from '../utils/logger.utils';

export enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN',
}

export interface CircuitBreakerOptions {
  failureThreshold?: number; // Number of consecutive failures before opening circuit
  resetTimeoutMs?: number;   // Time in ms to wait before switching from OPEN to HALF_OPEN
  timeoutMs?: number;        // Max execution time per request before considering it timed out
}

export class CircuitBreaker {
  private name: string;
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount = 0;
  private nextAttemptTime = 0;
  private failureThreshold: number;
  private resetTimeoutMs: number;
  private timeoutMs: number;

  constructor(name: string, options: CircuitBreakerOptions = {}) {
    this.name = name;
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeoutMs = options.resetTimeoutMs || 30000;
    this.timeoutMs = options.timeoutMs || 10000;
  }

  public getState(): CircuitState {
    if (this.state === CircuitState.OPEN && Date.now() >= this.nextAttemptTime) {
      this.state = CircuitState.HALF_OPEN;
      Logger.info(`⚡ CircuitBreaker [${this.name}]: Transitioned to HALF_OPEN. Testing external connectivity.`);
    }
    return this.state;
  }

  public async execute<T>(action: () => Promise<T>, fallback?: () => Promise<T>): Promise<T> {
    const current = this.getState();

    if (current === CircuitState.OPEN) {
      Logger.warn(`⚠️ CircuitBreaker [${this.name}]: Request blocked (Circuit is OPEN).`);
      if (fallback) return fallback();
      throw new Error(`External service [${this.name}] is currently unavailable (Circuit OPEN).`);
    }

    try {
      const result = await this.executeWithTimeout(action, this.timeoutMs);
      this.onSuccess();
      return result;
    } catch (err: any) {
      this.onFailure(err);
      if (fallback) {
        Logger.info(`🔄 CircuitBreaker [${this.name}]: Invoking fallback logic.`);
        return fallback();
      }
      throw err;
    }
  }

  private executeWithTimeout<T>(action: () => Promise<T>, timeoutMs: number): Promise<T> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Operation timed out after ${timeoutMs}ms`));
      }, timeoutMs);

      action()
        .then((res) => {
          clearTimeout(timer);
          resolve(res);
        })
        .catch((err) => {
          clearTimeout(timer);
          reject(err);
        });
    });
  }

  private onSuccess() {
    this.failureCount = 0;
    if (this.state === CircuitState.HALF_OPEN) {
      this.state = CircuitState.CLOSED;
      Logger.info(`✅ CircuitBreaker [${this.name}]: Circuit recovered and reset to CLOSED.`);
    }
  }

  private onFailure(err: any) {
    this.failureCount++;
    Logger.warn(`❌ CircuitBreaker [${this.name}]: Failure recorded (${this.failureCount}/${this.failureThreshold}) - ${err.message}`);

    if (this.failureCount >= this.failureThreshold || this.state === CircuitState.HALF_OPEN) {
      this.state = CircuitState.OPEN;
      this.nextAttemptTime = Date.now() + this.resetTimeoutMs;
      Logger.error(`🚨 CircuitBreaker [${this.name}]: Failure threshold breached! Circuit is now OPEN for ${this.resetTimeoutMs}ms.`);
    }
  }
}
