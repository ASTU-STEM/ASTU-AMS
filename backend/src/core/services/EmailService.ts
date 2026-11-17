import nodemailer from 'nodemailer';
import { env } from '../config/env';

export interface MailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
  from?: string;
  bcc?: string[];
}

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });
  }

  /**
   * Universal Dynamic Recipient Resolution Engine:
   * Resolves recipient email addresses dynamically for any role, user ID, email address, or comma-separated list.
   * Supports System Roles: REGISTRAR, DEPARTMENT_HEAD, ALUMNI_OFFICE / CMS, ADMIN, EMPLOYER, ALUMNI.
   * 1. Checks Admin-configured environment overrides (REGISTRAR_EMAIL, DEPT_HEAD_EMAIL, CMS_EMAIL, ADMIN_EMAIL).
   * 2. Queries active User accounts assigned by Admin in database matching the role/department.
   * 3. Resolves profile-level primary emails (AlumniProfile / EmployerProfile).
   */
  async resolveRoleRecipients(roleToken: string): Promise<string[]> {
    if (!roleToken) return [];
    const normalized = roleToken.trim().toUpperCase();
    const emailsSet = new Set<string>();

    const clean = (e?: string | null) => (e && e.trim().includes('@') ? e.trim() : null);

    try {
      const prisma = require('../config/db').default;

      if (normalized === 'REGISTRAR') {
        const envEmail = clean(process.env.REGISTRAR_EMAIL || process.env.REGISTRAR_NOTIFICATION_EMAIL);
        if (envEmail) emailsSet.add(envEmail);

        const users = await prisma.user.findMany({
          where: { role: 'REGISTRAR' },
          select: { email: true }
        });
        users.forEach((u: any) => {
          const em = clean(u.email);
          if (em) emailsSet.add(em);
        });

        if (emailsSet.size === 0) {
          const admins = await prisma.user.findMany({
            where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } },
            select: { email: true }
          });
          admins.forEach((u: any) => {
            const em = clean(u.email);
            if (em) emailsSet.add(em);
          });
        }
      } else if (normalized === 'DEPARTMENT_HEAD' || normalized === 'DEPT_HEAD') {
        const envEmail = clean(process.env.DEPARTMENT_HEAD_EMAIL || process.env.DEPT_HEAD_EMAIL);
        if (envEmail) emailsSet.add(envEmail);

        const users = await prisma.user.findMany({
          where: { role: 'DEPARTMENT_HEAD' },
          select: { email: true }
        });
        users.forEach((u: any) => {
          const em = clean(u.email);
          if (em) emailsSet.add(em);
        });

        if (emailsSet.size === 0) {
          const registrars = await prisma.user.findMany({
            where: { role: { in: ['REGISTRAR', 'ADMIN'] } },
            select: { email: true }
          });
          registrars.forEach((u: any) => {
            const em = clean(u.email);
            if (em) emailsSet.add(em);
          });
        }
      } else if (normalized === 'ALUMNI_OFFICE' || normalized === 'CMS') {
        const envEmail = clean(process.env.CMS_EMAIL || process.env.ALUMNI_OFFICE_EMAIL);
        if (envEmail) emailsSet.add(envEmail);

        const users = await prisma.user.findMany({
          where: { role: 'ALUMNI_OFFICE' },
          select: { email: true }
        });
        users.forEach((u: any) => {
          const em = clean(u.email);
          if (em) emailsSet.add(em);
        });

        if (emailsSet.size === 0) {
          const admins = await prisma.user.findMany({
            where: { role: 'ADMIN' },
            select: { email: true }
          });
          admins.forEach((u: any) => {
            const em = clean(u.email);
            if (em) emailsSet.add(em);
          });
        }
      } else if (normalized === 'ADMIN' || normalized === 'SUPER_ADMIN') {
        const envEmail = clean(process.env.ADMIN_EMAIL || process.env.SUPER_ADMIN_EMAIL);
        if (envEmail) emailsSet.add(envEmail);

        const admins = await prisma.user.findMany({
          where: { role: 'ADMIN' },
          select: { email: true }
        });
        admins.forEach((u: any) => {
          const em = clean(u.email);
          if (em) emailsSet.add(em);
        });
      } else if (normalized === 'EMPLOYER') {
        const employers = await prisma.employerProfile.findMany({
          select: { contactEmail: true, user: { select: { email: true } } }
        });
        employers.forEach((emp: any) => {
          const contact = clean(emp.contactEmail);
          const userEm = clean(emp.user?.email);
          if (contact) emailsSet.add(contact);
          if (userEm) emailsSet.add(userEm);
        });
      } else if (normalized === 'ALUMNI') {
        const alumni = await prisma.alumniProfile.findMany({
          where: { status: 'ACTIVE' },
          select: { email: true, user: { select: { email: true } } }
        });
        alumni.forEach((a: any) => {
          const contact = clean(a.email);
          const userEm = clean(a.user?.email);
          if (contact) emailsSet.add(contact);
          if (userEm) emailsSet.add(userEm);
        });
      }
    } catch (err) {
      console.warn(`[EmailService] Failed to resolve role recipients for ${roleToken}:`, err);
    }

    return Array.from(emailsSet);
  }

  /**
   * Universal 3-Tier Email Fallback Resolution Engine:
   * Tier 1: System Role Token resolution (REGISTRAR, DEPARTMENT_HEAD, ALUMNI_OFFICE, CMS, ADMIN, EMPLOYER, ALUMNI)
   * Tier 2: Primary custom contact/notification email stored in Profile (AlumniProfile / EmployerProfile)
   * Tier 3: Account registration email stored in User model
   */
  async resolveUserDeliveryEmail(targetEmailOrUserId: string): Promise<string> {
    if (!targetEmailOrUserId) return '';
    const trimmed = targetEmailOrUserId.trim();

    // Check if target is a comma-separated list
    if (trimmed.includes(',')) {
      const parts = trimmed.split(',');
      const resolvedParts = await Promise.all(parts.map(p => this.resolveUserDeliveryEmail(p.trim())));
      const unique = Array.from(new Set(resolvedParts.map(r => r.split(',')).flat().map(s => s.trim()).filter(Boolean)));
      return unique.join(', ');
    }

    const upper = trimmed.toUpperCase();
    if (['REGISTRAR', 'DEPARTMENT_HEAD', 'DEPT_HEAD', 'ALUMNI_OFFICE', 'CMS', 'ADMIN', 'SUPER_ADMIN', 'EMPLOYER', 'ALUMNI'].includes(upper)) {
      const roleEmails = await this.resolveRoleRecipients(upper);
      if (roleEmails.length > 0) return roleEmails.join(', ');
    }

    try {
      const prisma = require('../config/db').default;
      if (!trimmed.includes('@')) {
        // Look up by User ID
        const user = await prisma.user.findUnique({
          where: { id: trimmed },
          include: { alumniProfile: true, employerProfile: true }
        });
        if (user) {
          const tier1or2 = user.employerProfile?.contactEmail || user.alumniProfile?.email;
          if (tier1or2 && tier1or2.includes('@')) return tier1or2.trim();
          if (user.email) return user.email.trim();
        }
      } else {
        // Look up by Email address
        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: trimmed },
              { alumniProfile: { email: trimmed } },
              { employerProfile: { contactEmail: trimmed } }
            ]
          },
          include: { alumniProfile: true, employerProfile: true }
        });
        if (user) {
          const tier1or2 = user.employerProfile?.contactEmail || user.alumniProfile?.email || trimmed;
          if (tier1or2 && tier1or2.trim()) return tier1or2.trim();
          if (user.email) return user.email.trim();
        }
      }
    } catch (err) {
      // Return provided string on lookup exception
    }

    return trimmed;
  }

  private getTransporter(dbConfig?: any): nodemailer.Transporter {
    if (dbConfig && dbConfig.smtpHost) {
      const port = parseInt(dbConfig.smtpPort || '587', 10);
      return nodemailer.createTransport({
        host: dbConfig.smtpHost,
        port: port,
        secure: port === 465,
        auth: dbConfig.smtpUser ? {
          user: dbConfig.smtpUser,
          pass: dbConfig.smtpPassword || env.SMTP_PASS,
        } : undefined,
      });
    }
    return this.transporter;
  }

  async sendMail(options: MailOptions) {
    const resolvedTo = await this.resolveUserDeliveryEmail(options.to);
    
    let activeFrom = options.from || env.SMTP_FROM;
    let activeTransporter = this.transporter;

    try {
      const prisma = require('../config/db').default;
      const dbEmailSetting = await prisma.systemSetting.findUnique({ where: { key: 'email' } });
      if (dbEmailSetting && dbEmailSetting.value) {
        const emailVal = dbEmailSetting.value as any;
        if (emailVal.fromEmail) {
          const name = emailVal.fromName || 'ASTU Alumni Management System';
          activeFrom = options.from || `"${name}" <${emailVal.fromEmail}>`;
        }
        if (emailVal.smtpHost) {
          activeTransporter = this.getTransporter(emailVal);
        }
      }
    } catch (err) {
      // Fall back to default environment config
    }

    const message = {
      from: activeFrom,
      to: resolvedTo || options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
      bcc: options.bcc,
    };

    console.log(`[EMAIL DISPATCH] Delivered to (Dynamic DB/Role Resolved): ${message.to} | Subject: "${options.subject}"`);
    if (process.env.NODE_ENV === 'test') {
      return { messageId: 'test-mock-id', accepted: [message.to], response: '250 Test mock accepted' } as any;
    }
    const info = await activeTransporter.sendMail(message);
    return info;
  }

  async sendVerificationCode(email: string, code: string, studentId: string) {
    const subject = 'ASTU Alumni Verification Code';
    const text = `Your verification code for student ID ${studentId} is ${code}. It expires in 15 minutes.`;
    const html = `<p>Hello,</p><p>Your verification code for student ID <strong>${studentId}</strong> is <strong>${code}</strong>.</p><p>This code expires in 15 minutes.</p><p>If you did not request this code, please ignore this email.</p>`;

    // Log for local testing
    console.log(`\n================================`);
    console.log(`[DEV TEST] OTP Code for ${email}: ${code}`);
    console.log(`================================\n`);

    try {
      return await this.sendMail({ to: email, subject, text, html });
    } catch (e) {
      console.warn('Email send failed (ensure SMTP env variables are set). The code is logged above.');
      return null;
    }
  }

  async send2FAVerificationCode(email: string, code: string) {
    const subject = 'ASTU AMS - 2FA Security Verification Code';
    const text = `Your ASTU AMS 2FA verification code is ${code}. It expires in 10 minutes.`;
    const html = `
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 500px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 12px; padding: 24px;">
        <h2 style="color: #003366; margin-top: 0;">ASTU AMS Security Verification</h2>
        <p>Hello,</p>
        <p>Your Two-Factor Authentication (2FA) verification code is:</p>
        <div style="background-color: #f0f4f8; padding: 16px; border-radius: 8px; text-align: center; margin: 20px 0;">
          <span style="font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #003366;">${code}</span>
        </div>
        <p style="font-size: 13px; color: #666;">This code expires in 10 minutes. If you did not attempt to sign in, please secure your account immediately.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 11px; color: #999; text-align: center;">Adama Science and Technology University - Alumni Management System</p>
      </div>
    `;

    console.log(`\n================================`);
    console.log(`[2FA OTP CODE] for ${email}: ${code}`);
    console.log(`================================\n`);

    try {
      return await this.sendMail({ to: email, subject, text, html });
    } catch (e) {
      console.warn('Email send warning (SMTP). The 2FA code is logged above.');
      return null;
    }
  }

  async sendTemporaryPassword(email: string, temporaryPassword: string, role: string) {
    const loginUrl = `${env.FRONTEND_URL || 'http://localhost:5173'}/login`;
    const subject = 'Welcome to ASTU Management System - Your Account Credentials';
    const text = `Dear User,\n\nWelcome to the Adama Science and Technology University (ASTU) Management System.\n\nAn administrator has successfully created an account for you with the role of ${role}.\n\nYour login credentials are as follows:\nEmail: ${email}\nTemporary Password: ${temporaryPassword}\n\nLogin Link: ${loginUrl}\n\nFor security reasons, please ensure that you change this temporary password immediately after logging in for the first time.\n\nWe are thrilled to have you on board!\n\nBest regards,\nASTU Management System Team`;
    const html = `
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #003366; color: #ffffff; padding: 20px; text-align: center;">
          <h2 style="margin: 0; color: #ffffff; font-size: 22px;">Welcome to ASTU Management System</h2>
          <p style="margin: 5px 0 0 0; color: #cbd5e1; font-size: 13px;">Adama Science & Technology University</p>
        </div>
        <div style="padding: 24px;">
          <p style="margin-top: 0;">Dear User,</p>
          <p>Welcome to the Adama Science and Technology University (ASTU) Management System.</p>
          <p>An administrator has successfully created an account for you with the designated role of <strong>${role}</strong>.</p>
          
          <div style="background-color: #f8fafc; padding: 16px; border-left: 4px solid #E8A020; border-radius: 4px; margin: 20px 0;">
            <p style="margin: 0 0 8px 0;"><strong>Email Address:</strong> <a href="mailto:${email}" style="color: #003366;">${email}</a></p>
            <p style="margin: 0;"><strong>Temporary Password:</strong> <code style="background-color: #e2e8f0; padding: 3px 8px; border-radius: 4px; font-family: monospace; font-size: 14px; color: #0f172a; font-weight: bold;">${temporaryPassword}</code></p>
          </div>

          <div style="text-align: center; margin: 28px 0;">
            <a href="${loginUrl}" target="_blank" style="background-color: #003580; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 15px; display: inline-block; box-shadow: 0 4px 12px rgba(0,53,128,0.25);">
              🔑 Log In to ASTU Portal
            </a>
          </div>

          <p style="font-size: 13px; color: #64748b; margin-top: 20px;">Or copy and paste this link into your browser:<br/>
            <a href="${loginUrl}" style="color: #003580; word-break: break-all;">${loginUrl}</a>
          </p>

          <p style="margin-top: 20px;">For security purposes, please ensure that you change this temporary password immediately after logging in for the first time.</p>
          <p>We are thrilled to have you on board!</p>
          <br/>
          <p style="margin-bottom: 0;">Best regards,<br/><strong>ASTU Management System Team</strong></p>
        </div>
      </div>
    `;
    console.log(`\n================================`);
    console.log(`[USER PROVISIONED CREDENTIALS] Email: ${email} | Password: ${temporaryPassword} | Role: ${role}`);
    console.log(`================================\n`);

    return this.sendMail({ to: email, subject, text, html });
  }

  async sendEmployerRegistrationPending(email: string, companyName: string) {
    const subject = 'ASTU Employer Registration Submitted';
    const text = `Your employer registration for ${companyName} has been submitted and is pending admin approval.`;
    const html = `<p>Hello,</p><p>Your employer registration for <strong>${companyName}</strong> has been submitted successfully.</p><p>It is currently pending admin approval.</p>`;
    return this.sendMail({ to: email, subject, text, html });
  }

  async sendJobAlert(emails: string[], jobTitle: string, companyName: string, jobId: string) {
    if (emails.length === 0) return;
    const subject = `New Job Alert: ${jobTitle} at ${companyName}`;
    const text = `A new job matching your profile has been posted: ${jobTitle} at ${companyName}. Login to ASTU AMS to view and apply.`;
    const html = `<p>Hello,</p><p>A new job has been posted that might interest you:</p><h3>${jobTitle} at ${companyName}</h3><p>Login to ASTU AMS to view the details and apply.</p>`;
    // Send bulk by passing an array to "bcc". Bcc is better for privacy.
    return this.sendMail({ to: env.SMTP_FROM, bcc: emails, subject, text, html, from: env.SMTP_FROM });
  }

  async sendEventNotification(emails: string[], eventTitle: string, eventDate: Date, location: string) {
    if (emails.length === 0) return;
    const subject = `Upcoming ASTU Event: ${eventTitle}`;
    const dateStr = eventDate.toLocaleDateString();
    const text = `You are invited to ${eventTitle} on ${dateStr} at ${location}. Login to ASTU AMS to RSVP.`;
    const html = `<p>Hello,</p><p>You are invited to an upcoming ASTU Alumni event:</p><h3>${eventTitle}</h3><p><strong>Date:</strong> ${dateStr}<br/><strong>Location:</strong> ${location}</p><p>Login to ASTU AMS to RSVP.</p>`;
    // Use bcc for bulk send
    return this.sendMail({ to: env.SMTP_FROM, bcc: emails, subject, text, html, from: env.SMTP_FROM });
  }

  async sendSurveyReminder(email: string, surveyTitle: string, dueDate: Date) {
    const subject = `Reminder: Pending ASTU Survey - ${surveyTitle}`;
    const text = `Please complete the survey "${surveyTitle}" by ${dueDate.toLocaleDateString()}. Your feedback is important to us.`;
    const html = `<p>Hello,</p><p>This is a reminder to complete the pending survey: <strong>${surveyTitle}</strong>.</p><p>It is due by <strong>${dueDate.toLocaleDateString()}</strong>.</p><p>Your feedback is vital to ASTU. Please login to ASTU AMS to complete it.</p>`;
    return this.sendMail({ to: email, subject, text, html });
  }

  async sendGenericNotification(
    email: string,
    subject: string,
    message: string,
    extra?: { imageUrl?: string; ctaLink?: string; ctaText?: string; priority?: string; category?: string }
  ) {
    const bannerHtml = extra?.imageUrl
      ? `<div style="text-align: center; margin-bottom: 24px;"><img src="${extra.imageUrl}" alt="Notification Banner" style="max-width: 100%; border-radius: 10px; max-height: 280px; object-fit: cover; box-shadow: 0 2px 8px rgba(0,0,0,0.08);" /></div>`
      : '';

    const priorityBadge = extra?.priority
      ? `<span style="background-color: ${extra.priority === 'Urgent' ? '#fef2f2' : extra.priority === 'High' ? '#fff7ed' : '#f0f9ff'}; color: ${extra.priority === 'Urgent' ? '#991b1b' : extra.priority === 'High' ? '#c2410c' : '#0369a1'}; border: 1px solid ${extra.priority === 'Urgent' ? '#fecaca' : extra.priority === 'High' ? '#ffedd5' : '#e0f2fe'}; font-size: 11px; font-weight: 700; text-transform: uppercase; padding: 4px 10px; border-radius: 12px; display: inline-block; margin-right: 8px;">${extra.priority} Priority</span>`
      : '';

    const categoryBadge = extra?.category
      ? `<span style="background-color: #f8fafc; color: #475569; border: 1px solid #e2e8f0; font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 12px; display: inline-block;">${extra.category}</span>`
      : '';

    const badgesHtml = (priorityBadge || categoryBadge)
      ? `<div style="margin-bottom: 16px;">${priorityBadge}${categoryBadge}</div>`
      : '';

    const ctaHtml = extra?.ctaLink
      ? `
        <div style="text-align: center; margin: 28px 0;">
          <a href="${extra.ctaLink}" target="_blank" style="background-color: #003580; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block; box-shadow: 0 4px 12px rgba(0,53,128,0.25); letter-spacing: 0.3px;">
            ${extra.ctaText || 'View Details on ASTU Portal'}
          </a>
        </div>
      `
      : `
        <div style="text-align: center; margin: 24px 0;">
          <a href="${env.FRONTEND_URL || 'http://localhost:5173'}" target="_blank" style="background-color: #003580; color: #ffffff; padding: 12px 26px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 13px; display: inline-block; shadow: 0 2px 8px rgba(0,53,128,0.15);">
            Open ASTU AMS Portal
          </a>
        </div>
      `;

    const html = `
      <div style="font-family: 'Segoe UI', Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.6; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background-color: #ffffff; box-shadow: 0 4px 16px rgba(0,0,0,0.04);">
        <div style="background: linear-gradient(135deg, #003580 0%, #002254 100%); color: #ffffff; padding: 28px 24px; text-align: center;">
          <h2 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 800; letter-spacing: 0.5px;">ASTU Official Broadcast</h2>
          <p style="margin: 6px 0 0 0; color: #93c5fd; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 700;">Adama Science & Technology University</p>
        </div>
        <div style="padding: 28px 24px;">
          ${bannerHtml}
          ${badgesHtml}
          <h3 style="color: #003580; margin-top: 0; font-size: 18px; font-weight: 700; border-bottom: 2px solid #f1f5f9; padding-bottom: 12px; leading-height: 1.4;">${subject}</h3>
          <div style="font-size: 14px; color: #334155; line-height: 1.7; white-space: pre-wrap; margin: 18px 0;">${message}</div>
          ${ctaHtml}
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 28px 0 18px 0;" />
          <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0; line-height: 1.5;">
            This is an automated broadcast from the official <strong>ASTU Alumni Management System</strong>.<br/>
            Adama Science & Technology University &copy; 2026. All rights reserved.
          </p>
        </div>
      </div>
    `;

    return this.sendMail({ to: email, subject, text: message, html });
  }

  async sendAccountActivatedEmail(email: string, role: string) {
    const subject = 'Your ASTU Management System Account is Now Active';
    const text = `Dear User,\n\nWelcome to the Adama Science and Technology University (ASTU) Management System.\n\nYour account has been verified and activated by an administrator. You can now log in and access your ${role} dashboard.\n\nWe are thrilled to have you on board!\n\nBest regards,\nASTU Management System Team`;
    const html = `
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
        <h2 style="color: #003366;">Account Activated</h2>
        <p>Dear User,</p>
        <p>Welcome to the Adama Science and Technology University (ASTU) Management System.</p>
        <p>We are pleased to inform you that your account has been verified and activated by an administrator.</p>
        <p>You can now log in and access your <strong>${role}</strong> dashboard.</p>
        <p>We are thrilled to have you on board!</p>
        <br/>
        <p>Best regards,<br/><strong>ASTU Management System Team</strong></p>
      </div>
    `;
    return this.sendMail({ to: email, subject, text, html });
  }

  async sendDirectMessageNotification(toEmail: string, recipientName: string, senderName: string, messageSnippet: string) {
    const subject = `New Message from ${senderName} on ASTU Alumni Portal`;
    const text = `Hello ${recipientName},\n\n${senderName} has sent you a message on ASTU Alumni Portal:\n\n"${messageSnippet}"\n\nPlease log in to your portal to view and reply.\n\nBest regards,\nASTU Alumni Portal Team`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #003366; padding: 20px; text-align: center; color: #ffffff;">
          <h2 style="margin: 0; font-size: 20px;">ASTU Alumni Messenger</h2>
        </div>
        <div style="padding: 24px; color: #333333;">
          <p style="font-size: 15px;">Hello <strong>${recipientName}</strong>,</p>
          <p style="font-size: 14px;"><strong>${senderName}</strong> is messaged u login and reply on the ASTU Alumni Portal.</p>
          <div style="background-color: #f5f7fa; border-left: 4px solid #003366; padding: 14px; margin: 18px 0; font-style: italic; border-radius: 4px;">
            "${messageSnippet}"
          </div>
          <div style="text-align: center; margin-top: 24px;">
            <a href="http://localhost:5173" style="background-color: #003366; color: #ffffff; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 8px; display: inline-block;">Log in & Reply</a>
          </div>
        </div>
      </div>
    `;

    console.log(`\n================================`);
    console.log(`[EMAIL DISPATCH] Alert sent to ${toEmail} from ${senderName}: "${messageSnippet}"`);
    console.log(`================================\n`);

    try {
      return await this.sendMail({ to: toEmail, subject, text, html });
    } catch (e) {
      console.warn('Email send warning (SMTP fallback active):', e);
      return null;
    }
  }
}
