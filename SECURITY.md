# CATALYX V20 Security & Threat Model Specification
## Enterprise DevSecOps, Defense-in-Depth, and Incident Prevention

### 1. Threat Model & Security Posture

CATALYX operates in sensitive environments involving mission coordination, multi-agent operations, and financial settlement. The security architecture adheres to zero-trust principles:
1. **Never Trust the Client**: All requests originating from browser sessions are treated as untrusted. State mutations and authorizations are validated server-side.
2. **Never Trust AI Outputs Implicitly**: Outputs from Large Language Models (LLMs) are treated as untrusted inputs to system execution layers.
3. **Never Trust Webhook Payloads**: All incoming payment notifications require cryptographic signature verification and idempotency checking.
4. **Assume Breach & Blast Radius Containment**: Agent actions are quarantined in ephemeral sandboxes with strict minor-unit budget caps.

---

### 2. Defense-in-Depth Controls

#### 2.1 HTTP Production Security Headers
Every HTTP response served by `server.ts` includes the following hardened headers:
- `X-Content-Type-Options: nosniff` — Prevents MIME-sniffing attacks.
- `X-Frame-Options: SAMEORIGIN` — Blocks clickjacking in unauthorized iframes.
- `X-XSS-Protection: 1; mode=block` — Enables legacy browser XSS filters.
- `Referrer-Policy: strict-origin-when-cross-origin` — Protects referral leakage.
- `Permissions-Policy` — Restricts microphone, camera, geolocation, and payment APIs unless explicitly authorized.

#### 2.2 API Rate Limiting & Flood Protection
An in-memory sliding-window rate limiter protects all `/api/*` endpoints:
- **General APIs**: 180 requests per minute per IP address.
- **Excess Traffic Response**: `HTTP 429 Too Many Requests` with standard `Retry-After` header.
- **DDoS Mitigation**: Prevents API exhaustion and automated brute-force attempts on sensitive endpoints.

#### 2.3 Secret Hygiene & Version Control Protection
- **Zero Secrets in Code**: No private keys, consumer secrets, or database tokens are hardcoded into Git.
- **Server-Side Proxy Pattern**: Third-party API keys (e.g., `GEMINI_API_KEY`, `PESAPAL_CONSUMER_SECRET`) remain on the backend and are never exposed via `VITE_` client variables.
- **Documented Variables**: All configuration keys are declared in `.env.example`.

---

### 3. Identity, Authentication & Access Control (RBAC)

#### 3.1 Role Hierarchy
| Role | Identifier | Privileges | Maximum Autonomy Level |
| :--- | :--- | :--- | :--- |
| **Super Admin / Supreme Commander** | `SUPER_ADMIN` | Full platform control, emergency halt toggle, master configuration | L5 (Governed System Autonomy) |
| **Executive / Organization Leader** | `EXECUTIVE` | Cross-department analytics, budget approvals, workforce dispatch | L4 (High Autonomous Coordination) |
| **Mission Commander** | `COMMANDER` | Workflow authoring, simulation runs, agent task assignments | L3 (Conditional Task Autonomy) |
| **Operational Agent / Operator** | `OPERATOR` | Task execution, evidence submission, telemetry viewing | L2 (Assisted Autonomy) |
| **Auditor / Regulatory Observer** | `AUDITOR` | Read-only access to immutable ledgers, firewall records, and reports | L0 (Manual Observation) |

#### 3.2 Tenant Isolation
- Every database entity contains an immutable `tenantId` or `organizationId`.
- Server endpoints verify that the requesting user's session claims match the target resource's `organizationId`.
- Cross-tenant data sharing is prohibited unless cryptographically signed via bilateral agreement.

---

### 4. Vulnerability Disclosure & Patching SLA

If you discover a potential vulnerability in CATALYX, please report it via the documented security contact:
- **Critical (P0)**: Response within 2 hours, hotfix deployed within 12 hours.
- **High (P1)**: Response within 8 hours, remediation within 48 hours.
- **Medium / Low (P2/P3)**: Scheduled in standard maintenance releases.
