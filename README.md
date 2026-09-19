# CATALYX V20 — Final Production Release
## Global Intelligence, Simulation, Coordination & Autonomous Execution Platform

![CATALYX V20 Status](https://img.shields.io/badge/Release-V20.0.0--final-emerald.svg)
![Build](https://img.shields.io/badge/Build-Passing-brightgreen.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)
![React](https://img.shields.io/badge/React-19-cyan.svg)
![Express](https://img.shields.io/badge/Backend-Express%204.21-indigo.svg)
![Security](https://img.shields.io/badge/AI%20Action%20Firewall-8%20Stages%20Active-purple.svg)
![Ledger](https://img.shields.io/badge/Financial%20Ledger-Double--Entry%20Minor%20Units-amber.svg)

---

### Executive Overview

**CATALYX V20** represents the definitive, certified production release of the CATALYX platform. This release transforms the cumulative capabilities built across milestones V1 through V19 into a hardened, verified, and audited operational system.

All speculative, unverified, and redundant prototype layers have been eliminated or hardened into production-grade infrastructure:
- **Zero Regressions**: All 19 prior release milestones (V1 through V19) are preserved and unified in navigation and service execution.
- **Dual-Tier Production Topology**: High-performance React 19 SPA served via a hardened Node 22 / Express backend bundled into a single self-contained CommonJS artifact (`dist/server.cjs`).
- **Bounded Autonomous Intelligence**: 11 enterprise workforce personas and V19 planetary agent collectives operating under strictly bounded autonomy tiers (L0 Manual to L5 Governed System Autonomy).
- **8-Stage AI Action Firewall**: Every autonomous agent action is subjected to pre-execution syntax validation, prompt injection screening, organizational policy compliance, financial budget gating, blast radius analysis, human digital signatures, execution sandboxing, and immutable logging.
- **Integer Minor Unit Financial Integrity**: All monetary amounts are recorded and calculated in exact integer cents (e.g., $100.00 = 10000), eliminating floating-point rounding drift across billing and double-entry general ledgers.
- **Provider-Agnostic Resiliency**: Dual-mode operations for both AI (official Google GenAI SDK with local heuristic coaching fallback) and database (official Firebase Firestore with high-performance local memory sandbox).

---

### Quick Start (Production Operator)

#### 1. System Requirements
- **Node.js**: `v20.x` or `v22.x` LTS
- **Package Manager**: `npm` v10+
- **Network**: Port `3000` accessible behind reverse proxy

#### 2. Environment Configuration
Copy the documented configuration template:
```bash
cp .env.example .env
```
Populate the environment variables as required:
```env
PORT=3000
NODE_ENV=production
GEMINI_API_KEY=your_gemini_api_key_here
PESAPAL_CONSUMER_KEY=your_pesapal_key
PESAPAL_CONSUMER_SECRET=your_pesapal_secret
PESAPAL_IPN_ID=your_ipn_id
PESAPAL_ENVIRONMENT=sandbox # or live
```

#### 3. Build Application
```bash
npm run build
```
This executes:
1. `vite build` — Compiles the client SPA into `/dist` with tree-shaking and asset hashing.
2. `esbuild server.ts` — Bundles the backend into `/dist/server.cjs` with sourcemaps and externalized node dependencies.

#### 4. Launch Production Server
```bash
npm start
```
The server will bind to `0.0.0.0:3000` and respond to `/api/health` and `/api/ready`.

---

### Architecture at a Glance

| Layer | Technology | Primary Function |
| :--- | :--- | :--- |
| **Client Frontend** | React 19, TypeScript, Tailwind CSS v4, Lucide Icons | Single-page enterprise command console, 3D visualization, interactive dashboards, real-time feedback |
| **Edge Server** | Node.js 22 LTS, Express 4.21, Vite Middleware (Dev) | API routing, security headers, rate limiting, request validation, static asset serving |
| **Intelligence Engine** | `@google/genai` TypeScript SDK + Local Heuristic Model | Planetary intelligence synthesis, multi-agent coaching, causal analysis, Monte Carlo simulation |
| **Safety Firewall** | CATALYX 8-Stage Action Firewall | Pre-execution safety inspection, prompt injection quarantine, blast-radius containment |
| **Persistence Layer** | Firebase Firestore (Cloud) + Local Memory Store (Sandbox) | Multi-tenant partitioned data, user profiles, mission cases, immutable ledger blocks |
| **Financial Engine** | Pesapal v3 OAuth + Double-Entry General Ledger | Cryptographically signed IPN webhook ingestion, minor unit ledger reconciliation |

---

### Standard Health & Readiness Probes

CATALYX V20 provides standardized health probes for container orchestration (Kubernetes, Cloud Run):

- **Liveness Probe**: `GET /api/health`
  - Returns `HTTP 200` with uptime, Node version, memory usage, and release version.
- **Readiness Probe**: `GET /api/ready`
  - Returns `HTTP 200` if memory thresholds are safe and emergency halt is inactive (`HTTP 503` if degraded).
- **Certification Dossier**: `GET /api/v20/certification`
  - Returns the machine-readable JSON certification report, acceptance gates, and scorecards.

---

### Documentation Suite

| Document | Purpose |
| :--- | :--- |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Complete end-to-end system architecture, component topology, and data flows |
| [SECURITY.md](./SECURITY.md) | Threat model, defense-in-depth, security headers, rate limiting, and vulnerability handling |
| [AI_GOVERNANCE.md](./AI_GOVERNANCE.md) | Epistemic truth classification, model provenance, and hallucination containment |
| [AGENT_SAFETY.md](./AGENT_SAFETY.md) | 8-Stage Action Firewall, autonomy tiers (L0–L5), and emergency stop mechanics |
| [API_REFERENCE.md](./API_REFERENCE.md) | Complete documentation of all REST API routes, schemas, and response formats |
| [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) | Collection schemas, indexing rules, and Firestore security rules |
| [PAYMENTS_AND_PESAPAL.md](./PAYMENTS_AND_PESAPAL.md) | Billing architecture, Pesapal v3 IPN webhook validation, and minor-unit ledger |
| [MARKETPLACE_AND_SANDBOX.md](./MARKETPLACE_AND_SANDBOX.md) | Developer cloud sandbox, plugin safety, and marketplace monetization rules |
| [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) | Step-by-step production deployment procedures for Cloud Run and container runtimes |
| [OPERATIONS_RUNBOOK.md](./OPERATIONS_RUNBOOK.md) | Daily operations, telemetry monitoring, maintenance checklists, and smoke tests |
| [DISASTER_RECOVERY.md](./DISASTER_RECOVERY.md) | RTO/RPO targets, backup procedures, snapshot restores, and regional failover |
| [INCIDENT_RESPONSE.md](./INCIDENT_RESPONSE.md) | Severity levels (SEV-1 to SEV-4), on-call protocols, and post-mortem procedures |
| [PRODUCTION_RELEASE_NOTES_V20.md](./PRODUCTION_RELEASE_NOTES_V20.md) | Comprehensive V20 changelog, acceptance gates audit, and certification sign-off |

---

### License & Compliance
CATALYX is licensed under proprietary enterprise software terms. Certified compliant with V20 Production Readiness Gates.
