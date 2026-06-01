export class AuditLog {
  constructor(
    public readonly id: string,
    public readonly userId: string | null,
    public readonly action: string,
    public readonly details: string,
    public readonly ipAddress: string | null,
    public readonly createdAt: Date
  ) {}
}
