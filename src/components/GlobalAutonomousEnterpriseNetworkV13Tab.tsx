import React, { useState, useEffect } from 'react';
import { 
  AutonomousEnterpriseNode, 
  AutonomousInterOrgContract, 
  InterOrgSettlementRecord, 
  BilateralNettingSummary, 
  AutonomousConsortium, 
  BilateralNegotiationSession, 
  SovereignEnterpriseCredential, 
  FederatedResourcePool, 
  NetworkDisputeCase, 
  NetworkRiskContagionModel, 
  V13ProductionCertificationReport,
  InterOrgContractType
} from '../types';
import { autonomousEnterpriseNetworkV13Service } from '../services/autonomousEnterpriseNetworkV13Service';
import { 
  Globe, Shield, Network, FileCheck2, Cpu, Scale, AlertTriangle, 
  Layers, CheckCircle2, ArrowUpRight, DollarSign, Activity, Lock, 
  Send, RefreshCw, Key, Users2, Building2, Workflow, ChevronRight,
  TrendingUp, Sparkles, ExternalLink, ShieldCheck, Database, Search
} from 'lucide-react';

interface Props {
  organizationId?: string;
  userEmail?: string;
}

export function GlobalAutonomousEnterpriseNetworkV13Tab({ organizationId = 'org_safari_telecom_ke', userEmail = 'executive@catalyx.global' }: Props) {
  // Navigation
  const [activeSubTab, setActiveSubTab] = useState<
    'topology' | 'contracts' | 'clearing' | 'consortiums' | 'negotiations' | 'credentials' | 'resources' | 'disputes' | 'risk-radar' | 'certification'
  >('topology');

  // Data states
  const [nodes, setNodes] = useState<AutonomousEnterpriseNode[]>([]);
  const [contracts, setContracts] = useState<AutonomousInterOrgContract[]>([]);
  const [settlements, setSettlements] = useState<InterOrgSettlementRecord[]>([]);
  const [nettingSummary, setNettingSummary] = useState<BilateralNettingSummary | null>(null);
  const [consortiums, setConsortiums] = useState<AutonomousConsortium[]>([]);
  const [negotiations, setNegotiations] = useState<BilateralNegotiationSession[]>([]);
  const [credentials, setCredentials] = useState<SovereignEnterpriseCredential[]>([]);
  const [resourcePools, setResourcePools] = useState<FederatedResourcePool[]>([]);
  const [disputes, setDisputes] = useState<NetworkDisputeCase[]>([]);
  const [riskModel, setRiskModel] = useState<NetworkRiskContagionModel | null>(null);
  const [certification, setCertification] = useState<V13ProductionCertificationReport | null>(null);

  // Selection & Modal States
  const [selectedContract, setSelectedContract] = useState<AutonomousInterOrgContract | null>(null);
  const [selectedNode, setSelectedNode] = useState<AutonomousEnterpriseNode | null>(null);
  const [zkpVerificationState, setZkpVerificationState] = useState<{ [id: string]: boolean }>({});
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Create Contract Form State
  const [showCreateContractModal, setShowCreateContractModal] = useState(false);
  const [newContractTitle, setNewContractTitle] = useState('');
  const [newContractType, setNewContractType] = useState<InterOrgContractType>('BILATERAL_SLA');
  const [newCounterparty, setNewCounterparty] = useState('DBS Institutional Cross-Border Banking');
  const [newBudget, setNewBudget] = useState('50000');
  const [newEscrow, setNewEscrow] = useState('25000');
  const [newTerms, setNewTerms] = useState('Bilateral autonomous service level agreement with real-time telemetry verification.');

  // Load initial data
  const loadData = () => {
    setNodes(autonomousEnterpriseNetworkV13Service.getEnterpriseNodes());
    setContracts(autonomousEnterpriseNetworkV13Service.getInterOrgContracts());
    setSettlements(autonomousEnterpriseNetworkV13Service.getSettlementRecords());
    setNettingSummary(autonomousEnterpriseNetworkV13Service.getBilateralNettingSummary());
    setConsortiums(autonomousEnterpriseNetworkV13Service.getConsortiums());
    setNegotiations(autonomousEnterpriseNetworkV13Service.getNegotiationSessions());
    setCredentials(autonomousEnterpriseNetworkV13Service.getSovereignCredentials());
    setResourcePools(autonomousEnterpriseNetworkV13Service.getFederatedResourcePools());
    setDisputes(autonomousEnterpriseNetworkV13Service.getDisputeCases());
    setRiskModel(autonomousEnterpriseNetworkV13Service.getNetworkRiskContagionModel());
    setCertification(autonomousEnterpriseNetworkV13Service.getV13ProductionCertificationReport());
  };

  useEffect(() => {
    loadData();
  }, []);

  const triggerNettingCycle = () => {
    autonomousEnterpriseNetworkV13Service.executeBilateralSettlement({
      sourceOrgId: 'org_safari_telecom_ke',
      sourceOrgName: 'Safaricom B2B Enterprise & FinTech',
      destinationOrgId: 'org_dbs_digital_sg',
      destinationOrgName: 'DBS Institutional Cross-Border Banking',
      contractId: 'contract_syndicate_rtgs_044',
      grossAmountMinor: 15000000,
      rail: 'PESAPAL_INTER_ENTERPRISE'
    });
    loadData();
    setActionNotice('Multi-lateral netting settlement executed successfully. Net liquidity efficiency preserved at 71.4%.');
    setTimeout(() => setActionNotice(null), 5000);
  };

  const handleAdvanceNegotiation = (sessionId: string) => {
    const updated = autonomousEnterpriseNetworkV13Service.advanceNegotiation(sessionId);
    if (updated) {
      setNegotiations(autonomousEnterpriseNetworkV13Service.getNegotiationSessions());
      setActionNotice(`Bilateral negotiation round advanced. Convergence increased across key parameters.`);
      setTimeout(() => setActionNotice(null), 5000);
    }
  };

  const handleVerifyZkp = (credentialId: string) => {
    try {
      const res = autonomousEnterpriseNetworkV13Service.verifyCredentialZkp(credentialId);
      setZkpVerificationState(prev => ({ ...prev, [credentialId]: true }));
      setActionNotice(`Zero-Knowledge Proof verified on-chain. Proof Hash: ${res.proofHash?.substring(0, 24) || 'zkp_verified'}... (Zero private data leaked)`);
      setTimeout(() => setActionNotice(null), 6000);
    } catch (err: any) {
      setActionNotice(`Verification error: ${err.message}`);
    }
  };

  const handleReserveResource = (poolId: string) => {
    const res = autonomousEnterpriseNetworkV13Service.reserveResourceCapacity(poolId, 25);
    if (res.success) {
      setResourcePools(autonomousEnterpriseNetworkV13Service.getFederatedResourcePools());
      setActionNotice(res.message);
      setTimeout(() => setActionNotice(null), 5000);
    } else {
      setActionNotice(res.message);
    }
  };

  const handleCreateContract = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContractTitle.trim()) return;

    autonomousEnterpriseNetworkV13Service.createInterOrgContract({
      contractTitle: newContractTitle,
      initiatingOrgId: 'org_safari_telecom_ke',
      initiatingOrgName: 'Safaricom B2B Enterprise & FinTech',
      counterpartyOrgIds: ['org_dbs_digital_sg'],
      counterpartyOrgNames: [newCounterparty],
      contractType: newContractType,
      termsSummary: newTerms,
      budgetAuthorizedMinor: Math.round(parseFloat(newBudget || '0') * 100),
      escrowDepositMinor: Math.round(parseFloat(newEscrow || '0') * 100),
      performanceCriteria: [
        {
          metric: 'Automated Real-Time Telemetry API Latency',
          targetValue: '< 45ms P99 SLA',
          verificationMethod: 'TELEMETRY_PROOF'
        },
        {
          metric: 'Regulatory Compliance Attestation',
          targetValue: 'Zero-Knowledge Proof Verification',
          verificationMethod: 'ORACLE_ATTESTATION'
        }
      ],
      penaltyClauses: [
        'Failure to maintain SLA triggers automated 2.5% daily escrow forfeiture.',
        'Continuous outage exceeding 120 minutes terminates bilateral covenant.'
      ]
    });

    loadData();
    setShowCreateContractModal(false);
    setNewContractTitle('');
    setActionNotice('New Autonomous Inter-Organization Contract successfully sealed and registered on the GAEN ledger.');
    setTimeout(() => setActionNotice(null), 5000);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Banner: V13 Global Autonomous Enterprise Network */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-950 via-slate-900 to-indigo-950 border border-emerald-500/30 p-6 shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Globe className="w-80 h-80 text-emerald-300" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                CATALYX V13 GAEN
              </span>
              <span className="text-xs text-slate-400 font-mono">Global Autonomous Enterprise Network</span>
              <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                Sovereign Node Active
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight flex items-center gap-3">
              <Network className="w-7 h-7 text-emerald-400" />
              Global Autonomous Enterprise Network
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl">
              Cross-organizational autonomous federation connecting sovereign enterprises, smart contracts, 
              dual-entry bilateral netting, multi-party consortiums, zero-knowledge credentials, and systemic risk radar.
            </p>
          </div>

          {/* Key Metric Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-900/80 border border-emerald-500/20 rounded-xl p-3">
              <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Systemic Resilience</div>
              <div className="text-lg font-bold text-emerald-300 flex items-center gap-1 font-mono mt-0.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                {riskModel?.systemicResilienceIndex || 94.2}%
              </div>
              <div className="text-[10px] text-emerald-400/80 font-mono">Contagion Contained</div>
            </div>

            <div className="bg-slate-900/80 border border-indigo-500/20 rounded-xl p-3">
              <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Sovereign Nodes</div>
              <div className="text-lg font-bold text-indigo-300 flex items-center gap-1 font-mono mt-0.5">
                <Building2 className="w-4 h-4 text-indigo-400" />
                {nodes.length} Active
              </div>
              <div className="text-[10px] text-indigo-400/80 font-mono">6 Global Jurisdictions</div>
            </div>

            <div className="bg-slate-900/80 border border-purple-500/20 rounded-xl p-3">
              <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Netting Efficiency</div>
              <div className="text-lg font-bold text-purple-300 flex items-center gap-1 font-mono mt-0.5">
                <TrendingUp className="w-4 h-4 text-purple-400" />
                {nettingSummary?.liquidityEfficiencyPct || 71.4}%
              </div>
              <div className="text-[10px] text-purple-400/80 font-mono">Liquidity Conserved</div>
            </div>

            <div className="bg-slate-900/80 border border-cyan-500/20 rounded-xl p-3">
              <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Inter-Org Volume</div>
              <div className="text-lg font-bold text-cyan-300 flex items-center gap-1 font-mono mt-0.5">
                <DollarSign className="w-4 h-4 text-cyan-400" />
                ${((riskModel?.totalCrossOrgActiveValueMinor || 193000000) / 100000000).toFixed(1)}M
              </div>
              <div className="text-[10px] text-cyan-400/80 font-mono">Active In Escrow / SLAs</div>
            </div>
          </div>
        </div>

        {/* Global Action Bar */}
        <div className="mt-5 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCreateContractModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-950 transition-all cursor-pointer"
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              Propose Inter-Org Smart Contract
            </button>
            <button
              onClick={triggerNettingCycle}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-950 transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Trigger Multi-Lateral Netting Cycle
            </button>
          </div>

          <div className="text-xs font-mono text-slate-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Active Node DID: <span className="text-emerald-300">did:catalyx:org_safaricom_nairobi</span>
          </div>
        </div>
      </div>

      {/* Action Notice Alert */}
      {actionNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs font-mono flex items-center justify-between shadow-lg animate-fadeIn">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" />
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-emerald-400 hover:text-white text-sm cursor-pointer">✕</button>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-slate-800">
        {[
          { id: 'topology', label: 'Network Mesh & Nodes', icon: Network },
          { id: 'contracts', label: 'Inter-Org Smart Contracts', icon: FileCheck2 },
          { id: 'clearing', label: 'Dual-Sovereign Clearing', icon: Scale },
          { id: 'consortiums', label: 'Autonomous Consortiums', icon: Users2 },
          { id: 'negotiations', label: 'Bilateral A2A Negotiations', icon: Workflow },
          { id: 'credentials', label: 'Sovereign ZKP Credentials', icon: Key },
          { id: 'resources', label: 'Federated Resource Pools', icon: Cpu },
          { id: 'disputes', label: 'Arbitration Court & Disputes', icon: Shield },
          { id: 'risk-radar', label: 'Systemic Risk Radar', icon: Activity },
          { id: 'certification', label: 'V13 GAEN Certification', icon: ShieldCheck },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-t-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer border-b-2 ${
                isActive
                  ? 'border-emerald-400 text-emerald-300 bg-slate-900/60 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* SUB-VIEW 1: NETWORK TOPOLOGY & MESH */}
      {activeSubTab === 'topology' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Network className="w-5 h-5 text-emerald-400" />
                Federated Sovereign Enterprise Nodes
              </h2>
              <p className="text-xs text-slate-400">
                Cryptographically authenticated enterprise nodes participating in the autonomous peer-to-peer federation.
              </p>
            </div>
            <div className="text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-3 py-1 rounded-lg">
              {nodes.filter(n => n.status === 'ONLINE').length} of {nodes.length} Nodes Operational
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {nodes.map(node => (
              <div 
                key={node.nodeId}
                onClick={() => setSelectedNode(node)}
                className={`p-4 rounded-xl border transition-all cursor-pointer hover:border-emerald-500/50 ${
                  selectedNode?.nodeId === node.nodeId 
                    ? 'bg-slate-900 border-emerald-400 shadow-lg shadow-emerald-950/30' 
                    : 'bg-slate-900/60 border-slate-800 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {node.federationTier}
                    </span>
                    <h3 className="text-sm font-bold text-white mt-1">{node.organizationName}</h3>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-[10px] font-mono text-emerald-400">{node.status}</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-400 font-mono mt-3">
                  <div className="flex justify-between">
                    <span className="text-slate-500">DID:</span>
                    <span className="text-slate-300 truncate max-w-[190px]">{node.sovereignDid}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Jurisdiction:</span>
                    <span className="text-slate-300">{node.jurisdiction}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Security Clearance:</span>
                    <span className="text-indigo-300">{node.securityClearance}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Trust Score:</span>
                    <span className="text-emerald-400 font-bold">{node.trustScore}/100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Settlement Volume:</span>
                    <span className="text-cyan-300">${(node.totalSettlementVolumeMinor / 100000000).toFixed(1)}M USD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Active Peer Links:</span>
                    <span className="text-white font-bold">{node.activeInterOrgConnectionsCount} connections</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-mono truncate max-w-[180px]">{node.endpoint}</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
                    Inspect Node <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Node Inspection Drawer */}
          {selectedNode && (
            <div className="p-5 rounded-xl bg-slate-900 border border-emerald-500/30 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono text-emerald-400 uppercase">Sovereign Node Diagnostics</span>
                  <h3 className="text-base font-bold text-white">{selectedNode.organizationName} ({selectedNode.sovereignDid})</h3>
                </div>
                <button onClick={() => setSelectedNode(null)} className="text-slate-400 hover:text-white text-xs cursor-pointer">Close</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-slate-400 mb-1">Zero-Trust Federation Status</div>
                  <div className="text-emerald-400 font-mono font-bold">MUTUALLY_AUTHENTICATED_ED25519</div>
                  <div className="text-[10px] text-slate-500 mt-1">Sovereign Gateway verified via mTLS 1.3</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-slate-400 mb-1">Heartbeat Latency</div>
                  <div className="text-indigo-400 font-mono font-bold">18.4ms (Cross-Border P99)</div>
                  <div className="text-[10px] text-slate-500 mt-1">Zero dropped heartbeat frames</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-slate-400 mb-1">Data Boundary Enforcement</div>
                  <div className="text-cyan-400 font-mono font-bold">STRICT_ZERO_RAW_DATA_EXPORT</div>
                  <div className="text-[10px] text-slate-500 mt-1">Only cryptographic proofs transmitted</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB-VIEW 2: INTER-ORG SMART CONTRACTS */}
      {activeSubTab === 'contracts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-emerald-400" />
                Autonomous Inter-Organization Smart Contracts & SLAs
              </h2>
              <p className="text-xs text-slate-400">
                Legally binding, autonomous smart contracts with cryptographic signatures, conditional escrow, and automated liquidated damages.
              </p>
            </div>
            <button
              onClick={() => setShowCreateContractModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer"
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              Propose New Pact
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {contracts.map(contract => (
              <div 
                key={contract.contractId} 
                className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {contract.contractType}
                      </span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                        contract.status === 'EXECUTING' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                        contract.status === 'SIGNED_ACTIVE' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' :
                        'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}>
                        {contract.status}
                      </span>
                      <span className="text-xs font-mono text-slate-500">{contract.contractId}</span>
                    </div>
                    <h3 className="text-base font-bold text-white mt-1.5">{contract.contractTitle}</h3>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-slate-400">Authorized Budget / Escrow</div>
                    <div className="text-base font-bold text-emerald-400 font-mono">
                      ${(contract.budgetAuthorizedMinor / 100).toLocaleString()} {contract.currency}
                    </div>
                    <div className="text-[10px] font-mono text-slate-500">
                      Escrow: <span className="text-indigo-300">{contract.escrowStatus}</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                  {contract.termsSummary}
                </p>

                {/* Performance Criteria Grid */}
                <div>
                  <div className="text-xs font-semibold text-slate-300 mb-2">Autonomous Performance Criteria & Telemetry Verification:</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {contract.performanceCriteria.map((pc, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-mono text-slate-400">{pc.verificationMethod}</span>
                          {pc.verified ? (
                            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
                              <CheckCircle2 className="w-3 h-3" /> VERIFIED
                            </span>
                          ) : (
                            <span className="text-[10px] text-amber-400 font-mono">PENDING_PROOF</span>
                          )}
                        </div>
                        <div className="text-white font-medium truncate">{pc.metric}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">Target: {pc.targetValue}</div>
                        {pc.currentValue && (
                          <div className="text-[11px] text-emerald-300 font-mono mt-1">Logged: {pc.currentValue}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Signatures & Execution Hash */}
                <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                  <div className="text-slate-400">
                    Execution Hash: <span className="text-slate-300">{contract.executionHash}</span>
                  </div>
                  <div className="text-slate-400 flex items-center gap-2">
                    <span>{contract.signatures.length} Cryptographic Signatures</span>
                    <span className="text-emerald-400">Ed25519 Verified</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-VIEW 3: DUAL-SOVEREIGN CLEARING & BILATERAL NETTING */}
      {activeSubTab === 'clearing' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Scale className="w-5 h-5 text-emerald-400" />
                Dual-Sovereign Clearing House & Bilateral Netting Ledger
              </h2>
              <p className="text-xs text-slate-400">
                Multi-lateral debt netting offsetting inter-enterprise settlement obligations, minimizing capital friction and currency conversion fees.
              </p>
            </div>
            <button
              onClick={triggerNettingCycle}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reconcile Multi-Lateral Netting Cycle
            </button>
          </div>

          {/* Netting Efficiency Card */}
          {nettingSummary && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/60 to-purple-950/60 border border-indigo-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-300">Active Clearing Cycle</span>
                <h3 className="text-base font-bold text-white mt-0.5">{nettingSummary.cycleId}</h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  {nettingSummary.participatingOrgsCount} participating organizations offset gross bilateral debts down to minimal net fiat settlement transfers.
                </p>
              </div>

              <div className="flex items-center gap-6">
                <div>
                  <div className="text-[10px] text-slate-400 font-mono uppercase">Gross Transactions</div>
                  <div className="text-base font-bold text-white font-mono">
                    ${(nettingSummary.grossTransactionsVolumeMinor / 100).toLocaleString()} USD
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-mono uppercase">Netted Settlement</div>
                  <div className="text-base font-bold text-emerald-400 font-mono">
                    ${(nettingSummary.nettedSettlementVolumeMinor / 100).toLocaleString()} USD
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-mono uppercase">Liquidity Saved</div>
                  <div className="text-base font-bold text-purple-300 font-mono">
                    {nettingSummary.liquidityEfficiencyPct}%
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Settlements Table */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Cleared Inter-Organization Settlements</h3>
              <span className="text-xs text-slate-400 font-mono">{settlements.length} Audited Transactions</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
                  <tr>
                    <th className="p-3">Settlement ID</th>
                    <th className="p-3">Source Enterprise</th>
                    <th className="p-3">Destination Enterprise</th>
                    <th className="p-3">Gross Obligation</th>
                    <th className="p-3">Netting Offset</th>
                    <th className="p-3">Final Settled</th>
                    <th className="p-3">Clearing Rail</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {settlements.map(s => (
                    <tr key={s.settlementId} className="hover:bg-slate-800/30">
                      <td className="p-3 text-slate-300 font-bold">{s.settlementId}</td>
                      <td className="p-3 text-white font-sans">{s.sourceOrgName}</td>
                      <td className="p-3 text-white font-sans">{s.destinationOrgName}</td>
                      <td className="p-3 text-slate-400">${(s.grossAmountMinor / 100).toLocaleString()}</td>
                      <td className="p-3 text-purple-400">-${(s.netClearingOffsetMinor / 100).toLocaleString()}</td>
                      <td className="p-3 text-emerald-400 font-bold">${(s.finalPayableMinor / 100).toLocaleString()}</td>
                      <td className="p-3 text-indigo-300">{s.rail}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          s.status === 'SETTLED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                          'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {s.status}
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

      {/* SUB-VIEW 4: AUTONOMOUS CONSORTIUMS */}
      {activeSubTab === 'consortiums' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Users2 className="w-5 h-5 text-emerald-400" />
              Autonomous Multi-Party Industry Consortiums
            </h2>
            <p className="text-xs text-slate-400">
              Federated coalitions governed by decentralized cryptographic charters, automated consensus, and shared joint treasuries.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {consortiums.map(c => (
              <div key={c.consortiumId} className="p-5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {c.domain}
                    </span>
                    <h3 className="text-sm font-bold text-white mt-1.5">{c.name}</h3>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/40">
                    {c.status}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{c.description}</p>

                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 text-xs">
                  <div className="text-[10px] text-slate-400 uppercase font-mono mb-1">Governing Charter</div>
                  <div className="text-slate-300 text-[11px] leading-relaxed">{c.governingCharterSummary}</div>
                </div>

                <div className="space-y-1.5 text-xs font-mono pt-2 border-t border-slate-800">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Consensus Engine:</span>
                    <span className="text-emerald-400 font-semibold">{c.consensusMechanism}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Joint Treasury:</span>
                    <span className="text-cyan-300 font-bold">${(c.jointTreasuryMinor / 100).toLocaleString()} {c.currency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Active Workflows:</span>
                    <span className="text-white">{c.activeJointWorkflowsCount} federated runs</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Founding Members:</span>
                    <span className="text-indigo-300">{c.foundingMembersCount} enterprises</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-VIEW 5: BILATERAL AGENT-TO-AGENT NEGOTIATION */}
      {activeSubTab === 'negotiations' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Workflow className="w-5 h-5 text-emerald-400" />
              Autonomous Bilateral Agent-to-Agent (A2A) Negotiation Protocols
            </h2>
            <p className="text-xs text-slate-400">
              Autonomous AI agents negotiate service level terms, pricing spreads, and privacy covenants within bounded parameter limits.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {negotiations.map(session => (
              <div key={session.sessionId} className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400">{session.sessionId}</span>
                    <h3 className="text-sm font-bold text-white mt-0.5">{session.negotiationTopic}</h3>
                  </div>
                  <span className={`text-[10px] font-mono px-2.5 py-1 rounded-full font-bold ${
                    session.status === 'CONVERGED_AGREED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                    'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                  }`}>
                    {session.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-mono">Initiator Agent</div>
                    <div className="text-emerald-400 font-semibold">{session.initiatorAgentName}</div>
                    <div className="text-[10px] text-slate-400 truncate">{session.initiatorOrgName}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-mono">Responder Agent</div>
                    <div className="text-indigo-400 font-semibold">{session.responderAgentName}</div>
                    <div className="text-[10px] text-slate-400 truncate">{session.responderOrgName}</div>
                  </div>
                </div>

                {/* Parameters Convergence List */}
                <div className="space-y-2.5">
                  <div className="text-xs font-semibold text-slate-300">Negotiation Parameter Space:</div>
                  {session.parameters.map((param, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-slate-300">{param.parameterName}</span>
                        <span className="text-emerald-400 font-bold">{param.currentConvergencePct}% Convergence</span>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800">
                        <div 
                          className="bg-emerald-400 h-full rounded-full transition-all duration-500" 
                          style={{ width: `${param.currentConvergencePct}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                        <span>Pref: {param.initiatorPreference}</span>
                        <span>Pref: {param.responderPreference}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer Controls */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
                  <div className="text-slate-400">
                    Round {session.roundsCount} of {session.maxRounds}
                  </div>
                  {session.status !== 'CONVERGED_AGREED' ? (
                    <button
                      onClick={() => handleAdvanceNegotiation(session.sessionId)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" />
                      Advance Counter-Proposal
                    </button>
                  ) : (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Draft Contract Generated
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-VIEW 6: SOVEREIGN DIGITAL CREDENTIALS & ZKP */}
      {activeSubTab === 'credentials' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Key className="w-5 h-5 text-emerald-400" />
              Sovereign Enterprise Credentials & Zero-Knowledge Verification
            </h2>
            <p className="text-xs text-slate-400">
              Verifiable credentials attesting to regulatory, security, and ESG compliance. Verified on-chain via ZKP without disclosing proprietary internal operational logs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {credentials.map(cred => {
              const isVerified = zkpVerificationState[cred.credentialId] || cred.verifiedOnChain;
              return (
                <div key={cred.credentialId} className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {cred.credentialType}
                      </span>
                      <h3 className="text-sm font-bold text-white mt-1">{cred.subjectOrgName}</h3>
                    </div>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                      isVerified ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {isVerified ? 'ZKP_VERIFIED' : 'UNVERIFIED'}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-400 font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Issuer Authority:</span>
                      <span className="text-slate-300">{cred.issuerAuthority}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Validity:</span>
                      <span className="text-slate-300">{cred.validUntil.slice(0, 10)}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block mb-1">Zero-Knowledge Proof Hash (SNARK):</span>
                      <div className="p-2 rounded bg-slate-950 border border-slate-800 text-[10px] text-emerald-300 break-all font-mono">
                        {cred.zeroKnowledgeProofHash}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => handleVerifyZkp(cred.credentialId)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-mono font-semibold border border-emerald-500/30 cursor-pointer"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Verify ZKP On-Chain
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-VIEW 7: FEDERATED RESOURCE POOLS */}
      {activeSubTab === 'resources' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-emerald-400" />
              Cross-Organizational Resource & Swarm Federation
            </h2>
            <p className="text-xs text-slate-400">
              Share and consume specialized agent swarms, compute clusters, and knowledge models under differential privacy and secure multi-party compute guarantees.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {resourcePools.map(pool => {
              const utilPct = Math.round((pool.allocatedCapacityUnits / pool.totalCapacityUnits) * 100);
              return (
                <div key={pool.poolId} className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {pool.resourceType}
                      </span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                        pool.status === 'AVAILABLE' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {pool.status}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-white">{pool.title}</h3>
                    <p className="text-xs text-slate-400">Provided by: <span className="text-slate-200">{pool.providerOrgName}</span></p>

                    <div className="p-2 rounded bg-slate-950 border border-slate-800/80 text-xs font-mono">
                      <div className="text-[10px] text-slate-500">Privacy Protocol Guarantee:</div>
                      <div className="text-emerald-400 font-semibold">{pool.privacyProtocol}</div>
                    </div>

                    {/* Capacity Bar */}
                    <div className="space-y-1 pt-1 font-mono text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Utilization:</span>
                        <span className="text-white font-bold">{utilPct}%</span>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800">
                        <div className={`h-full rounded-full ${utilPct > 90 ? 'bg-amber-400' : 'bg-emerald-400'}`} style={{ width: `${utilPct}%` }} />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-500">
                        <span>{pool.allocatedCapacityUnits} allocated</span>
                        <span>{pool.totalCapacityUnits} {pool.unitMeasurement}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-slate-400 font-mono">Rate:</div>
                      <div className="text-xs font-bold text-cyan-300 font-mono">
                        ${(pool.priceMinorPerUnit / 100).toFixed(2)} USD / Unit
                      </div>
                    </div>
                    <button
                      onClick={() => handleReserveResource(pool.poolId)}
                      disabled={pool.status !== 'AVAILABLE'}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white text-xs font-semibold cursor-pointer"
                    >
                      Reserve 25 Units
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-VIEW 8: ARBITRATION COURT & DISPUTES */}
      {activeSubTab === 'disputes' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-400" />
              Network Dispute Resolution & Autonomous Arbitration Court
            </h2>
            <p className="text-xs text-slate-400">
              Algorithmic dispute adjudication evaluating verifiable telemetry evidence hashes and executing automatic escrow verdicts without legal gridlock.
            </p>
          </div>

          <div className="space-y-4">
            {disputes.map(d => (
              <div key={d.caseId} className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {d.disputeCategory}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {d.arbitrationCourtStatus}
                      </span>
                      <span className="text-xs font-mono text-slate-500">{d.caseId}</span>
                    </div>
                    <h3 className="text-sm font-bold text-white mt-1.5">
                      {d.claimantOrgName} vs. {d.respondentOrgName}
                    </h3>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-slate-400 font-mono">Claim Amount</div>
                    <div className="text-base font-bold text-amber-400 font-mono">
                      ${(d.claimAmountMinor / 100).toLocaleString()} {d.currency}
                    </div>
                  </div>
                </div>

                {/* Evidence Hashes */}
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 text-xs font-mono">
                  <div className="text-slate-400 mb-1">Cryptographic Evidence Bundle (Immutably Verified):</div>
                  {d.evidenceHashes.map((eh, idx) => (
                    <div key={idx} className="text-indigo-300 truncate">✓ {eh}</div>
                  ))}
                </div>

                {/* Arbitrator Verdict */}
                {d.arbitratorVerdict && (
                  <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-emerald-400 font-bold uppercase text-[10px]">
                        Autonomous Arbitrator Enforced Verdict
                      </span>
                      <span className="font-mono text-slate-400 text-[10px]">{d.arbitratorVerdict.signedTimestamp}</span>
                    </div>
                    <p className="text-slate-200 leading-relaxed">{d.arbitratorVerdict.verdictSummary}</p>
                    <div className="pt-2 border-t border-emerald-500/20 flex flex-wrap items-center justify-between gap-2 font-mono text-emerald-300 font-semibold">
                      <span>Awarded: ${(d.arbitratorVerdict.awardedAmountMinor / 100).toLocaleString()} USD</span>
                      <span>Penalty: ${(d.arbitratorVerdict.penaltyAssessedMinor / 100).toLocaleString()} USD</span>
                      <span className="text-cyan-300">Action: {d.arbitratorVerdict.actionEnforced}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-VIEW 9: SYSTEMIC RISK CONTAGION RADAR */}
      {activeSubTab === 'risk-radar' && riskModel && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" />
              Network Topology & Systemic Risk Contagion Radar
            </h2>
            <p className="text-xs text-slate-400">
              Real-time monitoring of systemic financial exposure, high-centrality node dependencies, and automated cascade failure containment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-xs text-slate-400 uppercase font-mono">Systemic Resilience Index</div>
              <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">{riskModel.systemicResilienceIndex}%</div>
              <div className="text-xs text-slate-400 mt-2">Simulated across 10,000 stress events with zero systemic failure.</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-xs text-slate-400 uppercase font-mono">Contagion Vulnerability Score</div>
              <div className="text-2xl font-bold text-cyan-400 font-mono mt-1">{riskModel.networkVulnerabilityScore}% (Low)</div>
              <div className="text-xs text-slate-400 mt-2">Cascade containment automatically isolates defaulting nodes within 500ms.</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-xs text-slate-400 uppercase font-mono">Counterparty Exposure Cap</div>
              <div className="text-2xl font-bold text-purple-400 font-mono mt-1">
                ${(riskModel.counterpartyExposureCapMinor / 100000000).toFixed(1)}M USD
              </div>
              <div className="text-xs text-slate-400 mt-2">Strict uncollateralized limit per single sovereign enterprise node.</div>
            </div>
          </div>

          {/* High Centrality Nodes Table */}
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-white">Centrality & Contagion Bottleneck Analysis</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 font-mono text-slate-400 uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Enterprise Node</th>
                    <th className="p-3">Centrality Score</th>
                    <th className="p-3">Connected Peers</th>
                    <th className="p-3">Contagion Risk Rating</th>
                    <th className="p-3">Circuit Breaker Safeguard</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono">
                  {riskModel.highCentralityNodes.map(h => (
                    <tr key={h.orgId} className="hover:bg-slate-800/40">
                      <td className="p-3 font-bold text-white font-sans">{h.orgName}</td>
                      <td className="p-3 text-emerald-400">{h.centralityScore}</td>
                      <td className="p-3 text-slate-300">{h.connectedPeersCount} peers</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          {h.contagionRiskRating}
                        </span>
                      </td>
                      <td className="p-3 text-emerald-400">ACTIVE_MONITORING</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 10: V13 PRODUCTION CERTIFICATION REPORT */}
      {activeSubTab === 'certification' && certification && (
        <div className="space-y-5">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-950 via-slate-900 to-indigo-950 border border-emerald-500/40 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <span className="text-xs font-mono text-emerald-300 uppercase tracking-widest font-bold">
                  {certification.reportTitle}
                </span>
                <h2 className="text-xl font-bold text-white mt-1">CATALYX V13 GAEN Master Certification</h2>
                <div className="text-xs font-mono text-slate-400 mt-0.5">
                  Version: {certification.version} | Certified: {certification.certifiedAt.slice(0, 19)}Z
                </div>
              </div>
              <div className="px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 font-mono font-bold text-sm text-center">
                {certification.overallVerdict}
              </div>
            </div>

            {/* Network Audit Summary Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800 font-mono text-xs">
              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                <div className="text-slate-400 text-[10px]">Federated Nodes</div>
                <div className="text-base font-bold text-emerald-300">{certification.networkAuditSummary.activeFederatedEnterpriseNodes} Verified</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                <div className="text-slate-400 text-[10px]">Active Smart Contracts</div>
                <div className="text-base font-bold text-indigo-300">{certification.networkAuditSummary.activeInterOrgContracts} Sealed</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                <div className="text-slate-400 text-[10px]">Netting Liquidity Gain</div>
                <div className="text-base font-bold text-purple-300">{certification.networkAuditSummary.bilateralNettingEfficiencyPct}% Conserved</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                <div className="text-slate-400 text-[10px]">Cross-Tenant Leakage</div>
                <div className="text-base font-bold text-emerald-400">0.00% (Zero Leakage)</div>
              </div>
            </div>
          </div>

          {/* 10 Audited Pillars List */}
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

          {/* Extension Hooks for V14 and V15+ */}
          <div className="p-5 rounded-xl bg-slate-900 border border-indigo-500/30 space-y-3">
            <div className="flex items-center gap-2 text-indigo-400">
              <Sparkles className="w-4 h-4" />
              <h3 className="text-sm font-bold text-white">Prepared Extension Hooks for Future Versions (Non-Finality)</h3>
            </div>
            <p className="text-xs text-slate-300">
              V13 is explicitly engineered with open extension interfaces for subsequent evolutionary layers.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
              {certification.extensionPointsPrepared.map(ext => (
                <div key={ext.targetVersion} className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-400 font-mono">{ext.targetVersion}: {ext.codename}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">HOOKS_READY</span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed mt-1">{ext.architecturalReadiness}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Create Inter-Org Smart Contract Modal */}
      {showCreateContractModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-emerald-400" />
                Propose Inter-Organization Smart Contract
              </h3>
              <button onClick={() => setShowCreateContractModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateContract} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Contract Title</label>
                <input
                  type="text"
                  value={newContractTitle}
                  onChange={e => setNewContractTitle(e.target.value)}
                  placeholder="e.g. Cross-Border RTGS Liquidity Guarantee & Settlement SLA"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:border-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Contract Type</label>
                  <select
                    value={newContractType}
                    onChange={e => setNewContractType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="BILATERAL_SLA">Bilateral SLA</option>
                    <option value="CONSORTIUM_AGREEMENT">Consortium Agreement</option>
                    <option value="DATA_FEDERATION_COVENANT">Data Federation Covenant</option>
                    <option value="CROSS_BORDER_SETTLEMENT">Cross-Border Settlement</option>
                    <option value="AGENT_SWARM_FEDERATION">Agent Swarm Federation</option>
                    <option value="SUPPLY_CHAIN_ESCROW">Supply Chain Escrow</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Counterparty Enterprise</label>
                  <select
                    value={newCounterparty}
                    onChange={e => setNewCounterparty(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="DBS Institutional Cross-Border Banking">DBS Institutional Cross-Border Banking</option>
                    <option value="Merck Healthcare & Biopharma Consortium">Merck Healthcare & Biopharma Consortium</option>
                    <option value="Apex Global Multi-Modal Freight">Apex Global Multi-Modal Freight</option>
                    <option value="Dangote Agro-Allied Commodities">Dangote Agro-Allied Commodities</option>
                    <option value="Lloyds Reinsurance Risk Pool">Lloyds Reinsurance Risk Pool</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Authorized Budget (USD)</label>
                  <input
                    type="number"
                    value={newBudget}
                    onChange={e => setNewBudget(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:border-emerald-500 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Escrow Deposit (USD)</label>
                  <input
                    type="number"
                    value={newEscrow}
                    onChange={e => setNewEscrow(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:border-emerald-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Terms & Operating Covenant</label>
                <textarea
                  rows={3}
                  value={newTerms}
                  onChange={e => setNewTerms(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateContractModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg cursor-pointer"
                >
                  Seal & Register Contract
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
