export class AuditLog {
  constructor(
    public readonly id: string,
    public readonly userId: string | null,
    public readonly action: string,
    public readonly details: string,
    public readonly ipAddress: string | null,
    public readonly createdAt: Date
  ) {}

  static create(data: { id: string, userId: string | null, action: string, details: string, ipAddress: string | null, createdAt: Date }): AuditLog {
    return new AuditLog(
      data.id,
      data.userId,
      data.action,
      data.details,
      data.ipAddress,
      data.createdAt
    );
  }
}
