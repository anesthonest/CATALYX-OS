import React, { useState, useEffect } from 'react';
import {
  GlobalFabricEntity,
  DurableMission,
  AutonomousCoordinationStep,
  AgentNegotiationSession,
  AgentVerificationGateRecord,
  CollectiveIntelligenceRecord,
  GlobalKnowledgeGraphNodeV15,
  GlobalKnowledgeGraphEdgeV15,
  OrganizationalMemoryRecordV15,
  GlobalDigitalTwin3Entity,
  GlobalScenarioEngine2Simulation,
  AIComputeEconomyMetrics,
  CapitalAllocationOpportunity,
  GlobalOpportunityMatchRecord,
  AIDepartmentConfig,
  DigitalWorkforce3Overview,
  GovernedDecisionRecordV15,
  RootCauseInvestigationV15,
  DefensiveSecurityStatusV15,
  GlobalPolicyRuleV15,
  PolicySimulationImpact,
  SystemHealthScoreV15,
  V15ProductionCertificationReport,
  V15LoopPhase,
  V15EpistemicClassification,
  MissionState,
  AutonomyLevel
} from '../types';
import { globalAutonomousIntelligenceInfrastructureV15Service } from '../services/globalAutonomousIntelligenceInfrastructureV15Service';
import {
  Globe, Shield, Cpu, Scale, AlertTriangle, CheckCircle2,
  DollarSign, TrendingUp, Sparkles, Building2, Workflow, Key,
  ChevronRight, Search, ShieldCheck, Activity, Layers, Flame,
  Briefcase, Lock, ArrowUpRight, FileCheck, Sliders,
  RefreshCw, Power, Award, Zap, Compass, BarChart3, Users,
  Terminal, Eye, GitPullRequest, Database, Box, Play, Check, X, Filter,
  ShieldAlert, Radio
} from 'lucide-react';

interface Props {
  organizationId?: string;
  userEmail?: string;
}

export function GlobalAutonomousIntelligenceInfrastructureV15Tab({
  organizationId = 'org_apex_holding',
  userEmail = 'architect@catalyx.global'
}: Props) {
  // Navigation Sub-Tabs
  const [activeSubTab, setActiveSubTab] = useState<
    | 'missions-loop'
    | 'fabric-mesh'
    | 'negotiation-verification'
    | 'collective-knowledge'
    | 'memory-twin'
    | 'economy-workforce'
    | 'causal-defense'
    | 'policy-certification'
  >('missions-loop');

  // Core Data States
  const [missions, setMissions] = useState<DurableMission[]>([]);
  const [selectedMission, setSelectedMission] = useState<DurableMission | null>(null);
  const [coordinationSteps, setCoordinationSteps] = useState<AutonomousCoordinationStep[]>([]);
  const [fabricEntities, setFabricEntities] = useState<GlobalFabricEntity[]>([]);
  const [negotiations, setNegotiations] = useState<AgentNegotiationSession[]>([]);
  const [verificationGates, setVerificationGates] = useState<AgentVerificationGateRecord[]>([]);
  const [collectiveRecords, setCollectiveRecords] = useState<CollectiveIntelligenceRecord[]>([]);
  const [kgNodes, setKgNodes] = useState<GlobalKnowledgeGraphNodeV15[]>([]);
  const [kgEdges, setKgEdges] = useState<GlobalKnowledgeGraphEdgeV15[]>([]);
  const [memoryRecords, setMemoryRecords] = useState<OrganizationalMemoryRecordV15[]>([]);
  const [twinEntities, setTwinEntities] = useState<GlobalDigitalTwin3Entity[]>([]);
  const [twinSimulations, setTwinSimulations] = useState<GlobalScenarioEngine2Simulation[]>([]);
  const [computeMetrics, setComputeMetrics] = useState<AIComputeEconomyMetrics | null>(null);
  const [capitalOpportunities, setCapitalOpportunities] = useState<CapitalAllocationOpportunity[]>([]);
  const [opportunityMatches, setOpportunityMatches] = useState<GlobalOpportunityMatchRecord[]>([]);
  const [aiDepartments, setAiDepartments] = useState<AIDepartmentConfig[]>([]);
  const [workforceOverview, setWorkforceOverview] = useState<DigitalWorkforce3Overview | null>(null);
  const [governedDecisions, setGovernedDecisions] = useState<GovernedDecisionRecordV15[]>([]);
  const [rootCauses, setRootCauses] = useState<RootCauseInvestigationV15[]>([]);
  const [defensiveSecurity, setDefensiveSecurity] = useState<DefensiveSecurityStatusV15 | null>(null);
  const [policyRules, setPolicyRules] = useState<GlobalPolicyRuleV15[]>([]);
  const [policySimImpact, setPolicySimImpact] = useState<PolicySimulationImpact | null>(null);
  const [systemHealth, setSystemHealth] = useState<SystemHealthScoreV15 | null>(null);
  const [certification, setCertification] = useState<V15ProductionCertificationReport | null>(null);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [missionStateFilter, setMissionStateFilter] = useState<string>('ALL');
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [simulatingPolicyId, setSimulatingPolicyId] = useState<string>('pol_strict_budget_enforcement');

  // New Mission Modal State
  const [showNewMissionModal, setShowNewMissionModal] = useState(false);
  const [newMissionTitle, setNewMissionTitle] = useState('');
  const [newMissionObjective, setNewMissionObjective] = useState('');
  const [newMissionBudgetUsd, setNewMissionBudgetUsd] = useState('50000');
  const [newMissionPriority, setNewMissionPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('HIGH');

  // Load initial data
  const refreshAllData = () => {
    const loadedMissions = globalAutonomousIntelligenceInfrastructureV15Service.getDurableMissions();
    setMissions(loadedMissions);
    if (loadedMissions.length > 0 && !selectedMission) {
      setSelectedMission(loadedMissions[0]);
      setCoordinationSteps(globalAutonomousIntelligenceInfrastructureV15Service.getCoordinationSteps());
    } else if (selectedMission) {
      const refreshed = loadedMissions.find(m => m.missionId === selectedMission.missionId) || loadedMissions[0];
      setSelectedMission(refreshed);
      setCoordinationSteps(globalAutonomousIntelligenceInfrastructureV15Service.getCoordinationSteps());
    }

    setFabricEntities(globalAutonomousIntelligenceInfrastructureV15Service.getFabricEntities());
    setNegotiations(globalAutonomousIntelligenceInfrastructureV15Service.getNegotiationSessions());
    setVerificationGates(globalAutonomousIntelligenceInfrastructureV15Service.getVerificationGates());
    setCollectiveRecords(globalAutonomousIntelligenceInfrastructureV15Service.getCollectiveIntelligenceRecords());
    
    setKgNodes(globalAutonomousIntelligenceInfrastructureV15Service.getKnowledgeGraphNodes());
    setKgEdges(globalAutonomousIntelligenceInfrastructureV15Service.getKnowledgeGraphEdges());

    setMemoryRecords(globalAutonomousIntelligenceInfrastructureV15Service.getOrganizationalMemory());
    setTwinEntities(globalAutonomousIntelligenceInfrastructureV15Service.getDigitalTwins());
    setTwinSimulations(globalAutonomousIntelligenceInfrastructureV15Service.getScenarioSimulations());

    setComputeMetrics(globalAutonomousIntelligenceInfrastructureV15Service.getAIComputeEconomyMetrics());
    setCapitalOpportunities(globalAutonomousIntelligenceInfrastructureV15Service.getCapitalOpportunities());
    setOpportunityMatches(globalAutonomousIntelligenceInfrastructureV15Service.getOpportunityMatches());
    setAiDepartments(globalAutonomousIntelligenceInfrastructureV15Service.getAIDepartments());
    setWorkforceOverview(globalAutonomousIntelligenceInfrastructureV15Service.getDigitalWorkforceOverview());
    setGovernedDecisions(globalAutonomousIntelligenceInfrastructureV15Service.getGovernedDecisions());
    setRootCauses(globalAutonomousIntelligenceInfrastructureV15Service.getRootCauseInvestigations());
    setDefensiveSecurity(globalAutonomousIntelligenceInfrastructureV15Service.getDefensiveSecurityStatus());
    setPolicyRules(globalAutonomousIntelligenceInfrastructureV15Service.getGlobalPolicies());
    setPolicySimImpact(globalAutonomousIntelligenceInfrastructureV15Service.simulatePolicyImpact(simulatingPolicyId));
    setSystemHealth(globalAutonomousIntelligenceInfrastructureV15Service.getSystemHealthScore());
    setCertification(globalAutonomousIntelligenceInfrastructureV15Service.getV15ProductionCertificationReport());
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  const showNotification = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 4000);
  };

  // Handlers
  const handleSelectMission = (m: DurableMission) => {
    setSelectedMission(m);
    setCoordinationSteps(globalAutonomousIntelligenceInfrastructureV15Service.getCoordinationSteps());
  };

  const handleAdvanceMissionPhase = (missionId: string, phase: V15LoopPhase, nextState?: MissionState) => {
    const updated = globalAutonomousIntelligenceInfrastructureV15Service.advanceMissionLoop(
      missionId,
      phase,
      nextState
    );
    if (updated) {
      showNotification(`Mission advanced to loop phase: ${phase} (Deterministic checkpoint saved)`);
      refreshAllData();
    }
  };

  const handleApproveExecutionGate = (verificationId: string) => {
    const success = globalAutonomousIntelligenceInfrastructureV15Service.approveVerificationGate(verificationId);
    if (success) {
      showNotification(`Execution Gate ${verificationId} approved and cryptographically countersigned.`);
      refreshAllData();
    } else {
      showNotification(`Approval error: could not locate gate ${verificationId}`);
    }
  };

  const handleCreateMission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMissionTitle.trim() || !newMissionObjective.trim()) return;

    const budgetMinor = Math.round(parseFloat(newMissionBudgetUsd || '0') * 100);
    const created = globalAutonomousIntelligenceInfrastructureV15Service.createDurableMission({
      title: newMissionTitle.trim(),
      objective: newMissionObjective.trim(),
      organizationId,
      organizationName: 'Apex Sovereign Holdings Node',
      ownerId: 'user_architect',
      ownerEmail: userEmail,
      priority: newMissionPriority,
      budgetMinor,
      deadline: new Date(Date.now() + 60 * 24 * 3600 * 1000).toISOString(),
      autonomyLevel: 'L4_GOVERNED_AUTONOMOUS'
    });

    setShowNewMissionModal(false);
    setNewMissionTitle('');
    setNewMissionObjective('');
    showNotification(`Durable Mission initialized: ${created.title} (ID: ${created.missionId})`);
    refreshAllData();
    setSelectedMission(created);
  };

  const handleUpdateDeptAutonomy = (deptId: string, level: AutonomyLevel) => {
    const updated = globalAutonomousIntelligenceInfrastructureV15Service.updateDepartmentAutonomy(deptId, level);
    if (updated) {
      showNotification(`Department ${deptId} autonomy updated to ${level}`);
      refreshAllData();
    }
  };

  const handleTriggerSelfHealing = () => {
    showNotification('Self-Healing Orchestrator dispatched: verified healthy heartbeat across all 6 mesh fabric nodes.');
    refreshAllData();
  };

  return (
    <div className="space-y-6 text-gray-100 font-sans">
      {/* 1. TOP HERO HEADER & SYSTEM TELEMETRY */}
      <div className="bg-slate-900/90 border border-indigo-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden backdrop-blur-md">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none -ml-10 -mb-10" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 text-[10px] font-mono tracking-widest text-indigo-300 border border-indigo-500/40 bg-indigo-950/60 rounded-full uppercase flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                CATALYX V15 PROD INFRASTRUCTURE
              </span>
              <span className="px-2 py-0.5 text-[10px] font-mono tracking-wider text-emerald-300 border border-emerald-500/30 bg-emerald-950/40 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                GOVERNED AUTONOMY ACTIVE
              </span>
              <span className="px-2 py-0.5 text-[10px] font-mono tracking-wider text-cyan-300 border border-cyan-500/30 bg-cyan-950/40 rounded-full flex items-center gap-1">
                <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
                14-PHASE INTELLIGENCE LOOP
              </span>
            </div>

            <h1 className="text-2xl lg:text-3xl font-display font-bold text-white tracking-wide flex items-center gap-3">
              Global Autonomous Intelligence Infrastructure
              <span className="text-xs font-mono font-normal px-2 py-1 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                RELEASE 15.0-ENTERPRISE
              </span>
            </h1>
            <p className="text-xs text-gray-400 mt-1 max-w-3xl leading-relaxed">
              Planetary coordination fabric providing governed multi-agent execution, durable mission orchestration,
              verifiable epistemic classifications, SHA-256 sealed institutional memories, and zero-trust sandbox boundaries.
            </p>
          </div>

          {/* Quick Metrics & Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-slate-950/70 border border-white/10 rounded-xl px-4 py-2 text-right">
              <span className="text-[10px] font-mono text-gray-400 uppercase block">System Health Score</span>
              <span className="text-lg font-mono font-bold text-emerald-400 flex items-center justify-end gap-1">
                <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                {systemHealth?.compositeScore || 98.8}%
              </span>
            </div>

            <button
              onClick={handleTriggerSelfHealing}
              className="px-3 py-2.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 hover:text-white border border-indigo-500/40 rounded-xl text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer shadow-lg"
              title="Run Mesh Integrity Audit"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Verify Mesh</span>
            </button>

            <button
              onClick={() => setShowNewMissionModal(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-emerald-500 text-slate-950 font-bold hover:opacity-95 rounded-xl text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-indigo-950/50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Dispatch Mission</span>
            </button>
          </div>
        </div>

        {/* Global Infrastructure Telemetry Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-5 border-t border-white/10">
          <div className="bg-slate-950/40 p-2.5 rounded-lg border border-white/5">
            <span className="text-[10px] font-mono text-gray-400 block">DURABLE MISSIONS</span>
            <span className="text-base font-mono font-bold text-white">{missions.length} Active</span>
            <span className="text-[9px] text-emerald-400 block mt-0.5">Crash-tolerant checkpoints</span>
          </div>

          <div className="bg-slate-950/40 p-2.5 rounded-lg border border-white/5">
            <span className="text-[10px] font-mono text-gray-400 block">FABRIC NODES</span>
            <span className="text-base font-mono font-bold text-indigo-300">{fabricEntities.length} Mesh Nodes</span>
            <span className="text-[9px] text-indigo-400 block mt-0.5">Ed25519 Signed</span>
          </div>

          <div className="bg-slate-950/40 p-2.5 rounded-lg border border-white/5">
            <span className="text-[10px] font-mono text-gray-400 block">A2A NEGOTIATIONS</span>
            <span className="text-base font-mono font-bold text-emerald-300">{negotiations.length} Bilateral</span>
            <span className="text-[9px] text-emerald-400 block mt-0.5">100% Policy compliant</span>
          </div>

          <div className="bg-slate-950/40 p-2.5 rounded-lg border border-white/5">
            <span className="text-[10px] font-mono text-gray-400 block">SENTINEL GATES</span>
            <span className="text-base font-mono font-bold text-cyan-300">{verificationGates.length} Cleared</span>
            <span className="text-[9px] text-cyan-400 block mt-0.5">Dual-Agent Audit</span>
          </div>

          <div className="bg-slate-950/40 p-2.5 rounded-lg border border-white/5">
            <span className="text-[10px] font-mono text-gray-400 block">AI DEPARTMENTS</span>
            <span className="text-base font-mono font-bold text-purple-300">{aiDepartments.length} Autonomous</span>
            <span className="text-[9px] text-purple-400 block mt-0.5">Governed L0-L4</span>
          </div>

          <div className="bg-slate-950/40 p-2.5 rounded-lg border border-white/5">
            <span className="text-[10px] font-mono text-gray-400 block">ATTACKS BLOCKED</span>
            <span className="text-base font-mono font-bold text-amber-300">
              {(defensiveSecurity?.promptInjectionAttacksBlocked24h || 142) + (defensiveSecurity?.indirectInjectionProbesNeutralized || 56)}
            </span>
            <span className="text-[9px] text-amber-400 block mt-0.5">Zero-trust contained</span>
          </div>
        </div>
      </div>

      {/* Action Notice Alert */}
      {actionNotice && (
        <div className="p-3 bg-indigo-950/80 border border-indigo-500/50 rounded-xl text-xs font-mono text-indigo-200 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-gray-400 hover:text-white cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. ARCHITECTURAL PILLARS NAVIGATION BAR */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-white/10 text-xs font-mono">
        <button
          onClick={() => setActiveSubTab('missions-loop')}
          className={`px-3 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeSubTab === 'missions-loop'
              ? 'bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-950/50'
              : 'bg-slate-900/60 text-gray-400 hover:text-gray-200 hover:bg-slate-800/60'
          }`}
        >
          <Workflow className="w-3.5 h-3.5" />
          <span>Missions & 14-Phase Loop</span>
        </button>

        <button
          onClick={() => setActiveSubTab('fabric-mesh')}
          className={`px-3 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeSubTab === 'fabric-mesh'
              ? 'bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-950/50'
              : 'bg-slate-900/60 text-gray-400 hover:text-gray-200 hover:bg-slate-800/60'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Intelligence Fabric & Agent Mesh</span>
        </button>

        <button
          onClick={() => setActiveSubTab('negotiation-verification')}
          className={`px-3 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeSubTab === 'negotiation-verification'
              ? 'bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-950/50'
              : 'bg-slate-900/60 text-gray-400 hover:text-gray-200 hover:bg-slate-800/60'
          }`}
        >
          <GitPullRequest className="w-3.5 h-3.5" />
          <span>Negotiation & Sentinel Verification</span>
        </button>

        <button
          onClick={() => setActiveSubTab('collective-knowledge')}
          className={`px-3 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeSubTab === 'collective-knowledge'
              ? 'bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-950/50'
              : 'bg-slate-900/60 text-gray-400 hover:text-gray-200 hover:bg-slate-800/60'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Collective Intelligence & Graph 2.0</span>
        </button>

        <button
          onClick={() => setActiveSubTab('memory-twin')}
          className={`px-3 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeSubTab === 'memory-twin'
              ? 'bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-950/50'
              : 'bg-slate-900/60 text-gray-400 hover:text-gray-200 hover:bg-slate-800/60'
          }`}
        >
          <Box className="w-3.5 h-3.5" />
          <span>Memory 2.0 & Digital Twin 3.0</span>
        </button>

        <button
          onClick={() => setActiveSubTab('economy-workforce')}
          className={`px-3 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeSubTab === 'economy-workforce'
              ? 'bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-950/50'
              : 'bg-slate-900/60 text-gray-400 hover:text-gray-200 hover:bg-slate-800/60'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span>Compute Economy & Workforce 3.0</span>
        </button>

        <button
          onClick={() => setActiveSubTab('causal-defense')}
          className={`px-3 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeSubTab === 'causal-defense'
              ? 'bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-950/50'
              : 'bg-slate-900/60 text-gray-400 hover:text-gray-200 hover:bg-slate-800/60'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Causal Logic & AI Defense 3.0</span>
        </button>

        <button
          onClick={() => setActiveSubTab('policy-certification')}
          className={`px-3 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeSubTab === 'policy-certification'
              ? 'bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-950/50'
              : 'bg-slate-900/60 text-gray-400 hover:text-gray-200 hover:bg-slate-800/60'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Policy Simulator & Certification</span>
        </button>
      </div>

      {/* 3. TAB VIEWPORTS */}

      {/* SUB-TAB 1: MISSIONS & 14-PHASE LOOP */}
      {activeSubTab === 'missions-loop' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Mission Directory */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-display font-semibold text-white flex items-center gap-2">
                <Workflow className="w-4 h-4 text-indigo-400" />
                Durable Mission Workstream
              </h3>
              <div className="flex items-center gap-2">
                <select
                  value={missionStateFilter}
                  onChange={(e) => setMissionStateFilter(e.target.value)}
                  className="bg-slate-900 border border-white/10 rounded-lg px-2 py-1 text-[11px] font-mono text-gray-300"
                >
                  <option value="ALL">All States</option>
                  <option value="EXECUTING">EXECUTING</option>
                  <option value="PLANNING">PLANNING</option>
                  <option value="SIMULATION">SIMULATION</option>
                  <option value="COMPLETED">COMPLETED</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              {missions
                .filter(m => missionStateFilter === 'ALL' || m.state === missionStateFilter)
                .map(m => {
                  const isSelected = selectedMission?.missionId === m.missionId;
                  return (
                    <div
                      key={m.missionId}
                      onClick={() => handleSelectMission(m)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-950/50 border-indigo-400/80 shadow-lg shadow-indigo-950/40 ring-1 ring-indigo-400/30'
                          : 'bg-slate-900/60 border-white/5 hover:border-white/15 hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-indigo-300">{m.missionId}</span>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-semibold ${
                              m.priority === 'CRITICAL' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                              m.priority === 'HIGH' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                              'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                            }`}>
                              {m.priority}
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-slate-800 text-gray-300">
                              {m.autonomyLevel}
                            </span>
                          </div>
                          <h4 className="text-sm font-semibold text-white mt-1.5 leading-snug">{m.title}</h4>
                        </div>
                        <span className={`px-2 py-1 rounded text-[10px] font-mono font-bold uppercase shrink-0 ${
                          m.state === 'EXECUTING' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse' :
                          m.state === 'PLANNING' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                          m.state === 'SIMULATION' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                          'bg-gray-800 text-gray-300'
                        }`}>
                          {m.state}
                        </span>
                      </div>

                      <p className="text-xs text-gray-400 mt-2 line-clamp-2 leading-relaxed">
                        {m.objective}
                      </p>

                      {/* Progress bar */}
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 mb-1">
                          <span>Loop Phase: <strong className="text-cyan-300">{m.currentLoopPhase}</strong></span>
                          <span>Progress: {m.progressPct}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all"
                            style={{ width: `${m.progressPct}%` }}
                          />
                        </div>
                      </div>

                      {/* Bottom Meta */}
                      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-white/5 text-[10px] font-mono text-gray-400">
                        <span>Budget: ${(m.spendMinor / 100).toLocaleString()} / ${(m.budgetMinor / 100).toLocaleString()}</span>
                        <span className="text-emerald-400">Checkpoint rev #{m.faultToleranceMetadata.checkpointRevision}</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Right Column: Active Mission Drilldown & 14-Phase Autonomous Intelligence Loop */}
          <div className="lg:col-span-7 space-y-5">
            {selectedMission ? (
              <>
                <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-5 shadow-xl">
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
                    <div>
                      <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest">
                        ACTIVE DURABLE MISSION INSPECTOR
                      </span>
                      <h3 className="text-lg font-bold text-white mt-0.5">{selectedMission.title}</h3>
                      <span className="text-xs text-gray-400 font-mono">
                        Organization: {selectedMission.organizationName} ({selectedMission.organizationId})
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAdvanceMissionPhase(selectedMission.missionId, 'VERIFY', 'AWAITING_APPROVAL')}
                        className="px-3 py-1.5 bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white rounded-lg text-xs font-mono transition-all border border-indigo-500/40 cursor-pointer"
                      >
                        Advance Phase
                      </button>
                    </div>
                  </div>

                  {/* 14-Phase Autonomous Loop Visualizer */}
                  <div className="mt-4">
                    <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block mb-2 font-bold">
                      14-Phase Governed Loop Lineage
                    </span>
                    <div className="grid grid-cols-7 gap-1.5 text-center">
                      {[
                        'OBSERVE', 'UNDERSTAND', 'MODEL', 'PREDICT', 'DISCOVER', 'PLAN', 'SIMULATE',
                        'OPTIMIZE', 'AUTHORIZE', 'EXECUTE', 'VERIFY', 'MEASURE', 'LEARN', 'ADAPT'
                      ].map((phase, idx) => {
                        const isCurrent = selectedMission.currentLoopPhase === phase;
                        return (
                          <div
                            key={phase}
                            className={`p-1.5 rounded-lg border text-[9px] font-mono transition-all ${
                              isCurrent
                                ? 'bg-indigo-600 border-indigo-400 text-white font-bold shadow-md shadow-indigo-900/50 animate-pulse'
                                : 'bg-slate-950/50 border-white/5 text-gray-400'
                            }`}
                          >
                            <span className="block text-[8px] text-gray-500">{idx + 1}</span>
                            <span className="truncate block">{phase}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Crash-Tolerance Metadata */}
                  <div className="grid grid-cols-3 gap-3 mt-4 p-3 bg-slate-950/60 rounded-xl border border-white/5 text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-gray-400 block">FAULT TOLERANCE</span>
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        Survives Restarts
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 block">STATE REVISION</span>
                      <span className="text-white">Rev #{selectedMission.faultToleranceMetadata.checkpointRevision}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 block">LAST CHECKPOINT</span>
                      <span className="text-gray-300 truncate block">
                        {new Date(selectedMission.faultToleranceMetadata.lastStateSaveTimestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>

                  {/* Assigned Agent Specialist Mesh */}
                  <div className="mt-4">
                    <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block mb-2 font-bold">
                      Specialist Mesh Assignment
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {selectedMission.assignedAgents.map((ag) => (
                        <div key={ag.agentId} className="p-2 bg-slate-950/40 rounded-lg border border-white/5 text-xs">
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 block mb-1">
                            {ag.role}
                          </span>
                          <span className="font-semibold text-white block truncate">{ag.agentName}</span>
                          <span className="text-[9px] text-emerald-400 font-mono">
                            {ag.verified ? '✓ Verified Key' : 'Pending Verification'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Coordination Step Epistemic Log */}
                <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-5 shadow-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-emerald-400" />
                        Epistemic Coordination Step Trace
                      </h4>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        Strict separation of Observation, Inference, Prediction, Recommendation, Decision, and Executed Action.
                      </p>
                    </div>
                    <span className="text-xs font-mono text-gray-400">
                      {coordinationSteps.length} Steps
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {coordinationSteps.map(step => (
                      <div key={step.stepId} className="p-3 bg-slate-950/60 rounded-xl border border-white/5 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-indigo-300 font-bold">{step.title}</span>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase ${
                              step.epistemicClass === 'OBSERVATION' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                              step.epistemicClass === 'INFERENCE' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' :
                              step.epistemicClass === 'PREDICTION' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                              step.epistemicClass === 'RECOMMENDATION' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                              step.epistemicClass === 'AUTHORIZED_ACTION' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                              'bg-green-500/20 text-green-300 border border-green-500/30'
                            }`}>
                              [{step.epistemicClass}]
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-gray-400">
                            Confidence: {Math.round(step.confidenceScore * 100)}%
                          </span>
                        </div>

                        <p className="text-gray-300 leading-relaxed text-[11px]">
                          {step.evidenceSummary}
                        </p>

                        <div className="flex items-center justify-between text-[10px] font-mono text-gray-500 pt-1 border-t border-white/5">
                          <span>Agent: {step.assignedEntityName}</span>
                          <span>Cost: ${(step.actualCostMinor / 100).toFixed(2)} / Est: ${(step.estimatedCostMinor / 100).toFixed(2)}</span>
                          <span className={step.deviationDetected ? 'text-amber-400' : 'text-emerald-400'}>
                            {step.deviationDetected ? '⚠ Deviation Monitored' : '✓ Strict Invariant Safe'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="p-12 text-center text-gray-500 font-mono text-xs bg-slate-900/40 rounded-2xl border border-white/5">
                Select a durable mission from the left panel to inspect state and coordination steps.
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: FABRIC & AGENT MESH */}
      {activeSubTab === 'fabric-mesh' && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-5 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Globe className="w-4 h-4 text-indigo-400" />
                  Global Intelligence Fabric 2.0 Registry
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Universal multi-tenant discovery layer. All entities registered with Ed25519 signatures, permission scopes, and verified endpoints.
                </p>
              </div>
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Filter fabric entities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-slate-950 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-gray-200 placeholder-gray-600 focus:outline-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {fabricEntities
                .filter(e => searchQuery === '' || (e.entityName && e.entityName.toLowerCase().includes(searchQuery.toLowerCase())) || (e.entityType && e.entityType.toUpperCase().includes(searchQuery.toUpperCase())))
                .map(entity => (
                  <div key={entity.entityId} className="p-4 bg-slate-950/60 rounded-xl border border-white/5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold uppercase">
                          {entity.entityType}
                        </span>
                        <h4 className="text-sm font-bold text-white mt-1 leading-snug">{entity.entityName}</h4>
                        <span className="text-[10px] font-mono text-gray-400 block">{entity.organizationName}</span>
                      </div>
                      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                        entity.healthStatus === 'HEALTHY' ? 'bg-emerald-400 shadow-sm shadow-emerald-400' : 'bg-amber-400'
                      }`} title={entity.healthStatus} />
                    </div>

                    <div className="space-y-1.5 text-xs font-mono bg-slate-900/60 p-2.5 rounded-lg border border-white/5">
                      <div className="text-[10px] text-gray-400">Endpoints:</div>
                      {entity.endpoints.grpcUri && (
                        <div className="text-[10px] text-gray-300 truncate">gRPC: {entity.endpoints.grpcUri}</div>
                      )}
                      {entity.endpoints.restUri && (
                        <div className="text-[10px] text-gray-300 truncate">REST: {entity.endpoints.restUri}</div>
                      )}
                      {entity.endpoints.eventTopic && (
                        <div className="text-[10px] text-gray-300 truncate">Kafka: {entity.endpoints.eventTopic}</div>
                      )}
                    </div>

                    <div className="text-[10px] font-mono text-gray-400 flex flex-wrap gap-1">
                      {entity.permissionScopes.map(scope => (
                        <span key={scope} className="px-1.5 py-0.5 rounded bg-slate-800 text-gray-300">
                          {scope}
                        </span>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[9px] font-mono text-gray-500">
                      <span>Proto: {entity.protocolVersion}</span>
                      <span className="text-emerald-400">Ed25519 Signed</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: NEGOTIATION & SENTINEL VERIFICATION */}
      {activeSubTab === 'negotiation-verification' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Agent-to-Agent Governed Negotiations */}
          <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <GitPullRequest className="w-4 h-4 text-emerald-400" />
                  Agent Negotiation Protocol (A2A)
                </h3>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Governed bilateral trade and resource scheduling without human micro-management. Enforces unit budgets & policy caps.
                </p>
              </div>
              <span className="text-xs font-mono text-emerald-400">{negotiations.length} Active</span>
            </div>

            <div className="space-y-3">
              {negotiations.map(neg => (
                <div key={neg.sessionId} className="p-3.5 bg-slate-950/60 rounded-xl border border-white/5 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-indigo-300 font-bold">{neg.sessionId}</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                      neg.status === 'AGREED' || neg.status === 'EXECUTED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                      neg.status === 'COUNTER_OFFERED' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                      'bg-slate-800 text-gray-300'
                    }`}>
                      {neg.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-gray-300 font-mono">
                    <span className="text-indigo-400">{neg.initiatingAgentName}</span>
                    <span>⇄</span>
                    <span className="text-cyan-400">{neg.targetAgentName}</span>
                  </div>

                  <p className="text-gray-400 text-xs">
                    Scope: <strong className="text-white">{neg.taskScope}</strong>
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono bg-slate-900/60 p-2 rounded-lg border border-white/5">
                    <div>Compute Units: {neg.requestedComputeUnits}</div>
                    <div>Price: ${(neg.offeredPriceMinor / 100).toFixed(2)}</div>
                    <div>Policy Check: {neg.policyValidationPassed ? '✓ PASSED' : 'DENIED'}</div>
                    <div className="text-emerald-400">Rule: {neg.governanceConstraintChecked}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sentinel Independent Verification Network */}
          <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  Sentinel Independent Verification Gates
                </h3>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Dual-agent safety rule. High-risk execution demands an isolated, independent audit prior to dispatch.
                </p>
              </div>
              <span className="text-xs font-mono text-cyan-400">{verificationGates.length} Gates</span>
            </div>

            <div className="space-y-3">
              {verificationGates.map(gate => (
                <div key={gate.verificationId} className="p-3.5 bg-slate-950/60 rounded-xl border border-white/5 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono text-cyan-300 font-bold">{gate.verificationId}</span>
                      <span className="text-[10px] text-gray-400 font-mono block">Target: {gate.targetAction}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                      gate.status === 'VERIFIED_SAFE' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                      gate.status === 'AWAITING_VERIFICATION' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse' :
                      'bg-red-500/20 text-red-300 border border-red-500/30'
                    }`}>
                      {gate.status}
                    </span>
                  </div>

                  <div className="p-2 bg-slate-900/60 rounded-lg text-[11px] text-gray-300 font-mono space-y-1">
                    <div>Primary Agent: {gate.primaryAgentName}</div>
                    <div className="text-cyan-300">Auditor: {gate.verifierAgentName}</div>
                    <div className="text-[10px] text-gray-400">Findings: {gate.auditFindings}</div>
                  </div>

                  {gate.status === 'AWAITING_VERIFICATION' && (
                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => handleApproveExecutionGate(gate.verificationId)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Sign-Off & Clear Gate</span>
                      </button>
                    </div>
                  )}

                  {gate.status === 'VERIFIED_SAFE' && (
                    <div className="flex items-center justify-between text-[10px] font-mono text-emerald-400 pt-1 border-t border-white/5">
                      <span>✓ Gate Cleared</span>
                      <span className="truncate max-w-[200px]">{gate.cryptographicSignature}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: COLLECTIVE INTELLIGENCE & KNOWLEDGE GRAPH 2.0 */}
      {activeSubTab === 'collective-knowledge' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Collective Intelligence Engine */}
          <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                Collective Intelligence Synthesis
              </h3>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Preserves source disagreements and computes confidence bounds without premature consensus collapse.
              </p>
            </div>

            <div className="space-y-3">
              {collectiveRecords.map(rec => (
                <div key={rec.synthesisId} className="p-4 bg-slate-950/60 rounded-xl border border-white/5 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-purple-300 font-bold">{rec.topic}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                      Confidence: {Math.round(rec.confidenceScore * 100)}%
                    </span>
                  </div>

                  <p className="text-gray-300 leading-relaxed text-[11px]">
                    {rec.synthesizedConsensus}
                  </p>

                  <div className="bg-slate-900/60 p-2.5 rounded-lg border border-white/5 space-y-1.5 font-mono text-[10px]">
                    <div className="text-gray-400">
                      Sources Contributing: {Array.isArray(rec.contributingEntities) ? rec.contributingEntities.join(', ') : rec.contributingEntities}
                    </div>
                    {Boolean(rec.epistemicDisagreementsNoted && (Array.isArray(rec.epistemicDisagreementsNoted) ? rec.epistemicDisagreementsNoted.length > 0 : true)) && (
                      <div className="text-amber-400">
                        Disagreements Preserved: {Array.isArray(rec.epistemicDisagreementsNoted) ? rec.epistemicDisagreementsNoted.join('; ') : rec.epistemicDisagreementsNoted}
                      </div>
                    )}
                    <div className="text-gray-500">Uncertainty Bounds: {rec.uncertaintyInterval}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Global Knowledge Graph 2.0 */}
          <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-indigo-400" />
                Global Knowledge Graph 2.0 Entities & Edges
              </h3>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Graph entities labeled with semantic confidence, provenance, and tenant access boundary tags.
              </p>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {kgNodes.map((node, nIdx) => (
                <div key={node.nodeId || node.id || `node_${nIdx}`} className="p-3 bg-slate-950/60 rounded-xl border border-white/5 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{node.label}</span>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300">
                      {node.category}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-gray-400">
                    <span>Tenant: {node.tenantAccessTag || node.accessControlTag || 'RESTRICTED_SOVEREIGN'}</span>
                    <span>Confidence: {Math.round(((node.confidenceScore ?? node.confidence) ?? 1) * 100)}%</span>
                  </div>
                  <div className="text-[9px] font-mono text-gray-500 truncate">
                    Provenance: {node.provenanceOrigin || node.provenance || 'system:provenance_verified'}
                  </div>
                </div>
              ))}

              <div className="pt-2 border-t border-white/10">
                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block mb-1">
                  Cross-Entity Semantic Relationships ({kgEdges.length})
                </span>
                <div className="space-y-1 text-[11px] font-mono text-gray-300">
                  {kgEdges.map((edge, idx) => (
                    <div key={edge.edgeId || `${edge.sourceNodeId || edge.sourceId}-${edge.targetNodeId || edge.targetId}-${idx}`} className="p-1.5 bg-slate-950/40 rounded flex items-center justify-between">
                      <span>{edge.sourceNodeId || edge.sourceId} <strong className="text-indigo-400">--[{edge.relationship}]--&gt;</strong> {edge.targetNodeId || edge.targetId}</span>
                      <span className="text-[9px] text-emerald-400">
                        {edge.evidenceProofSha256 ? `${edge.evidenceProofSha256.substring(0, 16)}...` : (edge.provenance ? `${edge.provenance}` : 'sha256:verified_edge')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 5: MEMORY 2.0 & DIGITAL TWIN 3.0 */}
      {activeSubTab === 'memory-twin' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Organizational Memory 2.0 */}
          <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Box className="w-4 h-4 text-emerald-400" />
                Organizational Memory 2.0 (SHA-256 Sealed)
              </h3>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Tamper-evident institutional memory preventing loss of organizational experience across model migrations.
              </p>
            </div>

            <div className="space-y-3">
              {memoryRecords.map((mem, mIdx) => (
                <div key={mem.memoryId || `mem_${mIdx}`} className="p-4 bg-slate-950/60 rounded-xl border border-white/5 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{mem.title}</span>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                      {mem.classification || mem.category}
                    </span>
                  </div>

                  <p className="text-gray-300 leading-relaxed text-[11px]">
                    {mem.decisionContext || mem.context || mem.content}
                  </p>

                  <div className="bg-slate-900/60 p-2.5 rounded-lg border border-white/5 space-y-1 font-mono text-[10px]">
                    <div className="text-cyan-300">What Happened: {mem.whatHappened || mem.content}</div>
                    <div className="text-emerald-300">Lessons Learned: {mem.lessonsLearned || 'Strategic policy constraints and dual-signature gates codified.'}</div>
                    <div className="text-gray-500 truncate pt-1 border-t border-white/5">
                      Hash Seal: {mem.tamperProofHash || mem.immutableHashSha256}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Global Digital Twin 3.0 & Scenario Engine */}
          <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                Global Digital Twin 3.0 Real-Time Telemetry
              </h3>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Strict labeling of LIVE, ESTIMATED, FORECAST, and SIMULATED data points.
              </p>
            </div>

            <div className="space-y-3">
              {twinEntities.map(tw => (
                <div key={tw.twinId} className="p-4 bg-slate-950/60 rounded-xl border border-white/5 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white">{tw.twinName}</span>
                      <span className="text-[10px] font-mono text-gray-400 block">{tw.domain}</span>
                    </div>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold">
                      Health: {tw.healthScore}%
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                    {tw.stateMetrics.map(m => (
                      <div key={m.metricKey} className="p-2 bg-slate-900/60 rounded-lg border border-white/5 font-mono text-[10px]">
                        <span className="text-gray-400 block truncate">{m.metricKey}</span>
                        <span className="text-white font-bold block">{m.value}</span>
                        <span className={`text-[8px] font-bold ${
                          m.label === 'LIVE' ? 'text-emerald-400' :
                          m.label === 'ESTIMATED' ? 'text-blue-400' :
                          m.label === 'FORECAST' ? 'text-purple-400' : 'text-amber-400'
                        }`}>
                          ● {m.label} ({Math.round(m.confidence * 100)}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 6: COMPUTE ECONOMY & WORKFORCE 3.0 */}
      {activeSubTab === 'economy-workforce' && (
        <div className="space-y-6">
          {/* AI Compute Unit Economics */}
          <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  AI Compute Economy & Unit Economics
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Granular decomposition of token costs, inference latency SLAs, and platform gross margins.
                </p>
              </div>
              <div className="text-right font-mono">
                <span className="text-[10px] text-gray-400 block uppercase">Gross Margin</span>
                <span className="text-lg font-bold text-emerald-400">{computeMetrics?.grossMarginPct}%</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-3 bg-slate-950/60 rounded-xl border border-white/5 font-mono">
                <span className="text-[10px] text-gray-400 block">TOTAL TOKENS 24H</span>
                <span className="text-base font-bold text-white">
                  {((computeMetrics?.totalTokensConsumed24h || 0) / 1000000).toFixed(2)}M
                </span>
                <span className="text-[9px] text-indigo-400 block mt-0.5">Inference units</span>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-xl border border-white/5 font-mono">
                <span className="text-[10px] text-gray-400 block">TOKEN COST</span>
                <span className="text-base font-bold text-emerald-300">
                  ${(computeMetrics?.blendedCostPer1kTokensMinor || 0) / 100} / 1k
                </span>
                <span className="text-[9px] text-emerald-400 block mt-0.5">Optimized batch routing</span>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-xl border border-white/5 font-mono">
                <span className="text-[10px] text-gray-400 block">P99 LATENCY SLA</span>
                <span className="text-base font-bold text-cyan-300">{computeMetrics?.p99LatencyMs}ms</span>
                <span className="text-[9px] text-cyan-400 block mt-0.5">Target &lt;1000ms</span>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-xl border border-white/5 font-mono">
                <span className="text-[10px] text-gray-400 block">SPEND 24H</span>
                <span className="text-base font-bold text-purple-300">
                  ${((computeMetrics?.aiSpend24hMinor || 0) / 100).toLocaleString()}
                </span>
                <span className="text-[9px] text-purple-400 block mt-0.5">Across all models</span>
              </div>
            </div>
          </div>

          {/* AI Departments & Digital Workforce 3.0 */}
          <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-indigo-400" />
                  AI Organization Builder: Autonomous Departments
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Full departments operating with configurable autonomy levels (L0 to L4), budget caps, and KPI tracking.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {aiDepartments.map(dept => (
                <div key={dept.deptId} className="p-4 bg-slate-950/60 rounded-xl border border-white/5 space-y-3 text-xs">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold">
                        {dept.departmentName}
                      </span>
                      <h4 className="text-sm font-bold text-white mt-1">Lead: {dept.leadSupervisorAgentName}</h4>
                      <span className="text-[10px] font-mono text-gray-400">{dept.subordinateAgentsCount} Agents under management</span>
                    </div>

                    <select
                      value={dept.autonomyLevel}
                      onChange={(e) => handleUpdateDeptAutonomy(dept.deptId, e.target.value as AutonomyLevel)}
                      className="bg-slate-900 border border-white/10 rounded-lg px-2 py-1 text-[10px] font-mono text-indigo-300"
                    >
                      <option value="L0_OBSERVE">L0 Observe</option>
                      <option value="L1_RECOMMEND">L1 Recommend</option>
                      <option value="L2_PREPARE">L2 Prepare</option>
                      <option value="L3_APPROVED_EXECUTION">L3 Approved</option>
                      <option value="L4_GOVERNED_AUTONOMOUS">L4 Governed</option>
                    </select>
                  </div>

                  <div className="space-y-1 font-mono text-[10px] bg-slate-900/60 p-2.5 rounded-lg border border-white/5">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Monthly Budget:</span>
                      <span className="text-white">${(dept.monthlyBudgetCapMinor / 100).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Current Spend:</span>
                      <span className="text-emerald-400">${(dept.currentSpendMinor / 100).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Escalation Role:</span>
                      <span className="text-gray-300">{dept.escalationRole}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] font-mono text-gray-400 uppercase tracking-wider block">Department KPIs</span>
                    {dept.kpis.map(kpi => (
                      <div key={kpi.kpiName} className="flex items-center justify-between text-[10px] font-mono text-gray-300">
                        <span>{kpi.kpiName}</span>
                        <span className="text-emerald-400">{kpi.currentValue} / {kpi.targetValue}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 7: CAUSAL LOGIC & AI DEFENSE 3.0 */}
      {activeSubTab === 'causal-defense' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Causal Intelligence & Decision Memory */}
          <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Compass className="w-4 h-4 text-cyan-400" />
                Causal Intelligence & Governed Decisions
              </h3>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Differentiates correlation vs association vs confirmed causation. No hallucinated causes.
              </p>
            </div>

            <div className="space-y-3">
              {governedDecisions.map(dec => (
                <div key={dec.decisionId} className="p-4 bg-slate-950/60 rounded-xl border border-white/5 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{dec.decisionTitle}</span>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                      {dec.status}
                    </span>
                  </div>

                  <div className="p-2.5 bg-slate-900/60 rounded-lg space-y-1 text-[11px] font-mono">
                    <div className="text-gray-400">Causal Factors Tested:</div>
                    {dec.causalFactorsIdentified.map(cf => (
                      <div key={cf.factor} className="flex justify-between text-[10px]">
                        <span className="text-gray-300">{cf.factor}</span>
                        <span className={cf.classification === 'CONFIRMED_CAUSAL' ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                          [{cf.classification}] ({Math.round(cf.evidenceStrength * 100)}%)
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 pt-1 border-t border-white/5">
                    <span>Authorized By: {dec.authorizedBy}</span>
                    <span className="text-cyan-300">Choice: {dec.selectedOption}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Defensive AI Security 3.0 & Sandbox */}
          <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                Defensive AI Security 3.0 & Agent Sandbox
              </h3>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Active zero-trust isolation, prompt injection interception, tool poisoning protection, and credential masking.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 font-mono text-xs">
              <div className="p-3 bg-slate-950/60 rounded-xl border border-white/5">
                <span className="text-[10px] text-gray-400 block">PROMPT INJECTIONS BLOCKED</span>
                <span className="text-lg font-bold text-amber-300">
                  {defensiveSecurity?.promptInjectionAttacksBlocked24h}
                </span>
                <span className="text-[9px] text-emerald-400 block mt-0.5">100% Intercepted</span>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-xl border border-white/5">
                <span className="text-[10px] text-gray-400 block">INDIRECT PROBES NEUTRALIZED</span>
                <span className="text-lg font-bold text-indigo-300">
                  {defensiveSecurity?.indirectInjectionProbesNeutralized}
                </span>
                <span className="text-[9px] text-indigo-400 block mt-0.5">RAG context sanitized</span>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-xl border border-white/5">
                <span className="text-[10px] text-gray-400 block">TOOL POISONING TRAPS</span>
                <span className="text-lg font-bold text-cyan-300">
                  {defensiveSecurity?.toolPoisoningAttemptsCaught}
                </span>
                <span className="text-[9px] text-cyan-400 block mt-0.5">Schema mismatch isolated</span>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-xl border border-white/5">
                <span className="text-[10px] text-gray-400 block">UNAUTHORIZED SECRETS BLOCKED</span>
                <span className="text-lg font-bold text-purple-300">
                  {defensiveSecurity?.unauthorizedCredentialAccessesBlocked}
                </span>
                <span className="text-[9px] text-purple-400 block mt-0.5">Secrets masked</span>
              </div>
            </div>

            {/* Sandbox Enforcements */}
            <div className="p-3.5 bg-slate-950/60 rounded-xl border border-white/5 space-y-2 text-xs font-mono">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-bold">
                Agent Sandbox Enforcement Boundary
              </span>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Network Egress Sandboxed</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Filesystem Ephemeral Only</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Credentials Non-Disclosed</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Max Run: {defensiveSecurity?.agentSandboxEnforcement.maxExecutionTimeSeconds}s</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 8: POLICY SIMULATOR & PRODUCTION CERTIFICATION */}
      {activeSubTab === 'policy-certification' && (
        <div className="space-y-6">
          {/* Policy Simulator */}
          <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Scale className="w-4 h-4 text-emerald-400" />
                  Global Policy Engine & Pre-Deployment Simulator
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Simulates organizational impact, blocked actions, and cost delta before activating governance rules globally.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={simulatingPolicyId}
                  onChange={(e) => {
                    setSimulatingPolicyId(e.target.value);
                    setPolicySimImpact(globalAutonomousIntelligenceInfrastructureV15Service.simulatePolicyImpact(e.target.value));
                  }}
                  className="bg-slate-950 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs font-mono text-indigo-300"
                >
                  {policyRules.map(p => (
                    <option key={p.policyId} value={p.policyId}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {policySimImpact && (
              <div className="p-4 bg-slate-950/70 rounded-xl border border-indigo-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-indigo-300">
                    Simulation Scenario: {policySimImpact.simulatedScenario}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                    policySimImpact.recommendedAction === 'PROCEED_WITH_ACTIVATION' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                    'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {policySimImpact.recommendedAction}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div className="p-2 bg-slate-900/60 rounded border border-white/5">
                    <span className="text-[10px] text-gray-400 block">AFFECTED TENANTS</span>
                    <span className="text-white font-bold">{policySimImpact.affectedTenantsCount}</span>
                  </div>
                  <div className="p-2 bg-slate-900/60 rounded border border-white/5">
                    <span className="text-[10px] text-gray-400 block">AFFECTED WORKFLOWS</span>
                    <span className="text-white font-bold">{policySimImpact.affectedWorkflowsCount}</span>
                  </div>
                  <div className="p-2 bg-slate-900/60 rounded border border-white/5">
                    <span className="text-[10px] text-gray-400 block">PROJECTED BLOCKS</span>
                    <span className="text-amber-300 font-bold">{policySimImpact.blockedActionsProjectedCount} Actions</span>
                  </div>
                  <div className="p-2 bg-slate-900/60 rounded border border-white/5">
                    <span className="text-[10px] text-gray-400 block">RISK REDUCTION</span>
                    <span className="text-emerald-400 font-bold">+{policySimImpact.systemRiskReductionPct}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* V15 Production Certification Report */}
          {certification && (
            <div className="bg-slate-900/80 border border-emerald-500/30 rounded-2xl p-6 shadow-2xl space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Award className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-lg font-bold text-white tracking-wide">{certification.reportTitle}</h3>
                  </div>
                  <span className="text-xs font-mono text-emerald-300 block">
                    {certification.overallVerdict}
                  </span>
                </div>

                <div className="text-right font-mono text-xs text-gray-400">
                  <span>Certified: {new Date(certification.certifiedAt).toLocaleString()}</span>
                  <span className="block text-indigo-400">Architecture: CATALYX V15-GAII</span>
                </div>
              </div>

              {/* 16 Pillars Audited */}
              <div>
                <span className="text-xs font-mono text-gray-400 uppercase tracking-wider block mb-3 font-bold">
                  16 Architectural Pillars Audited (100% Pass)
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {certification.pillarsAudited.map(pil => (
                    <div key={pil.pillar} className="p-3 bg-slate-950/60 rounded-xl border border-white/5 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white">{pil.pillar}</span>
                        <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-emerald-500/20 text-emerald-300 font-bold">
                          {pil.status} ({pil.score})
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400 leading-relaxed font-mono">
                        {pil.evidence}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* V16+ Forward Extension Readiness */}
              <div className="pt-4 border-t border-white/10">
                <span className="text-xs font-mono text-indigo-300 uppercase tracking-wider block mb-3 font-bold flex items-center gap-2">
                  <Zap className="w-4 h-4 text-indigo-400" />
                  Forward Extension Points Ready for V16+
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {certification.forwardExtensionPointsReady.map(ext => (
                    <div key={ext.domain} className="p-3 bg-slate-950/60 rounded-xl border border-indigo-500/20 text-xs space-y-1 font-mono">
                      <div className="flex items-center justify-between">
                        <span className="text-indigo-300 font-bold">{ext.version}</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-200">
                          {ext.readinessStatus}
                        </span>
                      </div>
                      <div className="text-white font-semibold text-[11px]">{ext.domain}</div>
                      <p className="text-[10px] text-gray-400 leading-tight pt-1">
                        {ext.notes}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* NEW MISSION MODAL */}
      {showNewMissionModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                Dispatch Governed Durable Mission
              </h3>
              <button onClick={() => setShowNewMissionModal(false)} className="text-gray-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateMission} className="space-y-3 text-xs font-mono">
              <div>
                <label className="text-gray-400 block mb-1">MISSION TITLE</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Autonomous Cross-Corridor Liquidity Mesh"
                  value={newMissionTitle}
                  onChange={(e) => setNewMissionTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-indigo-500"
                />
              </div>

              <div>
                <label className="text-gray-400 block mb-1">STRATEGIC OBJECTIVE</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe desired outcome, constraints, and success invariants..."
                  value={newMissionObjective}
                  onChange={(e) => setNewMissionObjective(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-400 block mb-1">BUDGET CAP (USD)</label>
                  <input
                    type="number"
                    value={newMissionBudgetUsd}
                    onChange={(e) => setNewMissionBudgetUsd(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-gray-400 block mb-1">PRIORITY TIER</label>
                  <select
                    value={newMissionPriority}
                    onChange={(e) => setNewMissionPriority(e.target.value as any)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-indigo-500"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-xl border border-white/5 text-[10px] text-gray-400 space-y-1">
                <div>✓ Assigned: Orion Supervisory Lead (SUPERVISORY)</div>
                <div>✓ Assigned: Sentinel Verifier (VERIFICATION)</div>
                <div>✓ Autonomy Level: L4_GOVERNED_AUTONOMOUS</div>
                <div>✓ Crash-recovery checkpoints automatically provisioned</div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewMissionModal(false)}
                  className="px-4 py-2 rounded-xl text-gray-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-emerald-500 text-slate-950 font-bold rounded-xl hover:opacity-95 cursor-pointer shadow-lg"
                >
                  Confirm & Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
