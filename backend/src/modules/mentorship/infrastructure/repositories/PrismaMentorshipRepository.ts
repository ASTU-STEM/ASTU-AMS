import { IMentorshipRepository } from '../../application/ports/IMentorshipRepository';
import { MentorshipRequest } from '../../domain/entities/MentorshipRequest';
import prisma from '../../../../core/config/db';

export class PrismaMentorshipRepository implements IMentorshipRepository {
  async findById(id: string): Promise<MentorshipRequest | null> {
    const request = await prisma.mentorshipRequest.findUnique({ where: { id } });
    return request as any as MentorshipRequest | null;
  }

  async findByPair(mentorId: string, menteeId: string): Promise<MentorshipRequest | null> {
    const request = await prisma.mentorshipRequest.findUnique({
      where: { mentorId_menteeId: { mentorId, menteeId } }
    });
    return request as any as MentorshipRequest | null;
  }

  async create(data: Omit<MentorshipRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<MentorshipRequest> {
    const request = await prisma.mentorshipRequest.create({ data: data as any });
    return request as any as MentorshipRequest;
  }

  async updateStatus(id: string, status: string): Promise<MentorshipRequest> {
    const request = await prisma.mentorshipRequest.update({
      where: { id },
      data: { status }
    });
    return request as any as MentorshipRequest;
  }

  async findRequestsForMentor(mentorId: string): Promise<any[]> {
    return await prisma.mentorshipRequest.findMany({
      where: { mentorId },
      include: {
        mentee: {
          select: {
            fullName: true,
            profilePicture: true,
            department: { select: { name: true } },
            graduationYear: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findRequestsForMentee(menteeId: string): Promise<any[]> {
    return await prisma.mentorshipRequest.findMany({
      where: { menteeId },
      include: {
        mentor: {
          select: {
            fullName: true,
            profilePicture: true,
            department: { select: { name: true } },
            experiences: { select: { companyName: true, position: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }
}
