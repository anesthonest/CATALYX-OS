import React, { useState } from 'react';
import { 
  BarChart3, TrendingUp, Sliders, AlertCircle, Sparkles, 
  HelpCircle, ArrowUpRight, ArrowDownRight, Layers, Shield 
} from 'lucide-react';
import { BusinessDigitalTwin, ScenarioSimulation } from '../types';
import { DigitalTwinService } from '../services/digitalTwinService';

interface Props {
  orgId: string;
}

export const BusinessTwinTab: React.FC<Props> = ({ orgId }) => {
  const [twin, setTwin] = useState<BusinessDigitalTwin>(() => DigitalTwinService.getTwin(orgId));
  const [simulations, setSimulations] = useState<ScenarioSimulation[]>(() => 
    DigitalTwinService.getSimulations(orgId)
  );

  // Scenario Simulator Form State
  const [hypothesis, setHypothesis] = useState<string>('');
  const [dimension, setDimension] = useState<string>('Regional Marketing Spend');
  const [deltaPercent, setDeltaPercent] = useState<number>(25);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  const handleRunSimulation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hypothesis.trim()) return;

    setIsSimulating(true);
    setTimeout(() => {
      const newSim = DigitalTwinService.runScenario(orgId, hypothesis, dimension, deltaPercent);
      setSimulations([newSim, ...simulations]);
      setHypothesis('');
      setIsSimulating(false);
    }, 800);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider rounded bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30">
              Computational Organizational Model
            </span>
            <span className="text-xs text-gray-400 font-medium">Calibrated Telemetry</span>
          </div>
          <h2 className="text-2xl font-bold text-white mt-1">Business Digital Twin & Scenario Simulator</h2>
          <p className="text-sm text-gray-400">
            Real-time organizational model separating observed data, calculated metrics, forecasts, and strategic scenario simulations.
          </p>
        </div>

        {/* Mandatory Transparency Disclaimer Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs font-medium text-amber-300">
          <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
          <span>Simulations are heuristic mathematical estimates</span>
        </div>
      </div>

      {/* 4-Zone Digital Twin Representation */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Zone 1: Observed Telemetry Data */}
        <div className="bg-slate-900/60 backdrop-blur-md p-5 rounded-xl border border-white/10 shadow-lg space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">1. Observed Data</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400" title="Verified Reality" />
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">Completed Tasks (30d):</span>
              <strong className="text-white">{twin.observedData.completedTasksLast30Days}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Avg Cycle Time:</span>
              <strong className="text-white">{twin.observedData.avgCycleTimeDays} days</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Sprint Team Velocity:</span>
              <strong className="text-white">{twin.observedData.teamVelocity} pts</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Deep Focus Logged:</span>
              <strong className="text-white">{twin.observedData.focusHoursLogged} hrs</strong>
            </div>
          </div>
        </div>

        {/* Zone 2: Calculated Mathematical Metrics */}
        <div className="bg-slate-900/60 backdrop-blur-md p-5 rounded-xl border border-white/10 shadow-lg space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">2. Calculated Metrics</span>
            <span className="w-2 h-2 rounded-full bg-brand-cyan" title="Derived Math" />
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">Burnout Risk Index:</span>
              <strong className="text-emerald-400">{twin.calculatedMetrics.burnoutRiskIndex} / 100 (Safe)</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Productivity Lift:</span>
              <strong className="text-brand-cyan">+{twin.calculatedMetrics.productivityVariance}%</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Efficiency Score:</span>
              <strong className="text-white">{twin.operationalModel.operationalEfficiencyScore}%</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Cash Runway:</span>
              <strong className="text-white">{twin.operationalModel.runwayMonths} months</strong>
            </div>
          </div>
        </div>

        {/* Zone 3: Forecasts & Projections */}
        <div className="bg-slate-900/60 backdrop-blur-md p-5 rounded-xl border border-white/10 shadow-lg space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">3. Forecasts</span>
            <span className="w-2 h-2 rounded-full bg-brand-purple" title="Projections" />
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">Projected Q Revenue:</span>
              <strong className="text-white">${twin.forecasts.projectedQuarterlyRevenue.toLocaleString()}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Goal Completion Rate:</span>
              <strong className="text-purple-300">{twin.forecasts.projectedGoalCompletionRate}%</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Capacity Shortfall:</span>
              <strong className="text-amber-400">{twin.forecasts.estimatedCapacityShortfall} FTEs</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Monthly Burn:</span>
              <strong className="text-white">${twin.operationalModel.monthlyBurnUsd.toLocaleString()}</strong>
            </div>
          </div>
        </div>

        {/* Zone 4: User-Provided Strategic Targets */}
        <div className="bg-slate-900/60 backdrop-blur-md p-5 rounded-xl border border-white/10 shadow-lg space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">4. User Inputs</span>
            <span className="w-2 h-2 rounded-full bg-amber-400" title="User Stated Assumptions" />
          </div>
          <div className="space-y-2 text-xs">
            <div>
              <span className="text-gray-400 block text-[10px] uppercase font-bold">Quarterly Target:</span>
              <p className="text-white font-semibold truncate">{twin.userProvidedData.strategicPriorityQuarter}</p>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Growth Goal:</span>
              <strong className="text-emerald-400">+{twin.userProvidedData.growthTargetPercent}% YoY</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Risk Profile:</span>
              <strong className="text-white capitalize">{twin.userProvidedData.riskTolerance}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Strategic Scenario Simulator Interactive Console */}
      <div className="bg-slate-900/60 backdrop-blur-md rounded-xl border border-white/10 p-6 shadow-lg space-y-6">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-brand-cyan" />
            Strategic Scenario Simulator ("What-If" Analysis)
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Simulate the operational, financial, and throughput impact of strategic hypotheses before committing capital.
          </p>
        </div>

        <form onSubmit={handleRunSimulation} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 rounded-xl bg-slate-950/60 border border-white/10">
          <div className="md:col-span-6">
            <label className="text-xs font-semibold text-gray-300 block mb-1">Hypothesis / Scenario Description</label>
            <input
              type="text"
              value={hypothesis}
              onChange={e => setHypothesis(e.target.value)}
              placeholder="e.g. What if we automate customer onboarding and reallocate 3 support agents to sales?"
              className="w-full px-3 py-2 bg-slate-900 border border-white/10 text-white rounded-lg text-xs focus:outline-none focus:border-brand-cyan"
              required
            />
          </div>

          <div className="md:col-span-3">
            <label className="text-xs font-semibold text-gray-300 block mb-1">Primary Dimension</label>
            <select
              value={dimension}
              onChange={e => setDimension(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-white/10 text-white rounded-lg text-xs font-medium focus:outline-none focus:border-brand-cyan"
            >
              <option value="Regional Marketing Spend">Regional Marketing Spend</option>
              <option value="Engineering Headcount">Engineering Headcount</option>
              <option value="Workflow Automation Coverage">Workflow Automation Coverage</option>
              <option value="Customer Support Staffing">Customer Support Staffing</option>
              <option value="SaaS Pricing Tier">SaaS Pricing Tier</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-semibold text-gray-300 block mb-1">Adjustment Delta</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={deltaPercent}
                onChange={e => setDeltaPercent(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-xs font-bold text-white focus:outline-none focus:border-brand-cyan"
              />
              <span className="text-xs font-bold text-gray-400">%</span>
            </div>
          </div>

          <div className="md:col-span-1 flex items-end">
            <button
              type="submit"
              disabled={isSimulating || !hypothesis.trim()}
              className="w-full py-2 bg-brand-purple text-white rounded-lg text-xs font-semibold hover:bg-brand-purple/90 transition disabled:opacity-50 shadow-md cursor-pointer"
            >
              {isSimulating ? '...' : 'Simulate'}
            </button>
          </div>
        </form>

        {/* List of Simulated Scenarios */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-white flex items-center justify-between">
            <span>Projected Scenario Models ({simulations.length})</span>
            <span className="text-xs text-gray-400 font-normal">Ranked by latest execution</span>
          </h4>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {simulations.map(sim => (
              <div key={sim.id} className="p-5 rounded-xl border border-white/10 bg-slate-950/60 space-y-4 shadow-md">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h5 className="text-sm font-bold text-white">{sim.title}</h5>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-purple/20 text-purple-300 border border-brand-purple/30">
                      ESTIMATE
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 mt-1 italic">"{sim.hypothesis}"</p>
                </div>

                {/* Projected Metric Shifts */}
                <div className="grid grid-cols-2 gap-2">
                  {sim.projectedOutcomes.map((out, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-slate-900 border border-white/5 text-xs">
                      <div className="text-[11px] text-gray-400 truncate">{out.metric}</div>
                      <div className="font-bold text-white mt-0.5">{out.estimatedAfterValue}</div>
                      <div className="text-[10px] text-brand-cyan font-mono mt-1">{out.confidenceLevel}</div>
                    </div>
                  ))}
                </div>

                {/* Risks & Opportunities */}
                <div className="space-y-1.5 pt-2 border-t border-white/5 text-xs">
                  {sim.risksIdentified.length > 0 && (
                    <div className="text-amber-300 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                      <strong className="text-[10px] uppercase font-bold text-amber-400 block mb-0.5">Identified Risk:</strong>
                      {sim.risksIdentified[0]}
                    </div>
                  )}
                  {sim.opportunities.length > 0 && (
                    <div className="text-emerald-300 bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                      <strong className="text-[10px] uppercase font-bold text-emerald-400 block mb-0.5">Opportunity:</strong>
                      {sim.opportunities[0]}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
