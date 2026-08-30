import crypto from 'crypto';

// In-memory store for Email 2FA OTP codes
interface OtpEntry {
  code: string;
  expiresAt: number;
}

const emailOtpStore = new Map<string, OtpEntry>();

export function storeEmail2FAOTP(email: string, code: string, ttlMs: number = 10 * 60 * 1000) {
  const normalizedEmail = email.toLowerCase().trim();
  emailOtpStore.set(normalizedEmail, {
    code: code.trim(),
    expiresAt: Date.now() + ttlMs,
  });
}

export function verifyEmail2FAOTP(email: string, code: string): boolean {
  const normalizedEmail = email.toLowerCase().trim();
  const entry = emailOtpStore.get(normalizedEmail);
  if (!entry) return false;

  if (Date.now() > entry.expiresAt) {
    emailOtpStore.delete(normalizedEmail);
    return false;
  }

  const isValid = entry.code === code.trim();
  if (isValid) {
    emailOtpStore.delete(normalizedEmail); // One-time use
  }
  return isValid;
}

// RFC 6238 Base32 Decoder
function base32Decode(base32: string): Buffer {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = '';
  let hex = '';
  const clean = base32.toUpperCase().replace(/=+$/, '').replace(/[^A-Z2-7]/g, '');

  for (let i = 0; i < clean.length; i++) {
    const val = alphabet.indexOf(clean.charAt(i));
    if (val < 0) continue;
    bits += val.toString(2).padStart(5, '0');
  }

  for (let i = 0; i + 4 <= bits.length; i += 4) {
    const chunk = bits.substring(i, i + 4);
    hex += parseInt(chunk, 2).toString(16);
  }

  return Buffer.from(hex, 'hex');
}

// RFC 6238 TOTP Authenticator Code Verification (Google Authenticator / Authy)
export function verifyTOTP(token: string, secret: string = 'ASTU2FASECRET367', window: number = 1): boolean {
  try {
    const cleanToken = token.trim();
    if (!/^\d{6}$/.test(cleanToken)) return false;

    const key = base32Decode(secret);
    const epoch = Math.floor(Date.now() / 1000);
    const currentStep = Math.floor(epoch / 30);

    for (let i = -window; i <= window; i++) {
      const step = currentStep + i;
      const buf = Buffer.alloc(8);
      buf.writeBigInt64BE(BigInt(step));

      const hmac = crypto.createHmac('sha1', key).update(buf).digest();
      const offset = hmac[hmac.length - 1] & 0xf;
      const code = ((hmac[offset] & 0x7f) << 24) |
                   ((hmac[offset + 1] & 0xff) << 16) |
                   ((hmac[offset + 2] & 0xff) << 8) |
                   (hmac[offset + 3] & 0xff);

      const generatedToken = (code % 1000000).toString().padStart(6, '0');
      if (generatedToken === cleanToken) {
        return true;
      }
    }
    return false;
  } catch (err) {
    return false;
  }
}
