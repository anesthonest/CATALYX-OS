# CATALYX V20 Database & Storage Architecture
## Firestore Collections, Relational Models, and Security Rules

### 1. Firestore Database Schema

CATALYX utilizes Google Cloud Firestore with strict multi-tenant collection structuring:

```
/organizations/{orgId}
    |-- /members/{userId}
    |-- /tasks/{taskId}
    |-- /missions/{missionId}
    |-- /workflows/{workflowId}
    |-- /worldEntities/{entityId}
    |-- /digitalTwins/{twinId}
    |-- /simulationScenarios/{scenarioId}
    |-- /claimNodes/{claimId}
    |-- /immutableLedger/{blockId}
    |-- /firewallRecords/{recordId}
    |-- /emergencyControls/masterState
```

---

### 2. Core Entity Schemas

#### 2.1 Immutable Ledger Block (`immutableLedger`)
```typescript
interface ImmutableLedgerEntry {
  blockId: string;
  blockNumber: number;
  timestamp: string;
  organizationId: string;
  transactionType: 'CREDIT' | 'DEBIT' | 'FEE_ESCROW' | 'PAYOUT' | 'REVERSAL';
  amountMinorUnits: number; // e.g. 5000 = $50.00 (Integer, No Float)
  currency: 'USD' | 'EUR' | 'KES';
  accountDebit: string;
  accountCredit: string;
  parentHash: string; // SHA-256 of preceding block
  currentHash: string; // SHA-256(parentHash + payload)
  authorizedOfficerSignature: string;
  idempotencyKey: string;
}
```

#### 2.2 Planetary World Entity (`worldEntities`)
```typescript
interface UniversalWorldEntity {
  entityId: string;
  category: 'PHYSICAL' | 'INFRASTRUCTURE' | 'RESOURCE' | 'ORGANIZATION';
  name: string;
  temporalState: string;
  geographicState: string;
  dependencies: string[];
  confidencePct: number;
  provenance: {
    source: string;
    timestamp: string;
    method: string;
  };
  freshnessMinutes: number;
  epistemicStatus: 'OBSERVED' | 'INFERRED' | 'PREDICTED' | 'SIMULATED';
}
```

---

### 3. Firestore Security Rules Summary

The production `firestore.rules` enforces:
1. **Tenant Isolation**: Users may only read or write documents where `resource.data.organizationId == request.auth.token.organizationId`.
2. **Immutable Ledger Append-Only**: Documents in `immutableLedger` cannot be modified or deleted once created (`allow update, delete: if false;`).
3. **Emergency Controls**: Only users with the custom claim `role == 'SUPER_ADMIN'` may write to `/emergencyControls/masterState`.
