import { IAlumniProfileRepository } from '../ports/IAlumniProfileRepository';
import { AlumniNotFoundError } from '../../domain/errors/AlumniErrors';

export class UpdateAlumniProfile {
  constructor(private readonly alumniRepository: IAlumniProfileRepository) {}

  async execute(userId: string, data: any) {
    const profile = await this.alumniRepository.findByUserId(userId);
    if (!profile) {
      throw new AlumniNotFoundError();
    }

    // 🔒 Protect Registrar-managed immutable SIS fields:
    // Full Name, Student ID, Date of Birth, Department, Graduation Batch/Year, Final CGPA
    const safeData = { ...data };
    delete safeData.fullName;
    delete safeData.studentId;
    delete safeData.dateOfBirth;
    delete safeData.department;
    delete safeData.departmentId;
    delete safeData.graduationYear;
    delete safeData.batch;
    delete safeData.cgpa;

    const updatedProfile = await this.alumniRepository.update(userId, safeData);
    return updatedProfile;
  }
}
