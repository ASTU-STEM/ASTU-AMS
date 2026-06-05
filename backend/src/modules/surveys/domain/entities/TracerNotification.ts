export class TracerNotification {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly assignmentId: string | null,
    public readonly type: string,
    public readonly title: string,
    public readonly content: string,
    public readonly isRead: boolean,
    public readonly createdAt: Date
  ) {}
}
