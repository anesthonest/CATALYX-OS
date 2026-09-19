# CATALYX V20 Production Deployment Guide
## Step-by-Step Production Setup for Google Cloud Run, Docker, and Kubernetes

### 1. Deployment Constraints & Infrastructure
- **Ingress Port**: Must bind to port `3000` (mapped via reverse proxy or Cloud Run port definition).
- **Runtime**: Node.js `22.x` LTS.
- **Artifact**: Self-contained `dist/server.cjs` and static bundle `dist/`.

---

### 2. Standard Production Build Pipeline

```bash
# 1. Clean build cache and verify dependencies
npm ci

# 2. Execute strict type check and lint verification
npm run lint

# 3. Compile frontend bundle & backend CommonJS bundle
npm run build

# 4. Verify compilation output
ls -lh dist/
# Output must include:
# - dist/index.html
# - dist/assets/*.js
# - dist/server.cjs
```

---

### 3. Containerization (Dockerfile)

```dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
EXPOSE 3000
USER node
CMD ["node", "dist/server.cjs"]
```

---

### 4. Health Checks in Container Orchestration

- **Kubernetes Liveness Probe**:
  ```yaml
  livenessProbe:
    httpGet:
      path: /api/health
      port: 3000
    initialDelaySeconds: 10
    periodSeconds: 15
  ```
- **Kubernetes Readiness Probe**:
  ```yaml
  readinessProbe:
    httpGet:
      path: /api/ready
      port: 3000
    initialDelaySeconds: 5
    periodSeconds: 10
  ```
