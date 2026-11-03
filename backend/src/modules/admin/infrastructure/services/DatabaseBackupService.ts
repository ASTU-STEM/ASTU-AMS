import fs from 'fs';
import path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

export type BackupRecord = {
  date: string;
  size: string;
  status: 'Success' | 'Failed' | 'In Progress';
  file: string;
  format?: 'sql' | 'sql.gz';
  path?: string;
};

const BACKUP_DIR = path.resolve(process.cwd(), 'data', 'backups');

function ensureBackupDir() {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
}

export function getBackupDir() {
  ensureBackupDir();
  return BACKUP_DIR;
}

export function resolveBackupPath(filename: string): string | null {
  if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return null;
  }
  const full = path.join(getBackupDir(), filename);
  if (!full.startsWith(getBackupDir())) return null;
  return full;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function parseDatabaseUrl(rawUrl?: string) {
  const url = rawUrl || process.env.DATABASE_URL || '';
  if (!url || !url.startsWith('postgres')) {
    throw new Error('DATABASE_URL is not a PostgreSQL connection string.');
  }
  const parsed = new URL(url);
  return {
    host: parsed.hostname || 'localhost',
    port: parsed.port || '5432',
    user: decodeURIComponent(parsed.username || ''),
    password: decodeURIComponent(parsed.password || ''),
    database: decodeURIComponent((parsed.pathname || '').replace(/^\//, '')),
  };
}

function pgEnv() {
  const db = parseDatabaseUrl();
  return {
    ...process.env,
    PGPASSWORD: db.password,
    PGHOST: db.host,
    PGPORT: db.port,
    PGUSER: db.user,
    PGDATABASE: db.database,
  };
}

export async function createDatabaseBackup(): Promise<BackupRecord> {
  ensureBackupDir();
  const db = parseDatabaseUrl();
  const now = new Date();
  const isoDate = now.toISOString().split('T')[0];
  const stamp = now.getTime().toString().slice(-6);
  const filename = `backup-${isoDate}-${stamp}.sql`;
  const filePath = path.join(BACKUP_DIR, filename);

  try {
    await execFileAsync(
      'pg_dump',
      [
        '-h', db.host,
        '-p', db.port,
        '-U', db.user,
        '-d', db.database,
        '--no-owner',
        '--no-acl',
        '-F', 'p',
        '-f', filePath,
      ],
      { env: pgEnv(), timeout: 120000 }
    );

    const stats = fs.statSync(filePath);
    return {
      date: now.toLocaleDateString() + ', ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      size: formatBytes(stats.size),
      status: 'Success',
      file: filename,
      format: 'sql',
      path: filePath,
    };
  } catch (error: any) {
    if (fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); } catch { /* ignore */ }
    }
    throw new Error(`pg_dump failed: ${error?.stderr || error?.message || 'unknown error'}`);
  }
}

export async function restoreDatabaseBackup(filename: string): Promise<void> {
  const filePath = resolveBackupPath(filename);
  if (!filePath || !fs.existsSync(filePath)) {
    throw new Error(`Backup file not found: ${filename}`);
  }
  if (!filename.endsWith('.sql')) {
    throw new Error('Only plain SQL dumps (.sql) can be restored from this console.');
  }

  const db = parseDatabaseUrl();
  await execFileAsync(
    'psql',
    [
      '-h', db.host,
      '-p', db.port,
      '-U', db.user,
      '-d', db.database,
      '-v', 'ON_ERROR_STOP=1',
      '-f', filePath,
    ],
    { env: pgEnv(), timeout: 180000 }
  );
}

export function readBackupFile(filename: string): { path: string; size: number } {
  const filePath = resolveBackupPath(filename);
  if (!filePath || !fs.existsSync(filePath)) {
    throw new Error(`Backup file not found on disk: ${filename}`);
  }
  return { path: filePath, size: fs.statSync(filePath).size };
}

/** Keep history entries that still have files on disk; refresh sizes. */
export function reconcileBackupHistory(history: any[]): BackupRecord[] {
  ensureBackupDir();
  const cleaned = (Array.isArray(history) ? history : [])
    .filter((b) => b && b.file && typeof b.file === 'string')
    .filter((b) => {
      if (b.size === '2.4 GB' || (typeof b.date === 'string' && b.date.endsWith('03:00 AM'))) return false;
      if (typeof b.date === 'string' && b.date.includes('2026-05-29')) return false;
      return true;
    })
    .map((b) => {
      const filePath = resolveBackupPath(b.file);
      if (!filePath || !fs.existsSync(filePath)) return null;
      const size = formatBytes(fs.statSync(filePath).size);
      return {
        date: b.date,
        size,
        status: (b.status === 'Failed' || b.status === 'In Progress' ? b.status : 'Success') as BackupRecord['status'],
        file: b.file,
        format: 'sql' as const,
      };
    })
    .filter(Boolean) as BackupRecord[];

  return cleaned;
}
