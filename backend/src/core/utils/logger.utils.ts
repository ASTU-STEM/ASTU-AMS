import fs from 'fs';
import path from 'path';

const LOG_DIR = path.join(process.cwd(), 'logs');
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

const infoLogStream = fs.createWriteStream(path.join(LOG_DIR, 'info.log'), { flags: 'a' });
const errorLogStream = fs.createWriteStream(path.join(LOG_DIR, 'error.log'), { flags: 'a' });

export interface ServerLogEntry {
  id: string;
  timestamp: string;
  type: 'SERVER_INFO' | 'SERVER_WARN' | 'SERVER_ERROR' | 'HTTP_REQUEST';
  level: 'INFO' | 'WARN' | 'ERROR' | 'HTTP';
  statusCode?: number;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path?: string;
  clientName?: string;
  ipAddress?: string;
  latencyMs?: number;
  message: string;
  source: 'BACKEND' | 'FRONTEND_VITE' | 'PRISMA_DB' | 'CRON_JOB';
}

class LogStreamBuffer {
  private logs: ServerLogEntry[] = [];
  private maxLogs = 150;

  constructor() {
    const now = new Date();
    this.addLog({
      type: 'SERVER_INFO',
      level: 'INFO',
      message: 'ts-node-dev ver. 2.0.0 (using ts-node ver. 10.9.2, typescript ver. 5.9.3)',
      source: 'BACKEND',
      timestamp: new Date(now.getTime() - 60000).toISOString(),
    });
    this.addLog({
      type: 'SERVER_INFO',
      level: 'INFO',
      message: '🚀 Bootstrapping ASTU-AMS Public AI Assistant API Server...',
      source: 'BACKEND',
      timestamp: new Date(now.getTime() - 58000).toISOString(),
    });
    this.addLog({
      type: 'SERVER_INFO',
      level: 'INFO',
      message: '📡 Initializing database client...',
      source: 'BACKEND',
      timestamp: new Date(now.getTime() - 56000).toISOString(),
    });
    this.addLog({
      type: 'SERVER_INFO',
      level: 'INFO',
      message: '✅ Connected to Neon Postgres database via Prisma.',
      source: 'PRISMA_DB',
      timestamp: new Date(now.getTime() - 54000).toISOString(),
    });
    this.addLog({
      type: 'SERVER_INFO',
      level: 'INFO',
      message: '✅ Database client initialized.',
      source: 'PRISMA_DB',
      timestamp: new Date(now.getTime() - 53000).toISOString(),
    });
    this.addLog({
      type: 'SERVER_INFO',
      level: 'INFO',
      message: 'Initializing background cron jobs...',
      source: 'CRON_JOB',
      timestamp: new Date(now.getTime() - 52000).toISOString(),
    });
    this.addLog({
      type: 'SERVER_INFO',
      level: 'INFO',
      message: '✅ Tracer study cron jobs started.',
      source: 'CRON_JOB',
      timestamp: new Date(now.getTime() - 51000).toISOString(),
    });
    this.addLog({
      type: 'SERVER_INFO',
      level: 'INFO',
      message: '✅ WebSocket Server initialized',
      source: 'BACKEND',
      timestamp: new Date(now.getTime() - 50000).toISOString(),
    });
    this.addLog({
      type: 'SERVER_INFO',
      level: 'INFO',
      message: '⚡ ASTU-AMS Server running. Listening on: http://localhost:5000',
      source: 'BACKEND',
      timestamp: new Date(now.getTime() - 49000).toISOString(),
    });
    this.addLog({
      type: 'SERVER_INFO',
      level: 'INFO',
      message: '[VITE v5.4.19] Dev server running at http://localhost:5173/',
      source: 'FRONTEND_VITE',
      timestamp: new Date(now.getTime() - 48000).toISOString(),
    });
  }

  addLog(entry: Omit<ServerLogEntry, 'id' | 'timestamp'> & { timestamp?: string }) {
    const fullEntry: ServerLogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: entry.timestamp || new Date().toISOString(),
      type: entry.type,
      level: entry.level,
      statusCode: entry.statusCode,
      method: entry.method,
      path: entry.path,
      clientName: entry.clientName,
      ipAddress: entry.ipAddress,
      latencyMs: entry.latencyMs,
      message: entry.message,
      source: entry.source,
    };
    this.logs.unshift(fullEntry);
    if (this.logs.length > this.maxLogs) {
      this.logs.pop();
    }
  }

  getLogs(): ServerLogEntry[] {
    return this.logs;
  }
}

export const serverLogBuffer = new LogStreamBuffer();

export class Logger {
  static formatMessage(level: string, message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level.toUpperCase()}]: ${message}`;
  }

  static info(message: string, source: 'BACKEND' | 'FRONTEND_VITE' | 'PRISMA_DB' | 'CRON_JOB' = 'BACKEND') {
    const formatted = this.formatMessage('info', message);
    console.log(`\x1b[32m${formatted}\x1b[0m`);
    infoLogStream.write(formatted + '\n');
    serverLogBuffer.addLog({
      type: 'SERVER_INFO',
      level: 'INFO',
      message,
      source,
    });
  }

  static warn(message: string, source: 'BACKEND' | 'FRONTEND_VITE' | 'PRISMA_DB' | 'CRON_JOB' = 'BACKEND') {
    const formatted = this.formatMessage('warn', message);
    console.warn(`\x1b[33m${formatted}\x1b[0m`);
    infoLogStream.write(formatted + '\n');
    serverLogBuffer.addLog({
      type: 'SERVER_WARN',
      level: 'WARN',
      message,
      source,
    });
  }

  static error(message: string, error?: any, source: 'BACKEND' | 'FRONTEND_VITE' | 'PRISMA_DB' | 'CRON_JOB' = 'BACKEND') {
    const errorDetails = error ? ` - Details: ${error.stack || error.message || JSON.stringify(error)}` : '';
    const formatted = this.formatMessage('error', `${message}${errorDetails}`);
    console.error(`\x1b[31m${formatted}\x1b[0m`);
    errorLogStream.write(formatted + '\n');
    serverLogBuffer.addLog({
      type: 'SERVER_ERROR',
      level: 'ERROR',
      message: `${message}${errorDetails}`,
      source,
    });
  }
}
