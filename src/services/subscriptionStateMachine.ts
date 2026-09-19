import { SubscriptionStatus, Subscription } from '../types';
import { GovernanceService } from './governanceService';

// Deterministic valid transition graph
const VALID_TRANSITIONS: Record<SubscriptionStatus, SubscriptionStatus[]> = {
  trial: ['active', 'expired', 'cancelled'],
  payment_pending: ['active', 'past_due', 'expired', 'cancelled'],
  active: ['past_due', 'cancelled', 'payment_pending'],
  past_due: ['active', 'grace_period', 'expired', 'cancelled'],
  grace_period: ['active', 'expired', 'cancelled'],
  expired: ['active', 'payment_pending'],
  cancelled: ['active', 'payment_pending'],
};

export class SubscriptionStateMachine {
  /**
   * Validate if a state transition is legally permissible
   */
  public static canTransition(current: SubscriptionStatus, next: SubscriptionStatus): boolean {
    if (current === next) return true;
    const allowed = VALID_TRANSITIONS[current];
    return Boolean(allowed && allowed.includes(next));
  }

  /**
   * Execute state transition with deterministic audit validation
   */
  public static transition(
    subscription: Subscription,
    nextStatus: SubscriptionStatus,
    reason: string,
    actorId: string,
    actorName: string
  ): { success: boolean; error?: string; subscription: Subscription } {
    const current = subscription.status;

    if (!this.canTransition(current, nextStatus)) {
      const errMsg = `Illegal subscription state transition attempted from '${current.toUpperCase()}' to '${nextStatus.toUpperCase()}'. Allowed transitions: ${VALID_TRANSITIONS[current]?.join(', ') || 'none'}.`;
      console.error(`[SUBSCRIPTION STATE MACHINE REJECTED]`, errMsg);

      GovernanceService.addAuditLog({
        id: `audit_sub_viol_${Date.now()}`,
        organizationId: subscription.organizationId,
        actorId,
        actorName,
        actorRole: 'system',
        action: 'SUBSCRIPTION_STATE_TRANSITION_VIOLATION',
        resourceType: 'subscription',
        resourceId: subscription.id,
        outcome: 'denied',
        details: { fromState: current, attemptedState: nextStatus, reason },
        timestamp: new Date().toISOString(),
      });

      return { success: false, error: errMsg, subscription };
    }

    // Apply deterministic transition
    const previousState = subscription.status;
    subscription.status = nextStatus;
    subscription.updatedAt = new Date().toISOString();

    // If active, reset grace or past due flags
    if (nextStatus === 'active') {
      subscription.lastPaymentDate = new Date().toISOString();
    }

    // Log immutable state transition audit entry
    GovernanceService.addAuditLog({
      id: `audit_sub_state_${Date.now()}`,
      organizationId: subscription.organizationId,
      actorId,
      actorName,
      actorRole: 'billing_engine',
      action: 'SUBSCRIPTION_STATE_TRANSITION',
      resourceType: 'subscription',
      resourceId: subscription.id,
      outcome: 'success',
      details: {
        fromState: previousState,
        toState: nextStatus,
        tier: subscription.tier,
        currency: subscription.currency,
        reason,
      },
      timestamp: new Date().toISOString(),
    });

    return { success: true, subscription };
  }
}
