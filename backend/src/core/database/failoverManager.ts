import { Logger } from '../utils/logger.utils';

export enum DatabaseHealthState {
  PRIMARY_HEALTHY = 'PRIMARY_HEALTHY',
  READ_REPLICA_ACTIVE = 'READ_REPLICA_ACTIVE',
  FALLBACK_LOCAL_JSON = 'FALLBACK_LOCAL_JSON',
}

class FailoverManagerEngine {
  private currentState: DatabaseHealthState = DatabaseHealthState.PRIMARY_HEALTHY;
  private lastFailoverTime: number = 0;
  private consecutiveFailures = 0;
  private failureThreshold = 3;

  public getState(): DatabaseHealthState {
    return this.currentState;
  }

  public recordQuerySuccess() {
    this.consecutiveFailures = 0;
    if (this.currentState !== DatabaseHealthState.PRIMARY_HEALTHY) {
      this.currentState = DatabaseHealthState.PRIMARY_HEALTHY;
      Logger.info('✅ FailoverManager: Primary PostgreSQL connection restored to HEALTHY state.');
    }
  }

  public recordQueryFailure(error: any) {
    this.consecutiveFailures++;
    Logger.warn(
      `⚠️ FailoverManager: Database query failure (${this.consecutiveFailures}/${this.failureThreshold}): ${error.message}`
    );

    if (this.consecutiveFailures >= this.failureThreshold) {
      this.triggerFailover(error.message);
    }
  }

  public triggerFailover(reason: string) {
    this.lastFailoverTime = Date.now();
    this.currentState = DatabaseHealthState.READ_REPLICA_ACTIVE;

    Logger.error(
      `🚨 FAILOVER TRIGGERED: Primary PostgreSQL instance unreachable. Reason: [${reason}]. Routing traffic to Read-Replica / Local Fallback.`
    );
  }

  public getStatus() {
    return {
      state: this.currentState,
      lastFailoverTime: this.lastFailoverTime ? new Date(this.lastFailoverTime).toISOString() : null,
      consecutiveFailures: this.consecutiveFailures,
    };
  }
}

export const FailoverManager = new FailoverManagerEngine();
