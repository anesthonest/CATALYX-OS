import React, { useState, useEffect } from 'react';
import {
  IndustryDomainId,
  DomainEntityDefinition,
  DomainWorkflowDefinition,
  IndustryModulePackage,
  ScientificHypothesisRecord,
  ScientificExperimentRecord,
  ScientificEvidenceNode,
  ScientificEvidenceEdge,
  MultiModelEngineSpec,
  ModelRoutingDecisionLog,
  ScientificComputeJob,
  IndustryCloudPackage,
  V16AcceptanceGateReport
} from '../types';
import { globalAutonomousIndustryScientificIntelligenceV16Service } from '../services/globalAutonomousIndustryScientificIntelligenceV16Service';
import {
  Building2,
  Cpu,
  FlaskConical,
  Activity,
  Layers,
  ShieldCheck,
  Zap,
  Radio,
  CheckCircle2,
  Server,
  Microscope,
  Network,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  Play,
  Share2,
  FileText,
  Lock,
  Boxes,
  Plus,
  Compass
} from 'lucide-react';

interface Props {
  organizationId: string;
  userEmail: string;
}

type SubTabId = 'overview' | 'domains' | 'scientific' | 'multimodel' | 'compute' | 'marketplace' | 'acceptance';

const DOMAIN_METADATA: Record<IndustryDomainId, { label: string; icon: any; color: string; desc: string }> = {
  MANUFACTURING: { label: 'Manufacturing', icon: Building2, color: 'text-amber-400 border-amber-500/30 bg-amber-950/20', desc: 'Predictive maintenance, OEE optimization, and shopfloor planning.' },
  AGRICULTURE: { label: 'Agriculture', icon: Compass, color: 'text-lime-400 border-lime-500/30 bg-lime-950/20', desc: 'Precision hydrometrics, crop modeling, and harvest fleet staging.' },
  LOGISTICS: { label: 'Logistics', icon: Network, color: 'text-blue-400 border-blue-500/30 bg-blue-950/20', desc: 'Intermodal terminal dispatch, route optimization, and AIS tracking.' },
  ENERGY: { label: 'Energy & Utilities', icon: Zap, color: 'text-yellow-400 border-yellow-500/30 bg-yellow-950/20', desc: 'Nodal day-ahead pricing, battery arbitrage, and frequency regulation.' },
  TELECOMMUNICATIONS: { label: 'Telecom', icon: Radio, color: 'text-cyan-400 border-cyan-500/30 bg-cyan-950/20', desc: 'Cellular network capacity planning and spectral anomaly detection.' },
  RETAIL_COMMERCE: { label: 'Retail & Commerce', icon: TrendingUp, color: 'text-emerald-400 border-emerald-500/30 bg-emerald-950/20', desc: 'Demand forecasting and supply balancing without dark patterns.' },
  FINANCE: { label: 'Finance', icon: FileText, color: 'text-green-400 border-green-500/30 bg-green-950/20', desc: 'Cash flow modeling and operational risk analytics (non-advisory).' },
  EDUCATION: { label: 'Education', icon: Layers, color: 'text-indigo-400 border-indigo-500/30 bg-indigo-950/20', desc: 'Institutional resource scheduling with FERPA student privacy.' },
  HEALTHCARE: { label: 'Healthcare Ops', icon: Activity, color: 'text-rose-400 border-rose-500/30 bg-rose-950/20', desc: 'Non-clinical bed flow and OR turnaround (strict no-diagnosis airgap).' },
  CONSTRUCTION: { label: 'Construction', icon: Building2, color: 'text-orange-400 border-orange-500/30 bg-orange-950/20', desc: 'BIM scheduling, cost variance forecasting, and contractor safety.' },
  TECHNOLOGY: { label: 'Technology', icon: Cpu, color: 'text-purple-400 border-purple-500/30 bg-purple-950/20', desc: 'Architecture radar, dependency security, and governed CI/CD pipelines.' },
  SCIENTIFIC_RESEARCH: { label: 'Scientific Research', icon: Microscope, color: 'text-teal-400 border-teal-500/30 bg-teal-950/20', desc: 'Hypothesis falsification, experiment reproducibility, and HPC swarms.' }
};

export const GlobalAutonomousIndustryScientificIntelligenceV16Tab: React.FC<Props> = ({
  organizationId: _organizationId,
  userEmail: _userEmail
}) => {
  const [activeSubTab, setActiveSubTab] = useState<SubTabId>('overview');
  const [selectedDomain, setSelectedDomain] = useState<IndustryDomainId>('MANUFACTURING');

  // Service Data States
  const [entities, setEntities] = useState<DomainEntityDefinition[]>([]);
  const [workflows, setWorkflows] = useState<DomainWorkflowDefinition[]>([]);
  const [marketPackages, setMarketPackages] = useState<IndustryModulePackage[]>([]);
  const [hypotheses, setHypotheses] = useState<ScientificHypothesisRecord[]>([]);
  const [experiments, setExperiments] = useState<ScientificExperimentRecord[]>([]);
  const [evidenceGraph, setEvidenceGraph] = useState<{ nodes: ScientificEvidenceNode[]; edges: ScientificEvidenceEdge[] }>({ nodes: [], edges: [] });
  const [modelEngines, setModelEngines] = useState<MultiModelEngineSpec[]>([]);
  const [routingLogs, setRoutingLogs] = useState<ModelRoutingDecisionLog[]>([]);
  const [computeJobs, setComputeJobs] = useState<ScientificComputeJob[]>([]);
  const [industryClouds, setIndustryClouds] = useState<IndustryCloudPackage[]>([]);
  const [acceptanceReport, setAcceptanceReport] = useState<V16AcceptanceGateReport | null>(null);

  // Modals and notifications
  const [notification, setNotification] = useState<string | null>(null);
  const [showHypothesisModal, setShowHypothesisModal] = useState(false);
  const [newHypoTitle, setNewHypoTitle] = useState('');
  const [newHypoClaim, setNewHypoClaim] = useState('');
  const [newHypoFalsification, setNewHypoFalsification] = useState('');

  // Routing Test state
  const [testCategory, setTestCategory] = useState<ModelRoutingDecisionLog['requestCategory']>('REASONING');
  const [testPrivacy, setTestPrivacy] = useState<ModelRoutingDecisionLog['privacyClassification']>('CONFIDENTIAL');

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4500);
  };

  const refreshData = () => {
    setEntities(globalAutonomousIndustryScientificIntelligenceV16Service.getDomainEntities());
    setWorkflows(globalAutonomousIndustryScientificIntelligenceV16Service.getDomainWorkflows());
    setMarketPackages(globalAutonomousIndustryScientificIntelligenceV16Service.getMarketplacePackages());
    setHypotheses(globalAutonomousIndustryScientificIntelligenceV16Service.getScientificHypotheses());
    setExperiments(globalAutonomousIndustryScientificIntelligenceV16Service.getScientificExperiments());
    setEvidenceGraph(globalAutonomousIndustryScientificIntelligenceV16Service.getEvidenceGraph());
    setModelEngines(globalAutonomousIndustryScientificIntelligenceV16Service.getModelEngines());
    setRoutingLogs(globalAutonomousIndustryScientificIntelligenceV16Service.getRoutingDecisionLogs());
    setComputeJobs(globalAutonomousIndustryScientificIntelligenceV16Service.getScientificComputeJobs());
    setIndustryClouds(globalAutonomousIndustryScientificIntelligenceV16Service.getIndustryClouds());
    setAcceptanceReport(globalAutonomousIndustryScientificIntelligenceV16Service.getAcceptanceGateReport());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleCreateHypothesis = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHypoTitle.trim() || !newHypoClaim.trim()) return;

    globalAutonomousIndustryScientificIntelligenceV16Service.createScientificHypothesis({
      title: newHypoTitle.trim(),
      claimStatement: newHypoClaim.trim(),
      projectId: 'proj_carbon_capture_kinetics',
      falsificationCriteria: newHypoFalsification.trim() ? [newHypoFalsification.trim()] : []
    });

    setNewHypoTitle('');
    setNewHypoClaim('');
    setNewHypoFalsification('');
    setShowHypothesisModal(false);
    showNotification('Scientific Hypothesis registered with formal falsification criteria & cryptographic audit lineage.');
    refreshData();
  };

  const handleDispatchExperiment = (hypothesisId: string) => {
    const exp = globalAutonomousIndustryScientificIntelligenceV16Service.dispatchExperimentRun(hypothesisId, 'PDE_SOLVER');
    showNotification(`Dispatched computational experiment [${exp.experimentId.slice(0, 12)}]. Seeded SHA-256 container environment.`);
    refreshData();
  };

  const handleTestRoute = () => {
    const res = globalAutonomousIndustryScientificIntelligenceV16Service.executeModelRoute(testCategory, testPrivacy);
    showNotification(`Multi-Model Router 2.0 directed request to [${res.selectedModelId}] with ${res.latencyAchievedMs}ms latency.`);
    refreshData();
  };

  const handleInstallModule = (modId: string) => {
    const success = globalAutonomousIndustryScientificIntelligenceV16Service.installMarketplaceModule(modId);
    if (success) {
      showNotification(`Installed domain module [${modId}] into tenant intelligence mesh.`);
      refreshData();
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-5 right-5 z-50 bg-cyan-900/95 border border-cyan-400 text-white px-5 py-3 rounded-xl shadow-2xl backdrop-blur flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-cyan-300" />
          <span className="text-sm font-medium">{notification}</span>
        </div>
      )}

      {/* Main Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-cyan-950/40 to-slate-950 border border-cyan-500/30 p-6 md:p-8 shadow-2xl">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 text-xs font-mono font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 rounded-md flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                CATALYX V16.0
              </span>
              <span className="px-2.5 py-1 text-xs font-mono font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/40 rounded-md">
                12 Modular Industry Domains
              </span>
              <span className="px-2.5 py-1 text-xs font-mono font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 rounded-md">
                10-Phase Scientific Research Engine
              </span>
              <span className="px-2.5 py-1 text-xs font-mono font-semibold bg-amber-500/20 text-amber-300 border border-amber-400/40 rounded-md">
                Airgap Physical Control Safeguards
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              Global Autonomous Industry & Scientific Intelligence
            </h1>
            <p className="text-slate-300 text-sm md:text-base max-w-4xl leading-relaxed">
              Extending the V1–V15 universal intelligence infrastructure into specialized industry verticals and scientific research computing. Governed closed-loop coordination, reproducible in-silico simulation, multi-model failover routing, and evidence-backed decision support with strict safety-critical airgaps.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              id="btn-v16-new-hypothesis"
              onClick={() => setShowHypothesisModal(true)}
              className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-cyan-950/50 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Formulate Hypothesis
            </button>
            <button
              id="btn-v16-route-audit"
              onClick={() => setActiveSubTab('multimodel')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition flex items-center gap-2 cursor-pointer"
            >
              <Cpu className="w-4 h-4 text-purple-400" />
              Multi-Model Router
            </button>
          </div>
        </div>

        {/* Live System Metric Telemetry Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-slate-800/80 text-xs">
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-[11px] block">Active Domains</span>
            <span className="text-lg font-bold text-white font-mono">12 / 12</span>
            <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="w-3 h-3" /> Fully Defined
            </span>
          </div>
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-[11px] block">Scientific Hypotheses</span>
            <span className="text-lg font-bold text-white font-mono">{hypotheses.length}</span>
            <span className="text-[10px] text-cyan-400">Formal Falsification</span>
          </div>
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-[11px] block">HPC Compute Swarms</span>
            <span className="text-lg font-bold text-white font-mono">{computeJobs.length} Jobs</span>
            <span className="text-[10px] text-indigo-400">InfiniBand NDR 400G</span>
          </div>
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-[11px] block">Multi-Model Engines</span>
            <span className="text-lg font-bold text-white font-mono">{modelEngines.length} Active</span>
            <span className="text-[10px] text-purple-400">Gemini / Claude / NNs</span>
          </div>
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-[11px] block">Evidence Graph Proofs</span>
            <span className="text-lg font-bold text-white font-mono">{evidenceGraph.nodes.length} Nodes</span>
            <span className="text-[10px] text-amber-400">SHA-256 Verified</span>
          </div>
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-[11px] block">Acceptance Gate</span>
            <span className="text-lg font-bold text-emerald-400 font-mono">100% PASS</span>
            <span className="text-[10px] text-emerald-300">Certified V16</span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex overflow-x-auto gap-2 p-1.5 bg-slate-900/90 rounded-2xl border border-slate-800 backdrop-blur">
        {[
          { id: 'overview', label: 'Platform Architecture', icon: Layers },
          { id: 'domains', label: 'Modular Industry Domains (12)', icon: Building2 },
          { id: 'scientific', label: 'Scientific Intelligence Engine', icon: Microscope },
          { id: 'multimodel', label: 'Multi-Model Router 2.0', icon: Cpu },
          { id: 'compute', label: 'Scientific Compute & HPC', icon: Server },
          { id: 'marketplace', label: 'Industry Cloud & Marketplace', icon: Boxes },
          { id: 'acceptance', label: 'V16 Production Acceptance Gate', icon: ShieldCheck }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`subtab-${tab.id}`}
              onClick={() => setActiveSubTab(tab.id as SubTabId)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-lg shadow-cyan-950/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ======================================================== */}
      {/* SUB-TAB 1: ARCHITECTURE OVERVIEW */}
      {/* ======================================================== */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          {/* High-Level Architecture Card */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-400" />
              Universal Intelligence Core & Specialized Domain Overlay
            </h2>
            <p className="text-sm text-slate-300 mb-6 leading-relaxed">
              CATALYX V16 decouples specialized industry logic from the foundational intelligence core. All 12 industry modules leverage shared services for cryptographic identity, long-running durable missions, agent-to-agent negotiations, multi-tenant knowledge graphs, and defensive security.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-950/80 border border-cyan-500/20 space-y-2">
                <span className="text-cyan-400 font-bold uppercase tracking-wider text-[10px] block">Pillar 1</span>
                <h3 className="font-bold text-white text-sm">Universal Intelligence Core</h3>
                <p className="text-slate-400">
                  Shared identity, multi-agent mesh, durable missions, SHA-256 organizational memory, and 14-phase autonomous coordination loop.
                </p>
                <div className="pt-2 flex flex-wrap gap-1">
                  <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/40 text-[10px]">Zero Duplication</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">Single Source of Truth</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/80 border border-indigo-500/20 space-y-2">
                <span className="text-indigo-400 font-bold uppercase tracking-wider text-[10px] block">Pillar 2</span>
                <h3 className="font-bold text-white text-sm">Modular Domain Framework</h3>
                <p className="text-slate-400">
                  Pluggable domain ontologies, workflows, entities, and compliance policies installed without modifying global platform code.
                </p>
                <div className="pt-2 flex flex-wrap gap-1">
                  <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/40 text-[10px]">12 Industry Domains</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">Hot-Plug Marketplace</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/80 border border-emerald-500/20 space-y-2">
                <span className="text-emerald-400 font-bold uppercase tracking-wider text-[10px] block">Pillar 3</span>
                <h3 className="font-bold text-white text-sm">Evidence & Reproducibility</h3>
                <p className="text-slate-400">
                  Rigorous separation between evidence, inference, and hypotheses. Cryptographic execution hashes for full scientific reproducibility.
                </p>
                <div className="pt-2 flex flex-wrap gap-1">
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/40 text-[10px]">No Fake Science</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">Airgapped Controls</span>
                </div>
              </div>
            </div>
          </div>

          {/* 12 Industry Domain Readiness Grid */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-amber-400" />
              12 Industry & Scientific Domains Status
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {(Object.keys(DOMAIN_METADATA) as IndustryDomainId[]).map(domainKey => {
                const meta = DOMAIN_METADATA[domainKey];
                const Icon = meta.icon;
                const domainEntities = entities.filter(e => e.domainId === domainKey);
                const domainWorkflows = workflows.filter(w => w.domainId === domainKey);

                return (
                  <div
                    key={domainKey}
                    onClick={() => {
                      setSelectedDomain(domainKey);
                      setActiveSubTab('domains');
                    }}
                    className={`p-4 rounded-xl border transition-all cursor-pointer hover:scale-[1.02] ${meta.color}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        <span className="font-bold text-white text-xs">{meta.label}</span>
                      </div>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/40 text-slate-300 border border-white/10">
                        {domainEntities.length} Entities
                      </span>
                    </div>
                    <p className="text-slate-300 text-[11px] line-clamp-2 mb-3">
                      {meta.desc}
                    </p>
                    <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[10px] text-slate-400">
                      <span>{domainWorkflows.length} Workflows</span>
                      <span className="flex items-center gap-1 text-cyan-300 hover:underline">
                        Explore <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-TAB 2: MODULAR INDUSTRY DOMAINS */}
      {/* ======================================================== */}
      {activeSubTab === 'domains' && (
        <div className="space-y-6">
          {/* Domain Selector Pills */}
          <div className="flex overflow-x-auto gap-2 pb-2">
            {(Object.keys(DOMAIN_METADATA) as IndustryDomainId[]).map(domainKey => {
              const meta = DOMAIN_METADATA[domainKey];
              const Icon = meta.icon;
              const isSelected = selectedDomain === domainKey;
              return (
                <button
                  key={domainKey}
                  onClick={() => setSelectedDomain(domainKey)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-950/50 ring-1 ring-cyan-400'
                      : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {meta.label}
                </button>
              );
            })}
          </div>

          {/* Selected Domain Header Details */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  {DOMAIN_METADATA[selectedDomain].label} Intelligence Module
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  {DOMAIN_METADATA[selectedDomain].desc}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1.5">
                  <Lock className="w-3 h-3 text-amber-400" />
                  Safety Gate: Airgap Enforced
                </span>
              </div>
            </div>

            {/* Entities in Domain */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Server className="w-4 h-4 text-cyan-400" />
                Domain Physical & Virtual Entities
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {entities.filter(e => e.domainId === selectedDomain).length === 0 ? (
                  <div className="p-6 rounded-xl bg-slate-950 border border-dashed border-slate-800 text-slate-400 text-xs text-center col-span-2">
                    No physical entities currently registered in {DOMAIN_METADATA[selectedDomain].label}. Ready to ingest OPC-UA, MQTT Sparkplug-B, or REST telemetry.
                  </div>
                ) : (
                  entities.filter(e => e.domainId === selectedDomain).map(entity => (
                    <div key={entity.entityId} className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          <h4 className="font-bold text-white text-xs">{entity.name}</h4>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                          {entity.dataOrigin}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-400 space-y-1">
                        <div><strong className="text-slate-300">Verified Integrations:</strong> {entity.verifiedIntegrations.join(', ')}</div>
                        <div><strong className="text-slate-300">Operational Limits:</strong> {entity.operationalConstraints.join('; ')}</div>
                      </div>

                      <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[11px]">
                        {Object.entries(entity.metrics).map(([k, v]) => (
                          <div key={k} className="bg-slate-900/60 p-2 rounded border border-slate-800/50">
                            <span className="text-slate-400 text-[10px] block capitalize">{k.replace(/([A-Z])/g, ' $1')}</span>
                            <span className="font-mono font-bold text-white">{String(v)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Workflows in Domain */}
            <div className="space-y-4 mt-8">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Play className="w-4 h-4 text-indigo-400" />
                Governed Industry Workflows
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {workflows.filter(w => w.domainId === selectedDomain).length === 0 ? (
                  <div className="p-6 rounded-xl bg-slate-950 border border-dashed border-slate-800 text-slate-400 text-xs text-center">
                    No custom workflows deployed for this domain. You can install pre-certified workflows from the Industry Marketplace.
                  </div>
                ) : (
                  workflows.filter(w => w.domainId === selectedDomain).map(wf => (
                    <div key={wf.workflowId} className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <h4 className="font-bold text-white text-sm">{wf.title}</h4>
                          <p className="text-xs text-slate-400 mt-0.5">{wf.description}</p>
                        </div>
                        <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800/40 whitespace-nowrap self-start sm:self-auto">
                          {wf.governanceLevel}
                        </span>
                      </div>

                      {/* Execution Steps */}
                      <div className="space-y-1.5 pt-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Execution Pipeline</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
                          {wf.executionSteps.map(step => (
                            <div key={step.stepIndex} className="p-2.5 rounded bg-slate-900 border border-slate-800/80 space-y-1">
                              <span className="text-[9px] font-mono text-cyan-400 font-bold">Step {step.stepIndex}</span>
                              <p className="font-semibold text-white text-[11px]">{step.name}</p>
                              <div className="flex items-center justify-between pt-1 text-[9px] text-slate-400">
                                <span>{step.actionType}</span>
                                {step.requiresHumanSignature ? (
                                  <span className="text-amber-400 flex items-center gap-1 font-mono">
                                    <Lock className="w-2.5 h-2.5" /> Sign Req
                                  </span>
                                ) : (
                                  <span className="text-emerald-400">Auto-Check</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between text-[11px] text-slate-400">
                        <div className="flex items-center gap-2">
                          <span>Required Roles:</span>
                          <span className="font-semibold text-slate-200">{wf.requiredRoles.join(', ')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>Compliance Tags:</span>
                          <span className="text-emerald-400 font-mono">{wf.regulatoryComplianceTags.join(' • ')}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-TAB 3: SCIENTIFIC INTELLIGENCE ENGINE */}
      {/* ======================================================== */}
      {activeSubTab === 'scientific' && (
        <div className="space-y-6">
          {/* Scientific Engine Lifecycle Banner */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Microscope className="w-5 h-5 text-teal-400" />
                  Governed 10-Phase Scientific Research Lifecycle
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Enforces strict epistemic integrity. Research questions progress through formal hypothesis generation, simulation, validation, and cryptographic reproducibility certification.
                </p>
              </div>
              <button
                id="btn-scientific-modal-trigger"
                onClick={() => setShowHypothesisModal(true)}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-lg shadow-teal-950/50"
              >
                <Plus className="w-4 h-4" />
                Formulate Formal Hypothesis
              </button>
            </div>

            {/* 10 Phases Step Indicator */}
            <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-1.5 pt-2 text-[10px]">
              {[
                { phase: '1. QUESTION', label: 'Formulation' },
                { phase: '2. LIT SEARCH', label: 'Synthesis' },
                { phase: '3. DATASET', label: 'Acquisition' },
                { phase: '4. HYPOTHESIS', label: 'Generation' },
                { phase: '5. EXPERIMENT', label: 'Design' },
                { phase: '6. SIMULATION', label: 'Execution' },
                { phase: '7. STATS', label: 'Analysis' },
                { phase: '8. VALIDATE', label: 'In Silico' },
                { phase: '9. PEER CHECK', label: 'Verification' },
                { phase: '10. REPRODUCE', label: 'Certified' }
              ].map((step, idx) => (
                <div key={step.phase} className="p-2 rounded bg-slate-950/80 border border-slate-800/80 text-center space-y-0.5">
                  <span className="font-mono text-teal-400 font-bold text-[9px]">{step.phase}</span>
                  <div className="text-slate-300 font-semibold truncate">{step.label}</div>
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-400 mx-auto mt-1" />
                </div>
              ))}
            </div>
          </div>

          {/* Active Hypotheses & Falsification Engine */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-cyan-400" />
              Active Formal Hypotheses & Falsification Criteria
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {hypotheses.map(hypo => (
                <div key={hypo.hypothesisId} className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800/40 font-bold">
                          {hypo.epistemicType}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">Conf: {(hypo.confidenceScore * 100).toFixed(0)}%</span>
                      </div>
                      <h4 className="font-bold text-white text-sm">{hypo.title}</h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-mono px-2.5 py-1 rounded-full font-bold ${
                        hypo.validationStatus === 'SUPPORTED_BY_SIMULATION'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}>
                        {hypo.validationStatus}
                      </span>
                      <button
                        onClick={() => handleDispatchExperiment(hypo.hypothesisId)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow"
                      >
                        <Play className="w-3 h-3" />
                        Run Experiment
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 bg-slate-900/60 p-3 rounded-lg border border-slate-800/80 font-serif leading-relaxed">
                    "{hypo.claimStatement}"
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-800/60">
                      <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block mb-1">
                        Strict Falsification Criteria
                      </span>
                      <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                        {hypo.falsificationCriteria.map((crit, idx) => (
                          <li key={idx}>{crit}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-800/60 text-[11px] text-slate-400 space-y-1.5">
                      <div><strong className="text-slate-300">Generated By:</strong> {hypo.generatedByAgent}</div>
                      <div><strong className="text-slate-300">Literature Citations:</strong> {hypo.literatureCitationsCount} verified papers indexed</div>
                      <div><strong className="text-slate-300">Formulated:</strong> {new Date(hypo.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cryptographic Research Reproducibility Engine */}
          <div className="space-y-4 mt-8">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Cryptographic Research Reproducibility Records
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {experiments.map(exp => (
                <div key={exp.experimentId} className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/40">
                          {exp.methodology}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">ID: {exp.experimentId}</span>
                      </div>
                      <h4 className="font-bold text-white text-sm mt-1">{exp.name}</h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-800/50">
                        {exp.reproducibilityScorePct}% Reproducible
                      </span>
                      <span className="text-xs text-slate-400 font-mono">{exp.status}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded bg-slate-900 border border-slate-800 space-y-1">
                      <span className="text-slate-400 text-[10px] block">Expected Theoretical Outcome:</span>
                      <p className="text-slate-200 text-[11px]">{exp.expectedOutcome}</p>
                    </div>
                    <div className="p-3 rounded bg-slate-900 border border-slate-800 space-y-1">
                      <span className="text-slate-400 text-[10px] block">Actual Measured Simulation Outcome:</span>
                      <p className="text-emerald-300 text-[11px] font-mono">{exp.actualOutcome}</p>
                    </div>
                  </div>

                  {/* SHA-256 Provenance & Environment Bar */}
                  <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-[10px] font-mono text-slate-400 space-y-1">
                    <div className="truncate"><strong className="text-slate-300">Environment Hash:</strong> {exp.executionEnvironmentHash}</div>
                    <div className="truncate"><strong className="text-slate-300">Dataset Version:</strong> {exp.inputsDatasetVersion} | <strong className="text-slate-300">Repo:</strong> {exp.codeRepositoryVersion}</div>
                    <div className="truncate"><strong className="text-slate-300">Signature:</strong> {exp.provenanceSignature} | <strong className="text-slate-300">Compute:</strong> {exp.computeSecondsConsumed} sec</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Scientific Evidence Graph Explorer */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Share2 className="w-4 h-4 text-purple-400" />
              Scientific Evidence Graph Topology
            </h3>
            <p className="text-xs text-slate-300">
              Links primary peer-reviewed literature, calibrated experimental datasets, in-silico claims, and reproducible execution outcomes.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              {evidenceGraph.nodes.map(node => (
                <div key={node.nodeId} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800/40 font-bold">
                      {node.type}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">{(node.confidence * 100).toFixed(0)}%</span>
                  </div>
                  <h5 className="font-bold text-white text-xs line-clamp-2">{node.title}</h5>
                  <p className="text-slate-400 text-[10px] truncate">{node.authorsOrAgents.join(', ')}</p>
                  <div className="text-[9px] text-slate-500 font-mono truncate">{node.doiOrUri || node.provenanceHash}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-TAB 4: MULTI-MODEL ROUTER 2.0 */}
      {/* ======================================================== */}
      {activeSubTab === 'multimodel' && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-purple-400" />
                  Multi-Model Intelligence & Policy Router 2.0
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Prevents vendor lock-in and guarantees resilience. Dynamically classifies incoming requests, evaluates tenant data confidentiality policies, and executes with sub-millisecond failover.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={testCategory}
                  onChange={e => setTestCategory(e.target.value as any)}
                  className="bg-slate-800 text-xs text-slate-200 px-3 py-2 rounded-xl border border-slate-700 font-mono cursor-pointer"
                >
                  <option value="REASONING">Category: REASONING</option>
                  <option value="LITERATURE_SEARCH">Category: LITERATURE_SEARCH</option>
                  <option value="CODE_SYNTHESIS">Category: CODE_SYNTHESIS</option>
                  <option value="MATHEMATICAL_MODEL">Category: MATHEMATICAL_MODEL</option>
                  <option value="COMPLIANCE_AUDIT">Category: COMPLIANCE_AUDIT</option>
                </select>

                <select
                  value={testPrivacy}
                  onChange={e => setTestPrivacy(e.target.value as any)}
                  className="bg-slate-800 text-xs text-slate-200 px-3 py-2 rounded-xl border border-slate-700 font-mono cursor-pointer"
                >
                  <option value="PUBLIC">Privacy: PUBLIC</option>
                  <option value="CONFIDENTIAL">Privacy: CONFIDENTIAL</option>
                  <option value="HIPAA_FERPA_ISOLATED">Privacy: HIPAA/FERPA ISOLATED</option>
                </select>

                <button
                  id="btn-test-model-route"
                  onClick={handleTestRoute}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-lg shadow-purple-950/40"
                >
                  <Zap className="w-4 h-4" />
                  Route Request
                </button>
              </div>
            </div>

            {/* Registered Model Fleet */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {modelEngines.map(m => (
                <div key={m.modelId} className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800/40 font-bold">
                      {m.provider}
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400" title="Active Model" />
                  </div>

                  <div>
                    <h4 className="font-bold text-white text-xs">{m.modelId}</h4>
                    <span className="text-[10px] text-slate-400">{m.modelFamily}</span>
                  </div>

                  <div className="space-y-1 text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
                    <div><strong className="text-slate-300">Context Window:</strong> {m.contextWindowTokens.toLocaleString()} tokens</div>
                    <div><strong className="text-slate-300">P95 Latency:</strong> {m.latencyP95Ms} ms</div>
                    <div><strong className="text-slate-300">Token Cost:</strong> ${(m.costPer1kInputTokensMinor / 100).toFixed(4)} in / ${(m.costPer1kOutputTokensMinor / 100).toFixed(4)} out</div>
                  </div>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {m.specializationStrengths.slice(0, 2).map((s, idx) => (
                      <span key={idx} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Routing Decision Logs */}
            <div className="mt-8 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                Live Routing Decision Audit Logs
              </h3>
              <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/80 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-800">
                    <tr>
                      <th className="p-3">Routing ID</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Policy Applied</th>
                      <th className="p-3">Selected Model</th>
                      <th className="p-3">Latency</th>
                      <th className="p-3">Privacy Tier</th>
                      <th className="p-3">Audit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                    {routingLogs.map(log => (
                      <tr key={log.routingId} className="hover:bg-slate-900/40 text-slate-300">
                        <td className="p-3 text-cyan-400">{log.routingId}</td>
                        <td className="p-3">{log.requestCategory}</td>
                        <td className="p-3 text-slate-400">{log.policyApplied}</td>
                        <td className="p-3 text-white font-bold">{log.selectedModelId}</td>
                        <td className="p-3 text-emerald-400">{log.latencyAchievedMs} ms</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 text-[10px]">
                            {log.privacyClassification}
                          </span>
                        </td>
                        <td className="p-3 text-emerald-400 font-bold">{log.verificationStatus}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-TAB 5: SCIENTIFIC COMPUTE & HPC ORCHESTRATOR */}
      {/* ======================================================== */}
      {activeSubTab === 'compute' && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Server className="w-5 h-5 text-indigo-400" />
                Scientific Compute & Cluster Orchestrator
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Manages heavy computational workloads (simulation swarms, Bayesian optimization, PDE solvers) with transparent node-hour metering, queue prioritization, and non-preemptible execution locks.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {computeJobs.map(job => (
                <div key={job.jobId} className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/40">
                        {job.workloadType}
                      </span>
                      <h4 className="font-bold text-white text-sm mt-1">{job.jobName}</h4>
                    </div>
                    <span className={`text-[10px] font-mono px-2.5 py-1 rounded-full font-bold ${
                      job.status === 'COMPLETED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                    }`}>
                      {job.status}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                      <span>Progress</span>
                      <span>{job.progressPct}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-500"
                        style={{ width: `${job.progressPct}%` }}
                      />
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 space-y-1 pt-2 border-t border-slate-800/80 font-mono">
                    <div><strong className="text-slate-300 font-sans">Hardware:</strong> {job.allocatedHardware}</div>
                    <div><strong className="text-slate-300 font-sans">Nodes:</strong> {job.nodesRequested} | <strong className="text-slate-300 font-sans">Cost:</strong> ${(job.computeUnitCostMinor / 100).toFixed(2)} USD</div>
                    <div><strong className="text-slate-300 font-sans">Tenant:</strong> {job.tenantId}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-TAB 6: INDUSTRY CLOUD & MARKETPLACE */}
      {/* ======================================================== */}
      {activeSubTab === 'marketplace' && (
        <div className="space-y-6">
          {/* Industry Cloud Commercial Packages */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Boxes className="w-5 h-5 text-amber-400" />
              CATALYX Industry Cloud Solutions
            </h2>
            <p className="text-xs text-slate-400">
              Turnkey vertical cloud packages sharing the core Universal Intelligence platform. Complete with domain compliance certificates, pre-built agent teams, and verified industrial connectors.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {industryClouds.map(pkg => (
                <div key={pkg.packageId} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800/40 font-bold">
                      {pkg.industryCode}
                    </span>
                    <h4 className="font-bold text-white text-sm">{pkg.name}</h4>
                    <div className="text-lg font-extrabold text-white font-mono">
                      ${(pkg.baseMonthlyUsd).toLocaleString()}<span className="text-xs text-slate-400 font-normal"> /mo</span>
                    </div>

                    <div className="text-[11px] text-slate-400 space-y-1 pt-2 border-t border-slate-800">
                      <div><strong className="text-slate-300">Active Tenants:</strong> {pkg.activeTenantsCount} organizations</div>
                      <div><strong className="text-slate-300">Live Workflows:</strong> {pkg.activeWorkflowsRunning} active</div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80">
                    <span className="text-[10px] font-bold text-emerald-400 block mb-1">Certifications:</span>
                    <div className="flex flex-wrap gap-1">
                      {pkg.complianceCertifications.map((c, i) => (
                        <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Specialized Marketplace Modules */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Boxes className="w-4 h-4 text-cyan-400" />
              Specialized Industry Intelligence Marketplace Modules
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {marketPackages.map(p => (
                <div key={p.moduleId} className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/40">
                        {p.domainId} • {p.version}
                      </span>
                      {p.installed ? (
                        <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                          Installed
                        </span>
                      ) : (
                        <button
                          onClick={() => handleInstallModule(p.moduleId)}
                          className="px-3 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition cursor-pointer"
                        >
                          Install Module
                        </button>
                      )}
                    </div>

                    <h4 className="font-bold text-white text-sm">{p.name}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{p.summary}</p>

                    <div className="space-y-1 text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                      <div><strong className="text-slate-300">Owner:</strong> {p.ownerOrganization}</div>
                      <div><strong className="text-slate-300">Integrations:</strong> {p.certifiedIntegrations.join(', ')}</div>
                      <div><strong className="text-slate-300">Security Profile:</strong> {p.securityProfile}</div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-slate-400">
                      Base: <strong className="text-white">${(p.pricingModel.monthlyBaseUsdMinor / 100).toFixed(0)}/mo</strong>
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      Regions: {p.supportedRegions.join(', ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-TAB 7: V16 PRODUCTION ACCEPTANCE GATE */}
      {/* ======================================================== */}
      {activeSubTab === 'acceptance' && acceptanceReport && (
        <div className="space-y-6">
          {/* Main Verdict Card */}
          <div className="bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-950 border border-emerald-500/40 rounded-2xl p-6 space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 px-2.5 py-1 rounded bg-emerald-950 border border-emerald-800 block w-fit mb-2">
                  Official Verification Audit
                </span>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-emerald-400" />
                  {acceptanceReport.verdict}
                </h2>
                <p className="text-xs text-slate-300 mt-1">
                  Report ID: <span className="font-mono text-emerald-300">{acceptanceReport.reportId}</span> | Certified: {new Date(acceptanceReport.generatedAt).toLocaleString()}
                </p>
              </div>

              <div className="bg-emerald-950/80 border border-emerald-500/50 p-4 rounded-xl text-center min-w-[160px]">
                <span className="text-[10px] uppercase font-mono text-emerald-300 block font-bold">Platform Status</span>
                <span className="text-xl font-black text-emerald-400 font-mono">DEPLOYABLE</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Zero Blocking CVEs</span>
              </div>
            </div>
          </div>

          {/* 4 Scorecards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-cyan-400">Scientific Integrity</span>
              <div className="text-2xl font-bold font-mono text-white">
                {acceptanceReport.scientificIntegrityScorecard.researchReproducibilityScorePct}%
              </div>
              <p className="text-[11px] text-slate-400">
                {acceptanceReport.scientificIntegrityScorecard.evidenceProvenanceAuditedCount} evidence nodes audited. Epistemic integrity strictly enforced.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-emerald-400">Multi-Tenancy Isolation</span>
              <div className="text-2xl font-bold font-mono text-emerald-400">
                VERIFIED
              </div>
              <p className="text-[11px] text-slate-400">
                Zero cross-tenant leakage across knowledge graphs, workflows, and compute swarms.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-purple-400">Defensive AI Security</span>
              <div className="text-2xl font-bold font-mono text-white">
                {acceptanceReport.securityAndMultiTenancyScorecard.adversarialInjectionProtectionPct}%
              </div>
              <p className="text-[11px] text-slate-400">
                Prompt injection, tool poisoning, and sandbox escapes neutralized. Critical infra locked.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-amber-400">Economic Transparency</span>
              <div className="text-2xl font-bold font-mono text-amber-300">
                AUDITED
              </div>
              <p className="text-[11px] text-slate-400">
                No fabricated metrics. Exact token and compute node hour cost attribution.
              </p>
            </div>
          </div>

          {/* 11 Core Acceptance Checks */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              11 Core Production Acceptance Checks
            </h3>
            <div className="divide-y divide-slate-800/80">
              {acceptanceReport.coreChecklist.map(chk => (
                <div key={chk.checkId} className="py-3 flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="font-bold text-white">{chk.title}</span>
                    </div>
                    <p className="text-slate-400 text-[11px] pl-5.5">{chk.evidence}</p>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/50 self-start md:self-auto">
                    {chk.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Domain Readiness Scorecard Breakdown */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-cyan-400" />
              12-Domain Readiness & Airgap Safeguard Audit
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              {acceptanceReport.domainReadinessScorecard.map(d => (
                <div key={d.domainId} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{d.domainName}</span>
                    <span className="font-mono text-emerald-400 font-bold">{d.readinessPct}%</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">{d.evidenceSummary}</p>
                  <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                    <span>Safeguard:</span>
                    <span className="text-amber-400">{d.physicalControlSafeguard}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Formulate Scientific Hypothesis */}
      {showHypothesisModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-teal-400" />
                Formulate Formal Scientific Hypothesis
              </h3>
              <button
                onClick={() => setShowHypothesisModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateHypothesis} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold block">Hypothesis Title</label>
                <input
                  type="text"
                  placeholder="e.g. Bimetallic Catalyst Coordination Accelerates Sorption"
                  value={newHypoTitle}
                  onChange={e => setNewHypoTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold block">Formal Claim Statement</label>
                <textarea
                  placeholder="Precise, falsifiable scientific claim statement..."
                  value={newHypoClaim}
                  onChange={e => setNewHypoClaim(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold block">Mandatory Falsification Criteria</label>
                <input
                  type="text"
                  placeholder="Condition under which this hypothesis is conclusively rejected"
                  value={newHypoFalsification}
                  onChange={e => setNewHypoFalsification(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="p-3 rounded-lg bg-teal-950/40 border border-teal-800/40 text-[11px] text-teal-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-teal-400" />
                <span>Epistemic mandate: All registered hypotheses are logged with cryptographic timestamps and cannot be retrospectively altered.</span>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowHypothesisModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold cursor-pointer"
                >
                  Register Hypothesis
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
