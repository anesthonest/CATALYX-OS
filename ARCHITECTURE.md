# CATALYX V20 System Architecture Specification
## Planetary-Scale Intelligence, Simulation, Coordination & Autonomous Execution Platform

### 1. Architectural Philosophy & Guiding Principles

CATALYX V20 is engineered around five fundamental axioms:
1. **Repository Reality as Truth**: Specifications, schemas, and runtime code reflect identical data structures. There are no placeholder stubs or simulated mocks pretending to be real integrations.
2. **Server-Authoritative Enforcement**: Frontend controls provide operator experience, but authorization, billing validation, and action firewalls are enforced server-side.
3. **Epistemic Truth Demarcation**: All intelligence outputs are explicitly labeled with their epistemic category (`OBSERVED`, `INFERRED`, `PREDICTED`, `SIMULATED`, `HYPOTHETICAL`) to eliminate unverified machine assumptions.
4. **Deterministic Financial Integrity**: Money is calculated exclusively in integer minor currency units (cents) across all storage and arithmetic operations.
5. **Fail-Safe Containment**: Autonomous agents operate within bounded autonomy tiers (L0 to L5) and cannot execute irreversible mutations without cryptographic multi-stage approval.

---

### 2. High-Level Component Topology

```
+-------------------------------------------------------------------------------+
|                             CLIENT TIER (React 19)                            |
|  +-----------------------+ +------------------------+ +--------------------+  |
|  | Executive Dashboard   | | Planetary Twin & Sim   | | Multi-Agent Matrix |  |
|  +-----------------------+ +------------------------+ +--------------------+  |
|  | V20 Certification Tab | | Financial Ledger & Pay | | AI Action Firewall |  |
|  +-----------------------+ +------------------------+ +--------------------+  |
+---------------------------------------+---------------------------------------+
                                        | HTTPS / JSON RPC (Port 3000)
                                        v
+-------------------------------------------------------------------------------+
|                             SERVER TIER (Node 22 / Express 4)                 |
|  [Security Headers] [Sliding-Window Rate Limiter] [Global Error Masker]       |
|                                                                               |
|  +-------------------+  +--------------------+  +--------------------------+  |
|  | /health & /ready  |  | /api/coach-chat    |  | /api/v19/firewall/submit |  |
|  +-------------------+  +--------------------+  +--------------------------+  |
|  | /api/pesapal/*    |  | /api/v19/emergency |  | /api/v20/certification   |  |
|  +-------------------+  +--------------------+  +--------------------------+  |
+---------------------------------------+---------------------------------------+
                    |                                       |
                    v                                       v
+---------------------------------------+   +-----------------------------------+
|      AI INTELLIGENCE FABRIC           |   |      PERSISTENCE & RECONCILIATION |
|  - @google/genai SDK (Gemini 2.5)     |   |  - Firebase Firestore (Multi-Org) |
|  - Local Heuristic Coaching Engine    |   |  - Double-Entry General Ledger    |
|  - Monte Carlo 10,000 Sim Engine      |   |  - Pesapal v3 OAuth & Webhooks    |
|  - Causal Graph DAG Analyzer          |   |  - SHA-256 Audit Trail Chaining   |
+---------------------------------------+   +-----------------------------------+
```

---

### 3. Module & Subsystem Boundaries

#### 3.1 Client Tier (`src/`)
- **Main Shell (`App.tsx`)**: Orchestrates unified authentication, organization context, modal palettes, and responsive multi-group sidebar navigation.
- **Component Modules (`src/components/`)**:
  - `ProductionCertificationV20Tab.tsx`: The primary V20 command and certification console.
  - `PlanetaryIntelligenceFabricV19Tab.tsx`: Universal world model, digital twins, and simulation laboratory.
  - `GlobalEcosystemOperatingSystemV18Tab.tsx`: Cross-organizational coordination, workflow marketplace, and capability matching.
  - `GlobalAutonomousIntelligenceNetworkV17Tab.tsx`: Multi-agent collectives and federated governance.
  - `AutonomousEnterpriseNetworkV13Tab.tsx`, `FinancialReconciliationTab.tsx`, etc.: Preserved historical operational consoles.
- **Data & Logic Services (`src/services/`)**: Encapsulates data fetching, business logic, validation, and deterministic simulation algorithms.

#### 3.2 Server Tier (`server.ts`)
- **Ingress Layer**: Binds to `0.0.0.0:3000`. Configures `nosniff`, `SAMEORIGIN`, CSP/Permission policies, and sliding-window rate limiters.
- **Health Probes**: `/api/health` (liveness) and `/api/ready` (readiness).
- **Gemini AI Router**: Interacts with the `@google/genai` SDK when `GEMINI_API_KEY` is present; falls back to deterministic multi-agent heuristics if unconfigured.
- **Billing & Webhook Ingress**: Validates Pesapal IPN signatures, enforces idempotency keys, and records credits into integer-cents ledger blocks.
- **Emergency Tripwire**: Hosts the cryptographically sealed master halt switch.

---

### 4. Data Flow & Mutation Pipeline

```
[Agent Action Initiated]
          |
          v
[1. Syntax & Schema Validation]  ---> [Malformed: Drop & Alert]
          |
          v
[2. Prompt Injection & Jailbreak Screen] ---> [Flagged: Quarantine Action]
          |
          v
[3. Organizational Policy Verification] ---> [Policy Breach: Reject]
          |
          v
[4. Financial Budget Constraints]  ---> [Exceeds Limit: Block Action]
          |
          v
[5. Blast-Radius Boundary Check] ---> [Exceeds Blast Scope: Block]
          |
          v
[6. Human Commander Signature]   ---> [Signature Required: Await 2FA/Key]
          |
          v
[7. Isolated Execution Sandbox]
          |
          v
[8. Double-Entry Immutable Ledger Block] ---> [Committed to Database]
```

---

### 5. Dual-Mode Deployment Strategy
CATALYX is designed to achieve 100% functional availability across both local sandbox environments and enterprise cloud clusters:

| Component | Standard Cloud Mode | Isolated / Air-Gapped Mode |
| :--- | :--- | :--- |
| **Authentication** | Firebase Auth (Google Identity / Email 2FA) | Cryptographic local session tokens with role claims |
| **Database** | Google Cloud Firestore (Multi-region) | High-Performance In-Memory Structured Storage |
| **Generative AI** | Google Gemini 2.5 Flash / Pro via SDK | Deterministic Multi-Agent Heuristic Reasoning Engine |
| **Billing** | Pesapal v3 OAuth / Mobile Money / Cards | Local Verified Currency Transaction Mock with SHA-256 |

---

### 6. CATALYX V24 Universal Navigation, Sharing & Link-Integrity Architecture

#### 6.1 The 9-Domain Canonical Topology
V24 organizes every enterprise capability across exactly nine canonical domains, eliminating navigation sprawl:
1. **Home (`home`)**: Executive Command Center, role lenses, priority queue, activity stream.
2. **Work (`work`)**: Planner, tasks, worker accountability center, presentations studio, media studio, demos & prototypes sandbox.
3. **Workspace (`workspace`)**: Team coordination, member roles, workspace channels, live document editor.
4. **Communications (`comms`)**: Omnichannel social inbox (WhatsApp, Messenger, Email, SMS) and unified video/voice meetings.
5. **Commerce (`commerce`)**: Integer-minor-unit ledger, order lifecycle, CRM, and catalog.
6. **Intelligence (`intel`)**: Planetary simulation fabric, autonomous matrix, ecosystem OS, model registry, live research sandbox.
7. **Integrations (`integrations`)**: Honest connector fabric, health telemetry, and webhook triggers.
8. **Security & Governance (`governance`)**: AI safety firewall, prompt injection quarantine, L0-L5 autonomy gates.
9. **Admin & Certification (`admin`)**: Role-based access control, system settings, activity logs, and V24 Certification Suite.

#### 6.2 Cryptographic Sharing & Link-Integrity Layer
- **`universalShareService`**: Generates opaque base64url HMAC-signed tokens (`cx_v24_...`) for all artifacts (tasks, files, presentations, media, demos, meetings). Supports granular access tiers (`VIEWER`, `COMMENTER`, `EDITOR`), expiration policies (1h, 24h, 7d, 30d, never), optional passwords, and enterprise domain restrictions.
- **`navigationRouterService`**: Provides browser-synchronous deep linking (`?domain=...&tab=...&item=...`), historical navigation stack management (`back()`, `forward()`, `pushRoute()`), and share token resolution (`resolveShareToken()`).
- **`UniversalShareModal`**: Multi-channel sharing modal allowing instant clipboard copy, email composition, QR code verification, role configuration, and live link revocation.
- **`EnterpriseActivityFeed`**: Real-time immutable audit trail capturing every creation, edit, share, and review action across the platform with direct deep navigation.

#### 6.3 Final Production Certification Suite (`V24CertificationView`)
Enforces 12 strict verification gates before declaring platform production readiness:
1. Navigation Hierarchy (9 canonical domains)
2. Zero Dead Buttons (every interactive element has an active handler)
3. Cryptographic Deep Links & Share Tokens
4. Unified Presentation Studio
5. Multimedia Streaming Player
6. Interactive Demos & Prototypes Sandboxes
7. Meetings Scheduler with Task Conversion
8. Universal File Vault & Syntax Highlighting
9. Role-Based Access Control
10. Omnichannel Social Inbox
11. Double-Entry Minor-Unit Financial Ledger
12. AI Safety Firewall & Autonomy Bounds
