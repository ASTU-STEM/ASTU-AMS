# ASTU-AMS — LOAD & STRESS TESTING SPECIFICATION

**System Component**: Adama Science and Technology University (ASTU) Alumni Management System  
**Load Test Tool**: Grafana k6 / Artillery  
**Target Scenarios**: Baseline Load (1,000 users) | Stress Load (5,000 users) | Spike Burst (10,000 users)

---

## 1. LOAD TEST SCENARIO SCRIPT (k6 EXAMPLE)

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 500 },  // Ramp-up to 500 users
    { duration: '5m', target: 1000 }, // Sustained baseline load
    { duration: '2m', target: 2500 }, // Ramp to target capacity
    { duration: '1m', target: 5000 }, // Peak stress capacity
    { duration: '3m', target: 0 },    // Ramp-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must finish within 500ms
    http_req_failed: ['rate<0.01'],   // Error rate must be under 1%
  },
};

export default function () {
  const BASE_URL = 'http://localhost:5000/api';

  // 1. Health Probe Check
  const resHealth = http.get(`${BASE_URL}/health`);
  check(resHealth, { 'health status 200': (r) => r.status === 200 });

  // 2. Fetch Public Job Feed
  const resJobs = http.get(`${BASE_URL}/jobs?page=1&limit=20`);
  check(resJobs, { 'jobs feed 200': (r) => r.status === 200 });

  sleep(1);
}
```

---

## 2. SPIKE & SOAK TEST CRITERIA

1. **Spike Testing**:
   - Simulates 10,000 users hitting the system simultaneously following a university graduation announcement or job fair push.
   - Acceptance Criteria: Express WAF and rate limiters gracefully reject excess requests with HTTP 429 without database crash or process memory leak.

2. **Soak Testing**:
   - Executes sustained 1,000 concurrent user load for 12 continuous hours.
   - Acceptance Criteria: Zero memory leaks in Node.js event loop, zero unclosed PostgreSQL pool connections, flat memory utilization curve.
