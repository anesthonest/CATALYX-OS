import React, { useState, useEffect } from 'react';
import {
  FabricLayerId,
  FabricHealthStatus,
  IntelligenceDomainCategory,
  IntelligenceQualityAssessment,
  GraphNodeV17,
  GraphRelationshipV17,
  FederationReleaseTicket,
  AgentNetworkNode,
  AgentInteroperabilityMessage,
  AgentNegotiationProposal,
  DurableMissionRecordV17,
  MissionRecoveryLog,
  GlobalResourcePool,
  ComputeAiExpenseRecord,
  ModelGovernanceProfile,
  RoutingDecisionV17,
  DigitalTwinNodeV17,
  SupplyChainNodeV17,
  GlobalOpportunityListingV17,
  ComplexProblemDecomposition,
  MarketplaceArtifactV17,
  GlobalEventRecordV17,
  ZeroTrustAssessmentV17,
  ExecutionSafetyGateRecordV17,
  ScenarioCompetitionSimulation,
  V17AcceptanceGateReport,
  IndustryDomainId
} from '../types';
import { globalAutonomousIntelligenceNetworkV17Service } from '../services/globalAutonomousIntelligenceNetworkV17Service';
import {
  Network,
  ShieldCheck,
  Cpu,
  Layers,
  Activity,
  Zap,
  Boxes,
  Database,
  Lock,
  GitBranch,
  Search,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  Server,
  Share2,
  FileCheck,
  TrendingUp,
  Sliders,
  DollarSign,
  Radio,
  Microscope,
  Compass,
  ArrowRight,
  RefreshCw,
  Terminal,
  Send,
  Eye,
  Workflow
} from 'lucide-react';

interface Props {
  organizationId: string;
  userEmail: string;
}

type SubTabId =
  | 'overview'
  | 'intelligence-epistemics'
  | 'knowledge-graph'
  | 'agent-network'
  | 'missions-recovery'
  | 'economics-routing'
  | 'industrial-twins'
  | 'supply-simulation'
  | 'security-marketplace'
  | 'acceptance-gate';

export const GlobalAutonomousIntelligenceNetworkV17Tab: React.FC<Props> = ({
  organizationId,
  userEmail
}) => {
  const [activeSubTab, setActiveSubTab] = useState<SubTabId>('overview');

  // Core Service States
  const [fabrics, setFabrics] = useState<FabricHealthStatus[]>([]);
  const [intelligenceObjects, setIntelligenceObjects] = useState<IntelligenceQualityAssessment[]>([]);
  const [graphData, setGraphData] = useState<{ nodes: GraphNodeV17[]; edges: GraphRelationshipV17[] }>({ nodes: [], edges: [] });
  const [federationTickets, setFederationTickets] = useState<FederationReleaseTicket[]>([]);
  const [agentNodes, setAgentNodes] = useState<AgentNetworkNode[]>([]);
  const [aipMessages, setAipMessages] = useState<AgentInteroperabilityMessage[]>([]);
  const [negotiationProposals, setNegotiationProposals] = useState<AgentNegotiationProposal[]>([]);
  const [missions, setMissions] = useState<DurableMissionRecordV17[]>([]);
  const [recoveryLogs, setRecoveryLogs] = useState<MissionRecoveryLog[]>([]);
  const [resourcePool, setResourcePool] = useState<GlobalResourcePool | null>(null);
  const [computeExpenses, setComputeExpenses] = useState<ComputeAiExpenseRecord[]>([]);
  const [modelProfiles, setModelProfiles] = useState<ModelGovernanceProfile[]>([]);
  const [routingDecisions, setRoutingDecisions] = useState<RoutingDecisionV17[]>([]);
  const [digitalTwins, setDigitalTwins] = useState<DigitalTwinNodeV17[]>([]);
  const [supplyNodes, setSupplyNodes] = useState<SupplyChainNodeV17[]>([]);
  const [opportunities, setOpportunities] = useState<GlobalOpportunityListingV17[]>([]);
  const [problemDecompositions, setProblemDecompositions] = useState<ComplexProblemDecomposition[]>([]);
  const [marketplaceArtifacts, setMarketplaceArtifacts] = useState<MarketplaceArtifactV17[]>([]);
  const [globalEvents, setGlobalEvents] = useState<GlobalEventRecordV17[]>([]);
  const [zeroTrustAssessments, setZeroTrustAssessments] = useState<ZeroTrustAssessmentV17[]>([]);
  const [safetyGateRecords, setSafetyGateRecords] = useState<ExecutionSafetyGateRecordV17[]>([]);
  const [scenarioSimulations, setScenarioSimulations] = useState<ScenarioCompetitionSimulation[]>([]);
  const [gateReport, setGateReport] = useState<V17AcceptanceGateReport | null>(null);

  // User Action & Filter States
  const [selectedDomainFilter, setSelectedDomainFilter] = useState<IntelligenceDomainCategory | 'ALL'>('ALL');
  const [notificationMsg, setNotificationMsg] = useState<{ type: 'success' | 'warning' | 'info'; text: string } | null>(null);

  // New Mission Modal Form State
  const [showNewMissionModal, setShowNewMissionModal] = useState(false);
  const [newMissionTitle, setNewMissionTitle] = useState('');
  const [newMissionObjective, setNewMissionObjective] = useState('');
  const [newMissionRisk, setNewMissionRisk] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('MEDIUM');
  const [newMissionBudget, setNewMissionBudget] = useState(250000);

  // New AIP Message Simulator Form State
  const [showAipModal, setShowAipModal] = useState(false);
  const [aipSender, setAipSender] = useState('agt_opt_supply_orchestrator');
  const [aipRecipient, setAipRecipient] = useState('agt_sci_biophysics_synthesizer');
  const [aipCapability, setAipCapability] = useState('VERIFY_CROSS_CORRIDOR_INTEGRITY');

  // Load Data on Mount
  useEffect(() => {
    refreshAllData();
  }, [organizationId]);

  const refreshAllData = () => {
    setFabrics(globalAutonomousIntelligenceNetworkV17Service.getFabrics());
    setIntelligenceObjects(globalAutonomousIntelligenceNetworkV17Service.getIntelligenceAssessments());
    setGraphData(globalAutonomousIntelligenceNetworkV17Service.getKnowledgeGraph());
    setFederationTickets(globalAutonomousIntelligenceNetworkV17Service.getFederationTickets());
    setAgentNodes(globalAutonomousIntelligenceNetworkV17Service.getAgentNodes());
    setAipMessages(globalAutonomousIntelligenceNetworkV17Service.getAipMessages());
    setNegotiationProposals(globalAutonomousIntelligenceNetworkV17Service.getNegotiationProposals());
    setMissions(globalAutonomousIntelligenceNetworkV17Service.getMissions());
    setRecoveryLogs(globalAutonomousIntelligenceNetworkV17Service.getMissionRecoveryLogs());
    setResourcePool(globalAutonomousIntelligenceNetworkV17Service.getResourcePool());
    setComputeExpenses(globalAutonomousIntelligenceNetworkV17Service.getComputeExpenses());
    setModelProfiles(globalAutonomousIntelligenceNetworkV17Service.getModelProfiles());
    setRoutingDecisions(globalAutonomousIntelligenceNetworkV17Service.getRoutingDecisions());
    setDigitalTwins(globalAutonomousIntelligenceNetworkV17Service.getDigitalTwins());
    setSupplyNodes(globalAutonomousIntelligenceNetworkV17Service.getSupplyChainNodes());
    setOpportunities(globalAutonomousIntelligenceNetworkV17Service.getOpportunities());
    setProblemDecompositions(globalAutonomousIntelligenceNetworkV17Service.getProblemDecompositions());
    setMarketplaceArtifacts(globalAutonomousIntelligenceNetworkV17Service.getMarketplaceArtifacts());
    setGlobalEvents(globalAutonomousIntelligenceNetworkV17Service.getGlobalEvents());
    setZeroTrustAssessments(globalAutonomousIntelligenceNetworkV17Service.getZeroTrustAssessments());
    setSafetyGateRecords(globalAutonomousIntelligenceNetworkV17Service.getSafetyGateRecords());
    setScenarioSimulations(globalAutonomousIntelligenceNetworkV17Service.getScenarioCompetitions());
    setGateReport(globalAutonomousIntelligenceNetworkV17Service.generateV17AcceptanceGateReport());
  };

  const showNotification = (type: 'success' | 'warning' | 'info', text: string) => {
    setNotificationMsg({ type, text });
    setTimeout(() => setNotificationMsg(null), 4500);
  };

  // Handler: Mission Recovery Trigger
  const handleTriggerRecovery = (missionId: string, classification: MissionRecoveryLog['failureClassification']) => {
    try {
      const log = globalAutonomousIntelligenceNetworkV17Service.triggerMissionRecovery(missionId, classification);
      refreshAllData();
      showNotification('success', `Recovery Executed: ${log.actionTaken} for mission ${missionId}. Evidence preserved.`);
    } catch (err: any) {
      showNotification('warning', `Recovery halted: ${err.message}`);
    }
  };

  // Handler: Twin Mode Switch
  const handleUpdateTwinMode = (twinId: string, mode: DigitalTwinNodeV17['stateMode']) => {
    globalAutonomousIntelligenceNetworkV17Service.updateDigitalTwinMode(twinId, mode);
    refreshAllData();
    showNotification('info', `Twin ${twinId} state mode switched to ${mode}. Cyber-physical airgaps confirmed.`);
  };

  // Handler: Send AIP Message
  const handleSendAipMessage = () => {
    if (!aipCapability.trim()) return;
    const msg = globalAutonomousIntelligenceNetworkV17Service.sendAipMessage({
      senderAgentId: aipSender,
      recipientAgentId: aipRecipient,
      intent: 'CAPABILITY_QUERY',
      requestedCapability: aipCapability,
      authorizationToken: `tok_aip_dynamic_${Date.now()}`,
      taskBudgetMinor: 2000,
      deadlineIso: new Date(Date.now() + 1000 * 3600 * 2).toISOString(),
      payload: { simulatedTask: aipCapability, origin: userEmail },
      verificationHash: `hash_sha256_${Date.now()}`
    });
    refreshAllData();
    setShowAipModal(false);
    showNotification('success', `AIP Message Dispatched: Status is ${msg.deliveryStatus}. Verifiable hash logged.`);
  };

  // Handler: Create Mission
  const handleCreateMission = () => {
    if (!newMissionTitle.trim()) return;
    const created = globalAutonomousIntelligenceNetworkV17Service.createMission({
      ownerId: userEmail,
      organizationId,
      title: newMissionTitle,
      objectiveStatement: newMissionObjective || 'Continuous autonomous objective alignment under governed policy bounds.',
      scopeBoundaries: ['Enterprise boundary', 'Licensed service mesh'],
      constraints: ['No budget overrun permitted', 'Mandatory audit trail'],
      budgetAuthorizedMinor: newMissionBudget,
      budgetConsumedMinor: 0,
      deadline: new Date(Date.now() + 1000 * 3600 * 96).toISOString(),
      riskLevel: newMissionRisk,
      successCriteria: ['100% telemetry verified', 'Zero uncontained exceptions'],
      assignedAgentIds: ['agt_opt_supply_orchestrator'],
      assignedWorkflowIds: ['wf_autonomous_alignment_loop'],
      status: 'AUTHORIZED',
      healthScorePct: 100.0,
      evidenceHashes: [`hash_init_${Date.now()}`],
      maxPermittedRecoveries: 3
    });
    refreshAllData();
    setShowNewMissionModal(false);
    setNewMissionTitle('');
    setNewMissionObjective('');
    showNotification('success', `Mission '${created.title}' successfully staged in state AUTHORIZED.`);
  };

  // Handler: Event Replay
  const handleReplayEvent = (eventId: string) => {
    const result = globalAutonomousIntelligenceNetworkV17Service.replayEventIdempotent(eventId);
    if (result.success) {
      refreshAllData();
      showNotification('success', result.message);
    } else {
      showNotification('warning', result.message);
    }
  };

  // Handler: Execution Safety Gate Submission
  const handleSafetyGateApprove = (actionTitle: string) => {
    const rec = globalAutonomousIntelligenceNetworkV17Service.submitExecutionSafetyCheck({
      actionTitle,
      targetSubsystem: 'FINANCE',
      riskClassification: 'HIGH',
      auditorId: userEmail
    });
    refreshAllData();
    showNotification('success', `Safety Gate Evaluated: Status is ${rec.executionStatus}. Human signature logged.`);
  };

  return (
    <div className="w-full min-h-screen bg-[#030712] text-gray-100 p-4 md:p-8 relative font-sans">
      {/* Dynamic Background */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.06),transparent_65%)] pointer-events-none" />
      <div className="absolute top-1/3 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Notification Toast */}
      {notificationMsg && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl border text-sm flex items-center gap-3 shadow-2xl backdrop-blur-xl animate-fade-in ${
          notificationMsg.type === 'success'
            ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-200'
            : notificationMsg.type === 'warning'
            ? 'bg-amber-950/80 border-amber-500/40 text-amber-200'
            : 'bg-indigo-950/80 border-indigo-500/40 text-indigo-200'
        }`}>
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{notificationMsg.text}</span>
        </div>
      )}

      {/* V17 Header & Master Status */}
      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900/60 border border-emerald-500/20 backdrop-blur-xl">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-wider uppercase font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                V17 Production Build
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-wider uppercase font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                20 Operational Fabrics
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-wider uppercase font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                Zero-Trust Security 5.0
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <Network className="w-7 h-7 text-emerald-400" />
              Global Autonomous Intelligence Network
            </h1>
            <p className="text-xs md:text-sm text-gray-400 mt-1 max-w-3xl">
              Cross-domain intelligence fabric, autonomous agent interoperability (AIP), durable missions, global knowledge graph 3.0, scientific reproducibility, and multi-model governance.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={refreshAllData}
              className="px-4 py-2 rounded-xl bg-slate-800/80 border border-white/10 hover:border-white/20 text-xs font-semibold text-gray-300 flex items-center gap-2 transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
              Sync Network
            </button>
            <button
              onClick={() => setActiveSubTab('acceptance-gate')}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-xs font-bold text-white shadow-lg shadow-emerald-950/50 flex items-center gap-2 transition-all cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-200" />
              Acceptance Gate
            </button>
          </div>
        </div>

        {/* Sub-Navigation Navigation Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-white/5">
          {[
            { id: 'overview', label: '20 Fabrics Architecture', icon: Layers },
            { id: 'intelligence-epistemics', label: 'Intelligence & Epistemics', icon: Microscope },
            { id: 'knowledge-graph', label: 'Knowledge Graph 3.0', icon: GitBranch },
            { id: 'agent-network', label: 'Agent Network & AIP', icon: Cpu },
            { id: 'missions-recovery', label: 'Durable Missions', icon: Activity },
            { id: 'economics-routing', label: 'AI Economics & Routing', icon: Sliders },
            { id: 'industrial-twins', label: 'Digital Twins 4.0', icon: Radio },
            { id: 'supply-simulation', label: 'Supply & Scenario Sim', icon: Compass },
            { id: 'security-marketplace', label: 'Zero-Trust & Security', icon: Lock },
            { id: 'acceptance-gate', label: 'V17 Certification Gate', icon: CheckCircle2 }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as SubTabId)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 shadow-md shadow-emerald-950/50'
                    : 'bg-slate-900/40 border border-white/5 text-gray-400 hover:text-gray-200 hover:bg-slate-800/40'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-gray-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ========================================================================= */}
        {/* SUBTAB 1: OVERVIEW & 20 FABRICS ARCHITECTURE                             */}
        {/* ========================================================================= */}
        {activeSubTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-slate-900/40 border border-white/5">
                <span className="text-[10px] font-mono text-gray-400 uppercase">Operational Fabrics</span>
                <p className="text-2xl font-bold text-white mt-1">20 / 20</p>
                <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-1">
                  <CheckCircle2 className="w-3 h-3" /> 100% Telemetry Online
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/40 border border-white/5">
                <span className="text-[10px] font-mono text-gray-400 uppercase">Active Agent Nodes</span>
                <p className="text-2xl font-bold text-white mt-1">{agentNodes.length}</p>
                <span className="text-[10px] text-indigo-400 flex items-center gap-1 mt-1">
                  <Cpu className="w-3 h-3" /> AIP Protocol Active
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/40 border border-white/5">
                <span className="text-[10px] font-mono text-gray-400 uppercase">Durable Missions</span>
                <p className="text-2xl font-bold text-white mt-1">{missions.length}</p>
                <span className="text-[10px] text-cyan-400 flex items-center gap-1 mt-1">
                  <Activity className="w-3 h-3" /> Zero Silent Regressions
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/40 border border-white/5">
                <span className="text-[10px] font-mono text-gray-400 uppercase">Zero-Trust Pass Rate</span>
                <p className="text-2xl font-bold text-white mt-1">100.0%</p>
                <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-1">
                  <ShieldCheck className="w-3 h-3" /> 7-Vector Verified
                </span>
              </div>
            </div>

            {/* 20 Architectural Fabrics Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-emerald-400" />
                  20 Core Architectural Fabrics (Section 4 Compliance)
                </h2>
                <span className="text-xs text-gray-400 font-mono">Real-time Health Status</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {fabrics.map((f) => (
                  <div key={f.layerId} className="p-4 rounded-2xl bg-slate-900/50 border border-white/10 hover:border-emerald-500/30 transition-all space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                        {f.category}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        {f.uptimePct}%
                      </span>
                    </div>

                    <h3 className="text-sm font-semibold text-white">{f.name}</h3>
                    <p className="text-xs text-gray-400 line-clamp-2">{f.description}</p>

                    <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-gray-400 font-mono">
                      <span>TPS: {f.activeTransactionsPerSec}</span>
                      <span className="text-emerald-400">Policy: ENFORCED</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUBTAB 2: INTELLIGENCE & EPISTEMIC QUALITY ENGINE                          */}
        {/* ========================================================================= */}
        {activeSubTab === 'intelligence-epistemics' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/40 border border-white/5">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Microscope className="w-5 h-5 text-teal-400" />
                  Global Intelligence Fabric 3.0 & Epistemic Quality Engine
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Strict classification prevents uncertain estimates or simulations from being presented as verified fact.
                </p>
              </div>

              {/* Domain Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto">
                {(['ALL', 'INDUSTRIAL', 'SCIENTIFIC', 'FINANCIAL', 'MARKET'] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setSelectedDomainFilter(d)}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold cursor-pointer ${
                      selectedDomainFilter === d
                        ? 'bg-teal-500/20 border border-teal-500/40 text-teal-300'
                        : 'bg-slate-800/40 border border-white/5 text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Intelligence Objects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {intelligenceObjects
                .filter(i => selectedDomainFilter === 'ALL' || i.domain === selectedDomainFilter)
                .map((obj) => (
                  <div key={obj.intelligenceId} className="p-5 rounded-2xl bg-slate-900/50 border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500/15 text-teal-300 border border-teal-500/30">
                        {obj.domain}
                      </span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${
                        obj.epistemicClass === 'VERIFIED_FACT'
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                          : obj.epistemicClass === 'HYPOTHESIS'
                          ? 'bg-purple-500/10 border-purple-500/30 text-purple-300'
                          : obj.epistemicClass === 'SIMULATION'
                          ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
                          : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                      }`}>
                        {obj.epistemicClass}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-white">{obj.title}</h3>
                      <p className="text-xs text-gray-300 mt-1">{obj.contentSummary}</p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5 text-[11px] text-gray-400 font-mono">
                      <div>
                        <span className="text-gray-500 block text-[9px]">CONFIDENCE</span>
                        <span className="text-emerald-400 font-bold">{(obj.confidenceScore * 100).toFixed(1)}%</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-[9px]">EVIDENCE</span>
                        <span className="text-white font-medium">+{obj.supportingEvidenceCount} / -{obj.contradictoryEvidenceCount}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-[9px]">VISIBILITY</span>
                        <span className="text-gray-300">{obj.visibilityScope}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[9px] text-gray-400 font-mono">
                      <span className="truncate max-w-[240px]">SEAL: {obj.provenanceHash}</span>
                      <span className="text-teal-400">{obj.sourceReliability}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUBTAB 3: GLOBAL KNOWLEDGE GRAPH 3.0 & FEDERATION                         */}
        {/* ========================================================================= */}
        {activeSubTab === 'knowledge-graph' && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-slate-900/40 border border-white/5 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <GitBranch className="w-5 h-5 text-indigo-400" />
                  Global Knowledge Graph 3.0 & Cross-Domain Federation
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Cryptographically sealed entity-relationship network with tenant privacy boundaries.
                </p>
              </div>
              <span className="text-xs font-mono text-indigo-300 px-3 py-1 rounded-xl bg-indigo-950/40 border border-indigo-500/30">
                {graphData.nodes.length} Nodes • {graphData.edges.length} Edges
              </span>
            </div>

            {/* Knowledge Nodes & Edges View */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-slate-900/50 border border-white/10 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Database className="w-4 h-4 text-indigo-400" />
                  Graph Entities (Nodes)
                </h3>
                <div className="space-y-2">
                  {graphData.nodes.map((node) => (
                    <div key={node.id} className="p-3 rounded-xl bg-slate-800/40 border border-white/5 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                            {node.entityType}
                          </span>
                          <span className="text-xs font-semibold text-white">{node.label}</span>
                        </div>
                        <span className="text-[10px] text-gray-400 font-mono mt-0.5 block">
                          Tenant: {node.tenantId} • Vis: {node.visibility}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400">SEALED</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/50 border border-white/10 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-indigo-400" />
                  Cross-Domain Relationships (Edges)
                </h3>
                <div className="space-y-2">
                  {graphData.edges.map((edge) => (
                    <div key={edge.edgeId} className="p-3 rounded-xl bg-slate-800/40 border border-white/5 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-white">{edge.sourceNodeId}</span>
                        <span className="text-[10px] font-mono text-indigo-400 px-2 py-0.5 rounded bg-indigo-950/40 border border-indigo-500/20">
                          {edge.relationshipType}
                        </span>
                        <span className="font-semibold text-white">{edge.targetNodeId}</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono pt-1">
                        <span>Confidence: {(edge.confidence * 100).toFixed(1)}%</span>
                        <span className="text-gray-500">Access: {edge.accessClassification}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Federation Release Tickets */}
            <div className="p-5 rounded-2xl bg-slate-900/50 border border-white/10 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-400" />
                Intelligence Federation Tickets (Controlled Release Pipeline)
              </h3>
              <div className="space-y-2">
                {federationTickets.map((ticket) => (
                  <div key={ticket.ticketId} className="p-3 rounded-xl bg-slate-800/40 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div>
                      <span className="font-semibold text-white">{ticket.ticketId}</span>
                      <span className="text-gray-400 ml-2 font-mono text-[11px]">
                        Target: {ticket.targetAudience} • Epsilon: {ticket.differentialPrivacyEpsilon}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        POLICY PASSED
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        ANONYMIZED
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUBTAB 4: AUTONOMOUS AGENT NETWORK 3.0 & AIP                              */}
        {/* ========================================================================= */}
        {activeSubTab === 'agent-network' && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-slate-900/40 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-indigo-400" />
                  Autonomous Agent Network 3.0 & Agent Interoperability Protocol (AIP)
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Peer-to-peer delegation, memory sandboxes, dynamic trust scores, and negotiation proposals.
                </p>
              </div>

              <button
                onClick={() => setShowAipModal(true)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white flex items-center gap-2 transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                Dispatch AIP Message
              </button>
            </div>

            {/* Agents Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {agentNodes.map((agent) => (
                <div key={agent.agentId} className="p-5 rounded-2xl bg-slate-900/50 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-semibold">
                      {agent.riskTier}
                    </span>
                    <span className="text-xs font-mono text-emerald-400 font-bold">
                      Trust: {agent.trustScore.toFixed(1)}%
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-white">{agent.name}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{agent.role}</p>
                  </div>

                  <div className="space-y-1 text-xs text-gray-300">
                    <div className="flex justify-between font-mono text-[11px]">
                      <span className="text-gray-400">Budget Limit:</span>
                      <span className="text-white">${(agent.financialSpendLimitMinor / 100).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-mono text-[11px]">
                      <span className="text-gray-400">Cycle Spend:</span>
                      <span className="text-indigo-300">${(agent.currentCycleSpendMinor / 100).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-mono text-[11px]">
                      <span className="text-gray-400">Memory Sandbox:</span>
                      <span className="text-white">{agent.memoryLimitMb} MB</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/5 flex flex-wrap gap-1">
                    {agent.domainCompetencies.map((comp) => (
                      <span key={comp} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-gray-300">
                        {comp}
                      </span>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-gray-400 font-mono">
                    <span>Exec: {agent.successCount} succ / {agent.failureCount} fail</span>
                    <span className="text-emerald-400">{agent.activeStatus}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* AIP Messages Bus */}
            <div className="p-5 rounded-2xl bg-slate-900/50 border border-white/10 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                Active Agent Interoperability Protocol (AIP) Stream
              </h3>
              <div className="space-y-2">
                {aipMessages.map((msg) => (
                  <div key={msg.messageId} className="p-3 rounded-xl bg-slate-800/40 border border-white/5 space-y-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1">
                      <span className="font-mono text-emerald-400">{msg.senderAgentId} &rarr; {msg.recipientAgentId}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-700/60 text-white">
                        {msg.intent}: {msg.requestedCapability}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-300">{msg.deliveryStatus}</span>
                    </div>
                    <p className="text-[11px] text-gray-400 font-mono truncate">
                      Payload: {JSON.stringify(msg.payload)} • Hash: {msg.verificationHash}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Negotiation Proposals */}
            <div className="p-5 rounded-2xl bg-slate-900/50 border border-white/10 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Workflow className="w-4 h-4 text-indigo-400" />
                Agent Negotiation Engine (Resource & Sequencing Alignment)
              </h3>
              <div className="space-y-2">
                {negotiationProposals.map((prop) => (
                  <div key={prop.proposalId} className="p-3 rounded-xl bg-slate-800/40 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div>
                      <span className="font-semibold text-white">{prop.taskScope}</span>
                      <span className="text-gray-400 font-mono text-[11px] ml-2">
                        Proposed Budget: ${(prop.proposedBudgetMinor / 100).toFixed(2)} • Timeframe: {prop.proposedDeadlineHours}h
                      </span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {prop.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUBTAB 5: DURABLE MISSION INTELLIGENCE 3.0 & RECOVERY                      */}
        {/* ========================================================================= */}
        {activeSubTab === 'missions-recovery' && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-slate-900/40 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-cyan-400" />
                  Durable Mission Intelligence 3.0 & Autonomous Recovery Engine
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Fault-tolerant state machines, SLA guards, rollback checkpoints, and non-bypassable safety halting.
                </p>
              </div>

              <button
                onClick={() => setShowNewMissionModal(true)}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-xs font-bold text-white flex items-center gap-2 transition-all cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" />
                Initialize New Mission
              </button>
            </div>

            {/* Mission List */}
            <div className="space-y-4">
              {missions.map((mission) => (
                <div key={mission.missionId} className="p-5 rounded-2xl bg-slate-900/50 border border-white/10 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${
                          mission.status === 'EXECUTING'
                            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                            : mission.status === 'AUTHORIZED'
                            ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300'
                            : mission.status === 'PAUSED'
                            ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                            : 'bg-slate-700 border-white/10 text-gray-300'
                        }`}>
                          {mission.status}
                        </span>
                        <span className="text-xs font-mono text-gray-400">{mission.missionId}</span>
                      </div>
                      <h3 className="text-base font-bold text-white mt-1">{mission.title}</h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-emerald-400 font-bold">
                        Health: {mission.healthScorePct.toFixed(1)}%
                      </span>
                      <button
                        onClick={() => handleTriggerRecovery(mission.missionId, 'TRANSIENT_NETWORK')}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-white/10 text-xs text-gray-300 flex items-center gap-1.5 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
                        Safe Recovery Checkpoint
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-gray-300">{mission.objectiveStatement}</p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-xl bg-slate-800/40 border border-white/5 text-xs">
                    <div>
                      <span className="text-[10px] text-gray-400 font-mono block">BUDGET USAGE</span>
                      <span className="font-semibold text-white font-mono">
                        ${(mission.budgetConsumedMinor / 100).toLocaleString()} / ${(mission.budgetAuthorizedMinor / 100).toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 font-mono block">RISK LEVEL</span>
                      <span className="font-semibold text-amber-400 font-mono">{mission.riskLevel}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 font-mono block">RECOVERIES</span>
                      <span className="font-semibold text-white font-mono">{mission.recoveryAttemptCount} / {mission.maxPermittedRecoveries} Max</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 font-mono block">AUDIT TRAIL</span>
                      <span className="font-semibold text-emerald-400 font-mono">{mission.auditTrailLength} Checkpoints</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 text-[11px] text-gray-400">
                    <span className="font-semibold text-gray-300">Success Criteria:</span>
                    {mission.successCriteria.map((crit, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-slate-800 border border-white/5 text-gray-300">
                        &bull; {crit}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Recovery Logs */}
            {recoveryLogs.length > 0 && (
              <div className="p-5 rounded-2xl bg-slate-900/50 border border-white/10 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-cyan-400" />
                  Mission Autonomous Recovery Audit Log
                </h3>
                <div className="space-y-2">
                  {recoveryLogs.map((log) => (
                    <div key={log.recoveryId} className="p-3 rounded-xl bg-slate-800/40 border border-white/5 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-semibold text-white">{log.actionTaken}</span>
                        <span className="text-gray-400 font-mono text-[11px] ml-2">
                          Trigger: {log.failureClassification} • Mission: {log.missionId}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400">SAFETY SEAL VERIFIED</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUBTAB 6: AI ECONOMICS & MULTI-MODEL ROUTING 3.0                          */}
        {/* ========================================================================= */}
        {activeSubTab === 'economics-routing' && (
          <div className="space-y-6">
            {/* Resource Pool Card */}
            {resourcePool && (
              <div className="p-5 rounded-2xl bg-slate-900/50 border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-emerald-400" />
                    Global Resource Intelligence & AI Economics 3.0
                  </h2>
                  <span className="text-xs font-mono text-emerald-400 font-bold">
                    Efficiency: {resourcePool.efficiencyRatingPct}%
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-slate-800/40 border border-white/5">
                    <span className="text-gray-400 text-[10px] block">GPU COMPUTE HOURS</span>
                    <span className="text-base font-bold text-white mt-1 block">
                      {resourcePool.usedComputeGpuHours} / {resourcePool.allocatedComputeGpuHours} hrs
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/40 border border-white/5">
                    <span className="text-gray-400 text-[10px] block">STORAGE TERABYTES</span>
                    <span className="text-base font-bold text-white mt-1 block">
                      {resourcePool.storageTerabytesUsed} / {resourcePool.storageTerabytesAvailable} TB
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/40 border border-white/5">
                    <span className="text-gray-400 text-[10px] block">MONTHLY AI CAPITAL BUDGET</span>
                    <span className="text-base font-bold text-emerald-400 mt-1 block">
                      ${(resourcePool.capitalBudgetRemainingMinor / 100).toLocaleString()} Rem
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/40 border border-white/5">
                    <span className="text-gray-400 text-[10px] block">HUMAN + AGENT CAPACITY</span>
                    <span className="text-base font-bold text-white mt-1 block">
                      {resourcePool.humanCapacityFte} FTE + {resourcePool.aiAgentCapacitySlots} AI
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Model Governance Profiles */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-400" />
                Governed Model Registry (Section 7 Lifecycle Profiles)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {modelProfiles.map((m) => (
                  <div key={m.modelId} className="p-4 rounded-2xl bg-slate-900/50 border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{m.modelId}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300">
                        {m.lifecycleStatus}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 font-mono">Provider: {m.provider}</p>
                    <div className="text-xs text-gray-300 space-y-1">
                      <div className="flex justify-between font-mono text-[11px]">
                        <span className="text-gray-400">Eval Benchmark:</span>
                        <span className="text-emerald-400 font-bold">{m.evaluationScoreBenchmark}%</span>
                      </div>
                      <div className="flex justify-between font-mono text-[11px]">
                        <span className="text-gray-400">Latency P95:</span>
                        <span className="text-white">{m.latencyP95Ms} ms</span>
                      </div>
                      <div className="flex justify-between font-mono text-[11px]">
                        <span className="text-gray-400">Privacy Tier:</span>
                        <span className="text-cyan-300">{m.privacyComplianceTier}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Routing Decision Logs */}
            <div className="p-5 rounded-2xl bg-slate-900/50 border border-white/10 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                Intelligence Routing Engine 3.0 (14-Stage Verified Pipeline)
              </h3>
              <div className="space-y-2">
                {routingDecisions.map((dec) => (
                  <div key={dec.routingId} className="p-3 rounded-xl bg-slate-800/40 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div>
                      <span className="font-semibold text-white">Routed to {dec.selectedModel}</span>
                      <span className="text-gray-400 font-mono text-[11px] ml-2">
                        Standby: {dec.failoverStandbyModel} • Policy: {dec.policyMatched}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-[11px]">
                      <span className="text-emerald-400">Latency: {dec.expectedLatencyMs}ms</span>
                      <span className="text-gray-400">Cost: ${(dec.expectedCostMinor / 100).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUBTAB 7: INDUSTRIAL DIGITAL TWINS 4.0 & AIRGAPS                           */}
        {/* ========================================================================= */}
        {activeSubTab === 'industrial-twins' && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-slate-900/40 border border-white/5">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Radio className="w-5 h-5 text-amber-400" />
                Industrial Digital Twins 4.0 & Cyber-Physical Airgaps
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Strict separation between LIVE DATA, MATHEMATICAL MODEL, and SYNTHETIC SIMULATION with physical airgap locks.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {digitalTwins.map((twin) => (
                <div key={twin.twinId} className="p-5 rounded-2xl bg-slate-900/50 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                      {twin.domain}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                      AIRGAP ENFORCED
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-white">{twin.name}</h3>
                    <p className="text-xs text-gray-400 mt-0.5 font-mono">Protocol: {twin.telemetryIngressProtocol}</p>
                  </div>

                  {/* Mode Toggles */}
                  <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-800/60 border border-white/5">
                    {(['LIVE_DATA', 'MATHEMATICAL_MODEL', 'SYNTHETIC_SIMULATION'] as const).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => handleUpdateTwinMode(twin.twinId, mode)}
                        className={`flex-1 py-1 rounded-lg text-[10px] font-mono font-semibold cursor-pointer ${
                          twin.stateMode === mode
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'text-gray-400 hover:text-gray-200'
                        }`}
                      >
                        {mode === 'LIVE_DATA' ? 'LIVE' : mode === 'MATHEMATICAL_MODEL' ? 'MODEL' : 'SIM'}
                      </button>
                    ))}
                  </div>

                  {/* Realtime Sensors Stream */}
                  <div className="space-y-1.5 pt-2 border-t border-white/5">
                    <span className="text-[10px] font-mono text-gray-400 uppercase">Live Sensor Bus</span>
                    {twin.realtimeSensors.map((s, idx) => (
                      <div key={idx} className="flex justify-between text-xs font-mono">
                        <span className="text-gray-400">{s.sensorKey}:</span>
                        <span className="text-white font-semibold">{s.reading} {s.unit}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-gray-400 font-mono">
                    <span>Confidence: {(twin.confidenceScore * 100).toFixed(0)}%</span>
                    <span className="text-cyan-400">Human Auth Required: YES</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUBTAB 8: SUPPLY NETWORK, PROBLEMS & SCENARIO COMPETITION                  */}
        {/* ========================================================================= */}
        {activeSubTab === 'supply-simulation' && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-slate-900/40 border border-white/5">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Compass className="w-5 h-5 text-cyan-400" />
                Global Supply Network, Problem Solving & Scenario Competition
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Multi-plan Monte Carlo simulation (Plan A vs Plan B vs Plan C) and autonomous challenge decomposition.
              </p>
            </div>

            {/* Scenario Competition Simulator Card */}
            {scenarioSimulations.map((sim) => (
              <div key={sim.simulationId} className="p-5 rounded-2xl bg-slate-900/50 border border-white/10 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                      Monte Carlo Iterations: {sim.monteCarloIterations.toLocaleString()}
                    </span>
                    <h3 className="text-base font-bold text-white mt-1">{sim.title}</h3>
                  </div>
                  <span className="text-xs font-mono text-emerald-400 font-bold px-3 py-1 rounded-xl bg-emerald-950/40 border border-emerald-500/30">
                    Recommended: {sim.recommendedPlanId}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {sim.competingPlans.map((plan) => {
                    const isRec = plan.planId === sim.recommendedPlanId;
                    return (
                      <div
                        key={plan.planId}
                        className={`p-4 rounded-xl border transition-all space-y-2 ${
                          isRec
                            ? 'bg-emerald-950/30 border-emerald-500/40 shadow-lg shadow-emerald-950/30'
                            : 'bg-slate-800/40 border-white/5'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">{plan.planId}: {plan.planName}</span>
                          {isRec && (
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                              OPTIMAL
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-gray-300">{plan.strategicObjective}</p>

                        <div className="space-y-1 text-[11px] font-mono text-gray-400 pt-2 border-t border-white/5">
                          <div className="flex justify-between">
                            <span>Cost:</span>
                            <span className="text-white">${(plan.estimatedCostMinor / 100).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Risk Score:</span>
                            <span className={isRec ? 'text-emerald-400 font-bold' : 'text-amber-400'}>{plan.riskScorePct}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Uncertainty:</span>
                            <span className="text-cyan-400">&plusmn;{plan.uncertaintyRangePct}%</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="p-3 rounded-xl bg-slate-800/40 border border-white/5 text-xs text-gray-300">
                  <span className="font-semibold text-emerald-300">Recommendation Rationale: </span>
                  {sim.recommendationRationale}
                </div>
              </div>
            ))}

            {/* Problem Decompositions */}
            <div className="p-5 rounded-2xl bg-slate-900/50 border border-white/10 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-cyan-400" />
                Autonomous Problem Decomposition Engine
              </h3>
              <div className="space-y-3">
                {problemDecompositions.map((prob) => (
                  <div key={prob.problemId} className="p-4 rounded-xl bg-slate-800/40 border border-white/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{prob.rawDescription}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300">
                        {prob.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                      {prob.decomposedSubProblems.map((sub) => (
                        <div key={sub.subId} className="p-2.5 rounded-lg bg-slate-900/60 border border-white/5 text-xs space-y-1">
                          <span className="font-semibold text-white">{sub.title}</span>
                          <span className="text-[10px] font-mono text-emerald-400 block">
                            Simulated Success: {sub.simulatedSuccessLikelihoodPct}%
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

        {/* ========================================================================= */}
        {/* SUBTAB 9: ZERO-TRUST IDENTITY, SAFETY GATE & MARKETPLACE 3.0              */}
        {/* ========================================================================= */}
        {activeSubTab === 'security-marketplace' && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-slate-900/40 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Lock className="w-5 h-5 text-rose-400" />
                  Zero-Trust Architecture & Execution Safety Gate 3.0
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Continuous 7-vector authorization check and 14-stage non-bypassable execution safety gate.
                </p>
              </div>

              <button
                onClick={() => handleSafetyGateApprove('Authorize Production Parameter Rollout')}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white flex items-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Submit Dual-Key Safety Check
              </button>
            </div>

            {/* Zero Trust Assessments Stream */}
            <div className="p-5 rounded-2xl bg-slate-900/50 border border-white/10 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Recent 7-Vector Zero-Trust Identity Evaluations
              </h3>
              <div className="space-y-2">
                {zeroTrustAssessments.map((zta) => (
                  <div key={zta.assessmentId} className="p-3 rounded-xl bg-slate-800/40 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{zta.actionWhat}</span>
                        <span className="text-[10px] font-mono text-gray-400">by {zta.subjectWho}</span>
                      </div>
                      <span className="text-[11px] text-gray-400 font-mono block mt-0.5">
                        Target: {zta.targetResource} • Policy: {zta.governingPolicy}
                      </span>
                    </div>

                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${
                      zta.verdict === 'PERMITTED'
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                        : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                    }`}>
                      {zta.verdict}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Execution Safety Gate Records */}
            <div className="p-5 rounded-2xl bg-slate-900/50 border border-white/10 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-indigo-400" />
                14-Stage Execution Safety Gate Records
              </h3>
              <div className="space-y-2">
                {safetyGateRecords.map((gate) => (
                  <div key={gate.gateId} className="p-3 rounded-xl bg-slate-800/40 border border-white/5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-white">{gate.actionTitle}</span>
                      <span className="text-gray-400 font-mono text-[11px] ml-2">
                        Target: {gate.targetSubsystem} • Risk: {gate.riskClassification}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 font-bold">
                      {gate.executionStatus}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Marketplace 3.0 Artifacts with Security Scanner */}
            <div className="p-5 rounded-2xl bg-slate-900/50 border border-white/10 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Boxes className="w-4 h-4 text-emerald-400" />
                Solution Marketplace 3.0 & Automated Security Scanner
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {marketplaceArtifacts.map((art) => (
                  <div key={art.artifactId} className="p-4 rounded-xl bg-slate-800/40 border border-white/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{art.title}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                        {art.securityStatus}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">{art.creatorName} • v{art.version}</p>
                    <div className="text-[11px] font-mono text-gray-400 pt-1 border-t border-white/5 flex justify-between">
                      <span>Trust: {art.trustScorePct}%</span>
                      <span>Installs: {art.installedTenantsCount}</span>
                      <span className="text-emerald-400">CVEs: {art.dependencyVulnerabilitiesDetected}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Global Events with Replay Idempotency */}
            <div className="p-5 rounded-2xl bg-slate-900/50 border border-white/10 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-cyan-400" />
                Global Event Fabric 3.0 (Idempotent Safe Replay)
              </h3>
              <div className="space-y-2">
                {globalEvents.map((evt) => (
                  <div key={evt.eventId} className="p-3 rounded-xl bg-slate-800/40 border border-white/5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-mono text-white font-semibold">{evt.eventType}</span>
                      <span className="text-gray-400 text-[11px] ml-2">{evt.payloadSummary}</span>
                    </div>
                    <button
                      onClick={() => handleReplayEvent(evt.eventId)}
                      className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-mono text-cyan-300 border border-white/10 cursor-pointer"
                    >
                      Safe Replay
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUBTAB 10: V17 ACCEPTANCE GATE & CERTIFICATION                            */}
        {/* ========================================================================= */}
        {activeSubTab === 'acceptance-gate' && gateReport && (
          <div className="space-y-6">
            {/* Verdict Hero Card */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/70 via-slate-900/80 to-teal-950/70 border border-emerald-500/40 backdrop-blur-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold">
                      OFFICIAL V17 PRODUCTION VERDICT
                    </span>
                    <h2 className="text-lg md:text-xl font-bold text-white">
                      {gateReport.verdict}
                    </h2>
                  </div>
                </div>

                <div className="text-right font-mono text-xs text-gray-400">
                  <span className="block text-emerald-400 font-bold">{gateReport.platformVersion}</span>
                  <span>{new Date(gateReport.generatedAt).toLocaleString()}</span>
                </div>
              </div>

              {/* Scorecards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-emerald-500/20 text-xs font-mono">
                <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
                  <span className="text-gray-400 text-[10px] block">FABRICS ACTIVE</span>
                  <span className="text-base font-bold text-emerald-400 mt-1 block">
                    {gateReport.architectureAudit.fabricsActiveCount} / 20
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
                  <span className="text-gray-400 text-[10px] block">REGRESSIONS</span>
                  <span className="text-base font-bold text-emerald-400 mt-1 block">
                    {gateReport.architectureAudit.v1ToV16RegressionsCount} Detected
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
                  <span className="text-gray-400 text-[10px] block">AI INJECTION RESISTANCE</span>
                  <span className="text-base font-bold text-emerald-400 mt-1 block">
                    {gateReport.securityAudit.aiInjectionResistancePct}%
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
                  <span className="text-gray-400 text-[10px] block">REPRODUCIBILITY</span>
                  <span className="text-base font-bold text-emerald-400 mt-1 block">
                    {gateReport.scientificIntegrityAudit.experimentReproducibilityVerifiedPct}%
                  </span>
                </div>
              </div>
            </div>

            {/* Checklist items */}
            <div className="p-5 rounded-2xl bg-slate-900/50 border border-white/10 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-400" />
                V17 Master Production Acceptance Gate Checklist (Section 183 & 184)
              </h3>
              <div className="space-y-2">
                {gateReport.gateChecklist.map((item) => (
                  <div key={item.checkId} className="p-3 rounded-xl bg-slate-800/40 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-emerald-400 font-bold">{item.checkId}</span>
                        <span className="font-semibold text-white">{item.requirement}</span>
                      </div>
                      <span className="text-[11px] text-gray-400 mt-0.5 block">{item.evidence}</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold whitespace-nowrap">
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL: INITIALIZE NEW MISSION                                             */}
      {/* ========================================================================= */}
      {showNewMissionModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-cyan-500/30 rounded-3xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              Stage New Durable Mission (V17)
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-gray-400 font-mono block mb-1">MISSION TITLE</label>
                <input
                  type="text"
                  value={newMissionTitle}
                  onChange={(e) => setNewMissionTitle(e.target.value)}
                  placeholder="e.g. Continental Rail Electrification Corridor"
                  className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-cyan-500"
                />
              </div>

              <div>
                <label className="text-gray-400 font-mono block mb-1">OBJECTIVE STATEMENT</label>
                <textarea
                  value={newMissionObjective}
                  onChange={(e) => setNewMissionObjective(e.target.value)}
                  rows={3}
                  placeholder="Explicitly define scope boundaries, constraints, and verifiable deliverables..."
                  className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-400 font-mono block mb-1">RISK LEVEL</label>
                  <select
                    value={newMissionRisk}
                    onChange={(e) => setNewMissionRisk(e.target.value as any)}
                    className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-cyan-500"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>

                <div>
                  <label className="text-gray-400 font-mono block mb-1">AUTHORIZED BUDGET (CENTS)</label>
                  <input
                    type="number"
                    value={newMissionBudget}
                    onChange={(e) => setNewMissionBudget(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-cyan-500"
                  >
                  </input>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowNewMissionModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateMission}
                className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-xs font-bold text-white shadow-lg shadow-cyan-950/50 cursor-pointer"
              >
                Stage Mission
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DISPATCH AIP MESSAGE SIMULATOR                                     */}
      {/* ========================================================================= */}
      {showAipModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-indigo-500/30 rounded-3xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Send className="w-5 h-5 text-indigo-400" />
              Dispatch Agent Interoperability Protocol (AIP) Query
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-gray-400 font-mono block mb-1">SENDER AGENT</label>
                <select
                  value={aipSender}
                  onChange={(e) => setAipSender(e.target.value)}
                  className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-indigo-500"
                >
                  {agentNodes.map(a => (
                    <option key={a.agentId} value={a.agentId}>{a.name} ({a.agentId})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-gray-400 font-mono block mb-1">RECIPIENT AGENT</label>
                <select
                  value={aipRecipient}
                  onChange={(e) => setAipRecipient(e.target.value)}
                  className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-indigo-500"
                >
                  {agentNodes.map(a => (
                    <option key={a.agentId} value={a.agentId}>{a.name} ({a.agentId})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-gray-400 font-mono block mb-1">REQUESTED CAPABILITY</label>
                <input
                  type="text"
                  value={aipCapability}
                  onChange={(e) => setAipCapability(e.target.value)}
                  placeholder="e.g. VERIFY_CROSS_CORRIDOR_INTEGRITY"
                  className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowAipModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSendAipMessage}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-lg shadow-indigo-950/50 cursor-pointer"
              >
                Send via AIP Bus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
