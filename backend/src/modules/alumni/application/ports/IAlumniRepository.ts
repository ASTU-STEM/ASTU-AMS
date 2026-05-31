import { Alumni } from '../../domain/entities/Alumni';

export interface IAlumniRepository {
  findById(id: string): Promise<Alumni | null>;
  save(alumni: Alumni): Promise<void>;
}
