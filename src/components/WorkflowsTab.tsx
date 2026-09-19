import React, { useState } from 'react';
import { 
  Zap, Play, Clock, CheckCircle2, AlertTriangle, 
  RotateCcw, Shield, Layers, Plus, ArrowRight 
} from 'lucide-react';
import { Workflow, WorkflowExecution } from '../types';
import { WorkflowEngineService } from '../services/workflowEngineService';

interface Props {
  orgId: string;
  userEmail: string;
}

export const WorkflowsTab: React.FC<Props> = ({ orgId, userEmail }) => {
  const [workflows, setWorkflows] = useState<Workflow[]>(() => 
    WorkflowEngineService.getWorkflows(orgId)
  );
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow>(workflows[0]);
  const [executions, setExecutions] = useState<WorkflowExecution[]>(() => 
    WorkflowEngineService.getExecutions(orgId)
  );
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const handleRunWorkflow = async () => {
    if (!selectedWorkflow) return;
    setIsRunning(true);
    try {
      const exec = await WorkflowEngineService.executeWorkflow(orgId, selectedWorkflow.id, userEmail);
      setExecutions([exec, ...executions]);
      setWorkflows(WorkflowEngineService.getWorkflows(orgId));
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Deterministic & AI Workflows
            </span>
            <span className="text-xs text-gray-400 font-medium">Auto-Rollback & Retry Enabled</span>
          </div>
          <h2 className="text-2xl font-bold text-white mt-1">Intelligent Workflow Engine</h2>
          <p className="text-sm text-gray-400">
            Combine event triggers, AI reasoning steps, human approvals, and external actions with automated retry limits and rollback protections.
          </p>
        </div>

        <button
          onClick={handleRunWorkflow}
          disabled={isRunning || !selectedWorkflow.enabled}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-500 transition disabled:opacity-50 shadow-md cursor-pointer"
        >
          <Play className="w-4 h-4" />
          {isRunning ? 'Running Pipeline...' : 'Run Workflow Now'}
        </button>
      </div>

      {/* Main Layout: Left (Workflows List) & Right (Pipeline visualizer + Execution trace) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Workflow catalog (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Configured Pipelines</h3>
          <div className="space-y-2">
            {workflows.map(wf => {
              const isSelected = wf.id === selectedWorkflow.id;
              return (
                <div
                  key={wf.id}
                  onClick={() => setSelectedWorkflow(wf)}
                  className={`p-4 rounded-xl border cursor-pointer transition ${
                    isSelected
                      ? 'bg-emerald-500/15 border-emerald-500/40 ring-1 ring-emerald-500/30 shadow-md'
                      : 'bg-slate-900/60 backdrop-blur-md border-white/10 hover:border-white/20 hover:bg-slate-900/80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-semibold text-white leading-snug">{wf.name}</h4>
                    <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${wf.enabled ? 'bg-emerald-400' : 'bg-gray-600'}`} />
                  </div>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">{wf.description}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-400 mt-3 pt-2 border-t border-white/5">
                    <span className="flex items-center gap-1 text-amber-300">
                      <Zap className="w-3 h-3 text-amber-400" />
                      {wf.trigger.label}
                    </span>
                    <span>•</span>
                    <span>{wf.executionCount} Runs</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Pipeline Details & Steps (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-slate-900/60 backdrop-blur-md rounded-xl border border-white/10 p-6 space-y-6 shadow-lg">
            {/* Header info */}
            <div className="flex items-start justify-between pb-4 border-b border-white/10">
              <div>
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                  Active Workflow Architecture
                </span>
                <h3 className="text-xl font-bold text-white mt-0.5">{selectedWorkflow.name}</h3>
                <p className="text-xs text-gray-400 mt-1">{selectedWorkflow.description}</p>
              </div>
              <div className="text-right text-xs">
                <span className="text-gray-400">Average Duration</span>
                <div className="font-bold text-white">{selectedWorkflow.averageDurationMs}ms</div>
              </div>
            </div>

            {/* Trigger Block */}
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <div className="text-xs text-amber-300 font-semibold uppercase tracking-wider">Trigger Mechanism</div>
                  <div className="text-sm font-bold text-white">{selectedWorkflow.trigger.label}</div>
                </div>
              </div>
              <span className="text-xs font-mono text-amber-300 bg-amber-500/20 px-2 py-1 rounded border border-amber-500/30">
                {selectedWorkflow.trigger.type.toUpperCase()}
              </span>
            </div>

            {/* Step Visualizer */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                Workflow Pipeline Steps ({selectedWorkflow.steps.length})
              </h4>

              <div className="space-y-3">
                {selectedWorkflow.steps.map((step, idx) => {
                  const isApproval = step.type === 'human_approval';
                  const isAi = step.type === 'ai_reasoning';

                  return (
                    <div
                      key={step.id}
                      className={`p-4 rounded-xl border flex items-start justify-between gap-3 ${
                        isApproval ? 'bg-amber-500/10 border-amber-500/30' : 'bg-slate-950/60 border-white/10'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                          isApproval ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-white'
                        }`}>
                          {idx + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="text-sm font-semibold text-white">{step.name}</h5>
                            <span className={`px-2 py-0.5 text-[10px] font-semibold rounded uppercase ${
                              isApproval ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : isAi ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            }`}>
                              {step.type.replace('_', ' ')}
                            </span>
                          </div>
                          {step.agentId && (
                            <span className="text-xs text-brand-cyan font-medium block mt-0.5">
                              Assigned: {step.agentId.replace('agent_', '').replace('_', ' ')}
                            </span>
                          )}
                          {step.rollbackAction && (
                            <span className="text-xs font-mono text-gray-400 flex items-center gap-1 mt-1">
                              <RotateCcw className="w-3 h-3 text-gray-400" />
                              Rollback guard: {step.rollbackAction}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-right text-xs text-gray-400 shrink-0">
                        <div>Retry: {step.retryLimit}x</div>
                        <div>Timeout: {step.timeoutSeconds}s</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Execution History */}
            <div className="pt-4 border-t border-white/10 space-y-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                Recent Workflow Executions ({executions.length})
              </h4>

              <div className="space-y-2">
                {executions.slice(0, 3).map(exec => (
                  <div key={exec.id} className="p-3 bg-slate-950/60 rounded-xl border border-white/10 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-medium text-white">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{exec.workflowName}</span>
                      </div>
                      <span className="text-gray-400">{new Date(exec.startedAt).toLocaleTimeString()}</span>
                    </div>

                    <div className="space-y-1">
                      {exec.stepResults.map(res => (
                        <div key={res.stepId} className="flex items-center justify-between text-gray-300 pl-4 border-l border-white/10">
                          <span className="truncate">{res.stepName}</span>
                          <span className="font-mono text-gray-400">{res.durationMs}ms</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
