# CATALYX V20 Operational Runbook
## Daily Operator Procedures, Telemetry Monitoring, and Smoke Verification

### 1. Pre-Flight Checklist Before Release Sign-Off
- [x] Runtime verified as Node 22 LTS.
- [x] Ingress reverse proxy routes port 3000 to application container.
- [x] Environment secrets (`GEMINI_API_KEY`, `PESAPAL_*`, `VITE_FIREBASE_*`) validated.
- [x] Static SPA files present in `/dist` and backend compiled into `/dist/server.cjs`.
- [x] Zero P0 security vulnerabilities or unmasked plaintext secrets.

---

### 2. Automated Smoke Verification Suite

Execute these verification commands sequentially immediately following deployment:

```bash
# Step 1: Check Liveness
curl -fsSL http://localhost:3000/api/health
# Expected: HTTP 200 with status: "healthy"

# Step 2: Check Readiness
curl -fsSL http://localhost:3000/api/ready
# Expected: HTTP 200 with status: "ready" and emergencyHalt: false

# Step 3: Check V20 Certification & Gate Audits
curl -fsSL http://localhost:3000/api/v20/certification
# Expected: HTTP 200 with zeroBlockersCertified: true

# Step 4: Verify Firewall Telemetry
curl -fsSL http://localhost:3000/api/v19/firewall
# Expected: HTTP 200 with array of inspection logs

# Step 5: Verify Ledger Intact
curl -fsSL http://localhost:3000/api/v19/immutable-ledger
# Expected: HTTP 200 with block records calculated in integer minor units
```

---

### 3. Graceful Shutdown & Maintenance Windows
The CATALYX V20 server listens for `SIGTERM` and `SIGINT` signals. Upon receipt:
1. Ingress traffic stops accepting new connections.
2. In-flight API requests are given 10 seconds to drain.
3. System state and correlation logs are cleanly flushed to disk/audit storage.
