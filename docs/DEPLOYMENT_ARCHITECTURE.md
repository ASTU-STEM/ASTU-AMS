# ASTU-AMS — DEPLOYMENT ARCHITECTURE

**System Component**: Adama Science and Technology University (ASTU) Alumni Management System  
**Deployment Infrastructure**: Docker Multi-Stage Containers, NGINX Reverse Proxy, PostgreSQL, Redis, S3 Object Storage  
**Deployment Strategy**: Zero-Downtime Blue-Green / Rolling Deployment

---

## 1. DOCKER MULTI-STAGE BUILD SPECIFICATION

### Backend Dockerfile (`backend/Dockerfile`)
```dockerfile
# Stage 1: Build & Dependencies
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

# Stage 2: Production Execution
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
USER node

COPY --chown=node:node package*.json ./
RUN npm ci --only=production
COPY --chown=node:node --from=builder /app/dist ./dist
COPY --chown=node:node --from=builder /app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 5000
CMD ["node", "dist/app.js"]
```

---

## 2. PRODUCTION DOCKER COMPOSE TOPOLOGY

```yaml
version: '3.8'

services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - api1
      - api2

  api1:
    build: ./backend
    environment:
      - PORT=5000
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
    restart: always

  api2:
    build: ./backend
    environment:
      - PORT=5000
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
    restart: always

  worker:
    build: ./backend
    command: node dist/worker.js
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
    restart: always
```
