import React, { useState } from 'react';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Layers,
  Globe,
  Cpu,
  Users,
  Building,
  Network,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  FileText,
  Lock,
  Scale,
  RefreshCw,
  AlertOctagon,
  Server,
  Play,
  Check
} from 'lucide-react';
import {
  globalEcosystemOperatingSystemV18Service
} from '../services/globalEcosystemOperatingSystemV18Service';
import {
  EcosystemHierarchyLevel,
  EcosystemDigitalTwinLayer,
  SolutionOrchestrationPipeline
} from '../types';

export const GlobalEcosystemOperatingSystemV18Tab: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<
    | 'HIERARCHY_GRAPH'
    | 'DIGITAL_TWINS'
    | 'SITUATIONAL_WARNINGS'
    | 'PROBLEM_ORCHESTRATION'
    | 'TEAMS_DISPUTES'
    | 'SCIENCE_SUPPLY_CHAIN'
    | 'FIREWALL_CAPABILITY'
    | 'ACCEPTANCE_REPORT'
  >('HIERARCHY_GRAPH');

  // Service State
  const [entities] = useState(globalEcosystemOperatingSystemV18Service.getEntities());
  const [edges] = useState(globalEcosystemOperatingSystemV18Service.getEdges());
  const [digitalTwins, setDigitalTwins] = useState(globalEcosystemOperatingSystemV18Service.getDigitalTwins());
  const [situations] = useState(globalEcosystemOperatingSystemV18Service.getSituations());
  const [eventCorrelations] = useState(globalEcosystemOperatingSystemV18Service.getEventCorrelations());
  const [earlyWarnings] = useState(globalEcosystemOperatingSystemV18Service.getEarlyWarnings());
  const [cascadeScenarios] = useState(globalEcosystemOperatingSystemV18Service.getCascadeScenarios());
  const [systemicRiskNodes] = useState(globalEcosystemOperatingSystemV18Service.getSystemicRiskNodes());
  const [opportunities] = useState(globalEcosystemOperatingSystemV18Service.getOpportunities());
  const [problems, setProblems] = useState(globalEcosystemOperatingSystemV18Service.getProblemListings());
  const [pipelines, setPipelines] = useState(globalEcosystemOperatingSystemV18Service.getSolutionPipelines());
  const [intelligenceTeams] = useState(globalEcosystemOperatingSystemV18Service.getIntelligenceTeams());
  const [peerReviews] = useState(globalEcosystemOperatingSystemV18Service.getPeerReviews());
  const [disputes, setDisputes] = useState(globalEcosystemOperatingSystemV18Service.getDisputes());
  const [claims] = useState(globalEcosystemOperatingSystemV18Service.getClaims());
  const [researchProjects] = useState(globalEcosystemOperatingSystemV18Service.getResearchProjects());
  const [supplyChainTwins] = useState(globalEcosystemOperatingSystemV18Service.getSupplyChainTwins());
  const [infrastructureModels] = useState(globalEcosystemOperatingSystemV18Service.getInfrastructureModels());
  const [capabilityItems] = useState(globalEcosystemOperatingSystemV18Service.getCapabilityMarketItems());
  const [agentContracts] = useState(globalEcosystemOperatingSystemV18Service.getAgentContracts());
  const [workflowExchange] = useState(globalEcosystemOperatingSystemV18Service.getWorkflowExchange());
  const [incidents] = useState(globalEcosystemOperatingSystemV18Service.getIncidents());
  const [actionFirewallRecords, setActionFirewallRecords] = useState(globalEcosystemOperatingSystemV18Service.getActionFirewallRecords());
  const [emergencyStop, setEmergencyStop] = useState(globalEcosystemOperatingSystemV18Service.getEmergencyStopStatus());
  const [decisionMemory] = useState(globalEcosystemOperatingSystemV18Service.getDecisionMemory());
  const maturity = globalEcosystemOperatingSystemV18Service.getPlatformMaturity();
  const acceptanceReport = globalEcosystemOperatingSystemV18Service.generateV18AcceptanceGateReport();

  // Filters & Interactivity State
  const [selectedHierarchyLevel, setSelectedHierarchyLevel] = useState<EcosystemHierarchyLevel | 'ALL'>('ALL');
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [emergencyReason, setEmergencyReason] = useState('');
  const [showNewProblemModal, setShowNewProblemModal] = useState(false);
  const [newProblemTitle, setNewProblemTitle] = useState('');
  const [newProblemDomain, setNewProblemDomain] = useState('MATERIALS_SCIENCE');
  const [newProblemBudget, setNewProblemBudget] = useState(5000000); // minor units
  const [disputeResolutionText, setDisputeResolutionText] = useState('');
  const [selectedDisputeId, setSelectedDisputeId] = useState<string | null>(null);

  // Twin state switch handler
  const handleTwinStateToggle = (twinId: string, newState: EcosystemDigitalTwinLayer['epistemicState']) => {
    globalEcosystemOperatingSystemV18Service.updateTwinState(twinId, newState);
    setDigitalTwins(globalEcosystemOperatingSystemV18Service.getDigitalTwins());
  };

  // Solution pipeline advance handler
  const handleAdvancePipeline = (orchId: string, nextStage: SolutionOrchestrationPipeline['currentStage']) => {
    globalEcosystemOperatingSystemV18Service.advanceSolutionPipelineStage(orchId, nextStage);
    setPipelines(globalEcosystemOperatingSystemV18Service.getSolutionPipelines());
  };

  // Emergency stop handlers
  const handleTriggerEmergencyStop = () => {
    const updated = globalEcosystemOperatingSystemV18Service.triggerEmergencyGlobalStop(
      'admin@catalyx.global',
      emergencyReason || 'Authorized emergency containment invoked'
    );
    setEmergencyStop(updated);
    setShowEmergencyModal(false);
    setEmergencyReason('');
  };

  const handleReleaseEmergencyStop = () => {
    const updated = globalEcosystemOperatingSystemV18Service.releaseEmergencyGlobalStop('admin@catalyx.global');
    setEmergencyStop(updated);
    setShowEmergencyModal(false);
  };

  // Submit test action to firewall
  const handleSimulateActionFirewall = (isSensitive: boolean) => {
    const actionDesc = isSensitive
      ? 'Transfer $45,000 from Operations Capital Reserve to external supplier account'
      : 'Query anonymized aggregated energy consumption telemetry for Substation 4';
    globalEcosystemOperatingSystemV18Service.submitActionFirewallCheck('ent_agt_supply_optimizer', actionDesc, isSensitive);
    setActionFirewallRecords(globalEcosystemOperatingSystemV18Service.getActionFirewallRecords());
  };

  // Dispute resolution handler
  const handleResolveDispute = (disputeId: string) => {
    if (!disputeResolutionText) return;
    globalEcosystemOperatingSystemV18Service.resolveDispute(disputeId, disputeResolutionText);
    setDisputes(globalEcosystemOperatingSystemV18Service.getDisputes());
    setDisputeResolutionText('');
    setSelectedDisputeId(null);
  };

  // Publish problem listing handler
  const handlePublishProblem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProblemTitle) return;
    globalEcosystemOperatingSystemV18Service.createProblemListing({
      publisherOrgId: 'ent_org_catalyx_research',
      title: newProblemTitle,
      description: 'Governed ecosystem challenge targeting validated computational and empirical resolution.',
      domain: newProblemDomain,
      constraints: ['Verified evidence required', 'Zero unapproved third-party dependencies'],
      budgetAuthorizedMinor: Number(newProblemBudget),
      requiredCapabilities: ['COMPUTATIONAL_MODELING', 'PEER_REVIEWED_VERIFICATION'],
      deadline: new Date(Date.now() + 1000 * 3600 * 24 * 30).toISOString(),
      securityClassification: 'FEDERATED',
      eligibilityCriteria: ['Certified Ecosystem Participant']
    });
    setProblems(globalEcosystemOperatingSystemV18Service.getProblemListings());
    setShowNewProblemModal(false);
    setNewProblemTitle('');
  };

  // Filtered entities
  const filteredEntities = selectedHierarchyLevel === 'ALL'
    ? entities
    : entities.filter(e => e.level === selectedHierarchyLevel);

  return (
    <div className="space-y-6 pb-12">
      {/* V18 HEADER & BANNER */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                V18 ACTIVE
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                ECOSYSTEM OPERATING SYSTEM
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono text-slate-400">
                7-LAYER HIERARCHY PERMISSIONED
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white">
              CATALYX V18: Global Intelligence Coordination & Autonomous Ecosystem OS
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-4xl leading-relaxed">
              Unified operational infrastructure coordinating Humans, Organizations, AI Agents, Workflows, Scientific Research, Industrial Twins, and Markets under strict Zero-Trust boundaries, Epistemic Reality Separation, and Human Governance.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {emergencyStop.activeGlobalStop ? (
              <button
                onClick={() => setShowEmergencyModal(true)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg flex items-center gap-2 border border-red-500 shadow-lg shadow-red-900/40 animate-pulse"
              >
                <AlertOctagon className="w-4 h-4" />
                GLOBAL STOP ACTIVE
              </button>
            ) : (
              <button
                onClick={() => setShowEmergencyModal(true)}
                className="px-3.5 py-2 bg-slate-800 hover:bg-red-950/60 hover:border-red-600/60 text-slate-300 hover:text-red-300 text-xs font-medium rounded-lg flex items-center gap-2 border border-slate-700 transition"
              >
                <ShieldAlert className="w-4 h-4 text-red-400" />
                Emergency Global Stop
              </button>
            )}

            <div className="bg-slate-800/80 border border-slate-700/80 px-3.5 py-2 rounded-lg text-right">
              <div className="text-xs text-slate-400 font-mono">Ecosystem Health</div>
              <div className="text-sm font-bold text-emerald-400 font-mono">
                {maturity.overallEcosystemHealthScorePct}%
              </div>
            </div>
          </div>
        </div>

        {/* Global Stop Alert Banner if active */}
        {emergencyStop.activeGlobalStop && (
          <div className="mt-5 p-3.5 bg-red-950/80 border border-red-600/70 rounded-lg text-red-200 text-xs flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>
                <strong>EMERGENCY FREEZE ENGAGED:</strong> {emergencyStop.reason} | Frozen: {emergencyStop.frozenSubsystems.join(', ')}
              </span>
            </div>
            <button
              onClick={handleReleaseEmergencyStop}
              className="px-3 py-1 bg-red-800 hover:bg-red-700 text-white rounded font-medium text-xs whitespace-nowrap"
            >
              Authorize Resume
            </button>
          </div>
        )}
      </div>

      {/* SUB-NAVIGATION MENU */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto no-scrollbar">
        {[
          { id: 'HIERARCHY_GRAPH', label: 'Ecosystem Graph & Hierarchy', icon: Network },
          { id: 'DIGITAL_TWINS', label: 'Digital Twins (Reality vs Sim)', icon: Layers },
          { id: 'SITUATIONAL_WARNINGS', label: 'Situations & Early Warning', icon: AlertTriangle },
          { id: 'PROBLEM_ORCHESTRATION', label: 'Problem Market & Solutions', icon: Cpu },
          { id: 'TEAMS_DISPUTES', label: 'Intelligence Teams & Disputes', icon: Users },
          { id: 'SCIENCE_SUPPLY_CHAIN', label: 'Science & Supply Chain Twin', icon: Globe },
          { id: 'FIREWALL_CAPABILITY', label: 'AI Firewall & Capability Market', icon: ShieldCheck },
          { id: 'ACCEPTANCE_REPORT', label: 'V18 Master Acceptance Audit', icon: FileText }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap flex items-center gap-2 transition ${
                isActive
                  ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-900/30'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 1. ECOSYSTEM HIERARCHY & GOVERNED GRAPH VIEW */}
      {/* ========================================================================= */}
      {activeSubTab === 'HIERARCHY_GRAPH' && (
        <div className="space-y-6">
          {/* Hierarchy Level Filter Bar */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between gap-4 mb-3 flex-wrap">
              <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Network className="w-4 h-4 text-indigo-400" />
                Governed Ecosystem Hierarchy (Individual → Global Intelligence Network)
              </h2>
              <span className="text-xs text-slate-400">
                Displaying {filteredEntities.length} of {entities.length} permissioned nodes
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {(['ALL', 'INDIVIDUAL', 'TEAM', 'ORGANIZATION', 'ENTERPRISE', 'PARTNER_NETWORK', 'INDUSTRY_ECOSYSTEM', 'GLOBAL_INTELLIGENCE_NETWORK'] as const).map(lvl => (
                <button
                  key={lvl}
                  onClick={() => setSelectedHierarchyLevel(lvl)}
                  className={`px-3 py-1 rounded-md text-xs font-mono transition ${
                    selectedHierarchyLevel === lvl
                      ? 'bg-indigo-500 text-white font-bold'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                  }`}
                >
                  {lvl.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Grid of Ecosystem Entities */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEntities.map(entity => (
              <div
                key={entity.entityId}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700">
                      {entity.level}
                    </span>
                    <h3 className="text-sm font-bold text-slate-100 mt-1.5">{entity.name}</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Trust {entity.trustScore}%
                  </span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">{entity.metadataSummary}</p>

                <div className="pt-2 border-t border-slate-800/80 space-y-1.5 text-[11px]">
                  <div className="flex justify-between text-slate-400">
                    <span>Type:</span>
                    <span className="font-mono text-slate-300">{entity.entityType}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Tenant ID:</span>
                    <span className="font-mono text-slate-300">{entity.tenantId}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Permissions:</span>
                    <span className="font-mono text-indigo-300 text-right truncate max-w-[180px]">
                      {entity.permissionBoundary.join(', ')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Governed Ecosystem Graph Edges & Provenance */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-400" />
              Verified Multi-Tenant Graph Relationships & Provenance
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-slate-300">
                <thead className="bg-slate-800/80 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-700">
                  <tr>
                    <th className="p-3">Source Node</th>
                    <th className="p-3">Relationship</th>
                    <th className="p-3">Target Node</th>
                    <th className="p-3">Weight</th>
                    <th className="p-3">Permission Scope</th>
                    <th className="p-3">Provenance Hash</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {edges.map(edge => (
                    <tr key={edge.edgeId} className="hover:bg-slate-800/40 font-mono">
                      <td className="p-3 text-slate-200">{edge.sourceId}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-800 text-[10px]">
                          {edge.relationshipType}
                        </span>
                      </td>
                      <td className="p-3 text-slate-200">{edge.targetId}</td>
                      <td className="p-3 text-emerald-400 font-bold">{edge.weight}</td>
                      <td className="p-3 text-slate-400">{edge.permissionScope}</td>
                      <td className="p-3 text-slate-500 text-[10px]">{edge.verifiedProvenanceHash}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. DIGITAL TWINS & REALITY VS SIMULATION SEPARATION */}
      {/* ========================================================================= */}
      {activeSubTab === 'DIGITAL_TWINS' && (
        <div className="space-y-6">
          <div className="bg-amber-950/30 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3 text-amber-200 text-xs">
            <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold text-amber-300">STRICT EPISTEMIC INTEGRITY MANDATE:</strong>
              <p className="mt-0.5 text-amber-200/90 leading-relaxed">
                CATALYX V18 rigorously distinguishes between <em>REALITY</em>, <em>LIVE DATA</em>, <em>MATHEMATICAL MODEL</em>, <em>SIMULATION</em>, and <em>PREDICTION</em>. Simulations are never presented as empirical ground truth. All physical actuation interfaces are hard-airgapped by certified safety interlocks.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {digitalTwins.map(twin => {
              const stateColors: Record<EcosystemDigitalTwinLayer['epistemicState'], string> = {
                REALITY: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
                LIVE_DATA: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
                MODEL: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
                SIMULATION: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
                PREDICTION: 'bg-rose-500/20 text-rose-300 border-rose-500/40'
              };

              return (
                <div key={twin.twinId} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                        {twin.targetDomain} TWIN
                      </span>
                      <h3 className="text-base font-bold text-white mt-1">{twin.name}</h3>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold border ${stateColors[twin.epistemicState]}`}>
                      {twin.epistemicState}
                    </span>
                  </div>

                  {/* State Toggle Buttons */}
                  <div>
                    <div className="text-[11px] font-mono text-slate-400 mb-1.5">Epistemic State Control:</div>
                    <div className="flex flex-wrap gap-1.5">
                      {(['LIVE_DATA', 'MODEL', 'SIMULATION', 'PREDICTION'] as const).map(state => (
                        <button
                          key={state}
                          onClick={() => handleTwinStateToggle(twin.twinId, state)}
                          className={`px-2.5 py-1 rounded text-xs font-mono transition ${
                            twin.epistemicState === state
                              ? 'bg-slate-200 text-slate-900 font-bold'
                              : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                          }`}
                        >
                          {state}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Twin Telemetry Metrics */}
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800 text-xs">
                    <div className="bg-slate-800/60 p-2.5 rounded-lg">
                      <div className="text-slate-400 text-[11px]">Telemetry Freshness</div>
                      <div className="text-slate-100 font-mono font-semibold mt-0.5">
                        {twin.liveTelemetryFreshnessSeconds}s ago
                      </div>
                    </div>
                    <div className="bg-slate-800/60 p-2.5 rounded-lg">
                      <div className="text-slate-400 text-[11px]">Reality Variance</div>
                      <div className="text-slate-100 font-mono font-semibold mt-0.5">
                        {twin.realityVariancePct}% margin
                      </div>
                    </div>
                    <div className="bg-slate-800/60 p-2.5 rounded-lg">
                      <div className="text-slate-400 text-[11px]">Simulation Confidence</div>
                      <div className="text-emerald-400 font-mono font-semibold mt-0.5">
                        {twin.simulationConfidencePct}%
                      </div>
                    </div>
                    <div className="bg-slate-800/60 p-2.5 rounded-lg">
                      <div className="text-slate-400 text-[11px]">SCADA Airgap Lock</div>
                      <div className="text-emerald-400 font-mono font-semibold mt-0.5 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        ENFORCED
                      </div>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-500 font-mono">
                    Last synchronized: {new Date(twin.lastSynchronizedAt).toLocaleTimeString()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. SITUATIONAL INTELLIGENCE, CORRELATION & EARLY WARNING */}
      {/* ========================================================================= */}
      {activeSubTab === 'SITUATIONAL_WARNINGS' && (
        <div className="space-y-6">
          {/* Early Warning Signals */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Continuous Early Warning Engine (Domain Signals & Uncertainty Margins)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {earlyWarnings.map(warning => (
                <div
                  key={warning.warningId}
                  className="bg-slate-800/60 border border-slate-700/80 rounded-lg p-4 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-700 text-slate-300">
                      {warning.domain}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        warning.severity === 'CRITICAL'
                          ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {warning.severity}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white leading-snug">{warning.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{warning.evidenceSummary}</p>
                  <div className="pt-2 border-t border-slate-700/60 text-[11px] space-y-1">
                    <div className="flex justify-between text-slate-400">
                      <span>Confidence:</span>
                      <span className="font-mono text-emerald-400 font-semibold">{warning.confidencePct}%</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Uncertainty Margin:</span>
                      <span className="font-mono text-slate-300">±{warning.uncertaintyMarginPct}%</span>
                    </div>
                    <div className="text-slate-300 mt-2 bg-slate-900/60 p-2 rounded text-[11px]">
                      <strong className="text-indigo-300">Mitigation:</strong> {warning.recommendedMitigation}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Event Correlation Engine with Non-Causal Guard */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-400" />
                Event Correlation Engine (Non-Causal Statistical Linkage)
              </h3>
              <span className="text-xs text-amber-400 font-mono">
                Mandate: Correlation ≠ Causation
              </span>
            </div>
            <div className="space-y-3">
              {eventCorrelations.map(corr => (
                <div key={corr.correlationId} className="bg-slate-800/50 border border-slate-700/70 p-3.5 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                        {corr.emergingPattern}
                      </span>
                      <span className="text-xs font-bold text-slate-200">{corr.description}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      Correlated Event IDs: {corr.correlatedEventIds.join(', ')}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-mono shrink-0">
                    <div className="text-right">
                      <div className="text-slate-400 text-[10px]">Strength</div>
                      <div className="text-emerald-400 font-bold">{corr.correlationStrengthPct}%</div>
                    </div>
                    <div className="text-right">
                      <div className="text-slate-400 text-[10px]">Causation Verified</div>
                      <div className={corr.causationVerified ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                        {corr.causationVerified ? 'VERIFIED CAUSAL' : 'NON-CAUSAL HYPOTHESIS'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cascade Risk Engine Simulation */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-purple-400" />
              Cascade Failure Propagation Simulator
            </h3>
            {cascadeScenarios.map(scenario => (
              <div key={scenario.scenarioId} className="space-y-4">
                <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
                  <span className="text-[10px] font-mono text-purple-300 uppercase">Root Failure Trigger:</span>
                  <div className="text-sm font-bold text-white mt-0.5">{scenario.rootFailureEvent}</div>
                  <div className="text-[11px] text-amber-300/80 mt-1 italic">{scenario.certaintyWarning}</div>
                </div>

                {/* Stages visualization */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  {scenario.cascadeChain.map(stage => (
                    <div key={stage.stage} className="bg-slate-800/40 border border-slate-700/60 p-3 rounded-lg space-y-1.5 relative">
                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                        <span>Stage {stage.stage}</span>
                        <span className="text-amber-400 font-bold">{stage.propagationProbabilityPct}%</span>
                      </div>
                      <div className="text-xs font-semibold text-slate-200">{stage.affectedNode}</div>
                      <div className="text-[11px] text-slate-400 leading-snug">{stage.impactDescription}</div>
                      <div className="text-[10px] text-slate-500 font-mono">Lag: +{stage.lagTimeHours}h</div>
                    </div>
                  ))}
                </div>

                {/* Mitigations */}
                <div className="bg-slate-800/30 p-3 rounded-lg border border-slate-700/50">
                  <div className="text-xs font-semibold text-indigo-300 mb-1">Simulated Dynamic Countermeasures:</div>
                  <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
                    {scenario.simulatedMitigationOptions.map((opt, i) => (
                      <li key={i}>{opt}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Systemic Risk Map */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Server className="w-4 h-4 text-rose-400" />
              Systemic Risk Map & Single Point of Failure (SPOF) Analysis
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {systemicRiskNodes.map(node => (
                <div key={node.nodeId} className="bg-slate-800/50 border border-slate-700 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between items-start">
                    <h4 className="text-xs font-bold text-white">{node.entityName}</h4>
                    {node.isSinglePointOfFailure && (
                      <span className="px-1.5 py-0.5 rounded bg-red-950 text-red-400 border border-red-800 text-[10px] font-bold">
                        SPOF
                      </span>
                    )}
                  </div>
                  <div className="space-y-1 text-[11px] text-slate-400">
                    <div className="flex justify-between">
                      <span>Concentration Score:</span>
                      <span className="font-mono text-rose-400 font-bold">{node.concentrationScorePct}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Downstream Dependents:</span>
                      <span className="font-mono text-slate-200">{node.dependentCount} nodes</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Critical Resources:</span>
                      <span className="text-slate-300 truncate max-w-[160px]">{node.criticalResourceTies.join(', ')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. PROBLEM MARKET & SOLUTION ORCHESTRATION PIPELINE */}
      {/* ========================================================================= */}
      {activeSubTab === 'PROBLEM_ORCHESTRATION' && (
        <div className="space-y-6">
          {/* Header & Post Problem Button */}
          <div className="flex items-center justify-between flex-wrap gap-4 bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div>
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-indigo-400" />
                Ecosystem Problem Market & 10-Stage Solution Orchestration
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Organizations publish complex challenges. CATALYX decomposes, matches capabilities, forms hybrid teams, simulates outcomes, and requests human sign-off.
              </p>
            </div>
            <button
              onClick={() => setShowNewProblemModal(true)}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 shadow"
            >
              <Cpu className="w-3.5 h-3.5" />
              Publish Ecosystem Problem
            </button>
          </div>

          {/* Active 10-Stage Orchestration Pipeline */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              Active Solution Orchestration Pipeline: {pipelines[0]?.problemId}
            </h3>

            {/* Stepper */}
            {pipelines.map(pipe => {
              const stages: SolutionOrchestrationPipeline['currentStage'][] = [
                'UNDERSTAND',
                'DECOMPOSE',
                'FIND_CAPABILITIES',
                'FORM_SOLUTION_TEAM',
                'SIMULATE',
                'ESTIMATE_COST',
                'REQUEST_APPROVAL',
                'EXECUTE',
                'VERIFY',
                'MEASURE'
              ];
              const currentIndex = stages.indexOf(pipe.currentStage);

              return (
                <div key={pipe.orchestrationId} className="space-y-5">
                  <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-1.5">
                    {stages.map((stg, idx) => {
                      const isPast = idx < currentIndex;
                      const isCurrent = idx === currentIndex;
                      return (
                        <div
                          key={stg}
                          className={`p-2 rounded text-center text-[10px] font-mono border transition ${
                            isCurrent
                              ? 'bg-indigo-600 text-white border-indigo-400 font-bold shadow'
                              : isPast
                              ? 'bg-slate-800/80 text-emerald-400 border-emerald-500/40'
                              : 'bg-slate-900/60 text-slate-500 border-slate-800'
                          }`}
                        >
                          <div className="text-[9px] opacity-70">0{idx + 1}</div>
                          <div className="truncate">{stg.replace('_', ' ')}</div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Pipeline Details & Approval Action */}
                  <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4 space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <span className="text-[10px] font-mono text-indigo-400 uppercase">Current Stage</span>
                        <div className="text-base font-bold text-white">{pipe.currentStage.replace('_', ' ')}</div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          Estimated Cost: ${(pipe.estimatedCostMinor / 100).toLocaleString()} | Simulated Success: {pipe.simulatedSuccessRatePct}%
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {pipe.currentStage === 'FORM_SOLUTION_TEAM' && (
                          <button
                            onClick={() => handleAdvancePipeline(pipe.orchestrationId, 'SIMULATE')}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5"
                          >
                            Advance to Simulation
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {pipe.currentStage === 'SIMULATE' && (
                          <button
                            onClick={() => handleAdvancePipeline(pipe.orchestrationId, 'ESTIMATE_COST')}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5"
                          >
                            Advance to Costing
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {pipe.currentStage === 'ESTIMATE_COST' && (
                          <button
                            onClick={() => handleAdvancePipeline(pipe.orchestrationId, 'REQUEST_APPROVAL')}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5"
                          >
                            Request Human Approval
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {pipe.currentStage === 'REQUEST_APPROVAL' && (
                          <button
                            onClick={() => handleAdvancePipeline(pipe.orchestrationId, 'EXECUTE')}
                            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-lg shadow-emerald-900/30"
                          >
                            <Check className="w-4 h-4" />
                            Sign & Authorize Execution
                          </button>
                        )}
                        {pipe.currentStage === 'EXECUTE' && (
                          <button
                            onClick={() => handleAdvancePipeline(pipe.orchestrationId, 'VERIFY')}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5"
                          >
                            Perform Verification Audit
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {pipe.currentStage === 'VERIFY' && (
                          <button
                            onClick={() => handleAdvancePipeline(pipe.orchestrationId, 'MEASURE')}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5"
                          >
                            Measure Outcome Value
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Subtasks breakdown */}
                    <div className="space-y-2 pt-2 border-t border-slate-700">
                      <div className="text-xs font-semibold text-slate-300">Decomposed Subtasks:</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {pipe.decomposedSubtasks.map(task => (
                          <div key={task.taskId} className="bg-slate-900/80 p-2.5 rounded border border-slate-700/60 flex items-center justify-between text-xs">
                            <div>
                              <div className="font-medium text-slate-200">{task.title}</div>
                              <div className="text-[10px] text-slate-400 font-mono">{task.assignedCapability}</div>
                            </div>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-emerald-400">
                              {task.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Problem Listings Marketplace */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {problems.map(p => (
              <div key={p.problemId} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-indigo-300">
                      {p.domain}
                    </span>
                    <h4 className="text-sm font-bold text-white mt-1">{p.title}</h4>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    ${(p.budgetAuthorizedMinor / 100).toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{p.description}</p>
                <div className="text-[11px] space-y-1 text-slate-400 pt-2 border-t border-slate-800">
                  <div><strong className="text-slate-300">Constraints:</strong> {p.constraints.join('; ')}</div>
                  <div><strong className="text-slate-300">Capabilities:</strong> {p.requiredCapabilities.join(', ')}</div>
                  <div className="flex justify-between items-center pt-1 text-[10px] font-mono">
                    <span className="text-slate-500">Security: {p.securityClassification}</span>
                    <span className="text-indigo-400 font-semibold">{p.matchedSolutionsCount} Solvers Matched</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. INTELLIGENCE TEAMS, DISPUTES & CLAIM GRAPH */}
      {/* ========================================================================= */}
      {activeSubTab === 'TEAMS_DISPUTES' && (
        <div className="space-y-6">
          {/* Hybrid Governed Intelligence Teams */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" />
              Dynamic Governed Intelligence Teams (AI Agents + Human Experts)
            </h2>
            {intelligenceTeams.map(team => (
              <div key={team.teamId} className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-white">{team.name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{team.missionStatement}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 text-[10px] font-mono">
                      {team.authorityLevel}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-mono">
                      {team.status}
                    </span>
                  </div>
                </div>

                {/* Team Members List */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {team.members.map(member => (
                    <div key={member.memberId} className="bg-slate-900/90 border border-slate-800 p-3 rounded-lg space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-200">{member.name}</span>
                        <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                          member.kind === 'HUMAN_EXPERT'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-blue-500/20 text-blue-300'
                        }`}>
                          {member.kind}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400">{member.role}</div>
                      {member.verifiedCredentials && (
                        <div className="text-[10px] text-emerald-400 font-mono">
                          ✓ {member.verifiedCredentials.join(' | ')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Dispute & Contradiction Resolution System */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Scale className="w-4 h-4 text-amber-400" />
                Structured Dispute & Contradiction System (Position A vs Position B)
              </h3>
              <span className="text-xs text-slate-400">Zero Silent Overwriting</span>
            </div>

            {disputes.map(disp => (
              <div key={disp.disputeId} className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white">{disp.subjectTopic}</h4>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    {disp.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Position A */}
                  <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-lg space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-indigo-300">{disp.positionA.partyId}</span>
                      <span className="font-mono text-slate-400">Confidence {disp.positionA.confidencePct}%</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{disp.positionA.positionSummary}</p>
                    <div className="text-[11px] text-slate-400 space-y-1 pt-1 border-t border-slate-800">
                      <div><strong className="text-slate-300">Evidence:</strong> {disp.positionA.evidence.join('; ')}</div>
                      <div><strong className="text-slate-300">Assumptions:</strong> {disp.positionA.assumptions.join('; ')}</div>
                    </div>
                  </div>

                  {/* Position B */}
                  <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-lg space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-amber-300">{disp.positionB.partyId}</span>
                      <span className="font-mono text-slate-400">Confidence {disp.positionB.confidencePct}%</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{disp.positionB.positionSummary}</p>
                    <div className="text-[11px] text-slate-400 space-y-1 pt-1 border-t border-slate-800">
                      <div><strong className="text-slate-300">Evidence:</strong> {disp.positionB.evidence.join('; ')}</div>
                      <div><strong className="text-slate-300">Assumptions:</strong> {disp.positionB.assumptions.join('; ')}</div>
                    </div>
                  </div>
                </div>

                {disp.resolutionSummary && (
                  <div className="bg-emerald-950/40 border border-emerald-700/60 p-3 rounded-lg text-xs text-emerald-200">
                    <strong className="text-emerald-300">Governed Resolution Summary:</strong> {disp.resolutionSummary}
                  </div>
                )}

                {disp.status !== 'RESOLVED_BY_CONSENSUS' && (
                  <div className="flex gap-2 items-center pt-2">
                    <input
                      type="text"
                      placeholder="Input verified consensus synthesis..."
                      value={selectedDisputeId === disp.disputeId ? disputeResolutionText : ''}
                      onChange={e => {
                        setSelectedDisputeId(disp.disputeId);
                        setDisputeResolutionText(e.target.value);
                      }}
                      className="bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-xs text-white flex-1 focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      onClick={() => handleResolveDispute(disp.disputeId)}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-semibold"
                    >
                      Resolve Debate
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Claim Graph & Versioned Knowledge Evolution */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              Versioned Claim Graph (Knowledge Evolution & Retraction History)
            </h3>
            {claims.map(claim => (
              <div key={claim.claimId} className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400">Claim ID: {claim.claimId}</span>
                    <h4 className="text-sm font-bold text-white mt-0.5">{claim.statement}</h4>
                  </div>
                  <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300">
                    {claim.confidencePct}% Verified
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-300">
                  <div className="bg-slate-900/60 p-2.5 rounded">
                    <span className="text-slate-400 block text-[10px] font-mono">Methodology:</span>
                    {claim.methodology}
                  </div>
                  <div className="bg-slate-900/60 p-2.5 rounded">
                    <span className="text-slate-400 block text-[10px] font-mono">Empirical Test Result:</span>
                    {claim.testResult}
                  </div>
                </div>

                {/* Historical Versions */}
                <div className="text-xs pt-2 border-t border-slate-700 space-y-1.5">
                  <div className="text-[11px] font-semibold text-slate-400">Knowledge Evolution History:</div>
                  {claim.historicalVersions.map(v => (
                    <div key={v.version} className="bg-slate-900/80 p-2 rounded text-[11px] text-slate-400 flex items-start gap-2">
                      <span className="font-mono text-indigo-400">v{v.version}</span>
                      <div>
                        <div>{v.statement}</div>
                        {v.supersededReason && (
                          <div className="text-rose-400/90 text-[10px] italic mt-0.5">
                            Superseded: {v.supersededReason}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. SCIENTIFIC RESEARCH & INDUSTRIAL SUPPLY CHAIN TWIN */}
      {/* ========================================================================= */}
      {activeSubTab === 'SCIENCE_SUPPLY_CHAIN' && (
        <div className="space-y-6">
          {/* Scientific Research Ecosystem */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Globe className="w-4 h-4 text-indigo-400" />
                Collaborative Scientific Research Ecosystem & Reproducibility
              </h2>
              <span className="text-xs text-indigo-400 font-mono">
                Mandate: Hypotheses ≠ Confirmed Discoveries
              </span>
            </div>

            {researchProjects.map(proj => (
              <div key={proj.projectId} className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-indigo-300">
                      {proj.domain}
                    </span>
                    <h3 className="text-sm font-bold text-white mt-1">{proj.title}</h3>
                    <div className="text-xs text-slate-400 mt-0.5">Lead: {proj.leadInstitution}</div>
                  </div>
                  {proj.isHypothesisOnly && (
                    <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      UNVERIFIED HYPOTHESIS
                    </span>
                  )}
                </div>

                <div className="bg-slate-900/80 p-3 rounded text-xs text-slate-200 border border-slate-800">
                  <strong className="text-indigo-300">Hypothesis Statement:</strong> {proj.hypothesisStatement}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div className="bg-slate-900/60 p-2.5 rounded font-mono">
                    <span className="text-slate-500 text-[10px] block">Dataset Tag</span>
                    <span className="text-slate-200 truncate block">{proj.datasetVersionTag}</span>
                  </div>
                  <div className="bg-slate-900/60 p-2.5 rounded font-mono">
                    <span className="text-slate-500 text-[10px] block">Git Code Hash</span>
                    <span className="text-slate-200 truncate block">{proj.codeRepositoryHash}</span>
                  </div>
                  <div className="bg-slate-900/60 p-2.5 rounded font-mono">
                    <span className="text-slate-500 text-[10px] block">Reproducibility</span>
                    <span className="text-emerald-400 font-bold block">{proj.reproducibilityScorePct}%</span>
                  </div>
                  <div className="bg-slate-900/60 p-2.5 rounded font-mono">
                    <span className="text-slate-500 text-[10px] block">Runtime Env</span>
                    <span className="text-slate-200 truncate block">{proj.runtimeEnvironment}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Global Supply Chain Twin */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Building className="w-4 h-4 text-emerald-400" />
              Global Supply-Chain Twin: Multi-Tier Corridor
            </h3>
            {supplyChainTwins.map(sc => (
              <div key={sc.supplyChainId} className="space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-white font-bold">{sc.name}</span>
                  <span className="text-slate-400 font-mono">Demand Variance: ±{sc.demandForecastVariancePct}%</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {sc.nodes.map(node => (
                    <div key={node.id} className="bg-slate-800/60 border border-slate-700/80 p-3.5 rounded-lg space-y-2 text-xs">
                      <div className="flex justify-between items-center text-[10px] font-mono">
                        <span className="px-1.5 py-0.5 rounded bg-slate-700 text-slate-300">{node.tier}</span>
                        <span className={node.bottleneckRisk === 'NONE' ? 'text-emerald-400' : 'text-amber-400'}>
                          {node.bottleneckRisk} RISK
                        </span>
                      </div>
                      <div className="font-bold text-white leading-snug">{node.name}</div>
                      <div className="text-[11px] text-slate-400">{node.location}</div>
                      <div className="pt-2 border-t border-slate-700 text-[11px] flex justify-between">
                        <span className="text-slate-400">Capacity:</span>
                        <span className="font-mono text-slate-200">{node.capacityUsagePct}%</span>
                      </div>
                    </div>
                  ))}
                </div>

                {sc.simulatedDisruptionEffect && (
                  <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-700/60 text-xs text-slate-300">
                    <strong className="text-indigo-300">Simulated Disruption Assessment:</strong> {sc.simulatedDisruptionEffect}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Infrastructure Resilience Models */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-400" />
              Critical Infrastructure Ecosystem Resilience Models
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {infrastructureModels.map(model => (
                <div key={model.modelId} className="bg-slate-800/60 border border-slate-700/80 p-4 rounded-xl space-y-2.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white">{model.sector} RESILIENCE</span>
                    <span className="font-mono text-emerald-400 font-bold">{model.resilienceScorePct}% Resilient</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">{model.simulatedFailureImpact}</p>
                  <div className="p-2 bg-amber-950/30 border border-amber-500/20 rounded text-[10px] text-amber-200/90 font-mono">
                    {model.recommendationsOnlyNotice}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. AI ACTION FIREWALL, CAPABILITY MARKET & DECISION MEMORY */}
      {/* ========================================================================= */}
      {activeSubTab === 'FIREWALL_CAPABILITY' && (
        <div className="space-y-6">
          {/* AI Action Firewall */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  AI Action Firewall (8-Stage Execution Verification)
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Pre-execution classified checks: Intent → Identity → Policy → Risk → Authority → Approval → Execute → Verify.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleSimulateActionFirewall(false)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded border border-slate-700 transition"
                >
                  Simulate Low-Risk Query
                </button>
                <button
                  onClick={() => handleSimulateActionFirewall(true)}
                  className="px-3 py-1.5 bg-amber-600/80 hover:bg-amber-600 text-white text-xs font-semibold rounded transition"
                >
                  Simulate Sensitive Action
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {actionFirewallRecords.slice(0, 4).map(rec => (
                <div key={rec.actionId} className="bg-slate-800/60 border border-slate-700/80 p-3.5 rounded-lg space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-slate-400">{rec.agentId}</span>
                      <span className="font-medium text-slate-200">{rec.requestedAction}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      rec.decision === 'APPROVED_AND_EXECUTED'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : rec.decision === 'HELD_FOR_HUMAN_SIGNATURE'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-red-500/20 text-red-300'
                    }`}>
                      {rec.decision.replace(/_/g, ' ')}
                    </span>
                  </div>

                  {rec.blockedThreatReason && (
                    <div className="text-[11px] text-red-400 bg-red-950/40 p-2 rounded">
                      Blocked Reason: {rec.blockedThreatReason}
                    </div>
                  )}

                  <div className="flex gap-2 text-[10px] font-mono text-slate-400 pt-1">
                    <span>Classified: ✓</span>
                    <span>Policy Checked: {rec.pipelineStagesPassed.policyChecked ? '✓' : '✗'}</span>
                    <span>Authority: {rec.pipelineStagesPassed.authorityConfirmed ? '✓' : '✗'}</span>
                    <span>Human Approval: {rec.pipelineStagesPassed.humanApprovalObtained ? '✓' : 'PENDING'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Capability Market Items */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-400" />
              Ecosystem Capability Market & Agent-to-Agent Contracts
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {capabilityItems.map(item => (
                <div key={item.itemId} className="bg-slate-800/60 border border-slate-700 p-4 rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-700 text-indigo-300">
                      {item.capabilityType}
                    </span>
                    <span className="text-emerald-400 font-mono font-bold">{item.providerTrustScore}%</span>
                  </div>
                  <h4 className="font-bold text-white text-sm">{item.title}</h4>
                  <div className="text-slate-400">{item.providerName}</div>
                  <div className="text-slate-300 font-mono text-[11px]">{item.costStructure}</div>
                  <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-700">
                    Privacy: {item.privacyGuarantee}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Decision Memory & Calibration Engine */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-400" />
              Decision Memory & Calibration Engine (Predicted vs Actual Outcomes)
            </h3>
            <div className="space-y-3">
              {decisionMemory.map(dec => (
                <div key={dec.decisionId} className="bg-slate-800/60 border border-slate-700/80 p-4 rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-white text-sm">{dec.decisionTitle}</h4>
                    <span className="text-emerald-400 font-mono text-[11px]">
                      Calibration Variance: {dec.calibrationVariancePct}%
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
                      <span className="text-[10px] font-mono text-indigo-300 block">Predicted Outcome ({dec.predictedConfidencePct}% Conf):</span>
                      <p className="text-slate-300 mt-1">{dec.predictedOutcome}</p>
                    </div>
                    <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
                      <span className="text-[10px] font-mono text-emerald-300 block">Actual Observed Outcome:</span>
                      <p className="text-slate-300 mt-1">{dec.actualObservedOutcome}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. V18 MASTER ACCEPTANCE AUDIT REPORT */}
      {/* ========================================================================= */}
      {activeSubTab === 'ACCEPTANCE_REPORT' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <div className="text-xs font-mono text-emerald-400 uppercase tracking-wider">
                  OFFICIAL PRODUCTION CERTIFICATION
                </div>
                <h2 className="text-xl font-bold mt-1">CATALYX V18 Master Production Acceptance Gate</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Report ID: {acceptanceReport.reportId} | Generated: {new Date(acceptanceReport.generatedAt).toLocaleString()}
                </p>
              </div>

              <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 font-mono font-bold text-sm text-center">
                {acceptanceReport.certificationVerdict}
              </div>
            </div>

            {/* Audit Checklist Table */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-200">12-Point Comprehensive Ecosystem Audit Checklist</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left text-slate-300">
                  <thead className="bg-slate-800/80 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-700">
                    <tr>
                      <th className="p-3">Section</th>
                      <th className="p-3">Requirement & Standard</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Verified Evidence</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {acceptanceReport.auditChecklist.map(item => (
                      <tr key={item.checkId} className="hover:bg-slate-800/40">
                        <td className="p-3 font-mono text-indigo-400">{item.category}</td>
                        <td className="p-3 text-slate-200 font-medium">{item.requirement}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono text-[10px] font-bold flex items-center gap-1 w-fit">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            {item.status}
                          </span>
                        </td>
                        <td className="p-3 text-slate-400 text-[11px]">{item.evidenceDetails}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Final Governance & Human Authority Boundary Seal */}
            <div className="bg-slate-800/50 border border-slate-700/60 p-4 rounded-xl text-xs space-y-2 text-slate-300">
              <div className="font-semibold text-slate-200 flex items-center gap-2">
                <Shield className="w-4 h-4 text-indigo-400" />
                Human Authority, Legal & Physical Boundary Declaration
              </div>
              <p className="text-slate-400 leading-relaxed">
                CATALYX V18 acts as an autonomous coordination and intelligence operating system under legitimate human governance. It does not claim autonomous sovereign authority, automatic regulatory certification, or direct un-airgapped physical control over external critical infrastructure. All financial, high-risk operational, and safety-critical decisions remain bounded by certified human approval gates.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* EMERGENCY STOP MODAL */}
      {showEmergencyModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-red-600/80 rounded-2xl max-w-lg w-full p-6 text-white space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400">
              <AlertOctagon className="w-6 h-6" />
              <h3 className="text-lg font-bold">Emergency Global Stop Control</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Invoking Emergency Global Stop will immediately freeze all Autonomous Agents, Missions, Commerce transactions, Marketplace listings, and External third-party integrations across the entire ecosystem.
            </p>

            {emergencyStop.activeGlobalStop ? (
              <div className="space-y-4">
                <div className="p-3 bg-red-950/60 border border-red-700 rounded-lg text-xs text-red-200">
                  Global Stop is currently <strong>ACTIVE</strong>. Frozen by {emergencyStop.triggeredByEmail}.
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowEmergencyModal(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleReleaseEmergencyStop}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs"
                  >
                    Authorize Release & Resume
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Reason for Emergency Containment:</label>
                  <input
                    type="text"
                    value={emergencyReason}
                    onChange={e => setEmergencyReason(e.target.value)}
                    placeholder="e.g., Anomaly detected in cross-tenant webhook payload"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowEmergencyModal(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleTriggerEmergencyStop}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5"
                  >
                    <AlertOctagon className="w-4 h-4" />
                    Trigger Immediate Global Stop
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* NEW PROBLEM MODAL */}
      {showNewProblemModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 text-white space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Publish Ecosystem Problem</h3>
            <form onSubmit={handlePublishProblem} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Problem Title</label>
                <input
                  type="text"
                  required
                  value={newProblemTitle}
                  onChange={e => setNewProblemTitle(e.target.value)}
                  placeholder="e.g., Real-time Carbon Accounting for Marine Fuels"
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Domain</label>
                <select
                  value={newProblemDomain}
                  onChange={e => setNewProblemDomain(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white"
                >
                  <option value="MATERIALS_SCIENCE">Materials Science</option>
                  <option value="GLOBAL_LOGISTICS">Global Logistics</option>
                  <option value="ENERGY_SYSTEMS">Energy Systems</option>
                  <option value="BIOMEDICAL">Biomedical Engineering</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Authorized Budget (USD)</label>
                <input
                  type="number"
                  value={newProblemBudget / 100}
                  onChange={e => setNewProblemBudget(Number(e.target.value) * 100)}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewProblemModal(false)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 rounded text-white font-semibold"
                >
                  Publish Problem
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
