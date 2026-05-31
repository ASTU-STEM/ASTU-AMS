import { AlumniProfile } from '../../domain/entities/Alumni';

export interface IAlumniProfileRepository {
  findByUserId(userId: string): Promise<AlumniProfile | null>;
  update(userId: string, data: Partial<AlumniProfile>): Promise<AlumniProfile>;
}
