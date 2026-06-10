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

  async sendMail(options: MailOptions) {
    const message = {
      from: options.from || env.SMTP_FROM,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
      bcc: options.bcc,
    };

    const info = await this.transporter.sendMail(message);
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

  async sendTemporaryPassword(email: string, temporaryPassword: string, role: string) {
    const subject = 'ASTU Account Credentials';
    const text = `Your ${role} account has been created. Your temporary password is: ${temporaryPassword}. Please change your password after first login.`;
    const html = `<p>Hello,</p><p>Your ${role} account has been created successfully.</p><p>Your temporary password is: <strong>${temporaryPassword}</strong></p><p>Please change your password after first login.</p>`;
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

  async sendGenericNotification(email: string, subject: string, message: string) {
    const html = `<p>Hello,</p><p>${message}</p><p>Login to ASTU AMS for more details.</p>`;
    return this.sendMail({ to: email, subject, text: message, html });
  }
}
