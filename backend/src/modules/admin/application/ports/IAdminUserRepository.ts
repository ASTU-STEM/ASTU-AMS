export interface IAdminUserRepository {
  findAllUsers(): Promise<any[]>;
  updateUserStatus(userId: string, status: string): Promise<any>;
}
