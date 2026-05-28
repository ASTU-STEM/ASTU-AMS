import { env } from '../config/env';

export class EmailService {
  static async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
    // In production, configure nodemailer or third-party service (SES, SendGrid)
    // For local dev, we will log email dispatch clearly to console
    console.log(`
=========================================
📧 EMAIL DISPATCH SIMULATOR
=========================================
From:    ${env.SMTP_FROM}
To:      ${to}
Subject: ${subject}
-----------------------------------------
Body:
${html.replace(/<[^>]*>/g, ' ')}
=========================================
    `);
    return true;
  }

  static async sendActivationEmail(email: string, name: string, token: string) {
    const activationLink = `http://localhost:3000/activate?token=${token}`;
    const subject = 'ASTU-AMS: Activate Your Alumni Account';
    const html = `
      <h1>Hello, ${name}!</h1>
      <p>Your ASTU Alumni Management System account has been pre-registered from official Registrar records.</p>
      <p>Please click the link below to activate your account and set your password:</p>
      <p><a href="${activationLink}">${activationLink}</a></p>
      <p>If the link doesn't work, copy-paste it into your browser.</p>
    `;
    return this.sendEmail(email, subject, html);
  }

  static async sendSurveyReminder(email: string, name: string, surveyTitle: string) {
    const surveyLink = `http://localhost:3000/surveys`;
    const subject = `Tracer Study Pending: ${surveyTitle}`;
    const html = `
      <h1>Hello, ${name}!</h1>
      <p>This is a friendly reminder that you have an active tracer study survey waiting for your feedback: <strong>${surveyTitle}</strong>.</p>
      <p>Tracer studies are critical for ASTU's ETA accreditation and curriculum development.</p>
      <p>Complete your survey here: <a href="${surveyLink}">${surveyLink}</a></p>
    `;
    return this.sendEmail(email, subject, html);
  }
}
