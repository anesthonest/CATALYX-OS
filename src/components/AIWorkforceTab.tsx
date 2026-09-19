import React, { useState } from 'react';
import { 
  Bot, Shield, Cpu, Zap, Activity, CheckCircle, 
  Sliders, Lock, DollarSign, Eye, Play, Sparkles, AlertCircle 
} from 'lucide-react';
import { AgentProfile, AgentAutonomyLevel, AgentPermission, AgentExecutionRecord } from '../types';
import { AgentWorkforceService } from '../services/agentWorkforceService';

interface Props {
  orgId: string;
}

const AUTONOMY_LEVEL_LABELS: Record<AgentAutonomyLevel, { name: string; desc: string; color: string }> = {
  0: { name: 'Level 0 — OBSERVE', desc: 'AI can analyze telemetry and data passively.', color: 'bg-slate-100 text-slate-700 border-slate-300' },
  1: { name: 'Level 1 — RECOMMEND', desc: 'AI proposes strategic actions for user consideration.', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  2: { name: 'Level 2 — PREPARE', desc: 'AI constructs execution plans & drafts requiring approval.', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  3: { name: 'Level 3 — APPROVED EXECUTION', desc: 'AI executes pre-authorized tasks inside policy bounds.', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  4: { name: 'Level 4 — CONTROLLED AUTONOMOUS', desc: 'Operates inside strict resource budgets & guardrails.', color: 'bg-purple-50 text-purple-700 border-purple-200' },
};

export const AIWorkforceTab: React.FC<Props> = ({ orgId }) => {
  const [agents, setAgents] = useState<AgentProfile[]>(() => AgentWorkforceService.getAgents(orgId));
  const [selectedAgent, setSelectedAgent] = useState<AgentProfile>(agents[0]);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [logs, setLogs] = useState<AgentExecutionRecord[]>(() => AgentWorkforceService.getExecutionLogs(orgId));
  const [showLogs, setShowLogs] = useState<boolean>(false);

  const filteredAgents = agents.filter(agent => {
    if (activeFilter === 'all') return true;
    return agent.category === activeFilter;
  });

  const handleAutonomyChange = (level: AgentAutonomyLevel) => {
    AgentWorkforceService.updateAutonomyLevel(orgId, selectedAgent.id, level);
    const updated = { ...selectedAgent, autonomyLevel: level };
    setSelectedAgent(updated);
    setAgents(agents.map(a => a.id === updated.id ? updated : a));
  };

  const handlePermissionToggle = (perm: AgentPermission) => {
    AgentWorkforceService.togglePermission(orgId, selectedAgent.id, perm);
    const updatedPerms = selectedAgent.permissions.includes(perm)
      ? selectedAgent.permissions.filter(p => p !== perm)
      : [...selectedAgent.permissions, perm];
    const updated = { ...selectedAgent, permissions: updatedPerms };
    setSelectedAgent(updated);
    setAgents(agents.map(a => a.id === updated.id ? updated : a));
  };

  const allPermissions: AgentPermission[] = [
    'READ_KNOWLEDGE',
    'WRITE_KNOWLEDGE',
    'CREATE_TASK',
    'UPDATE_TASK',
    'READ_ANALYTICS',
    'EXECUTE_WORKFLOW',
    'SEND_NOTIFICATION',
    'USE_INTEGRATION',
    'REQUEST_APPROVAL',
    'FINANCIAL_ACTION',
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider rounded bg-brand-purple/20 text-brand-purple border border-brand-purple/30">
              Multi-Agent Operating Workforce
            </span>
            <span className="text-xs text-gray-400 font-medium">11 Specialized Agent Personas</span>
          </div>
          <h2 className="text-2xl font-bold text-white mt-1">Autonomous Workforce & Policy Guardrails</h2>
          <p className="text-sm text-gray-400">
            Configure agent autonomy levels (0 to 4), restrict permission matrices, and audit all autonomous actions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowLogs(!showLogs)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition cursor-pointer ${
              showLogs ? 'bg-brand-purple text-white border-brand-purple shadow-md' : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Activity className="w-4 h-4" />
            {showLogs ? 'Hide Execution Logs' : 'View Audit Logs'}
          </button>
        </div>
      </div>

      {/* Execution Logs Drawer / Modal View */}
      {showLogs && (
        <div className="bg-slate-900/90 backdrop-blur-md text-slate-100 p-6 rounded-xl border border-white/10 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-400" />
              <h3 className="font-semibold text-white">Agent Autonomous Execution Audit Trail</h3>
            </div>
            <span className="text-xs text-gray-400">{logs.length} Recorded Traces</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="text-gray-400 border-b border-white/10 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-2 px-2">Agent</th>
                  <th className="py-2 px-2">Action</th>
                  <th className="py-2 px-2">Summary</th>
                  <th className="py-2 px-2">Autonomy</th>
                  <th className="py-2 px-2">Cost</th>
                  <th className="py-2 px-2">Outcome</th>
                  <th className="py-2 px-2">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {logs.map(log => (
                  <tr key={log.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-2.5 px-2 font-medium text-white">{log.agentName}</td>
                    <td className="py-2.5 px-2 font-mono text-purple-300">{log.actionType}</td>
                    <td className="py-2.5 px-2 max-w-xs truncate text-gray-300">{log.summary}</td>
                    <td className="py-2.5 px-2 text-brand-cyan">Level {log.autonomyLevelUsed}</td>
                    <td className="py-2.5 px-2 text-gray-300">${log.estimatedCostUsd.toFixed(3)}</td>
                    <td className="py-2.5 px-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {log.outcome.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-2.5 px-2 text-gray-400">{new Date(log.timestamp).toLocaleTimeString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Main Grid: Directory + Detail Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Agent Selector List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Agent Directory</h3>
            <span className="text-xs text-gray-400">{filteredAgents.length} Agents</span>
          </div>

          <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
            {filteredAgents.map(agent => {
              const isSelected = agent.id === selectedAgent.id;
              const autonomyMeta = AUTONOMY_LEVEL_LABELS[agent.autonomyLevel];

              return (
                <div
                  key={agent.id}
                  onClick={() => setSelectedAgent(agent)}
                  className={`p-4 rounded-xl border cursor-pointer transition ${
                    isSelected
                      ? 'bg-brand-purple/20 border-brand-purple ring-1 ring-brand-purple shadow-lg'
                      : 'bg-slate-900/60 backdrop-blur-md border-white/10 hover:border-white/20 hover:bg-slate-900/80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-brand-cyan">
                        <Bot className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white">{agent.name}</h4>
                        <span className="text-xs text-gray-400 capitalize">{agent.category.replace('_', ' ')}</span>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 text-[10px] font-semibold rounded border ${autonomyMeta.color}`}>
                      L{agent.autonomyLevel}
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 mt-2 line-clamp-2">{agent.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Agent Configuration & Guardrails (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/60 backdrop-blur-md rounded-xl border border-white/10 p-6 space-y-6 shadow-lg">
          {/* Agent Header */}
          <div className="flex items-start justify-between pb-4 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white">{selectedAgent.name}</h3>
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {selectedAgent.status.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">{selectedAgent.purpose}</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-gray-400">Monthly Spend</span>
              <div className="text-sm font-bold text-white">
                ${selectedAgent.costLimits.currentMonthSpendUsd.toFixed(2)} / ${selectedAgent.costLimits.monthlyBudgetUsd.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Autonomy Level Control */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-brand-cyan" />
                Controlled Autonomy Level
              </label>
              <span className="text-xs text-gray-400">Enforced by Core Orchestrator</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
              {([0, 1, 2, 3, 4] as AgentAutonomyLevel[]).map(lvl => {
                const isActive = selectedAgent.autonomyLevel === lvl;
                const meta = AUTONOMY_LEVEL_LABELS[lvl];

                return (
                  <button
                    key={lvl}
                    onClick={() => handleAutonomyChange(lvl)}
                    className={`p-2.5 rounded-lg border text-left transition cursor-pointer ${
                      isActive
                        ? 'bg-brand-purple text-white border-brand-purple shadow-md'
                        : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <div className="text-xs font-bold">L{lvl}</div>
                    <div className="text-[11px] font-medium leading-tight mt-1 opacity-90 truncate">
                      {meta.name.split('—')[1]?.trim() || `Level ${lvl}`}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="p-3 rounded-lg bg-slate-950/60 border border-white/10 text-xs text-gray-300">
              <span className="font-semibold text-white">Current Setting: </span>
              {AUTONOMY_LEVEL_LABELS[selectedAgent.autonomyLevel].desc}
            </div>
          </div>

          {/* Granular Permission Matrix */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-brand-purple" />
                Granular Permissions Matrix
              </label>
              <span className="text-xs text-gray-400">Toggle enabled tools</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {allPermissions.map(perm => {
                const isEnabled = selectedAgent.permissions.includes(perm);
                const isFinancial = perm === 'FINANCIAL_ACTION';

                return (
                  <button
                    key={perm}
                    onClick={() => handlePermissionToggle(perm)}
                    className={`flex items-center justify-between p-2.5 rounded-lg border text-xs transition cursor-pointer ${
                      isEnabled
                        ? isFinancial
                          ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 font-semibold'
                          : 'bg-brand-purple/20 border-brand-purple/40 text-purple-200 font-medium'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    <span className="truncate">{perm.replace('_', ' ')}</span>
                    <span className={`w-2 h-2 rounded-full ${isEnabled ? (isFinancial ? 'bg-amber-400' : 'bg-brand-purple') : 'bg-gray-600'}`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Capabilities & Tools */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-white/10">
            <div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                Core Capabilities
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedAgent.capabilities.map(cap => (
                  <span key={cap} className="px-2 py-1 bg-white/5 rounded text-xs text-gray-300 border border-white/10">
                    {cap}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                Registered Tools
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedAgent.tools.map(tool => (
                  <span key={tool} className="px-2 py-1 bg-brand-purple/10 rounded text-xs text-purple-300 border border-brand-purple/20 font-mono">
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* System Instruction Excerpt */}
          <div className="pt-2 border-t border-white/10">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">
              System Instruction Boundary
            </span>
            <p className="text-xs font-mono text-gray-300 bg-slate-950/60 p-3 rounded-lg border border-white/10">
              "{selectedAgent.systemInstructions}"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
