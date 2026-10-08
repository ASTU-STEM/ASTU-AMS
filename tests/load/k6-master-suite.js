import http from 'k6/http';
import { check, sleep, group } from 'k6';

export const options = {
  scenarios: {
    // 1. Baseline Load Test (1,000 Users)
    baseline_load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 500 },  // Ramp to 500 users
        { duration: '5m', target: 1000 }, // Sustained baseline load
        { duration: '2m', target: 0 },    // Ramp down
      ],
      gracefulStop: '30s',
    },
    // 2. Stress Load Test (5,000 Users)
    stress_load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '3m', target: 2500 }, // Ramp to target stress
        { duration: '5m', target: 5000 }, // Sustained 5,000 active users
        { duration: '2m', target: 0 },
      ],
      startTime: '10m', // Execute after baseline
      gracefulStop: '30s',
    },
    // 3. Spike Burst Test (10,000 Users)
    spike_burst: {
      executor: 'ramping-arrival-rate',
      startRate: 100,
      timeUnit: '1s',
      preAllocatedVUs: 1000,
      maxVUs: 10000,
      stages: [
        { duration: '30s', target: 1000 }, // Sudden surge to 1,000 req/sec
        { duration: '2m', target: 1000 },  // Sustained burst
        { duration: '30s', target: 100 },  // Drop back
      ],
      startTime: '21m',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<500'], // P95 latency must remain under 500ms
    http_req_failed: ['rate<0.01'],   // Errors must remain under 1%
  },
};

export default function () {
  const BASE_URL = 'http://localhost:5000/api';

  group('01. Health Probes', function () {
    const res = http.get(`${BASE_URL}/health/live`);
    check(res, { 'liveness 200 OK': (r) => r.status === 200 });

    const resReady = http.get(`${BASE_URL}/health/ready`);
    check(resReady, { 'readiness 200 OK': (r) => r.status === 200 });
  });

  group('02. Public Job Board Feed', function () {
    const res = http.get(`${BASE_URL}/jobs?page=1&limit=20`);
    check(res, { 'jobs feed status 200': (r) => r.status === 200 });
  });

  group('03. Department Analytics Overview', function () {
    const res = http.get(`${BASE_URL}/departments/dept-com/dashboard-overview`);
    check(res, { 'department overview 200': (r) => r.status === 200 });
  });

  sleep(1);
}
