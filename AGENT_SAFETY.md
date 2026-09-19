# CATALYX V20 Agent Safety & Autonomous Action Firewall
## Autonomy Tiers (L0–L5), Action Guardrails, and Master Emergency Halt

### 1. The Bounded Autonomy Framework (L0 to L5)

CATALYX structures autonomous agent authority into six distinct tiers:

| Tier | Name | Description | Human Involvement | Permitted Actions |
| :--- | :--- | :--- | :--- | :--- |
| **L0** | Manual Observation | Read-only access to signals, dashboards, and metrics. | 100% human-directed | No mutations allowed. |
| **L1** | Assisted Guidance | System suggests actions, draft plans, and optimizations. | Human must initiate and execute. | Information synthesis and notifications. |
| **L2** | Supervised Delegation | Agent executes bounded sub-tasks with human approval. | Human signs off on every mutation. | Low-risk database updates, draft emails. |
| **L3** | Conditional Task Autonomy | Agent executes within pre-approved parameters and budgets. | Human reviews exceptions or budget overruns. | Workflow steps under $100 budget cap. |
| **L4** | High Autonomous Coordination | Agent collectives coordinate multi-step workflows. | Human oversees strategic goals and vetoes. | Cross-department mission orchestration. |
| **L5** | Governed System Autonomy | Multi-agent autonomous optimization within strict bounds. | Human retains emergency master halt authority. | Dynamic load balancing, resource allocation. |

---

### 2. The 8-Stage AI Action Firewall

Every autonomous agent tool invocation must sequentially pass through the 8-Stage Action Firewall before affecting any database, network, or physical gateway:

```
[Agent Action Request]
       |
  [STAGE 1] Syntax & Schema Validation (Strict JSON Type Checking)
       |
  [STAGE 2] Prompt Injection & Jailbreak Filtering
       |
  [STAGE 3] Organizational Policy Compliance (Tenant Boundaries, RBAC)
       |
  [STAGE 4] Budget & Rate Limit Constraints (Integer Minor Currency Units)
       |
  [STAGE 5] Blast-Radius Boundary Calculation (Max entities affected <= 5)
       |
  [STAGE 6] Human Commander Digital Signature (Mandatory for high-impact actions)
       |
  [STAGE 7] Ephemeral Execution Sandboxing (Dry-run verification)
       |
  [STAGE 8] Double-Entry Immutable Ledger Logging (SHA-256 Chaining)
       |
  [Execution Finalized]
```

---

### 3. Master Emergency Halt Controls

In the event of an operational anomaly, rogue collective behavior, or external security threat, any authorized commander can invoke the Master Emergency Halt:

- **Endpoint**: `POST /api/v19/emergency-control`
- **Payload**:
  ```json
  {
    "halt": true,
    "reason": "Suspected anomalous agent behavior in logistics collective",
    "authorizedOfficer": "Commander Jane Doe (USR-9912)"
  }
  ```
- **Consequences**:
  1. All active AI calls and tool loops are frozen immediately.
  2. Outbound webhooks, connectors, and payment processing are halted.
  3. A cryptographic SHA-256 seal is generated and recorded to the immutable ledger.
  4. System enters read-only audit mode until authorized two-party recovery is performed.
