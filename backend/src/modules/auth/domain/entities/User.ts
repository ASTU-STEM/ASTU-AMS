export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly role: string,
    public readonly isActive: boolean,
    public readonly password?: string, // optional for security if we don't fetch it
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date
  ) {}

  static create(data: { id: string, email: string, role: string, isActive: boolean, password?: string, createdAt?: Date, updatedAt?: Date }): User {
    return new User(
      data.id,
      data.email,
      data.role,
      data.isActive,
      data.password,
      data.createdAt,
      data.updatedAt
    );
  }
}
