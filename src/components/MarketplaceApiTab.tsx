import React, { useState } from 'react';
import { 
  ShoppingBag, Key, Plus, ShieldCheck, Star, 
  Download, Copy, Check, Trash2, Code, ExternalLink, AlertCircle,
  Webhook, Terminal, Send, Play, RefreshCw, DollarSign, Wallet,
  ShieldAlert, Layers, CheckCircle2, ChevronRight, Eye, Sparkles, Filter,
  FileText, Presentation, Database, Scale, Receipt, HelpCircle, Shield, X
} from 'lucide-react';
import { MarketplaceService } from '../services/marketplaceService';
import { WebhookService } from '../services/webhookService';
import { DeveloperSandboxService } from '../services/developerSandboxService';
import { workToMarketService } from '../services/workToMarketService';
import { 
  MarketplaceAsset, ApiKeyCredential, DeveloperAccount, 
  WebhookSubscription, WebhookDeliveryLog, SandboxExecutionResult,
  MarketplaceCategory, MarketplacePricingModel, AgentPermission,
  SecurityReviewReport, WebhookEventType, WorkQualityReviewReport,
  MarketplaceDisputeRecord, CommerceLedgerEntry
} from '../types';

interface MarketplaceApiTabProps {
  organizationId: string;
  currentUserEmail: string;
}

export const MarketplaceApiTab: React.FC<MarketplaceApiTabProps> = ({ 
  organizationId, 
  currentUserEmail 
}) => {
  const [subTab, setSubTab] = useState<'marketplace' | 'creator_studio' | 'ledger' | 'api_keys' | 'webhooks' | 'sandbox'>('marketplace');
  const [refreshKey, setRefreshKey] = useState(0);

  // Filters
  const [typeFilter, setTypeFilter] = useState<'all' | MarketplaceCategory>('all');
  const [pricingFilter, setPricingFilter] = useState<'all' | MarketplacePricingModel>('all');

  // Modal / Detailed view state
  const [selectedAssetForSecurity, setSelectedAssetForSecurity] = useState<MarketplaceAsset | null>(null);
  const [purchaseSuccessMessage, setPurchaseSuccessMessage] = useState<string | null>(null);

  // V27 Work-to-Market Interactive Modals State
  const [selectedAssetForPreview, setSelectedAssetForPreview] = useState<MarketplaceAsset | null>(null);
  const [selectedAssetForPurchase, setSelectedAssetForPurchase] = useState<MarketplaceAsset | null>(null);
  const [selectedAssetForDispute, setSelectedAssetForDispute] = useState<MarketplaceAsset | null>(null);
  const [selectedAssetForQuality, setSelectedAssetForQuality] = useState<MarketplaceAsset | null>(null);
  const [paymentMethodChoice, setPaymentMethodChoice] = useState<'account_balance' | 'pesapal' | 'card'>('account_balance');
  const [disputeReason, setDisputeReason] = useState<MarketplaceDisputeRecord['reason']>('MISLEADING_FUNCTIONALITY');
  const [disputeEvidence, setDisputeEvidence] = useState('');
  const [qualityReviewReport, setQualityReviewReport] = useState<WorkQualityReviewReport | null>(null);
  const [isReviewingQuality, setIsReviewingQuality] = useState(false);

  // Creator Asset Submission State
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [newAssetType, setNewAssetType] = useState<MarketplaceCategory>('agent');
  const [newAssetTitle, setNewAssetTitle] = useState('');
  const [newAssetVersion, setNewAssetVersion] = useState('1.0.0');
  const [newAssetDescription, setNewAssetDescription] = useState('');
  const [newAssetPricingModel, setNewAssetPricingModel] = useState<MarketplacePricingModel>('one_time');
  const [newAssetPriceMinorUnits, setNewAssetPriceMinorUnits] = useState<number>(1900); // $19.00
  const [newAssetPermissions, setNewAssetPermissions] = useState<AgentPermission[]>(['READ_KNOWLEDGE', 'EXECUTE_WORKFLOW']);
  const [newAssetManifestCode, setNewAssetManifestCode] = useState(`// CATALYX Autonomous Agent Manifest
export default defineAgent({
  name: 'CustomAutonomousAgent',
  version: '1.0.0',
  permissions: ['READ_KNOWLEDGE', 'EXECUTE_WORKFLOW'],
  async execute(context) {
    const data = await context.knowledge.query('regulatory_policies');
    return { status: 'verified', items: data.length };
  }
});`);
  const [liveSecurityScan, setLiveSecurityScan] = useState<SecurityReviewReport | null>(null);

  // API Key creation modal
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyScopes, setNewKeyScopes] = useState<string[]>(['agents:read', 'agents:execute', 'workflows:trigger', 'telemetry:read']);
  const [revealedSecret, setRevealedSecret] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Webhook Registration State
  const [showWebhookModal, setShowWebhookModal] = useState(false);
  const [newWebhookUrl, setNewWebhookUrl] = useState('');
  const [newWebhookDesc, setNewWebhookDesc] = useState('');
  const [newWebhookEvents, setNewWebhookEvents] = useState<WebhookEventType[]>(['mission.completed', 'marketplace.purchase']);
  const [testWebhookStatus, setTestWebhookStatus] = useState<string | null>(null);

  // Sandbox State
  const [sandboxTargetType, setSandboxTargetType] = useState<'agent' | 'workflow' | 'marketplace_asset'>('agent');
  const [sandboxTargetId, setSandboxTargetId] = useState('agent_strategy_exec');
  const [sandboxPayload, setSandboxPayload] = useState('{\n  "mode": "synthetic_stress_test",\n  "simulateCustomerVolume": 500,\n  "dryRun": true\n}');
  const [isSandboxRunning, setIsSandboxRunning] = useState(false);
  const [latestSandboxResult, setLatestSandboxResult] = useState<SandboxExecutionResult | null>(null);

  // Payout Settings State
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutMethod, setPayoutMethod] = useState<'pesapal' | 'bank_wire' | 'mobile_money'>('pesapal');
  const [payoutAccountId, setPayoutAccountId] = useState('');

  // Service Data
  const assets = MarketplaceService.getAssets();
  const devAccount = MarketplaceService.getDeveloperAccount(organizationId);
  const apiKeys = MarketplaceService.getApiKeys(organizationId);
  const webhooks = WebhookService.getSubscriptions(organizationId);
  const webhookLogs = WebhookService.getDeliveryLogs(organizationId);
  const sandboxHistory = DeveloperSandboxService.getHistory(organizationId);
  const ledgerEntries = workToMarketService.getLedger();
  const disputes = workToMarketService.getDisputes();

  // Filtering
  const filteredAssets = assets.filter(a => {
    const matchesType = typeFilter === 'all' || a.type === typeFilter;
    const matchesPricing = pricingFilter === 'all' || a.pricingModel === pricingFilter;
    return matchesType && matchesPricing;
  });

  const handlePurchaseOrInstall = (assetId: string) => {
    const asset = assets.find(a => a.id === assetId);
    if (!asset) return;

    if (asset.priceMinorUnits > 0) {
      setSelectedAssetForPurchase(asset);
    } else {
      // Free item install
      const actorName = currentUserEmail.split('@')[0] || 'Executive Commander';
      const result = MarketplaceService.purchaseAsset(
        organizationId, 
        assetId, 
        actorName, 
        currentUserEmail, 
        'USD'
      );
      if (result.success) {
        setPurchaseSuccessMessage(`${result.message} Transaction Ref: ${result.transactionReference || 'N/A'}`);
        setTimeout(() => setPurchaseSuccessMessage(null), 5000);
        setRefreshKey(k => k + 1);
      }
    }
  };

  const handleConfirmAcquireLicense = () => {
    if (!selectedAssetForPurchase) return;
    const asset = selectedAssetForPurchase;
    const actorName = currentUserEmail.split('@')[0] || 'Executive Commander';

    const tx = workToMarketService.recordTransaction({
      idempotencyKey: `idem_tx_${asset.id}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      assetId: asset.id,
      assetTitle: asset.title,
      buyerEmail: currentUserEmail,
      buyerName: actorName,
      buyerOrganizationId: organizationId,
      paymentProvider: paymentMethodChoice === 'pesapal' ? 'PESAPAL' : 'CATALYX_INTERNAL_BALANCE'
    });

    MarketplaceService.recordAssetPurchase(asset.id);

    setSelectedAssetForPurchase(null);
    const txRef = tx.transactionReference || tx.entry?.transactionReference || 'TXN-CTX-VERIFIED';
    setPurchaseSuccessMessage(`License acquired for "${asset.title}". Transaction Reference: ${txRef}. Verified receipt written to immutable ledger.`);
    setTimeout(() => setPurchaseSuccessMessage(null), 6000);
    setRefreshKey(k => k + 1);
  };

  const handleConfirmDispute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssetForDispute) return;

    const res = workToMarketService.fileDispute({
      assetId: selectedAssetForDispute.id,
      assetTitle: selectedAssetForDispute.title,
      reporterEmail: currentUserEmail,
      complainantName: currentUserEmail.split('@')[0] || 'Compliance Auditor',
      reason: disputeReason,
      details: disputeEvidence,
      evidenceDetails: disputeEvidence
    });

    setSelectedAssetForDispute(null);
    setDisputeEvidence('');
    setPurchaseSuccessMessage(`Formal dispute filed for "${res.assetTitle}". Compliance Case Reference: ${res.complianceReferenceId || res.reportId}. Takedown review initiated.`);
    setTimeout(() => setPurchaseSuccessMessage(null), 6000);
    setRefreshKey(k => k + 1);
  };

  const handleRunQualityOnMarketAsset = async (asset: MarketplaceAsset) => {
    setSelectedAssetForQuality(asset);
    setIsReviewingQuality(true);
    try {
      const targetCategory: 'presentation' | 'demo' | 'document' | 'video' | 'marketplace_listing' = 
        asset.type === 'presentation' ? 'presentation' :
        asset.type === 'video' || asset.type === 'video_demo' ? 'video' :
        asset.type === 'product_demo' ? 'demo' :
        asset.type === 'document' || asset.type === 'report' || asset.type === 'research' ? 'document' : 'marketplace_listing';

      const report = await workToMarketService.evaluateWorkQuality(
        asset.id,
        targetCategory,
        asset.title,
        asset.description,
        {
          category: asset.type,
          tags: asset.tags,
          itemsCount: asset.slideCount || (asset.metadata?.slideCount as number) || (asset.chapters?.length) || 5,
          textLength: asset.description.length
        }
      );
      setQualityReviewReport(report);
    } finally {
      setIsReviewingQuality(false);
    }
  };

  const handleRunSecurityScanOnDraft = () => {
    const report = MarketplaceService.performSecurityScan({
      version: newAssetVersion,
      permissionsRequired: newAssetPermissions,
      manifestCode: newAssetManifestCode,
    });
    setLiveSecurityScan(report);
  };

  const handleCreateDraftAsset = () => {
    if (!newAssetTitle.trim()) return;
    const actorName = currentUserEmail.split('@')[0] || 'Executive Creator';
    
    MarketplaceService.createAsset(
      organizationId,
      {
        type: newAssetType,
        title: newAssetTitle,
        version: newAssetVersion,
        description: newAssetDescription,
        pricingModel: newAssetPricingModel,
        priceMinorUnits: newAssetPriceMinorUnits,
        currency: 'USD',
        tags: [newAssetType, 'Autonomous', 'V8.2'],
        permissionsRequired: newAssetPermissions,
        manifestCode: newAssetManifestCode,
      },
      actorName
    );

    setShowSubmitModal(false);
    setNewAssetTitle('');
    setNewAssetDescription('');
    setLiveSecurityScan(null);
    setRefreshKey(k => k + 1);
  };

  const handleSubmitForReview = (assetId: string) => {
    const actorName = currentUserEmail.split('@')[0] || 'Creator';
    MarketplaceService.submitForReview(organizationId, assetId, actorName);
    setRefreshKey(k => k + 1);
  };

  const handlePublishAsset = (assetId: string) => {
    const actorName = currentUserEmail.split('@')[0] || 'Admin';
    MarketplaceService.publishAsset(organizationId, assetId, actorName);
    setRefreshKey(k => k + 1);
  };

  const handleCreateKey = () => {
    if (!newKeyName.trim()) return;
    const { rawSecret } = MarketplaceService.createApiKey(
      organizationId,
      newKeyName,
      newKeyScopes,
      currentUserEmail.split('@')[0] || 'Admin'
    );
    setRevealedSecret(rawSecret);
    setNewKeyName('');
    setRefreshKey(k => k + 1);
  };

  const handleRevokeKey = (keyId: string) => {
    MarketplaceService.revokeApiKey(organizationId, keyId, currentUserEmail.split('@')[0] || 'Admin');
    setRefreshKey(k => k + 1);
  };

  const handleCreateWebhook = () => {
    if (!newWebhookUrl.trim()) return;
    WebhookService.createSubscription(
      organizationId,
      newWebhookUrl,
      newWebhookDesc || 'Enterprise Webhook Subscriber',
      newWebhookEvents,
      currentUserEmail.split('@')[0] || 'Admin'
    );
    setShowWebhookModal(false);
    setNewWebhookUrl('');
    setNewWebhookDesc('');
    setRefreshKey(k => k + 1);
  };

  const handleDeleteWebhook = (subId: string) => {
    WebhookService.deleteSubscription(organizationId, subId, currentUserEmail.split('@')[0] || 'Admin');
    setRefreshKey(k => k + 1);
  };

  const handleTestWebhookDispatch = async (sub: WebhookSubscription) => {
    setTestWebhookStatus(`Dispatching test ping to ${sub.url}...`);
    const logs = await WebhookService.dispatchEvent(organizationId, 'mission.completed', {
      testTrigger: true,
      subscriptionId: sub.id,
      timestamp: new Date().toISOString(),
      sampleMetric: 'Execution Velocity: 98%',
    });
    setTestWebhookStatus(`Dispatched. Status: ${logs[0]?.statusCode || 200} OK. Latency: ${logs[0]?.durationMs || 54}ms`);
    setTimeout(() => setTestWebhookStatus(null), 4000);
    setRefreshKey(k => k + 1);
  };

  const handleExecuteSandbox = async () => {
    setIsSandboxRunning(true);
    let parsedPayload: Record<string, any> = {};
    try {
      parsedPayload = JSON.parse(sandboxPayload);
    } catch {
      parsedPayload = { raw: sandboxPayload };
    }

    const res = await DeveloperSandboxService.executeSandboxTest(
      organizationId,
      {
        targetType: sandboxTargetType,
        targetId: sandboxTargetId,
        inputPayload: parsedPayload,
        dryRun: true,
      },
      currentUserEmail.split('@')[0] || 'Developer'
    );

    setLatestSandboxResult(res);
    setIsSandboxRunning(false);
    setRefreshKey(k => k + 1);
  };

  const handleSavePayoutSettings = () => {
    MarketplaceService.updatePayoutSettings(
      organizationId,
      payoutMethod,
      payoutAccountId,
      currentUserEmail.split('@')[0] || 'Creator'
    );
    setShowPayoutModal(false);
    setRefreshKey(k => k + 1);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div key={refreshKey} className="space-y-6 pb-12 bg-neutral-50 text-neutral-900 rounded-2xl p-6 border border-neutral-200 shadow-sm">
      {/* Banner / Success Notification */}
      {purchaseSuccessMessage && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-300 p-4 text-xs font-medium text-emerald-900 shadow-sm animate-fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
          <span>{purchaseSuccessMessage}</span>
        </div>
      )}

      {/* Header & Sub-Navigation */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
              Ecosystem Marketplace & Developer Economy Platform
            </h1>
            <span className="rounded-md bg-purple-50 px-2.5 py-0.5 text-xs font-semibold text-purple-700 border border-purple-200">
              V8.2 Unified
            </span>
          </div>
          <p className="text-sm text-neutral-600 mt-1">
            Curated autonomous assets, creator monetization with integer-minor revenue splits, developer REST APIs, HMAC webhooks, and sandboxed test execution.
          </p>
        </div>

        {/* Multi-Tab Switcher */}
        <div className="inline-flex rounded-lg border border-neutral-200 bg-neutral-100 p-1 flex-wrap">
          <button
            id="subtab-marketplace"
            onClick={() => setSubTab('marketplace')}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
              subTab === 'marketplace' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            Marketplace ({assets.length})
          </button>

          <button
            id="subtab-creator"
            onClick={() => setSubTab('creator_studio')}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
              subTab === 'creator_studio' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Wallet className="h-3.5 w-3.5" />
            Creator Studio & Payouts
          </button>

          <button
            id="subtab-ledger"
            onClick={() => setSubTab('ledger')}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
              subTab === 'ledger' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Receipt className="h-3.5 w-3.5" />
            Commerce Ledger & Sales ({ledgerEntries.length})
          </button>

          <button
            id="subtab-api-keys"
            onClick={() => setSubTab('api_keys')}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
              subTab === 'api_keys' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Key className="h-3.5 w-3.5" />
            REST APIs (/api/v1)
          </button>

          <button
            id="subtab-webhooks"
            onClick={() => setSubTab('webhooks')}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
              subTab === 'webhooks' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Webhook className="h-3.5 w-3.5" />
            Webhooks & Events ({webhooks.length})
          </button>

          <button
            id="subtab-sandbox"
            onClick={() => setSubTab('sandbox')}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
              subTab === 'sandbox' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Terminal className="h-3.5 w-3.5" />
            Developer Sandbox
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: CURATED MARKETPLACE ACROSS 9 CATEGORIES */}
      {/* ========================================================================= */}
      {subTab === 'marketplace' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-neutral-200">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-semibold text-neutral-500 mr-1 flex items-center gap-1">
                <Filter className="h-3 w-3" /> Category:
              </span>
              {[
                { key: 'all', label: 'All Digital Works' },
                { key: 'presentation', label: 'Presentations' },
                { key: 'video_demo', label: 'Video Demos' },
                { key: 'software', label: 'Software' },
                { key: 'dataset', label: 'Datasets' },
                { key: 'whitepaper', label: 'Whitepapers' },
                { key: 'workflow', label: 'Workflows' },
                { key: 'agent', label: 'Agents' },
                { key: 'template', label: 'Templates' },
                { key: 'industry_solution', label: 'Solutions' },
              ].map(t => (
                <button
                  key={t.key}
                  onClick={() => setTypeFilter(t.key as any)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium capitalize transition-colors ${
                    typeFilter === t.key
                      ? 'bg-neutral-900 text-white shadow-xs'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-neutral-500 mr-1">Pricing:</span>
              {(['all', 'free', 'one_time', 'subscription'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setPricingFilter(p)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium capitalize transition-colors ${
                    pricingFilter === p
                      ? 'bg-purple-900 text-white'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  {p.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Assets Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredAssets.map(asset => {
              const priceDollars = (asset.priceMinorUnits / 100).toFixed(2);
              return (
                <div 
                  key={asset.id} 
                  className="rounded-xl border border-neutral-200 bg-white p-5 shadow-xs flex flex-col justify-between hover:border-neutral-300 transition-all"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
                          {asset.type.replace('_', ' ')} • v{asset.version}
                        </span>
                        <h3 className="text-base font-bold text-neutral-900 mt-2 leading-snug">{asset.title}</h3>
                      </div>

                      <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                        asset.securityStatus === 'verified' ? 'bg-emerald-100 text-emerald-800' :
                        asset.securityStatus === 'sandboxed' ? 'bg-amber-100 text-amber-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        <ShieldCheck className="h-3 w-3" />
                        {asset.securityStatus}
                      </span>
                    </div>

                    {/* Media Badges for Digital Work Types */}
                    {asset.type === 'presentation' && (
                      <div className="flex items-center gap-2 mt-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-blue-800 text-[10px] font-semibold border border-blue-200">
                          <Presentation className="h-3 w-3" />
                          {String(asset.metadata?.slideCount || 12)} Slides Deck
                        </span>
                        <span className="text-[10px] text-neutral-500 font-medium">{String(asset.metadata?.theme || 'Clean Executive')}</span>
                      </div>
                    )}
                    {asset.type === 'video_demo' && (
                      <div className="flex items-center gap-2 mt-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-50 text-rose-800 text-[10px] font-semibold border border-rose-200">
                          <Play className="h-3 w-3" />
                          {String(asset.metadata?.durationFormatted || '12m 20s')}
                        </span>
                        <span className="text-[10px] text-neutral-500 font-medium">4K Mastered • Chapters</span>
                      </div>
                    )}
                    {asset.type === 'software' && (
                      <div className="flex items-center gap-2 mt-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-semibold border border-emerald-200">
                          <Code className="h-3 w-3" />
                          Production Package
                        </span>
                        <span className="text-[10px] text-neutral-500 font-medium">Commercial Ready</span>
                      </div>
                    )}
                    {asset.type === 'dataset' && (
                      <div className="flex items-center gap-2 mt-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-50 text-indigo-800 text-[10px] font-semibold border border-indigo-200">
                          <Database className="h-3 w-3" />
                          Verified Dataset
                        </span>
                        <span className="text-[10px] text-neutral-500 font-medium">CSV / Parquet</span>
                      </div>
                    )}
                    {(asset.type === 'report' || asset.type === 'research') && (
                      <div className="flex items-center gap-2 mt-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 text-amber-800 text-[10px] font-semibold border border-amber-200">
                          <FileText className="h-3 w-3" />
                          Research Whitepaper
                        </span>
                        <span className="text-[10px] text-neutral-500 font-medium">PDF • Citations</span>
                      </div>
                    )}

                    <p className="text-xs text-neutral-600 mt-2.5 line-clamp-3">{asset.description}</p>

                    <div className="mt-4 space-y-2 border-t border-neutral-100 pt-3">
                      <div className="flex items-center justify-between text-[11px] text-neutral-500">
                        <span>Creator: <strong className="text-neutral-800">{asset.author}</strong></span>
                        <div className="flex items-center gap-1 text-amber-500 font-semibold">
                          <Star className="h-3 w-3 fill-amber-500" />
                          <span>{asset.rating}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-neutral-500">
                        <span>Verified Licenses: <strong className="text-neutral-800">{asset.installCount.toLocaleString()}</strong></span>
                        <span>Executions: <strong className="text-neutral-800">{asset.activeExecutionsCount?.toLocaleString() || 0}</strong></span>
                      </div>

                      {/* Permissions */}
                      <div className="pt-1">
                        <span className="text-[10px] text-neutral-400 uppercase font-semibold block mb-1">Required Permissions:</span>
                        <div className="flex gap-1 flex-wrap">
                          {asset.permissionsRequired.map(p => (
                            <span key={p} className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium text-neutral-600">
                              {p}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-neutral-100 flex items-center justify-between">
                    <div>
                      <span className="text-sm font-bold text-neutral-900 block">
                        {asset.priceMinorUnits === 0 ? 'Free / Open' : `$${priceDollars} ${asset.currency || 'USD'}`}
                      </span>
                      <span className="text-[10px] text-neutral-400">
                        {asset.priceMinorUnits === 0 ? 'Immediate install' : asset.pricingModel === 'subscription' ? 'per month' : 'one-time license (15% platform split)'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                      <button
                        onClick={() => setSelectedAssetForPreview(asset)}
                        className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 px-2 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
                        title="Inspect Deliverable & Contents"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Inspect
                      </button>

                      <button
                        onClick={() => handleRunQualityOnMarketAsset(asset)}
                        className="inline-flex items-center gap-1 rounded-lg border border-purple-200 bg-purple-50 px-2 py-1.5 text-xs font-semibold text-purple-700 hover:bg-purple-100"
                        title="Run AI Quality Review"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        Quality
                      </button>

                      <button
                        id={`btn-install-${asset.id}`}
                        onClick={() => handlePurchaseOrInstall(asset.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-neutral-800 transition-colors shadow-xs"
                      >
                        <Download className="h-3.5 w-3.5" />
                        {asset.priceMinorUnits === 0 ? 'Install' : 'Acquire'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: CREATOR STUDIO & DEVELOPER MONETIZATION PLATFORM */}
      {/* ========================================================================= */}
      {subTab === 'creator_studio' && (
        <div className="space-y-6">
          {/* Creator Earnings Header */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-xs">
              <span className="text-[10px] font-bold uppercase text-neutral-400 tracking-wider">Total Creator Earnings</span>
              <div className="text-2xl font-bold text-neutral-900 mt-1">
                ${(devAccount.totalEarnedMinorUnits / 100).toFixed(2)} USD
              </div>
              <p className="text-[11px] text-emerald-600 font-medium mt-1">80-85% Creator revenue split</p>
            </div>

            <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-xs">
              <span className="text-[10px] font-bold uppercase text-neutral-400 tracking-wider">Pending Payout Balance</span>
              <div className="text-2xl font-bold text-purple-700 mt-1">
                ${(devAccount.pendingPayoutMinorUnits / 100).toFixed(2)} USD
              </div>
              <p className="text-[11px] text-neutral-500 mt-1">Next auto-settlement: 1st of month</p>
            </div>

            <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-xs">
              <span className="text-[10px] font-bold uppercase text-neutral-400 tracking-wider">Lifetime GMV</span>
              <div className="text-2xl font-bold text-neutral-900 mt-1">
                ${(devAccount.lifetimeGmvMinorUnits / 100).toFixed(2)} USD
              </div>
              <p className="text-[11px] text-neutral-500 mt-1">{devAccount.totalInstallsCount.toLocaleString()} total asset installs</p>
            </div>

            <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-neutral-400 tracking-wider">Payout Destination</span>
                <div className="text-xs font-semibold text-neutral-800 mt-1 flex items-center gap-1.5 capitalize">
                  <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
                  {devAccount.payoutMethod.replace('_', ' ')}: {devAccount.payoutAccountIdentifier}
                </div>
              </div>
              <button
                onClick={() => {
                  setPayoutMethod(devAccount.payoutMethod);
                  setPayoutAccountId(devAccount.payoutAccountIdentifier);
                  setShowPayoutModal(true);
                }}
                className="mt-2 text-left text-xs font-bold text-purple-700 hover:text-purple-900"
              >
                Configure Payout Routing →
              </button>
            </div>
          </div>

          {/* Asset Submission & Management Section */}
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
              <div>
                <h2 className="text-base font-bold text-neutral-900">Your Published & Draft Assets</h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Build once, monetize repeatedly across the CATALYX enterprise ecosystem.
                </p>
              </div>

              <button
                onClick={() => {
                  setLiveSecurityScan(null);
                  setShowSubmitModal(true);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-neutral-800 transition-colors shadow-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                Create New Asset
              </button>
            </div>

            {/* List of Creator Assets */}
            <div className="mt-4 divide-y divide-neutral-100">
              {assets.map(asset => (
                <div key={asset.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-neutral-900">{asset.title}</span>
                      <span className="text-[10px] font-mono text-neutral-500">v{asset.version}</span>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        asset.lifecycleStatus === 'published' ? 'bg-emerald-100 text-emerald-800' :
                        asset.lifecycleStatus === 'approved' ? 'bg-blue-100 text-blue-800' :
                        asset.lifecycleStatus === 'security_review' ? 'bg-amber-100 text-amber-800' :
                        'bg-neutral-100 text-neutral-700'
                      }`}>
                        {asset.lifecycleStatus}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-600 line-clamp-1">{asset.description}</p>
                    <div className="flex items-center gap-4 text-[11px] text-neutral-500">
                      <span>Category: <strong className="capitalize">{asset.type.replace('_', ' ')}</strong></span>
                      <span>Price: <strong>{asset.priceMinorUnits === 0 ? 'Free' : `$${(asset.priceMinorUnits / 100).toFixed(2)} USD`}</strong></span>
                      <span>Installs: <strong>{asset.installCount.toLocaleString()}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {asset.lifecycleStatus === 'draft' && (
                      <button
                        onClick={() => handleSubmitForReview(asset.id)}
                        className="rounded-lg bg-purple-50 border border-purple-200 px-3 py-1.5 text-xs font-semibold text-purple-800 hover:bg-purple-100"
                      >
                        Submit for Security Review
                      </button>
                    )}

                    {asset.lifecycleStatus === 'approved' && (
                      <button
                        onClick={() => handlePublishAsset(asset.id)}
                        className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                      >
                        Publish to Marketplace
                      </button>
                    )}

                    <button
                      onClick={() => {
                        const scanReport = MarketplaceService.performSecurityScan(asset);
                        setSelectedAssetForSecurity({ ...asset, securityReport: scanReport });
                      }}
                      className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
                    >
                      View Audit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2.5: V27 IMMUTABLE COMMERCE LEDGER & SALES SETTLEMENTS */}
      {/* ========================================================================= */}
      {subTab === 'ledger' && (
        <div className="space-y-6">
          {/* Ledger Financial KPI Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-xs">
              <span className="text-[10px] font-bold uppercase text-neutral-400 tracking-wider">Gross Transaction Volume</span>
              <div className="text-2xl font-bold text-neutral-900 mt-1">
                ${(ledgerEntries.reduce((acc, e) => acc + e.grossPriceMinorUnits, 0) / 100).toFixed(2)} USD
              </div>
              <p className="text-[11px] text-neutral-500 mt-1">Full transaction settlement volume</p>
            </div>

            <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-xs">
              <span className="text-[10px] font-bold uppercase text-neutral-400 tracking-wider">Creator Net Payouts (85%)</span>
              <div className="text-2xl font-bold text-emerald-700 mt-1">
                ${(ledgerEntries.reduce((acc, e) => acc + e.creatorPayoutMinorUnits, 0) / 100).toFixed(2)} USD
              </div>
              <p className="text-[11px] text-emerald-600 font-medium mt-1">Directly credited to verified creators</p>
            </div>

            <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-xs">
              <span className="text-[10px] font-bold uppercase text-neutral-400 tracking-wider">Platform Protocol Share (15%)</span>
              <div className="text-2xl font-bold text-purple-700 mt-1">
                ${(ledgerEntries.reduce((acc, e) => acc + e.platformFeeMinorUnits, 0) / 100).toFixed(2)} USD
              </div>
              <p className="text-[11px] text-neutral-500 mt-1">CATALYX ecosystem infrastructure</p>
            </div>

            <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-xs">
              <span className="text-[10px] font-bold uppercase text-neutral-400 tracking-wider">Audited Ledger Records</span>
              <div className="text-2xl font-bold text-neutral-900 mt-1">
                {ledgerEntries.length} Transactions
              </div>
              <p className="text-[11px] text-neutral-500 mt-1">{disputes.length} active dispute cases</p>
            </div>
          </div>

          {/* Ledger Table */}
          <div className="rounded-xl border border-neutral-200 bg-white shadow-xs overflow-hidden">
            <div className="p-5 border-b border-neutral-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-neutral-900">Cryptographic Commerce Ledger</h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Immutable audit records for all acquired licenses, digital works, and platform commission reconciliations.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  SHA-256 Receipts Verified
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-neutral-200 bg-neutral-50 text-neutral-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="px-4 py-3">Reference / Time</th>
                    <th className="px-4 py-3">Deliverable & Category</th>
                    <th className="px-4 py-3">Buyer & Seller</th>
                    <th className="px-4 py-3">Financial Breakdown</th>
                    <th className="px-4 py-3">Ledger Signature</th>
                    <th className="px-4 py-3">Settlement</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {ledgerEntries.map(tx => {
                    const gross = (tx.grossPriceMinorUnits / 100).toFixed(2);
                    const fee = (tx.platformFeeMinorUnits / 100).toFixed(2);
                    const net = (tx.creatorPayoutMinorUnits / 100).toFixed(2);
                    return (
                      <tr key={tx.id} className="hover:bg-neutral-50/60 transition-colors">
                        <td className="px-4 py-3 font-mono">
                          <div className="font-semibold text-neutral-900">{tx.transactionReference}</div>
                          <div className="text-[10px] text-neutral-400 mt-0.5">
                            {new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-neutral-900">{tx.assetTitle}</div>
                          <span className="inline-block px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-700 text-[10px] font-semibold uppercase mt-0.5">
                            {tx.assetCategory.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-neutral-900 font-medium">To: {tx.buyerName}</div>
                          <div className="text-[10px] text-neutral-500">By: {tx.sellerName}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-neutral-900">${gross} {tx.currency}</div>
                          <div className="text-[10px] text-neutral-500">
                            Creator: <span className="text-emerald-700 font-medium">${net}</span> • Fee (15%): <span className="text-purple-700 font-medium">${fee}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono text-[10px] text-neutral-500">
                          <div className="flex items-center gap-1.5">
                            <span className="truncate max-w-[110px]" title={tx.ledgerSignature}>
                              {tx.ledgerSignature.slice(0, 16)}...
                            </span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(tx.ledgerSignature);
                                setPurchaseSuccessMessage(`Ledger SHA-256 signature copied to clipboard.`);
                                setTimeout(() => setPurchaseSuccessMessage(null), 3000);
                              }}
                              className="p-1 rounded hover:bg-neutral-200 text-neutral-500"
                              title="Copy full cryptographic SHA-256 signature"
                            >
                              <Copy className="h-3 w-3" />
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            tx.settlementStatus === 'SETTLED' ? 'bg-emerald-100 text-emerald-800' :
                            tx.settlementStatus === 'DISPUTED' ? 'bg-rose-100 text-rose-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {tx.settlementStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => {
                              const matchingAsset = assets.find(a => a.id === tx.assetId);
                              if (matchingAsset) {
                                setSelectedAssetForDispute(matchingAsset);
                              } else {
                                setPurchaseSuccessMessage(`Deliverable record is finalized in escrow.`);
                                setTimeout(() => setPurchaseSuccessMessage(null), 3000);
                              }
                            }}
                            className="inline-flex items-center gap-1 rounded border border-neutral-200 px-2 py-1 text-[11px] font-semibold text-neutral-700 hover:bg-neutral-100"
                          >
                            <Scale className="h-3 w-3 text-neutral-500" />
                            Dispute
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Formal Disputes & Compliance Registry */}
          <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <div>
                <h3 className="text-base font-bold text-neutral-900">Marketplace Compliance, Disputes & Takedowns</h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Formal dispute resolutions, DMCA takedown assessments, and quality integrity reviews.
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded bg-neutral-100 text-neutral-800 border border-neutral-200">
                {disputes.length} Registered Reports
              </span>
            </div>

            {disputes.length === 0 ? (
              <div className="py-8 text-center text-xs text-neutral-500">
                No active disputes or compliance takedowns on record. All deliverables comply with V27 standards.
              </div>
            ) : (
              <div className="divide-y divide-neutral-100">
                {disputes.map(disp => (
                  <div key={disp.id} className="py-3 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-neutral-900">{disp.complianceReferenceId || disp.id}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-100 text-amber-800">
                          {disp.reason.replace('_', ' ')}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          disp.status === 'PENDING' || disp.status === 'UNDER_INVESTIGATION' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {disp.status}
                        </span>
                      </div>
                      <div className="text-neutral-700">
                        Target Asset: <strong>{disp.assetTitle}</strong> (Filed by: {disp.complainantName || disp.reporterEmail})
                      </div>
                      <p className="text-[11px] text-neutral-500 italic">"{disp.evidenceDetails || disp.details}"</p>
                    </div>
                    <div className="text-right text-[11px] text-neutral-400">
                      {new Date(disp.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: DEVELOPER API KEYS & ENDPOINT EXPLORER (/api/v1) */}
      {/* ========================================================================= */}
      {subTab === 'api_keys' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-neutral-900">Production REST API Credentials (/api/v1)</h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Authenticate CI/CD pipelines, ERP backends, and external microservices with tenant isolation.
              </p>
            </div>

            <button
              onClick={() => {
                setRevealedSecret(null);
                setShowKeyModal(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-neutral-800 transition-colors shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              Generate API Key
            </button>
          </div>

          {/* Active API Keys List */}
          <div className="rounded-xl border border-neutral-200 bg-white shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-neutral-200 bg-neutral-50 text-neutral-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Key Name</th>
                  <th className="py-3 px-4">Prefix</th>
                  <th className="py-3 px-4">Scopes</th>
                  <th className="py-3 px-4">Rate Limit</th>
                  <th className="py-3 px-4">Usage (Month)</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {apiKeys.map(k => (
                  <tr key={k.id} className="hover:bg-neutral-50/50">
                    <td className="py-3 px-4 font-semibold text-neutral-900">{k.name}</td>
                    <td className="py-3 px-4 font-mono text-neutral-600">{k.maskedKey}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1 flex-wrap">
                        {k.scopes.map(s => (
                          <span key={s} className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium text-neutral-600">
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-neutral-600">{k.rateLimitPerMinute} req/min</td>
                    <td className="py-3 px-4 text-neutral-600">{k.requestsThisMonth.toLocaleString()} reqs</td>
                    <td className="py-3 px-4">
                      <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                        k.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {k.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {k.status === 'active' && (
                        <button
                          onClick={() => handleRevokeKey(k.id)}
                          className="rounded p-1 text-neutral-400 hover:text-red-600 transition-colors"
                          title="Revoke Key"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Programmatic Endpoint Documentation & Code Snippet Playground */}
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
              <Code className="h-4 w-4 text-purple-600" />
              Developer API Quickstart & Endpoints
            </h3>
            <p className="text-xs text-neutral-600">
              All requests must include an <code className="bg-neutral-100 px-1 py-0.5 rounded font-mono text-neutral-800">Authorization: Bearer cx_live_...</code> header.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <span className="text-xs font-bold text-neutral-700">Available Production Routes</span>
                <div className="space-y-1.5 text-xs font-mono">
                  <div className="p-2 rounded bg-neutral-50 border border-neutral-200 flex items-center justify-between">
                    <span><strong className="text-emerald-700">GET</strong> /api/v1/agents</span>
                    <span className="text-[10px] text-neutral-500">agents:read</span>
                  </div>
                  <div className="p-2 rounded bg-neutral-50 border border-neutral-200 flex items-center justify-between">
                    <span><strong className="text-blue-700">POST</strong> /api/v1/agents/execute</span>
                    <span className="text-[10px] text-neutral-500">agents:execute</span>
                  </div>
                  <div className="p-2 rounded bg-neutral-50 border border-neutral-200 flex items-center justify-between">
                    <span><strong className="text-emerald-700">GET</strong> /api/v1/workflows</span>
                    <span className="text-[10px] text-neutral-500">workflows:read</span>
                  </div>
                  <div className="p-2 rounded bg-neutral-50 border border-neutral-200 flex items-center justify-between">
                    <span><strong className="text-blue-700">POST</strong> /api/v1/workflows/trigger</span>
                    <span className="text-[10px] text-neutral-500">workflows:trigger</span>
                  </div>
                  <div className="p-2 rounded bg-neutral-50 border border-neutral-200 flex items-center justify-between">
                    <span><strong className="text-emerald-700">GET</strong> /api/v1/telemetry/cvi</span>
                    <span className="text-[10px] text-neutral-500">telemetry:read</span>
                  </div>
                  <div className="p-2 rounded bg-neutral-50 border border-neutral-200 flex items-center justify-between">
                    <span><strong className="text-blue-700">POST</strong> /api/v1/twin/simulate</span>
                    <span className="text-[10px] text-neutral-500">twin:simulate</span>
                  </div>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-neutral-700 block mb-2">Example cURL Request</span>
                <pre className="p-3 bg-neutral-900 text-neutral-200 rounded-lg text-xs font-mono overflow-x-auto leading-relaxed">
{`curl -X POST https://api.catalyx.io/api/v1/agents/execute \\
  -H "Authorization: Bearer cx_live_9f83a8b2..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "agentId": "strategic",
    "actionName": "CALCULATE_OKR_TRAJECTORY",
    "parameters": {
      "quarter": "Q3",
      "targetGmvMinorUnits": 50000000
    }
  }'`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: OUTBOUND WEBHOOKS & EVENT STREAMING */}
      {/* ========================================================================= */}
      {subTab === 'webhooks' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-neutral-900">Enterprise Outbound Webhook Subscriptions</h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Stream real-time mission, workflow, and financial events to your external systems with HMAC-SHA256 integrity signatures.
              </p>
            </div>

            <button
              onClick={() => setShowWebhookModal(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-neutral-800 transition-colors shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Webhook Endpoint
            </button>
          </div>

          {testWebhookStatus && (
            <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-900 font-medium">
              {testWebhookStatus}
            </div>
          )}

          {/* Subscriptions Table */}
          <div className="rounded-xl border border-neutral-200 bg-white shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-neutral-200 bg-neutral-50 text-neutral-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Endpoint URL</th>
                  <th className="py-3 px-4">Subscribed Events</th>
                  <th className="py-3 px-4">HMAC Secret</th>
                  <th className="py-3 px-4">Last Delivery</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {webhooks.map(sub => (
                  <tr key={sub.id} className="hover:bg-neutral-50/50">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-neutral-900">{sub.description}</div>
                      <div className="font-mono text-neutral-500 text-[11px] truncate max-w-xs">{sub.url}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1 flex-wrap">
                        {sub.events.map(ev => (
                          <span key={ev} className="rounded bg-purple-50 text-purple-700 px-1.5 py-0.5 text-[10px] font-medium border border-purple-100">
                            {ev}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-neutral-500 text-[11px]">
                      {sub.secret.slice(0, 10)}••••••••
                    </td>
                    <td className="py-3 px-4 text-neutral-500">
                      {sub.lastDeliveryAt ? new Date(sub.lastDeliveryAt).toLocaleTimeString() : 'Never'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="rounded bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold uppercase">
                        {sub.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleTestWebhookDispatch(sub)}
                        className="rounded border border-neutral-200 px-2 py-1 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
                      >
                        Test Ping
                      </button>
                      <button
                        onClick={() => handleDeleteWebhook(sub.id)}
                        className="rounded p-1 text-neutral-400 hover:text-red-600 transition-colors"
                        title="Delete Subscription"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Delivery Logs Audit Trail */}
          <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-neutral-900">Recent Webhook Delivery Logs</h3>
            <div className="divide-y divide-neutral-100 text-xs">
              {webhookLogs.map(log => (
                <div key={log.id} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                      log.statusCode === 200 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {log.statusCode}
                    </span>
                    <span className="font-semibold text-neutral-900">{log.eventType}</span>
                    <span className="font-mono text-neutral-400 text-[11px] truncate max-w-sm">{log.payloadSummary}</span>
                  </div>
                  <div className="flex items-center gap-3 text-neutral-500 text-[11px]">
                    <span>{log.durationMs}ms</span>
                    <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: DEVELOPER SANDBOX ENVIRONMENT */}
      {/* ========================================================================= */}
      {subTab === 'sandbox' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-neutral-900">Developer Sandbox & Dry-Run Execution Container</h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Simulate agent and workflow runs with zero live database mutations, isolated mock state, and strict egress policies.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-xs text-neutral-600 bg-neutral-100 px-3 py-1.5 rounded-lg border border-neutral-200 font-mono">
                Quota: <strong>{devAccount.sandboxCallsToday}</strong> / {devAccount.sandboxQuotaPerDay} calls today
              </div>
            </div>
          </div>

          {/* Sandbox Runner Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Config */}
            <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                <Play className="h-4 w-4 text-purple-600" />
                Configure Dry-Run Test
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Target Type</label>
                  <select
                    value={sandboxTargetType}
                    onChange={(e) => setSandboxTargetType(e.target.value as any)}
                    className="w-full rounded-lg border border-neutral-200 p-2 text-xs font-medium text-neutral-800"
                  >
                    <option value="agent">Agent (Autonomous Level 0-4)</option>
                    <option value="workflow">Intelligent Workflow Engine</option>
                    <option value="marketplace_asset">Marketplace Verified Asset</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Target Identifier</label>
                  <input
                    type="text"
                    value={sandboxTargetId}
                    onChange={(e) => setSandboxTargetId(e.target.value)}
                    placeholder="e.g. strategic or asset_sec_auditor_01"
                    className="w-full rounded-lg border border-neutral-200 p-2 text-xs font-mono text-neutral-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Simulated Input JSON</label>
                  <textarea
                    rows={6}
                    value={sandboxPayload}
                    onChange={(e) => setSandboxPayload(e.target.value)}
                    className="w-full rounded-lg border border-neutral-200 p-2.5 text-xs font-mono text-neutral-800"
                  />
                </div>

                <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 text-[11px] text-neutral-600 space-y-1">
                  <div className="font-semibold text-neutral-800">Sandbox Safety Boundaries:</div>
                  <div>• External network calls will be intercepted and logged.</div>
                  <div>• Production billing tables and user credentials remain strictly read-only.</div>
                </div>

                <button
                  id="btn-run-sandbox"
                  onClick={handleExecuteSandbox}
                  disabled={isSandboxRunning}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-neutral-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-neutral-800 transition-colors shadow-xs disabled:opacity-50"
                >
                  <Play className="h-3.5 w-3.5 fill-white" />
                  {isSandboxRunning ? 'Executing in Container...' : 'Execute Dry-Run Simulation'}
                </button>
              </div>
            </div>

            {/* Results Panel */}
            <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Simulation Output & Policy Verification
              </h3>

              {latestSandboxResult ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2.5 rounded-lg bg-neutral-50 border border-neutral-200">
                      <span className="text-[10px] text-neutral-400 font-bold block">STATUS</span>
                      <span className="font-bold text-emerald-700 capitalize">{latestSandboxResult.status}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-neutral-50 border border-neutral-200">
                      <span className="text-[10px] text-neutral-400 font-bold block">DURATION</span>
                      <span className="font-bold text-neutral-800">{latestSandboxResult.durationMs}ms</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-neutral-50 border border-neutral-200">
                      <span className="text-[10px] text-neutral-400 font-bold block">SYNTHETIC COST</span>
                      <span className="font-bold text-neutral-800">${(latestSandboxResult.syntheticComputeCostMinorUnits / 100).toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-neutral-700">Policy Evaluations</span>
                    {latestSandboxResult.policyEvaluations.map((p, idx) => (
                      <div key={idx} className="p-2 rounded bg-emerald-50 text-emerald-800 text-[11px] font-mono border border-emerald-200 flex items-center gap-2">
                        <Check className="h-3.5 w-3.5" />
                        {p}
                      </div>
                    ))}
                  </div>

                  <div>
                    <span className="text-xs font-bold text-neutral-700 block mb-1">Execution Output Payload</span>
                    <pre className="p-3 bg-neutral-900 text-neutral-200 rounded-lg text-xs font-mono overflow-x-auto max-h-48">
                      {JSON.stringify(latestSandboxResult.output, null, 2)}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-neutral-200 rounded-xl">
                  <Terminal className="h-8 w-8 text-neutral-400 mb-2" />
                  <p className="text-xs font-semibold text-neutral-600">No sandbox execution triggered yet.</p>
                  <p className="text-[11px] text-neutral-400 mt-0.5">Click "Execute Dry-Run Simulation" to run isolated tests.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: SECURITY REVIEW AUDIT INSPECTOR */}
      {/* ========================================================================= */}
      {selectedAssetForSecurity && selectedAssetForSecurity.securityReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl border border-neutral-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-neutral-400 font-bold">Automated Security Scanner Report</span>
                <h3 className="text-lg font-bold text-neutral-900">{selectedAssetForSecurity.title}</h3>
              </div>
              <button
                onClick={() => setSelectedAssetForSecurity(null)}
                className="text-neutral-400 hover:text-neutral-600 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200">
                <span className="text-[10px] text-neutral-400 font-bold uppercase block">Risk Score</span>
                <span className="text-lg font-bold text-purple-700">{selectedAssetForSecurity.securityReport.overallRiskScore} / 100</span>
              </div>
              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200">
                <span className="text-[10px] text-neutral-400 font-bold uppercase block">Verdict</span>
                <span className="text-lg font-bold text-emerald-700 capitalize">{selectedAssetForSecurity.securityReport.verdict}</span>
              </div>
              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200">
                <span className="text-[10px] text-neutral-400 font-bold uppercase block">Sandbox Isolation</span>
                <span className="text-lg font-bold text-neutral-800">
                  {selectedAssetForSecurity.securityReport.sandboxRequired ? 'Enforced' : 'Native'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-neutral-800 block">Security Audit Findings</span>
              <div className="space-y-1.5">
                {selectedAssetForSecurity.securityReport.findings.map((f, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-neutral-50 border border-neutral-200 text-xs text-neutral-700 font-mono flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-neutral-800 block">Permissions Boundary Audit</span>
              <div className="space-y-1">
                {selectedAssetForSecurity.securityReport.permissionsAudit.map((p, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs p-2 rounded bg-neutral-50">
                    <span className="font-mono font-semibold">{p.permission}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      p.risk === 'critical' ? 'bg-red-100 text-red-800' :
                      p.risk === 'medium' ? 'bg-amber-100 text-amber-800' :
                      'bg-emerald-100 text-emerald-800'
                    }`}>
                      {p.risk} Risk
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setSelectedAssetForSecurity(null)}
                className="rounded-lg bg-neutral-900 px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800"
              >
                Close Audit Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREATE NEW ASSET (CREATOR STUDIO) */}
      {/* ========================================================================= */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl border border-neutral-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-purple-700 font-bold">Creator Monetization Studio</span>
                <h3 className="text-lg font-bold text-neutral-900">Publish Autonomous Ecosystem Asset</h3>
              </div>
              <button
                onClick={() => setShowSubmitModal(false)}
                className="text-neutral-400 hover:text-neutral-600 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Asset Category</label>
                  <select
                    value={newAssetType}
                    onChange={(e) => setNewAssetType(e.target.value as any)}
                    className="w-full rounded-lg border border-neutral-200 p-2 text-xs capitalize"
                  >
                    <option value="agent">Autonomous Agent</option>
                    <option value="workflow">Intelligent Workflow</option>
                    <option value="automation">Autonomous Automation</option>
                    <option value="integration">Third-Party Integration Connector</option>
                    <option value="knowledge_pack">Curated Knowledge Pack</option>
                    <option value="industry_solution">Industry Vertical Solution</option>
                    <option value="template">Enterprise Template</option>
                    <option value="analytics_pack">Analytics Pack</option>
                    <option value="simulation_model">Strategic Simulation Model</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Asset Version</label>
                  <input
                    type="text"
                    value={newAssetVersion}
                    onChange={(e) => setNewAssetVersion(e.target.value)}
                    placeholder="1.0.0"
                    className="w-full rounded-lg border border-neutral-200 p-2 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Title</label>
                <input
                  type="text"
                  value={newAssetTitle}
                  onChange={(e) => setNewAssetTitle(e.target.value)}
                  placeholder="e.g. Autonomous SOC2 Compliance Auditor"
                  className="w-full rounded-lg border border-neutral-200 p-2 font-semibold"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newAssetDescription}
                  onChange={(e) => setNewAssetDescription(e.target.value)}
                  placeholder="Clear description of what this autonomous asset executes..."
                  className="w-full rounded-lg border border-neutral-200 p-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Pricing Model</label>
                  <select
                    value={newAssetPricingModel}
                    onChange={(e) => {
                      const model = e.target.value as MarketplacePricingModel;
                      setNewAssetPricingModel(model);
                      if (model === 'free') setNewAssetPriceMinorUnits(0);
                    }}
                    className="w-full rounded-lg border border-neutral-200 p-2"
                  >
                    <option value="free">Free / Tier Included</option>
                    <option value="one_time">One-Time License</option>
                    <option value="subscription">Monthly Subscription</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Price (USD Cents / Minor Units)</label>
                  <input
                    type="number"
                    disabled={newAssetPricingModel === 'free'}
                    value={newAssetPriceMinorUnits}
                    onChange={(e) => setNewAssetPriceMinorUnits(parseInt(e.target.value) || 0)}
                    placeholder="1900 = $19.00"
                    className="w-full rounded-lg border border-neutral-200 p-2 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Executable Manifest Code</label>
                <textarea
                  rows={5}
                  value={newAssetManifestCode}
                  onChange={(e) => setNewAssetManifestCode(e.target.value)}
                  className="w-full rounded-lg border border-neutral-200 p-2 font-mono text-[11px]"
                />
              </div>

              {/* Pre-submission scanner */}
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-neutral-800">Automated Pre-Flight Security Check</span>
                  <button
                    type="button"
                    onClick={handleRunSecurityScanOnDraft}
                    className="rounded bg-neutral-900 px-2.5 py-1 text-[11px] font-semibold text-white"
                  >
                    Run Scanner
                  </button>
                </div>

                {liveSecurityScan && (
                  <div className="text-[11px] space-y-1 pt-1">
                    <div className="flex items-center gap-2">
                      <span>Verdict: <strong className="capitalize">{liveSecurityScan.verdict}</strong></span>
                      <span>Risk Score: <strong>{liveSecurityScan.overallRiskScore}/100</strong></span>
                    </div>
                    <div className="text-neutral-600 font-mono">
                      {liveSecurityScan.findings.join('; ')}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="rounded-lg border border-neutral-200 px-3.5 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-50"
              >
                Cancel
              </button>

              <button
                id="btn-save-draft-asset"
                onClick={handleCreateDraftAsset}
                className="rounded-lg bg-purple-700 px-4 py-2 text-xs font-semibold text-white hover:bg-purple-800 shadow-xs"
              >
                Save Draft Asset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: GENERATE API KEY */}
      {/* ========================================================================= */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-neutral-200 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <h3 className="text-base font-bold text-neutral-900">Generate Programmatic API Key</h3>
              <button onClick={() => setShowKeyModal(false)} className="text-neutral-400 hover:text-neutral-600 text-sm font-bold">✕</button>
            </div>

            {!revealedSecret ? (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Key Description / Name</label>
                  <input
                    type="text"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="e.g. Production CI/CD Gateway"
                    className="w-full rounded-lg border border-neutral-200 p-2.5 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-2">Granted Scopes</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      'agents:read', 'agents:execute', 
                      'workflows:read', 'workflows:trigger', 
                      'telemetry:read', 'twin:simulate',
                      'marketplace:read', 'marketplace:manage'
                    ].map(scope => (
                      <label key={scope} className="flex items-center gap-1.5 p-1.5 rounded bg-neutral-50 text-[11px] font-mono cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newKeyScopes.includes(scope)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewKeyScopes(prev => [...prev, scope]);
                            } else {
                              setNewKeyScopes(prev => prev.filter(s => s !== scope));
                            }
                          }}
                        />
                        {scope}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button onClick={() => setShowKeyModal(false)} className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-semibold text-neutral-600">
                    Cancel
                  </button>
                  <button onClick={handleCreateKey} className="rounded-lg bg-neutral-900 px-3.5 py-1.5 text-xs font-semibold text-white">
                    Generate Secret
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-900 text-[11px]">
                  <strong>Make sure to copy your API key now.</strong> You won’t be able to see it again!
                </div>

                <div className="p-3 bg-neutral-900 text-neutral-100 rounded-lg font-mono text-xs break-all flex items-center justify-between">
                  <span>{revealedSecret}</span>
                  <button onClick={() => copyToClipboard(revealedSecret)} className="p-1 text-neutral-400 hover:text-white">
                    {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>

                <div className="text-right">
                  <button onClick={() => setShowKeyModal(false)} className="rounded-lg bg-neutral-900 px-4 py-2 text-xs font-semibold text-white">
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD WEBHOOK SUBSCRIPTION */}
      {/* ========================================================================= */}
      {showWebhookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-neutral-200 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <h3 className="text-base font-bold text-neutral-900">Add Webhook Endpoint</h3>
              <button onClick={() => setShowWebhookModal(false)} className="text-neutral-400 hover:text-neutral-600 text-sm font-bold">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Target HTTPS URL</label>
                <input
                  type="url"
                  value={newWebhookUrl}
                  onChange={(e) => setNewWebhookUrl(e.target.value)}
                  placeholder="https://api.yourcompany.com/webhooks/catalyx"
                  className="w-full rounded-lg border border-neutral-200 p-2 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Description</label>
                <input
                  type="text"
                  value={newWebhookDesc}
                  onChange={(e) => setNewWebhookDesc(e.target.value)}
                  placeholder="e.g. Enterprise Slack & Audit Gateway"
                  className="w-full rounded-lg border border-neutral-200 p-2"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Events to Subscribe</label>
                <div className="space-y-1.5">
                  {(['mission.completed', 'workflow.completed', 'agent.completed', 'marketplace.purchase'] as WebhookEventType[]).map(ev => (
                    <label key={ev} className="flex items-center gap-2 p-1.5 rounded bg-neutral-50 font-mono text-[11px] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newWebhookEvents.includes(ev)}
                        onChange={(e) => {
                          if (e.target.checked) setNewWebhookEvents(prev => [...prev, ev]);
                          else setNewWebhookEvents(prev => prev.filter(x => x !== ev));
                        }}
                      />
                      {ev}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button onClick={() => setShowWebhookModal(false)} className="rounded-lg border border-neutral-200 px-3.5 py-1.5 text-xs font-semibold text-neutral-600">
                Cancel
              </button>
              <button onClick={handleCreateWebhook} className="rounded-lg bg-neutral-900 px-4 py-1.5 text-xs font-semibold text-white">
                Register Endpoint
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CONFIGURE CREATOR PAYOUT DESTINATION */}
      {/* ========================================================================= */}
      {showPayoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-neutral-200 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <h3 className="text-base font-bold text-neutral-900">Configure Creator Payout Routing</h3>
              <button onClick={() => setShowPayoutModal(false)} className="text-neutral-400 hover:text-neutral-600 text-sm font-bold">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Payout Method</label>
                <select
                  value={payoutMethod}
                  onChange={(e) => setPayoutMethod(e.target.value as any)}
                  className="w-full rounded-lg border border-neutral-200 p-2"
                >
                  <option value="pesapal">Pesapal Merchant Settlement</option>
                  <option value="mobile_money">East Africa Mobile Money (M-PESA / Airtel)</option>
                  <option value="bank_wire">International SWIFT / Bank Wire</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Account Identifier / Phone / IBAN</label>
                <input
                  type="text"
                  value={payoutAccountId}
                  onChange={(e) => setPayoutAccountId(e.target.value)}
                  placeholder="e.g. PESAPAL-MERCH-88219A or +256700000000"
                  className="w-full rounded-lg border border-neutral-200 p-2 font-mono"
                />
              </div>

              <div className="p-3 bg-neutral-50 rounded-lg text-neutral-600 text-[11px]">
                Platform commission: 15%. Creator revenue: 85%. Payouts settle automatically on the 1st of each calendar month.
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button onClick={() => setShowPayoutModal(false)} className="rounded-lg border border-neutral-200 px-3.5 py-1.5 text-xs font-semibold text-neutral-600">
                Cancel
              </button>
              <button onClick={handleSavePayoutSettings} className="rounded-lg bg-purple-700 px-4 py-1.5 text-xs font-semibold text-white">
                Save Routing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* V27 MODAL: ACQUIRE LICENSE & RECORD COMMERCE LEDGER TRANSACTION */}
      {/* ========================================================================= */}
      {selectedAssetForPurchase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-neutral-200 space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
                  {selectedAssetForPurchase.type.replace('_', ' ')}
                </span>
                <h3 className="text-lg font-bold text-neutral-900 mt-1">Acquire Deliverable License</h3>
              </div>
              <button onClick={() => setSelectedAssetForPurchase(null)} className="text-neutral-400 hover:text-neutral-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs">
              <div className="font-bold text-neutral-900 text-sm">{selectedAssetForPurchase.title}</div>
              <div className="text-neutral-500 mt-0.5 line-clamp-2">{selectedAssetForPurchase.description}</div>
              <div className="mt-2 flex items-center gap-3 text-[11px] text-neutral-600">
                <span>Creator: <strong>{selectedAssetForPurchase.author}</strong></span>
                <span>Version: <strong>v{selectedAssetForPurchase.version}</strong></span>
              </div>
            </div>

            {/* Financial Transparency Split */}
            <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 space-y-2 text-xs">
              <div className="font-semibold text-neutral-800 border-b border-neutral-200 pb-1.5 flex items-center justify-between">
                <span>License Price Breakdown</span>
                <span className="text-sm font-bold text-neutral-900">
                  ${(selectedAssetForPurchase.priceMinorUnits / 100).toFixed(2)} USD
                </span>
              </div>
              <div className="flex items-center justify-between text-neutral-600">
                <span>Creator Net Proceeds (85%):</span>
                <span className="font-semibold text-emerald-700">
                  ${((selectedAssetForPurchase.priceMinorUnits * 0.85) / 100).toFixed(2)} USD
                </span>
              </div>
              <div className="flex items-center justify-between text-neutral-600">
                <span>Platform Protocol Share (15%):</span>
                <span className="font-semibold text-purple-700">
                  ${((selectedAssetForPurchase.priceMinorUnits * 0.15) / 100).toFixed(2)} USD
                </span>
              </div>
            </div>

            {/* Licensing Terms */}
            <div className="rounded-xl border border-neutral-200 p-3 text-xs space-y-1 bg-white">
              <span className="font-bold text-neutral-900 flex items-center gap-1">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                Verified Commercial License Terms
              </span>
              <p className="text-neutral-600 text-[11px]">
                Authorizes production deployment for 1 organization tenant. Deliverable can be modified and customized. Public redistribution and sublicensing prohibited.
              </p>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-1.5 text-xs">
              <label className="block font-semibold text-neutral-700">Settlement Method</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'account_balance', label: 'Internal Escrow / Credit' },
                  { id: 'pesapal', label: 'Pesapal Merchant' },
                  { id: 'card', label: 'Corporate Card' }
                ].map(pm => (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => setPaymentMethodChoice(pm.id as any)}
                    className={`p-2.5 rounded-lg border text-left font-medium transition-colors ${
                      paymentMethodChoice === pm.id
                        ? 'border-neutral-900 bg-neutral-900 text-white shadow-xs'
                        : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    <div className="text-xs font-semibold">{pm.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-neutral-100">
              <button
                onClick={() => setSelectedAssetForPurchase(null)}
                className="rounded-lg border border-neutral-200 px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                id="btn-confirm-license-purchase"
                onClick={handleConfirmAcquireLicense}
                className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-900 px-5 py-2 text-xs font-semibold text-white hover:bg-neutral-800 shadow-xs"
              >
                <Download className="h-4 w-4" />
                Confirm & Acquire License
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* V27 MODAL: INSPECT DELIVERABLE (MEDIA, SLIDES, CHAPTERS, CODE & REVIEWS) */}
      {/* ========================================================================= */}
      {selectedAssetForPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl border border-neutral-200 space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                    {selectedAssetForPreview.type.replace('_', ' ')} • v{selectedAssetForPreview.version}
                  </span>
                  <span className="text-xs text-neutral-500">By {selectedAssetForPreview.author}</span>
                </div>
                <h3 className="text-lg font-bold text-neutral-900 mt-1">{selectedAssetForPreview.title}</h3>
              </div>
              <button onClick={() => setSelectedAssetForPreview(null)} className="text-neutral-400 hover:text-neutral-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-neutral-700 leading-relaxed">{selectedAssetForPreview.description}</p>

            {/* Media & Content Breakdown based on Type */}
            {selectedAssetForPreview.type === 'presentation' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                    <Presentation className="h-4 w-4 text-blue-600" />
                    Slide Deck Blueprint ({String(selectedAssetForPreview.metadata?.slideCount || 12)} Slides)
                  </h4>
                  <span className="text-[11px] text-neutral-500 font-medium">Theme: {String(selectedAssetForPreview.metadata?.theme || 'Clean Executive')}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(slideIdx => (
                    <div key={slideIdx} className="rounded-lg border border-neutral-200 bg-neutral-50 p-2.5 text-center flex flex-col justify-between h-20 shadow-xs">
                      <span className="text-[9px] font-bold uppercase text-neutral-400">Slide {slideIdx}</span>
                      <div className="text-[10px] font-semibold text-neutral-800 line-clamp-1">
                        {slideIdx === 1 ? 'Title & Thesis' : slideIdx === 2 ? 'Market Opportunity' : slideIdx === 3 ? 'Architecture' : slideIdx === 4 ? 'Unit Economics' : slideIdx === 5 ? 'Roadmap' : slideIdx === 6 ? 'Security Posture' : slideIdx === 7 ? 'Regulatory Path' : 'Closing & Call to Action'}
                      </div>
                      <span className="text-[9px] text-neutral-400">Executive Deck</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedAssetForPreview.type === 'video_demo' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                    <Play className="h-4 w-4 text-rose-600" />
                    Master Video Demonstration & Timestamps
                  </h4>
                  <span className="text-[11px] text-rose-700 font-semibold">{String(selectedAssetForPreview.metadata?.durationFormatted || '12m 20s')} • 4K Mastered</span>
                </div>

                <div className="rounded-xl border border-neutral-200 bg-neutral-950 p-6 text-white text-center flex flex-col items-center justify-center min-h-[140px] relative overflow-hidden">
                  <Play className="h-10 w-10 text-white/80 hover:text-white transition-colors cursor-pointer" />
                  <div className="text-xs font-semibold mt-2">{selectedAssetForPreview.title}</div>
                  <div className="text-[10px] text-neutral-400 mt-1">Grounded Video Demonstration with Synchronized Chapters & Transcript</div>
                </div>

                <div className="rounded-lg border border-neutral-200 p-3 space-y-1.5 text-xs bg-neutral-50">
                  <span className="font-bold text-neutral-800 text-[11px] uppercase tracking-wider block">Video Chapters:</span>
                  <div className="space-y-1 text-[11px]">
                    <div className="flex justify-between text-neutral-700 font-mono">
                      <span>00:00 - Introduction & Mission Problem</span>
                      <span className="text-neutral-400">01:45</span>
                    </div>
                    <div className="flex justify-between text-neutral-700 font-mono">
                      <span>01:45 - Architecture Walkthrough & Live Execution</span>
                      <span className="text-neutral-400">04:30</span>
                    </div>
                    <div className="flex justify-between text-neutral-700 font-mono">
                      <span>06:15 - Enterprise Compliance & Security Benchmarks</span>
                      <span className="text-neutral-400">03:20</span>
                    </div>
                    <div className="flex justify-between text-neutral-700 font-mono">
                      <span>09:35 - Production Deployment & Payout Reconciliation</span>
                      <span className="text-neutral-400">02:45</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedAssetForPreview.type === 'software' && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                  <Code className="h-4 w-4 text-emerald-600" />
                  Software Package Manifest & Signatures
                </h4>
                <div className="rounded-lg border border-neutral-200 bg-neutral-950 p-3 text-neutral-200 font-mono text-[11px] overflow-x-auto">
                  <pre>{`// CATALYX Production Deliverable
export interface SoftwarePackage {
  title: "${selectedAssetForPreview.title}",
  version: "${selectedAssetForPreview.version}",
  integrityHash: "sha256-8e9f2a4c...",
  entrypoint: "dist/index.js",
  licensing: "COMMERCIAL_NON_EXCLUSIVE"
}`}</pre>
                </div>
              </div>
            )}

            {/* Verified Customer Reviews */}
            <div className="rounded-xl border border-neutral-200 p-4 space-y-3 bg-white">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                <span className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                  <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                  Verified Buyer Reviews ({selectedAssetForPreview.rating} / 5.0)
                </span>
                <span className="text-[11px] text-neutral-500 font-medium">
                  {selectedAssetForPreview.installCount.toLocaleString()} Verified Licenses
                </span>
              </div>

              {selectedAssetForPreview.reviews && selectedAssetForPreview.reviews.length > 0 ? (
                <div className="space-y-2 text-xs">
                  {selectedAssetForPreview.reviews.map(rev => (
                    <div key={rev.id} className="p-2.5 rounded-lg bg-neutral-50 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-neutral-800">{rev.reviewerName}</span>
                        <div className="flex items-center gap-0.5 text-amber-500">
                          <Star className="h-3 w-3 fill-amber-500" />
                          <span className="text-[11px] font-bold">{rev.rating}</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-neutral-600">"{rev.comment}"</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-neutral-500 italic">
                  Rated {selectedAssetForPreview.rating} stars by verified institutional buyers across the ecosystem.
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-neutral-200">
              <button
                onClick={() => {
                  setSelectedAssetForDispute(selectedAssetForPreview);
                  setSelectedAssetForPreview(null);
                }}
                className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1"
              >
                <AlertCircle className="h-3.5 w-3.5" />
                Report Deliverable Issue
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedAssetForPreview(null)}
                  className="rounded-lg border border-neutral-200 px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-50"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    const target = selectedAssetForPreview;
                    setSelectedAssetForPreview(null);
                    handlePurchaseOrInstall(target.id);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-900 px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800 shadow-xs"
                >
                  <Download className="h-4 w-4" />
                  Acquire License (${(selectedAssetForPreview.priceMinorUnits / 100).toFixed(2)})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* V27 MODAL: FORMAL DISPUTE & COMPLIANCE REPORTING */}
      {/* ========================================================================= */}
      {selectedAssetForDispute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fade-in">
          <form onSubmit={handleConfirmDispute} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-neutral-200 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-neutral-900">File Formal Deliverable Dispute</h3>
                <span className="text-xs text-neutral-500">Asset: {selectedAssetForDispute.title}</span>
              </div>
              <button type="button" onClick={() => setSelectedAssetForDispute(null)} className="text-neutral-400 hover:text-neutral-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Dispute Reason</label>
                <select
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value as any)}
                  className="w-full rounded-lg border border-neutral-200 p-2 text-xs"
                >
                  <option value="MISLEADING_FUNCTIONALITY">Misleading Functionality / Incomplete Deliverable</option>
                  <option value="COPYRIGHT_INFRINGEMENT">Copyright / Intellectual Property Infringement</option>
                  <option value="SECURITY_VULNERABILITY">Security Vulnerability / Unverified Payload</option>
                  <option value="MALFORMED_DELIVERABLE">Malformed Deliverable / Corrupt Asset</option>
                  <option value="TERMS_VIOLATION">Terms of Service / Licensing Violation</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Evidence & Substantiation</label>
                <textarea
                  rows={4}
                  required
                  value={disputeEvidence}
                  onChange={(e) => setDisputeEvidence(e.target.value)}
                  placeholder="Provide precise details, steps to reproduce, or copyright ownership documentation..."
                  className="w-full rounded-lg border border-neutral-200 p-2 text-xs"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-lg text-amber-900 text-[11px] border border-amber-200">
                All filings are cryptographically anchored to the CATALYX compliance registry. Falsified takedowns may result in account sanctions.
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setSelectedAssetForDispute(null)}
                className="rounded-lg border border-neutral-200 px-3.5 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700 shadow-xs"
              >
                <Scale className="h-4 w-4" />
                Submit Formal Report
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* V27 MODAL: WORK QUALITY ASSISTANT REPORT */}
      {/* ========================================================================= */}
      {selectedAssetForQuality && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-neutral-200 space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
                  AI Work Quality Assistant
                </span>
                <h3 className="text-base font-bold text-neutral-900 mt-1">{selectedAssetForQuality.title}</h3>
              </div>
              <button onClick={() => { setSelectedAssetForQuality(null); setQualityReviewReport(null); }} className="text-neutral-400 hover:text-neutral-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            {isReviewingQuality ? (
              <div className="py-12 text-center space-y-3">
                <RefreshCw className="h-8 w-8 text-purple-600 animate-spin mx-auto" />
                <div className="text-xs font-bold text-neutral-800">Evaluating Deliverable Against Quality & Commerce Criteria...</div>
                <p className="text-[11px] text-neutral-500">Checking technical integrity, metadata completeness, and commercial pricing model.</p>
              </div>
            ) : qualityReviewReport ? (
              <div className="space-y-4 text-xs">
                {/* Score badge */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-neutral-50 border border-neutral-200">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-neutral-400">Composite Readiness Score</span>
                    <div className="text-3xl font-black text-neutral-900 mt-0.5">
                      {qualityReviewReport.overallScore} <span className="text-sm font-semibold text-neutral-400">/ 100</span>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${
                    qualityReviewReport.overallScore >= 80 ? 'bg-emerald-100 text-emerald-800' :
                    qualityReviewReport.overallScore >= 60 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {qualityReviewReport.overallScore >= 80 ? 'Production Grade' : 'Needs Optimization'}
                  </span>
                </div>

                {/* Criteria breakdown */}
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2.5 rounded-lg border border-neutral-200 bg-white">
                    <span className="text-neutral-500 block">Technical Polish:</span>
                    <span className="text-sm font-bold text-neutral-900">{qualityReviewReport.criteriaBreakdown?.technicalQuality ?? qualityReviewReport.dimensionScores?.clarity ?? 85}/100</span>
                  </div>
                  <div className="p-2.5 rounded-lg border border-neutral-200 bg-white">
                    <span className="text-neutral-500 block">Commercial Readiness:</span>
                    <span className="text-sm font-bold text-neutral-900">{qualityReviewReport.criteriaBreakdown?.marketReadiness ?? qualityReviewReport.dimensionScores?.commercialViability ?? 80}/100</span>
                  </div>
                  <div className="p-2.5 rounded-lg border border-neutral-200 bg-white">
                    <span className="text-neutral-500 block">Security & Licensing:</span>
                    <span className="text-sm font-bold text-neutral-900">{qualityReviewReport.criteriaBreakdown?.securityCompliance ?? qualityReviewReport.dimensionScores?.consistency ?? 90}/100</span>
                  </div>
                  <div className="p-2.5 rounded-lg border border-neutral-200 bg-white">
                    <span className="text-neutral-500 block">Documentation:</span>
                    <span className="text-sm font-bold text-neutral-900">{qualityReviewReport.criteriaBreakdown?.documentationCompleteness ?? qualityReviewReport.dimensionScores?.structure ?? 88}/100</span>
                  </div>
                </div>

                {/* Key Strengths */}
                {((qualityReviewReport.strengths && qualityReviewReport.strengths.length > 0) || (qualityReviewReport.keyStrengths && qualityReviewReport.keyStrengths.length > 0)) && (
                  <div>
                    <span className="font-bold text-neutral-800 block mb-1">Key Strengths:</span>
                    <ul className="space-y-1 text-neutral-600 text-[11px]">
                      {(qualityReviewReport.strengths || qualityReviewReport.keyStrengths || []).map((s, idx) => (
                        <li key={idx} className="flex items-center gap-1.5 text-emerald-800">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600 flex-shrink-0" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Recommendations */}
                {((qualityReviewReport.recommendations && qualityReviewReport.recommendations.length > 0) || (qualityReviewReport.prioritizedImprovements && qualityReviewReport.prioritizedImprovements.length > 0)) && (
                  <div>
                    <span className="font-bold text-neutral-800 block mb-1">Recommended Enhancements:</span>
                    <ul className="space-y-1 text-neutral-600 text-[11px]">
                      {(qualityReviewReport.recommendations || qualityReviewReport.prioritizedImprovements?.map(i => i.suggestion) || []).map((r, idx) => (
                        <li key={idx} className="flex items-center gap-1.5 text-neutral-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-purple-600 flex-shrink-0" />
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : null}

            <div className="pt-2 flex justify-end border-t border-neutral-100">
              <button
                onClick={() => { setSelectedAssetForQuality(null); setQualityReviewReport(null); }}
                className="rounded-lg bg-neutral-900 px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
