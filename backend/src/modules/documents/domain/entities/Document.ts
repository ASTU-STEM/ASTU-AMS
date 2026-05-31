export class DocumentRequest {
  constructor(
    public readonly id: string,
    public readonly alumniId: string,
    public readonly documentType: string,
    public readonly status: string,
    public readonly additionalInstructions: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}
}
