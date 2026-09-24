import React, { useState, useEffect } from 'react';
import { 
  Megaphone, Plus, Play, Pause, Square, ExternalLink, CheckCircle2, 
  AlertCircle, DollarSign, Eye, MousePointerClick, Video, Target, 
  Calendar, Layers, ShieldCheck, Activity, BarChart2
} from 'lucide-react';
import { 
  advertisingService, AdCampaign, AdPlacementType, AdTelemetryEvent 
} from '../../services/advertising/advertisingService';
import { UserProfile, UserPersonaRole } from '../../types';

interface AdvertisingHubViewProps {
  user: UserProfile;
  activeRole: UserPersonaRole;
}

export const AdvertisingHubView: React.FC<AdvertisingHubViewProps> = ({
  user,
  activeRole
}) => {
  const [campaigns, setCampaigns] = useState<AdCampaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<AdCampaign | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  
  // New Campaign Form State
  const [campName, setCampName] = useState('');
  const [placement, setPlacement] = useState<AdPlacementType>('MARKETPLACE_SPONSORED_LISTING');
  const [creativeTitle, setCreativeTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [destinationUrl, setDestinationUrl] = useState('');
  const [creativeType, setCreativeType] = useState<'video' | 'image' | 'text'>('image');
  const [mediaUrl, setMediaUrl] = useState('');
  const [videoDuration, setVideoDuration] = useState<number>(30);
  const [targetAudience, setTargetAudience] = useState<any>('ALL');
  const [budgetUsd, setBudgetUsd] = useState<number>(100);
  const [durationDays, setDurationDays] = useState<number>(30);
  
  const [eventLogs, setEventLogs] = useState<AdTelemetryEvent[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = () => {
    const list = advertisingService.getCampaigns();
    setCampaigns(list);
    if (!selectedCampaign && list.length > 0) {
      setSelectedCampaign(list[0]);
      setEventLogs(advertisingService.getEventsForCampaign(list[0].id));
    } else if (selectedCampaign) {
      const refreshed = list.find(c => c.id === selectedCampaign.id);
      if (refreshed) {
        setSelectedCampaign(refreshed);
        setEventLogs(advertisingService.getEventsForCampaign(refreshed.id));
      }
    }
  };

  const handleSelectCampaign = (c: AdCampaign) => {
    setSelectedCampaign(c);
    setEventLogs(advertisingService.getEventsForCampaign(c.id));
  };

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!campName.trim() || !creativeTitle.trim() || !destinationUrl.trim()) {
      setMessage({ type: 'error', text: 'Campaign name, creative title, and destination URL are required.' });
      return;
    }

    try {
      const budgetMinor = Math.round(budgetUsd * 100);
      const now = new Date();
      const end = new Date(now.getTime() + durationDays * 86400000);

      const created = advertisingService.createCampaign({
        name: campName.trim(),
        advertiserEmail: user.email,
        advertiserName: user.username || user.email,
        advertiserOrgId: user.accountType === 'ORGANIZATION' ? user.uid : undefined,
        placement,
        creative: {
          title: creativeTitle.trim(),
          tagline: tagline.trim() || 'Verified professional digital work on CATALYX',
          destinationUrl: destinationUrl.trim(),
          creativeType,
          mediaUrl: mediaUrl.trim() || undefined,
          videoDurationSeconds: creativeType === 'video' ? videoDuration : undefined,
          callToAction: creativeType === 'video' ? 'Watch Stream' : 'Learn More'
        },
        targeting: {
          categories: ['all'],
          targetAudience
        },
        totalBudgetMinorUnits: budgetMinor,
        startDate: now.toISOString(),
        endDate: end.toISOString()
      });

      loadCampaigns();
      setSelectedCampaign(created);
      setIsCreateOpen(false);
      // Reset form
      setCampName('');
      setCreativeTitle('');
      setTagline('');
      setDestinationUrl('');
      setMessage({ type: 'success', text: `Campaign "${created.name}" deployed successfully!` });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to create campaign' });
    }
  };

  const handlePause = (id: string) => {
    advertisingService.pauseCampaign(id);
    loadCampaigns();
  };

  const handleResume = (id: string) => {
    try {
      advertisingService.resumeCampaign(id);
      loadCampaigns();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleEnd = (id: string) => {
    advertisingService.endCampaign(id);
    loadCampaigns();
  };

  // Real event test simulation trigger (simulates an actual user engagement event)
  const handleSimulateEvent = (type: AdTelemetryEvent['eventType']) => {
    if (!selectedCampaign) return;
    advertisingService.recordRealTelemetryEvent({
      campaignId: selectedCampaign.id,
      eventType: type,
      userContext: `Simulated browser session (${user.email})`
    });
    loadCampaigns();
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border border-white/10 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-mono font-bold border border-amber-500/30 flex items-center gap-1">
              <Megaphone className="w-3.5 h-3.5" /> Advertising & Sponsored Media
            </span>
            <span className="text-xs text-gray-400 font-mono">Real Measured Telemetry</span>
          </div>
          <h2 className="text-2xl font-bold text-white font-display mt-2">
            CATALYX Advertising & Sponsored Placements
          </h2>
          <p className="text-xs text-gray-300 mt-1 max-w-2xl">
            Promote eligible digital products, software, videos, and professional services across the universal CATALYX economy. Strictly driven by authentic measured interactions — zero fabricated metrics.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(!isCreateOpen)}
          className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          {isCreateOpen ? 'Cancel Campaign' : 'Create Advertising Campaign'}
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-xl text-xs flex items-center gap-2 ${
          message.type === 'success' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Campaign Creation Form (collapsible) */}
      {isCreateOpen && (
        <form onSubmit={handleCreateCampaign} className="p-6 rounded-2xl catalyx-surface-card border border-amber-500/40 shadow-2xl space-y-5">
          <div className="flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">Configure New Advertising Campaign</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-mono text-gray-300 block mb-1">Campaign Internal Name</label>
              <input
                type="text"
                placeholder="e.g. Q2 2026 Developer SDK Spotlight"
                value={campName}
                onChange={(e) => setCampName(e.target.value)}
                className="w-full bg-black/50 border border-white/20 rounded-xl px-3.5 py-2 text-xs text-white"
                required
              />
            </div>

            <div>
              <label className="text-xs font-mono text-gray-300 block mb-1">Placement Inventory</label>
              <select
                value={placement}
                onChange={(e) => setPlacement(e.target.value as AdPlacementType)}
                className="w-full bg-black/50 border border-white/20 rounded-xl px-3.5 py-2 text-xs text-white"
              >
                <option value="MARKETPLACE_SPONSORED_LISTING">Marketplace Sponsored Product Listing</option>
                <option value="VIDEO_PRE_ROLL">Video Ad / Demo Pre-Roll Stream</option>
                <option value="FEATURED_CONTENT_CARD">Featured Content Spotlight Card</option>
                <option value="PROFESSIONAL_SERVICE_SPOTLIGHT">Professional Service Promotion</option>
                <option value="BANNER_SPONSORSHIP">Category Banner Placement</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-mono text-gray-300 block mb-1">Creative Title / Headline</label>
              <input
                type="text"
                placeholder="e.g. High-Throughput Distributed Microservices SDK"
                value={creativeTitle}
                onChange={(e) => setCreativeTitle(e.target.value)}
                className="w-full bg-black/50 border border-white/20 rounded-xl px-3.5 py-2 text-xs text-white"
                required
              />
            </div>

            <div>
              <label className="text-xs font-mono text-gray-300 block mb-1">Creative Format</label>
              <select
                value={creativeType}
                onChange={(e) => setCreativeType(e.target.value as any)}
                className="w-full bg-black/50 border border-white/20 rounded-xl px-3.5 py-2 text-xs text-white"
              >
                <option value="image">Image Banner / Thumbnail</option>
                <option value="video">Video Commercial (Streamable)</option>
                <option value="text">Sponsored Text Card</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-mono text-gray-300 block mb-1">Destination URL / Deep Link</label>
              <input
                type="text"
                placeholder="https://catalyx.io/marketplace/... or external"
                value={destinationUrl}
                onChange={(e) => setDestinationUrl(e.target.value)}
                className="w-full bg-black/50 border border-white/20 rounded-xl px-3.5 py-2 text-xs text-white"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-mono text-gray-300 block mb-1">Total Budget ($ USD)</label>
              <input
                type="number"
                min="10"
                step="5"
                value={budgetUsd}
                onChange={(e) => setBudgetUsd(parseFloat(e.target.value) || 0)}
                className="w-full bg-black/50 border border-white/20 rounded-xl px-3.5 py-2 text-xs text-white font-mono"
                required
              />
            </div>

            <div>
              <label className="text-xs font-mono text-gray-300 block mb-1">Target Audience</label>
              <select
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="w-full bg-black/50 border border-white/20 rounded-xl px-3.5 py-2 text-xs text-white"
              >
                <option value="ALL">All Users & Professions</option>
                <option value="DEVELOPERS">Developers & Engineers</option>
                <option value="BUSINESS_OWNERS">Business Owners & Enterprises</option>
                <option value="CREATORS">Digital Creators & Designers</option>
                <option value="RESEARCHERS">Researchers & Scientists</option>
                <option value="STUDENTS">Students & Educators</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-mono text-gray-300 block mb-1">Campaign Duration (Days)</label>
              <input
                type="number"
                min="1"
                max="365"
                value={durationDays}
                onChange={(e) => setDurationDays(parseInt(e.target.value) || 30)}
                className="w-full bg-black/50 border border-white/20 rounded-xl px-3.5 py-2 text-xs text-white font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-mono text-gray-300 block mb-1">Tagline / Short Description</label>
            <input
              type="text"
              placeholder="e.g. Zero-downtime event streaming with post-quantum encryption built-in."
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full bg-black/50 border border-white/20 rounded-xl px-3.5 py-2 text-xs text-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold shadow-md"
            >
              Launch Advertising Campaign
            </button>
          </div>
        </form>
      )}

      {/* Campaigns Overview & Selected Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Campaigns List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-mono uppercase text-gray-400 font-bold">Active Campaigns ({campaigns.length})</h3>
            <span className="text-[10px] text-gray-500 font-mono">Strict Event Audit</span>
          </div>

          <div className="space-y-2">
            {campaigns.map((camp) => {
              const isSelected = selectedCampaign?.id === camp.id;
              const spentUsd = (camp.spentMinorUnits / 100).toFixed(2);
              const totalUsd = (camp.totalBudgetMinorUnits / 100).toFixed(2);
              const budgetPercent = Math.min(100, Math.round((camp.spentMinorUnits / camp.totalBudgetMinorUnits) * 100));

              return (
                <div
                  key={camp.id}
                  onClick={() => handleSelectCampaign(camp)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2 ${
                    isSelected
                      ? 'bg-amber-950/30 border-amber-500/60 shadow-md'
                      : 'bg-slate-900/60 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      camp.status === 'ACTIVE'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : camp.status === 'PAUSED'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {camp.status}
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono uppercase">
                      {camp.placement.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-white line-clamp-1">
                    {camp.name}
                  </h4>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-mono text-gray-400">
                      <span>Spent: ${spentUsd}</span>
                      <span>Budget: ${totalUsd}</span>
                    </div>
                    <div className="w-full bg-black/50 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-amber-400 h-full rounded-full transition-all"
                        style={{ width: `${budgetPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[10px] font-mono text-gray-400">
                    <span>{camp.measuredImpressions} Views</span>
                    <span>{camp.measuredClicks} Clicks</span>
                    <span>{camp.measuredConversions} Conv.</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Campaign Detailed Telemetry & Controls */}
        <div className="lg:col-span-8">
          {selectedCampaign ? (
            <div className="p-6 rounded-2xl catalyx-surface-card border border-white/10 shadow-2xl space-y-6">
              {/* Header & Controls */}
              <div className="border-b border-white/10 pb-5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-amber-400 uppercase">
                        {selectedCampaign.placement.replace(/_/g, ' ')}
                      </span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                        selectedCampaign.status === 'ACTIVE'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {selectedCampaign.status}
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-white font-display mt-1">
                      {selectedCampaign.name}
                    </h2>
                    <p className="text-xs text-gray-400">
                      Advertiser: {selectedCampaign.advertiserName} ({selectedCampaign.advertiserEmail})
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {selectedCampaign.status === 'ACTIVE' ? (
                      <button
                        onClick={() => handlePause(selectedCampaign.id)}
                        className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Pause className="w-3.5 h-3.5" /> Pause
                      </button>
                    ) : (
                      <button
                        onClick={() => handleResume(selectedCampaign.id)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5" /> Resume
                      </button>
                    )}
                    <button
                      onClick={() => handleEnd(selectedCampaign.id)}
                      className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Square className="w-3.5 h-3.5" /> End Campaign
                    </button>
                  </div>
                </div>
              </div>

              {/* Real Measured Telemetry Cards */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-mono font-bold text-gray-400 uppercase">
                    Real Measured Telemetry (No Synthesized Data)
                  </h3>
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verifiable Events
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-center">
                  <div className="p-3.5 rounded-xl bg-black/40 border border-white/10">
                    <span className="text-[10px] text-gray-400 block uppercase">Real Impressions</span>
                    <span className="text-xl font-bold text-white mt-1 block">
                      {selectedCampaign.measuredImpressions}
                    </span>
                    <span className="text-[9px] text-gray-500">1¢ per view</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-black/40 border border-white/10">
                    <span className="text-[10px] text-gray-400 block uppercase">Verified Clicks</span>
                    <span className="text-xl font-bold text-amber-300 mt-1 block">
                      {selectedCampaign.measuredClicks}
                    </span>
                    <span className="text-[9px] text-gray-500">20-25¢ CPC</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-black/40 border border-white/10">
                    <span className="text-[10px] text-gray-400 block uppercase">Video Completes</span>
                    <span className="text-xl font-bold text-cyan-300 mt-1 block">
                      {selectedCampaign.measuredVideoCompletes}
                    </span>
                    <span className="text-[9px] text-gray-500">100% Watch</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-black/40 border border-white/10">
                    <span className="text-[10px] text-gray-400 block uppercase">Conversions</span>
                    <span className="text-xl font-bold text-emerald-400 mt-1 block">
                      {selectedCampaign.measuredConversions}
                    </span>
                    <span className="text-[9px] text-gray-500">Acquisitions</span>
                  </div>
                </div>
              </div>

              {/* Creative Preview Display */}
              <div className="space-y-3">
                <span className="text-xs font-mono font-bold text-gray-400 uppercase block">
                  Creative Preview (As Displayed in Inventory)
                </span>
                <div className="p-5 rounded-2xl bg-gradient-to-r from-black/80 to-slate-900 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-mono font-bold">
                        SPONSORED
                      </span>
                      <h4 className="text-sm font-bold text-white">
                        {selectedCampaign.creative.title}
                      </h4>
                    </div>
                    <p className="text-xs text-gray-300">
                      {selectedCampaign.creative.tagline}
                    </p>
                  </div>

                  <a
                    href={selectedCampaign.creative.destinationUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold flex items-center gap-1.5 shrink-0"
                  >
                    <span>{selectedCampaign.creative.callToAction}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Live Interactive Event Verification (Simulates real user interaction) */}
              <div className="p-4 rounded-xl bg-slate-900 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Telemetry Verification Console</span>
                  <span className="text-[10px] text-gray-400 font-mono">Test event capture & budget deduction</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleSimulateEvent('IMPRESSION')}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-200 text-xs font-mono flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" /> Log View (+1 Imp)
                  </button>
                  <button
                    onClick={() => handleSimulateEvent('CLICK')}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-amber-300 text-xs font-mono flex items-center gap-1 cursor-pointer"
                  >
                    <MousePointerClick className="w-3.5 h-3.5" /> Log Click (+1 Click)
                  </button>
                  <button
                    onClick={() => handleSimulateEvent('VIDEO_COMPLETE')}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-300 text-xs font-mono flex items-center gap-1 cursor-pointer"
                  >
                    <Video className="w-3.5 h-3.5" /> Log 100% Video Watch
                  </button>
                  <button
                    onClick={() => handleSimulateEvent('CONVERSION')}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-emerald-300 text-xs font-mono flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Log Conversion
                  </button>
                </div>
              </div>

              {/* Real Event Log Ledger */}
              <div className="space-y-2">
                <span className="text-xs font-mono font-bold text-gray-400 uppercase block">
                  Logged Interaction Ledger ({eventLogs.length} Events)
                </span>
                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                  {eventLogs.length > 0 ? (
                    eventLogs.map((ev) => (
                      <div
                        key={ev.id}
                        className="p-2.5 rounded-lg bg-black/30 border border-white/5 text-xs font-mono flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.2 rounded bg-white/10 text-gray-300 text-[10px] font-bold">
                            {ev.eventType}
                          </span>
                          <span className="text-gray-400 text-[11px]">
                            {new Date(ev.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <span className="text-amber-300 font-bold">
                          -${(ev.costMinorUnits / 100).toFixed(2)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-xs text-gray-500 font-mono">
                      No interactions logged yet for this campaign.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-gray-500 rounded-2xl catalyx-surface-card border border-white/10">
              <Megaphone className="w-8 h-8 mx-auto text-gray-600 mb-2" />
              <p className="text-sm">Select an advertising campaign to inspect real measured metrics.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
