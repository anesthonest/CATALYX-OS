# CATALYX V20 Payments & Pesapal v3 Integration Architecture
## Provider Abstraction, Integer Minor Units, Webhook Verification, and Ledger Settlement

### 1. Payment Philosophy & Money Invariants

In CATALYX V20:
1. **Zero Floating-Point Math**: All financial representations are stored and manipulated as integers representing minor currency units (e.g., cents: $10.50 is stored as `1050`).
2. **Server-Side Authorization**: The frontend client cannot grant credits or mark transactions paid.
3. **Cryptographic Webhook Verification**: IPN (Instant Payment Notification) payloads from Pesapal must pass HMAC-SHA256 signature verification and idempotency checks before any balance is incremented.

---

### 2. Pesapal v3 OAuth & Transaction Flow

```
[User Initiates Payment in UI]
             |
             v
[Server: POST /api/pesapal/submit-order]
  1. Acquire/refresh OAuth token with Pesapal Auth Server.
  2. Create order payload with integer minor units & unique merchant reference.
  3. Register IPN Notification URL.
  4. Return redirect URL / iframe token to client.
             |
             v
[User Completes Payment at Pesapal Gateway (Card / Mobile Money)]
             |
             v
[Pesapal Ingress: Webhook Callback to /api/pesapal/ipn]
  1. Read OrderTrackingId and OrderMerchantReference.
  2. Query Pesapal GET /api/Transactions/GetTransactionStatus.
  3. Verify signature and ensure status == 'COMPLETED'.
  4. Check Idempotency Table (ensure notification has not been processed).
  5. Atomically commit credit entry into Immutable General Ledger.
  6. Return HTTP 200 to Pesapal with acknowledgement.
```

---

### 3. Required Production Environment Variables

```env
# Pesapal v3 Credentials
PESAPAL_CONSUMER_KEY=your_live_pesapal_key
PESAPAL_CONSUMER_SECRET=your_live_pesapal_secret
PESAPAL_IPN_ID=your_registered_ipn_guid
PESAPAL_ENVIRONMENT=live # or 'sandbox' for staging verification
```
