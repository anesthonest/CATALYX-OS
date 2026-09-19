import React, { useState } from 'react';
import { 
  ShieldAlert, ShieldCheck, AlertOctagon, CheckCircle2, 
  XCircle, Play, DollarSign, Lock, AlertTriangle, RefreshCw 
} from 'lucide-react';
import { AIFirewallService } from '../services/aiFirewallService';
import { UsageMeteringService } from '../services/usageMeteringService';
import { FirewallActionEvaluation, GlobalEmergencySuspension, RiskLevel } from '../types';

interface AISafetyFirewallTabProps {
  organizationId: string;
  currentUserEmail: string;
}

export const AISafetyFirewallTab: React.FC<AISafetyFirewallTabProps> = ({ 
  organizationId, 
  currentUserEmail 
}) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [killswitchReason, setKillswitchReason] = useState('');

  // Simulator test states
  const [simAgent, setSimAgent] = useState('operations');
  const [simAction, setSimAction] = useState('Deploy Hotfix to Kubernetes Cluster');
  const [simSystem, setSimSystem] = useState('AWS Production VPC');
  const [simSpend, setSimSpend] = useState<number>(0);
  const [simDestructive, setSimDestructive] = useState(true);
  const [simResult, setSimResult] = useState<FirewallActionEvaluation | null>(null);

  const killswitch: GlobalEmergencySuspension = AIFirewallService.getGlobalSuspension(organizationId);
  const evaluations: FirewallActionEvaluation[] = AIFirewallService.getEvaluations(organizationId);
  const budget = UsageMeteringService.getBudgetConfig(organizationId);

  const handleToggleKillswitch = () => {
    const nextState = !killswitch.suspended;
    AIFirewallService.setGlobalSuspension(
      organizationId,
      nextState,
      currentUserEmail,
      currentUserEmail.split('@')[0] || 'Admin',
      killswitchReason || (nextState ? 'Emergency Security Mitigation' : 'Operational Resumption')
    );
    setShowConfirmModal(false);
    setKillswitchReason('');
    setRefreshKey(k => k + 1);
  };

  const handleRunSimulation = () => {
    const res = AIFirewallService.evaluateAction({
      organizationId,
      agentId: simAgent,
      agentName: `${simAgent.toUpperCase()} Agent`,
      autonomyLevel: simDestructive ? 2 : 3,
      grantedPermissions: simSpend > 0 ? ['FINANCIAL_ACTION'] : [],
      actionName: simAction,
      targetSystem: simSystem,
      isDestructive: simDestructive,
      financialImpactUsd: simSpend,
      requiresApprovalByConfig: simSpend > 500,
    });
    setSimResult(res);
    setRefreshKey(k => k + 1);
  };

  return (
    <div key={refreshKey} className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">AI Safety Firewall & Commercial Risk Controls</h1>
            <span className="rounded-md bg-indigo-500/10 px-2 py-0.5 text-xs font-semibold text-indigo-400 border border-indigo-500/20">
              Zero-Trust Policy Gate
            </span>
          </div>
          <p className="text-sm text-gray-400 mt-1">
            Enforcing identity, autonomy level boundaries, tenant isolation, and spending limits between AI intent and external execution.
          </p>
        </div>

        <button
          onClick={() => setShowConfirmModal(true)}
          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold shadow-md transition-colors cursor-pointer ${
            killswitch.suspended
              ? 'bg-emerald-600 text-white hover:bg-emerald-500'
              : 'bg-red-600 text-white hover:bg-red-500'
          }`}
        >
          <AlertOctagon className="h-4 w-4" />
          {killswitch.suspended ? 'RESUME AUTONOMOUS EXECUTION' : 'EMERGENCY: SUSPEND AUTONOMY'}
        </button>
      </div>

      {/* Global Emergency Alert Banner if Active */}
      {killswitch.suspended && (
        <div className="rounded-xl border border-red-500/40 bg-red-950/40 p-4 text-red-200 shadow-md flex items-start gap-3">
          <AlertOctagon className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-red-300">GLOBAL AUTONOMOUS EXECUTION SUSPENDED</h3>
            <p className="text-xs text-red-200 mt-1">
              Active Kill-Switch triggered by <strong className="text-white">{killswitch.suspendedBy}</strong> at {new Date(killswitch.suspendedAt || '').toLocaleTimeString()}.
              Reason: &ldquo;{killswitch.reason}&rdquo;. All Level 3 & Level 4 autonomous external actions are actively blocked server-side.
            </p>
          </div>
        </div>
      )}

      {/* Risk Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-white/10 bg-slate-900/60 backdrop-blur-md p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Firewall Status</span>
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-3 text-2xl font-bold text-white">
            {killswitch.suspended ? 'SUSPENDED' : 'ACTIVE ENFORCEMENT'}
          </div>
          <p className="mt-2 text-xs text-gray-400">
            Zero bypass policy active across all 11 agents
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-slate-900/60 backdrop-blur-md p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Daily Spending Cap</span>
            <DollarSign className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="mt-3 text-2xl font-bold text-white">
            ${budget.dailyLimitUsd.toFixed(2)} USD
          </div>
          <p className="mt-2 text-xs text-gray-400">
            Monthly budget ceiling: ${budget.monthlyLimitUsd.toFixed(2)} USD
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-slate-900/60 backdrop-blur-md p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Cutoff Trigger Status</span>
            <AlertTriangle className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-3 text-2xl font-bold text-white">
            {budget.emergencyCutoffTriggered ? 'TRIGGERED' : 'NORMAL'}
          </div>
          <p className="mt-2 text-xs text-gray-400">
            Alert at {budget.alertThresholdPercent}% threshold
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-slate-900/60 backdrop-blur-md p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Evaluations Audited</span>
            <Lock className="h-4 w-4 text-gray-400" />
          </div>
          <div className="mt-3 text-2xl font-bold text-white">
            {evaluations.length}
          </div>
          <p className="mt-2 text-xs text-gray-400">
            Immutable policy evaluation trail
          </p>
        </div>
      </div>

      {/* Live Policy Inspection Simulator */}
      <div className="rounded-xl border border-white/10 bg-slate-900/60 backdrop-blur-md p-6 shadow-lg">
        <div className="border-b border-white/10 pb-4">
          <h2 className="text-base font-semibold text-white">Live Policy Inspection & Safety Gate Simulator</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Test any intended agent action through the multi-layer policy firewall before deployment.
          </p>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-300">Select Autonomous Agent</label>
            <select
              value={simAgent}
              onChange={(e) => setSimAgent(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-white/10 bg-slate-950/70 px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-brand-cyan"
            >
              <option value="operations">Operations Agent (Queue & Deployment)</option>
              <option value="financial">Financial Agent (Treasury & Subscriptions)</option>
              <option value="software_development">Software Engineering Agent</option>
              <option value="sales">Sales & Outreach Agent</option>
              <option value="research">Research & SOC2 Agent</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300">Target System</label>
            <input
              type="text"
              value={simSystem}
              onChange={(e) => setSimSystem(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-white/10 bg-slate-950/70 px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-brand-cyan"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300">Financial Impact (USD)</label>
            <input
              type="number"
              value={simSpend}
              onChange={(e) => setSimSpend(Number(e.target.value))}
              className="mt-1 block w-full rounded-lg border border-white/10 bg-slate-950/70 px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-brand-cyan"
              placeholder="0.00"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-300">Action Name / Directive</label>
            <input
              type="text"
              value={simAction}
              onChange={(e) => setSimAction(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-white/10 bg-slate-950/70 px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-brand-cyan"
            />
          </div>

          <div className="flex items-center gap-4 pt-4">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-300">
              <input
                type="checkbox"
                checked={simDestructive}
                onChange={(e) => setSimDestructive(e.target.checked)}
                className="rounded border-white/20 bg-slate-950 text-indigo-500 focus:ring-brand-cyan"
              />
              Destructive Operation
            </label>

            <button
              onClick={handleRunSimulation}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-purple px-4 py-2 text-xs font-semibold text-white hover:bg-brand-purple/90 transition-colors cursor-pointer shadow-md"
            >
              <Play className="h-3.5 w-3.5" />
              Evaluate Policy Gate
            </button>
          </div>
        </div>

        {/* Evaluation Output */}
        {simResult && (
          <div className={`mt-5 rounded-lg border p-4 ${
            simResult.allowed 
              ? simResult.requiresHumanApproval 
                ? 'border-amber-500/30 bg-amber-950/30 text-amber-200' 
                : 'border-emerald-500/30 bg-emerald-950/30 text-emerald-200' 
              : 'border-red-500/30 bg-red-950/30 text-red-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {simResult.allowed ? (
                  simResult.requiresHumanApproval ? (
                    <AlertTriangle className="h-5 w-5 text-amber-400" />
                  ) : (
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  )
                ) : (
                  <XCircle className="h-5 w-5 text-red-400" />
                )}
                <span className="text-sm font-bold text-white">
                  {simResult.allowed 
                    ? simResult.requiresHumanApproval 
                      ? 'POLICY CONDITIONAL: HUMAN APPROVAL MANDATED' 
                      : 'POLICY PERMITTED: AUTONOMOUS EXECUTION ALLOWED' 
                    : 'POLICY DENIED: EXECUTION FORBIDDEN'}
                </span>
              </div>

              <span className={`rounded-md px-2 py-0.5 text-xs font-bold ${
                simResult.riskLevel === 'CRITICAL' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                simResult.riskLevel === 'HIGH' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                simResult.riskLevel === 'MEDIUM' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}>
                Risk: {simResult.riskLevel} ({simResult.riskScore}/100)
              </span>
            </div>

            {simResult.denialReason && (
              <p className="mt-2 text-xs font-semibold text-red-300">
                Denial Reason: {simResult.denialReason}
              </p>
            )}

            <div className="mt-3 text-xs text-gray-300">
              <span className="font-semibold text-gray-200">Checked Policy Rules: </span>
              {simResult.checkedRules.join(' • ')}
            </div>
          </div>
        )}
      </div>

      {/* Recent Policy Evaluations Log */}
      <div className="rounded-xl border border-white/10 bg-slate-900/60 backdrop-blur-md p-6 shadow-lg">
        <h2 className="text-base font-semibold text-white">Recent Policy Inspections & Boundary Checks</h2>
        <p className="text-xs text-gray-400 mt-0.5">Chronological audit of real-time firewall decisions.</p>

        <div className="mt-4 divide-y divide-white/5">
          {evaluations.map((ev) => (
            <div key={ev.id} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">{ev.actionName}</span>
                  <span className="text-xs text-gray-400">→ {ev.targetSystem}</span>
                  <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                    ev.riskLevel === 'CRITICAL' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                    ev.riskLevel === 'HIGH' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                    ev.riskLevel === 'MEDIUM' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                    'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {ev.riskLevel}
                  </span>
                </div>
                <div className="text-[11px] text-gray-400">
                  Agent: <strong className="text-brand-cyan">{ev.agentId}</strong> • Impact: ${ev.financialImpactEstimatedUsd} USD • Time: {new Date(ev.timestamp).toLocaleTimeString()}
                </div>
              </div>

              <div className="text-right">
                <span className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
                  ev.allowed 
                    ? ev.requiresHumanApproval 
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                    : 'bg-red-500/20 text-red-300 border border-red-500/30'
                }`}>
                  {ev.allowed ? (ev.requiresHumanApproval ? 'Needs Approval' : 'Auto Approved') : 'Denied'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl bg-slate-900 p-6 shadow-2xl border border-white/15">
            <h3 className="text-lg font-bold text-white">
              {killswitch.suspended ? 'Resume Autonomous Execution' : 'Emergency Autonomous Suspension'}
            </h3>
            <p className="mt-2 text-xs text-gray-300">
              {killswitch.suspended 
                ? 'This will restore permitted Level 3 and Level 4 autonomous agent actions across the organization under active policy bounds.'
                : 'This immediately freezes all autonomous external actions across all agents and workflows. A full security audit record will be created.'}
            </p>

            <div className="mt-4">
              <label className="block text-xs font-medium text-gray-300">Reason for State Transition</label>
              <input
                type="text"
                value={killswitchReason}
                onChange={(e) => setKillswitchReason(e.target.value)}
                placeholder="e.g. Threat modeling review or production bug mitigation"
                className="mt-1 block w-full rounded-lg border border-white/10 bg-slate-950/80 px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-cyan"
              />
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-gray-300 hover:bg-white/10 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleToggleKillswitch}
                className={`rounded-lg px-4 py-2 text-xs font-semibold text-white cursor-pointer ${
                  killswitch.suspended ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-red-600 hover:bg-red-500'
                }`}
              >
                Confirm {killswitch.suspended ? 'Resumption' : 'Suspension'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
