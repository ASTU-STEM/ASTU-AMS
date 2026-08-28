import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  DATABASE_URL: z.string().url(),
  JWT_ACCESS_SECRET: z.string().min(8),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_SECRET: z.string().min(8),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),
  REGISTRAR_API_URL: z.string().url().default('https://registrar.astu.edu.et/api/v1'),
  REGISTRAR_API_KEY: z.string().default('astu_ams_registrar_secret_sync_key'),
  DIDIT_API_URL: z.string().url().default('https://api.didit.me/v1'),
  DIDIT_API_KEY: z.string().default('didit_api_key_here'),
  SMTP_HOST: z.string().default('smtp.mailtrap.io'),
  SMTP_PORT: z.coerce.number().default(2525),
  SMTP_USER: z.string().default('mock_user'),
  SMTP_PASS: z.string().default('mock_password'),
  SMTP_FROM: z.string().email().default('no-reply@astu.edu.et'),
  MAX_FILE_SIZE: z.coerce.number().default(5242880), // 5MB
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
