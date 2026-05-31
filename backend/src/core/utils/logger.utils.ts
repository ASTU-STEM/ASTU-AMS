import fs from 'fs';
import path from 'path';

const LOG_DIR = path.join(process.cwd(), 'logs');
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

const infoLogStream = fs.createWriteStream(path.join(LOG_DIR, 'info.log'), { flags: 'a' });
const errorLogStream = fs.createWriteStream(path.join(LOG_DIR, 'error.log'), { flags: 'a' });

export class Logger {
  static formatMessage(level: string, message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level.toUpperCase()}]: ${message}`;
  }

  static info(message: string) {
    const formatted = this.formatMessage('info', message);
    console.log(`\x1b[32m${formatted}\x1b[0m`);
    infoLogStream.write(formatted + '\n');
  }

  static warn(message: string) {
    const formatted = this.formatMessage('warn', message);
    console.warn(`\x1b[33m${formatted}\x1b[0m`);
    infoLogStream.write(formatted + '\n');
  }

  static error(message: string, error?: any) {
    const errorDetails = error ? ` - Details: ${error.stack || error.message || JSON.stringify(error)}` : '';
    const formatted = this.formatMessage('error', `${message}${errorDetails}`);
    console.error(`\x1b[31m${formatted}\x1b[0m`);
    errorLogStream.write(formatted + '\n');
  }
}
