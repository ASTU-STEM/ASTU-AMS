export class MentorshipRequest {
  constructor(
    public readonly id: string,
    public readonly mentorId: string,
    public readonly menteeId: string,
    public readonly status: string, // "PENDING" | "ACCEPTED" | "REJECTED" | "COMPLETED"
    public readonly message: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}
}
