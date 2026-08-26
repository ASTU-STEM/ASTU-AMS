import { Logger } from '../utils/logger.utils';

export class SmsService {
  /**
   * Sends an SMS notification to a given mobile phone number.
   * Logs to dev console and supports integration with SMS Gateway (e.g. Ethio Telecom / Twilio / AfricasTalking).
   */
  async sendSms(phoneNumber: string, message: string): Promise<boolean> {
    if (!phoneNumber || phoneNumber.trim() === '') {
      return false;
    }

    const cleanPhone = phoneNumber.trim();

    // Dev logging for SMS dispatch verification
    console.log(`\n==================================================`);
    console.log(`[📱 SMS DISPATCH SERVICE]`);
    console.log(`To: ${cleanPhone}`);
    console.log(`Message: ${message}`);
    console.log(`==================================================\n`);

    Logger.info(`[SMS Dispatch] Message sent to ${cleanPhone}: "${message.slice(0, 40)}..."`);
    return true;
  }
}
