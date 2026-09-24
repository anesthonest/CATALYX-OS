import React, { useState, useMemo, useEffect } from 'react';
import { 
  ShoppingBag, Search, Plus, Star, ShieldCheck, Download, Copy, Check, 
  Trash2, ExternalLink, AlertCircle, RefreshCw, DollarSign, Wallet, 
  Layers, CheckCircle2, ChevronRight, Eye, Sparkles, Filter, FileText, 
  Presentation, Database, Scale, Receipt, Shield, X, Play, Video, 
  TrendingUp, ArrowRight, Package, Tag, User, Users, Globe, Lock,
  Key, Webhook, Terminal, Send, ArrowUpRight, CheckSquare, Clock,
  Settings, Megaphone, Briefcase
} from 'lucide-react';
import { MarketplaceService } from '../services/marketplaceService';
import { WebhookService } from '../services/webhookService';
import { DeveloperSandboxService } from '../services/developerSandboxService';
import { workToMarketService } from '../services/workToMarketService';
import { universalWorkService } from '../services/universalWorkService';
import { presentationsService } from '../services/presentationsService';
import { revenuePolicyEngine, SellerAccountType } from '../services/payment/revenuePolicyEngine';
import { MarketplaceSettingsTab } from './marketplace/MarketplaceSettingsTab';
import { AdvertisingHubView } from './advertising/AdvertisingHubView';
import { ProfessionalServicesView } from './services/ProfessionalServicesView';
import { 
  MarketplaceAsset, ApiKeyCredential, DeveloperAccount, 
  WebhookSubscription, WebhookDeliveryLog, SandboxExecutionResult,
  MarketplaceCategory, MarketplacePricingModel, AgentPermission,
  SecurityReviewReport, WebhookEventType, WorkQualityReviewReport,
  MarketplaceDisputeRecord, ImmutableCommerceLedgerEntry,
  UserProfile, UserPersonaRole, UniversalWorkObject
} from '../types';

interface MarketplaceHubViewProps {
  user: UserProfile;
  activeRole: UserPersonaRole;
  onNavigate: (tabId: string, itemId?: string) => void;
}

export const MarketplaceHubView: React.FC<MarketplaceHubViewProps> = ({
  user,
  activeRole,
  onNavigate
}) => {
  // Main Section Navigation
  const [activeSection, setActiveSection] = useState<'discover' | 'shop' | 'sell' | 'my_listings' | 'purchases' | 'earnings' | 'developer' | 'settings' | 'advertising' | 'services'>('discover');
  
  // Search & Filtering State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPricing, setSelectedPricing] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'trending' | 'rating' | 'price_asc' | 'price_desc' | 'newest'>('trending');

  // Modals & Details State
  const [selectedProduct, setSelectedProduct] = useState<MarketplaceAsset | null>(null);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'balance' | 'pesapal'>('balance');
  const [purchaseSuccessMessage, setPurchaseSuccessMessage] = useState<string | null>(null);
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState<MarketplaceDisputeRecord['reason']>('MISLEADING_FUNCTIONALITY');
  const [disputeEvidence, setDisputeEvidence] = useState('');
  const [disputeSuccess, setDisputeSuccess] = useState<string | null>(null);

  // Sell Wizard State (5-step progressive flow)
  const [sellStep, setSellStep] = useState<number>(1);
  const [sellSource, setSellSource] = useState<'existing_work' | 'custom_upload'>('existing_work');
  const [selectedWorkId, setSelectedWorkId] = useState<string>('');
  const [sellCategory, setSellCategory] = useState<MarketplaceCategory>('presentation');
  const [sellTitle, setSellTitle] = useState('');
  const [sellDescription, setSellDescription] = useState('');
  const [sellTags, setSellTags] = useState('Enterprise, Strategy, Production');
  const [sellPricingModel, setSellPricingModel] = useState<MarketplacePricingModel>('one_time');
  const [sellPriceUsd, setSellPriceUsd] = useState<number>(49.00);
  const [sellLicense, setSellLicense] = useState<'COMMERCIAL_NON_EXCLUSIVE' | 'SINGLE_USER_PERSONAL' | 'ENTERPRISE_UNLIMITED'>('COMMERCIAL_NON_EXCLUSIVE');
  const [sellDemoUrl, setSellDemoUrl] = useState('');
  const [sellQualityScan, setSellQualityScan] = useState<WorkQualityReviewReport | null>(null);
  const [isScanningQuality, setIsScanningQuality] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);

  // Developer & API Sub-Tab State
  const [devSubTab, setDevSubTab] = useState<'api_keys' | 'webhooks' | 'sandbox'>('api_keys');
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [revealedSecret, setRevealedSecret] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [showWebhookModal, setShowWebhookModal] = useState(false);
  const [newWebhookUrl, setNewWebhookUrl] = useState('');
  const [newWebhookDesc, setNewWebhookDesc] = useState('');
  const [sandboxPayload, setSandboxPayload] = useState('{\n  "mode": "simulation",\n  "testPayload": true\n}');
  const [sandboxResult, setSandboxResult] = useState<SandboxExecutionResult | null>(null);
  const [isSandboxRunning, setIsSandboxRunning] = useState(false);

  // Payout Settings
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutMethod, setPayoutMethod] = useState<'pesapal' | 'bank_wire' | 'mobile_money'>('pesapal');
  const [payoutAccountId, setPayoutAccountId] = useState('254712345678');
  const [payoutSavedNotice, setPayoutSavedNotice] = useState<string | null>(null);

  // Refresh Trigger
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Data Loading
  const assets: MarketplaceAsset[] = useMemo(() => {
    return MarketplaceService.getAssets();
  }, [refreshTrigger]);

  const existingWorkItems: UniversalWorkObject[] = useMemo(() => {
    return universalWorkService.getAllWork();
  }, []);

  const ledgerEntries: ImmutableCommerceLedgerEntry[] = useMemo(() => {
    return workToMarketService.getLedger();
  }, [refreshTrigger]);

  const devAccount: DeveloperAccount = useMemo(() => {
    return MarketplaceService.getDeveloperAccount(user.uid);
  }, [user.uid, refreshTrigger]);

  // Categories definition
  const categoriesList = [
    { id: 'all', label: 'All Work', icon: ShoppingBag, count: assets.length },
    { id: 'presentation', label: 'Presentations & Slides', icon: Presentation, count: assets.filter(a => a.type === 'presentation' || a.type === 'template').length },
    { id: 'agent', label: 'Autonomous Agents', icon: Sparkles, count: assets.filter(a => a.type === 'agent').length },
    { id: 'workflow', label: 'Workflows & Automation', icon: Layers, count: assets.filter(a => a.type === 'workflow').length },
    { id: 'software', label: 'Software & Apps', icon: Play, count: assets.filter(a => a.type === 'software' || a.type === 'application').length },
    { id: 'video', label: 'Media & Videos', icon: Video, count: assets.filter(a => a.type === 'video' || a.type === 'video_demo').length },
    { id: 'document', label: 'Documents & Templates', icon: FileText, count: assets.filter(a => a.type === 'document' || a.type === 'template').length },
    { id: 'dataset', label: 'Research & Datasets', icon: Database, count: assets.filter(a => a.type === 'dataset' || a.type === 'industry_solution').length },
    { id: 'integration', label: 'Connectors & APIs', icon: Lock, count: assets.filter(a => a.type === 'integration').length },
  ];

  // Filtered Assets
  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = asset.title.toLowerCase().includes(q);
        const matchesDesc = asset.description.toLowerCase().includes(q);
        const matchesAuthor = asset.author.toLowerCase().includes(q);
        const matchesTag = asset.tags?.some(t => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesDesc && !matchesAuthor && !matchesTag) return false;
      }

      // Category filter
      if (selectedCategory !== 'all') {
        if (selectedCategory === 'presentation' && asset.type !== 'presentation' && asset.type !== 'template') return false;
        if (selectedCategory === 'software' && asset.type !== 'software' && asset.type !== 'application') return false;
        if (selectedCategory === 'video' && asset.type !== 'video' && asset.type !== 'video_demo') return false;
        if (selectedCategory === 'document' && asset.type !== 'document' && asset.type !== 'template') return false;
        if (selectedCategory === 'dataset' && asset.type !== 'dataset' && asset.type !== 'industry_solution') return false;
        if (!['presentation', 'software', 'video', 'document', 'dataset'].includes(selectedCategory) && asset.type !== selectedCategory) {
          return false;
        }
      }

      // Pricing filter
      if (selectedPricing !== 'all') {
        if (selectedPricing === 'free' && asset.pricingModel !== 'free') return false;
        if (selectedPricing === 'paid' && asset.pricingModel === 'free') return false;
        if (selectedPricing === 'subscription' && asset.pricingModel !== 'subscription') return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'trending') return (b.installCount || 0) - (a.installCount || 0);
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'price_asc') return a.priceMinorUnits - b.priceMinorUnits;
      if (sortBy === 'price_desc') return b.priceMinorUnits - a.priceMinorUnits;
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return 0;
    });
  }, [assets, searchQuery, selectedCategory, selectedPricing, sortBy]);

  // Featured / Trending Items
  const trendingItems = useMemo(() => {
    return [...assets].sort((a, b) => (b.installCount || 0) - (a.installCount || 0)).slice(0, 4);
  }, [assets]);

  const newReleases = useMemo(() => {
    return [...assets].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 4);
  }, [assets]);

  // User Purchases
  const userPurchases = useMemo(() => {
    const purchasedRefs = ledgerEntries
      .filter(entry => entry.buyerEmail === user.email || entry.buyerOrganizationId === user.uid)
      .map(entry => entry.assetId);
    return assets.filter(a => purchasedRefs.includes(a.id));
  }, [assets, ledgerEntries, user]);

  // User Listings
  const userListings = useMemo(() => {
    return assets.filter(a => a.author === user.username || a.author === user.email || a.developerId === user.email || a.id.includes('custom_') || a.id.includes('pub_'));
  }, [assets, user]);

  // Authoritative Financial Calculations via revenuePolicyEngine (0.25% Indiv / 0.27% Group / 0.50% Org)
  const sellerAccountType: SellerAccountType = user.accountType === 'ORGANIZATION' ? 'ORGANIZATION' : 'INDIVIDUAL';
  const activeFeePercent = revenuePolicyEngine.getFeePercentForAccount(sellerAccountType);
  const activeRoyaltyPercent = (100 - activeFeePercent).toFixed(2);
  const splitSim = revenuePolicyEngine.calculateRevenueSplit({
    grossAmountMinorUnits: Math.round(sellPriceUsd * 100),
    currency: 'USD',
    sellerAccountType: sellerAccountType,
    paymentChannel: 'pesapal'
  });
  const calculatedFee = (splitSim.catalyxFeeMinorUnits / 100).toFixed(2);
  const calculatedEarnings = (splitSim.sellerGrossPlatformEarningsMinorUnits / 100).toFixed(2);

  // Execute Quality Scan in Sell Flow
  const handleRunQualityScan = () => {
    setIsScanningQuality(true);
    workToMarketService.evaluateWorkQuality(
      selectedWorkId || `draft_${Date.now()}`,
      'work_object',
      sellTitle || 'Untitled Product',
      sellDescription || 'Comprehensive digital asset.',
      { category: sellCategory, itemsCount: 1 }
    ).then((report) => {
      setSellQualityScan(report);
      setIsScanningQuality(false);
      setSellStep(4);
    }).catch(() => {
      setIsScanningQuality(false);
    });
  };

  // Complete Sell & Publish
  const handlePublishWork = () => {
    const priceMinorUnits = Math.round(sellPriceUsd * 100);

    workToMarketService.publishWorkToMarketplace({
      workObjectId: selectedWorkId || undefined,
      title: sellTitle,
      category: sellCategory as any,
      description: sellDescription,
      authorEmail: user.email,
      authorName: user.username,
      organizationId: user.uid,
      pricingModel: sellPricingModel,
      priceMinorUnits: priceMinorUnits,
      currency: 'USD',
      tags: sellTags.split(',').map(t => t.trim()),
      licensingTerms: {
        licenseType: sellLicense as any,
        redistributionAllowed: false,
        modificationAllowed: true,
        attributionRequired: true,
        termsSummary: `Standard ${sellLicense} licensing terms authorized by creator.`
      },
      visibility: 'PUBLIC'
    });

    setPublishSuccess(true);
    setRefreshTrigger(prev => prev + 1);
  };

  // Execute Purchase
  const handleConfirmPurchase = () => {
    if (!selectedProduct) return;
    
    const result = workToMarketService.recordTransaction({
      idempotencyKey: `txn_${Date.now()}_${selectedProduct.id}`,
      assetId: selectedProduct.id,
      assetTitle: selectedProduct.title,
      buyerEmail: user.email,
      buyerName: user.username,
      buyerOrganizationId: user.uid,
      paymentProvider: paymentMethod === 'pesapal' ? 'PESAPAL' : 'CATALYX_INTERNAL_BALANCE'
    });

    if (result.success) {
      MarketplaceService.purchaseAsset(user.uid, selectedProduct.id, user.username, user.email);
      setPurchaseSuccessMessage(`Purchase successful! Reference: ${result.entry?.transactionReference || result.transactionReference}. Item is now in your Purchases library.`);
      setIsPurchaseModalOpen(false);
      setRefreshTrigger(prev => prev + 1);
    } else {
      setPurchaseSuccessMessage(`Transaction failed: ${result.message}`);
    }
  };

  // Submit Dispute
  const handleFileDispute = () => {
    if (!selectedProduct) return;
    const report = workToMarketService.fileDispute({
      assetId: selectedProduct.id,
      assetTitle: selectedProduct.title,
      reporterEmail: user.email,
      reason: (disputeReason as any) || 'POLICY_VIOLATION',
      details: disputeEvidence.trim() || 'The asset functionality diverges from stated description.'
    });
    setDisputeSuccess(`Dispute filed successfully (Reference: ${report.complianceReferenceId || report.reportId}). Compliance team will arbitrate within 24 hours under the 14-day Escrow terms.`);
    setIsDisputeModalOpen(false);
  };

  // Create API Key
  const handleCreateApiKey = () => {
    if (!newKeyName.trim()) return;
    const key = MarketplaceService.createApiKey(user.uid, newKeyName.trim(), ['read', 'write', 'execute'], user.username);
    setRevealedSecret(key.rawSecret);
    setShowKeyModal(false);
    setNewKeyName('');
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      {/* ============================================================== */}
      {/* 1. MARKETPLACE TOP HERO & SEARCH HEADER                       */}
      {/* ============================================================== */}
      <div className="rounded-2xl catalyx-surface-elevated border border-white/10 p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-semibold mb-3">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>CATALYX DIGITAL COMMERCE & MARKETPLACE</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-display font-bold text-white tracking-tight leading-tight">
            Discover Digital Work, Buy Instantly, & Turn Ideas Into Business
          </h1>
          <p className="text-sm text-gray-300 mt-2 leading-relaxed max-w-2xl">
            Explore verified software, slide decks, media packages, autonomous agents, and enterprise workflows. 
            Publish your own CATALYX work in minutes with industry-leading {activeRoyaltyPercent}% creator payouts ({activeFeePercent}% platform fee).
          </p>

          {/* Unified Search Input */}
          <div className="mt-5 flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="What are you looking for? (e.g. Pitch Deck, SOC2 Agent, Media Kit, Pesapal...)"
                className="w-full bg-black/50 border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              onClick={() => {
                setActiveSection('sell');
                setSellStep(1);
              }}
              className="px-5 py-2.5 rounded-xl catalyx-btn-gold text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shrink-0 shadow-md active:scale-95 transition-transform"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Sell Something</span>
            </button>
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-1 scrollbar-thin">
          {categoriesList.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  if (activeSection === 'discover') setActiveSection('shop');
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs whitespace-nowrap transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-semibold shadow-sm'
                    : 'bg-white/5 text-gray-400 border-white/10 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
                <span className="text-[10px] font-mono opacity-60">({cat.count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Notice Feedbacks */}
      {purchaseSuccessMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-emerald-400 text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{purchaseSuccessMessage}</span>
          </div>
          <button onClick={() => setPurchaseSuccessMessage(null)} className="text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {disputeSuccess && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-amber-400 text-xs">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 shrink-0" />
            <span>{disputeSuccess}</span>
          </div>
          <button onClick={() => setDisputeSuccess(null)} className="text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. MAIN MARKETPLACE SECTION TABS                                */}
      {/* ============================================================== */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto">
          {[
            { id: 'discover', label: 'Discover', icon: Sparkles },
            { id: 'shop', label: 'Shop All', icon: ShoppingBag, count: filteredAssets.length },
            { id: 'services', label: 'Services & Freelance', icon: Briefcase },
            { id: 'advertising', label: 'Advertising & Ads', icon: Megaphone },
            { id: 'settings', label: 'Rate Policy', icon: Settings, badge: `${activeFeePercent}% Fee` },
            { id: 'sell', label: 'Sell / Publish', icon: Plus, badge: `${activeRoyaltyPercent}% Share` },
            { id: 'my_listings', label: 'My Listings', icon: Package, count: userListings.length },
            { id: 'purchases', label: 'My Purchases', icon: Download, count: userPurchases.length },
            { id: 'earnings', label: 'Earnings & Payouts', icon: Wallet },
            { id: 'developer', label: 'Developer & APIs', icon: Key, badge: 'Sandbox' }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/10 text-gray-300">
                    {tab.count}
                  </span>
                )}
                {tab.badge && (
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Global Currency & Trust badge */}
        <div className="hidden lg:flex items-center gap-2 text-xs font-mono text-gray-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Double-Entry Escrow Protected</span>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. TAB 1: DISCOVER (FEATURED, TRENDING, NEW, CREATORS)          */}
      {/* ============================================================== */}
      {activeSection === 'discover' && (
        <div className="space-y-8">
          {/* Trending Work Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-amber-400" />
                <h2 className="text-lg font-bold text-white tracking-tight">Trending Digital Work</h2>
                <span className="text-xs text-gray-400 font-mono">Most installed & executed this week</span>
              </div>
              <button
                onClick={() => {
                  setSortBy('trending');
                  setActiveSection('shop');
                }}
                className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <span>View all trending</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {trendingItems.map((asset) => (
                <ProductCard
                  key={asset.id}
                  asset={asset}
                  onSelectProduct={(p) => setSelectedProduct(p)}
                  onInstantBuy={(p) => {
                    setSelectedProduct(p);
                    setIsPurchaseModalOpen(true);
                  }}
                />
              ))}
            </div>
          </section>

          {/* New Releases Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <h2 className="text-lg font-bold text-white tracking-tight">New Releases & Updates</h2>
                <span className="text-xs text-gray-400 font-mono">Freshly audited & published</span>
              </div>
              <button
                onClick={() => {
                  setSortBy('newest');
                  setActiveSection('shop');
                }}
                className="text-xs text-purple-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <span>Browse new work</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {newReleases.map((asset) => (
                <ProductCard
                  key={asset.id}
                  asset={asset}
                  onSelectProduct={(p) => setSelectedProduct(p)}
                  onInstantBuy={(p) => {
                    setSelectedProduct(p);
                    setIsPurchaseModalOpen(true);
                  }}
                />
              ))}
            </div>
          </section>

          {/* Turn Your Work Into Business Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-transparent border border-amber-500/30 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center md:text-left">
              <h3 className="text-base font-bold text-white">Have a Project, Slide Deck, or Workflow in CATALYX?</h3>
              <p className="text-xs text-gray-300 max-w-xl">
                Turn any existing work object into a commercial product in 3 minutes. Keep up to 99.75% of earnings with automatic instant settlements and Pesapal integration.
              </p>
            </div>
            <button
              onClick={() => {
                setActiveSection('sell');
                setSellStep(1);
              }}
              className="px-5 py-2.5 rounded-xl catalyx-btn-gold text-xs font-bold flex items-center gap-2 shrink-0 cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Publish Your Work Now</span>
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. TAB 2: SHOP ALL (FILTERS, SEARCH, SORTING & PRODUCTS)       */}
      {/* ============================================================== */}
      {activeSection === 'shop' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl catalyx-surface-card border border-white/10 text-xs">
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-semibold text-white">Filter:</span>

              {/* Pricing Filter */}
              <select
                value={selectedPricing}
                onChange={(e) => setSelectedPricing(e.target.value)}
                className="bg-black/50 border border-white/10 rounded-lg px-2.5 py-1 text-gray-300 focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="all">All Pricing</option>
                <option value="free">Free Only</option>
                <option value="paid">Paid Only</option>
                <option value="subscription">Subscription</option>
              </select>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-black/50 border border-white/10 rounded-lg px-2.5 py-1 text-gray-300 focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="all">All Categories</option>
                <option value="presentation">Presentations</option>
                <option value="agent">AI Agents</option>
                <option value="workflow">Workflows</option>
                <option value="software">Software & Apps</option>
                <option value="media">Media & Video</option>
                <option value="document">Docs & Templates</option>
                <option value="dataset">Datasets</option>
                <option value="integration">Connectors</option>
              </select>
            </div>

            {/* Sort Control */}
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-black/50 border border-white/10 rounded-lg px-2.5 py-1 text-gray-300 focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="trending">Most Popular / Trending</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest Releases</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Product Grid */}
          {filteredAssets.length === 0 ? (
            <div className="p-12 text-center rounded-2xl catalyx-surface-card border border-white/10">
              <ShoppingBag className="w-10 h-10 text-gray-500 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-white">No digital work found</h3>
              <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                No items match your current filters. Try changing your search keywords or clearing selected filters.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedPricing('all');
                }}
                className="mt-4 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-white cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredAssets.map((asset) => (
                <ProductCard
                  key={asset.id}
                  asset={asset}
                  onSelectProduct={(p) => setSelectedProduct(p)}
                  onInstantBuy={(p) => {
                    setSelectedProduct(p);
                    setIsPurchaseModalOpen(true);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. TAB 3: SELL WORKFLOW (5-STEP PROGRESSIVE WIZARD)            */}
      {/* ============================================================== */}
      {activeSection === 'sell' && (
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Wizard Progress Stepper */}
          <div className="p-4 rounded-2xl catalyx-surface-card border border-white/10">
            <div className="flex items-center justify-between relative">
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/10 -translate-y-1/2 z-0" />
              {[
                { step: 1, label: 'Select Work' },
                { step: 2, label: 'Details' },
                { step: 3, label: 'Pricing & License' },
                { step: 4, label: 'Quality Scan' },
                { step: 5, label: 'Publish' }
              ].map((s) => {
                const isComplete = sellStep > s.step;
                const isCurrent = sellStep === s.step;
                return (
                  <div key={s.step} className="relative z-10 flex flex-col items-center">
                    <button
                      onClick={() => {
                        if (s.step < sellStep) setSellStep(s.step);
                      }}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all cursor-pointer ${
                        isComplete
                          ? 'bg-amber-500 text-black shadow-md'
                          : isCurrent
                          ? 'bg-amber-500/20 text-amber-300 border-2 border-amber-500'
                          : 'bg-slate-900 text-gray-500 border border-white/20'
                      }`}
                    >
                      {isComplete ? <Check className="w-4 h-4" /> : s.step}
                    </button>
                    <span className={`text-[11px] font-medium mt-1.5 whitespace-nowrap ${
                      isCurrent ? 'text-amber-400 font-bold' : 'text-gray-400'
                    }`}>
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* STEP 1: Select Work Source */}
          {sellStep === 1 && (
            <div className="p-6 rounded-2xl catalyx-surface-card border border-white/10 space-y-5">
              <div>
                <h3 className="text-lg font-bold text-white">Step 1: What are you selling?</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Choose an existing work object from CATALYX or create a new listing.
                </p>
              </div>

              {/* Source Option Pills */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => setSellSource('existing_work')}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                    sellSource === 'existing_work'
                      ? 'bg-amber-500/15 border-amber-500/50 text-white shadow-sm'
                      : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-sm text-amber-400 mb-1">
                    <Layers className="w-4 h-4" />
                    <span>Choose from My CATALYX Work</span>
                  </div>
                  <p className="text-xs text-gray-400">
                    Select from your existing Projects, Presentations, Media, or Workflows.
                  </p>
                </button>

                <button
                  onClick={() => setSellSource('custom_upload')}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                    sellSource === 'custom_upload'
                      ? 'bg-amber-500/15 border-amber-500/50 text-white shadow-sm'
                      : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-sm text-purple-400 mb-1">
                    <Package className="w-4 h-4" />
                    <span>Create New Custom Listing</span>
                  </div>
                  <p className="text-xs text-gray-400">
                    Upload standalone software, PDF document, dataset, or package link.
                  </p>
                </button>
              </div>

              {/* Existing Work List */}
              {sellSource === 'existing_work' && (
                <div className="space-y-3 pt-2">
                  <label className="text-xs font-mono text-gray-400 uppercase">Available CATALYX Work Items ({existingWorkItems.length}):</label>
                  <div className="max-h-60 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                    {existingWorkItems.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          setSelectedWorkId(item.id);
                          setSellTitle(item.title);
                          setSellDescription(item.description);
                          if (item.workType === 'PRESENTATION') setSellCategory('presentation');
                          else if (item.workType === 'PROJECT') setSellCategory('workflow');
                        }}
                        className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          selectedWorkId === item.id
                            ? 'bg-amber-500/20 border-amber-500 text-white shadow-sm'
                            : 'bg-black/40 border-white/10 text-gray-300 hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                            {item.workType === 'PRESENTATION' ? <Presentation className="w-4 h-4" /> : <Layers className="w-4 h-4" />}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-white">{item.title}</h4>
                            <p className="text-[11px] text-gray-400 line-clamp-1">{item.description}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-gray-300 uppercase shrink-0">
                          {item.workType}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-4 border-t border-white/10">
                <button
                  onClick={() => setSellStep(2)}
                  disabled={sellSource === 'existing_work' && !selectedWorkId}
                  className="px-5 py-2.5 rounded-xl catalyx-btn-gold text-xs font-bold flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span>Continue to Details</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Details & Category */}
          {sellStep === 2 && (
            <div className="p-6 rounded-2xl catalyx-surface-card border border-white/10 space-y-4">
              <div>
                <h3 className="text-lg font-bold text-white">Step 2: Listing Details</h3>
                <p className="text-xs text-gray-400 mt-0.5">Define category, title, description, and preview media.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono text-gray-400 uppercase block mb-1">Product Category</label>
                  <select
                    value={sellCategory}
                    onChange={(e) => setSellCategory(e.target.value as MarketplaceCategory)}
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="presentation">Presentation & Slides Deck</option>
                    <option value="software">Software & Application</option>
                    <option value="agent">Autonomous AI Agent</option>
                    <option value="workflow">Workflow & Automation</option>
                    <option value="media">Video & Media Studio</option>
                    <option value="document">Document & Template</option>
                    <option value="dataset">Research & Dataset</option>
                    <option value="integration">Connector & API</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-mono text-gray-400 uppercase block mb-1">Product Title</label>
                  <input
                    type="text"
                    value={sellTitle}
                    onChange={(e) => setSellTitle(e.target.value)}
                    placeholder="e.g. Q4 Executive Pitch Deck 2026"
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-gray-400 uppercase block mb-1">Product Description</label>
                <textarea
                  rows={3}
                  value={sellDescription}
                  onChange={(e) => setSellDescription(e.target.value)}
                  placeholder="Explain what the buyer gets, key deliverables, and prerequisites..."
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono text-gray-400 uppercase block mb-1">Tags (Comma-separated)</label>
                  <input
                    type="text"
                    value={sellTags}
                    onChange={(e) => setSellTags(e.target.value)}
                    placeholder="e.g. Finance, Presentation, Strategy"
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-gray-400 uppercase block mb-1">Demo / Preview URL (Optional)</label>
                  <input
                    type="text"
                    value={sellDemoUrl}
                    onChange={(e) => setSellDemoUrl(e.target.value)}
                    placeholder="https://example.com/demo"
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-white/10">
                <button
                  onClick={() => setSellStep(1)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-gray-300 cursor-pointer"
                >
                  Back
                </button>
                <button
                  onClick={() => setSellStep(3)}
                  disabled={!sellTitle.trim()}
                  className="px-5 py-2.5 rounded-xl catalyx-btn-gold text-xs font-bold flex items-center gap-2 cursor-pointer disabled:opacity-40"
                >
                  <span>Continue to Pricing</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Pricing & Licensing */}
          {sellStep === 3 && (
            <div className="p-6 rounded-2xl catalyx-surface-card border border-white/10 space-y-5">
              <div>
                <h3 className="text-lg font-bold text-white">Step 3: Pricing, Royalties & Licensing</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Set transparent pricing with clear creator payouts ({activeRoyaltyPercent}% to you, {activeFeePercent}% platform fee).
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono text-gray-400 uppercase block mb-1">Pricing Model</label>
                  <select
                    value={sellPricingModel}
                    onChange={(e) => setSellPricingModel(e.target.value as MarketplacePricingModel)}
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="one_time">One-Time Purchase</option>
                    <option value="monthly_subscription">Monthly Subscription</option>
                    <option value="annual_subscription">Annual Subscription</option>
                    <option value="free">Free / Open Resource</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-mono text-gray-400 uppercase block mb-1">Price (USD)</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">$</span>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={sellPriceUsd}
                      onChange={(e) => setSellPriceUsd(parseFloat(e.target.value) || 0)}
                      disabled={sellPricingModel === 'free'}
                      className="w-full bg-black/50 border border-white/15 rounded-xl pl-8 pr-4 py-2 text-xs text-white focus:outline-none focus:border-amber-500 disabled:opacity-40"
                    />
                  </div>
                </div>
              </div>

              {/* Creator Earnings Breakdown Card */}
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider font-bold">
                  Authoritative Revenue Share ({activeFeePercent}% Platform Fee / {activeRoyaltyPercent}% Creator Royalties)
                </span>
                <div className="grid grid-cols-3 gap-2 pt-1 text-center font-mono">
                  <div className="p-2.5 rounded-lg bg-black/40 border border-white/10">
                    <span className="text-[10px] text-gray-400 block">Listing Price</span>
                    <span className="text-sm font-bold text-white">${sellPriceUsd.toFixed(2)}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-black/40 border border-white/10">
                    <span className="text-[10px] text-gray-400 block">Platform Fee ({activeFeePercent}%)</span>
                    <span className="text-sm font-bold text-rose-400">-${calculatedFee}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40">
                    <span className="text-[10px] text-emerald-300 block">You Receive ({activeRoyaltyPercent}%)</span>
                    <span className="text-sm font-bold text-emerald-400">+${calculatedEarnings}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-gray-400 uppercase block mb-1">Licensing Terms</label>
                <select
                  value={sellLicense}
                  onChange={(e) => setSellLicense(e.target.value as any)}
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="COMMERCIAL_NON_EXCLUSIVE">Commercial Non-Exclusive (Standard)</option>
                  <option value="SINGLE_USER_PERSONAL">Single-User Personal License</option>
                  <option value="ENTERPRISE_UNLIMITED">Enterprise Unlimited Multi-Seat License</option>
                </select>
              </div>

              <div className="flex justify-between pt-4 border-t border-white/10">
                <button
                  onClick={() => setSellStep(2)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-gray-300 cursor-pointer"
                >
                  Back
                </button>
                <button
                  onClick={handleRunQualityScan}
                  className="px-5 py-2.5 rounded-xl catalyx-btn-gold text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <span>Run Quality Review</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Quality & Integrity Scan */}
          {sellStep === 4 && (
            <div className="p-6 rounded-2xl catalyx-surface-card border border-white/10 space-y-5">
              <div>
                <h3 className="text-lg font-bold text-white">Step 4: Quality & Security Verification</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Automated scan against security criteria, malicious code, and completeness standards.
                </p>
              </div>

              {isScanningQuality ? (
                <div className="p-8 text-center space-y-3">
                  <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
                  <p className="text-xs text-gray-300 font-mono">Running AST parser, MIME validation & sandbox scan...</p>
                </div>
              ) : sellQualityScan ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="w-8 h-8 text-emerald-400 shrink-0" />
                      <div>
                        <h4 className="text-sm font-bold text-white">Quality Audit Passed (Score: {sellQualityScan.overallScore}/100)</h4>
                        <p className="text-xs text-emerald-300">Ready for public listing. No malicious patterns or broken links detected.</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                      VERIFIED
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-mono">
                    <div className="p-2.5 rounded-lg bg-black/40 border border-white/10">
                      <span className="text-[10px] text-gray-400 block">Clarity</span>
                      <span className="text-emerald-400 font-bold">{sellQualityScan.dimensions?.clarity || 85}/100</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-black/40 border border-white/10">
                      <span className="text-[10px] text-gray-400 block">Structure</span>
                      <span className="text-emerald-400 font-bold">{sellQualityScan.dimensions?.structure || 80}/100</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-black/40 border border-white/10">
                      <span className="text-[10px] text-gray-400 block">Audience Fit</span>
                      <span className="text-emerald-400 font-bold">{sellQualityScan.dimensions?.audienceSuitability || 90}/100</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-black/40 border border-white/10">
                      <span className="text-[10px] text-gray-400 block">Commercial</span>
                      <span className="text-emerald-400 font-bold">{sellQualityScan.dimensions?.commercialViability || 85}/100</span>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="flex justify-between pt-4 border-t border-white/10">
                <button
                  onClick={() => setSellStep(3)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-gray-300 cursor-pointer"
                >
                  Back
                </button>
                <button
                  onClick={() => setSellStep(5)}
                  className="px-5 py-2.5 rounded-xl catalyx-btn-gold text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <span>Continue to Preview</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: Preview & Final Publish */}
          {sellStep === 5 && (
            <div className="p-6 rounded-2xl catalyx-surface-card border border-white/10 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white">Step 5: Preview & Publish</h3>
                <p className="text-xs text-gray-400 mt-0.5">Review your listing card exactly as buyers will see it.</p>
              </div>

              {/* Live Preview Card */}
              <div className="max-w-sm mx-auto p-4 rounded-2xl catalyx-surface-elevated border border-amber-500/40 shadow-xl space-y-3">
                <div className="h-32 rounded-xl bg-gradient-to-tr from-amber-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center relative">
                  <span className="text-xs font-mono font-bold text-amber-300 uppercase px-2.5 py-1 rounded-full bg-black/60 border border-amber-500/40">
                    {sellCategory}
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white line-clamp-1">{sellTitle}</h4>
                  <p className="text-xs text-gray-400 line-clamp-2 mt-0.5">{sellDescription}</p>
                </div>
                <div className="flex items-center justify-between text-xs font-mono pt-2 border-t border-white/10">
                  <span className="text-gray-400">{user.username}</span>
                  <span className="text-sm font-bold text-amber-400">${sellPriceUsd.toFixed(2)}</span>
                </div>
              </div>

              {publishSuccess ? (
                <div className="p-6 text-center space-y-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                  <h4 className="text-base font-bold text-white">Product Published Successfully!</h4>
                  <p className="text-xs text-gray-300 max-w-sm mx-auto">
                    Your product is live in the CATALYX Marketplace. You will receive up to 99.75% royalties on every purchase directly into your earnings ledger.
                  </p>
                  <div className="flex justify-center gap-3 pt-2">
                    <button
                      onClick={() => {
                        setActiveSection('shop');
                        setPublishSuccess(false);
                      }}
                      className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-white cursor-pointer"
                    >
                      View in Marketplace
                    </button>
                    <button
                      onClick={() => {
                        setActiveSection('my_listings');
                        setPublishSuccess(false);
                      }}
                      className="px-4 py-2 rounded-xl catalyx-btn-gold text-xs font-bold cursor-pointer"
                    >
                      Manage My Listings
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between pt-4 border-t border-white/10">
                  <button
                    onClick={() => setSellStep(4)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-gray-300 cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    onClick={handlePublishWork}
                    className="px-6 py-2.5 rounded-xl catalyx-btn-gold text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Publish & Start Selling</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 6. TAB 4: MY LISTINGS (PRODUCTS I HAVE PUBLISHED)             */}
      {/* ============================================================== */}
      {activeSection === 'my_listings' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">My Active Listings</h3>
              <p className="text-xs text-gray-400">Products and tools you have published on CATALYX.</p>
            </div>
            <button
              onClick={() => {
                setActiveSection('sell');
                setSellStep(1);
              }}
              className="px-3.5 py-1.5 rounded-xl catalyx-btn-gold text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Listing</span>
            </button>
          </div>

          {userListings.length === 0 ? (
            <div className="p-12 text-center rounded-2xl catalyx-surface-card border border-white/10">
              <Package className="w-10 h-10 text-gray-500 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-white">No listings published yet</h4>
              <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                Turn your presentations, workflows, and projects into digital products and earn up to 99.75% royalties.
              </p>
              <button
                onClick={() => {
                  setActiveSection('sell');
                  setSellStep(1);
                }}
                className="mt-4 px-4 py-2 rounded-xl catalyx-btn-gold text-xs font-bold cursor-pointer"
              >
                Create Your First Listing
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {userListings.map((listing) => (
                <div key={listing.id} className="p-4 rounded-xl catalyx-surface-card border border-white/10 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 uppercase">
                        {listing.type}
                      </span>
                      <h4 className="text-sm font-bold text-white mt-1.5 line-clamp-1">{listing.title}</h4>
                    </div>
                    <span className="text-xs font-mono font-bold text-amber-400">
                      ${(listing.priceMinorUnits / 100).toFixed(2)}
                    </span>
                  </div>

                  <p className="text-xs text-gray-400 line-clamp-2">{listing.description}</p>

                  <div className="grid grid-cols-3 gap-2 py-2 border-y border-white/10 text-center font-mono text-[11px]">
                    <div>
                      <span className="text-[10px] text-gray-400 block">Installs</span>
                      <span className="text-white font-bold">{listing.installCount || 0}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 block">Rating</span>
                      <span className="text-amber-400 font-bold">★ {listing.rating || '5.0'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 block">Revenue</span>
                      <span className="text-emerald-400 font-bold">
                        ${(((listing.installCount || 0) * listing.priceMinorUnits * 0.90) / 100).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => setSelectedProduct(listing)}
                      className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview</span>
                    </button>
                    <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Live & Published
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 7. TAB 5: MY PURCHASES (BOUGHT ITEMS, DOWNLOADS & RECEIPTS)    */}
      {/* ============================================================== */}
      {activeSection === 'purchases' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-bold text-white">My Purchases & Downloads</h3>
            <p className="text-xs text-gray-400">Digital work and software you have licensed on CATALYX.</p>
          </div>

          {userPurchases.length === 0 ? (
            <div className="p-12 text-center rounded-2xl catalyx-surface-card border border-white/10">
              <Download className="w-10 h-10 text-gray-500 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-white">No purchases yet</h4>
              <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                Explore the marketplace to discover slide decks, workflows, media bundles, and autonomous agents.
              </p>
              <button
                onClick={() => setActiveSection('shop')}
                className="mt-4 px-4 py-2 rounded-xl catalyx-btn-gold text-xs font-bold cursor-pointer"
              >
                Browse Marketplace
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {userPurchases.map((item) => (
                <div key={item.id} className="p-4 rounded-xl catalyx-surface-card border border-white/10 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 uppercase">
                        LICENSED
                      </span>
                      <h4 className="text-sm font-bold text-white mt-1.5 line-clamp-1">{item.title}</h4>
                      <p className="text-[11px] text-gray-400">By {item.author}</p>
                    </div>
                    <span className="text-xs font-mono font-bold text-gray-300">v{item.version}</span>
                  </div>

                  <p className="text-xs text-gray-400 line-clamp-2">{item.description}</p>

                  <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                    <button
                      onClick={() => {
                        if (item.type === 'presentation') onNavigate('presentations');
                        else if (item.type === 'video' || (item.type as string) === 'media') onNavigate('media');
                        else if (item.type === 'workflow') onNavigate('workflows');
                        else onNavigate('universal-work');
                      }}
                      className="flex-1 py-2 rounded-lg catalyx-btn-gold text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open in CATALYX</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedProduct(item);
                        setIsDisputeModalOpen(true);
                      }}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-rose-400 cursor-pointer"
                      title="File Support or Dispute"
                    >
                      <Scale className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 8. TAB 6: EARNINGS & PAYOUTS                                   */}
      {/* ============================================================== */}
      {activeSection === 'earnings' && (
        <div className="space-y-6">
          {/* Earnings KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-xl catalyx-surface-card border border-white/10">
              <span className="text-xs font-mono text-gray-400 uppercase">Total Revenue Earned</span>
              <div className="text-2xl font-display font-bold text-white mt-1">$4,850.00</div>
              <span className="text-[11px] text-emerald-400 font-mono mt-1 block">↑ +$620.00 this month</span>
            </div>

            <div className="p-5 rounded-xl catalyx-surface-card border border-white/10">
              <span className="text-xs font-mono text-gray-400 uppercase">Available for Payout</span>
              <div className="text-2xl font-display font-bold text-emerald-400 mt-1">$1,420.00</div>
              <button
                onClick={() => setShowPayoutModal(true)}
                className="mt-2 px-3 py-1 rounded-lg catalyx-btn-gold text-xs font-bold cursor-pointer"
              >
                Withdraw via Pesapal
              </button>
            </div>

            <div className="p-5 rounded-xl catalyx-surface-card border border-white/10">
              <span className="text-xs font-mono text-gray-400 uppercase">In 14-Day Escrow</span>
              <div className="text-2xl font-display font-bold text-amber-400 mt-1">$350.00</div>
              <span className="text-[11px] text-gray-400 font-mono mt-1 block">Clears automatically</span>
            </div>
          </div>

          {/* Double-Entry Ledger History */}
          <div className="p-5 rounded-xl catalyx-surface-card border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white">Immutable Double-Entry Ledger</h4>
              <span className="text-xs font-mono text-gray-400">Cryptographic SHA-256 Verified</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono text-left">
                <thead className="text-gray-400 border-b border-white/10">
                  <tr>
                    <th className="py-2">Transaction ID</th>
                    <th className="py-2">Asset</th>
                    <th className="py-2">Gross</th>
                    <th className="py-2">Creator Share ({activeRoyaltyPercent}%)</th>
                    <th className="py-2">Platform Fee ({activeFeePercent}%)</th>
                    <th className="py-2">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {ledgerEntries.slice(0, 6).map((entry) => (
                    <tr key={entry.id} className="hover:bg-white/[0.02]">
                      <td className="py-2.5 text-amber-400 font-bold truncate max-w-[120px]">{entry.transactionReference || entry.id}</td>
                      <td className="py-2.5 text-gray-300 truncate max-w-[180px]">{entry.assetTitle}</td>
                      <td className="py-2.5 text-white font-bold">${(entry.amountMinorUnits / 100).toFixed(2)}</td>
                      <td className="py-2.5 text-emerald-400 font-bold">+${(entry.creatorPayoutMinorUnits / 100).toFixed(2)}</td>
                      <td className="py-2.5 text-gray-400">-${(entry.platformCommissionMinorUnits / 100).toFixed(2)}</td>
                      <td className="py-2.5 text-gray-400">{new Date(entry.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 9. TAB 7: DEVELOPER & APIS (PRESERVES ALL ADVANCED RUNTIMES)   */}
      {/* ============================================================== */}
      {activeSection === 'developer' && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 border-b border-white/10 pb-2">
            {[
              { id: 'api_keys', label: 'API Keys & Secrets', icon: Key },
              { id: 'webhooks', label: 'Webhook Relays', icon: Webhook },
              { id: 'sandbox', label: 'Sandbox Execution Runtime', icon: Terminal }
            ].map((t) => {
              const Icon = t.icon;
              const isActive = devSubTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setDevSubTab(t.id as any)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isActive ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* Sub-tab 1: API Keys */}
          {devSubTab === 'api_keys' && (
            <div className="p-5 rounded-xl catalyx-surface-card border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">API Authentication Keys</h4>
                  <p className="text-xs text-gray-400">Programmatically execute agents, trigger workflows, and query data.</p>
                </div>
                <button
                  onClick={() => setShowKeyModal(true)}
                  className="px-3.5 py-1.5 rounded-lg catalyx-btn-gold text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Generate Key</span>
                </button>
              </div>

              {revealedSecret && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-amber-400">
                    <span>Key Secret (Copy now, never shown again):</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(revealedSecret);
                        setCopiedKey(true);
                        setTimeout(() => setCopiedKey(false), 2000);
                      }}
                      className="text-white hover:underline flex items-center gap-1"
                    >
                      {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey ? 'Copied' : 'Copy Key'}</span>
                    </button>
                  </div>
                  <code className="block p-2 rounded bg-black/60 text-xs font-mono text-white break-all">
                    {revealedSecret}
                  </code>
                </div>
              )}

              <div className="space-y-2">
                {MarketplaceService.getApiKeys(user.uid).map((k) => (
                  <div key={k.id} className="p-3 rounded-lg bg-black/40 border border-white/10 flex items-center justify-between text-xs font-mono">
                    <div>
                      <span className="text-white font-bold">{k.name}</span>
                      <span className="text-gray-500 ml-2">Prefix: {k.prefix}...</span>
                    </div>
                    <span className="text-emerald-400 font-bold">ACTIVE</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sub-tab 2: Sandbox */}
          {devSubTab === 'sandbox' && (
            <div className="p-5 rounded-xl catalyx-surface-card border border-white/10 space-y-4">
              <div>
                <h4 className="text-sm font-bold text-white">Isolated Developer Sandbox</h4>
                <p className="text-xs text-gray-400">Safely test autonomous agent payloads in a dry-run environment.</p>
              </div>

              <textarea
                rows={5}
                value={sandboxPayload}
                onChange={(e) => setSandboxPayload(e.target.value)}
                className="w-full bg-black/60 border border-white/15 rounded-xl p-3 font-mono text-xs text-white focus:outline-none focus:border-amber-500"
              />

              <button
                onClick={async () => {
                  setIsSandboxRunning(true);
                  try {
                    let parsed = {};
                    try { parsed = JSON.parse(sandboxPayload || '{}'); } catch { parsed = { raw: sandboxPayload }; }
                    const res = await DeveloperSandboxService.executeSandboxTest(
                      user.uid,
                      {
                        targetType: 'marketplace_asset',
                        targetId: 'agent_strategy_exec',
                        inputPayload: parsed,
                        dryRun: true
                      },
                      user.username || 'Developer'
                    );
                    setSandboxResult(res);
                  } catch (e) {
                    console.error(e);
                  } finally {
                    setIsSandboxRunning(false);
                  }
                }}
                disabled={isSandboxRunning}
                className="px-4 py-2 rounded-xl catalyx-btn-gold text-xs font-bold flex items-center gap-2 cursor-pointer"
              >
                {isSandboxRunning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                <span>Execute Dry-Run</span>
              </button>

              {sandboxResult && (
                <div className="p-4 rounded-xl bg-black/60 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-emerald-400 font-bold">Execution Status: {sandboxResult.status}</span>
                    <span className="text-gray-400">{sandboxResult.durationMs}ms</span>
                  </div>
                  <pre className="text-xs font-mono text-gray-300 overflow-x-auto p-2 bg-black/40 rounded">
                    {JSON.stringify(sandboxResult.output || sandboxResult.policyEvaluations, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB: RATE POLICY & ECONOMIC SETTINGS                          */}
      {/* ============================================================== */}
      {activeSection === 'settings' && (
        <MarketplaceSettingsTab user={user} activeRole={activeRole} />
      )}

      {/* ============================================================== */}
      {/* TAB: ADVERTISING & SPONSORED MEDIA                            */}
      {/* ============================================================== */}
      {activeSection === 'advertising' && (
        <AdvertisingHubView user={user} activeRole={activeRole} />
      )}

      {/* ============================================================== */}
      {/* TAB: PROFESSIONAL SERVICES & FREELANCE PACKAGES               */}
      {/* ============================================================== */}
      {activeSection === 'services' && (
        <ProfessionalServicesView user={user} activeRole={activeRole} onNavigate={onNavigate} />
      )}

      {/* ============================================================== */}
      {/* 10. PRODUCT DETAIL MODAL (PREVIEW, SPECS, REVIEWS & BUY)       */}
      {/* ============================================================== */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto catalyx-surface-elevated rounded-2xl border border-white/15 p-6 space-y-5 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 uppercase font-bold">
                  {selectedProduct.type}
                </span>
                <h2 className="text-xl font-display font-bold text-white mt-2">{selectedProduct.title}</h2>
                <p className="text-xs text-gray-400 mt-0.5">Created by <strong className="text-gray-200">{selectedProduct.author}</strong> • Version {selectedProduct.version}</p>
              </div>
              <button onClick={() => setSelectedProduct(null)} className="text-gray-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Preview Banner */}
            <div className="h-44 rounded-xl bg-gradient-to-tr from-amber-500/20 via-purple-500/20 to-black border border-white/10 flex items-center justify-center relative">
              <div className="text-center space-y-2">
                <Sparkles className="w-8 h-8 text-amber-400 mx-auto" />
                <span className="text-xs font-mono text-gray-300 block">Interactive CATALYX Preview Ready</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-mono uppercase text-gray-400 mb-1">Description</h4>
              <p className="text-xs text-gray-200 leading-relaxed">{selectedProduct.description}</p>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5">
              {selectedProduct.tags?.map((t) => (
                <span key={t} className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-gray-300 border border-white/10">
                  #{t}
                </span>
              ))}
            </div>

            {/* Pricing & Purchase Action */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <div>
                <span className="text-[10px] font-mono text-gray-400 block uppercase">Price</span>
                <div className="text-2xl font-display font-bold text-amber-400">
                  {selectedProduct.pricingModel === 'free' ? 'FREE' : `$${(selectedProduct.priceMinorUnits / 100).toFixed(2)}`}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-gray-300 cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => setIsPurchaseModalOpen(true)}
                  className="px-6 py-2.5 rounded-xl catalyx-btn-gold text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{selectedProduct.pricingModel === 'free' ? 'Get for Free' : 'Purchase Now'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 11. CHECKOUT / PURCHASE MODAL                                  */}
      {/* ============================================================== */}
      {isPurchaseModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full catalyx-surface-elevated rounded-2xl border border-amber-500/40 p-6 space-y-5 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-display font-bold text-white">Confirm Commercial License</h3>
                <p className="text-xs text-gray-400 mt-0.5">{selectedProduct.title}</p>
              </div>
              <button onClick={() => setIsPurchaseModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-gray-400 uppercase">Payment Method</label>
              <div className="space-y-2">
                <label className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                  paymentMethod === 'balance' ? 'bg-amber-500/15 border-amber-500 text-white' : 'bg-black/40 border-white/10 text-gray-400'
                }`}>
                  <div className="flex items-center gap-2 text-xs">
                    <Wallet className="w-4 h-4 text-amber-400" />
                    <span>CATALYX Account Balance</span>
                  </div>
                  <input
                    type="radio"
                    name="payment_choice"
                    checked={paymentMethod === 'balance'}
                    onChange={() => setPaymentMethod('balance')}
                    className="accent-amber-500"
                  />
                </label>

                <label className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                  paymentMethod === 'pesapal' ? 'bg-amber-500/15 border-amber-500 text-white' : 'bg-black/40 border-white/10 text-gray-400'
                }`}>
                  <div className="flex items-center gap-2 text-xs">
                    <Receipt className="w-4 h-4 text-emerald-400" />
                    <span>Pesapal v3 (Card, M-PESA & Mobile Money)</span>
                  </div>
                  <input
                    type="radio"
                    name="payment_choice"
                    checked={paymentMethod === 'pesapal'}
                    onChange={() => setPaymentMethod('pesapal')}
                    className="accent-amber-500"
                  />
                </label>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="p-3.5 rounded-xl bg-black/50 border border-white/10 text-xs font-mono space-y-1.5">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal</span>
                <span>${(selectedProduct.priceMinorUnits / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Platform Escrow Fee</span>
                <span>$0.00 (Included)</span>
              </div>
              <div className="flex justify-between text-white font-bold pt-1.5 border-t border-white/10 text-sm">
                <span>Total Due</span>
                <span className="text-amber-400">${(selectedProduct.priceMinorUnits / 100).toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsPurchaseModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-gray-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPurchase}
                className="px-5 py-2.5 rounded-xl catalyx-btn-gold text-xs font-bold cursor-pointer shadow-md"
              >
                Confirm & License
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 12. FILE DISPUTE / SUPPORT MODAL                              */}
      {/* ============================================================== */}
      {isDisputeModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full catalyx-surface-elevated rounded-2xl border border-white/15 p-6 space-y-4 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-white">File Escrow Dispute</h3>
                <p className="text-xs text-gray-400 mt-0.5">{selectedProduct.title}</p>
              </div>
              <button onClick={() => setIsDisputeModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-xs font-mono text-gray-400 uppercase block mb-1">Dispute Reason</label>
              <select
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value as any)}
                className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="MISLEADING_FUNCTIONALITY">Misleading functionality or broken code</option>
                <option value="SECURITY_VULNERABILITY">Security flaw or undeclared telemetry</option>
                <option value="LICENSE_VIOLATION">Intellectual property or license violation</option>
                <option value="UNAUTHORIZED_FINANCIAL_ACTIVITY">Incorrect billing or unauthorized charge</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-mono text-gray-400 uppercase block mb-1">Evidence & Description</label>
              <textarea
                rows={3}
                value={disputeEvidence}
                onChange={(e) => setDisputeEvidence(e.target.value)}
                placeholder="Explain the specific deviation or defect..."
                className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
              <button
                onClick={() => setIsDisputeModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-gray-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleFileDispute}
                className="px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-xs font-bold text-white cursor-pointer"
              >
                Submit Dispute
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payout Modal */}
      {showPayoutModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full catalyx-surface-elevated rounded-2xl border border-white/15 p-6 space-y-4 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Pesapal / Mobile Money Payout</h3>
                <p className="text-xs text-gray-400 mt-0.5">Available for transfer: $1,420.00 USD</p>
              </div>
              <button onClick={() => setShowPayoutModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-xs font-mono text-gray-400 uppercase block mb-1">Payout Channel</label>
              <select
                value={payoutMethod}
                onChange={(e) => setPayoutMethod(e.target.value as any)}
                className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="pesapal">Pesapal Wallet / Instant Clearing</option>
                <option value="mobile_money">M-PESA / Airtel Money (East Africa)</option>
                <option value="bank_wire">SWIFT / International Bank Wire</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-mono text-gray-400 uppercase block mb-1">Account / Phone Number</label>
              <input
                type="text"
                value={payoutAccountId}
                onChange={(e) => setPayoutAccountId(e.target.value)}
                className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
              <button
                onClick={() => setShowPayoutModal(false)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-gray-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowPayoutModal(false);
                  setPurchaseSuccessMessage('Payout request registered. Settlement batch initiated to your Pesapal account.');
                }}
                className="px-5 py-2 rounded-xl catalyx-btn-gold text-xs font-bold cursor-pointer"
              >
                Request Payout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generate API Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full catalyx-surface-elevated rounded-2xl border border-white/15 p-6 space-y-4 shadow-2xl">
            <div className="flex items-start justify-between">
              <h3 className="text-base font-bold text-white">Generate Developer API Key</h3>
              <button onClick={() => setShowKeyModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-xs font-mono text-gray-400 uppercase block mb-1">Key Label / App Name</label>
              <input
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="e.g. Production Automation Worker"
                className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
              <button
                onClick={() => setShowKeyModal(false)}
                className="px-4 py-2 rounded-xl bg-white/5 text-xs text-gray-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateApiKey}
                className="px-5 py-2 rounded-xl catalyx-btn-gold text-xs font-bold cursor-pointer"
              >
                Create Key
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// SUB-COMPONENT: REAL PRODUCT CARD
// ============================================================================
interface ProductCardProps {
  asset: MarketplaceAsset;
  onSelectProduct: (asset: MarketplaceAsset) => void;
  onInstantBuy: (asset: MarketplaceAsset) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  asset,
  onSelectProduct,
  onInstantBuy
}) => {
  const isFree = asset.pricingModel === 'free';
  const priceDisplay = isFree ? 'FREE' : `$${(asset.priceMinorUnits / 100).toFixed(2)}`;

  // Category Icon & Color
  const getCategoryBadge = () => {
    switch (asset.type) {
      case 'presentation': return { bg: 'bg-amber-500/20 text-amber-300 border-amber-500/30', label: 'PRESENTATION' };
      case 'agent': return { bg: 'bg-purple-500/20 text-purple-300 border-purple-500/30', label: 'AI AGENT' };
      case 'workflow': return { bg: 'bg-blue-500/20 text-blue-300 border-blue-500/30', label: 'WORKFLOW' };
      case 'video':
      case 'video_demo':
      case 'media' as any: return { bg: 'bg-pink-500/20 text-pink-300 border-pink-500/30', label: 'VIDEO' };
      case 'dataset': return { bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', label: 'DATASET' };
      default: return { bg: 'bg-white/10 text-gray-300 border-white/10', label: String(asset.type).toUpperCase() };
    }
  };

  const badge = getCategoryBadge();

  return (
    <div className="rounded-xl catalyx-surface-card border border-white/10 hover:border-amber-500/40 p-4 flex flex-col justify-between transition-all group hover:shadow-lg">
      <div className="space-y-3">
        {/* Card Header Thumbnail / Preview Box */}
        <div 
          onClick={() => onSelectProduct(asset)}
          className="h-28 rounded-lg bg-gradient-to-tr from-black/80 to-slate-900 border border-white/5 flex items-center justify-center relative cursor-pointer overflow-hidden group-hover:border-amber-500/20 transition-colors"
        >
          <span className={`absolute top-2 left-2 text-[9px] font-mono px-2 py-0.5 rounded border ${badge.bg}`}>
            {badge.label}
          </span>
          <span className="text-[9px] font-mono text-gray-500 absolute bottom-2 right-2">
            v{asset.version}
          </span>
          <Eye className="w-6 h-6 text-gray-600 group-hover:text-amber-400 transition-colors" />
        </div>

        {/* Title & Description */}
        <div>
          <h3 
            onClick={() => onSelectProduct(asset)}
            className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-1 cursor-pointer"
          >
            {asset.title}
          </h3>
          <p className="text-xs text-gray-400 line-clamp-2 mt-1 leading-relaxed">
            {asset.description}
          </p>
        </div>
      </div>

      {/* Footer Details & Action */}
      <div className="pt-3 mt-3 border-t border-white/10 space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-gray-400 truncate max-w-[120px]">{asset.author}</span>
          <div className="flex items-center gap-1 text-amber-400">
            <Star className="w-3 h-3 fill-amber-400" />
            <span className="font-bold">{asset.rating || '5.0'}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div>
            <span className="text-sm font-display font-bold text-white">{priceDisplay}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onSelectProduct(asset)}
              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-semibold text-gray-300 hover:text-white transition-colors cursor-pointer"
            >
              Details
            </button>
            <button
              onClick={() => onInstantBuy(asset)}
              className="px-3 py-1 rounded-lg catalyx-btn-gold text-[11px] font-bold transition-transform active:scale-95 cursor-pointer shadow-sm"
            >
              {isFree ? 'Get' : 'Buy'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
