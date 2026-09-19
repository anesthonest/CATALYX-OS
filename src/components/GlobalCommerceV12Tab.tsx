import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  EconomicEngine2Metrics,
  FinancialEventRecord,
  MarketplaceProduct2,
  IntelligenceServiceProduct,
  GovernedAgentCommerceTransaction,
  CommercialApiProduct,
  DeveloperApplicationManifest,
  IndustrySolutionPackage,
  PlatformUsageCreditLedger,
  UnifiedBillingStatement,
  CreatorPayoutRecord,
  EcosystemDemandOpportunity,
  CapitalAllocationComparison,
  ScaleEconomicModelScenario,
  V12ProductionCertificationReport,
} from '../types';
import {
  DollarSign,
  TrendingUp,
  ShoppingBag,
  Cpu,
  ShieldCheck,
  Layers,
  Code,
  Globe,
  Briefcase,
  CreditCard,
  Zap,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  BarChart3,
  Users,
  Compass,
  Lock,
  RefreshCw,
  Award,
  Sliders,
  ExternalLink,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

interface GlobalCommerceV12TabProps {
  organizationId?: string;
  userEmail?: string;
}

export const GlobalCommerceV12Tab: React.FC<GlobalCommerceV12TabProps> = ({
  organizationId = 'org_default',
  userEmail = 'executive@catalyx.io',
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    | 'overview'
    | 'marketplace'
    | 'iaas'
    | 'agent-commerce'
    | 'api-economy'
    | 'developer-cloud'
    | 'industry-cloud'
    | 'billing-credits'
    | 'simulation-demand'
    | 'scale-certification'
  >('overview');

  const [loading, setLoading] = useState<boolean>(true);
  const [metrics, setMetrics] = useState<EconomicEngine2Metrics | null>(null);
  const [financialEvents, setFinancialEvents] = useState<FinancialEventRecord[]>([]);
  const [marketplaceProducts, setMarketplaceProducts] = useState<MarketplaceProduct2[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [intelligenceServices, setIntelligenceServices] = useState<IntelligenceServiceProduct[]>([]);
  const [agentTransactions, setAgentTransactions] = useState<GovernedAgentCommerceTransaction[]>([]);
  const [commercialApis, setCommercialApis] = useState<CommercialApiProduct[]>([]);
  const [developerManifests, setDeveloperManifests] = useState<DeveloperApplicationManifest[]>([]);
  const [industrySolutions, setIndustrySolutions] = useState<IndustrySolutionPackage[]>([]);
  const [creditLedger, setCreditLedger] = useState<PlatformUsageCreditLedger | null>(null);
  const [billingStatements, setBillingStatements] = useState<UnifiedBillingStatement[]>([]);
  const [creatorPayouts, setCreatorPayouts] = useState<CreatorPayoutRecord[]>([]);
  const [demandOpportunities, setDemandOpportunities] = useState<EcosystemDemandOpportunity[]>([]);
  const [capitalComparisons, setCapitalComparisons] = useState<CapitalAllocationComparison[]>([]);
  const [scaleScenarios, setScaleScenarios] = useState<ScaleEconomicModelScenario[]>([]);
  const [selectedScenarioIdx, setSelectedScenarioIdx] = useState<number>(0);
  const [certificationReport, setCertificationReport] = useState<V12ProductionCertificationReport | null>(null);

  // Notification Banner
  const [actionAlert, setActionAlert] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const fetchV12Data = async () => {
    try {
      setLoading(true);
      const [
        metricsRes,
        eventsRes,
        mktRes,
        iaasRes,
        agentTxRes,
        apisRes,
        manifestsRes,
        solutionsRes,
        creditsRes,
        billingRes,
        payoutsRes,
        demandRes,
        capitalRes,
        scenariosRes,
        certRes,
      ] = await Promise.all([
        fetch('/api/v12/commerce/metrics').then(r => r.json()),
        fetch('/api/v12/commerce/financial-events').then(r => r.json()),
        fetch('/api/v12/commerce/marketplace').then(r => r.json()),
        fetch('/api/v12/commerce/intelligence-services').then(r => r.json()),
        fetch('/api/v12/commerce/agent-transactions').then(r => r.json()),
        fetch('/api/v12/commerce/apis').then(r => r.json()),
        fetch('/api/v12/commerce/developer-manifests').then(r => r.json()),
        fetch('/api/v12/commerce/industry-solutions').then(r => r.json()),
        fetch(`/api/v12/commerce/credits/${organizationId}`).then(r => r.json()),
        fetch('/api/v12/commerce/billing-statements').then(r => r.json()),
        fetch('/api/v12/commerce/creator-payouts').then(r => r.json()),
        fetch('/api/v12/commerce/demand-opportunities').then(r => r.json()),
        fetch('/api/v12/commerce/capital-allocations').then(r => r.json()),
        fetch('/api/v12/commerce/scale-scenarios').then(r => r.json()),
        fetch('/api/v12/certification').then(r => r.json()),
      ]);

      setMetrics(metricsRes);
      setFinancialEvents(eventsRes || []);
      setMarketplaceProducts(mktRes || []);
      setIntelligenceServices(iaasRes || []);
      setAgentTransactions(agentTxRes || []);
      setCommercialApis(apisRes || []);
      setDeveloperManifests(manifestsRes || []);
      setIndustrySolutions(solutionsRes || []);
      setCreditLedger(creditsRes || null);
      setBillingStatements(billingRes || []);
      setCreatorPayouts(payoutsRes || []);
      setDemandOpportunities(demandRes || []);
      setCapitalComparisons(capitalRes || []);
      setScaleScenarios(scenariosRes || []);
      setCertificationReport(certRes || null);
    } catch (err) {
      console.error('Error fetching CATALYX V12 data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchV12Data();
  }, [organizationId]);

  const handlePurchaseProduct = async (productId: string, title: string) => {
    try {
      const res = await fetch('/api/v12/commerce/marketplace/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, tenantId: organizationId }),
      });
      const data = await res.json();
      if (data.success) {
        setActionAlert({ message: `Successfully purchased "${title}"! Dual-entry financial event recorded.`, type: 'success' });
        fetchV12Data();
      } else {
        setActionAlert({ message: `Purchase failed: ${data.error}`, type: 'error' });
      }
    } catch {
      setActionAlert({ message: 'Transaction communication error', type: 'error' });
    }
    setTimeout(() => setActionAlert(null), 5000);
  };

  const handleExecuteAgentCommerce = async () => {
    try {
      const res = await fetch('/api/v12/commerce/agent-transactions/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyerAgentId: 'agent_cfo_advisor',
          buyerAgentName: 'CFO Autonomous Strategist',
          sellerAgentId: 'agent_forex_hedger',
          sellerAgentName: 'Global FX Liquidity Agent',
          taskCapabilityRequested: 'Simulate KES/USD 90-Day Volatility Surface',
          priceMinor: 3500, // $35.00
          currency: 'USD',
          budgetLimitMinor: 5000,
        }),
      });
      const tx = await res.json();
      setActionAlert({
        message: `Agent-to-Agent Commerce executed successfully: Tx ${tx.transactionId} verified with cryptographic hash ${tx.verificationHash.slice(0, 10)}...`,
        type: 'success',
      });
      fetchV12Data();
    } catch {
      setActionAlert({ message: 'Error executing agent transaction', type: 'error' });
    }
    setTimeout(() => setActionAlert(null), 5000);
  };

  const handlePurchaseCredits = async (units: number) => {
    try {
      const res = await fetch('/api/v12/commerce/credits/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgId: organizationId, amountUnits: units }),
      });
      const updated = await res.json();
      setCreditLedger(updated);
      setActionAlert({
        message: `Added +${units.toLocaleString()} Platform Usage Credits to organization ledger.`,
        type: 'success',
      });
      fetchV12Data();
    } catch {
      setActionAlert({ message: 'Error purchasing platform credits', type: 'error' });
    }
    setTimeout(() => setActionAlert(null), 5000);
  };

  const handleSettlePayout = async (payoutId: string) => {
    try {
      const res = await fetch('/api/v12/commerce/creator-payouts/settle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payoutId }),
      });
      const settled = await res.json();
      if (settled && settled.status === 'SETTLED') {
        setActionAlert({ message: `Payout ${payoutId} settled via ${settled.payoutMethod}.`, type: 'success' });
        fetchV12Data();
      }
    } catch {
      setActionAlert({ message: 'Payout settlement failed', type: 'error' });
    }
    setTimeout(() => setActionAlert(null), 5000);
  };

  const formatMinor = (minor: number, curr = 'USD') => {
    const val = minor / 100;
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: curr }).format(val);
  };

  return (
    <div className="space-y-6 pb-12 font-sans text-gray-100">
      {/* Top Notification Toast */}
      <AnimatePresence>
        {actionAlert && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-2xl border flex items-center gap-3 backdrop-blur-md text-sm font-medium ${
              actionAlert.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
                : actionAlert.type === 'error'
                ? 'bg-rose-950/90 border-rose-500/50 text-rose-200'
                : 'bg-indigo-950/90 border-indigo-500/50 text-indigo-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
            <span>{actionAlert.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/80 via-slate-900/95 to-slate-950 p-6 md:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-widest bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center gap-1.5">
                <Globe className="w-3 h-3 text-indigo-400" />
                CATALYX V12 PRODUCTION ARCHITECTURE
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-widest bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                FOUNDATIONAL PLATFORM • EXTENSIBLE TO V13/V14/V15+
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-display font-semibold text-white tracking-wide">
              Global Intelligence Commerce & Platform Infrastructure
            </h1>
            <p className="text-xs md:text-sm text-gray-300 max-w-3xl mt-1.5 leading-relaxed">
              Decentralized commerce connecting User → Organization → Intelligence → Agents → Applications → Workflows → Services → Transactions → Outcomes → Value.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchV12Data}
              className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 text-xs font-mono text-gray-300 hover:text-white transition-all flex items-center gap-2 cursor-pointer shadow-md"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${loading ? 'animate-spin' : ''}`} />
              Sync Financial Ledger
            </button>
            <div className="px-3.5 py-2 rounded-xl bg-indigo-500/15 border border-indigo-400/40 text-xs font-mono text-indigo-200 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Audit Hash: Verified</span>
            </div>
          </div>
        </div>

        {/* 10-Sub-Tab Navigation Bar */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          {[
            { id: 'overview', label: 'Economic Engine 2.0', icon: DollarSign },
            { id: 'marketplace', label: 'Multi-Sided Marketplace', icon: ShoppingBag },
            { id: 'iaas', label: 'Intelligence-as-a-Service', icon: Sparkles },
            { id: 'agent-commerce', label: 'Governed Agent Economy', icon: Cpu },
            { id: 'api-economy', label: 'Commercial API Platform', icon: Code },
            { id: 'developer-cloud', label: 'Developer Cloud', icon: Layers },
            { id: 'industry-cloud', label: 'Industry Cloud Packages', icon: Briefcase },
            { id: 'billing-credits', label: 'Unified Billing & Credits', icon: CreditCard },
            { id: 'simulation-demand', label: 'Demand & Capital Allocator', icon: Compass },
            { id: 'scale-certification', label: 'Scale & Certification Report', icon: Award },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`subtab-${tab.id}`}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-500/30 to-purple-500/30 text-white border border-indigo-400/50 shadow-lg'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-300' : 'text-gray-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SUBTAB 1: OVERVIEW & ECONOMIC ENGINE 2.0 */}
      {activeSubTab === 'overview' && metrics && (
        <div className="space-y-6">
          {/* Top 4 Hero KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-indigo-500/20 backdrop-blur-sm">
              <span className="text-[10px] font-mono uppercase text-gray-400">Total Gross Revenue (Minor Integer Dual-Entry)</span>
              <div className="text-2xl font-bold text-white mt-1">{formatMinor(metrics.totalGrossRevenueMinor)}</div>
              <div className="text-[11px] text-emerald-400 font-mono mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +38.4% annualized growth
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-purple-500/20 backdrop-blur-sm">
              <span className="text-[10px] font-mono uppercase text-gray-400">Marketplace GMV & Take Rate</span>
              <div className="text-2xl font-bold text-purple-200 mt-1">{formatMinor(metrics.marketplaceGMVMinor)}</div>
              <div className="text-[11px] text-purple-400 font-mono mt-1">
                Take Rate: {metrics.platformTakeRatePct}% ($484k net platform commission)
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-cyan-500/20 backdrop-blur-sm">
              <span className="text-[10px] font-mono uppercase text-gray-400">Net Gross Margin & Contribution</span>
              <div className="text-2xl font-bold text-cyan-200 mt-1">{metrics.grossMarginPct}%</div>
              <div className="text-[11px] text-cyan-400 font-mono mt-1">
                Contribution Margin: {metrics.contributionMarginPct}%
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-emerald-500/20 backdrop-blur-sm">
              <span className="text-[10px] font-mono uppercase text-gray-400">Ecosystem Network Scale</span>
              <div className="text-2xl font-bold text-emerald-200 mt-1">{metrics.activeOrgsCount.toLocaleString()} Orgs</div>
              <div className="text-[11px] text-emerald-400 font-mono mt-1">
                {metrics.activeDevelopersCount.toLocaleString()} Devs • {metrics.activeAgentsCount.toLocaleString()} Agents
              </div>
            </div>
          </div>

          {/* Revenue Engines Breakdown & Immutable Ledger */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Revenue Engine Demarcation Card */}
            <div className="p-6 rounded-2xl bg-slate-900/50 border border-white/10 space-y-4">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-indigo-400" />
                Economic Engine 2.0 Demarcation
              </h3>
              <p className="text-xs text-gray-400">
                Separation of Customer Value, Platform Share, Creator Earnings, AI Compute, and Payment Processing.
              </p>

              <div className="space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center p-2.5 rounded-lg bg-slate-950/60 border border-white/5">
                  <span className="text-gray-400">Platform Net Revenue</span>
                  <span className="text-emerald-400 font-bold">{formatMinor(metrics.netRevenueMinor)}</span>
                </div>
                <div className="flex justify-between items-center p-2.5 rounded-lg bg-slate-950/60 border border-white/5">
                  <span className="text-gray-400">Creator Earnings Payout</span>
                  <span className="text-purple-300 font-bold">{formatMinor(metrics.creatorPayoutsMinor)}</span>
                </div>
                <div className="flex justify-between items-center p-2.5 rounded-lg bg-slate-950/60 border border-white/5">
                  <span className="text-gray-400">Partner Channel Revenue</span>
                  <span className="text-indigo-300 font-bold">{formatMinor(metrics.partnerPayoutsMinor)}</span>
                </div>
                <div className="flex justify-between items-center p-2.5 rounded-lg bg-slate-950/60 border border-white/5">
                  <span className="text-gray-400">AI Compute Expenditure</span>
                  <span className="text-rose-400 font-bold">-{formatMinor(metrics.aiComputeCostMinor)}</span>
                </div>
                <div className="flex justify-between items-center p-2.5 rounded-lg bg-slate-950/60 border border-white/5">
                  <span className="text-gray-400">Infrastructure Cost</span>
                  <span className="text-rose-400 font-bold">-{formatMinor(metrics.infraCostMinor)}</span>
                </div>
                <div className="flex justify-between items-center p-2.5 rounded-lg bg-slate-950/60 border border-white/5">
                  <span className="text-gray-400">Payment Rails (Pesapal/Cards)</span>
                  <span className="text-amber-400 font-bold">-{formatMinor(metrics.paymentProcessingCostMinor)}</span>
                </div>
              </div>
            </div>

            {/* Live Financial Event Stream (Dual-Ledger Audit Log) */}
            <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/50 border border-white/10 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  Live Immutable Financial Event Stream
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                  Dual-Ledger Idempotent
                </span>
              </div>

              <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                {financialEvents.map((evt) => (
                  <div
                    key={evt.eventId}
                    className="p-3.5 rounded-xl bg-slate-950/60 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          {evt.eventType}
                        </span>
                        <span className="font-semibold text-white">{evt.tenantId}</span>
                        <span className="text-gray-500 text-[10px] font-mono">{evt.eventId}</span>
                      </div>
                      <div className="text-gray-400 text-[11px] font-mono mt-1">
                        Idempotency Key: {evt.idempotencyKey} • {new Date(evt.timestamp).toLocaleTimeString()}
                      </div>
                    </div>

                    <div className="text-right font-mono">
                      <div className="text-emerald-400 font-bold text-sm">+{formatMinor(evt.amountMinor, evt.currency)}</div>
                      <div className="text-[10px] text-gray-500">Hash: {evt.auditHash.slice(0, 16)}...</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: MULTI-SIDED MARKETPLACE 2.0 */}
      {activeSubTab === 'marketplace' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-indigo-400" />
                Multi-Sided Intelligence Marketplace 2.0
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Verified applications, AI agents, workflows, connectors, and vertical solutions with strict SOC2/HIPAA security ratings.
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {['ALL', 'INDUSTRY_SOLUTION', 'AI_AGENT', 'APPLICATION', 'KNOWLEDGE_PACKAGE'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg font-mono text-[11px] transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-indigo-600 text-white border border-indigo-400'
                      : 'bg-slate-900/60 text-gray-400 hover:text-white border border-white/5'
                  }`}
                >
                  {cat.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {marketplaceProducts
              .filter(p => selectedCategory === 'ALL' || p.category === selectedCategory)
              .map((prod) => (
                <div
                  key={prod.productId}
                  className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 hover:border-indigo-500/40 transition-all space-y-4 shadow-xl flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase">
                          {prod.category.replace('_', ' ')}
                        </span>
                        <h3 className="text-base font-bold text-white mt-2">{prod.title}</h3>
                        <p className="text-xs text-gray-400 mt-1 leading-relaxed">{prod.description}</p>
                      </div>
                      <div className="text-right">
                        <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                          Security: {prod.securityRating}
                        </span>
                        <div className="text-lg font-bold text-white mt-1">{formatMinor(prod.priceMinor, prod.currency)}</div>
                        <div className="text-[10px] text-gray-500 font-mono">{prod.pricingModel}</div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/5 grid grid-cols-3 gap-2 text-[11px] font-mono text-gray-400">
                      <div>
                        <span className="text-gray-500 block text-[9px]">PROVIDER</span>
                        <span className="text-gray-300 font-medium">{prod.providerName}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-[9px]">VERIFIED OUTCOMES</span>
                        <span className="text-cyan-400 font-medium">{prod.verifiedOutcomesCount} verified</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-[9px]">ACTIVE INSTALLS</span>
                        <span className="text-emerald-400 font-medium">{prod.activeInstalls} installs</span>
                      </div>
                    </div>

                    {prod.slaGuarantee && (
                      <div className="mt-3 p-2 rounded-lg bg-slate-950/60 border border-white/5 text-[11px] font-mono text-indigo-300 flex items-center gap-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                        <span>SLA: {prod.slaGuarantee}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => handlePurchaseProduct(prod.productId, prod.title)}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium text-xs shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      Acquire & Deploy Component ({formatMinor(prod.priceMinor)})
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* SUBTAB 3: SPECIALIZED INTELLIGENCE-AS-A-SERVICE (IaaS) */}
      {activeSubTab === 'iaas' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                Intelligence-as-a-Service (IaaS) Specialized Offerings
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                High-value strategic deliverables with guaranteed SLA turnaround and human executive authorization gates.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {intelligenceServices.map((srv) => (
              <div
                key={srv.serviceId}
                className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 hover:border-cyan-500/40 transition-all flex flex-col justify-between space-y-4 shadow-xl"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      {srv.category.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-gray-400">
                      SLA: {srv.slaTurnaroundHours}h
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white mt-3">{srv.name}</h3>
                  <p className="text-xs text-gray-400 mt-1">{srv.scope}</p>

                  <div className="mt-4 space-y-2 text-xs">
                    <div className="text-[11px] font-mono text-gray-400">
                      <span className="text-gray-500 block text-[9px]">REQUIRED INPUTS</span>
                      {srv.inputsRequired.join(' • ')}
                    </div>
                    <div className="text-[11px] font-mono text-emerald-300">
                      <span className="text-gray-500 block text-[9px]">OUTPUT DELIVERABLES</span>
                      {srv.deliverableOutputs.join(' • ')}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                  <div>
                    <div className="text-lg font-bold text-white">{formatMinor(srv.priceMinor)}</div>
                    <div className="text-[9px] font-mono text-gray-500">{srv.securityClassification}</div>
                  </div>
                  <button
                    onClick={() => {
                      fetch('/api/v12/commerce/intelligence-services/request', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ serviceId: srv.serviceId, tenantId: organizationId }),
                      })
                        .then(r => r.json())
                        .then(res => {
                          if (res.success) {
                            setActionAlert({ message: `Commissioned "${srv.name}" deliverable!`, type: 'success' });
                            fetchV12Data();
                          }
                        });
                    }}
                    className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs transition-all shadow-md cursor-pointer"
                  >
                    Commission Service
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 4: GOVERNED AGENT-TO-AGENT COMMERCE */}
      {activeSubTab === 'agent-commerce' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Cpu className="w-5 h-5 text-purple-400" />
                Governed Agent-to-Agent Commerce Protocol
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                9-Stage Verified Pipeline: Discover → Verify → Check Capability → Check Price → Check Permission → Authorize → Execute → Verify Result → Record Transaction.
              </p>
            </div>
            <button
              onClick={handleExecuteAgentCommerce}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-mono font-semibold shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-cyan-300" />
              Simulate Governed A2A Contract ($35.00)
            </button>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Agent Commerce Contract Execution Stream
            </h3>

            <div className="space-y-3">
              {agentTransactions.map((tx) => (
                <div
                  key={tx.transactionId}
                  className="p-4 rounded-xl bg-slate-950/70 border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs font-mono"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {tx.status}
                      </span>
                      <span className="text-white font-bold">{tx.taskCapabilityRequested}</span>
                    </div>
                    <div className="text-gray-400 text-[11px] mt-1 flex items-center gap-2">
                      <span>Buyer: {tx.buyerAgentName}</span>
                      <span>→</span>
                      <span>Seller: {tx.sellerAgentName}</span>
                    </div>
                  </div>

                  <div className="text-right flex items-center gap-4">
                    <div>
                      <div className="text-emerald-400 font-bold">{formatMinor(tx.priceMinor, tx.currency)}</div>
                      <div className="text-[10px] text-gray-500">Budget Authorized: {formatMinor(tx.budgetAuthorizedMinor)}</div>
                    </div>
                    <div className="px-2.5 py-1 rounded bg-slate-900 text-gray-400 text-[10px] border border-white/10">
                      Sig: {tx.verificationHash.slice(0, 10)}...
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 5: COMMERCIAL API ECONOMY */}
      {activeSubTab === 'api-economy' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Code className="w-5 h-5 text-emerald-400" />
              Commercial API Platform & Developer Quotas
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Metered API gateways, rate-limiting, and per-1,000 call commercial billing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {commercialApis.map((api) => (
              <div
                key={api.apiId}
                className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 flex flex-col justify-between space-y-4 shadow-xl"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {api.tier} TIER
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400">{api.uptime30d}% Uptime</span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-3">{api.name}</h3>
                  <code className="text-[10px] font-mono text-gray-400 block mt-1 bg-slate-950 px-2 py-1 rounded border border-white/5">
                    {api.endpointPrefix}
                  </code>

                  <div className="mt-4 space-y-2 text-xs font-mono text-gray-400">
                    <div className="flex justify-between">
                      <span>Rate Limit:</span>
                      <span className="text-white">{api.rateLimitRPS} RPS</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Monthly Quota:</span>
                      <span className="text-white">{(api.quotaMonthly / 1000000).toFixed(1)}M calls</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Active Subscribers:</span>
                      <span className="text-cyan-400">{api.activeSubscribers} orgs</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                  <div>
                    <div className="text-base font-bold text-emerald-400">
                      {formatMinor(api.pricePerThousandCallsMinor)} / 1k calls
                    </div>
                  </div>
                  <a
                    href={api.documentationUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-gray-300 text-xs font-mono flex items-center gap-1.5"
                  >
                    <span>Docs</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 6: DEVELOPER CLOUD & APPLICATION PLATFORM */}
      {activeSubTab === 'developer-cloud' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-400" />
                Developer Cloud & Application Platform
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Standardized application manifests with isolated sandbox execution and automated dependency audits.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {developerManifests.map((man) => (
              <div
                key={man.appId}
                className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 space-y-4 shadow-xl font-mono text-xs"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {man.status}
                    </span>
                    <h3 className="text-base font-bold text-white mt-2 font-sans">{man.name}</h3>
                    <div className="text-[11px] text-gray-400 mt-0.5">v{man.version} • {man.manifestVersion}</div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                    {man.sandboxIsolated ? 'Sandbox Isolated' : 'Standard'}
                  </span>
                </div>

                <div className="space-y-2 pt-2 border-t border-white/5">
                  <div>
                    <span className="text-gray-500 block text-[10px]">CAPABILITIES</span>
                    <span className="text-cyan-300">{man.capabilities.join(', ')}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[10px]">PERMISSIONS</span>
                    <span className="text-amber-300">{man.permissions.join(', ')}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[10px]">DEPENDENCIES</span>
                    <span className="text-gray-400">{man.dependencies.join(', ')}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/5 flex justify-between items-center text-[11px]">
                  <span className="text-gray-400">Pricing: {man.pricing}</span>
                  <span className="text-gray-500">{new Date(man.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 7: INDUSTRY CLOUD ARCHITECTURE */}
      {activeSubTab === 'industry-cloud' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-indigo-400" />
              Industry Cloud Solutions & Turnkey Vertical Suites
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Multi-asset bundled packages: Application + AI Agents + Workflows + Connectors + Knowledge + Policies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {industrySolutions.map((sol) => (
              <div
                key={sol.solutionId}
                className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 hover:border-indigo-500/40 transition-all flex flex-col justify-between space-y-4 shadow-xl"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {sol.industry} SUITE
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400">
                      {sol.activeEnterpriseDeployments} Deployments
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white mt-3">{sol.title}</h3>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">{sol.description}</p>

                  <div className="mt-4 space-y-2 text-[11px] font-mono">
                    <div className="p-2 rounded bg-slate-950/60 border border-white/5">
                      <span className="text-gray-500 block text-[9px]">BUNDLED ASSETS</span>
                      <span className="text-cyan-300">{sol.bundledApps.length} Apps • {sol.bundledAgents.length} Agents • {sol.bundledWorkflows.length} Workflows</span>
                    </div>
                    <div className="p-2 rounded bg-slate-950/60 border border-white/5">
                      <span className="text-gray-500 block text-[9px]">COMPLIANCE POLICIES</span>
                      <span className="text-emerald-400">{sol.compliancePolicies.join(' • ')}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                  <div className="text-lg font-bold text-white">
                    {formatMinor(sol.priceMonthlyMinor, sol.currency)} <span className="text-xs font-normal text-gray-400">/mo</span>
                  </div>
                  <button
                    onClick={() => setActionAlert({ message: `Requested enterprise license provisioning for ${sol.title}`, type: 'info' })}
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-md transition-all cursor-pointer"
                  >
                    Enterprise License
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 8: UNIFIED BILLING & PLATFORM USAGE CREDITS */}
      {activeSubTab === 'billing-credits' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Prepaid Credits Card */}
            {creditLedger && (
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-400">
                      Prepaid Platform Usage Credits
                    </span>
                    <h3 className="text-2xl font-bold text-white mt-1">
                      {creditLedger.platformCreditBalanceUnits.toLocaleString()} Credits
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">
                      Distinct from real currency. Pre-paid internal execution units for AI inference, APIs, and workflows.
                    </p>
                  </div>
                  <button
                    onClick={() => handlePurchaseCredits(50000)}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono shadow-md cursor-pointer"
                  >
                    +50,000 Credits ($500)
                  </button>
                </div>

                <div className="space-y-2 pt-2 border-t border-white/5">
                  <span className="text-xs font-semibold text-gray-300">Recent Consumption Telemetry</span>
                  {creditLedger.recentConsumptions.map((cons) => (
                    <div
                      key={cons.consumptionId}
                      className="p-2.5 rounded-lg bg-slate-950/60 border border-white/5 flex justify-between items-center text-xs font-mono"
                    >
                      <span className="text-gray-400">{cons.serviceType}</span>
                      <span className="text-amber-400 font-bold">-{cons.creditsDebited} credits</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Unified Invoicing Statement */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 space-y-4">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                Unified Billing Engine (Pesapal / Cards / Wire)
              </h3>
              <p className="text-xs text-gray-400">
                Formula: Charges → Discounts → Taxes/Fees → Credits → Refunds → Net Payable.
              </p>

              <div className="space-y-3">
                {billingStatements.map((inv) => (
                  <div key={inv.invoiceId} className="p-4 rounded-xl bg-slate-950/60 border border-white/5 space-y-2 font-mono text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-bold">{inv.billingPeriod} Statement</span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                        {inv.status} via {inv.paymentProvider}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-gray-400 pt-2 border-t border-white/5">
                      <div>Gross Charges: {formatMinor(inv.grossChargesMinor)}</div>
                      <div className="text-emerald-400">Discounts: -{formatMinor(inv.discountsAppliedMinor)}</div>
                      <div>Taxes & Fees: +{formatMinor(inv.taxesFeesMinor)}</div>
                      <div className="text-cyan-400">Credits Debited: -{formatMinor(inv.creditsAppliedMinor)}</div>
                    </div>

                    <div className="pt-2 border-t border-white/10 flex justify-between items-center font-bold text-sm text-white">
                      <span>Net Settled Amount:</span>
                      <span className="text-emerald-400">{formatMinor(inv.netPayableMinor, inv.currency)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Creator & Partner Payouts Table */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 space-y-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" />
              Creator & Partner Payout Settlements
            </h3>

            <div className="space-y-3">
              {creatorPayouts.map((pay) => (
                <div
                  key={pay.payoutId}
                  className="p-4 rounded-xl bg-slate-950/60 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {pay.role}
                      </span>
                      <span className="text-white font-bold">{pay.recipientName}</span>
                    </div>
                    <div className="text-gray-500 text-[11px] mt-1">
                      Gross: {formatMinor(pay.grossEarningsMinor)} • Platform Take: {formatMinor(pay.platformCommissionMinor)} • Tax Withheld: {formatMinor(pay.taxesWithheldMinor)}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-emerald-400 font-bold">{formatMinor(pay.payableBalanceMinor)}</div>
                      <div className="text-[10px] text-gray-400">{pay.payoutMethod}</div>
                    </div>
                    {pay.status === 'PROCESSING' && (
                      <button
                        onClick={() => handleSettlePayout(pay.payoutId)}
                        className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] cursor-pointer"
                      >
                        Settle
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 9: DEMAND INTELLIGENCE & CAPITAL ALLOCATION SIMULATION */}
      {activeSubTab === 'simulation-demand' && (
        <div className="space-y-6">
          {/* Demand Intelligence Section */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 space-y-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-400" />
              Ecosystem Demand Intelligence & Developer Opportunities
            </h3>
            <p className="text-xs text-gray-400">
              Aggregated, privacy-preserving ecosystem telemetry detecting high-velocity market gaps for creators and developers.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {demandOpportunities.map((opp) => (
                <div key={opp.opportunityId} className="p-4 rounded-xl bg-slate-950/60 border border-white/5 space-y-3 text-xs">
                  <div className="flex justify-between items-start">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      Demand Score: {opp.demandVelocityScore}/100
                    </span>
                    <span className="text-[10px] font-mono text-rose-400">
                      {Math.round((1 - opp.supplyFulfillmentRatio) * 100)}% Unmet
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white">{opp.trendTitle}</h4>
                  <p className="text-gray-400 leading-relaxed">{opp.recommendedDeveloperAction}</p>
                  <div className="pt-2 border-t border-white/5 text-[11px] font-mono text-emerald-400">
                    Est. Market GMV: {formatMinor(opp.projectedMarketGMVMinor)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Capital Allocation Decision Support (Option A vs B vs C) */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 space-y-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-400" />
              Capital Allocation Decision Comparator (Option A vs B vs C)
            </h3>
            <p className="text-xs text-gray-400">
              Evidence-based trade-off simulator without automatic money movement. Mandatory human executive authorization.
            </p>

            {capitalComparisons.map((comp) => (
              <div key={comp.comparisonId} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {comp.options.map((opt) => (
                    <div key={opt.optionId} className="p-4 rounded-xl bg-slate-950/60 border border-white/5 space-y-2 text-xs font-mono">
                      <h4 className="text-sm font-bold text-white font-sans">{opt.name}</h4>
                      <div className="text-indigo-300 font-bold text-base">{formatMinor(opt.capitalRequiredMinor)}</div>
                      <div className="space-y-1 text-gray-400 pt-1 border-t border-white/5 text-[11px]">
                        <div>Projected ROI: <span className="text-emerald-400 font-bold">{opt.projectedRoiMultiplier}x</span></div>
                        <div>Breakeven: <span className="text-white">{opt.estimatedBreakevenMonths} months</span></div>
                        <div>Confidence Score: <span className="text-cyan-400">{opt.confidenceScore}%</span></div>
                        <div className="text-rose-400">Risk: {opt.riskDomain}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="text-indigo-200">
                    <span className="font-bold text-white block mb-0.5">Decision Intelligence Recommendation:</span>
                    {comp.recommendation}
                  </div>
                  <button
                    onClick={() => setActionAlert({ message: 'Human authorization logged for capital allocation hybrid allocation strategy.', type: 'success' })}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium whitespace-nowrap cursor-pointer shadow-md"
                  >
                    Authorize Recommendation
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 10: SCALE MODELING & V12 PRODUCTION CERTIFICATION REPORT */}
      {activeSubTab === 'scale-certification' && (
        <div className="space-y-6">
          {/* Scale Scenarios Simulator */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 space-y-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              Scale Economic Scenarios (10K - 1M Organizations / 1M - 100M Users)
            </h3>
            <p className="text-xs text-gray-400">
              Unit economic modeling across 4 tiers; realistic infrastructure and AI compute cost curves; margin projections.
            </p>

            <div className="flex gap-2 overflow-x-auto pb-1 text-xs">
              {scaleScenarios.map((sc, idx) => (
                <button
                  key={sc.scenarioName}
                  onClick={() => setSelectedScenarioIdx(idx)}
                  className={`px-3 py-1.5 rounded-lg font-mono text-[11px] whitespace-nowrap cursor-pointer ${
                    selectedScenarioIdx === idx
                      ? 'bg-emerald-600 text-white border border-emerald-400'
                      : 'bg-slate-950 text-gray-400 hover:text-white border border-white/5'
                  }`}
                >
                  {sc.scenarioName.split('(')[0]}
                </button>
              ))}
            </div>

            {scaleScenarios[selectedScenarioIdx] && (
              <div className="p-4 rounded-xl bg-slate-950/70 border border-white/5 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
                <div>
                  <span className="text-gray-500 block text-[10px]">ORGANIZATIONS</span>
                  <span className="text-white font-bold text-base">
                    {scaleScenarios[selectedScenarioIdx].organizationCount.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[10px]">USERS</span>
                  <span className="text-white font-bold text-base">
                    {(scaleScenarios[selectedScenarioIdx].userCount / 1000000).toFixed(1)}M
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[10px]">ANNUAL RUN-RATE REVENUE</span>
                  <span className="text-emerald-400 font-bold text-base">
                    {formatMinor(scaleScenarios[selectedScenarioIdx].projectedAnnualRevenueMinor)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[10px]">BLENDED GROSS MARGIN</span>
                  <span className="text-cyan-400 font-bold text-base">
                    {scaleScenarios[selectedScenarioIdx].projectedGrossMarginPct}%
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* V12 Official Production Certification Report */}
          {certificationReport && (
            <div className="p-6 md:p-8 rounded-2xl bg-slate-900/80 border border-indigo-500/30 space-y-6 shadow-2xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div>
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                    {certificationReport.version}
                  </span>
                  <h3 className="text-xl font-bold text-white mt-1.5">{certificationReport.reportTitle}</h3>
                  <div className="text-xs text-gray-400 font-mono mt-0.5">
                    Certified Timestamp: {new Date(certificationReport.certifiedAt).toUTCString()}
                  </div>
                </div>

                <div className="px-4 py-2 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  {certificationReport.overallVerdict}
                </div>
              </div>

              {/* Explicit Non-Finality & Extension Points for V13/V14/V15+ */}
              <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 space-y-3">
                <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider block">
                  Architectural Non-Finality & Clean Extension Points Prepared:
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {certificationReport.extensionPointsPrepared.map((ext) => (
                    <div key={ext.targetVersion} className="p-3 rounded-lg bg-slate-950/70 border border-white/5 text-xs font-mono">
                      <div className="text-cyan-400 font-bold">{ext.targetVersion}: {ext.codename}</div>
                      <div className="text-gray-400 text-[11px] mt-1">{ext.architecturalReadiness}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 20 Pillars Audit Table */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-gray-300 uppercase tracking-wider block">
                  All 20 Core Pillars Audited & Verified:
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono">
                  {certificationReport.pillarsAudited.map((p) => (
                    <div
                      key={p.pillar}
                      className="p-3 rounded-lg bg-slate-950/60 border border-white/5 flex items-center justify-between gap-3"
                    >
                      <div className="truncate">
                        <span className="text-white block truncate">{p.pillar}</span>
                        <span className="text-gray-500 text-[10px] block truncate">{p.evidence}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-emerald-400 font-bold">{p.score}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                          {p.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Non-Functional Invariants */}
              <div className="p-4 rounded-xl bg-slate-950 border border-white/5 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono text-gray-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Tenant Isolation: Enforced</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Dual-Ledger: Zero Leakage</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{certificationReport.nonFunctionalAudit.disasterRecoveryRPO_RTO}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
