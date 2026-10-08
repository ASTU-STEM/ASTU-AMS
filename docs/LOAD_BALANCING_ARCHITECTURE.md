# ASTU-AMS — LOAD BALANCING ARCHITECTURE

**System Component**: Adama Science and Technology University (ASTU) Alumni Management System  
**Document Purpose**: Enterprise High Availability & Load Balancer Topology Specification  
**Target Infrastructure**: Multi-Instance Node.js API, NGINX Reverse Proxy, AWS Application Load Balancer / Cloudflare Edge WAF

---

## 1. TRAFFIC FLOW ARCHITECTURE

```
                      +-----------------------------+
                      | Client Request (HTTPS/WSS)  |
                      +--------------+--------------+
                                     |
                                     v
                      +-----------------------------+
                      |  Cloudflare Edge WAF / CDN  |
                      |  (DDoS / SSL / Geo-Filter)  |
                      +--------------+--------------+
                                     |
                                     v
                      +-----------------------------+
                      | NGINX Reverse Proxy / ALB   |
                      | (Round Robin / Least Conn)  |
                      +--------------+--------------+
                                     |
               +---------------------+---------------------+
               |                     |                     |
               v                     v                     v
        +--------------+      +--------------+      +--------------+
        |  API Node 1  |      |  API Node 2  |      |  API Node 3  |
        | (Port 5000)  |      | (Port 5000)  |      | (Port 5000)  |
        +--------------+      +--------------+      +--------------+
```

---

## 2. LOAD BALANCER CONFIGURATION (NGINX EXAMPLE)

```nginx
upstream astu_ams_backend {
    least_conn;
    server 10.0.1.10:5000 max_fails=3 fail_timeout=10s;
    server 10.0.1.11:5000 max_fails=3 fail_timeout=10s;
    server 10.0.1.12:5000 max_fails=3 fail_timeout=10s;
    keepalive 32;
}

server {
    listen 443 ssl http2;
    server_name ams.astu.edu.et;

    ssl_certificate /etc/ssl/certs/astu_ams_bundle.crt;
    ssl_certificate_key /etc/ssl/certs/astu_ams_private.key;
    ssl_protocols TLSv1.2 TLSv1.3;

    # Dynamic HTTP Compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml;

    location /api/ {
        proxy_pass http://astu_ams_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Request-ID $request_id;
        
        proxy_connect_timeout 5s;
        proxy_read_timeout 60s;
        proxy_send_timeout 60s;
    }

    location /health {
        proxy_pass http://astu_ams_backend/health;
        access_log off;
    }
}
```

---

## 3. HEALTH CHECK SPECIFICATION

The load balancer relies on three standardized probes exposed by ASTU-AMS:

| Endpoint | Probe Type | Check Logic | Success Code | Frequency | Action on Failure |
| :--- | :--- | :--- | :---: | :---: | :--- |
| `GET /health/live` | **Liveness Probe** | Verifies Node.js process is executing | `200 OK` | Every 5s | Restart container instance |
| `GET /health/ready` | **Readiness Probe** | Verifies Database & Redis connectivity | `200 OK` | Every 10s | Remove node from LB pool |
| `GET /health/database` | **Deep Probe** | Evaluates query execution latency | `200 OK` | Every 30s | Trigger alert notification |

---

## 4. STICKY SESSIONS & DISTRIBUTED RATE LIMITING

1. **Sticky Session Avoidance**:
   - ASTU-AMS uses stateless JWT tokens. Load balancers do **NOT** require sticky sessions (`cookie-based affinity`).
   - Requests from any client can be routed to any API node without losing auth state.

2. **Distributed Rate Limiting**:
   - Rate limiting is tracked centrally in Redis (`sliding-window rate limiter`).
   - Rate limit quotas are enforced uniformly across all API node instances.

---

## 5. CONNECTION DRAINING & GRACEFUL SHUTDOWN

When a server node is marked for deployment update or termination:

1. Load balancer removes the target IP from active routing tables.
2. Node receives `SIGTERM` signal.
3. Express server stops accepting new incoming TCP connections.
4. Active requests are allowed up to 15 seconds to complete.
5. Database and Redis connection pools are flushed cleanly before process exit.
