export interface IAuditLogger {
  log(userId: string, action: string, details: string, ipAddress: string): Promise<void>;
}
