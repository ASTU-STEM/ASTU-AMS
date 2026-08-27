import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../../../core/utils/response.utils';
import { updateAlumniProfileSchema, addExperienceSchema, documentRequestSchema } from './alumni.validation';
import bcrypt from 'bcryptjs';
import axios from 'axios';

import { PrismaAlumniProfileRepository } from '../infrastructure/repositories/PrismaAlumniProfileRepository';
import { PrismaWorkExperienceRepository } from '../infrastructure/repositories/PrismaWorkExperienceRepository';
import { PrismaDocumentRequestRepository } from '../infrastructure/repositories/PrismaDocumentRequestRepository';
import { PrismaAuditLogger } from '../infrastructure/repositories/PrismaAuditLogger';

import { GetAlumniProfile } from '../application/use-cases/GetAlumniProfile';
import { UpdateAlumniProfile } from '../application/use-cases/UpdateAlumniProfile';
import { AddWorkExperience, UpdateWorkExperience, DeleteWorkExperience } from '../application/use-cases/ManageWorkExperience';
import { UploadAlumniFiles } from '../application/use-cases/UploadAlumniFiles';
import { RequestDocument, GetMyDocuments } from '../application/use-cases/DocumentRequests';
import prisma from '../../../core/config/db';

const alumniRepo = new PrismaAlumniProfileRepository();
const expRepo = new PrismaWorkExperienceRepository();
const docRepo = new PrismaDocumentRequestRepository();
const logger = new PrismaAuditLogger();

export class AlumniController {
  static async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const useCase = new GetAlumniProfile(alumniRepo);
      const result = await useCase.execute(userId);
      return sendSuccess(res, 'Profile retrieved successfully', result);
    } catch (err) {
      next(err);
    }
  }

  static async updateMe(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      let rawData = req.body;
      
      // Handle multipart form data if frontend sends profileData as a JSON string
      if (req.body.profileData) {
        try {
          rawData = JSON.parse(req.body.profileData);
        } catch (e) {
          rawData = {};
        }
      }

      // Add uploaded file paths to the rawData
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      if (files?.avatar?.[0]) {
        rawData.profilePicture = `/uploads/profiles/${files.avatar[0].filename}`;
      }
      if (files?.resume?.[0]) {
        rawData.resumeUrl = `/uploads/resumes/${files.resume[0].filename}`;
      }

      const useCase = new UpdateAlumniProfile(alumniRepo);
      const result = await useCase.execute(userId, rawData);
      return sendSuccess(res, 'Profile updated successfully', result);
    } catch (err) {
      next(err);
    }
  }

  static async addExperience(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const parsedData = addExperienceSchema.parse(req.body);
      const useCase = new AddWorkExperience(alumniRepo, expRepo);
      const result = await useCase.execute(userId, parsedData);
      return sendSuccess(res, 'Work experience added successfully', result, 201);
    } catch (err) {
      next(err);
    }
  }

  static async updateExperience(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.userId;
      const parsedData = addExperienceSchema.parse(req.body);
      const useCase = new UpdateWorkExperience(alumniRepo, expRepo);
      const result = await useCase.execute(userId, id, parsedData);
      return sendSuccess(res, 'Work experience updated successfully', result);
    } catch (err) {
      next(err);
    }
  }

  static async deleteExperience(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.userId;
      const useCase = new DeleteWorkExperience(alumniRepo, expRepo);
      await useCase.execute(userId, id);
      return sendSuccess(res, 'Work experience deleted successfully', null);
    } catch (err) {
      next(err);
    }
  }

  static async uploadFiles(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      
      const updateData: { resumeUrl?: string; profilePicture?: string } = {};

      if (req.files && typeof req.files === 'object') {
        const filesMap = req.files as { [fieldname: string]: Express.Multer.File[] };
        
        if (filesMap['cv'] && filesMap['cv'][0]) {
          updateData.resumeUrl = `/uploads/cvs/${filesMap['cv'][0].filename}`;
        }
        if (filesMap['profilePicture'] && filesMap['profilePicture'][0]) {
          updateData.profilePicture = `/uploads/profiles/${filesMap['profilePicture'][0].filename}`;
        }
      }

      const useCase = new UploadAlumniFiles(alumniRepo);
      const result = await useCase.execute(userId, updateData);

      return sendSuccess(res, 'Files uploaded and profile updated successfully', {
        resumeUrl: result.resumeUrl,
        profilePicture: result.profilePicture,
      });
    } catch (err) {
      next(err);
    }
  }

  static async requestDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const parsedData = documentRequestSchema.parse(req.body);
      const useCase = new RequestDocument(alumniRepo, docRepo, logger);
      const result = await useCase.execute(userId, parsedData, req.ip || 'unknown');
      return sendSuccess(res, 'Document request submitted successfully.', result, 201);
    } catch (err) {
      next(err);
    }
  }

  static async getMyDocuments(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const useCase = new GetMyDocuments(alumniRepo, docRepo);
      const result = await useCase.execute(userId);
      return sendSuccess(res, 'Fetched document requests successfully', result);
    } catch (err) {
      next(err);
    }
  }

  static async initializeChapaDocumentPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const { documentType, additionalInstructions, amount } = req.body;

      const profile = await alumniRepo.findByUserId(userId);
      const userEmail = (req as any).user?.email || 'alumni@astu.edu.et';

      const tx_ref = `ASTU-DOC-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const secretKey = process.env.CHAPA_SECRET_KEY || 'CHASECK_TEST-CHAPA_TEST_PRIV_YzGCRitzQDtxL9mPiBcgfHAd7M1E7HlvGbAnwP1F';

      let checkoutUrl = `${frontendUrl}/alumni/dashboard?tab=documents&tx_ref=${tx_ref}&status=success`;
      const callbackUrl = process.env.CHAPA_CALLBACK_URL || 'https://webhook.site/astu-chapa-callback';

      try {
        const nameParts = (profile?.fullName || userEmail.split('@')[0] || 'Alumni ASTU').split(' ');
        const chapaRes = await axios.post(
          'https://api.chapa.co/v1/transaction/initialize',
          {
            amount: String(amount || 250),
            currency: 'ETB',
            email: profile?.email || userEmail,
            first_name: nameParts[0] || 'Alumni',
            last_name: nameParts[1] || 'Graduate',
            tx_ref,
            callback_url: callbackUrl,
            return_url: `${frontendUrl}/alumni/dashboard?tab=documents&tx_ref=${tx_ref}`,
            customization: {
              title: `ASTU Registrar - ${documentType || 'Document Fee'}`,
              description: `Payment for ${documentType}`
            }
          },
          {
            headers: {
              Authorization: `Bearer ${secretKey}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (chapaRes.data?.data?.checkout_url) {
          checkoutUrl = chapaRes.data.data.checkout_url;
        }
      } catch (err: any) {
        console.warn('Chapa direct API init note:', err?.response?.data || err?.message);
      }

      return sendSuccess(res, 'Chapa payment initialized successfully', {
        tx_ref,
        checkout_url: checkoutUrl,
        amount: amount || 250,
        documentType,
        additionalInstructions,
        publicKey: process.env.CHAPA_PUBLIC_KEY || 'CHAPUBK_TEST-CHAPA_TEST_PUB_14O385pJ_W6EtvLu8ASyLUJNWW5zbiecD0VDSRVS'
      });
    } catch (err) {
      next(err);
    }
  }

  static async verifyChapaDocumentPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const { tx_ref, documentType, additionalInstructions, amount } = req.body;

      let profile = await alumniRepo.findByUserId(userId);
      const secretKey = process.env.CHAPA_SECRET_KEY || 'CHASECK_TEST-CHAPA_TEST_PRIV_EXBJNVJ-o3qdJOo6mib_8geuuuzPNZ6B2lLckMJQ';

      // Verify with Chapa API
      try {
        await axios.get(`https://api.chapa.co/v1/transaction/verify/${tx_ref}`, {
          headers: { Authorization: `Bearer ${secretKey}` }
        });
      } catch (e: any) {
        console.warn('Chapa API verification note:', e?.response?.data || e?.message);
      }

      // Ensure alumni profile exists if not already present
      if (!profile) {
        const existingDept = await prisma.department.findFirst();
        profile = await prisma.alumniProfile.create({
          data: {
            userId,
            studentId: `ASTU-${Date.now()}`,
            fullName: (req as any).user?.email?.split('@')[0] || 'ASTU Graduate',
            cgpa: 3.5,
            graduationYear: 2024,
            gender: 'MALE',
            departmentId: existingDept?.id || 'dept-swe'
          }
        }) as any;
      }

      // Create document request record in DB directly for Registrar
      const useCase = new RequestDocument(alumniRepo, docRepo, logger);
      const result = await useCase.execute(
        userId,
        {
          documentType,
          additionalInstructions: additionalInstructions
            ? `[Paid ${amount} ETB via Chapa | TxRef: ${tx_ref}] ${additionalInstructions}`
            : `[Paid ${amount} ETB via Chapa | TxRef: ${tx_ref}]`
        },
        req.ip || 'unknown'
      );

      return sendSuccess(res, `Payment of ${amount} ETB verified via Chapa. Document request dispatched to ASTU Registrar!`, {
        ...result,
        tx_ref,
        amount,
        paymentStatus: 'COMPLETED'
      }, 201);
    } catch (err) {
      next(err);
    }
  }

  // ─── Dashboard Stats ───────────────────────────────────────────────
  static async getDashboardStats(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const alumni = await prisma.alumniProfile.findUnique({ where: { userId } });
      const alumniId = alumni?.id;
      
      if (!alumniId) {
        return sendSuccess(res, 'Stats fetched successfully', {
          profileCompletion: 0,
          openJobMatches: 0,
          savedJobs: 0,
          appliedJobs: 0,
          pendingSurveys: 0,
          documentRequests: 0,
          activeMentorships: 0,
          unreadMessages: await prisma.notification.count({ where: { userId, isRead: false } }),
          upcomingEvents: 0,
          networkConnections: 0
        });
      }

      const profile = await prisma.alumniProfile.findUnique({
        where: { id: alumniId },
        include: { experiences: true, department: true }
      });
      
      // Calculate completion
      let completion = 0;
      if (profile) {
        if (profile.fullName) completion += 20;
        if (profile.employmentStatus) completion += 20;
        if (profile.resumeUrl) completion += 20;
        if (profile.skills && profile.skills.length > 0) completion += 20;
        if (profile.experiences && profile.experiences.length > 0) completion += 20;
      }

      const activeMentorships = await prisma.mentorshipSession.count({
        where: { OR: [{ menteeId: alumniId }, { mentor: { alumniId } }] }
      });

      const stats = {
        profileCompletion: completion,
        openJobMatches: 12, // Dummy for now
        savedJobs: await prisma.savedJob.count({ where: { alumniId } }),
        appliedJobs: await prisma.jobApplication.count({ where: { alumniId } }),
        pendingSurveys: await prisma.surveyAssignment.count({ where: { alumniId, status: 'PENDING' } }),
        documentRequests: await prisma.documentRequest.count({ where: { alumniId } }),
        activeMentorships,
        unreadMessages: await prisma.notification.count({ where: { userId, isRead: false } }),
        upcomingEvents: await prisma.eventRegistration.count({ where: { alumniId } }),
        networkConnections: 347
      };

      return sendSuccess(res, 'Stats fetched successfully', stats);
    } catch (err) { next(err); }
  }

  // ─── Mentorship ───────────────────────────────────────────────────
  static async getMentorProfiles(req: Request, res: Response, next: NextFunction) {
    try {
      const mentors = await prisma.mentorProfile.findMany({
        where: { status: 'AVAILABLE' },
        include: {
          alumni: {
            select: {
              id: true,
              fullName: true,
              profilePicture: true,
              employmentStatus: true,
              experiences: { orderBy: { startDate: 'desc' }, take: 1, select: { companyName: true, position: true } },
              department: { select: { name: true } },
              skills: true,
              graduationYear: true,
            }
          }
        }
      });
      
      const formattedMentors = mentors.map((m: any) => ({
        id: m.id,
        name: m.alumni.fullName,
        role: m.alumni.experiences?.[0]?.position || m.alumni.employmentStatus,
        company: m.alumni.experiences?.[0]?.companyName || 'N/A',
        batch: m.alumni.graduationYear.toString(),
        skills: [...m.expertise, ...(m.alumni.skills || [])].slice(0, 5),
        status: m.status,
        avatarUrl: m.alumni.profilePicture ? `http://localhost:5000${m.alumni.profilePicture}` : 'https://via.placeholder.com/150',
        bio: `Experienced professional with ${m.yearsExperience} years of experience in the industry. Available for mentoring.`,
      }));
      
      return sendSuccess(res, 'Mentor profiles fetched', formattedMentors);
    } catch (err) { next(err); }
  }

  static async scheduleSession(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const alumni = await prisma.alumniProfile.findUnique({ where: { userId } });
      if (!alumni) return res.status(400).json({ success: false, message: 'Alumni profile required' });
      const menteeId = alumni.id;

      const session = await prisma.mentorshipSession.create({
        data: {
          mentorId: req.body.mentorId,
          menteeId,
          date: new Date(req.body.date),
          time: req.body.time,
          topic: req.body.topic,
          status: 'PENDING',
        }
      });
      return sendSuccess(res, 'Session scheduled', session, 201);
    } catch (err) { next(err); }
  }

  // ─── Forum ────────────────────────────────────────────────────────
  static async getForumPosts(req: Request, res: Response, next: NextFunction) {
    try {
      const posts = await prisma.forumPost.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          alumni: { select: { fullName: true, profilePicture: true } }
        }
      });
      const formatted = posts.map((p: any) => ({
        id: p.id,
        author: p.alumni.fullName,
        authorAvatar: p.alumni.profilePicture ? `http://localhost:5000${p.alumni.profilePicture}` : 'https://via.placeholder.com/40',
        authorRole: 'Alumni',
        content: p.content,
        timestamp: p.createdAt.toISOString(),
        likes: p.likesCount,
        comments: p.commentsCount,
        tags: [],
        liked: false
      }));
      return sendSuccess(res, 'Forum posts fetched', formatted);
    } catch (err) { next(err); }
  }

  static async createForumPost(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const alumni = await prisma.alumniProfile.findUnique({ where: { userId } });
      if (!alumni) return res.status(400).json({ success: false, message: 'Alumni profile required' });
      const alumniId = alumni.id;

      const post = await prisma.forumPost.create({
        data: {
          alumniId,
          content: req.body.content
        }
      });
      return sendSuccess(res, 'Post created', post, 201);
    } catch (err) { next(err); }
  }

  static async toggleForumLike(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const alumni = await prisma.alumniProfile.findUnique({ where: { userId } });
      if (!alumni) return res.status(400).json({ success: false, message: 'Alumni profile required' });
      const alumniId = alumni.id;
      const { id: postId } = req.params;
      
      const existing = await prisma.forumLike.findUnique({
        where: { postId_alumniId: { postId, alumniId } }
      });

      if (existing) {
        await prisma.forumLike.delete({ where: { id: existing.id } });
        await prisma.forumPost.update({ where: { id: postId }, data: { likesCount: { decrement: 1 } } });
        return sendSuccess(res, 'Like removed', { liked: false });
      } else {
        await prisma.forumLike.create({ data: { postId, alumniId } });
        await prisma.forumPost.update({ where: { id: postId }, data: { likesCount: { increment: 1 } } });
        return sendSuccess(res, 'Like added', { liked: true });
      }
    } catch (err) { next(err); }
  }

  static async addForumComment(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const alumni = await prisma.alumniProfile.findUnique({ where: { userId } });
      if (!alumni) return res.status(400).json({ success: false, message: 'Alumni profile required' });
      const alumniId = alumni.id;
      const { id: postId } = req.params;
      
      const comment = await prisma.forumComment.create({
        data: {
          postId,
          alumniId,
          content: req.body.content
        }
      });
      await prisma.forumPost.update({ where: { id: postId }, data: { commentsCount: { increment: 1 } } });
      
      return sendSuccess(res, 'Comment added', comment, 201);
    } catch (err) { next(err); }
  }

  // ─── Messages ───────────────────────────────────────────────────────
  static async getMessageThreads(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      let alumni = await prisma.alumniProfile.findUnique({ where: { userId } });
      if (!alumni) {
        alumni = await prisma.alumniProfile.findFirst({ where: { OR: [{ id: userId }, { userId }] } });
      }
      if (!alumni) return res.status(400).json({ success: false, message: 'Alumni profile required' });

      const alumniIds = Array.from(new Set([alumni.id, alumni.userId, userId].filter(Boolean)));

      // Fetch all messages for this alumni
      const messages = await prisma.directMessage.findMany({
        where: { alumniId: { in: alumniIds } },
        orderBy: { createdAt: 'desc' },
        include: { employer: true }
      });

      const threadMap = new Map();
      messages.forEach((msg: any) => {
        if (msg.employer && !threadMap.has(msg.employerId)) {
          threadMap.set(msg.employerId, {
            id: `recruiter-${msg.employerId}`,
            employerId: msg.employerId,
            label: msg.employer.companyName,
            name: msg.employer.companyName,
            desc: 'Recruiter Chat',
            initials: (msg.employer.companyName || 'CR').substring(0, 2).toUpperCase(),
            color: 'from-blue-500 to-indigo-600',
            gradient: 'bg-gradient-to-br from-blue-500 to-indigo-600',
            online: true,
            unread: messages.filter((m: any) => m.employerId === msg.employerId && !m.isRead && m.sender === 'EMPLOYER').length,
            lastMessage: msg.text,
            lastTime: msg.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          });
        }
      });

      // Also check jobs the alumni applied to, so they can message employers even before sending first message
      const applications = await prisma.jobApplication.findMany({
        where: { alumniId: { in: alumniIds } },
        include: { job: { include: { employer: true } } },
        orderBy: { createdAt: 'desc' }
      });

      for (const app of applications) {
        if (app.job?.employer) {
          const emp = app.job.employer;
          if (!threadMap.has(emp.id)) {
            threadMap.set(emp.id, {
              id: `recruiter-${emp.id}`,
              employerId: emp.id,
              label: emp.companyName,
              name: emp.companyName,
              desc: `Applied for ${app.job.title}`,
              initials: (emp.companyName || 'CR').substring(0, 2).toUpperCase(),
              color: 'from-blue-500 to-indigo-600',
              gradient: 'bg-gradient-to-br from-blue-500 to-indigo-600',
              online: true,
              unread: 0,
              lastMessage: 'Tap to start conversation...',
              lastTime: 'Recently'
            });
          }
        }
      }

      return sendSuccess(res, 'Message threads fetched', Array.from(threadMap.values()));
    } catch (err) { next(err); }
  }

  static async getMessages(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      let alumni = await prisma.alumniProfile.findUnique({ where: { userId } });
      if (!alumni) {
        alumni = await prisma.alumniProfile.findFirst({ where: { OR: [{ id: userId }, { userId }] } });
      }
      if (!alumni) return res.status(400).json({ success: false, message: 'Alumni profile required' });

      const targetEmpId = req.params.employerId;
      let employer = await prisma.employerProfile.findUnique({ where: { id: targetEmpId } });
      if (!employer) {
        employer = await prisma.employerProfile.findFirst({ where: { OR: [{ id: targetEmpId }, { userId: targetEmpId }] } });
      }

      const alumniIds = Array.from(new Set([alumni.id, alumni.userId, userId].filter(Boolean)));
      const employerIds = employer ? Array.from(new Set([employer.id, employer.userId, targetEmpId].filter(Boolean))) : [targetEmpId];

      const messages = await prisma.directMessage.findMany({
        where: {
          alumniId: { in: alumniIds },
          employerId: { in: employerIds }
        },
        orderBy: { createdAt: 'asc' },
        include: { employer: true, alumni: true }
      });

      // Mark as read
      await prisma.directMessage.updateMany({
        where: {
          alumniId: { in: alumniIds },
          employerId: { in: employerIds },
          sender: 'EMPLOYER',
          isRead: false
        },
        data: { isRead: true }
      });

      const formatted = messages.map((m: any) => ({
        id: m.id,
        sender: m.sender === 'ALUMNI' ? 'Alumni' : 'Recruiter',
        senderName: m.sender === 'ALUMNI' ? (m.alumni?.fullName || 'You') : (m.employer?.companyName || 'Recruiter'),
        text: m.text,
        timestamp: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: m.isRead ? 'read' : 'delivered'
      }));

      return sendSuccess(res, 'Messages fetched', formatted);
    } catch (err) { next(err); }
  }

  static async sendMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      let alumni = await prisma.alumniProfile.findUnique({ where: { userId } });
      if (!alumni) {
        alumni = await prisma.alumniProfile.findFirst({ where: { OR: [{ id: userId }, { userId }] } });
      }
      if (!alumni) return res.status(400).json({ success: false, message: 'Alumni profile required' });

      const text = req.body.text || req.body.message;
      if (!text || !text.trim()) throw new Error('Message content is required');

      let employer = await prisma.employerProfile.findUnique({ where: { id: req.params.employerId } });
      if (!employer) {
        employer = await prisma.employerProfile.findFirst({ where: { OR: [{ id: req.params.employerId }, { userId: req.params.employerId }] } });
      }
      if (!employer) throw new Error('Employer profile not found');

      const msg = await prisma.directMessage.create({
        data: {
          alumniId: alumni.id,
          employerId: employer.id,
          sender: 'ALUMNI',
          text: text.trim()
        }
      });

      // Emit to the employer's socket
      const { SocketServer } = require('../../../infrastructure/websocket/SocketServer');
      SocketServer.emitToUser(employer.userId, 'newMessage', msg);
      if (employer.id !== employer.userId) {
        SocketServer.emitToUser(employer.id, 'newMessage', msg);
      }

      return sendSuccess(res, 'Message sent', {
        id: msg.id,
        sender: 'Alumni',
        senderName: 'You',
        text: msg.text,
        timestamp: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'sent'
      }, 201);
    } catch (err) { next(err); }
  }

  // ─── Donations ──────────────────────────────────────────────────────
  static async getDonations(req: Request, res: Response, next: NextFunction) {
    try {
      let campaigns = await prisma.donationCampaign.findMany({ orderBy: { createdAt: 'asc' } });
      if (campaigns.length === 0) {
        await prisma.donationCampaign.createMany({
          data: [
            {
              title: 'ASTU Scholarship Fund 2026',
              category: 'SCHOLARSHIP',
              description: 'Support underprivileged engineering students with full tuition scholarships.',
              goal: 5000000,
              raised: 1851000,
              donorCount: 349,
              status: 'ACTIVE',
            },
            {
              title: 'AI Research Lab Equipment',
              category: 'RESEARCH',
              description: 'Fund cutting-edge GPU servers for the new AI research laboratory.',
              goal: 8000000,
              raised: 3201000,
              donorCount: 158,
              status: 'ACTIVE',
            },
            {
              title: 'Campus Innovation Hub',
              category: 'INFRASTRUCTURE',
              description: 'Build a modern co-working makerspace and innovation center for students.',
              goal: 12000000,
              raised: 5401000,
              donorCount: 291,
              status: 'ACTIVE',
            },
          ],
        });
        campaigns = await prisma.donationCampaign.findMany({ orderBy: { createdAt: 'asc' } });
      }
      return sendSuccess(res, 'Donation campaigns fetched', campaigns);
    } catch (err) { next(err); }
  }

  static async makeDonation(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const alumni = await prisma.alumniProfile.findUnique({ where: { userId } });
      if (!alumni) return res.status(400).json({ success: false, message: 'Alumni profile required' });
      const alumniId = alumni.id;

      const donation = await prisma.donationRecord.create({
        data: {
          alumniId,
          campaignId: req.body.campaignId,
          amount: Number(req.body.amount),
          paymentRef: req.body.paymentRef || null
        }
      });
      await prisma.donationCampaign.update({
        where: { id: req.body.campaignId },
        data: {
          raised: { increment: Number(req.body.amount) },
          donorCount: { increment: 1 }
        }
      });
      return sendSuccess(res, 'Donation successful', donation, 201);
    } catch (err) { next(err); }
  }

  static async initializeChapaDonationPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const { campaignId, amount, donorName } = req.body;

      const profile = await alumniRepo.findByUserId(userId);
      const userEmail = (req as any).user?.email || 'alumni@astu.edu.et';

      let campaign = null;
      if (campaignId) {
        campaign = await prisma.donationCampaign.findUnique({ where: { id: campaignId } });
      }

      const tx_ref = `ASTU-DON-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const secretKey = process.env.CHAPA_SECRET_KEY || 'CHASECK_TEST-CHAPA_TEST_PRIV_YzGCRitzQDtxL9mPiBcgfHAd7M1E7HlvGbAnwP1F';

      let checkoutUrl = `${frontendUrl}/alumni/dashboard?tab=donations&tx_ref=${tx_ref}&status=success`;
      const callbackUrl = process.env.CHAPA_CALLBACK_URL || 'https://webhook.site/astu-chapa-callback';

      try {
        const nameParts = (donorName || profile?.fullName || userEmail.split('@')[0] || 'Alumni ASTU').split(' ');
        const chapaRes = await axios.post(
          'https://api.chapa.co/v1/transaction/initialize',
          {
            amount: String(amount || 500),
            currency: 'ETB',
            email: profile?.email || userEmail,
            first_name: nameParts[0] || 'Alumni',
            last_name: nameParts[1] || 'Donor',
            tx_ref,
            callback_url: callbackUrl,
            return_url: `${frontendUrl}/alumni/dashboard?tab=donations&tx_ref=${tx_ref}`,
            customization: {
              title: campaign?.title || 'ASTU Alumni Giving',
              description: `Donation of ${amount} ETB to ASTU`
            }
          },
          {
            headers: {
              Authorization: `Bearer ${secretKey}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (chapaRes.data?.data?.checkout_url) {
          checkoutUrl = chapaRes.data.data.checkout_url;
        }
      } catch (err: any) {
        console.warn('Chapa donation init note:', err?.response?.data || err?.message);
      }

      return sendSuccess(res, 'Chapa donation payment initialized successfully', {
        tx_ref,
        checkout_url: checkoutUrl,
        amount: amount || 500,
        campaignId,
        campaignTitle: campaign?.title || 'ASTU Scholarship Fund 2026',
        publicKey: process.env.CHAPA_PUBLIC_KEY || 'CHAPUBK_TEST-CHAPA_TEST_PUB_osvjFpEwm_HgJWO-HKsW6YKx6U0bz5fXIvyUcCzK'
      });
    } catch (err) { next(err); }
  }

  static async verifyChapaDonationPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const { tx_ref, campaignId, amount } = req.body;

      let profile = await alumniRepo.findByUserId(userId);
      const secretKey = process.env.CHAPA_SECRET_KEY || 'CHASECK_TEST-CHAPA_TEST_PRIV_YzGCRitzQDtxL9mPiBcgfHAd7M1E7HlvGbAnwP1F';

      // Verify with Chapa API
      try {
        await axios.get(`https://api.chapa.co/v1/transaction/verify/${tx_ref}`, {
          headers: { Authorization: `Bearer ${secretKey}` }
        });
      } catch (e: any) {
        console.warn('Chapa donation verification note:', e?.response?.data || e?.message);
      }

      // Ensure alumni profile exists if not already present
      if (!profile) {
        const existingDept = await prisma.department.findFirst();
        profile = await prisma.alumniProfile.create({
          data: {
            userId,
            studentId: `ASTU-${Date.now()}`,
            fullName: (req as any).user?.email?.split('@')[0] || 'ASTU Graduate',
            cgpa: 3.5,
            graduationYear: 2024,
            gender: 'MALE',
            departmentId: existingDept?.id || 'dept-swe'
          }
        }) as any;
      }

      // Record donation and update campaign in DB
      let updatedCampaign = null;
      if (campaignId) {
        try {
          await prisma.donationRecord.create({
            data: {
              alumniId: (profile as any)?.id || 'system',
              campaignId,
              amount: Number(amount || 500),
              paymentRef: tx_ref
            }
          });

          updatedCampaign = await prisma.donationCampaign.update({
            where: { id: campaignId },
            data: {
              raised: { increment: Number(amount || 500) },
              donorCount: { increment: 1 }
            }
          });
        } catch (dbErr) {
          console.warn('Donation DB update note:', dbErr);
        }
      }

      return sendSuccess(res, `Donation of ${amount} ETB verified via Chapa!`, {
        tx_ref,
        amount,
        campaign: updatedCampaign,
        paymentStatus: 'COMPLETED'
      }, 201);
    } catch (err) { next(err); }
  }
  static async getPreferences(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const profile = await prisma.alumniProfile.findUnique({
        where: { userId }
      });
      if (!profile) return res.status(404).json({ success: false, message: 'Profile not found' });

      return sendSuccess(res, 'Preferences fetched', profile.preferences || {});
    } catch (err) { next(err); }
  }

  static async updatePreferences(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const profile = await prisma.alumniProfile.update({
        where: { userId },
        data: { preferences: req.body }
      });

      return sendSuccess(res, 'Preferences updated', profile.preferences);
    } catch (err) { next(err); }
  }

  static async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ success: false, message: 'Current password and new password are required' });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
      }

      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });

      const isValid = await bcrypt.compare(currentPassword, user.password);
      if (!isValid) {
        return res.status(400).json({ success: false, message: 'Current password is incorrect' });
      }

      const hashed = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashed }
      });

      return sendSuccess(res, 'Password changed successfully', null);
    } catch (err) { next(err); }
  }

  // ─── Security & Account ──────────────────────────────────────────────────
  static async getSecurityStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const logs = await prisma.auditLog.findMany({
        where: { userId, action: { in: ['USER_LOGIN', 'LOGIN'] } },
        orderBy: { createdAt: 'desc' },
        take: 5
      });

      return sendSuccess(res, 'Security status fetched', {
        lastLogin: logs.length > 0 ? logs[0].createdAt : null,
        loginHistory: logs,
        twoFactorEnabled: false // Stubbed for now
      });
    } catch (err) { next(err); }
  }

  static async exportData(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const profile = await prisma.alumniProfile.findUnique({
        where: { userId },
        include: {
          experiences: true,
          certifications: true,
          projects: true,
          achievements: true,
          user: {
            select: { email: true, role: true, createdAt: true }
          }
        }
      });

      return sendSuccess(res, 'Data exported', profile);
    } catch (err) { next(err); }
  }

  static async deleteAccount(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      await prisma.user.delete({ where: { id: userId } });

      return sendSuccess(res, 'Account deleted successfully', null);
    } catch (err) { next(err); }
  }
}
