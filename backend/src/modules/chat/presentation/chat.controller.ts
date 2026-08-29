import { Request, Response, NextFunction } from 'express';
import prisma from '../../../core/config/db';
import { sendSuccess } from '../../../core/utils/response.utils';
import { SocketServer } from '../../../infrastructure/websocket/SocketServer';
import { EmailService } from '../../../core/services/EmailService';

export class UnifiedChatController {

  // ── 1. Get Available Contacts Directory ──────────────────────────────
  static async getContacts(req: Request, res: Response, next: NextFunction) {
    try {
      const currentUserId = (req as any).user?.userId;

      // Fetch users across system except current user
      const users = await prisma.user.findMany({
        where: { id: { not: currentUserId } },
        select: {
          id: true,
          email: true,
          role: true,
          alumniProfile: {
            select: { id: true, fullName: true, profilePicture: true, department: { select: { name: true } } }
          },
          employerProfile: {
            select: { id: true, companyName: true, logoUrl: true, industry: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 100
      });

      const contacts = users.map((u: any) => {
        let name = u.email.split('@')[0];
        let avatar: string | null = null;
        let roleLabel = u.role.replace('_', ' ');
        let secondaryInfo = u.email;

        if (u.role === 'ALUMNI' && u.alumniProfile) {
          name = u.alumniProfile.fullName || name;
          avatar = u.alumniProfile.profilePicture || null;
          roleLabel = 'Alumni Graduate';
          secondaryInfo = u.alumniProfile.department?.name || u.email;
        } else if (u.role === 'EMPLOYER' && u.employerProfile) {
          name = u.employerProfile.companyName || name;
          avatar = u.employerProfile.logoUrl || null;
          roleLabel = 'Corporate Recruiter';
          secondaryInfo = u.employerProfile.industry || u.email;
        } else if (u.role === 'ADMIN') {
          name = 'System Admin';
          roleLabel = 'Platform Administrator';
          secondaryInfo = 'ASTU Alumni System';
        } else if (u.role === 'REGISTRAR') {
          name = 'Office of Registrar';
          roleLabel = 'Document & Verification Services';
          secondaryInfo = 'ASTU Registrar';
        } else if (u.role === 'DEPARTMENT_HEAD') {
          name = 'Department Head';
          roleLabel = 'Academic Department Chair';
          secondaryInfo = 'ASTU Faculty';
        }

        return {
          id: u.id,
          userId: u.id,
          profileId: u.alumniProfile?.id || u.employerProfile?.id || u.id,
          name,
          email: u.email,
          role: u.role,
          roleLabel,
          secondaryInfo,
          avatar,
          online: true,
        };
      });

      return sendSuccess(res, 'Chat directory loaded successfully.', contacts);
    } catch (err) { next(err); }
  }

  // ── 2. Get All Active Conversation Threads ────────────────────────────
  static async getThreads(req: Request, res: Response, next: NextFunction) {
    try {
      const currentUserId = (req as any).user?.userId;

      // Find profiles for current user if any
      const alumniProfile = await prisma.alumniProfile.findUnique({ where: { userId: currentUserId } }).catch(() => null);
      const employerProfile = await prisma.employerProfile.findUnique({ where: { userId: currentUserId } }).catch(() => null);

      const myIds = Array.from(new Set([
        currentUserId,
        alumniProfile?.id,
        employerProfile?.id
      ].filter(Boolean))) as string[];

      // Query DirectMessages where sender or receiver is in myIds
      const messages = await (prisma.directMessage as any).findMany({
        where: {
          OR: [
            { senderId: { in: myIds } },
            { receiverId: { in: myIds } },
            { alumniId: { in: myIds } },
            { employerId: { in: myIds } }
          ],
          isDeleted: false,
          NOT: {
            deletedBy: { hasSome: myIds }
          }
        },
        orderBy: { createdAt: 'asc' }
      });

      // Collect all partner user/profile IDs
      const partnerIdSet = new Set<string>();
      messages.forEach((m: any) => {
        if (m.senderId && !myIds.includes(m.senderId)) partnerIdSet.add(m.senderId);
        if (m.receiverId && !myIds.includes(m.receiverId)) partnerIdSet.add(m.receiverId);
        if (m.alumniId && !myIds.includes(m.alumniId)) partnerIdSet.add(m.alumniId);
        if (m.employerId && !myIds.includes(m.employerId)) partnerIdSet.add(m.employerId);
      });

      // Also include job applicants for employer or applied jobs for alumni
      if (employerProfile) {
        const apps = await prisma.jobApplication.findMany({
          where: { job: { employerId: employerProfile.id } },
          select: { alumniId: true, alumni: { select: { userId: true } } }
        });
        apps.forEach((a: any) => {
          if (a.alumniId) partnerIdSet.add(a.alumniId);
          if (a.alumni?.userId) partnerIdSet.add(a.alumni.userId);
        });
      }

      if (alumniProfile) {
        const apps = await prisma.jobApplication.findMany({
          where: { alumniId: alumniProfile.id },
          select: { job: { select: { employerId: true, employer: { select: { userId: true } } } } }
        });
        apps.forEach((a: any) => {
          if (a.job?.employerId) partnerIdSet.add(a.job.employerId);
          if (a.job?.employer?.userId) partnerIdSet.add(a.job.employer.userId);
        });
      }

      const partnerIds = Array.from(partnerIdSet);

      // Fetch user & profile info for all partner IDs
      const partnerUsers = await prisma.user.findMany({
        where: {
          OR: [
            { id: { in: partnerIds } },
            { alumniProfile: { id: { in: partnerIds } } },
            { employerProfile: { id: { in: partnerIds } } }
          ]
        },
        include: { alumniProfile: { include: { department: true } }, employerProfile: true }
      });

      const partnerMap = new Map<string, any>();
      partnerUsers.forEach((u: any) => {
        let name = u.email.split('@')[0];
        let avatar: string | null = null;
        let roleLabel = u.role.replace('_', ' ');

        if (u.role === 'ALUMNI' && u.alumniProfile) {
          name = u.alumniProfile.fullName || name;
          avatar = u.alumniProfile.profilePicture || null;
          roleLabel = 'Alumni Candidate';
        } else if (u.role === 'EMPLOYER' && u.employerProfile) {
          name = u.employerProfile.companyName || name;
          avatar = u.employerProfile.logoUrl || null;
          roleLabel = 'Corporate Recruiter';
        } else if (u.role === 'ADMIN') {
          name = 'System Admin';
          roleLabel = 'Platform Administrator';
        } else if (u.role === 'REGISTRAR') {
          name = 'Office of Registrar';
          roleLabel = 'Registrar Services';
        } else if (u.role === 'DEPARTMENT_HEAD') {
          name = 'Department Head';
          roleLabel = 'Academic Department Chair';
        }

        const info = {
          id: u.id,
          userId: u.id,
          alumniId: u.alumniProfile?.id,
          employerId: u.employerProfile?.id,
          name,
          email: u.email,
          role: u.role,
          roleLabel,
          department: u.alumniProfile?.department?.name || 'Graduate Candidate',
          avatar
        };

        partnerMap.set(u.id, info);
        if (u.alumniProfile) partnerMap.set(u.alumniProfile.id, info);
        if (u.employerProfile) partnerMap.set(u.employerProfile.id, info);
      });

      // Build conversation threads
      const threadMap = new Map<string, any>();

      messages.forEach((msg: any) => {
        let pId = myIds.includes(msg.senderId) ? msg.receiverId : msg.senderId;
        if (!pId || myIds.includes(pId)) {
          pId = myIds.includes(msg.alumniId || '') ? msg.employerId || '' : msg.alumniId || '';
        }
        if (!pId) return;

        const partnerInfo = partnerMap.get(pId) || {
          id: pId,
          userId: pId,
          name: 'ASTU Network Contact',
          email: '',
          role: msg.sender,
          roleLabel: msg.sender,
          department: 'ASTU Network',
          avatar: null
        };

        const threadKey = partnerInfo.userId || partnerInfo.id;

        if (!threadMap.has(threadKey)) {
          threadMap.set(threadKey, {
            partnerId: threadKey,
            userId: partnerInfo.userId,
            alumniId: partnerInfo.alumniId,
            employerId: partnerInfo.employerId,
            alumniName: partnerInfo.name,
            name: partnerInfo.name,
            email: partnerInfo.email,
            alumniEmail: partnerInfo.email,
            alumniPhoto: partnerInfo.avatar,
            avatar: partnerInfo.avatar,
            role: partnerInfo.role,
            roleLabel: partnerInfo.roleLabel,
            department: partnerInfo.department,
            online: true,
            unreadCount: 0,
            lastMessage: msg.text,
            lastMessageTime: msg.createdAt,
            messages: []
          });
        }

        const thread = threadMap.get(threadKey);
        thread.lastMessage = msg.text;
        thread.lastMessageTime = msg.createdAt;

        const isMe = myIds.includes(msg.senderId) || (msg.sender === (alumniProfile ? 'ALUMNI' : 'EMPLOYER'));
        if (!msg.isRead && !isMe) {
          thread.unreadCount += 1;
        }

        thread.messages.push({
          id: msg.id,
          sender: isMe ? (employerProfile ? 'EMPLOYER' : 'ALUMNI') : msg.sender,
          senderId: msg.senderId,
          senderRole: msg.sender,
          text: msg.text,
          fileUrl: msg.fileUrl || null,
          fileType: msg.fileType || null,
          isRead: msg.isRead,
          createdAt: msg.createdAt
        });
      });

      // Include partner entries that don't have message threads yet
      partnerUsers.forEach((u: any) => {
        const info = partnerMap.get(u.id);
        const canonicalKey = info?.userId || info?.alumniId || info?.employerId || u.id;
        if (!threadMap.has(canonicalKey)) {
          threadMap.set(canonicalKey, {
            partnerId: canonicalKey,
            userId: info?.userId || u.id,
            alumniId: info?.alumniId,
            employerId: info?.employerId,
            alumniName: info?.name,
            name: info?.name,
            email: info?.email,
            alumniEmail: info?.email,
            alumniPhoto: info?.avatar,
            avatar: info?.avatar,
            role: info?.role,
            roleLabel: info?.roleLabel,
            department: info?.department || 'Candidate',
            online: true,
            unreadCount: 0,
            lastMessage: 'Tap to start a conversation...',
            lastTime: u.createdAt ? new Date(u.createdAt).toISOString() : new Date().toISOString(),
            lastMessageTime: u.createdAt ? new Date(u.createdAt).toISOString() : new Date().toISOString(),
            messages: []
          });
        }
      });

      const threads = Array.from(threadMap.values());
      return sendSuccess(res, 'Conversation threads fetched successfully.', threads);
    } catch (err) { next(err); }
  }

  // ── 3. Send Message ──────────────────────────────────────────────────
  static async sendMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const senderUserId = (req as any).user?.userId;
      const senderRole = (req as any).user?.role;

      const targetId = req.body.targetId || req.body.alumniId || req.body.receiverId;
      const rawText = req.body.text || req.body.message;
      const fileUrl = req.body.fileUrl;
      const fileType = req.body.fileType;

      const text = (rawText || '').trim() || (fileUrl ? (fileType?.startsWith('image/') ? '📷 Photo' : '📎 Attachment') : '');

      if (!targetId) throw new Error('Target recipient ID is required');
      if (!text && !fileUrl) throw new Error('Message content or file attachment is required');

      // Resolve sender profiles
      const senderAlumni = await prisma.alumniProfile.findUnique({ where: { userId: senderUserId } }).catch(() => null);
      const senderEmployer = await prisma.employerProfile.findUnique({ where: { userId: senderUserId } }).catch(() => null);

      // Resolve target recipient user & profile
      let targetUser = await prisma.user.findUnique({ where: { id: targetId } });
      if (!targetUser) {
        targetUser = await prisma.user.findFirst({
          where: {
            OR: [
              { alumniProfile: { id: targetId } },
              { employerProfile: { id: targetId } }
            ]
          }
        });
      }

      let targetAlumni = await prisma.alumniProfile.findFirst({ where: { OR: [{ id: targetId }, { userId: targetId }] } }).catch(() => null);
      let targetEmployer = await prisma.employerProfile.findFirst({ where: { OR: [{ id: targetId }, { userId: targetId }] } }).catch(() => null);

      const receiverUserId = targetUser?.id || targetId;
      const receiverRole = targetUser?.role || (targetAlumni ? 'ALUMNI' : targetEmployer ? 'EMPLOYER' : 'USER');

      // Determine alumniId and employerId for legacy queries
      const alumniId = senderAlumni?.id || targetAlumni?.id || null;
      const employerId = senderEmployer?.id || targetEmployer?.id || null;

      const message = await (prisma.directMessage as any).create({
        data: {
          senderId: senderUserId,
          receiverId: receiverUserId,
          sender: senderRole,
          receiverRole: receiverRole,
          text: text,
          fileUrl: fileUrl || null,
          fileType: fileType || null,
          alumniId: alumniId,
          employerId: employerId
        }
      });

      // Real-time WebSocket Notifications
      SocketServer.emitToUser(receiverUserId, 'newMessage', message);
      if (targetAlumni?.id) SocketServer.emitToUser(targetAlumni.id, 'newMessage', message);
      if (targetEmployer?.id) SocketServer.emitToUser(targetEmployer.id, 'newMessage', message);

      // Persistent Notification & Email Alert
      if (receiverUserId) {
        let senderTitle = senderEmployer?.companyName || senderAlumni?.fullName || `${senderRole} User`;
        let recipientTitle = targetUser?.email ? targetUser.email.split('@')[0] : 'User';
        let recipientEmail = targetUser?.email || targetAlumni?.email || targetEmployer?.contactEmail;

        try {
          const userExists = await prisma.user.findUnique({ where: { id: receiverUserId }, select: { id: true } });
          if (userExists) {
            await prisma.notification.create({
              data: {
                userId: receiverUserId,
                title: `New Message from ${senderTitle}`,
                content: text.trim().substring(0, 100),
              }
            });
          }
        } catch (_) { }

        if (recipientEmail) {
          try {
            const { EmailService } = require('../../../core/services/EmailService');
            const emailSvc = new EmailService();
            emailSvc.sendDirectMessageNotification(recipientEmail, recipientTitle, senderTitle, text.trim().substring(0, 150)).catch(() => null);
          } catch (_) { }
        }
      }

      return sendSuccess(res, 'Message sent successfully.', message, 201);
    } catch (err) { next(err); }
  }

  // ── 4. Mark Thread Messages as Read ─────────────────────────────────
  static async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const currentUserId = (req as any).user?.userId;
      const { partnerId } = req.body;
      if (!partnerId) return sendSuccess(res, 'No partnerId provided', {});

      const alumniProfile = await prisma.alumniProfile.findUnique({ where: { userId: currentUserId } }).catch(() => null);
      const employerProfile = await prisma.employerProfile.findUnique({ where: { userId: currentUserId } }).catch(() => null);

      const myIds = Array.from(new Set([
        currentUserId,
        alumniProfile?.id,
        employerProfile?.id,
        alumniProfile?.userId,
        employerProfile?.userId
      ].filter(Boolean))) as string[];

      const partnerUser = await prisma.user.findFirst({
        where: { OR: [{ id: partnerId }, { alumniProfile: { id: partnerId } }, { employerProfile: { id: partnerId } }] },
        include: { alumniProfile: true, employerProfile: true }
      }).catch(() => null);

      const partnerAlumni = await prisma.alumniProfile.findFirst({
        where: { OR: [{ id: partnerId }, { userId: partnerId }] }
      }).catch(() => null);

      const partnerEmployer = await prisma.employerProfile.findFirst({
        where: { OR: [{ id: partnerId }, { userId: partnerId }] }
      }).catch(() => null);

      const partnerIds = Array.from(new Set([
        partnerId,
        partnerUser?.id,
        partnerAlumni?.id,
        partnerAlumni?.userId,
        partnerEmployer?.id,
        partnerEmployer?.userId
      ].filter(Boolean))) as string[];

      const result = await (prisma.directMessage as any).updateMany({
        where: {
          OR: [
            { senderId: { in: partnerIds } },
            { receiverId: { in: myIds }, senderId: { in: partnerIds } },
            { alumniId: { in: partnerIds } },
            { employerId: { in: partnerIds } }
          ],
          NOT: {
            senderId: { in: myIds }
          },
          isRead: false
        },
        data: { isRead: true }
      });

      return sendSuccess(res, 'Messages marked as read successfully.', { updated: result.count });
    } catch (err) { next(err); }
  }

  // ── 5. Delete Single Message (For Me or For Everyone) ───────────────
  static async deleteMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const currentUserId = (req as any).user?.userId;
      const { messageId } = req.params;
      const { deleteForEveryone } = req.body;

      const alumniProfile = await prisma.alumniProfile.findUnique({ where: { userId: currentUserId } }).catch(() => null);
      const employerProfile = await prisma.employerProfile.findUnique({ where: { userId: currentUserId } }).catch(() => null);

      const myIds = Array.from(new Set([currentUserId, alumniProfile?.id, employerProfile?.id].filter(Boolean))) as string[];

      const msg = await (prisma.directMessage as any).findUnique({ where: { id: messageId } });
      if (!msg) return res.status(404).json({ success: false, message: 'Message not found' });

      const isSender = myIds.includes(msg.senderId) || (msg.sender === 'EMPLOYER' && employerProfile) || (msg.sender === 'ALUMNI' && alumniProfile);

      if (deleteForEveryone && isSender) {
        await (prisma.directMessage as any).update({
          where: { id: messageId },
          data: { isDeleted: true }
        });
      } else {
        await (prisma.directMessage as any).update({
          where: { id: messageId },
          data: {
            deletedBy: { push: currentUserId }
          }
        });
      }

      return sendSuccess(res, 'Message deleted successfully', {});
    } catch (err) { next(err); }
  }

  // ── 6. Delete Entire Conversation Thread ────────────────────────────
  static async deleteThread(req: Request, res: Response, next: NextFunction) {
    try {
      const currentUserId = (req as any).user?.userId;
      const { partnerId } = req.params;

      const alumniProfile = await prisma.alumniProfile.findUnique({ where: { userId: currentUserId } }).catch(() => null);
      const employerProfile = await prisma.employerProfile.findUnique({ where: { userId: currentUserId } }).catch(() => null);

      const myIds = Array.from(new Set([currentUserId, alumniProfile?.id, employerProfile?.id].filter(Boolean))) as string[];

      const partnerUser = await prisma.user.findFirst({
        where: { OR: [{ id: partnerId }, { alumniProfile: { id: partnerId } }, { employerProfile: { id: partnerId } }] },
        include: { alumniProfile: true, employerProfile: true }
      }).catch(() => null);

      const partnerAlumni = await prisma.alumniProfile.findFirst({ where: { OR: [{ id: partnerId }, { userId: partnerId }] } }).catch(() => null);
      const partnerEmployer = await prisma.employerProfile.findFirst({ where: { OR: [{ id: partnerId }, { userId: partnerId }] } }).catch(() => null);

      const partnerIds = Array.from(new Set([
        partnerId,
        partnerUser?.id,
        partnerAlumni?.id,
        partnerEmployer?.id
      ].filter(Boolean))) as string[];

      const threadMessages = await (prisma.directMessage as any).findMany({
        where: {
          OR: [
            { senderId: { in: myIds }, receiverId: { in: partnerIds } },
            { senderId: { in: partnerIds }, receiverId: { in: myIds } },
            { alumniId: { in: partnerIds }, employerId: { in: myIds } },
            { employerId: { in: partnerIds }, alumniId: { in: myIds } }
          ]
        }
      });

      const toUpdateIds = threadMessages
        .filter((m: any) => !((m.deletedBy as string[]) || []).includes(currentUserId))
        .map((m: any) => m.id);

      if (toUpdateIds.length > 0) {
        await Promise.all(
          toUpdateIds.map((id: string) =>
            (prisma.directMessage as any).update({
              where: { id },
              data: { deletedBy: { push: currentUserId } }
            }).catch(() => null)
          )
        );
      }

      return sendSuccess(res, 'Conversation thread deleted successfully', {});
    } catch (err) { next(err); }
  }

  // ── 7. Request CV from Alumni with Email & Direct Chat Link ──────────────────────────
  static async requestCv(req: Request, res: Response, next: NextFunction) {
    try {
      const senderUserId = (req as any).user?.userId;
      const targetId = req.body.targetId || req.body.alumniId;

      if (!targetId) throw new Error('Target recipient ID is required');

      // Resolve employer profile & name
      const employerProfile = await prisma.employerProfile.findUnique({ where: { userId: senderUserId } }).catch(() => null);
      const companyName = employerProfile?.companyName || 'Corporate Recruiter';

      // Resolve recipient alumni & user
      let targetAlumni = await prisma.alumniProfile.findFirst({
        where: { OR: [{ id: targetId }, { userId: targetId }] },
        include: { user: true }
      }).catch(() => null);

      let targetUser = targetAlumni?.user;
      if (!targetUser) {
        targetUser = await prisma.user.findUnique({ where: { id: targetId } });
      }

      const receiverUserId = targetUser?.id || targetId;
      const recipientEmail = targetUser?.email || targetAlumni?.email;
      const candidateName = targetAlumni?.fullName || 'Graduate Candidate';

      // 1. Post automated initial message in chat thread
      const cvRequestText = `📄 Hello ${candidateName}, ${companyName} has reviewed your verified candidate profile on the ASTU Alumni Portal and would love to review your CV! Please attach and send your CV file here in ASTU_AMS Hub.`;

      const message = await (prisma.directMessage as any).create({
        data: {
          senderId: senderUserId,
          receiverId: receiverUserId,
          sender: 'EMPLOYER',
          receiverRole: 'ALUMNI',
          text: cvRequestText,
          alumniId: targetAlumni?.id || null,
          employerId: employerProfile?.id || null
        }
      });

      // Real-time WebSocket Notifications
      SocketServer.emitToUser(receiverUserId, 'newMessage', message);

      // 2. Dispatch HTML Email Notification with direct chat link
      if (recipientEmail) {
        const emailService = new EmailService();
        const chatLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/alumni/dashboard?tab=messages&target=${senderUserId}`;
        const emailText = `Dear ${candidateName},\n\n${companyName} has requested your CV on ASTU Alumni Portal. Open ASTU_AMS Hub to reply: ${chatLink}`;
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 24px;">
              <h2 style="color: #003366; margin: 0;">ASTU Alumni Management System</h2>
              <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Recruiter CV Request Notice</p>
            </div>
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #003366; margin-bottom: 24px;">
              <h3 style="margin-top: 0; color: #1e293b;">📄 CV Request from ${companyName}</h3>
              <p style="color: #334155; font-size: 15px; line-height: 1.6;">Dear <strong>${candidateName}</strong>,</p>
              <p style="color: #334155; font-size: 15px; line-height: 1.6;">
                <strong>${companyName}</strong> has reviewed your verified graduate profile on the ASTU Alumni Portal and requested your CV for potential career opportunities!
              </p>
              <p style="color: #334155; font-size: 15px; line-height: 1.6;">
                Please log in to your account and send your CV document directly to the recruiter using the <strong>ASTU_AMS Hub</strong>.
              </p>
            </div>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${chatLink}" style="background-color: #003366; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 15px; display: inline-block; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                Open Chat on ASTU_AMS Hub
              </a>
            </div>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
            <p style="color: #94a3b8; font-size: 12px; text-align: center;">
              This is an automated notification from the ASTU Alumni Portal. Please do not reply directly to this email.
            </p>
          </div>
        `;

        await emailService.sendMail({
          to: recipientEmail,
          subject: `📄 CV Request from ${companyName} on ASTU_AMS`,
          text: emailText,
          html: emailHtml
        }).catch((e: any) => console.error('CV Request email failed:', e));
      }

      return sendSuccess(res, `CV request sent successfully to ${candidateName}.`, { message });
    } catch (err) { next(err); }
  }
}
