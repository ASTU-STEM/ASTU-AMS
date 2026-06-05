import nodemailer from 'nodemailer';
import { env } from '../config/env';

export interface MailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
  from?: string;
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
    };

    const info = await this.transporter.sendMail(message);
    return info;
  }

  async sendVerificationCode(email: string, code: string, studentId: string) {
    const subject = 'ASTU Alumni Verification Code';
    const text = `Your verification code for student ID ${studentId} is ${code}. It expires in 15 minutes.`;
    const html = `<p>Hello,</p><p>Your verification code for student ID <strong>${studentId}</strong> is <strong>${code}</strong>.</p><p>This code expires in 15 minutes.</p><p>If you did not request this code, please ignore this email.</p>`;
    return this.sendMail({ to: email, subject, text, html });
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
}
