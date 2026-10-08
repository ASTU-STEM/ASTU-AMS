import { Logger } from '../utils/logger.utils';
import prisma from '../config/db';

export interface AlertRule {
  id: string;
  name: string;
  metric: string;
  threshold: number;
  condition: 'GREATER_THAN' | 'LESS_THAN';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'INFO';
  enabled: boolean;
}

export interface ActiveAlert {
  id: string;
  ruleId: string;
  ruleName: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'INFO';
  currentValue: number;
  threshold: number;
  message: string;
  triggeredAt: string;
}

class AlertEngineService {
  private activeAlerts: ActiveAlert[] = [];

  private defaultRules: AlertRule[] = [
    {
      id: 'rule_high_error_rate',
      name: 'High API Error Rate',
      metric: 'error_rate_percentage',
      threshold: 5.0, // > 5% error rate
      condition: 'GREATER_THAN',
      severity: 'CRITICAL',
      enabled: true,
    },
    {
      id: 'rule_p95_latency_spike',
      name: 'P95 API Latency Degradation',
      metric: 'p95_latency_ms',
      threshold: 500.0, // > 500ms P95 latency
      condition: 'GREATER_THAN',
      severity: 'HIGH',
      enabled: true,
    },
    {
      id: 'rule_waf_probe_spike',
      name: 'WAF Security Probe Spike',
      metric: 'waf_blocked_probes_per_min',
      threshold: 50.0, // > 50 probes/min
      condition: 'GREATER_THAN',
      severity: 'CRITICAL',
      enabled: true,
    },
    {
      id: 'rule_queue_backlog',
      name: 'QueueEngine Worker Backlog',
      metric: 'queue_backlog_size',
      threshold: 200.0, // > 200 queued jobs
      condition: 'GREATER_THAN',
      severity: 'MEDIUM',
      enabled: true,
    },
  ];

  constructor() {
    // Run automated alert evaluations every 30 seconds
    setInterval(() => this.evaluateAlertRules(), 30000);
  }

  public async evaluateAlertRules() {
    try {
      const oneHourAgo = new Date(Date.now() - 3600000);

      // Fetch recent errors count from AuditLog
      const recentErrors = await prisma.auditLog.count({
        where: {
          action: { contains: 'ERROR' },
          createdAt: { gte: oneHourAgo },
        },
      });

      const totalLogs = await prisma.auditLog.count({
        where: { createdAt: { gte: oneHourAgo } },
      });

      const errorRate = totalLogs > 0 ? (recentErrors / totalLogs) * 100 : 0;

      // Evaluate error rate rule
      if (errorRate > 5.0) {
        this.triggerAlert(
          'rule_high_error_rate',
          'High API Error Rate',
          'CRITICAL',
          errorRate,
          5.0,
          `API error rate is currently ${errorRate.toFixed(1)}% (Threshold: > 5.0%)`
        );
      } else {
        this.resolveAlert('rule_high_error_rate');
      }
    } catch (err: any) {
      /* ignore alert evaluation errors */
    }
  }

  private triggerAlert(
    ruleId: string,
    ruleName: string,
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'INFO',
    currentValue: number,
    threshold: number,
    message: string
  ) {
    const existing = this.activeAlerts.find((a) => a.ruleId === ruleId);
    if (existing) return; // Alert already active

    const alert: ActiveAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      ruleId,
      ruleName,
      severity,
      currentValue,
      threshold,
      message,
      triggeredAt: new Date().toISOString(),
    };

    this.activeAlerts.push(alert);
    Logger.error(`🚨 ALERT TRIGGERED [${severity}] (${ruleName}): ${message}`);
  }

  private resolveAlert(ruleId: string) {
    const idx = this.activeAlerts.findIndex((a) => a.ruleId === ruleId);
    if (idx !== -1) {
      const [resolved] = this.activeAlerts.splice(idx, 1);
      Logger.info(`✅ ALERT RESOLVED (${resolved.ruleName}): Condition returned to normal.`);
    }
  }

  public getActiveAlerts(): ActiveAlert[] {
    return this.activeAlerts;
  }

  public getRules(): AlertRule[] {
    return this.defaultRules;
  }
}

export const AlertEngine = new AlertEngineService();
