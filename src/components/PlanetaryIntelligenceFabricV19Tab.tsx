import React, { useState, useEffect } from 'react';
import {
  Globe,
  Cpu,
  ShieldCheck,
  Activity,
  Compass,
  Layers,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  BarChart3,
  Lock,
  RefreshCw,
  Play,
  Database,
  Search,
  Zap,
  Sliders,
  FileText,
  Sparkles,
  Award,
  ChevronRight,
  Info,
  Server,
  Terminal,
  ShieldAlert,
  HelpCircle,
  Network,
  GitPullRequest
} from 'lucide-react';
import { planetaryIntelligenceFabricV19Service } from '../services/planetaryIntelligenceFabricV19Service';
import {
  UniversalWorldEntity,
  PlanetaryDigitalTwin,
  SimulationScenario,
  CausalGraphRelationship,
  PlanetaryEventRecord,
  SituationalIntelligenceDigest,
  GlobalResilienceAssessment,
  GlobalResourceGraphItem,
  UniversalCapabilityRecord,
  GovernedProblemCase,
  AdvancedAgentCollective,
  PhysicalSystemsGatewayRequest,
  ScientificResearchArtifact,
  PlanetaryClaimGraphNode,
  PredictionCalibrationRecord,
  DecisionIntelligenceCase,
  MultiObjectiveOptimizationProfile,
  ImmutableLedgerEntry,
  DeveloperCloudProject,
  WorkflowMarketplaceItem,
  AIActionFirewallV19Record,
  EmergencySystemControlV19,
  PlatformHealthMatrixV19,
  V19AcceptanceGateReport,
  EpistemicTruthClassification
} from '../types';

export const PlanetaryIntelligenceFabricV19Tab: React.FC = () => {
  // Navigation subtabs inside V19
  const [activeSubTab, setActiveSubTab] = useState<
    'world-model' | 'simulation-causal' | 'situation-resilience' | 'problems-agents' | 'science-decision' | 'commerce-firewall' | 'acceptance-gate'
  >('world-model');

  // Interactive Simulation Controls
  const [simCapacityShock, setSimCapacityShock] = useState<number>(35);
  const [simDelayDays, setSimDelayDays] = useState<number>(14);
  const [simBudgetMult, setSimBudgetMult] = useState<number>(1.8);
  const [simTitle, setSimTitle] = useState<string>('Pacific Port Transshipment Draft Reduction');
  const [simRunning, setSimRunning] = useState<boolean>(false);
  const [simulationResult, setSimulationResult] = useState<SimulationScenario | null>(null);

  // Firewall Test Action Controls
  const [fwAgentId, setFwAgentId] = useState<string>('agent_grid_balancer_alpha');
  const [fwTargetSystem, setFwTargetSystem] = useState<string>('asset_substation_north_peaker_turbine');
  const [fwRiskSeverity, setFwRiskSeverity] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('HIGH');
  const [fwActionDesc, setFwActionDesc] = useState<string>('Initiate automated grid phase angle resynchronization and secondary bypass breaker closure');
  const [firewallTestResult, setFirewallTestResult] = useState<AIActionFirewallV19Record | null>(null);

  // Emergency Stop State
  const [emergencyState, setEmergencyState] = useState<EmergencySystemControlV19>(
    planetaryIntelligenceFabricV19Service.getEmergencyControlState()
  );
  const [emergencyReason, setEmergencyReason] = useState<string>('Automated system-wide risk containment test');

  // Filter state for World Model
  const [entityCategoryFilter, setEntityCategoryFilter] = useState<string>('ALL');
  const [entityEpistemicFilter, setEntityEpistemicFilter] = useState<string>('ALL');

  // Live Data Pulls
  const [worldEntities, setWorldEntities] = useState<UniversalWorldEntity[]>([]);
  const [digitalTwins, setDigitalTwins] = useState<PlanetaryDigitalTwin[]>([]);
  const [simScenarios, setSimScenarios] = useState<SimulationScenario[]>([]);
  const [causalLinks, setCausalLinks] = useState<CausalGraphRelationship[]>([]);
  const [planetaryEvents, setPlanetaryEvents] = useState<PlanetaryEventRecord[]>([]);
  const [situationalDigests, setSituationalDigests] = useState<SituationalIntelligenceDigest[]>([]);
  const [resilienceAssessments, setResilienceAssessments] = useState<GlobalResilienceAssessment[]>([]);
  const [resourceItems, setResourceItems] = useState<GlobalResourceGraphItem[]>([]);
  const [capabilityItems, setCapabilityItems] = useState<UniversalCapabilityRecord[]>([]);
  const [problemCases, setProblemCases] = useState<GovernedProblemCase[]>([]);
  const [agentCollectives, setAgentCollectives] = useState<AdvancedAgentCollective[]>([]);
  const [physicalRequests, setPhysicalRequests] = useState<PhysicalSystemsGatewayRequest[]>([]);
  const [scientificArtifacts, setScientificArtifacts] = useState<ScientificResearchArtifact[]>([]);
  const [claimNodes, setClaimNodes] = useState<PlanetaryClaimGraphNode[]>([]);
  const [predictions, setPredictions] = useState<PredictionCalibrationRecord[]>([]);
  const [decisionCases, setDecisionCases] = useState<DecisionIntelligenceCase[]>([]);
  const [optimizationProfile, setOptimizationProfile] = useState<MultiObjectiveOptimizationProfile[]>([]);
  const [immutableLedger, setImmutableLedger] = useState<ImmutableLedgerEntry[]>([]);
  const [developerProjects, setDeveloperProjects] = useState<DeveloperCloudProject[]>([]);
  const [marketplaceWorkflows, setMarketplaceWorkflows] = useState<WorkflowMarketplaceItem[]>([]);
  const [firewallRecords, setFirewallRecords] = useState<AIActionFirewallV19Record[]>([]);
  const [healthMatrix, setHealthMatrix] = useState<PlatformHealthMatrixV19>(
    planetaryIntelligenceFabricV19Service.getPlatformHealthMatrix()
  );
  const [acceptanceReport, setAcceptanceReport] = useState<V19AcceptanceGateReport>(
    planetaryIntelligenceFabricV19Service.getV19AcceptanceGateReport()
  );

  const refreshData = () => {
    setWorldEntities(planetaryIntelligenceFabricV19Service.getWorldEntities());
    setDigitalTwins(planetaryIntelligenceFabricV19Service.getDigitalTwins());
    setSimScenarios(planetaryIntelligenceFabricV19Service.getSimulationScenarios());
    setCausalLinks(planetaryIntelligenceFabricV19Service.getCausalRelationships());
    setPlanetaryEvents(planetaryIntelligenceFabricV19Service.getPlanetaryEvents());
    setSituationalDigests(planetaryIntelligenceFabricV19Service.getSituationalDigests());
    setResilienceAssessments(planetaryIntelligenceFabricV19Service.getResilienceAssessments());
    setResourceItems(planetaryIntelligenceFabricV19Service.getResourceGraphItems());
    setCapabilityItems(planetaryIntelligenceFabricV19Service.getCapabilityRegistry());
    setProblemCases(planetaryIntelligenceFabricV19Service.getProblemCases());
    setAgentCollectives(planetaryIntelligenceFabricV19Service.getAgentCollectives());
    setPhysicalRequests(planetaryIntelligenceFabricV19Service.getPhysicalGatewayRequests());
    setScientificArtifacts(planetaryIntelligenceFabricV19Service.getScientificArtifacts());
    setClaimNodes(planetaryIntelligenceFabricV19Service.getClaimNodes());
    setPredictions(planetaryIntelligenceFabricV19Service.getPredictionRecords());
    setDecisionCases(planetaryIntelligenceFabricV19Service.getDecisionCases());
    setOptimizationProfile(planetaryIntelligenceFabricV19Service.getOptimizationProfiles());
    setImmutableLedger(planetaryIntelligenceFabricV19Service.getImmutableLedger());
    setDeveloperProjects(planetaryIntelligenceFabricV19Service.getDeveloperProjects());
    setMarketplaceWorkflows(planetaryIntelligenceFabricV19Service.getWorkflowMarketplaceItems());
    setFirewallRecords(planetaryIntelligenceFabricV19Service.getFirewallRecords());
    setEmergencyState(planetaryIntelligenceFabricV19Service.getEmergencyControlState());
    setHealthMatrix(planetaryIntelligenceFabricV19Service.getPlatformHealthMatrix());
    setAcceptanceReport(planetaryIntelligenceFabricV19Service.getV19AcceptanceGateReport());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleRunSimulation = () => {
    setSimRunning(true);
    setTimeout(() => {
      const res = planetaryIntelligenceFabricV19Service.runInteractiveSimulation({
        title: simTitle,
        scenarioType: 'STRESS',
        capacityShockPct: simCapacityShock,
        delayDays: simDelayDays,
        budgetMultiplier: simBudgetMult
      });
      setSimulationResult(res);
      setSimScenarios(planetaryIntelligenceFabricV19Service.getSimulationScenarios());
      setSimRunning(false);
    }, 600);
  };

  const handleSubmitFirewallTest = () => {
    const res = planetaryIntelligenceFabricV19Service.submitActionToFirewall({
      callerAgentId: fwAgentId,
      targetSystem: fwTargetSystem,
      riskSeverity: fwRiskSeverity,
      actionDescription: fwActionDesc
    });
    setFirewallTestResult(res);
    setFirewallRecords(planetaryIntelligenceFabricV19Service.getFirewallRecords());
  };

  const handleToggleEmergencyStop = () => {
    const nextHalt = !emergencyState.activeMasterHalt;
    const res = planetaryIntelligenceFabricV19Service.toggleEmergencyMasterHalt(
      nextHalt,
      emergencyReason,
      'Dr. Marcus Vance (Chief Safety Officer)'
    );
    setEmergencyState(res);
  };

  const handleAdvanceProblemStage = (problemId: string, currentStage: GovernedProblemCase['pipelineStage']) => {
    const stageOrder: GovernedProblemCase['pipelineStage'][] = [
      'UNDERSTAND',
      'DECOMPOSE',
      'IDENTIFY_CAPABILITIES',
      'FORM_TEAM',
      'GATHER_EVIDENCE',
      'SIMULATE',
      'EVALUATE',
      'PLAN',
      'AUTHORIZE',
      'EXECUTE',
      'VERIFY',
      'LEARN'
    ];
    const currentIndex = stageOrder.indexOf(currentStage);
    const nextStage = stageOrder[Math.min(stageOrder.length - 1, currentIndex + 1)];
    planetaryIntelligenceFabricV19Service.advanceProblemCaseStage(problemId, nextStage);
    setProblemCases(planetaryIntelligenceFabricV19Service.getProblemCases());
  };

  const handleApprovePhysicalRequest = (requestId: string, approve: boolean) => {
    planetaryIntelligenceFabricV19Service.approvePhysicalGatewayRequest(requestId, approve);
    setPhysicalRequests(planetaryIntelligenceFabricV19Service.getPhysicalGatewayRequests());
  };

  const filteredEntities = worldEntities.filter(e => {
    if (entityCategoryFilter !== 'ALL' && e.category !== entityCategoryFilter) return false;
    if (entityEpistemicFilter !== 'ALL' && e.epistemicStatus !== entityEpistemicFilter) return false;
    return true;
  });

  return (
    <div id="v19-planetary-fabric-container" className="space-y-6 text-slate-100 pb-16">
      {/* Top Banner: Planetary Intelligence Fabric V19 Overview */}
      <div className="relative overflow-hidden rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-slate-950 via-indigo-950/70 to-slate-950 p-6 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono font-bold tracking-widest text-indigo-400 uppercase">
                PLANETARY INTELLIGENCE FABRIC V19.0
              </span>
              <span className="rounded-full bg-indigo-500/20 px-2.5 py-0.5 text-[10px] font-semibold text-indigo-300 border border-indigo-500/30">
                GOVERNED OPERATIONAL STATUS
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <Globe className="w-8 h-8 text-indigo-400 animate-spin-slow" />
              Planetary-Scale Intelligence, Simulation & Autonomous Coordination
            </h1>
            <p className="text-sm text-slate-300 max-w-3xl">
              Multi-scale ecosystem intelligence fabric connecting physical systems, industrial twins, cross-domain causal models,
              and 12-stage governed problem pipelines bounded by zero-trust action firewalls and verifiable provenance.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="btn-refresh-v19-data"
              onClick={refreshData}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Sync Fabric
            </button>
            <div className="text-right pl-3 border-l border-slate-800">
              <div className="text-[10px] uppercase font-mono text-slate-400">System Resilience</div>
              <div className="text-base font-bold text-emerald-400 font-mono">
                {healthMatrix.resilienceHealthPct}% NOMINAL
              </div>
            </div>
          </div>
        </div>

        {/* Global Emergency Stop Alert Bar */}
        {emergencyState.activeMasterHalt && (
          <div className="mt-4 rounded-xl border border-red-500/80 bg-red-950/90 p-3.5 flex items-center justify-between text-red-200 shadow-lg shadow-red-950/60 animate-pulse">
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
              <div>
                <span className="font-bold text-white text-xs uppercase tracking-wider">GLOBAL MASTER STOP ACTIVE:</span>
                <span className="text-xs ml-1.5">{emergencyState.reason}</span>
                <span className="text-[10px] block font-mono text-red-300">
                  Officer: {emergencyState.authorizedOfficer} | Seal: {emergencyState.cryptographicSealHash.slice(0, 18)}...
                </span>
              </div>
            </div>
            <button
              id="btn-clear-global-stop"
              onClick={handleToggleEmergencyStop}
              className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold uppercase tracking-wider transition-all"
            >
              Authorize Resume
            </button>
          </div>
        )}

        {/* Sub-Navigation Tabs */}
        <div className="mt-6 flex flex-wrap gap-2 border-t border-slate-800/80 pt-4">
          {[
            { id: 'world-model', label: '1. World Model & Twins', icon: Globe },
            { id: 'simulation-causal', label: '2. Simulation & Causal Lab', icon: Sliders },
            { id: 'situation-resilience', label: '3. Situations & Resilience', icon: Activity },
            { id: 'problems-agents', label: '4. Problems & Collectives', icon: Network },
            { id: 'science-decision', label: '5. Science & Decisions', icon: Sparkles },
            { id: 'commerce-firewall', label: '6. Commerce & Firewall', icon: ShieldCheck },
            { id: 'acceptance-gate', label: '7. Acceptance Gate Report', icon: Award }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-btn-v19-${tab.id}`}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50 border border-indigo-400/50'
                    : 'bg-slate-900/60 hover:bg-slate-850 text-slate-300 border border-slate-800 hover:text-white'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-indigo-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 1. UNIVERSAL WORLD MODEL & DIGITAL TWINS VIEW                        */}
      {/* ==================================================================== */}
      {activeSubTab === 'world-model' && (
        <div className="space-y-6">
          {/* Epistemic Truth Classification Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { label: 'OBSERVED', desc: 'Direct sensor & hardware telemetry', color: 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300' },
              { label: 'INFERRED', desc: 'Synthesized from correlated evidence', color: 'border-blue-500/40 bg-blue-950/20 text-blue-300' },
              { label: 'PREDICTED', desc: 'Calibrated econometric & physical models', color: 'border-purple-500/40 bg-purple-950/20 text-purple-300' },
              { label: 'SIMULATED', desc: 'Counterfactual Monte Carlo perturbance', color: 'border-amber-500/40 bg-amber-950/20 text-amber-300' },
              { label: 'HYPOTHETICAL', desc: 'Scientific hypothesis pending proof', color: 'border-pink-500/40 bg-pink-950/20 text-pink-300' }
            ].map(pill => (
              <div key={pill.label} className={`rounded-xl border p-3 ${pill.color} backdrop-blur-sm`}>
                <div className="text-xs font-bold font-mono tracking-wider">{pill.label}</div>
                <div className="text-[10px] opacity-80 mt-0.5">{pill.desc}</div>
              </div>
            ))}
          </div>

          {/* Planetary Digital Twins Grid */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Cpu className="w-5 h-5 text-indigo-400" />
                Planetary Digital Twins (Computational Ecosystem Representations)
              </h2>
              <span className="text-xs text-slate-400 font-mono">
                {digitalTwins.length} Active Multi-Scale Twins
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {digitalTwins.map(twin => (
                <div key={twin.twinId} className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {twin.twinType}
                      </span>
                      <h3 className="font-semibold text-sm text-white mt-1">{twin.name}</h3>
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      {twin.confidencePct}% Conf
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80 font-mono">
                    {Object.entries(twin.currentState).map(([k, v]) => (
                      <div key={k} className="flex justify-between">
                        <span className="text-slate-400 capitalize">{k.replace(/([A-Z])/g, ' $1')}:</span>
                        <span className="font-bold text-indigo-200">{String(v)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="text-slate-400 text-[11px] font-semibold">Key Constraints:</div>
                    <ul className="list-disc list-inside text-slate-300 text-[11px] space-y-0.5">
                      {twin.constraints.slice(0, 2).map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Snapshots: {twin.historicalSnapshotsCount.toLocaleString()}</span>
                    <span className="text-emerald-400 font-mono">{twin.epistemicStatus}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Universal World Model Explorer Table */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Database className="w-5 h-5 text-indigo-400" />
                  Universal World Model Entities
                </h2>
                <p className="text-xs text-slate-400">
                  Every observation carries provenance, freshness, uncertainty bounds, and explicit epistemic status.
                </p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2">
                <select
                  id="select-category-filter"
                  value={entityCategoryFilter}
                  onChange={e => setEntityCategoryFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
                >
                  <option value="ALL">All Categories</option>
                  <option value="INFRASTRUCTURE">Infrastructure</option>
                  <option value="MARKET">Market</option>
                  <option value="SCIENTIFIC">Scientific</option>
                  <option value="RISK">Risk</option>
                </select>

                <select
                  id="select-epistemic-filter"
                  value={entityEpistemicFilter}
                  onChange={e => setEntityEpistemicFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
                >
                  <option value="ALL">All Truth States</option>
                  <option value="OBSERVED">Observed</option>
                  <option value="PREDICTED">Predicted</option>
                  <option value="SIMULATED">Simulated</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase">
                    <th className="py-2.5 px-3">Entity / Category</th>
                    <th className="py-2.5 px-3">Temporal & Geo State</th>
                    <th className="py-2.5 px-3">Ownership</th>
                    <th className="py-2.5 px-3">Provenance / Freshness</th>
                    <th className="py-2.5 px-3">Uncertainty</th>
                    <th className="py-2.5 px-3">Epistemic Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredEntities.map(entity => (
                    <tr key={entity.entityId} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-semibold text-white">{entity.name}</div>
                        <div className="text-[10px] font-mono text-indigo-400">{entity.category} | {entity.version}</div>
                      </td>
                      <td className="py-3 px-3 text-slate-300">
                        <div>{entity.temporalState}</div>
                        <div className="text-[10px] text-slate-400">{entity.geographicState}</div>
                      </td>
                      <td className="py-3 px-3 text-slate-300">{entity.ownership}</td>
                      <td className="py-3 px-3 text-slate-300">
                        <div className="font-mono text-[11px]">{entity.provenance.source}</div>
                        <div className="text-[10px] text-slate-400">{entity.freshnessMinutes}m ago via {entity.provenance.method}</div>
                      </td>
                      <td className="py-3 px-3 text-slate-300 font-mono">
                        <div>Conf: {entity.confidencePct}%</div>
                        <div className="text-[10px] text-slate-400">[{entity.uncertaintyRange.min}% - {entity.uncertaintyRange.max}%]</div>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                            entity.epistemicStatus === 'OBSERVED'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : entity.epistemicStatus === 'PREDICTED'
                              ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                              : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          }`}
                        >
                          {entity.epistemicStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 2. SIMULATION SCENARIO LAB & CAUSAL INTELLIGENCE                      */}
      {/* ==================================================================== */}
      {activeSubTab === 'simulation-causal' && (
        <div className="space-y-6">
          {/* Interactive Scenario Simulation Laboratory */}
          <div className="rounded-2xl border border-indigo-500/30 bg-slate-900/60 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-indigo-400" />
                  Scenario & Monte Carlo Simulation Engine ("What happens if...")
                </h2>
                <p className="text-xs text-slate-400">
                  Simulate macroeconomic, infrastructure, and supply shocks across 10,000 Monte Carlo iterations.
                  Outcomes are explicitly marked <span className="font-mono text-amber-400 font-bold">SIMULATED</span>.
                </p>
              </div>
              <span className="text-xs font-mono bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded">
                SIMULATION SANDBOX
              </span>
            </div>

            {/* Simulation Parameter Controls */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">Scenario Title</label>
                <input
                  id="input-sim-title"
                  type="text"
                  value={simTitle}
                  onChange={e => setSimTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <label className="text-slate-300">Capacity Shock</label>
                  <span className="font-mono text-indigo-300">-{simCapacityShock}%</span>
                </div>
                <input
                  id="slider-sim-capacity"
                  type="range"
                  min="5"
                  max="60"
                  value={simCapacityShock}
                  onChange={e => setSimCapacityShock(Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <label className="text-slate-300">Transit Delay</label>
                  <span className="font-mono text-indigo-300">+{simDelayDays} Days</span>
                </div>
                <input
                  id="slider-sim-delay"
                  type="range"
                  min="2"
                  max="45"
                  value={simDelayDays}
                  onChange={e => setSimDelayDays(Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              <div className="flex items-end">
                <button
                  id="btn-run-simulation"
                  onClick={handleRunSimulation}
                  disabled={simRunning}
                  className="w-full py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Play className={`w-3.5 h-3.5 ${simRunning ? 'animate-spin' : ''}`} />
                  {simRunning ? 'Running 10k Iterations...' : 'Execute Governed Simulation'}
                </button>
              </div>
            </div>

            {/* Active Simulation Result Banner if user ran one */}
            {simulationResult && (
              <div className="rounded-xl border border-amber-500/40 bg-amber-950/20 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300 font-mono uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Interactive Simulation Output: {simulationResult.title}
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-400">
                    Resilience Score: {simulationResult.overallScore}%
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {simulationResult.simulatedOutcomes.map((out, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs">
                      <div className="text-slate-400 text-[11px] truncate">{out.metric}</div>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-base font-bold text-white font-mono">{out.simulatedVal}</span>
                        <span className={`text-xs font-mono font-semibold ${out.variancePct < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {out.variancePct > 0 ? `+${out.variancePct}%` : `${out.variancePct}%`}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Baseline: {out.baselineVal} | Band: [{out.uncertaintyBand[0]}, {out.uncertaintyBand[1]}]
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pre-Loaded Scenarios Comparison */}
            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-semibold text-white">Pre-Loaded Systemic Scenarios & Sensitivity Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {simScenarios.map(scen => (
                  <div key={scen.scenarioId} className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          {scen.scenarioType}
                        </span>
                        <h4 className="text-sm font-semibold text-white mt-1">{scen.title}</h4>
                      </div>
                      <span className="text-xs font-mono text-amber-400 font-bold">{scen.epistemicStatus}</span>
                    </div>

                    <div className="space-y-1 text-xs">
                      <div className="text-[11px] font-semibold text-slate-400">Perturbations:</div>
                      <ul className="list-disc list-inside text-slate-300 text-[11px] space-y-0.5">
                        {scen.perturbations.map((p, i) => (
                          <li key={i}>{p}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                      <div className="text-[11px] font-semibold text-slate-400">Primary Sensitivity Factors:</div>
                      {scen.sensitivityRankings.map((s, i) => (
                        <div key={i} className="flex justify-between text-xs text-slate-300">
                          <span className="truncate pr-2">{s.factor}</span>
                          <span className="font-mono font-bold text-indigo-300">{s.impactPct}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Causal Intelligence Graph & Counterfactuals */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 space-y-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Network className="w-5 h-5 text-indigo-400" />
                Causal Intelligence Layer (Cause → Dependency → Event → Impact → Response → Outcome)
              </h2>
              <p className="text-xs text-slate-400">
                Rigorous differentiation between mere correlation, empirical association, structural dependency, and verified causal mechanisms.
              </p>
            </div>

            <div className="space-y-3">
              {causalLinks.map(link => (
                <div key={link.relationshipId} className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${
                        link.relationshipType === 'VALIDATED_CAUSAL_RELATIONSHIP'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                      }`}
                    >
                      {link.relationshipType}
                    </span>
                    <div className="flex items-center gap-3 text-xs font-mono">
                      <span className="text-slate-400">Cascading Reach: <strong className="text-indigo-300">{link.cascadingImpactScorePct}%</strong></span>
                      <span className="text-slate-400">Confidence: <strong className="text-emerald-400">{link.confidencePct}%</strong></span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                      <div className="text-slate-400 text-[10px] uppercase font-mono">Cause Vector</div>
                      <div className="text-white font-medium mt-0.5">{link.causeDescription}</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                      <div className="text-slate-400 text-[10px] uppercase font-mono">Observed Effect & Impact</div>
                      <div className="text-white font-medium mt-0.5">{link.effectDescription}</div>
                    </div>
                  </div>

                  <div className="text-xs text-slate-300 bg-indigo-950/20 p-2.5 rounded-lg border border-indigo-500/20">
                    <span className="font-semibold text-indigo-300">Counterfactual Hypothesis: </span>
                    {link.counterfactualHypothesis}
                  </div>

                  <div className="text-[11px] text-slate-400 space-y-0.5">
                    <span className="font-semibold text-slate-300">Evidence Basis: </span>
                    {link.evidenceBasis.join(' • ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 3. SITUATIONS, RESILIENCE & EVENT FABRIC                             */}
      {/* ==================================================================== */}
      {activeSubTab === 'situation-resilience' && (
        <div className="space-y-6">
          {/* Global Situational Intelligence Summaries */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 space-y-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-400" />
                Global Situational Intelligence Digests
              </h2>
              <p className="text-xs text-slate-400">
                Every intelligence digest displays: SOURCE, TIME, CONFIDENCE, EVIDENCE, ASSUMPTIONS, UNCERTAINTY, MODEL/METHOD.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {situationalDigests.map(sit => (
                <div key={sit.situationId} className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {sit.domain}
                    </span>
                    <span
                      className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                        sit.severity === 'NOMINAL'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {sit.severity}
                    </span>
                  </div>

                  <p className="text-xs text-slate-200 leading-relaxed">{sit.summary}</p>

                  <div className="space-y-1 text-xs">
                    <div className="text-[11px] font-semibold text-slate-400">Empirical Evidence:</div>
                    <ul className="list-disc list-inside text-slate-300 text-[11px] space-y-0.5">
                      {sit.evidence.map((e, i) => (
                        <li key={i}>{e}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="text-[11px] font-semibold text-slate-400">Underlying Assumptions:</div>
                    <ul className="list-disc list-inside text-slate-400 text-[11px] space-y-0.5">
                      {sit.assumptions.map((a, i) => (
                        <li key={i}>{a}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 font-mono flex flex-wrap justify-between gap-1">
                    <span>Conf: {sit.confidencePct}% (Uncertainty: {sit.uncertaintyPct}%)</span>
                    <span>Method: {sit.modelOrMethod}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Defensive Global Resilience Engine */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 space-y-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                Defensive Global Resilience Engine (Recovery Planning & RTO/RPO)
              </h2>
              <p className="text-xs text-slate-400">
                Safety-oriented resilience modeling, asset vulnerability mapping, and multi-redundant restoration sequencing.
              </p>
            </div>

            <div className="space-y-4">
              {resilienceAssessments.map(res => (
                <div key={res.sector} className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">{res.sector}</h3>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      Resilience Score: {res.resilienceScorePct}%
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {res.vulnerabilityMapping.map(v => (
                      <div key={v.assetId} className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-white truncate">{v.name}</span>
                          <span
                            className={`text-[9px] font-mono px-1.5 py-0.2 rounded ${
                              v.criticality === 'CRITICAL'
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            }`}
                          >
                            {v.criticality}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1">{v.primaryThreat}</div>
                      </div>
                    ))}
                  </div>

                  {res.recoveryPlans.map((plan, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-indigo-950/20 border border-indigo-500/20 space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-indigo-200">Disruption: {plan.disruptionScenario}</span>
                        <span className="font-mono text-[11px] text-slate-300">
                          RTO: <strong>{plan.rtoHours}h</strong> | RPO: <strong>{plan.rpoHours}h</strong>
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="text-[11px] font-semibold text-slate-400">Restoration Sequence:</div>
                        <ol className="list-decimal list-inside text-slate-300 text-[11px] space-y-0.5">
                          {plan.restorationSequences.map((seq, sIdx) => (
                            <li key={sIdx}>{seq}</li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Planetary Event Fabric Telemetry Log */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Terminal className="w-5 h-5 text-indigo-400" />
              Planetary Event Fabric (Schema Validated & Idempotent)
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase">
                    <th className="py-2.5 px-3">Event ID / Type</th>
                    <th className="py-2.5 px-3">Source & Provenance</th>
                    <th className="py-2.5 px-3">Correlation / Idempotency</th>
                    <th className="py-2.5 px-3">Timestamp</th>
                    <th className="py-2.5 px-3">Confidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {planetaryEvents.map(evt => (
                    <tr key={evt.eventId} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-white">{evt.eventId}</div>
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded border ${
                            evt.eventType === 'REAL_TIME'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : evt.eventType === 'SECURITY'
                              ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                              : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          }`}
                        >
                          {evt.eventType}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-300">
                        <div>{evt.sourceIdentity}</div>
                        <div className="text-[10px] text-slate-400">{evt.provenance}</div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                        <div>{evt.correlationId}</div>
                        <div className="text-[10px] text-indigo-400">{evt.idempotencyKey}</div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-300 text-[11px]">{evt.timestamp}</td>
                      <td className="py-2.5 px-3 text-emerald-400 font-bold">{evt.confidencePct}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 4. GOVERNED PROBLEMS, AGENTS & PHYSICAL GATEWAY                      */}
      {/* ==================================================================== */}
      {activeSubTab === 'problems-agents' && (
        <div className="space-y-6">
          {/* Governed Problem-Solving Engine (12-Stage Pipeline) */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 space-y-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <GitPullRequest className="w-5 h-5 text-indigo-400" />
                Governed Problem-Solving Engine (12-Stage Lifecycle)
              </h2>
              <p className="text-xs text-slate-400">
                Pipeline: UNDERSTAND → DECOMPOSE → IDENTIFY_CAPABILITIES → FORM_TEAM → GATHER_EVIDENCE → SIMULATE → EVALUATE → PLAN → AUTHORIZE → EXECUTE → VERIFY → LEARN.
              </p>
            </div>

            <div className="space-y-4">
              {problemCases.map(prob => (
                <div key={prob.problemId} className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {prob.scale} SCALE | {prob.urgency} URGENCY
                      </span>
                      <h3 className="font-semibold text-sm text-white mt-1">{prob.title}</h3>
                    </div>
                    <div className="text-right font-mono text-xs">
                      <div className="text-slate-400">Potential Value</div>
                      <div className="text-emerald-400 font-bold">
                        ${(prob.potentialValueMinor / 100).toLocaleString()} USD
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300">{prob.description}</p>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/90 border border-slate-800">
                    <div className="text-xs">
                      <span className="text-slate-400">Current Pipeline Stage: </span>
                      <span className="font-mono font-bold text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded ml-1 border border-indigo-500/30">
                        {prob.pipelineStage}
                      </span>
                    </div>

                    <button
                      id={`btn-advance-problem-${prob.problemId}`}
                      onClick={() => handleAdvanceProblemStage(prob.problemId, prob.pipelineStage)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center gap-1 transition-all cursor-pointer"
                    >
                      Advance Pipeline Stage
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-400">
                    <div>
                      <span className="font-semibold text-slate-300">Evidence: </span>
                      {prob.evidence.join(' • ')}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-300">Assigned Team: </span>
                      {prob.assignedTeam.join(', ')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Advanced Agent Collectives & Isolation */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 space-y-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Network className="w-5 h-5 text-indigo-400" />
                Advanced Agent Collectives (Bounded Autonomy L0–L5)
              </h2>
              <p className="text-xs text-slate-400">
                Agent formations with individual daily minor-unit execution budgets, strict tool allowlists, and independent safety guardians.
              </p>
            </div>

            <div className="space-y-4">
              {agentCollectives.map(col => (
                <div key={col.collectiveId} className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm text-white">{col.name}</h3>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      Consensus Score: {col.collaborationConsensusScore}%
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {col.memberAgents.map(ag => (
                      <div key={ag.agentId} className="p-3 rounded-lg bg-slate-900/70 border border-slate-800 text-xs space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-white">{ag.name}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                            {ag.autonomyLevel}
                          </span>
                        </div>
                        <p className="text-slate-300 text-[11px]">{ag.role}</p>
                        <div className="font-mono text-[10px] text-slate-400 space-y-0.5">
                          <div>Daily Budget: ${(ag.executionBudgetMinor / 100).toLocaleString()}</div>
                          <div>Sandbox: {ag.sandboxStrictness}</div>
                          <div>Trust: {ag.trustScore}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Physical Systems Safety Gateway */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 space-y-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-amber-400" />
                Physical Systems Interface (Conservative Cyber-Physical Safety Gateway)
              </h2>
              <p className="text-xs text-slate-400">
                Enforcing 9-stage verification for industrial robotics, substation breakers, and manufacturing assets.
                High-impact actions require dual-custody human signoff.
              </p>
            </div>

            <div className="space-y-3">
              {physicalRequests.map(req => (
                <div key={req.requestId} className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {req.deviceType} | {req.targetDeviceId}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ml-2 ${
                          req.riskClassification === 'LOW'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {req.riskClassification}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-indigo-300">
                        Stage: <strong>{req.pipelineState}</strong>
                      </span>
                      {!req.humanApprovalGranted && (
                        <button
                          id={`btn-approve-phys-${req.requestId}`}
                          onClick={() => handleApprovePhysicalRequest(req.requestId, true)}
                          className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
                        >
                          Sign & Authorize
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="text-xs font-mono text-slate-200 bg-slate-900/70 p-2 rounded border border-slate-800">
                    Command: {req.requestedCommand}
                  </div>

                  {req.executionTelemetrySummary && (
                    <div className="text-xs text-slate-300">
                      <span className="font-semibold text-slate-400">Telemetry: </span>
                      {req.executionTelemetrySummary}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 5. SCIENCE, CLAIM GRAPH & DECISION INTELLIGENCE                      */}
      {/* ==================================================================== */}
      {activeSubTab === 'science-decision' && (
        <div className="space-y-6">
          {/* Scientific Intelligence Platform */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 space-y-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                Scientific Intelligence Platform (Discovery, Reproducibility & Contradiction Audits)
              </h2>
              <p className="text-xs text-slate-400">
                Distinguishes HYPOTHESIS, SIMULATION, EXPERIMENT, OBSERVATION, and VALIDATED RESULT without premature claims.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {scientificArtifacts.map(art => (
                <div key={art.artifactId} className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {art.researchDomain}
                    </span>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {art.statusTag}
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-white">{art.title}</h3>
                  <p className="text-xs text-slate-300 italic">"{art.hypothesisStatement}"</p>

                  <div className="space-y-1 text-xs">
                    <div className="text-[11px] font-semibold text-slate-400">Literature Citations:</div>
                    <ul className="list-disc list-inside text-slate-400 text-[11px] space-y-0.5">
                      {art.literatureReferences.map((ref, i) => (
                        <li key={i}>{ref}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 font-mono flex justify-between">
                    <span>Registry: {art.experimentRegistryId}</span>
                    <span className="text-emerald-400 font-bold">Reproducibility: {art.reproducibilityScorePct}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Planetary Claim Graph & Evidence Traceability */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 space-y-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                Planetary Claim Graph (Immutable Provenance & Evidence Verification)
              </h2>
              <p className="text-xs text-slate-400">
                Every important claim is anchored to verifiable empirical evidence links with automated decay tracking.
              </p>
            </div>

            <div className="space-y-3">
              {claimNodes.map(cl => (
                <div key={cl.claimId} className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-white">{cl.claimStatement}</span>
                    <span className="text-xs font-mono font-bold text-emerald-400">{cl.confidencePct}% Conf</span>
                  </div>

                  <div className="text-xs text-slate-400 font-mono">
                    Evidence Links: {cl.evidenceLinks.join(' | ')}
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>Source Reputation: {cl.sourceReputationScore}%</span>
                    <span>Decay Rate: {cl.knowledgeDecayPct}% / yr</span>
                    <span>Last Verified: {cl.lastVerifiedDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Prediction Calibration Engine & Error Memory */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 space-y-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-400" />
                Prediction Engine Calibration & Error Memory
              </h2>
              <p className="text-xs text-slate-400">
                CATALYX continuously tracks predictions against actual outcomes to eliminate systemic forecast bias.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {predictions.map(pred => (
                <div key={pred.predictionId} className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white">{pred.predictedMetric}</h3>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      Error: {pred.calibrationErrorPct}%
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-slate-900/70 p-2.5 rounded-lg border border-slate-800">
                    <div>Predicted Mean: {pred.predictedDistribution.mean}</div>
                    <div>Actual Observed: {pred.actualObservedValue}</div>
                    <div>Confidence Interval: {pred.predictedDistribution.confidenceIntervalPct}%</div>
                    <div>Model Drift: {pred.modelDriftDetected ? 'DETECTED' : 'NOMINAL'}</div>
                  </div>

                  <p className="text-xs text-slate-300 italic">
                    <span className="font-semibold text-indigo-300">Retrospect Lessons: </span>
                    {pred.retrospectLessons}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Decision Intelligence 4.0 */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 space-y-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Compass className="w-5 h-5 text-indigo-400" />
                Decision Intelligence 4.0 (Evidence, Options & Auditable Rationale)
              </h2>
              <p className="text-xs text-slate-400">
                Structured decision records containing options considered, cost-benefit ratios, and empirical outcome verification.
              </p>
            </div>

            {decisionCases.map(d => (
              <div key={d.caseId} className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-sm text-white">{d.decisionTitle}</h3>
                  <span className="text-xs text-slate-400 font-mono">{d.timestamp}</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="text-[11px] font-semibold text-slate-400">Simulated Options:</div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {d.optionsConsidered.map((opt, i) => (
                      <div key={i} className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800 space-y-1">
                        <div className="font-semibold text-slate-200">{opt.optionName}</div>
                        <div className="text-[11px] text-slate-400">{opt.simulatedOutcome}</div>
                        <div className="text-[10px] font-mono text-indigo-300">Benefit/Cost: {opt.costBenefitRatio}x</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-indigo-950/20 border border-indigo-500/20 text-xs space-y-1">
                  <div className="font-semibold text-indigo-300">Chosen Option & Rationale:</div>
                  <div className="text-white">{d.chosenOption}</div>
                  <div className="text-slate-400 text-[11px]">{d.decisionRationale}</div>
                  {d.outcomeResult && (
                    <div className="text-emerald-400 text-[11px] font-mono mt-1">
                      Verified Outcome: {d.outcomeResult}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 6. COMMERCE, DEVELOPER CLOUD & SECURITY FIREWALL                    */}
      {/* ==================================================================== */}
      {activeSubTab === 'commerce-firewall' && (
        <div className="space-y-6">
          {/* AI Action Firewall (8-Stage Inspection Gateway) */}
          <div className="rounded-2xl border border-indigo-500/30 bg-slate-900/60 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-indigo-400" />
                  AI Action Firewall (8-Stage Deep Inspection Gateway)
                </h2>
                <p className="text-xs text-slate-400">
                  All high-impact agent actuations pass through: Classified → Caller Identity Signed → Policy Allowlist Checked → Blast Radius Estimated → Non-Escalation Verified → Dual Custody Approved → Execution Sandboxed → Immutable Log Stored.
                </p>
              </div>
              <span className="text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded">
                100% COVERAGE ACTIVE
              </span>
            </div>

            {/* Interactive Firewall Action Tester */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <h3 className="text-xs font-semibold text-slate-300 uppercase font-mono tracking-wider">
                Firewall Action Submission Sandbox
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400">Caller Agent ID</label>
                  <input
                    id="input-fw-agent"
                    type="text"
                    value={fwAgentId}
                    onChange={e => setFwAgentId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400">Target Subsystem</label>
                  <input
                    id="input-fw-target"
                    type="text"
                    value={fwTargetSystem}
                    onChange={e => setFwTargetSystem(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400">Risk Severity</label>
                  <select
                    id="select-fw-risk"
                    value={fwRiskSeverity}
                    onChange={e => setFwRiskSeverity(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400">Action Directive Description</label>
                <input
                  id="input-fw-desc"
                  type="text"
                  value={fwActionDesc}
                  onChange={e => setFwActionDesc(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white"
                />
              </div>

              <button
                id="btn-submit-firewall-action"
                onClick={handleSubmitFirewallTest}
                className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                Inspect & Process via 8-Stage Firewall
              </button>

              {firewallTestResult && (
                <div
                  className={`p-3 rounded-lg border text-xs ${
                    firewallTestResult.approvalVerdict === 'PERMITTED'
                      ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                      : 'bg-amber-950/20 border-amber-500/40 text-amber-300'
                  }`}
                >
                  <div className="font-bold flex items-center gap-1.5">
                    {firewallTestResult.approvalVerdict === 'PERMITTED' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                    )}
                    Verdict: {firewallTestResult.approvalVerdict}
                  </div>
                  <div className="mt-1">{firewallTestResult.reason}</div>
                </div>
              )}
            </div>

            {/* Audit Log of Firewall Records */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-slate-400 uppercase font-mono">Recent Firewall Audit Records</h3>
              {firewallRecords.map(rec => (
                <div key={rec.actionId} className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-slate-300">{rec.callerAgentId} → {rec.targetSystem}</span>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                        rec.approvalVerdict === 'PERMITTED'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : rec.approvalVerdict === 'BLOCKED'
                          ? 'bg-red-500/20 text-red-400 border-red-500/40'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      }`}
                    >
                      {rec.approvalVerdict}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px]">{rec.reason}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Immutable Financial Ledger (Minor Units Exact) */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-indigo-400" />
                  Immutable Financial Ledger (Exact Integer Minor Units)
                </h2>
                <p className="text-xs text-slate-400">
                  Tamper-evident hash-chained entries with Pesapal provider abstraction. Zero floating-point rounding errors.
                </p>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
                HASH-CHAINED IMMUTABLE
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase">
                    <th className="py-2.5 px-3">Transaction / ID</th>
                    <th className="py-2.5 px-3">Gross / Net (Minor Units)</th>
                    <th className="py-2.5 px-3">Provider & Type</th>
                    <th className="py-2.5 px-3">Customer / Tenant</th>
                    <th className="py-2.5 px-3">Cryptographic Hash</th>
                    <th className="py-2.5 px-3">Reconciled</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {immutableLedger.map(entry => (
                    <tr key={entry.entryId} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-white">{entry.transactionId}</div>
                        <div className="text-[10px] text-slate-400">{entry.timestamp}</div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-200">
                        <div>Gross: ${(entry.integerMinorUnits / 100).toFixed(2)} {entry.currency}</div>
                        <div className="text-[10px] text-emerald-400">Net: ${(entry.netAmountMinorUnits / 100).toFixed(2)}</div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-300">
                        <div>{entry.provider}</div>
                        <div className="text-[10px] text-indigo-400">{entry.revenueType}</div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                        <div>{entry.customerId}</div>
                        <div className="text-[10px] text-slate-500">{entry.tenantId}</div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 text-[10px] truncate max-w-[140px]">
                        {entry.immutableHash}
                      </td>
                      <td className="py-2.5 px-3 text-emerald-400 font-bold">
                        {entry.reconciliationVerified ? 'VERIFIED' : 'PENDING'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Master Emergency Stop Control Panel */}
          <div className="rounded-2xl border border-red-500/40 bg-red-950/20 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-red-400" />
                  Master Emergency Global Stop Control Plane
                </h3>
                <p className="text-xs text-slate-400">
                  Instantly halts all autonomous agent routines, workflow triggers, and external actuations while preserving read-only telemetry.
                </p>
              </div>
              <button
                id="btn-toggle-master-stop"
                onClick={handleToggleEmergencyStop}
                className={`px-4 py-2 rounded-xl font-semibold text-xs transition-all cursor-pointer ${
                  emergencyState.activeMasterHalt
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    : 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-950/50'
                }`}
              >
                {emergencyState.activeMasterHalt ? 'Deactivate Master Stop' : 'ENGAGE MASTER STOP'}
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-300 pt-2 border-t border-red-900/40">
              <div>State: <strong className={emergencyState.activeMasterHalt ? 'text-red-400' : 'text-emerald-400'}>{emergencyState.activeMasterHalt ? 'HALTED' : 'ARMED / NOMINAL'}</strong></div>
              <div>Authorized Officer: {emergencyState.authorizedOfficer}</div>
              <div>Recovery Runbook: {emergencyState.safeRecoveryRunbookReady ? 'VERIFIED READY' : 'NOT READY'}</div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 7. V19 ACCEPTANCE GATE AUDIT & CERTIFICATION REPORT                  */}
      {/* ==================================================================== */}
      {activeSubTab === 'acceptance-gate' && (
        <div className="space-y-6">
          {/* Certification Verdict Card */}
          <div className="rounded-2xl border border-emerald-500/50 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-indigo-950/40 p-6 space-y-4 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold">
                  CATALYX PLATFORM AUDIT & CERTIFICATION
                </span>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Award className="w-6 h-6 text-emerald-400" />
                  {acceptanceReport.certificationVerdict}
                </h2>
                <p className="text-xs text-slate-300">
                  Certified at: {acceptanceReport.generatedAt} | Version: {acceptanceReport.platformVersion}
                </p>
              </div>

              <div className="flex items-center gap-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-1.5 rounded-xl font-mono text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                22 OF 22 GATES PASSED
              </div>
            </div>

            {/* 10-Dimensional Platform Health Matrix */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <h3 className="text-xs font-semibold text-slate-400 uppercase font-mono">
                10-Dimensional Platform Health Matrix
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {[
                  { label: 'System Health', score: healthMatrix.systemHealthPct },
                  { label: 'Intelligence Health', score: healthMatrix.intelligenceHealthPct },
                  { label: 'Agent Health', score: healthMatrix.agentHealthPct },
                  { label: 'Mission Health', score: healthMatrix.missionHealthPct },
                  { label: 'Data Health', score: healthMatrix.dataHealthPct },
                  { label: 'Security Health', score: healthMatrix.securityHealthPct },
                  { label: 'Financial Health', score: healthMatrix.financialHealthPct },
                  { label: 'Integration Health', score: healthMatrix.integrationHealthPct },
                  { label: 'Marketplace Health', score: healthMatrix.marketplaceHealthPct },
                  { label: 'Resilience Health', score: healthMatrix.resilienceHealthPct }
                ].map(metric => (
                  <div key={metric.label} className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 text-xs">
                    <div className="text-slate-400 text-[11px] truncate">{metric.label}</div>
                    <div className="text-sm font-bold text-emerald-400 font-mono mt-0.5">{metric.score}%</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Verifiable Checklist Items */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              Complete 22-Point Verifiable Acceptance Audit Checklist
            </h3>

            <div className="space-y-3">
              {acceptanceReport.auditChecklist.map(check => (
                <div key={check.checkId} className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-indigo-400 font-bold">{check.checkId}</span>
                      <span className="font-semibold text-white">{check.subsystem}</span>
                    </div>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {check.status}
                    </span>
                  </div>
                  <p className="text-slate-300">{check.requirement}</p>
                  <p className="text-slate-400 text-[11px] bg-slate-900/80 p-2 rounded border border-slate-800/80 font-mono">
                    <span className="text-indigo-300 font-bold">Evidence: </span>
                    {check.evidenceDetails}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
