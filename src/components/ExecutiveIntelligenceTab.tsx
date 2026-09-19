import React, { useState } from 'react';
import { 
  Sparkles, AlertTriangle, CheckCircle2, TrendingUp, 
  ArrowUpRight, ShieldAlert, FileText, RefreshCw, Clock, Activity 
} from 'lucide-react';
import { ExecutiveBriefing } from '../types';
import { ExecutiveIntelligenceService } from '../services/executiveIntelligenceService';

interface Props {
  orgId: string;
}

export const ExecutiveIntelligenceTab: React.FC<Props> = ({ orgId }) => {
  const [briefings, setBriefings] = useState<ExecutiveBriefing[]>(() => 
    ExecutiveIntelligenceService.getBriefings(orgId)
  );
  const [activePeriod, setActivePeriod] = useState<'daily' | 'weekly'>('daily');
  const [isGenerating, setIsGenerating] = useState(false);

  const currentBriefing = briefings.find(b => b.period === activePeriod) || briefings[0];

  const handleGenerate = async () => {
    setIsGenerating(true);
    setTimeout(() => {
      const newBrief = ExecutiveIntelligenceService.generateBriefing(orgId, activePeriod);
      setBriefings([newBrief, ...briefings]);
      setIsGenerating(false);
    }, 1200);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header & Control Strip */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider rounded bg-brand-purple/20 text-purple-300 border border-brand-purple/30">
              C-Suite Intelligence Layer
            </span>
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-brand-cyan" />
              Generated {currentBriefing ? new Date(currentBriefing.generatedAt).toLocaleString() : 'Recently'}
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white mt-1">Executive Intelligence Synthesis</h2>
          <p className="text-sm text-gray-400">
            Synthesizing enterprise velocity, strategic risks, and operational decisions into actionable C-suite guidance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-slate-900/80 p-1 rounded-xl border border-white/10 text-sm">
            <button
              onClick={() => setActivePeriod('daily')}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                activePeriod === 'daily'
                  ? 'bg-brand-purple text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Daily Brief
            </button>
            <button
              onClick={() => setActivePeriod('weekly')}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                activePeriod === 'weekly'
                  ? 'bg-brand-purple text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Weekly Brief
            </button>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2 bg-brand-purple text-white rounded-xl text-sm font-medium hover:bg-brand-purple/90 transition disabled:opacity-40 shadow-md cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? 'Synthesizing...' : 'Regenerate Briefing'}
          </button>
        </div>
      </div>

      {/* Snapshot Key Metrics */}
      {currentBriefing && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="bg-slate-900/60 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-lg">
            <div className="flex items-center justify-between text-gray-400 mb-1">
              <span className="text-xs font-medium uppercase tracking-wider">Execution Velocity</span>
              <Activity className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-white">
              {currentBriefing.metricsSnapshot.executionVelocity} <span className="text-xs font-normal text-gray-400">pts</span>
            </div>
            <div className="text-xs text-emerald-400 font-medium mt-1 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" /> +12% over last week
            </div>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-lg">
            <div className="flex items-center justify-between text-gray-400 mb-1">
              <span className="text-xs font-medium uppercase tracking-wider">Risk Alerts</span>
              <ShieldAlert className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-white">
              {currentBriefing.metricsSnapshot.activeRiskAlerts}
            </div>
            <div className="text-xs text-amber-400 font-medium mt-1">
              Requires attention
            </div>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-lg">
            <div className="flex items-center justify-between text-gray-400 mb-1">
              <span className="text-xs font-medium uppercase tracking-wider">Pending Approvals</span>
              <AlertTriangle className="w-4 h-4 text-brand-cyan" />
            </div>
            <div className="text-2xl font-bold text-white">
              {currentBriefing.metricsSnapshot.pendingApprovals}
            </div>
            <div className="text-xs text-brand-cyan font-medium mt-1">
              Human-in-the-loop gate
            </div>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-lg">
            <div className="flex items-center justify-between text-gray-400 mb-1">
              <span className="text-xs font-medium uppercase tracking-wider">Budget Allocation</span>
              <TrendingUp className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-white">
              {currentBriefing.metricsSnapshot.budgetUsedPercent}%
            </div>
            <div className="text-xs text-gray-400 font-medium mt-1">
              71.5% reserve headroom
            </div>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-lg">
            <div className="flex items-center justify-between text-gray-400 mb-1">
              <span className="text-xs font-medium uppercase tracking-wider">AI Compute Cost</span>
              <Sparkles className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-white">
              ${currentBriefing.metricsSnapshot.aiCostMonthToDateUsd.toFixed(2)}
            </div>
            <div className="text-xs text-gray-400 font-medium mt-1">
              Month to date
            </div>
          </div>
        </div>
      )}

      {/* The 5 Core Executive Intelligence Pillars */}
      {currentBriefing ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pillar 1: What Happened */}
          <div className="bg-slate-900/60 backdrop-blur-md rounded-xl border border-white/10 p-6 shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center justify-center font-semibold text-sm">
                1
              </div>
              <h3 className="text-lg font-semibold text-white">What Happened</h3>
            </div>
            <ul className="space-y-3">
              {currentBriefing.whatHappened.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pillar 2: What Changed */}
          <div className="bg-slate-900/60 backdrop-blur-md rounded-xl border border-white/10 p-6 shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-brand-purple/20 text-purple-300 border border-brand-purple/30 flex items-center justify-center font-semibold text-sm">
                2
              </div>
              <h3 className="text-lg font-semibold text-white">What Changed</h3>
            </div>
            <ul className="space-y-3">
              {currentBriefing.whatChanged.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                  <TrendingUp className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pillar 3: What Matters */}
          <div className="bg-slate-900/60 backdrop-blur-md rounded-xl border border-white/10 p-6 shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center font-semibold text-sm">
                3
              </div>
              <h3 className="text-lg font-semibold text-white">What Matters</h3>
            </div>
            <ul className="space-y-3">
              {currentBriefing.whatMatters.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                  <FileText className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pillar 4: What Requires Attention */}
          <div className="bg-amber-500/10 backdrop-blur-md rounded-xl border border-amber-500/30 p-6 shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center font-semibold text-sm">
                4
              </div>
              <h3 className="text-lg font-semibold text-white">What Requires Attention</h3>
            </div>
            <ul className="space-y-3">
              {currentBriefing.whatRequiresAttention.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-amber-200 font-medium">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pillar 5: What is Recommended */}
          <div className="bg-slate-900/60 backdrop-blur-md rounded-xl border border-white/10 p-6 shadow-lg lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-brand-purple text-white flex items-center justify-center font-semibold text-sm">
                5
              </div>
              <h3 className="text-lg font-semibold text-white">What is Recommended</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {currentBriefing.whatIsRecommended.map((item, idx) => (
                <div key={idx} className="bg-slate-950/70 p-4 rounded-xl border border-white/10 shadow-md flex items-start gap-2 text-sm text-gray-200">
                  <Sparkles className="w-4 h-4 text-brand-cyan shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center text-gray-400 bg-slate-900/40 rounded-xl border border-white/10">
          No briefings synthesized yet. Click "Regenerate Briefing" above.
        </div>
      )}
    </div>
  );
};
