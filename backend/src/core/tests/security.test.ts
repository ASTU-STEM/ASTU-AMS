import request from 'supertest';
import app from '../../app';
import { validateOutboundEgressUrl } from '../security/owaspSecurityEngine';

describe('ASTU-AMS Automated Security & OWASP Protection Tests', () => {

  test('WAF Inspector rejects SQL Injection payloads (HTTP 403)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: "' OR '1'='1", password: "' OR '1'='1" });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('OWASP_SECURITY_BLOCK');
  });

  test('WAF Inspector rejects Script Injection / XSS payloads (HTTP 403)', async () => {
    const res = await request(app)
      .post('/api/support')
      .send({ fullName: 'Hacker', message: '<script>alert("XSS")</script>' });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('OWASP_SECURITY_BLOCK');
  });

  test('SSRF Egress Guard blocks private RFC-1918 loopback & internal IPs', async () => {
    expect(() => validateOutboundEgressUrl('http://127.0.0.1/admin')).toThrow('SSRF Block');
    expect(() => validateOutboundEgressUrl('http://10.0.0.1/secret')).toThrow('SSRF Block');
    expect(() => validateOutboundEgressUrl('http://169.254.169.254/latest/meta-data')).toThrow('SSRF Block');
  });

  test('SSRF Egress Guard permits valid public HTTPS URLs', async () => {
    expect(() => validateOutboundEgressUrl('https://astualumni.getastuye.com/api')).not.toThrow();
  });

  test('Rate Limiter enforces 429 Too Many Requests after rate limit breach', async () => {
    // Send repeated requests to rate limited endpoint
    const promises = Array.from({ length: 12 }).map(() =>
      request(app).post('/api/auth/send-2fa-otp').send({ email: 'test@astu.edu.et' })
    );

    const responses = await Promise.all(promises);
    const rateLimitedResponse = responses.find((r) => r.status === 429);
    expect(rateLimitedResponse).toBeDefined();
    expect(rateLimitedResponse?.body.error.code).toBe('RATE_LIMITED');
  });
});
