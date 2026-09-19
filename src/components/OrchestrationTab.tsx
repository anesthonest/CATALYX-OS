import React, { useState } from 'react';
import { 
  GitBranch, Play, CheckCircle2, AlertTriangle, ShieldCheck, 
  Send, Bot, BookOpen, Clock, ArrowRight, Sparkles 
} from 'lucide-react';
import { OrchestrationObjective, OrchestrationPlan } from '../types';
import { OrchestratorService } from '../services/orchestratorService';

interface Props {
  orgId: string;
  userEmail: string;
}

export const OrchestrationTab: React.FC<Props> = ({ orgId, userEmail }) => {
  const [objectives, setObjectives] = useState<OrchestrationObjective[]>(() => 
    OrchestratorService.getObjectives(orgId)
  );
  const [plans, setPlans] = useState<OrchestrationPlan[]>(() => 
    OrchestratorService.getPlans(orgId)
  );
  const [selectedObjectiveId, setSelectedObjectiveId] = useState<string>(objectives[0]?.id || '');
  const [rawInput, setRawInput] = useState<string>('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('high');
  const [isDecomposing, setIsDecomposing] = useState<boolean>(false);

  const currentObjective = objectives.find(o => o.id === selectedObjectiveId) || objectives[0];
  const currentPlan = plans.find(p => p.objectiveId === currentObjective?.id);

  const handleCreateObjective = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawInput.trim()) return;

    setIsDecomposing(true);
    try {
      const { objective, plan } = await OrchestratorService.decomposeObjective(
        orgId,
        rawInput.trim(),
        priority,
        userEmail
      );
      setObjectives([objective, ...objectives]);
      setPlans([plan, ...plans]);
      setSelectedObjectiveId(objective.id);
      setRawInput('');
    } finally {
      setIsDecomposing(false);
    }
  };

  const handleExecuteStep = (stepId: string) => {
    if (!currentPlan) return;
    OrchestratorService.executeStep(orgId, currentPlan.id, stepId);
    setPlans(OrchestratorService.getPlans(orgId));
    setObjectives(OrchestratorService.getObjectives(orgId));
  };

  const handleApproveStep = (stepId: string) => {
    if (!currentPlan) return;
    OrchestratorService.approveStep(orgId, currentPlan.id, stepId, userEmail);
    setPlans(OrchestratorService.getPlans(orgId));
    setObjectives(OrchestratorService.getObjectives(orgId));
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="pb-6 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider rounded bg-brand-purple/20 text-purple-300 border border-brand-purple/30">
            Autonomous Orchestration Engine
          </span>
          <span className="text-xs text-gray-400 font-medium">Controlled Autonomy & Safety Bounds</span>
        </div>
        <h2 className="text-2xl font-bold text-white mt-1">Autonomous Multi-Agent Mission Orchestration</h2>
        <p className="text-sm text-gray-400">
          Decompose high-level strategic goals into tactical tasks, map capabilities, ground against institutional memory, and gate consequential actions behind human sign-off.
        </p>
      </div>

      {/* Objective Input Form */}
      <form onSubmit={handleCreateObjective} className="bg-slate-900/60 backdrop-blur-md p-5 rounded-xl border border-white/10 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-cyan" />
            Declare Strategic Mission or Operational Objective
          </label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Priority:</span>
            <select
              value={priority}
              onChange={(e: any) => setPriority(e.target.value)}
              className="text-xs font-semibold bg-slate-950/80 text-white border border-white/10 rounded-lg px-2.5 py-1 focus:outline-none focus:border-brand-cyan"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3">
          <input
            type="text"
            value={rawInput}
            onChange={e => setRawInput(e.target.value)}
            placeholder="e.g. Expand Pesapal recurring mobile money processing in Kenya with automated reconciliation and C-suite audit reporting..."
            className="flex-1 px-4 py-2.5 border border-white/10 rounded-xl text-sm bg-slate-950/80 text-white placeholder-gray-500 focus:outline-none focus:border-brand-cyan"
            disabled={isDecomposing}
          />
          <button
            type="submit"
            disabled={isDecomposing || !rawInput.trim()}
            className="px-5 py-2.5 bg-brand-purple text-white rounded-xl text-sm font-medium hover:bg-brand-purple/90 transition flex items-center gap-2 disabled:opacity-40 shrink-0 shadow-md cursor-pointer"
          >
            <Send className="w-4 h-4" />
            {isDecomposing ? 'Decomposing Strategy...' : 'Orchestrate Mission'}
          </button>
        </div>
      </form>

      {/* Main Orchestration Workspace: Left (Objectives list) & Right (Plan detail) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Active Objectives (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Missions Pipeline</h3>
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {objectives.map(obj => {
              const isSelected = obj.id === currentObjective?.id;
              const statusColors: Record<string, string> = {
                completed: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
                awaiting_approval: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
                executing: 'bg-brand-purple/20 text-purple-300 border-brand-purple/30',
                planning: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
              };

              return (
                <div
                  key={obj.id}
                  onClick={() => setSelectedObjectiveId(obj.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition backdrop-blur-md ${
                    isSelected
                      ? 'bg-slate-900 border-brand-purple ring-1 ring-brand-purple/50 shadow-lg'
                      : 'bg-slate-900/40 border-white/10 hover:border-white/20 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-semibold text-white leading-snug line-clamp-2">
                      {obj.title}
                    </h4>
                    <span className={`px-2 py-0.5 text-[10px] font-semibold rounded border uppercase shrink-0 ${statusColors[obj.status] || 'bg-white/10 text-gray-300 border-white/15'}`}>
                      {obj.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400 mt-3">
                    <span className="flex items-center gap-1 font-mono text-gray-300">
                      <Bot className="w-3.5 h-3.5 text-brand-cyan" />
                      {obj.assignedAgentIds.length} Agents
                    </span>
                    <span>•</span>
                    <span className="capitalize">{obj.priority} Priority</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Decomposed Plan & Steps (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {currentPlan ? (
            <div className="bg-slate-900/60 backdrop-blur-md rounded-xl border border-white/10 p-6 space-y-6 shadow-lg">
              {/* Mission Summary */}
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div>
                    <span className="text-xs font-semibold text-brand-cyan uppercase tracking-wider">
                      Execution Strategy Blueprint
                    </span>
                    <h3 className="text-xl font-bold text-white mt-0.5">{currentObjective.title}</h3>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                    currentPlan.status === 'completed' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  }`}>
                    {currentPlan.status.toUpperCase().replace('_', ' ')}
                  </span>
                </div>

                <p className="text-sm text-gray-300 mt-3 bg-slate-950/70 p-3 rounded-lg border border-white/10">
                  {currentPlan.strategySummary}
                </p>
              </div>

              {/* Context Grounding & Assigned Agents Bar */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-950/60 border border-white/10">
                <div>
                  <span className="text-xs font-semibold text-brand-cyan flex items-center gap-1.5 mb-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-brand-cyan" />
                    Institutional Memory Retrieved
                  </span>
                  <ul className="text-xs text-gray-300 space-y-1">
                    {currentPlan.retrievedKnowledgeContext.map((ctx, idx) => (
                      <li key={idx} className="truncate">• {ctx}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <span className="text-xs font-semibold text-purple-300 flex items-center gap-1.5 mb-1.5">
                    <Bot className="w-3.5 h-3.5 text-purple-400" />
                    Assigned AI Workforce
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {currentPlan.assignedAgents.map(a => (
                      <span key={a.id} className="px-2 py-0.5 bg-brand-purple/20 text-purple-200 font-medium rounded text-xs border border-brand-purple/30">
                        {a.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sequential Steps Pipeline */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-brand-cyan" />
                    Sequential Execution Pipeline ({currentPlan.steps.length} Steps)
                  </h4>
                  {currentPlan.humanApprovalsCount > 0 && (
                    <span className="text-xs text-amber-300 font-medium flex items-center gap-1 bg-amber-500/20 px-2.5 py-1 rounded-lg border border-amber-500/30">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      {currentPlan.humanApprovalsCount} Human-in-the-Loop Checkpoint(s)
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  {currentPlan.steps.map((step, idx) => {
                    const isExecuted = step.executed;
                    const requiresApproval = step.requiresHumanApproval;
                    const isApproved = step.approvalStatus === 'approved';

                    return (
                      <div
                        key={step.id}
                        className={`p-4 rounded-xl border transition backdrop-blur-md ${
                          isExecuted
                            ? 'bg-emerald-500/10 border-emerald-500/30'
                            : requiresApproval && !isApproved
                              ? 'bg-amber-500/10 border-amber-500/30'
                              : 'bg-slate-900/50 border-white/10'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                              isExecuted
                                ? 'bg-emerald-500 text-slate-950'
                                : requiresApproval && !isApproved
                                  ? 'bg-amber-400 text-slate-950'
                                  : 'bg-white/10 text-gray-300'
                            }`}>
                              {idx + 1}
                            </div>
                            <div>
                              <h5 className="text-sm font-semibold text-white">{step.title}</h5>
                              <p className="text-xs text-gray-400 mt-0.5">{step.description}</p>
                              {step.outputSummary && (
                                <p className="text-xs font-mono text-emerald-300 bg-emerald-500/10 p-2 rounded mt-2 border border-emerald-500/30">
                                  ✓ {step.outputSummary}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="shrink-0 flex items-center gap-2">
                            {requiresApproval && !isApproved && (
                              <button
                                onClick={() => handleApproveStep(step.id)}
                                className="px-3 py-1.5 bg-amber-500 text-slate-950 font-bold rounded-lg text-xs hover:bg-amber-400 transition flex items-center gap-1.5 shadow-md cursor-pointer"
                              >
                                <ShieldCheck className="w-3.5 h-3.5" />
                                Approve Gate
                              </button>
                            )}

                            {!isExecuted && (!requiresApproval || isApproved) && (
                              <button
                                onClick={() => handleExecuteStep(step.id)}
                                className="px-3 py-1.5 bg-brand-purple text-white rounded-lg text-xs font-medium hover:bg-brand-purple/90 transition flex items-center gap-1.5 shadow-md cursor-pointer"
                              >
                                <Play className="w-3.5 h-3.5" />
                                Execute Step
                              </button>
                            )}

                            {isExecuted && (
                              <span className="text-xs font-semibold text-emerald-300 flex items-center gap-1 bg-emerald-500/20 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Done
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Outcome Report */}
              {currentPlan.outcomeReport && (
                <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/30">
                  <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider block mb-1">
                    Mission Outcome Synthesis
                  </span>
                  <p className="text-sm text-emerald-200 leading-relaxed font-medium">
                    {currentPlan.outcomeReport}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center text-gray-400 bg-slate-900/40 rounded-xl border border-white/10">
              Select or orchestrate an objective to view its execution blueprint.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
