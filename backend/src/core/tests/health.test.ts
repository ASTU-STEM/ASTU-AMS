import request from 'supertest';
import app from '../../app';
import { CircuitBreaker, CircuitState } from '../resilience/CircuitBreaker';
import { CacheService } from '../cache/cacheService';
import { QueueEngine } from '../jobs/QueueEngine';

describe('ASTU-AMS Enterprise Infrastructure & Health Tests', () => {

  test('GET /health/live returns 200 ALIVE status', async () => {
    const res = await request(app).get('/health/live');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ALIVE');
    expect(res.body.pid).toBeDefined();
  });

  test('GET /health/ready returns 200 READY status with DB & Queue dependencies', async () => {
    const res = await request(app).get('/health/ready');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('READY');
    expect(res.body.dependencies).toBeDefined();
  });

  test('GET /health/database returns 200 HEALTHY DB status', async () => {
    const res = await request(app).get('/health/database');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('HEALTHY');
  });

  test('CircuitBreaker transitions between CLOSED, OPEN, and HALF_OPEN correctly', async () => {
    const breaker = new CircuitBreaker('TestService', {
      failureThreshold: 2,
      resetTimeoutMs: 100,
      timeoutMs: 1000,
    });

    expect(breaker.getState()).toBe(CircuitState.CLOSED);

    // Cause 2 failures to trip circuit
    await expect(breaker.execute(async () => { throw new Error('Simulated Failure 1'); })).rejects.toThrow();
    await expect(breaker.execute(async () => { throw new Error('Simulated Failure 2'); })).rejects.toThrow();

    expect(breaker.getState()).toBe(CircuitState.OPEN);

    // Wait for reset timeout
    await new Promise((resolve) => setTimeout(resolve, 150));

    // State should become HALF_OPEN
    expect(breaker.getState()).toBe(CircuitState.HALF_OPEN);

    // Successful execution resets circuit to CLOSED
    const result = await breaker.execute(async () => 'success');
    expect(result).toBe('success');
    expect(breaker.getState()).toBe(CircuitState.CLOSED);
  });

  test('CacheService getOrSet stores and retrieves items accurately', async () => {
    const testKey = `test_key_${Date.now()}`;
    const value = await CacheService.getOrSet(testKey, async () => ({ foo: 'bar' }), 60);

    expect(value).toEqual({ foo: 'bar' });
    const cached = await CacheService.get(testKey);
    expect(cached).toEqual({ foo: 'bar' });
  });

  test('QueueEngine enqueues and processes jobs via registered handler', async () => {
    let processed = false;
    QueueEngine.registerHandler('test.job', async (payload: { msg: string }) => {
      if (payload.msg === 'hello') processed = true;
    });

    const jobId = await QueueEngine.enqueue('test.job', { msg: 'hello' }, 'CRITICAL');
    expect(jobId).toBeDefined();

    // Wait for async queue loop
    await new Promise((resolve) => setTimeout(resolve, 2500));
    expect(processed).toBe(true);
  });
});
