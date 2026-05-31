export class Alumni {
  constructor(
    public readonly id: string,
    public name: string,
    public studentId: string,
    public department: string,
    public graduationYear: number
  ) {}

  public updateName(newName: string): void {
    if (newName.length < 2) {
      throw new Error('Name must be at least 2 characters long');
    }
    this.name = newName;
  }
}
