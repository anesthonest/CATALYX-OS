import React, { useState } from 'react';
import { 
  ShieldCheck, AlertTriangle, CheckCircle2, XCircle, 
  Clock, DollarSign, FileWarning, Layers, UserCheck 
} from 'lucide-react';
import { HumanApprovalRequest, ApprovalCategory } from '../types';
import { ApprovalsService } from '../services/approvalsService';
import { GovernanceService } from '../services/governanceService';

interface Props {
  orgId: string;
  userEmail: string;
}

export const ApprovalsQueueTab: React.FC<Props> = ({ orgId, userEmail }) => {
  const [approvals, setApprovals] = useState<HumanApprovalRequest[]>(() => 
    ApprovalsService.getApprovals(orgId)
  );
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [decisionNotes, setDecisionNotes] = useState<Record<string, string>>({});

  const filteredApprovals = approvals.filter(a => {
    if (statusFilter === 'all') return true;
    return a.status === statusFilter;
  });

  const handleDecision = (approvalId: string, decision: 'approved' | 'rejected') => {
    const notes = decisionNotes[approvalId] || '';
    const updated = ApprovalsService.reviewApproval(orgId, approvalId, decision, userEmail, notes);
    if (updated) {
      // Log to Immutable Audit Trail
      GovernanceService.logAudit({
        id: `audit_appr_${Date.now()}`,
        organizationId: orgId,
        actorId: userEmail,
        actorName: userEmail.split('@')[0],
        actorRole: 'human_operator',
        action: `HUMAN_APPROVAL_${decision.toUpperCase()}`,
        resourceType: 'APPROVAL_REQUEST',
        resourceId: approvalId,
        outcome: decision === 'approved' ? 'success' : 'denied',
        details: { category: updated.category, notes: updated.decisionNotes },
        timestamp: new Date().toISOString(),
      });

      setApprovals(ApprovalsService.getApprovals(orgId));
    }
  };

  const getCategoryBadge = (category: ApprovalCategory) => {
    const badges: Record<ApprovalCategory, { color: string; label: string }> = {
      financial: { color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', label: 'Financial Action' },
      destructive: { color: 'bg-rose-500/20 text-rose-300 border-rose-500/30', label: 'Destructive Modification' },
      external_commitment: { color: 'bg-purple-500/20 text-purple-300 border-purple-500/30', label: 'External Commitment' },
      legal: { color: 'bg-blue-500/20 text-blue-300 border-blue-500/30', label: 'Legal & Policy' },
      security: { color: 'bg-amber-500/20 text-amber-300 border-amber-500/30', label: 'Security Boundary' },
      workflow_gate: { color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30', label: 'Workflow Gate' },
    };
    const meta = badges[category] || { color: 'bg-white/10 text-gray-300 border-white/20', label: category };
    return (
      <span className={`px-2.5 py-0.5 text-xs font-semibold rounded border ${meta.color}`}>
        {meta.label}
      </span>
    );
  };

  const getImpactBadge = (level: string) => {
    const map: Record<string, string> = {
      critical: 'bg-red-600 text-white',
      high: 'bg-orange-600 text-white',
      medium: 'bg-amber-600 text-white',
      low: 'bg-slate-700 text-gray-200',
    };
    return (
      <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${map[level] || 'bg-slate-700 text-gray-200'}`}>
        {level} Impact
      </span>
    );
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Human-In-The-Loop Governance
            </span>
            <span className="text-xs text-gray-400 font-medium">Zero Un-Gated Financial / Destructive Actions</span>
          </div>
          <h2 className="text-2xl font-bold text-white mt-1">Autonomous Actions Approvals Queue</h2>
          <p className="text-sm text-gray-400">
            Mandatory human authorization checkpoint for financial commitments, policy shifts, and destructive modifications.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex bg-slate-900/80 p-1 rounded-xl border border-white/10 text-sm">
          {(['pending', 'approved', 'rejected', 'all'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-lg font-medium transition capitalize cursor-pointer ${
                statusFilter === tab
                  ? 'bg-brand-purple text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab} ({approvals.filter(a => tab === 'all' || a.status === tab).length})
            </button>
          ))}
        </div>
      </div>

      {/* Approvals List */}
      <div className="space-y-4">
        {filteredApprovals.length === 0 ? (
          <div className="p-12 text-center text-gray-400 bg-slate-900/40 rounded-xl border border-white/10">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <p className="font-semibold text-white">No {statusFilter} approvals in the queue</p>
            <p className="text-xs text-gray-400">All autonomous system actions are within policy boundaries.</p>
          </div>
        ) : (
          filteredApprovals.map(req => {
            const isPending = req.status === 'pending';

            return (
              <div
                key={req.id}
                className={`p-6 rounded-xl border bg-slate-900/60 backdrop-blur-md shadow-lg transition space-y-4 ${
                  isPending ? 'border-amber-500/40 ring-1 ring-amber-500/20' : 'border-white/10'
                }`}
              >
                {/* Top bar: Category + Impact + Timestamp */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {getCategoryBadge(req.category)}
                    {getImpactBadge(req.impactLevel)}
                    <span className="text-xs text-gray-400">
                      Requested by <strong className="text-brand-cyan">{req.requesterName}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{new Date(req.createdAt).toLocaleString()}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ml-2 ${
                      req.status === 'approved' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : req.status === 'rejected' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {req.status}
                    </span>
                  </div>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="text-base font-bold text-white">{req.title}</h3>
                  <p className="text-sm text-gray-300 mt-1 leading-relaxed">{req.description}</p>
                </div>

                {/* Structured Payload Context */}
                {req.payload && Object.keys(req.payload).length > 0 && (
                  <div className="p-3 bg-slate-950/70 rounded-lg border border-white/10 font-mono text-xs text-gray-300">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Payload Parameters:</span>
                    <pre className="overflow-x-auto whitespace-pre-wrap">{JSON.stringify(req.payload, null, 2)}</pre>
                  </div>
                )}

                {/* Review Notes or Action Input */}
                {isPending ? (
                  <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row items-center gap-3">
                    <input
                      type="text"
                      placeholder="Optional compliance / decision notes..."
                      value={decisionNotes[req.id] || ''}
                      onChange={e => setDecisionNotes({ ...decisionNotes, [req.id]: e.target.value })}
                      className="flex-1 px-3 py-2 border border-white/10 bg-slate-950/80 text-white rounded-lg text-xs focus:outline-none focus:border-brand-cyan w-full"
                    />

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      <button
                        onClick={() => handleDecision(req.id, 'rejected')}
                        className="px-4 py-2 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-semibold hover:bg-rose-500/30 transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Reject Action
                      </button>

                      <button
                        onClick={() => handleDecision(req.id, 'approved')}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-500 transition flex items-center gap-1.5 shadow-md cursor-pointer"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Authorize & Execute
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-gray-400">
                    <span>
                      Reviewed by <strong className="text-brand-cyan">{req.reviewedBy}</strong> at {new Date(req.reviewedAt || '').toLocaleTimeString()}
                    </span>
                    {req.decisionNotes && (
                      <span className="italic text-gray-300">"{req.decisionNotes}"</span>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
