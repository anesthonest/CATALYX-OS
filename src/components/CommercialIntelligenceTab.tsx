import React, { useState } from 'react';
import { 
  DollarSign, TrendingUp, Users, Cpu, ShieldCheck, 
  Activity, ArrowUpRight, ArrowDownRight, Layers,
  RefreshCw, CheckCircle, AlertTriangle, FileText, Info
} from 'lucide-react';
import { BillingService } from '../services/billingService';
import { OutcomeEngine } from '../services/outcomeEngine';
import { UsageMeteringService } from '../services/usageMeteringService';
import { CatalyxValueIndex, BusinessOutcome } from '../types';

interface CommercialIntelligenceTabProps {
  organizationId: string;
}

export const CommercialIntelligenceTab: React.FC<CommercialIntelligenceTabProps> = ({ organizationId }) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeFilter, setActiveFilter] = useState<'all' | 'verified' | 'calculated'>('all');

  // Load live data from services
  const ledger = BillingService.getRevenueLedger(organizationId);
  const subscription = BillingService.getSubscription(organizationId);
  const outcomes: BusinessOutcome[] = OutcomeEngine.getOutcomes(organizationId);
  const cvi: CatalyxValueIndex = OutcomeEngine.calculateCatalyxValueIndex(organizationId);
  const aiEconomics = UsageMeteringService.getAIEconomicsBreakdown(organizationId);

  // Calculate actual revenue metrics from ledger
  const totalRevenueMinor = ledger
    .filter(l => l.status === 'completed')
    .reduce((acc, l) => acc + l.amountMinorUnits, 0);
  const totalRevenueUsd = (totalRevenueMinor / 100);
  const mrrUsd = subscription.status === 'active' ? (subscription.amountMinorUnits / 100) : 0;
  const arrUsd = mrrUsd * 12;

  // Filtered outcomes
  const filteredOutcomes = outcomes.filter(o => {
    if (activeFilter === 'verified') return o.isVerified;
    if (activeFilter === 'calculated') return o.measurementMethod === 'calculated';
    return true;
  });

  const totalImpactUsd = outcomes.reduce((acc, o) => acc + (o.financialImpactMinorUnits / 100), 0);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div key={refreshKey} className="space-y-6 pb-12">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">Commercial Intelligence & Revenue Operations</h1>
            <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
              V8.1 Economic Core
            </span>
          </div>
          <p className="text-sm text-gray-400 mt-1">
            Real-time financial telemetry, AI unit economics, subscription ledger health, and verified business outcomes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3.5 py-2 text-sm font-medium text-gray-200 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" />
            Recalculate Telemetry
          </button>
        </div>
      </div>

      {/* Primary KPI Grid: High Contrast, Accurate Data Source Flags */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* MRR / ARR */}
        <div className="rounded-xl border border-white/10 bg-slate-900/60 backdrop-blur-md p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Monthly Recurring Revenue</span>
            <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] font-semibold text-gray-300 border border-white/10">
              [CALCULATED]
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">${mrrUsd.toLocaleString()}</span>
            <span className="text-xs text-gray-400">USD</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>ARR Run Rate: <strong className="text-emerald-300">${arrUsd.toLocaleString()}</strong></span>
          </div>
          <p className="mt-2 text-[11px] text-gray-400">
            Active Tier: <strong className="text-gray-200">{subscription.tier.toUpperCase()}</strong> ({subscription.status})
          </p>
        </div>

        {/* Real Ledger Collections */}
        <div className="rounded-xl border border-white/10 bg-slate-900/60 backdrop-blur-md p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Cash Collections</span>
            <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-300 border border-emerald-500/30">
              [REAL LEDGER]
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">${totalRevenueUsd.toLocaleString()}</span>
            <span className="text-xs text-gray-400">USD</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-300">
            <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
            <span>{ledger.length} Settled Transactions in Ledger</span>
          </div>
          <p className="mt-2 text-[11px] text-gray-400">
            Gateway: Pesapal API v3 Multi-Currency
          </p>
        </div>

        {/* AI Compute Cost & Gross Margin */}
        <div className="rounded-xl border border-white/10 bg-slate-900/60 backdrop-blur-md p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">AI Compute Cost</span>
            <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] font-semibold text-gray-300 border border-white/10">
              [CALCULATED]
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">${aiEconomics.totalSpentUsd.toFixed(2)}</span>
            <span className="text-xs text-gray-400">/ ${aiEconomics.budgetLimitUsd.toFixed(0)} limit</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-brand-cyan">
            <Cpu className="h-3.5 w-3.5" />
            <span>Est. Gross Margin: <strong className="text-white">{aiEconomics.spendingMarginPercent}%</strong></span>
          </div>
          <p className="mt-2 text-[11px] text-gray-400">
            Budget anomalies detected: <strong className="text-gray-200">{aiEconomics.anomaliesCount}</strong>
          </p>
        </div>

        {/* Catalyx Value Index (CVI) */}
        <div className="rounded-xl border border-white/10 bg-slate-900/60 backdrop-blur-md p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Catalyx Value Index (CVI)</span>
            <span className="rounded bg-brand-purple/20 px-1.5 py-0.5 text-[10px] font-semibold text-brand-purple border border-brand-purple/30">
              [INDEX]
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{cvi.overallScore}</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-purple/20 text-purple-300 border border-brand-purple/30">
              {cvi.tier}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400">
            <ArrowUpRight className="h-3.5 w-3.5" />
            <span>+{cvi.trendDeltaPercent}% 30-Day Velocity Trend</span>
          </div>
          <p className="mt-2 text-[11px] text-gray-400">
            Synthesizing 8 verified operational dimensions
          </p>
        </div>
      </div>

      {/* CATALYX VALUE INDEX DEEP-DIVE (Mathematical Transparency) */}
      <div className="rounded-xl border border-white/10 bg-slate-900/60 backdrop-blur-md p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
          <div>
            <h2 className="text-base font-semibold text-white">Catalyx Value Index (CVI) Dimension Decomposition</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Transparent, non-arbitrary mathematical evaluation of autonomous productivity and economic yield.
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs font-medium text-gray-400">Overall Score: </span>
            <span className="text-lg font-bold text-brand-cyan">{cvi.overallScore}/100</span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(cvi.dimensions).map(([key, dim]) => (
            <div key={key} className="rounded-lg border border-white/5 bg-slate-950/40 p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-300">{dim.label}</span>
                <span className="text-xs font-bold text-white">{dim.score}/100</span>
              </div>
              <div className="mt-2 text-xs font-mono font-semibold text-brand-cyan">{dim.rawValue}</div>
              <div className="mt-2.5 h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                <div 
                  className={`h-full rounded-full ${dim.score >= 90 ? 'bg-emerald-500' : dim.score >= 80 ? 'bg-brand-cyan' : 'bg-amber-500'}`} 
                  style={{ width: `${dim.score}%` }} 
                />
              </div>
              <span className="mt-2 block text-[10px] text-gray-500">Weight: {(dim.weight * 100).toFixed(0)}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* OUTCOME ENGINE: Mission → Action → Result → Business Outcome */}
      <div className="rounded-xl border border-white/10 bg-slate-900/60 backdrop-blur-md p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-white">Outcome Engine: Verified Business Impact</h2>
              <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-xs font-semibold text-emerald-300 border border-emerald-500/30">
                ${totalImpactUsd.toLocaleString()} Total Yield
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Connecting Mission → Agent Action → Execution → Measured Business Metric with verifiable audit trail.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${activeFilter === 'all' ? 'bg-brand-purple text-white shadow-sm' : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'}`}
            >
              All Outcomes ({outcomes.length})
            </button>
            <button
              onClick={() => setActiveFilter('verified')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${activeFilter === 'verified' ? 'bg-brand-purple text-white shadow-sm' : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'}`}
            >
              Verified ({outcomes.filter(o => o.isVerified).length})
            </button>
            <button
              onClick={() => setActiveFilter('calculated')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${activeFilter === 'calculated' ? 'bg-brand-purple text-white shadow-sm' : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'}`}
            >
              Calculated
            </button>
          </div>
        </div>

        <div className="mt-4 divide-y divide-white/5">
          {filteredOutcomes.map((outcome) => (
            <div key={outcome.id} className="py-4 first:pt-0 last:pb-0">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-white">{outcome.title}</span>
                    <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase ${
                      outcome.measurementMethod === 'observed' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                      outcome.measurementMethod === 'calculated' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' :
                      outcome.measurementMethod === 'estimated' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                      'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    }`}>
                      [{outcome.measurementMethod}]
                    </span>
                    {outcome.isVerified ? (
                      <span className="inline-flex items-center gap-1 rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-medium text-emerald-300 border border-emerald-500/30">
                        <CheckCircle className="h-3 w-3 text-emerald-400" />
                        Verified by {outcome.verifiedBy}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded bg-white/5 px-1.5 py-0.5 text-[10px] font-medium text-gray-400 border border-white/5">
                        Pending Verification
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-300">{outcome.description}</p>
                  <p className="text-xs text-gray-500">
                    Action: <span className="text-gray-300">{outcome.actionSummary}</span> (Agent: <strong className="text-brand-cyan">{outcome.agentId}</strong>)
                  </p>
                </div>

                <div className="flex sm:flex-col items-end justify-between sm:justify-start gap-1 shrink-0 text-right">
                  <div className="text-sm font-bold text-emerald-400">
                    +${(outcome.financialImpactMinorUnits / 100).toLocaleString()} USD
                  </div>
                  <div className="text-xs text-gray-400">
                    Delta: <span className="text-gray-300">{outcome.baselineValue}</span> → <strong className="text-brand-cyan">{outcome.resultingValue} {outcome.metricUnit}</strong>
                  </div>
                  <div className="text-[11px] text-gray-500">
                    Confidence: <strong className="text-gray-300">{outcome.confidenceScore}%</strong>
                  </div>
                </div>
              </div>

              {/* Supporting Evidence Chips */}
              <div className="mt-2.5 flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-semibold text-gray-500 uppercase">Supporting Evidence:</span>
                {outcome.supportingEvidence.map((ev, i) => (
                  <span key={i} className="rounded bg-white/5 px-2 py-0.5 text-[11px] text-gray-300 border border-white/10">
                    {ev}
                  </span>
                ))}
              </div>
            </div>
          ))}

          {filteredOutcomes.length === 0 && (
            <div className="py-8 text-center text-sm text-gray-500">
              No business outcomes matching filter.
            </div>
          )}
        </div>
      </div>

      {/* AI USAGE ECONOMICS (Cost by Agent & Resource) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-white/10 bg-slate-900/60 backdrop-blur-md p-6 shadow-lg">
          <h2 className="text-base font-semibold text-white">AI Cost Allocation by Agent</h2>
          <p className="text-xs text-gray-400 mt-0.5">Real-time expenditure breakdown across the 11-agent workforce.</p>

          <div className="mt-4 space-y-3">
            {Object.entries(aiEconomics.costByAgent).map(([agent, cost]) => (
              <div key={agent} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-300 capitalize">{agent} Agent</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-white">${cost.toFixed(2)} USD</span>
                  <div className="w-24 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div 
                      className="h-full bg-brand-purple rounded-full" 
                      style={{ width: `${Math.min(100, (cost / (aiEconomics.totalSpentUsd || 1)) * 100)}%` }} 
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-slate-900/60 backdrop-blur-md p-6 shadow-lg">
          <h2 className="text-base font-semibold text-white">Resource Consumption by Type</h2>
          <p className="text-xs text-gray-400 mt-0.5">Token processing, workflow triggers, and mission orchestration.</p>

          <div className="mt-4 space-y-3">
            {Object.entries(aiEconomics.costByResourceType).map(([resType, cost]) => (
              <div key={resType} className="flex items-center justify-between text-xs">
                <span className="font-medium text-gray-300 uppercase tracking-wider">{resType.replace('_', ' ')}</span>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-white">${cost.toFixed(2)} USD</span>
                  <div className="w-24 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 rounded-full" 
                      style={{ width: `${Math.min(100, (cost / (aiEconomics.totalSpentUsd || 1)) * 100)}%` }} 
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
