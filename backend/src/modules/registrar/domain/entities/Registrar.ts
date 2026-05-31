export class GraduateRecord {
  constructor(
    public readonly id: string,
    public readonly studentId: string,
    public readonly fullName: string,
    public readonly department: string,
    public readonly departmentCode: string,
    public readonly cgpa: number,
    public readonly graduationYear: number,
    public readonly email: string | null,
    public readonly phone: string | null,
    public readonly source: string,
    public readonly graduationDate: Date | null
  ) {}
}

export class SyncLog {
  constructor(
    public readonly id: string,
    public readonly syncedAt: Date,
    public readonly recordsCount: number,
    public readonly status: string,
    public readonly errors: string | null
  ) {}
}
