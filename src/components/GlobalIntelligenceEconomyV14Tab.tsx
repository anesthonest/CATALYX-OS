import React, { useState, useEffect } from 'react';
import {
  UniversalIntelligenceProduct,
  AutonomousEconomicAgent,
  AgentToAgentTransactionRecord,
  IntelligenceAsAServiceTier,
  CatalyxValueIndexMetrics,
  OutcomeMarketContract,
  EnterpriseProcurementWorkflow,
  GlobalEmergencyControlPlaneState,
  V14GlobalIntelligenceEconomyMetrics,
  V14ProductionCertificationReport,
  IntelligenceProductCategory,
  ProductPricingModel,
  AutonomyLevel
} from '../types';
import { globalIntelligenceEconomyV14Service } from '../services/globalIntelligenceEconomyV14Service';
import {
  Globe, Shield, Cpu, Scale, AlertTriangle, CheckCircle2,
  DollarSign, TrendingUp, Sparkles, Building2, Workflow, Key,
  ChevronRight, Search, ShieldCheck, Activity, Layers, Flame,
  Briefcase, ShoppingCart, Lock, ArrowUpRight, FileCheck, Sliders,
  RefreshCw, Power, Award, Zap, Compass, BarChart3, Users
} from 'lucide-react';

interface Props {
  organizationId?: string;
  userEmail?: string;
}

export function GlobalIntelligenceEconomyV14Tab({
  organizationId = 'org_safari_telecom_ke',
  userEmail = 'executive@catalyx.global'
}: Props) {
  // Navigation Sub-Tabs
  const [activeSubTab, setActiveSubTab] = useState<
    'marketplace' | 'agents-a2a' | 'iaas' | 'cvi-outcomes' | 'procurement' | 'emergency' | 'flywheel' | 'certification'
  >('marketplace');

  // Data states
  const [products, setProducts] = useState<UniversalIntelligenceProduct[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [agents, setAgents] = useState<AutonomousEconomicAgent[]>([]);
  const [a2aTxs, setA2aTxs] = useState<AgentToAgentTransactionRecord[]>([]);
  const [iaasTiers, setIaasTiers] = useState<IntelligenceAsAServiceTier[]>([]);
  const [cviMetrics, setCviMetrics] = useState<CatalyxValueIndexMetrics | null>(null);
  const [outcomeContracts, setOutcomeContracts] = useState<OutcomeMarketContract[]>([]);
  const [procurements, setProcurements] = useState<EnterpriseProcurementWorkflow[]>([]);
  const [emergencyState, setEmergencyState] = useState<GlobalEmergencyControlPlaneState | null>(null);
  const [economyMetrics, setEconomyMetrics] = useState<V14GlobalIntelligenceEconomyMetrics | null>(null);
  const [certification, setCertification] = useState<V14ProductionCertificationReport | null>(null);

  // Modal & Interactive states
  const [selectedProduct, setSelectedProduct] = useState<UniversalIntelligenceProduct | null>(null);
  const [showPublishModal, setShowPublishModal] = useState<boolean>(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Publish Form State
  const [pubTitle, setPubTitle] = useState('');
  const [pubCategory, setPubCategory] = useState<IntelligenceProductCategory>('WORKFLOW_AUTOMATION');
  const [pubPricingModel, setPubPricingModel] = useState<ProductPricingModel>('OUTCOME_BASED');
  const [pubPrice, setPubPrice] = useState('1500'); // $15.00
  const [pubDescription, setPubDescription] = useState('');

  // Load data
  const loadData = () => {
    setProducts(globalIntelligenceEconomyV14Service.getProducts(selectedCategory, searchQuery));
    setAgents(globalIntelligenceEconomyV14Service.getEconomicAgents());
    setA2aTxs(globalIntelligenceEconomyV14Service.getA2ATransactions());
    setIaasTiers(globalIntelligenceEconomyV14Service.getIaaSTiers());
    setCviMetrics(globalIntelligenceEconomyV14Service.getCviMetrics(organizationId));
    setOutcomeContracts(globalIntelligenceEconomyV14Service.getOutcomeContracts());
    setProcurements(globalIntelligenceEconomyV14Service.getProcurementWorkflows());
    setEmergencyState(globalIntelligenceEconomyV14Service.getEmergencyState());
    setEconomyMetrics(globalIntelligenceEconomyV14Service.getEconomyMetrics());
    setCertification(globalIntelligenceEconomyV14Service.getV14ProductionCertificationReport());
  };

  useEffect(() => {
    loadData();
  }, [selectedCategory, searchQuery]);

  const handlePublishProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pubTitle.trim()) return;

    const priceMinor = Math.round(parseFloat(pubPrice || '0') * 100);
    const newProd = globalIntelligenceEconomyV14Service.registerProduct({
      title: pubTitle,
      category: pubCategory,
      pricingModel: pubPricingModel,
      priceMinor,
      description: pubDescription || 'Autonomous intelligence package verified on CATALYX V14 UIPE.',
      creatorName: 'Enterprise AI Labs',
      creatorOrgId: organizationId,
      capabilities: ['Sub-second latency execution', 'Cryptographic telemetry proofs']
    });

    setShowPublishModal(false);
    setPubTitle('');
    setPubDescription('');
    loadData();
    setActionNotice(`Intelligence Product "${newProd.title}" successfully registered, scanned, and published with provenance hash.`);
    setTimeout(() => setActionNotice(null), 6000);
  };

  const handleA2ATransaction = () => {
    const res = globalIntelligenceEconomyV14Service.executeGovernedAgentTransaction({
      requestingAgentId: 'agent_procurement_ke_01',
      executingAgentId: 'agent_fx_liquidity_sg_02',
      taskDescription: 'Automated treasury rebalancing and bilateral swap for cross-border coffee logistics',
      proposedSpendMinor: 250000 // $2,500.00
    });

    if (res.success) {
      loadData();
      setActionNotice(`Governed A2A Transaction #${res.transaction?.transactionId} successfully authorized through 11-step execution gate.`);
      setTimeout(() => setActionNotice(null), 6000);
    } else {
      setActionNotice(`Transaction rejected: ${res.reason}`);
    }
  };

  const handleApproveProcurement = (requestId: string, roleEmail: string) => {
    const updated = globalIntelligenceEconomyV14Service.advanceProcurementWorkflow(requestId, roleEmail);
    if (updated) {
      loadData();
      setActionNotice(`Procurement approval recorded for ${roleEmail}. Current stage: ${updated.currentWorkflowStage}`);
      setTimeout(() => setActionNotice(null), 5000);
    }
  };

  const handleEmergencyToggle = (activate: boolean) => {
    const updated = globalIntelligenceEconomyV14Service.toggleEmergencyMode({
      activate,
      triggeredBy: userEmail,
      reason: activate ? 'Operator manual security containment drill' : 'Security drill concluded',
      suspendAgents: activate,
      freezeMarketplace: activate,
      freezePayouts: activate
    });
    setEmergencyState(updated);
    loadData();
    setActionNotice(activate ? 'EMERGENCY MODE ACTIVATED: All agent spending and marketplace payouts frozen.' : 'Emergency controls lifted. System returned to nominal operating status.');
    setTimeout(() => setActionNotice(null), 6000);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Banner: V14 Global Intelligence Economy */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-950 via-slate-900 to-emerald-950 border border-indigo-500/30 p-6 shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Globe className="w-80 h-80 text-indigo-300" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/40">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                CATALYX V14 GIE
              </span>
              <span className="text-xs text-slate-400 font-mono">Global Intelligence Economy</span>
              {emergencyState?.emergencyModeActive ? (
                <span className="text-xs px-2.5 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/40 font-mono flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-red-400 animate-bounce" />
                  EMERGENCY ACTIVE
                </span>
              ) : (
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  All Economic Systems Nominal
                </span>
              )}
            </div>

            <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight flex items-center gap-3">
              <TrendingUp className="w-7 h-7 text-indigo-400" />
              Global Intelligence Economy
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl">
              Universal marketplace connecting human intelligence, autonomous economic AI agents, enterprise procurement, 
              double-entry creator settlements, and verified customer value outcomes.
            </p>
          </div>

          {/* Key Economy Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-900/80 border border-indigo-500/20 rounded-xl p-3">
              <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Gross Merchandise Value</div>
              <div className="text-lg font-bold text-indigo-300 font-mono mt-0.5">
                ${((economyMetrics?.grossMerchandiseValueMinor || 125300000) / 100000000).toFixed(1)}M
              </div>
              <div className="text-[10px] text-indigo-400/80 font-mono">Annualized GMV</div>
            </div>

            <div className="bg-slate-900/80 border border-emerald-500/20 rounded-xl p-3">
              <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Customer Value ROI</div>
              <div className="text-lg font-bold text-emerald-300 font-mono mt-0.5 flex items-center gap-1">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                {economyMetrics?.avgCustomerRoiMultiple || 8.4}x
              </div>
              <div className="text-[10px] text-emerald-400/80 font-mono">Catalyx Value Index</div>
            </div>

            <div className="bg-slate-900/80 border border-purple-500/20 rounded-xl p-3">
              <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Creator Payouts</div>
              <div className="text-lg font-bold text-purple-300 font-mono mt-0.5">
                ${((economyMetrics?.creatorPayoutsMinor || 109600000) / 100000000).toFixed(1)}M
              </div>
              <div className="text-[10px] text-purple-400/80 font-mono">Net Settled to Creators</div>
            </div>

            <div className="bg-slate-900/80 border border-cyan-500/20 rounded-xl p-3">
              <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Economic Agents</div>
              <div className="text-lg font-bold text-cyan-300 font-mono mt-0.5">
                {economyMetrics?.activeAgentsCount || 144} Active
              </div>
              <div className="text-[10px] text-cyan-400/80 font-mono">L0-L4 Governed</div>
            </div>
          </div>
        </div>

        {/* Action Header Controls */}
        <div className="mt-5 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPublishModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" />
              Publish Intelligence Product (UIPE)
            </button>
            <button
              onClick={handleA2ATransaction}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg cursor-pointer"
            >
              <Workflow className="w-3.5 h-3.5" />
              Execute Governed A2A Micro-Task
            </button>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            {emergencyState?.emergencyModeActive ? (
              <button
                onClick={() => handleEmergencyToggle(false)}
                className="inline-flex items-center gap-1 px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer"
              >
                <Power className="w-3 h-3" />
                Deactivate Emergency Mode
              </button>
            ) : (
              <button
                onClick={() => handleEmergencyToggle(true)}
                className="inline-flex items-center gap-1 px-3 py-1 rounded bg-red-900/60 hover:bg-red-800 text-red-200 border border-red-500/40 text-xs font-semibold cursor-pointer"
              >
                <AlertTriangle className="w-3 h-3 text-red-400" />
                Trigger Emergency Drill
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Action Notification Alert */}
      {actionNotice && (
        <div className="p-3.5 rounded-xl bg-indigo-950/80 border border-indigo-500/40 text-indigo-200 text-xs font-mono flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400 animate-spin" />
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-indigo-400 hover:text-white text-sm cursor-pointer">✕</button>
        </div>
      )}

      {/* Sub-Tabs Navigation */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-slate-800">
        {[
          { id: 'marketplace', label: 'Universal Intelligence Market', icon: ShoppingCart },
          { id: 'agents-a2a', label: 'AI Agent Economy & A2A', icon: Workflow },
          { id: 'iaas', label: 'Intelligence-as-a-Service (IaaS)', icon: Cpu },
          { id: 'cvi-outcomes', label: 'Catalyx Value Index & Outcomes', icon: Award },
          { id: 'procurement', label: 'Enterprise Procurement', icon: Briefcase },
          { id: 'emergency', label: 'Emergency Control Plane', icon: AlertTriangle },
          { id: 'flywheel', label: 'Economic Flywheel & Loop', icon: TrendingUp },
          { id: 'certification', label: 'V14 GIE Certification', icon: ShieldCheck }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-t-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer border-b-2 ${
                isActive
                  ? 'border-indigo-400 text-indigo-300 bg-slate-900/60 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* SUB-VIEW 1: UNIVERSAL INTELLIGENCE MARKETPLACE */}
      {activeSubTab === 'marketplace' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-slate-400">Category:</span>
              {['ALL', 'AGENT_TEAM', 'WORKFLOW_AUTOMATION', 'DOCUMENT_INTELLIGENCE', 'INDUSTRY_SOLUTION'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {cat.replace(/_/g, ' ')}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search capabilities, models, or provenance..."
                className="pl-8 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:border-indigo-500 focus:outline-none w-64"
              />
            </div>
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {products.map(product => (
              <div
                key={product.productId}
                className="p-5 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/40 transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          {product.category}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                          {product.verificationState}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-white mt-1.5">{product.title}</h3>
                    </div>

                    <div className="text-right">
                      <div className="text-[10px] font-mono text-slate-400 uppercase">{product.pricingModel}</div>
                      <div className="text-base font-bold text-emerald-400 font-mono">
                        ${(product.priceMinor / 100).toLocaleString()} {product.currency}
                      </div>
                      {product.outcomeMetric && (
                        <div className="text-[10px] text-slate-500 font-mono">{product.outcomeMetric}</div>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{product.description}</p>

                  {/* Capabilities List */}
                  <div className="space-y-1 pt-1">
                    <div className="text-[10px] text-slate-500 uppercase font-mono">Key Governed Capabilities:</div>
                    {product.capabilities.map((cap, idx) => (
                      <div key={idx} className="text-xs text-slate-300 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-indigo-400 flex-shrink-0" />
                        <span>{cap}</span>
                      </div>
                    ))}
                  </div>

                  {/* Compliance Certifications */}
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {product.complianceCertifications.map((cert, idx) => (
                      <span key={idx} className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer Controls & Provenance */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
                  <div className="text-slate-400">
                    <span className="text-slate-500">Deployments:</span> <span className="text-white font-bold">{product.totalDeployments}</span>
                  </div>
                  <button
                    onClick={() => setSelectedProduct(product)}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-indigo-300 font-semibold cursor-pointer border border-indigo-500/30"
                  >
                    Inspect Provenance <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Product Provenance Drawer */}
          {selectedProduct && (
            <div className="p-5 rounded-xl bg-slate-900 border border-indigo-500/40 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-indigo-400 uppercase font-bold text-[10px]">Universal Product Manifest & Provenance</span>
                  <h3 className="text-sm font-bold text-white">{selectedProduct.title}</h3>
                </div>
                <button onClick={() => setSelectedProduct(null)} className="text-slate-400 hover:text-white cursor-pointer">Close</button>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5 text-slate-300">
                <div><span className="text-slate-500">Product ID:</span> {selectedProduct.productId}</div>
                <div><span className="text-slate-500">Creator Organization:</span> {selectedProduct.creatorName} ({selectedProduct.creatorOrgId})</div>
                <div><span className="text-slate-500">License Model:</span> {selectedProduct.licenseType}</div>
                <div><span className="text-slate-500">Security Clearance:</span> {selectedProduct.securityClassification}</div>
                <div><span className="text-slate-500">Immutable SHA-256 Provenance:</span> <span className="text-emerald-300 break-all">{selectedProduct.provenanceHash}</span></div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB-VIEW 2: AI AGENT ECONOMY & GOVERNED A2A */}
      {activeSubTab === 'agents-a2a' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Workflow className="w-5 h-5 text-indigo-400" />
                AI Agent Economy 2.0 & Autonomy Governance
              </h2>
              <p className="text-xs text-slate-400">
                Economic agents operate under explicit L0–L4 governance. Every monetary expenditure must pass the 11-step authorization firewall.
              </p>
            </div>
            <button
              onClick={handleA2ATransaction}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer"
            >
              <Workflow className="w-3.5 h-3.5" />
              Test Governed A2A Execution
            </button>
          </div>

          {/* Agents List */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {agents.map(agent => {
              const spentPct = Math.round((agent.currentMonthSpentMinor / agent.monthlyBudgetCapMinor) * 100);
              return (
                <div key={agent.agentId} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {agent.autonomyLevel}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold">{agent.status}</span>
                    </div>

                    <h3 className="text-sm font-bold text-white">{agent.name}</h3>
                    <div className="text-xs text-slate-400 font-mono">Owner: <span className="text-slate-200">{agent.ownerOrgName}</span></div>

                    <div className="p-2 rounded bg-slate-950 border border-slate-800 text-xs font-mono space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Reputation:</span>
                        <span className="text-emerald-400 font-bold">{agent.reputationScore}/100</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Success Rate:</span>
                        <span className="text-white">{agent.successRatePct}% ({agent.totalTasksExecuted} tasks)</span>
                      </div>
                    </div>

                    {/* Monthly Budget Progress */}
                    <div className="space-y-1 font-mono text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Monthly Budget Cap:</span>
                        <span className="text-slate-200">${(agent.monthlyBudgetCapMinor / 100).toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800">
                        <div className={`h-full rounded-full ${spentPct > 80 ? 'bg-amber-400' : 'bg-indigo-400'}`} style={{ width: `${spentPct}%` }} />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-500">
                        <span>${(agent.currentMonthSpentMinor / 100).toLocaleString()} spent</span>
                        <span>{spentPct}% utilized</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800">
                    <div className="text-[10px] text-slate-500 font-mono mb-1">Policy Bindings:</div>
                    <div className="space-y-0.5">
                      {agent.activePolicyBindings.map((pol, idx) => (
                        <div key={idx} className="text-[10px] font-mono text-indigo-300 truncate">🛡 {pol}</div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Governed A2A Transactions Ledger */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Governed Agent-to-Agent (A2A) Settlement Ledger</h3>
              <span className="text-xs text-slate-400 font-mono">{a2aTxs.length} Audited Transactions</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px]">
                  <tr>
                    <th className="p-3">TX ID</th>
                    <th className="p-3">Requesting Agent</th>
                    <th className="p-3">Executing Agent</th>
                    <th className="p-3">Authorized Amount</th>
                    <th className="p-3">Actual Settled</th>
                    <th className="p-3">11-Step Gate Status</th>
                    <th className="p-3">Audit Proof</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {a2aTxs.map(tx => (
                    <tr key={tx.transactionId} className="hover:bg-slate-800/30">
                      <td className="p-3 text-indigo-300 font-bold">{tx.transactionId}</td>
                      <td className="p-3 text-slate-200">{tx.requestingAgentName}</td>
                      <td className="p-3 text-slate-200">{tx.executingAgentName}</td>
                      <td className="p-3 text-slate-400">${(tx.authorizedSpendMinor / 100).toFixed(2)}</td>
                      <td className="p-3 text-emerald-400 font-bold">${(tx.actualSettledMinor / 100).toFixed(2)}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          {tx.authorizationGateStatus}
                        </span>
                      </td>
                      <td className="p-3 text-slate-400 truncate max-w-[140px]">{tx.auditSignatureSha256}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 3: INTELLIGENCE-AS-A-SERVICE (IAAS) */}
      {activeSubTab === 'iaas' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-indigo-400" />
              Intelligence-as-a-Service (IaaS) Cost & Margin Decomposition
            </h2>
            <p className="text-xs text-slate-400">
              Clear financial separation between model inference costs, platform infrastructure overhead, creator revenue shares, and platform gross margins.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {iaasTiers.map(tier => (
              <div key={tier.serviceId} className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-start justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {tier.serviceDomain}
                  </span>
                  <span className="text-xs font-mono text-emerald-400 font-bold">{tier.platformGrossMarginPct}% Margin</span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white">{tier.serviceName}</h3>
                  <div className="text-base font-bold text-emerald-400 font-mono mt-1">
                    ${(tier.customerPriceMinor / 100).toFixed(2)} USD Customer Price
                  </div>
                </div>

                {/* Cost Breakdown */}
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs space-y-1.5">
                  <div className="text-[10px] text-slate-500 uppercase">Unit Cost Breakdown:</div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Model Inference:</span>
                    <span className="text-slate-200">${(tier.modelInferenceCostMinor / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Platform Infra:</span>
                    <span className="text-slate-200">${(tier.platformInfraCostMinor / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Creator Earnings:</span>
                    <span className="text-purple-300 font-semibold">${(tier.creatorMarginMinor / 100).toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex justify-between text-xs font-mono pt-2 border-t border-slate-800 text-slate-400">
                  <span>P99 SLA: <strong className="text-white">{tier.slaLatencyMs}ms</strong></span>
                  <span>Active Tenants: <strong className="text-indigo-300">{tier.activeTenantsCount}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-VIEW 4: CATALYX VALUE INDEX & OUTCOME MARKET */}
      {activeSubTab === 'cvi-outcomes' && cviMetrics && (
        <div className="space-y-5">
          {/* CVI Scorecard */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-950 via-slate-900 to-indigo-950 border border-emerald-500/40 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <span className="text-xs font-mono text-emerald-300 uppercase tracking-wider font-bold">
                  Catalyx Value Index (CVI) Assessment
                </span>
                <h2 className="text-xl font-bold text-white mt-1">
                  {cviMetrics.organizationName} — {cviMetrics.measuredPeriod}
                </h2>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-slate-400 font-mono uppercase">Verified ROI Multiple</div>
                <div className="text-2xl font-bold text-emerald-400 font-mono flex items-center gap-1 justify-end">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                  {cviMetrics.roiMultiple}x ROI
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800 font-mono text-xs">
              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                <div className="text-slate-400 text-[10px]">Time Saved</div>
                <div className="text-base font-bold text-indigo-300">{cviMetrics.timeSavedHours.toLocaleString()} Hours</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                <div className="text-slate-400 text-[10px]">Direct Cost Reduction</div>
                <div className="text-base font-bold text-emerald-300">${(cviMetrics.operationalCostReductionMinor / 100).toLocaleString()}</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                <div className="text-slate-400 text-[10px]">New Revenue Generated</div>
                <div className="text-base font-bold text-cyan-300">${(cviMetrics.revenueGeneratedMinor / 100).toLocaleString()}</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                <div className="text-slate-400 text-[10px]">Risk / Penalty Avoidance</div>
                <div className="text-base font-bold text-purple-300">${(cviMetrics.riskAvoidedValueMinor / 100).toLocaleString()}</div>
              </div>
            </div>
          </div>

          {/* Outcome Market Contracts */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-400" />
              Outcome-Based Commercial Contracts (Pay-For-Verified-Results)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {outcomeContracts.map(ctr => (
                <div key={ctr.outcomeContractId} className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-slate-400">{ctr.outcomeContractId}</span>
                      <h4 className="text-sm font-bold text-white mt-0.5">{ctr.buyerOrgName}</h4>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                      {ctr.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    {ctr.outcomeDefinition}
                  </p>

                  <div className="space-y-1 text-xs font-mono text-slate-400">
                    <div className="flex justify-between">
                      <span>Verification Method:</span>
                      <span className="text-indigo-300 font-semibold">{ctr.outcomeVerificationProof}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Price Per Outcome:</span>
                      <span className="text-emerald-400 font-bold">${(ctr.pricePerOutcomeMinor / 100).toFixed(2)} USD</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivered Progress:</span>
                      <span className="text-white font-bold">{ctr.deliveredQuantity} / {ctr.targetQuantity} units</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 5: ENTERPRISE PROCUREMENT */}
      {activeSubTab === 'procurement' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-indigo-400" />
              Enterprise Procurement & Autonomous RFP Engine
            </h2>
            <p className="text-xs text-slate-400">
              Multi-tiered governance workflows preventing unvetted shadow AI deployments through institutional sign-offs.
            </p>
          </div>

          <div className="space-y-4">
            {procurements.map(proc => (
              <div key={proc.procurementRequestId} className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 font-mono text-xs">
                      <span className="text-slate-400">{proc.procurementRequestId}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold">
                        {proc.currentWorkflowStage}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white mt-1">{proc.productTitle}</h3>
                    <div className="text-xs text-slate-400">
                      Requested by: <strong className="text-slate-200">{proc.requestingOrgName}</strong> ({proc.requestingDepartment})
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <div className="text-xs text-slate-400">Estimated Annual Spend</div>
                    <div className="text-base font-bold text-emerald-400">
                      ${(proc.estimatedAnnualCostMinor / 100).toLocaleString()} USD
                    </div>
                    <div className="text-[10px] text-indigo-300">Clearance: {proc.vendorSecurityClearance}</div>
                  </div>
                </div>

                {/* Approvers Pipeline */}
                <div>
                  <div className="text-xs font-semibold text-slate-300 mb-2">Institutional Approver Checklist:</div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {proc.requiredApprovers.map((app, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-semibold text-white">{app.role}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{app.email}</div>
                        </div>
                        {app.approved ? (
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-mono font-bold">
                            <CheckCircle2 className="w-3 h-3" /> APPROVED
                          </span>
                        ) : (
                          <button
                            onClick={() => handleApproveProcurement(proc.procurementRequestId, app.email)}
                            className="px-2 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-mono cursor-pointer"
                          >
                            Sign Off
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-VIEW 6: EMERGENCY CONTROL PLANE */}
      {activeSubTab === 'emergency' && emergencyState && (
        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-red-950 via-slate-900 to-indigo-950 border border-red-500/40 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-red-300 uppercase font-bold">Master Emergency Control Plane</span>
                <h2 className="text-xl font-bold text-white mt-1">Global Circuit Breaker Operations</h2>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold ${
                emergencyState.emergencyModeActive ? 'bg-red-500/30 text-red-300 border border-red-500' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              }`}>
                {emergencyState.emergencyModeActive ? 'SYSTEM IN EMERGENCY LOCKDOWN' : 'NORMAL FLIGHT READY'}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Authorized security administrators can instantaneously freeze all autonomous economic agents, suspend marketplace transactions, 
              halt creator payouts, and restrict API rate limits across the entire platform.
            </p>

            <div className="pt-3 border-t border-slate-800 flex items-center gap-3">
              {emergencyState.emergencyModeActive ? (
                <button
                  onClick={() => handleEmergencyToggle(false)}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold font-mono cursor-pointer"
                >
                  Lift Emergency Lockdown
                </button>
              ) : (
                <button
                  onClick={() => handleEmergencyToggle(true)}
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold font-mono cursor-pointer"
                >
                  Activate Emergency Kill-Switch Drill
                </button>
              )}
            </div>
          </div>

          {/* Audit Logs */}
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3 font-mono text-xs">
            <h3 className="text-sm font-bold text-white">Emergency Control Plane Audit Log</h3>
            <div className="space-y-2">
              {emergencyState.auditLog.map((log, idx) => (
                <div key={idx} className="p-2.5 rounded bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-2">
                  <div className="text-indigo-300 font-bold">{log.action}</div>
                  <div className="text-slate-400">By: {log.triggeredBy}</div>
                  <div className="text-slate-500">{log.timestamp}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 7: ECONOMIC FLYWHEEL & LOOP */}
      {activeSubTab === 'flywheel' && (
        <div className="space-y-5">
          <div className="p-6 rounded-2xl bg-slate-900 border border-indigo-500/30 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              The Complete V14 Economic Intelligence Loop
            </h2>
            <p className="text-xs text-slate-300">
              CATALYX transforms intelligence into measurable economic value through two virtuous, reinforcing flywheels.
            </p>

            {/* Loop 1: Consumption & Delivery Loop */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 font-mono text-xs">
              <div className="text-indigo-400 font-bold uppercase text-[10px]">1. The Enterprise Delivery Loop:</div>
              <div className="flex flex-wrap items-center gap-2 text-slate-300">
                {['DISCOVER', 'EVALUATE', 'TRUST', 'PURCHASE', 'DEPLOY', 'EXECUTE', 'MEASURE', 'GENERATE VALUE', 'PAY', 'LEARN', 'SCALE'].map((step, idx) => (
                  <React.Fragment key={idx}>
                    <span className="px-2 py-1 rounded bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 text-[10px] font-bold">
                      {step}
                    </span>
                    {idx < 10 && <span className="text-slate-600">→</span>}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Loop 2: Creator & Innovation Loop */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 font-mono text-xs">
              <div className="text-emerald-400 font-bold uppercase text-[10px]">2. The Creator & Economic Growth Loop:</div>
              <div className="flex flex-wrap items-center gap-2 text-slate-300">
                {['IDEA', 'INTELLIGENCE', 'PRODUCT', 'DISTRIBUTION', 'CUSTOMER', 'USAGE', 'OUTCOME', 'REVENUE', 'CREATOR EARNINGS', 'GROWTH'].map((step, idx) => (
                  <React.Fragment key={idx}>
                    <span className="px-2 py-1 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold">
                      {step}
                    </span>
                    {idx < 9 && <span className="text-slate-600">→</span>}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 8: V14 PRODUCTION CERTIFICATION */}
      {activeSubTab === 'certification' && certification && (
        <div className="space-y-5">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-950 via-slate-900 to-emerald-950 border border-indigo-500/40 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <span className="text-xs font-mono text-indigo-300 uppercase font-bold tracking-wider">
                  {certification.reportTitle}
                </span>
                <h2 className="text-xl font-bold text-white mt-1">CATALYX V14 GIE Master Certification</h2>
                <div className="text-xs font-mono text-slate-400 mt-0.5">
                  Version: {certification.version} | Certified: {certification.certifiedAt.slice(0, 19)}Z
                </div>
              </div>
              <div className="px-4 py-2 rounded-xl bg-indigo-500/20 border border-indigo-400/50 text-indigo-300 font-mono font-bold text-sm text-center">
                {certification.overallVerdict}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800 font-mono text-xs">
              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                <div className="text-slate-400 text-[10px]">Active Products</div>
                <div className="text-base font-bold text-indigo-300">{certification.economyAuditSummary.activeIntelligenceProducts} Verified</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                <div className="text-slate-400 text-[10px]">Economic Agents</div>
                <div className="text-base font-bold text-emerald-300">{certification.economyAuditSummary.governedEconomicAgents} Governed</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                <div className="text-slate-400 text-[10px]">Avg CVI ROI</div>
                <div className="text-base font-bold text-cyan-300">{certification.economyAuditSummary.catalyxValueIndexAvgRoiMultiple}x Multiple</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                <div className="text-slate-400 text-[10px]">Ledger Integrity</div>
                <div className="text-base font-bold text-purple-300">100% Double-Entry</div>
              </div>
            </div>
          </div>

          {/* Pillars List */}
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Audited Architectural Pillars (100% Verified)
            </h3>
            <div className="divide-y divide-slate-800">
              {certification.pillarsAudited.map((p, idx) => (
                <div key={idx} className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
                  <div className="space-y-0.5">
                    <div className="font-semibold text-white">{p.pillar}</div>
                    <div className="text-slate-400 text-[11px]">{p.evidence}</div>
                  </div>
                  <div className="flex items-center gap-3 font-mono">
                    <span className="text-emerald-400 font-bold">{p.score}</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                      {p.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Forward Compatibility V15+ */}
          <div className="p-5 rounded-xl bg-slate-900 border border-indigo-500/30 space-y-3">
            <div className="flex items-center gap-2 text-indigo-400">
              <Sparkles className="w-4 h-4" />
              <h3 className="text-sm font-bold text-white">Forward Compatibility Prepared for V15+ (Non-Finality)</h3>
            </div>
            <p className="text-xs text-slate-300">
              CATALYX V14 is engineered with open integration hooks for future planetary coordination and autonomous corporate jurisdictions.
            </p>
            {certification.extensionPointsPrepared.map(ext => (
              <div key={ext.targetVersion} className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs space-y-1">
                <div className="text-emerald-400 font-bold">{ext.targetVersion}: {ext.codename}</div>
                <div className="text-slate-400 text-[11px]">{ext.architecturalReadiness}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Publish Intelligence Product Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-indigo-500/40 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-indigo-400" />
                Publish Intelligence Product (UIPE)
              </h3>
              <button onClick={() => setShowPublishModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handlePublishProduct} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Product Title</label>
                <input
                  type="text"
                  value={pubTitle}
                  onChange={e => setPubTitle(e.target.value)}
                  placeholder="e.g. Autonomous Multimodal Port Delay Predictor & Risk Hedger"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:border-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Product Category</label>
                  <select
                    value={pubCategory}
                    onChange={e => setPubCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="WORKFLOW_AUTOMATION">Workflow Automation</option>
                    <option value="AGENT_TEAM">Agent Team</option>
                    <option value="AI_AGENT">AI Agent</option>
                    <option value="DOCUMENT_INTELLIGENCE">Document Intelligence</option>
                    <option value="INDUSTRY_SOLUTION">Industry Solution</option>
                    <option value="INTELLIGENCE_API">Intelligence API</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Pricing Model</label>
                  <select
                    value={pubPricingModel}
                    onChange={e => setPubPricingModel(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="OUTCOME_BASED">Outcome-Based</option>
                    <option value="USAGE_BASED">Usage-Based</option>
                    <option value="SUBSCRIPTION">Subscription</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Unit Price (USD)</label>
                <input
                  type="number"
                  value={pubPrice}
                  onChange={e => setPubPrice(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:border-indigo-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Description & Verification Covenant</label>
                <textarea
                  rows={3}
                  value={pubDescription}
                  onChange={e => setPubDescription(e.target.value)}
                  placeholder="Describe capabilities, telemetry proof hooks, and compliance standards..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPublishModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer shadow-lg"
                >
                  Seal Provenance & Publish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
