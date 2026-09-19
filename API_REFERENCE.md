# CATALYX V20 REST API Specification
## Standard Endpoints, Payloads, Response Schemas, and Status Codes

All API endpoints are prefixed with `/api/` and operate over standard JSON.

---

### 1. System Diagnostics & Probes

#### 1.1 Liveness Probe
- **Path**: `GET /api/health`
- **Description**: Verifies that the Node.js process and HTTP server are responsive.
- **Response `200 OK`**:
  ```json
  {
    "status": "healthy",
    "release": "CATALYX V20 FINAL PRODUCTION RELEASE",
    "version": "20.0.0-final",
    "timestamp": "2026-09-07T12:00:00.000Z",
    "uptimeSeconds": 1420,
    "system": {
      "node": "v22.13.0",
      "platform": "linux",
      "memory": {
        "rssMB": 128,
        "heapTotalMB": 85,
        "heapUsedMB": 62
      }
    },
    "usingRealGemini": true
  }
  ```

#### 1.2 Readiness Probe
- **Path**: `GET /api/ready`
- **Description**: Used by container ingress/load balancers to determine traffic readiness.
- **Response `200 OK`**:
  ```json
  {
    "status": "ready",
    "release": "CATALYX V20 FINAL PRODUCTION RELEASE",
    "version": "20.0.0-final",
    "timestamp": "2026-09-07T12:00:00.000Z",
    "checks": {
      "server": "healthy",
      "aiProvider": "live_gemini_connected",
      "emergencyHalt": false,
      "memorySafety": "pass",
      "heapUsedMB": 62,
      "servicesActive": 28
    }
  }
  ```

---

### 2. V20 Production Certification & Audit Dossier

- **Path**: `GET /api/v20/certification`
- **Description**: Returns the authoritative V20 production readiness scorecard, 22 acceptance gate audits, and operational runbooks.
- **Response `200 OK`**:
  ```json
  {
    "releaseId": "CATALYX-V20.0.0-FINAL-PRODUCTION",
    "releaseName": "CATALYX V20 FINAL PRODUCTION RELEASE",
    "subtitle": "GLOBAL INTELLIGENCE, SIMULATION, COORDINATION & AUTONOMOUS EXECUTION PLATFORM",
    "certifiedAt": "2026-09-07T19:30:00Z",
    "finalDecision": "READY WITH DOCUMENTED CONFIGURATION REQUIREMENTS",
    "zeroBlockersCertified": true,
    "scorecards": [...],
    "subsystemAudits": [...],
    "acceptanceChecks": [...],
    "runbook": {...}
  }
  ```

---

### 3. AI Coach & Multi-Agent Operations

- **Path**: `POST /api/coach-chat`
- **Description**: Dispatches user or agent prompts to the Gemini GenAI model or heuristic fallback.
- **Request Body**:
  ```json
  {
    "userId": "usr_executive_1",
    "message": "Synthesize planetary supply chain disruption risk for Q4.",
    "agentId": "agent_execution_intel",
    "history": []
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "reply": "Analysis indicates key lithography nodes in East Asia face 12% energy cost escalation...",
    "source": "Gemini 2.5 Flash Grounded Inference",
    "timestamp": "2026-09-07T12:05:00.000Z"
  }
  ```

---

### 4. AI Action Firewall Submission

- **Path**: `POST /api/v19/firewall/submit`
- **Description**: Validates an agent-initiated action through the 8-stage firewall.
- **Request Body**:
  ```json
  {
    "agentId": "agent_procurement_bot",
    "targetSubsystem": "FINANCIAL_LEDGER",
    "actionPayload": "Transfer 5000 USD to supplier Fab-9",
    "costMinorUnits": 500000,
    "blastRadiusEntitiesCount": 2
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "recordId": "afw_1725712800000_abc",
    "approvalVerdict": "PENDING_HUMAN_SIGNATURE",
    "reason": "Cost exceeds automatic threshold ($500.00). Requires commander digital signature.",
    "inspectionStages": {
      "syntaxValidated": true,
      "promptInjectionClean": true,
      "policyCompliant": true,
      "budgetApproved": false,
      "blastRadiusAcceptable": true,
      "humanSignatureGranted": false,
      "executionSandboxed": true,
      "immutableLogStored": true
    }
  }
  ```

---

### 5. Master Emergency Control

- **Path**: `GET /api/v19/emergency-control`
- **Path**: `POST /api/v19/emergency-control`
- **Description**: Reads or toggles the platform-wide emergency halt switch.
