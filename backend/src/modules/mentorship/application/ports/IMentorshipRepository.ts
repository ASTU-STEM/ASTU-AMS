import { MentorshipRequest } from '../../domain/entities/MentorshipRequest';

export interface IMentorshipRepository {
  findById(id: string): Promise<MentorshipRequest | null>;
  findByPair(mentorId: string, menteeId: string): Promise<MentorshipRequest | null>;
  create(data: Omit<MentorshipRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<MentorshipRequest>;
  updateStatus(id: string, status: string): Promise<MentorshipRequest>;
  
  // Queries
  findRequestsForMentor(mentorId: string): Promise<any[]>; // Including mentee details
  findRequestsForMentee(menteeId: string): Promise<any[]>; // Including mentor details
}
