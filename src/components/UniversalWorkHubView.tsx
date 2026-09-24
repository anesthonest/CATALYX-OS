import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Share2, 
  Eye, 
  FileText, 
  Presentation, 
  Play, 
  Calendar, 
  DollarSign, 
  ChevronRight, 
  X, 
  Layers, 
  Sliders, 
  Check, 
  ArrowUpRight,
  ShieldCheck,
  Building,
  Users,
  Target,
  Sparkles,
  ShoppingBag,
  Award,
  Scale,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { 
  UniversalWorkObject, 
  UniversalWorkType, 
  WorkStatus, 
  WorkPriority, 
  SecurityClassification,
  WorkQualityReviewReport,
  MarketplaceCategory,
  MarketplacePricingModel,
  MarketplaceLicensingTerms
} from '../types';
import { universalWorkService } from '../services/universalWorkService';
import { presentationsService } from '../services/presentationsService';
import { demosService } from '../services/demosService';
import { meetingsService } from '../services/meetingsService';
import { filesVaultService } from '../services/filesVaultService';
import { workToMarketService } from '../services/workToMarketService';

interface UniversalWorkHubViewProps {
  user: { uid: string; email: string; username: string };
  activeRole: string;
  onNavigate: (tabId: string, itemId?: string) => void;
}

export const UniversalWorkHubView: React.FC<UniversalWorkHubViewProps> = ({
  user,
  onNavigate
}) => {
  const [workItems, setWorkItems] = useState<UniversalWorkObject[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<WorkStatus | 'ALL'>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<WorkPriority | 'ALL'>('ALL');

  const [selectedWork, setSelectedWork] = useState<UniversalWorkObject | null>(null);
  const [inspectorTab, setInspectorTab] = useState<'overview' | 'milestones' | 'artifacts' | 'governance' | 'financials'>('overview');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // New Work Form State
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<UniversalWorkType>('PROJECT');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState<WorkPriority>('MEDIUM');
  const [newClassification, setNewClassification] = useState<SecurityClassification>('INTERNAL');
  const [newBudget, setNewBudget] = useState('');
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');

  // Inspector Quick Action Form State
  const [quickTaskTitle, setQuickTaskTitle] = useState('');
  const [quickMilestoneTitle, setQuickMilestoneTitle] = useState('');
  const [quickDecisionText, setQuickDecisionText] = useState('');
  const [quickDecisionRationale, setQuickDecisionRationale] = useState('');

  // V27 Work-to-Market & Quality Assistant State
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [publishCategory, setPublishCategory] = useState<MarketplaceCategory>('presentation');
  const [publishPricingModel, setPublishPricingModel] = useState<MarketplacePricingModel>('one_time');
  const [publishPrice, setPublishPrice] = useState('49.00');
  const [publishLicenseType, setPublishLicenseType] = useState<MarketplaceLicensingTerms['licenseType']>('COMMERCIAL_NON_EXCLUSIVE');
  const [publishTags, setPublishTags] = useState('Enterprise, Architecture, Production');
  const [isPublishing, setIsPublishing] = useState(false);

  const [isQualityModalOpen, setIsQualityModalOpen] = useState(false);
  const [qualityReport, setQualityReport] = useState<WorkQualityReviewReport | null>(null);
  const [isEvaluatingQuality, setIsEvaluatingQuality] = useState(false);

  const handleRunQualityAssistant = async (targetWork?: UniversalWorkObject) => {
    const work = targetWork || selectedWork;
    if (!work) return;

    setIsEvaluatingQuality(true);
    setIsQualityModalOpen(true);

    try {
      // First attempt server-side AI evaluation with Gemini resilience
      const resp = await fetch('/api/v27/work-quality-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetId: work.id,
          targetType: work.workType === 'PRESENTATION' ? 'presentation' : work.workType === 'DEMO' ? 'demo' : 'work_object',
          title: work.title,
          description: work.description,
          contentDetails: {
            category: work.workType,
            tags: work.tags,
            itemsCount: work.milestones.length + work.tasks.length,
            textLength: (work.description || '').length
          }
        })
      });

      if (resp.ok) {
        const data = await resp.json();
        setQualityReport(data);
      } else {
        // Fallback to grounded client service
        const localReport = await workToMarketService.evaluateWorkQuality(
          work.id,
          work.workType === 'PRESENTATION' ? 'presentation' : 'work_object',
          work.title,
          work.description,
          {
            category: work.workType,
            tags: work.tags,
            itemsCount: work.milestones.length + work.tasks.length,
            textLength: (work.description || '').length
          }
        );
        setQualityReport(localReport);
      }
    } catch (e) {
      // Grounded offline fallback
      const localReport = await workToMarketService.evaluateWorkQuality(
        work.id,
        work.workType === 'PRESENTATION' ? 'presentation' : 'work_object',
        work.title,
        work.description,
        {
          category: work.workType,
          tags: work.tags,
          itemsCount: work.milestones.length + work.tasks.length,
          textLength: (work.description || '').length
        }
      );
      setQualityReport(localReport);
    } finally {
      setIsEvaluatingQuality(false);
    }
  };

  const handlePublishToMarket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWork) return;

    setIsPublishing(true);
    try {
      const priceMinor = Math.round(parseFloat(publishPrice || '0') * 100);
      const parsedTags = publishTags.split(',').map(t => t.trim()).filter(Boolean);

      const licensing: MarketplaceLicensingTerms = {
        licenseType: publishLicenseType,
        redistributionAllowed: false,
        modificationAllowed: publishLicenseType !== 'COMMERCIAL_NON_EXCLUSIVE',
        attributionRequired: true,
        termsSummary: publishLicenseType === 'COMMERCIAL_NON_EXCLUSIVE'
          ? 'Authorizes commercial usage and internal organizational deployment.'
          : publishLicenseType === 'ENTERPRISE_ORGANIZATIONAL'
          ? 'Full enterprise-wide deployment rights across all organizational units.'
          : 'Open-access organizational reference.'
      };

      const result = workToMarketService.publishWorkToMarketplace({
        workObjectId: selectedWork.id,
        workspaceId: selectedWork.organization,
        title: selectedWork.title,
        category: publishCategory,
        description: selectedWork.description,
        authorEmail: user.email || selectedWork.owner,
        authorName: user.username || selectedWork.owner.split('@')[0],
        organizationId: selectedWork.organization,
        pricingModel: publishPricingModel,
        priceMinorUnits: priceMinor,
        currency: 'USD',
        tags: parsedTags,
        licensingTerms: licensing,
        visibility: 'PUBLIC'
      });

      if (result.success) {
        showNotification(result.message);
        setIsPublishModalOpen(false);
        refreshWork();
      } else {
        showNotification(result.message);
      }
    } catch (err: any) {
      showNotification(err?.message || 'Publication failed');
    } finally {
      setIsPublishing(false);
    }
  };

  const refreshWork = () => {
    const list = universalWorkService.getAllWork({
      status: statusFilter,
      priority: priorityFilter,
      search: searchQuery
    });
    setWorkItems(list);
    if (selectedWork) {
      const updated = universalWorkService.getWorkById(selectedWork.id);
      if (updated) setSelectedWork(updated);
    }
  };

  useEffect(() => {
    refreshWork();
  }, [statusFilter, priorityFilter, searchQuery]);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleCreateWork = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const budgetMinor = newBudget ? Math.round(parseFloat(newBudget) * 100) : undefined;
    const initialMilestones = newMilestoneTitle.trim() ? [
      { id: `m_${Date.now()}`, title: newMilestoneTitle.trim(), targetDate: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString(), reached: false }
    ] : [];

    const created = universalWorkService.createWork({
      title: newTitle.trim(),
      workType: newType,
      description: newDesc.trim(),
      priority: newPriority,
      securityClassification: newClassification,
      financialInfo: budgetMinor ? { budgetMinorUnits: budgetMinor, currency: 'USD' } : undefined,
      milestones: initialMilestones,
      organization: 'Vinexsah Global Holdings',
      workspace: 'ws_eng_alpha'
    }, user.email);

    setIsCreateModalOpen(false);
    setNewTitle('');
    setNewDesc('');
    setNewBudget('');
    setNewMilestoneTitle('');
    refreshWork();
    setSelectedWork(created);
    showNotification(`Universal work created: "${created.title}"`);
  };

  const handleToggleMilestone = (milestoneId: string) => {
    if (!selectedWork) return;
    universalWorkService.toggleMilestone(selectedWork.id, milestoneId, user.email);
    refreshWork();
    showNotification('Milestone status updated');
  };

  const handleToggleTask = (taskId: string) => {
    if (!selectedWork) return;
    universalWorkService.toggleTask(selectedWork.id, taskId, user.email);
    refreshWork();
    showNotification('Task status updated');
  };

  const handleAddQuickTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWork || !quickTaskTitle.trim()) return;
    universalWorkService.addTask(selectedWork.id, quickTaskTitle.trim(), user.email, user.email);
    setQuickTaskTitle('');
    refreshWork();
    showNotification('Task added to work object');
  };

  const handleAddQuickMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWork || !quickMilestoneTitle.trim()) return;
    universalWorkService.addMilestone(selectedWork.id, {
      title: quickMilestoneTitle.trim(),
      targetDate: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString(),
      reached: false
    }, user.email);
    setQuickMilestoneTitle('');
    refreshWork();
    showNotification('Milestone added');
  };

  const handleAddQuickDecision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWork || !quickDecisionText.trim()) return;
    universalWorkService.addDecision(
      selectedWork.id,
      quickDecisionText.trim(),
      quickDecisionRationale.trim(),
      user.email
    );
    setQuickDecisionText('');
    setQuickDecisionRationale('');
    refreshWork();
    showNotification('Decision recorded in permanent governance log');
  };

  const handleStatusChange = (newStatus: WorkStatus) => {
    if (!selectedWork) return;
    universalWorkService.updateWork(selectedWork.id, { status: newStatus }, user.email, `Changed status to ${newStatus}`);
    refreshWork();
    showNotification(`Work status transitioned to ${newStatus}`);
  };

  // Filtered by category
  const filteredWork = workItems.filter(item => {
    if (categoryFilter === 'ALL') return true;
    if (categoryFilter === 'STRATEGY' && ['INITIATIVE', 'STRATEGIC_PLAN', 'BUSINESS_PLAN', 'GOAL', 'PROGRAM'].includes(item.workType)) return true;
    if (categoryFilter === 'SOFTWARE' && ['SOFTWARE_PROJECT', 'APPLICATION', 'WEBSITE', 'PROTOTYPE', 'DEMO'].includes(item.workType)) return true;
    if (categoryFilter === 'PARTNERSHIP' && ['PARTNERSHIP', 'PARTNERSHIP_PROPOSAL', 'JOINT_VENTURE', 'CONTRACT'].includes(item.workType)) return true;
    if (categoryFilter === 'COMMERCE' && ['COMMERCE_WORK', 'ORDER', 'PRODUCT', 'FINANCIAL_WORK', 'ANALYTICS'].includes(item.workType)) return true;
    if (categoryFilter === 'MEDIA' && ['CAMPAIGN', 'MEDIA_PROJECT', 'VIDEO', 'AUDIO', 'PRESENTATION'].includes(item.workType)) return true;
    return false;
  });

  // Calculate high-level stats
  const totalCount = workItems.length;
  const inProgressCount = workItems.filter(w => w.status === 'IN_PROGRESS').length;
  const underReviewCount = workItems.filter(w => w.status === 'UNDER_REVIEW').length;
  const completedCount = workItems.filter(w => w.status === 'COMPLETED').length;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0f172a] border border-cyan-500/50 text-cyan-300 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-cyan-400" />
          <span className="text-sm font-medium text-white">{notification}</span>
          {notification.toLowerCase().includes('marketplace') && (
            <button
              onClick={() => onNavigate('marketplace-api')}
              className="ml-2 px-3 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <span>View in Catalog</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Header */}
      <div className="bg-[#0f172a]/80 border border-gray-800 p-6 rounded-2xl relative overflow-hidden backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider bg-brand-purple/20 text-brand-purple border border-brand-purple/30">
                CATALYX V25 UNIVERSAL ENGINE
              </span>
              <span className="text-xs text-gray-400">Polymorphic Universal Work Architecture</span>
            </div>
            <h1 className="text-2xl font-display font-semibold text-white tracking-tight">
              Universal Work Architecture
            </h1>
            <p className="text-sm text-gray-400 mt-1 max-w-2xl">
              Coordinated management of any legitimate form of digital work—spanning software initiatives, strategic plans, research studies, commercial ledgers, presentations, demos, meetings, and cross-organization partnerships.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('partnerships')}
              className="px-4 py-2.5 rounded-xl border border-gray-700 bg-gray-800/80 hover:bg-gray-800 text-gray-200 text-xs font-medium transition flex items-center gap-2"
            >
              <Building className="w-4 h-4 text-brand-cyan" />
              <span>Partnership Alliances</span>
            </button>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-purple to-brand-cyan hover:opacity-95 text-white text-xs font-semibold shadow-lg shadow-brand-purple/20 transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>New Work Object</span>
            </button>
          </div>
        </div>

        {/* Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-gray-800/80">
          <div className="bg-gray-900/60 border border-gray-800 p-3 rounded-xl">
            <div className="text-xs text-gray-400">Total Work Objects</div>
            <div className="text-xl font-display font-semibold text-white mt-1">{totalCount}</div>
          </div>
          <div className="bg-gray-900/60 border border-gray-800 p-3 rounded-xl">
            <div className="text-xs text-gray-400">Active / In Progress</div>
            <div className="text-xl font-display font-semibold text-brand-cyan mt-1">{inProgressCount}</div>
          </div>
          <div className="bg-gray-900/60 border border-gray-800 p-3 rounded-xl">
            <div className="text-xs text-gray-400">Governance Review</div>
            <div className="text-xl font-display font-semibold text-amber-400 mt-1">{underReviewCount}</div>
          </div>
          <div className="bg-gray-900/60 border border-gray-800 p-3 rounded-xl">
            <div className="text-xs text-gray-400">Completed & Verified</div>
            <div className="text-xl font-display font-semibold text-emerald-400 mt-1">{completedCount}</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0f172a]/60 border border-gray-800 p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search work, tags, types..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-900/80 border border-gray-700/80 rounded-lg text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-brand-purple transition"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            { id: 'ALL', label: 'All Work' },
            { id: 'STRATEGY', label: 'Strategy & Initiatives' },
            { id: 'SOFTWARE', label: 'Software & Sandboxes' },
            { id: 'PARTNERSHIP', label: 'Partnerships' },
            { id: 'COMMERCE', label: 'Commerce & Analytics' },
            { id: 'MEDIA', label: 'Media & Campaigns' }
          ].map(c => (
            <button
              key={c.id}
              onClick={() => setCategoryFilter(c.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                categoryFilter === c.id
                  ? 'bg-brand-purple text-white'
                  : 'bg-gray-900/60 text-gray-400 hover:text-gray-200 border border-gray-800'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Status Dropdown Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <Filter className="w-3.5 h-3.5 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-gray-900/80 border border-gray-700/80 text-xs text-gray-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-brand-purple"
          >
            <option value="ALL">All Statuses</option>
            <option value="PLANNED">Planned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      </div>

      {/* Main Work Objects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredWork.map(work => {
          const reachedMilestones = work.milestones.filter(m => m.reached).length;
          const totalMilestones = work.milestones.length;
          const milestonePercent = totalMilestones > 0 ? Math.round((reachedMilestones / totalMilestones) * 100) : 0;

          const completedTasks = work.tasks.filter(t => t.completed).length;
          const totalTasks = work.tasks.length;

          return (
            <div 
              key={work.id}
              className="bg-[#0f172a]/70 border border-gray-800 hover:border-gray-700 p-5 rounded-2xl flex flex-col justify-between transition group shadow-sm"
            >
              <div>
                {/* Card Header: Type & Priority */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-gray-800 text-brand-cyan border border-brand-cyan/20">
                    {work.workType.replace(/_/g, ' ')}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                      work.priority === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                      work.priority === 'HIGH' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                      'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    }`}>
                      {work.priority}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                      work.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                      work.status === 'IN_PROGRESS' ? 'bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30' :
                      work.status === 'UNDER_REVIEW' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                      'bg-gray-800 text-gray-300 border border-gray-700'
                    }`}>
                      {work.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                {/* Title and Description */}
                <h3 className="text-base font-semibold text-white group-hover:text-brand-cyan transition line-clamp-2">
                  {work.title}
                </h3>
                <p className="text-xs text-gray-400 mt-1.5 line-clamp-2 leading-relaxed">
                  {work.description}
                </p>

                {/* Progress Strip */}
                {totalMilestones > 0 && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-[11px] text-gray-400 mb-1">
                      <span>Milestones: {reachedMilestones}/{totalMilestones}</span>
                      <span className="font-mono text-gray-300">{milestonePercent}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-brand-purple to-brand-cyan rounded-full transition-all duration-300"
                        style={{ width: `${milestonePercent}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Linked Artifact Badges */}
                <div className="flex flex-wrap items-center gap-1.5 mt-4 pt-4 border-t border-gray-800/80">
                  {work.presentations.length > 0 && (
                    <span className="px-2 py-0.5 rounded bg-gray-900 border border-gray-800 text-[10px] text-gray-300 flex items-center gap-1">
                      <Presentation className="w-3 h-3 text-purple-400" />
                      <span>{work.presentations.length} Deck</span>
                    </span>
                  )}
                  {work.demos.length > 0 && (
                    <span className="px-2 py-0.5 rounded bg-gray-900 border border-gray-800 text-[10px] text-gray-300 flex items-center gap-1">
                      <Play className="w-3 h-3 text-emerald-400" />
                      <span>{work.demos.length} Demo</span>
                    </span>
                  )}
                  {work.meetings.length > 0 && (
                    <span className="px-2 py-0.5 rounded bg-gray-900 border border-gray-800 text-[10px] text-gray-300 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-brand-cyan" />
                      <span>{work.meetings.length} Meet</span>
                    </span>
                  )}
                  {work.files.length > 0 && (
                    <span className="px-2 py-0.5 rounded bg-gray-900 border border-gray-800 text-[10px] text-gray-300 flex items-center gap-1">
                      <FileText className="w-3 h-3 text-blue-400" />
                      <span>{work.files.length} Files</span>
                    </span>
                  )}
                  {work.financialInfo?.budgetMinorUnits && (
                    <span className="px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-800/50 text-[10px] text-emerald-300 font-mono flex items-center gap-0.5">
                      <DollarSign className="w-3 h-3" />
                      <span>{(work.financialInfo.budgetMinorUnits / 100).toLocaleString()}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-2 mt-5 pt-3 border-t border-gray-800/80">
                <div className="text-[11px] text-gray-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-gray-400" />
                  <span>{completedTasks}/{totalTasks} tasks</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedWork(work);
                      setInspectorTab('overview');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-medium transition flex items-center gap-1"
                  >
                    <Eye className="w-3 h-3" />
                    <span>Inspect</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredWork.length === 0 && (
        <div className="bg-[#0f172a]/40 border border-gray-800 p-12 rounded-2xl text-center">
          <Briefcase className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white">No Universal Work Objects Found</h3>
          <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
            Try adjusting your search criteria or category filter, or initialize a new work object.
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="mt-4 px-4 py-2 rounded-xl bg-brand-purple hover:bg-brand-purple/90 text-white text-xs font-semibold transition"
          >
            Create Work Object
          </button>
        </div>
      )}

      {/* INSPECTOR DRAWER / MODAL */}
      {selectedWork && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-2xl bg-[#0b1120] border-l border-gray-800 h-full flex flex-col justify-between overflow-hidden shadow-2xl animate-in slide-in-from-right duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-800 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-mono uppercase bg-brand-purple/20 text-brand-purple border border-brand-purple/30">
                    {selectedWork.workType}
                  </span>
                  <span className="text-xs text-gray-400">{selectedWork.organization}</span>
                </div>
                <h2 className="text-xl font-display font-semibold text-white">
                  {selectedWork.title}
                </h2>
              </div>
              <button
                onClick={() => setSelectedWork(null)}
                className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sub-Nav Tabs */}
            <div className="flex items-center border-b border-gray-800 px-6 gap-2 overflow-x-auto bg-gray-900/40">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'milestones', label: `Milestones & Tasks (${selectedWork.milestones.length}/${selectedWork.tasks.length})` },
                { id: 'artifacts', label: 'Linked Artifacts' },
                { id: 'governance', label: 'Decisions & Approvals' },
                { id: 'financials', label: 'Financials & Audit' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setInspectorTab(tab.id as any)}
                  className={`py-3 px-3 text-xs font-medium border-b-2 transition whitespace-nowrap ${
                    inspectorTab === tab.id
                      ? 'border-brand-cyan text-brand-cyan'
                      : 'border-transparent text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-6 flex-1 overflow-y-auto space-y-6">
              {inspectorTab === 'overview' && (
                <div className="space-y-5">
                  <div>
                    <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Description</h4>
                    <p className="text-sm text-gray-200 leading-relaxed bg-gray-900/60 p-4 rounded-xl border border-gray-800">
                      {selectedWork.description}
                    </p>
                  </div>

                  {/* Metadata Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-900/40 border border-gray-800 p-3 rounded-xl">
                      <span className="text-[11px] text-gray-400">Security Classification</span>
                      <div className="text-sm font-semibold text-white mt-0.5 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{selectedWork.securityClassification}</span>
                      </div>
                    </div>
                    <div className="bg-gray-900/40 border border-gray-800 p-3 rounded-xl">
                      <span className="text-[11px] text-gray-400">Owner</span>
                      <div className="text-sm font-semibold text-white mt-0.5 truncate">
                        {selectedWork.owner}
                      </div>
                    </div>
                    <div className="bg-gray-900/40 border border-gray-800 p-3 rounded-xl">
                      <span className="text-[11px] text-gray-400">Team</span>
                      <div className="text-sm font-semibold text-white mt-0.5">
                        {selectedWork.team}
                      </div>
                    </div>
                    <div className="bg-gray-900/40 border border-gray-800 p-3 rounded-xl">
                      <span className="text-[11px] text-gray-400">Workflow State</span>
                      <div className="text-sm font-semibold text-brand-cyan mt-0.5">
                        {selectedWork.workflowState}
                      </div>
                    </div>
                  </div>

                  {/* V27 Work-to-Market & Commercial Readiness Panel */}
                  <div className="bg-gradient-to-r from-purple-950/30 to-cyan-950/20 border border-purple-800/40 p-4 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-brand-purple/20 border border-brand-purple/30 text-brand-purple">
                          <ShoppingBag className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Work-to-Market & Commercial Readiness</h4>
                          <p className="text-[11px] text-gray-400">Transform this workspace deliverable into a commercial marketplace product</p>
                        </div>
                      </div>

                      {selectedWork.metadata?.marketplaceAssetId ? (
                        <span className="px-2.5 py-1 rounded-md bg-emerald-950/50 border border-emerald-700/50 text-[10px] font-bold text-emerald-300 uppercase tracking-wide flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Listed on Market
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-md bg-gray-800 border border-gray-700 text-[10px] font-medium text-gray-300">
                          Workspace Stage
                        </span>
                      )}
                    </div>

                    {selectedWork.metadata?.marketplaceAssetId && (
                      <div className="text-xs text-emerald-400 bg-emerald-950/30 p-2.5 rounded-lg border border-emerald-800/40 flex items-center justify-between">
                        <span>Market Asset ID: <strong className="font-mono text-white">{String(selectedWork.metadata.marketplaceAssetId)}</strong></span>
                        <button
                          onClick={() => onNavigate('marketplace-api')}
                          className="text-[11px] font-semibold underline text-brand-cyan hover:text-white flex items-center gap-1"
                        >
                          <span>Open in Catalog</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => handleRunQualityAssistant(selectedWork)}
                        disabled={isEvaluatingQuality}
                        className="flex-1 px-3 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white text-xs font-semibold transition flex items-center justify-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-brand-cyan" />
                        <span>{isEvaluatingQuality ? 'Evaluating Quality...' : 'Run Quality Assistant'}</span>
                      </button>

                      <button
                        onClick={() => {
                          setPublishCategory(
                            selectedWork.workType === 'PRESENTATION' ? 'presentation' :
                            selectedWork.workType === 'DEMO' ? 'video_demo' :
                            selectedWork.workType === 'PROJECT' ? 'software' : 'workflow'
                          );
                          setIsPublishModalOpen(true);
                        }}
                        className="flex-1 px-3 py-2 rounded-xl bg-gradient-to-r from-brand-purple to-brand-cyan hover:brightness-110 text-white text-xs font-semibold shadow-md transition flex items-center justify-center gap-1.5"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>{selectedWork.metadata?.marketplaceAssetId ? 'Update Listing' : 'Publish to Market'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Quick Status Transition */}
                  <div className="bg-gray-900/40 border border-gray-800 p-4 rounded-xl">
                    <h4 className="text-xs font-semibold text-white mb-2">Transition Work Lifecycle Status</h4>
                    <div className="flex flex-wrap gap-2">
                      {(['PLANNED', 'IN_PROGRESS', 'UNDER_REVIEW', 'COMPLETED', 'ARCHIVED'] as WorkStatus[]).map(s => (
                        <button
                          key={s}
                          onClick={() => handleStatusChange(s)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                            selectedWork.status === s
                              ? 'bg-brand-cyan text-black font-semibold'
                              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                          }`}
                        >
                          {s.replace(/_/g, ' ')}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Universal Tags</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedWork.tags.map(tag => (
                        <span key={tag} className="px-2.5 py-1 rounded-md bg-gray-800 text-gray-300 text-xs font-mono">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {inspectorTab === 'milestones' && (
                <div className="space-y-6">
                  {/* Milestones Section */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-white flex items-center gap-1.5">
                        <Target className="w-4 h-4 text-brand-purple" />
                        <span>Work Milestones</span>
                      </h4>
                    </div>

                    <div className="space-y-2">
                      {selectedWork.milestones.map(m => (
                        <div
                          key={m.id}
                          onClick={() => handleToggleMilestone(m.id)}
                          className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                            m.reached 
                              ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300'
                              : 'bg-gray-900/50 border-gray-800 text-gray-300 hover:border-gray-700'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                              m.reached ? 'bg-emerald-500 border-emerald-400 text-black' : 'border-gray-600'
                            }`}>
                              {m.reached && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <span className="text-sm font-medium">{m.title}</span>
                          </div>
                          <span className="text-[11px] text-gray-400 font-mono">
                            {new Date(m.targetDate).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Add Milestone Form */}
                    <form onSubmit={handleAddQuickMilestone} className="flex gap-2 mt-3">
                      <input
                        type="text"
                        placeholder="Add new milestone..."
                        value={quickMilestoneTitle}
                        onChange={(e) => setQuickMilestoneTitle(e.target.value)}
                        className="flex-1 px-3 py-2 bg-gray-900 border border-gray-800 rounded-xl text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-brand-purple"
                      />
                      <button
                        type="submit"
                        className="px-3 py-2 bg-brand-purple text-white text-xs font-semibold rounded-xl hover:bg-brand-purple/90 transition"
                      >
                        Add Milestone
                      </button>
                    </form>
                  </div>

                  {/* Tasks Section */}
                  <div className="pt-6 border-t border-gray-800">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-white flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-brand-cyan" />
                        <span>Execution Tasks</span>
                      </h4>
                    </div>

                    <div className="space-y-2">
                      {selectedWork.tasks.map(t => (
                        <div
                          key={t.id}
                          onClick={() => handleToggleTask(t.id)}
                          className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                            t.completed
                              ? 'bg-gray-900/30 border-gray-800/50 text-gray-400 line-through'
                              : 'bg-gray-900/60 border-gray-800 text-gray-200 hover:border-gray-700'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded flex items-center justify-center border ${
                              t.completed ? 'bg-brand-cyan border-brand-cyan text-black' : 'border-gray-600'
                            }`}>
                              {t.completed && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <span className="text-xs">{t.title}</span>
                          </div>
                          {t.assignee && (
                            <span className="text-[10px] text-gray-400 font-mono">{t.assignee}</span>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Add Task Form */}
                    <form onSubmit={handleAddQuickTask} className="flex gap-2 mt-3">
                      <input
                        type="text"
                        placeholder="Add execution task..."
                        value={quickTaskTitle}
                        onChange={(e) => setQuickTaskTitle(e.target.value)}
                        className="flex-1 px-3 py-2 bg-gray-900 border border-gray-800 rounded-xl text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-brand-cyan"
                      />
                      <button
                        type="submit"
                        className="px-3 py-2 bg-brand-cyan text-black text-xs font-semibold rounded-xl hover:opacity-90 transition"
                      >
                        Add Task
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {inspectorTab === 'artifacts' && (
                <div className="space-y-4">
                  <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                    Linked First-Class Artifacts
                  </h4>

                  {/* Presentations */}
                  {selectedWork.presentations.map(pid => {
                    const pres = presentationsService.getPresentationById(pid);
                    return (
                      <div key={pid} className="p-4 rounded-xl bg-gray-900/60 border border-gray-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Presentation className="w-5 h-5 text-purple-400" />
                          <div>
                            <div className="text-sm font-semibold text-white">{pres?.title || pid}</div>
                            <div className="text-xs text-gray-400">{pres?.slides.length || 0} Slides • {pres?.category || 'Executive'}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => onNavigate('presentations', pid)}
                          className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-medium flex items-center gap-1 transition"
                        >
                          <span>Launch Deck</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}

                  {/* Demos */}
                  {selectedWork.demos.map(did => {
                    const demo = demosService.getDemoById(did);
                    return (
                      <div key={did} className="p-4 rounded-xl bg-gray-900/60 border border-gray-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Play className="w-5 h-5 text-emerald-400" />
                          <div>
                            <div className="text-sm font-semibold text-white">{demo?.title || did}</div>
                            <div className="text-xs text-gray-400">Type: {demo?.demoType} • Version {demo?.version}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => onNavigate('demos', did)}
                          className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-medium flex items-center gap-1 transition"
                        >
                          <span>Run Sandbox</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}

                  {/* Meetings */}
                  {selectedWork.meetings.map(mid => {
                    const meet = meetingsService.getMeetingById(mid);
                    return (
                      <div key={mid} className="p-4 rounded-xl bg-gray-900/60 border border-gray-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Calendar className="w-5 h-5 text-brand-cyan" />
                          <div>
                            <div className="text-sm font-semibold text-white">{meet?.title || mid}</div>
                            <div className="text-xs text-gray-400">{meet?.attendees.length || 0} Attendees • {meet?.actionItems.length || 0} Action Items</div>
                          </div>
                        </div>
                        <button
                          onClick={() => onNavigate('meetings', mid)}
                          className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-medium flex items-center gap-1 transition"
                        >
                          <span>Open Meeting</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}

                  {/* Files */}
                  {selectedWork.files.map(fid => {
                    const f = filesVaultService.getFileById(fid);
                    return (
                      <div key={fid} className="p-4 rounded-xl bg-gray-900/60 border border-gray-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-blue-400" />
                          <div>
                            <div className="text-sm font-semibold text-white">{f?.name || fid}</div>
                            <div className="text-xs text-gray-400">{f ? `${(f.sizeBytes / 1024).toFixed(1)} KB` : 'Verified Document'}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => onNavigate('files', fid)}
                          className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-medium flex items-center gap-1 transition"
                        >
                          <span>Preview Vault</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {inspectorTab === 'governance' && (
                <div className="space-y-6">
                  {/* Logged Decisions */}
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-2">Formal Governance Decisions</h4>
                    <div className="space-y-2">
                      {selectedWork.decisions.map(d => (
                        <div key={d.id} className="p-4 rounded-xl bg-gray-900/60 border border-gray-800 space-y-1">
                          <div className="flex items-center justify-between text-[11px] text-gray-400">
                            <span>Decided by: {d.deciderEmail}</span>
                            <span className="font-mono">{new Date(d.decidedAt).toLocaleDateString()}</span>
                          </div>
                          <div className="text-sm font-medium text-white">{d.decision}</div>
                          {d.rationale && (
                            <p className="text-xs text-gray-400 italic">Rationale: {d.rationale}</p>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Add Decision Form */}
                    <form onSubmit={handleAddQuickDecision} className="mt-4 p-4 rounded-xl bg-gray-900/40 border border-gray-800 space-y-3">
                      <h5 className="text-xs font-semibold text-gray-300">Record New Formal Decision</h5>
                      <input
                        type="text"
                        placeholder="Resolution / Decision statement..."
                        value={quickDecisionText}
                        onChange={(e) => setQuickDecisionText(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-xl text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-brand-purple"
                      />
                      <input
                        type="text"
                        placeholder="Rationale / Architectural justification..."
                        value={quickDecisionRationale}
                        onChange={(e) => setQuickDecisionRationale(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-xl text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-brand-purple"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-brand-purple text-white text-xs font-semibold rounded-xl hover:bg-brand-purple/90 transition"
                      >
                        Ratify Decision
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {inspectorTab === 'financials' && (
                <div className="space-y-6">
                  {/* Financial Overview */}
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-3">Minor-Units Integer Accounting</h4>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-800">
                        <span className="text-[11px] text-gray-400">Allocated Budget</span>
                        <div className="text-base font-mono font-semibold text-emerald-400 mt-1">
                          ${((selectedWork.financialInfo?.budgetMinorUnits || 0) / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                      <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-800">
                        <span className="text-[11px] text-gray-400">Incurred Costs</span>
                        <div className="text-base font-mono font-semibold text-amber-400 mt-1">
                          ${((selectedWork.financialInfo?.costMinorUnits || 0) / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                      <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-800">
                        <span className="text-[11px] text-gray-400">Recognized Revenue</span>
                        <div className="text-base font-mono font-semibold text-brand-cyan mt-1">
                          ${((selectedWork.financialInfo?.revenueMinorUnits || 0) / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Immutable Audit Log */}
                  <div className="pt-4 border-t border-gray-800">
                    <h4 className="text-sm font-semibold text-white mb-3">Cryptographic Audit History</h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {selectedWork.activityHistory.map((act, i) => (
                        <div key={i} className="p-3 rounded-lg bg-gray-900/40 border border-gray-800 text-xs">
                          <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono">
                            <span>{act.actor}</span>
                            <span>{new Date(act.timestamp).toLocaleTimeString()}</span>
                          </div>
                          <div className="font-semibold text-gray-200 mt-0.5">{act.action}</div>
                          <div className="text-gray-400 text-[11px]">{act.details}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 border-t border-gray-800 bg-gray-900/80 flex items-center justify-between">
              <button
                onClick={() => {
                  const summary = universalWorkService.exportWorkSummary(selectedWork.id);
                  navigator.clipboard?.writeText(summary);
                  showNotification('Universal work summary copied to clipboard');
                }}
                className="px-3.5 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-medium transition flex items-center gap-1.5"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Export Audit JSON</span>
              </button>

              <button
                onClick={() => setSelectedWork(null)}
                className="px-4 py-2 rounded-xl bg-brand-cyan text-black text-xs font-semibold hover:opacity-90 transition"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE WORK OBJECT MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-[#0f172a] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-display font-semibold text-white">Initialize Universal Work Object</h3>
                <p className="text-xs text-gray-400">Define polymorphic work schema across software, strategy, or partnerships.</p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateWork} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Work Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Autonomous AI Routing Infrastructure"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-purple"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Work Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-xl text-xs text-gray-200 focus:outline-none focus:border-brand-purple"
                  >
                    <option value="PROJECT">Project</option>
                    <option value="INITIATIVE">Strategic Initiative</option>
                    <option value="SOFTWARE_PROJECT">Software Project</option>
                    <option value="PARTNERSHIP_PROPOSAL">Partnership Proposal</option>
                    <option value="RESEARCH_STUDY">Research Study</option>
                    <option value="CAMPAIGN">Campaign / Creative</option>
                    <option value="ANALYTICS">Analytics / Model</option>
                    <option value="COMMERCE_WORK">Commerce & Settlement</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-xl text-xs text-gray-200 focus:outline-none focus:border-brand-purple"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Detailed work objectives, deliverables, and operational requirements..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-purple"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Initial Milestone (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Architecture RFC Acceptance"
                    value={newMilestoneTitle}
                    onChange={(e) => setNewMilestoneTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-purple"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Allocated Budget (USD)</label>
                  <input
                    type="number"
                    placeholder="e.g. 50000"
                    value={newBudget}
                    onChange={(e) => setNewBudget(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-purple"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 text-xs font-medium hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-brand-purple to-brand-cyan text-white text-xs font-semibold shadow-lg shadow-brand-purple/20 transition"
                >
                  Create Work Object
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* V27 WORK QUALITY ASSISTANT MODAL */}
      {isQualityModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#0f172a] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-5 border-b border-gray-800 flex items-center justify-between bg-gray-900/60">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-brand-cyan/20 border border-brand-cyan/30 text-brand-cyan">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-display font-semibold text-white">Work Quality Assistant</h3>
                  <p className="text-xs text-gray-400">Grounded quality & commercial readiness assessment</p>
                </div>
              </div>
              <button
                onClick={() => setIsQualityModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {isEvaluatingQuality ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-10 h-10 border-2 border-brand-cyan border-t-transparent rounded-full animate-spin mx-auto" />
                  <h4 className="text-sm font-semibold text-white">Evaluating Work Quality Dimensions...</h4>
                  <p className="text-xs text-gray-400 max-w-sm mx-auto">
                    Analyzing clarity, structure, audience alignment, consistency, commercial viability, and missing information risks.
                  </p>
                </div>
              ) : qualityReport ? (
                <div className="space-y-6">
                  {/* Hero Score Card */}
                  <div className="bg-gradient-to-br from-purple-950/40 via-gray-900/60 to-cyan-950/40 border border-purple-800/40 p-5 rounded-2xl flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Overall Quality Rating</span>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-4xl font-black text-white font-mono">{qualityReport.overallScore}</span>
                        <span className="text-sm text-gray-400 font-mono">/ 100</span>
                      </div>
                      <p className="text-xs text-gray-300 mt-2 max-w-md leading-relaxed">
                        {qualityReport.executiveSummary}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wide border inline-block ${
                        qualityReport.readinessRating === 'EXCELLENT' ? 'bg-cyan-950/60 border-cyan-500/50 text-cyan-300' :
                        qualityReport.readinessRating === 'MARKET_READY' ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300' :
                        qualityReport.readinessRating === 'NEEDS_POLISH' ? 'bg-amber-950/60 border-amber-500/50 text-amber-300' :
                        'bg-rose-950/60 border-rose-500/50 text-rose-300'
                      }`}>
                        {qualityReport.readinessRating.replace(/_/g, ' ')}
                      </span>
                      <span className="block text-[10px] text-gray-500 mt-2 font-mono">
                        Engine: {qualityReport.source}
                      </span>
                    </div>
                  </div>

                  {/* 6 Dimension Sliders / Progress Bars */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-3">Evaluation Dimensions</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { label: 'Clarity & Precision', score: qualityReport.dimensions.clarity },
                        { label: 'Structural Coherence', score: qualityReport.dimensions.structure },
                        { label: 'Audience Suitability', score: qualityReport.dimensions.audienceSuitability },
                        { label: 'Internal Consistency', score: qualityReport.dimensions.consistency },
                        { label: 'Commercial Viability', score: qualityReport.dimensions.commercialViability },
                        { label: 'Information Completeness', score: 100 - qualityReport.dimensions.missingInformationRisk }
                      ].map((dim, idx) => (
                        <div key={idx} className="bg-gray-900/60 border border-gray-800 p-3 rounded-xl">
                          <div className="flex items-center justify-between text-xs mb-1.5">
                            <span className="text-gray-300 font-medium">{dim.label}</span>
                            <span className="font-mono font-bold text-brand-cyan">{dim.score}%</span>
                          </div>
                          <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                dim.score >= 80 ? 'bg-emerald-400' : dim.score >= 60 ? 'bg-brand-cyan' : 'bg-amber-400'
                              }`}
                              style={{ width: `${dim.score}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Key Strengths */}
                  {qualityReport.strengths && qualityReport.strengths.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">Key Strengths</h4>
                      <div className="space-y-1.5">
                        {qualityReport.strengths.map((str, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-xs text-emerald-300 bg-emerald-950/20 border border-emerald-900/40 p-2.5 rounded-lg">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                            <span>{str}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Prioritized Improvements */}
                  {qualityReport.prioritizedImprovements && qualityReport.prioritizedImprovements.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">Recommended Improvements</h4>
                      <div className="space-y-2">
                        {qualityReport.prioritizedImprovements.map((imp, idx) => (
                          <div key={idx} className="bg-gray-900/80 border border-gray-800 p-3 rounded-xl space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-semibold text-gray-300 capitalize">{imp.category}</span>
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                                imp.priority === 'HIGH' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                                imp.priority === 'MEDIUM' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                                'bg-blue-950 text-blue-300 border border-blue-800'
                              }`}>
                                {imp.priority} Priority
                              </span>
                            </div>
                            <p className="text-xs text-gray-400">{imp.finding}</p>
                            <p className="text-xs text-brand-cyan font-medium pt-1">Action: {imp.suggestion}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Packaging Recommendations */}
                  <div className="bg-gray-900/50 border border-gray-800 p-4 rounded-xl space-y-2 text-xs">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Marketplace Packaging Suggestion</span>
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <span className="px-2 py-1 rounded bg-gray-800 text-gray-200">
                        Category: <strong className="text-brand-cyan">{qualityReport.metadataRecommendations?.suggestedCategory || 'Product Asset'}</strong>
                      </span>
                      <span className="px-2 py-1 rounded bg-gray-800 text-gray-200">
                        Pricing: <strong className="text-purple-300">{qualityReport.metadataRecommendations?.suggestedPricingModel || 'one_time'}</strong>
                      </span>
                      {(qualityReport.metadataRecommendations?.suggestedTags || []).map((t, idx) => (
                        <span key={idx} className="px-2 py-1 rounded bg-gray-800 text-gray-300 font-mono text-[11px]">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-800 bg-gray-900/80 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsQualityModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 text-xs font-medium hover:bg-gray-700 transition"
              >
                Close
              </button>

              {selectedWork && (
                <button
                  type="button"
                  onClick={() => {
                    setIsQualityModalOpen(false);
                    setPublishCategory(
                      selectedWork.workType === 'PRESENTATION' ? 'presentation' :
                      selectedWork.workType === 'DEMO' ? 'video_demo' :
                      selectedWork.workType === 'PROJECT' ? 'software' : 'workflow'
                    );
                    setIsPublishModalOpen(true);
                  }}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-brand-purple to-brand-cyan text-white text-xs font-semibold shadow-lg hover:brightness-110 transition flex items-center gap-1.5"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Proceed to Publish Deliverable</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* V27 WORK-TO-MARKET PUBLISHING MODAL */}
      {isPublishModalOpen && selectedWork && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-[#0f172a] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-brand-purple/20 border border-brand-purple/30 text-brand-purple">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-display font-semibold text-white">Publish to Ecosystem Marketplace</h3>
                  <p className="text-xs text-gray-400">Package and monetize this deliverable on the public catalog</p>
                </div>
              </div>
              <button
                onClick={() => setIsPublishModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePublishToMarket} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Catalog Listing Title</label>
                <input
                  type="text"
                  disabled
                  value={selectedWork.title}
                  className="w-full px-3 py-2 bg-gray-900/60 border border-gray-800 rounded-xl text-xs text-gray-300 cursor-not-allowed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Digital Work Category</label>
                  <select
                    value={publishCategory}
                    onChange={(e) => setPublishCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-xl text-xs text-gray-200 focus:outline-none focus:border-brand-purple"
                  >
                    <option value="presentation">Keynote Presentation Deck</option>
                    <option value="video_demo">Video Product Demo</option>
                    <option value="software">Software Production Package</option>
                    <option value="whitepaper">Research Whitepaper</option>
                    <option value="dataset">Structured Dataset</option>
                    <option value="workflow">Enterprise Workflow</option>
                    <option value="agent">Autonomous Agent</option>
                    <option value="template">Operational Template</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Monetization Model</label>
                  <select
                    value={publishPricingModel}
                    onChange={(e) => setPublishPricingModel(e.target.value as any)}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-xl text-xs text-gray-200 focus:outline-none focus:border-brand-purple"
                  >
                    <option value="one_time">One-Time Asset Purchase</option>
                    <option value="subscription">Monthly Subscription Access</option>
                    <option value="paid_download">Paid Secure Download</option>
                    <option value="licensing">Commercial Deployment License</option>
                    <option value="free">Free / Community Edition</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Listing Price (USD $)</label>
                  <input
                    type="number"
                    step="0.50"
                    min="0"
                    required
                    value={publishPrice}
                    onChange={(e) => setPublishPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-xl text-xs text-white focus:outline-none focus:border-brand-purple"
                  />
                  <span className="text-[10px] text-emerald-400 mt-1 block">
                    99.75% creator platform split (${(parseFloat(publishPrice || '0') * 0.9975).toFixed(2)}) • 0.25% platform fee
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Licensing Terms</label>
                  <select
                    value={publishLicenseType}
                    onChange={(e) => setPublishLicenseType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-xl text-xs text-gray-200 focus:outline-none focus:border-brand-purple"
                  >
                    <option value="COMMERCIAL_NON_EXCLUSIVE">Commercial Non-Exclusive</option>
                    <option value="ENTERPRISE_ORGANIZATIONAL">Enterprise Organizational</option>
                    <option value="OPEN_SOURCE_APACHE2">Open Access / Apache 2.0</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Catalog Tags (comma separated)</label>
                <input
                  type="text"
                  value={publishTags}
                  onChange={(e) => setPublishTags(e.target.value)}
                  placeholder="e.g. Executive, Keynote, Cloud, Security"
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-xl text-xs text-white focus:outline-none focus:border-brand-purple"
                />
              </div>

              <div className="p-3 bg-purple-950/20 border border-purple-900/30 rounded-xl text-[11px] text-purple-300 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Safe Stripping Active</strong>: Private internal scratchpads, internal author notes, and secret environment credentials are stripped automatically. Only the public deliverable will be listed.
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsPublishModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 text-xs font-medium hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPublishing}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-brand-purple to-brand-cyan text-white text-xs font-semibold shadow-lg hover:brightness-110 transition flex items-center gap-1.5"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>{isPublishing ? 'Publishing...' : 'Publish to Marketplace'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
