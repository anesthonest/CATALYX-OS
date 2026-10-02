import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  studioService, StudioItem, StudioType, StudioAsset, StudioVersion 
} from '../../services/studioService';
import { microsoftIntegrationService } from '../../services/microsoftIntegrationService';
import { UserProfile } from '../../types';
import { 
  Code, Film, Palette, PenTool, Video, Presentation, 
  BookOpen, BarChart2, Megaphone, Briefcase, GraduationCap, 
  Layers, Sparkles, CheckCircle2, Clock, ShieldCheck, 
  Download, ExternalLink, Plus, Save, History, MessageSquare, 
  FileText, ArrowRight, RefreshCw, Send, Check
} from 'lucide-react';

interface UniversalStudioViewProps {
  user: UserProfile;
  workspaceId: string;
}

export const UniversalStudioView: React.FC<UniversalStudioViewProps> = ({ user, workspaceId }) => {
  const [selectedType, setSelectedType] = useState<StudioType>('software');
  const [studios, setStudios] = useState<StudioItem[]>([]);
  const [activeStudio, setActiveStudio] = useState<StudioItem | null>(null);
  const [activeTab, setActiveTab] = useState<'editor' | 'assets' | 'versions' | 'review' | 'export'>('editor');
  const [draftTitle, setDraftTitle] = useState('');
  const [draftContent, setDraftContent] = useState('');
  const [saveStatus, setSaveStatus] = useState<string>('');
  const [versionSummary, setVersionSummary] = useState('');
  const [reviewNote, setReviewNote] = useState('');

  const studioTypes: { type: StudioType; name: string; icon: any; color: string }[] = [
    { type: 'software', name: 'Software Dev', icon: Code, color: 'text-blue-400' },
    { type: 'animation_3d', name: '3D Animation', icon: Film, color: 'text-amber-400' },
    { type: 'design_ui', name: 'Design / UI/UX', icon: Palette, color: 'text-pink-400' },
    { type: 'writing', name: 'Writing / Creative', icon: PenTool, color: 'text-emerald-400' },
    { type: 'video_media', name: 'Video / Media', icon: Video, color: 'text-red-400' },
    { type: 'presentation', name: 'Presentation', icon: Presentation, color: 'text-purple-400' },
    { type: 'research', name: 'Research Studio', icon: BookOpen, color: 'text-indigo-400' },
    { type: 'data_analytics', name: 'Data / Analytics', icon: BarChart2, color: 'text-teal-400' },
    { type: 'marketing', name: 'Marketing Campaign', icon: Megaphone, color: 'text-yellow-400' },
    { type: 'operations', name: 'Operations / SOP', icon: Briefcase, color: 'text-cyan-400' },
    { type: 'education', name: 'Learning / Course', icon: GraduationCap, color: 'text-green-400' },
    { type: 'product', name: 'Product / PRD', icon: Layers, color: 'text-violet-400' },
  ];

  useEffect(() => {
    loadStudios();
  }, [workspaceId, selectedType]);

  const loadStudios = () => {
    const list = studioService.getAllStudios(workspaceId);
    setStudios(list);
    let current = list.find(s => s.type === selectedType);
    if (!current) {
      // Auto-provision if not found for current workspace
      current = studioService.createStudio({
        type: selectedType,
        workspaceId,
        name: studioService.getStudioTypeLabel(selectedType),
        description: `Authoritative production environment for ${studioService.getStudioTypeLabel(selectedType)}.`,
        ownerEmail: user.email
      });
      setStudios(studioService.getAllStudios(workspaceId));
    }
    setActiveStudio(current);
    if (current && current.activeDraft) {
      setDraftTitle(current.activeDraft.title || current.name);
      setDraftContent(current.activeDraft.summary || current.activeDraft.content || '');
    }
  };

  const handleSaveDraft = () => {
    if (!activeStudio) return;
    studioService.updateDraft(
      activeStudio.id,
      { title: draftTitle, content: draftContent, updatedAt: new Date().toISOString() },
      user.email
    );
    setSaveStatus('Draft saved securely');
    setTimeout(() => setSaveStatus(''), 3000);
    loadStudios();
  };

  const handleCreateSnapshot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStudio || !versionSummary.trim()) return;
    studioService.createVersionSnapshot(activeStudio.id, versionSummary.trim(), user.email);
    setVersionSummary('');
    loadStudios();
  };

  const handleSubmitReview = () => {
    if (!activeStudio) return;
    studioService.submitForReview(activeStudio.id, 'lead_reviewer@catalyx.io', user.email);
    loadStudios();
  };

  const handleApprove = () => {
    if (!activeStudio) return;
    studioService.approveStudioWork(activeStudio.id, user.email, reviewNote || 'Certified for production.');
    setReviewNote('');
    loadStudios();
  };

  const handleOfficeHandoff = (format: string) => {
    let officeType: 'word' | 'excel' | 'powerpoint' = 'word';
    if (format.includes('XLSX') || format.includes('Excel')) officeType = 'excel';
    if (format.includes('PPTX') || format.includes('PowerPoint')) officeType = 'powerpoint';

    microsoftIntegrationService.launchOfficeDesktopHandoff({
      officeType,
      fileUrl: `/assets/studios/export/${activeStudio?.id || 'sample'}.${officeType === 'word' ? 'docx' : officeType === 'excel' ? 'xlsx' : 'pptx'}`,
      fileName: `${activeStudio?.name || 'Studio_Document'}.${officeType === 'word' ? 'docx' : officeType === 'excel' ? 'xlsx' : 'pptx'}`,
      onFallback: () => {
        alert(`Office desktop handoff dispatched. If Microsoft 365 is not detected, use the direct download fallback.`);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Studio Header Banner */}
      <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-brand-purple uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>CATALYX UNIVERSAL STUDIO FRAMEWORK</span>
            </div>
            <h1 className="text-2xl font-display font-bold text-white tracking-tight">
              {studioService.getStudioTypeLabel(selectedType)}
            </h1>
            <p className="text-sm text-gray-400 mt-1 max-w-2xl">
              Modular production-grade creation environment with automated version control, 
              AI specialists, multi-track timelines, asset registries, and enterprise review workflows.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-lg border text-xs font-mono font-medium flex items-center gap-2 bg-slate-950/60 border-white/10">
              <span className="text-gray-400">Review Status:</span>
              <span className={`capitalize font-bold ${
                activeStudio?.review.status === 'approved' ? 'text-emerald-400' :
                activeStudio?.review.status === 'in_review' ? 'text-amber-400' : 'text-gray-300'
              }`}>
                {activeStudio?.review.status || 'draft'}
              </span>
            </div>

            <button
              onClick={handleSaveDraft}
              className="px-4 py-2 bg-gradient-to-r from-brand-purple to-brand-cyan text-slate-950 font-bold font-display rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 hover:opacity-95 transition-all cursor-pointer shadow-lg shadow-brand-purple/10"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Work</span>
            </button>
          </div>
        </div>

        {/* 12 Creation Studios Selector Bar */}
        <div className="mt-6 pt-5 border-t border-white/10 overflow-x-auto scrollbar-none flex gap-2">
          {studioTypes.map((item) => {
            const Icon = item.icon;
            const isSelected = selectedType === item.type;
            return (
              <button
                key={item.type}
                onClick={() => {
                  setSelectedType(item.type);
                  setActiveTab('editor');
                }}
                className={`px-3 py-2 rounded-xl text-xs font-mono whitespace-nowrap flex items-center gap-2 transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-white/10 border-brand-purple text-white shadow-md'
                    : 'bg-slate-950/40 border-white/5 text-gray-400 hover:text-gray-200 hover:bg-white/5'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${item.color}`} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Studio Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sub-Navigation / Tool Dock */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4 space-y-2">
            <div className="text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-2">
              Studio Operations
            </div>
            {[
              { id: 'editor', label: 'Working Canvas', icon: PenTool },
              { id: 'assets', label: 'Asset Vault', icon: Layers },
              { id: 'versions', label: 'Version History', icon: History },
              { id: 'review', label: 'Review & Approvals', icon: ShieldCheck },
              { id: 'export', label: 'Export & Office Bridge', icon: Download },
            ].map(tab => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-2.5 transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-brand-purple/20 text-brand-purple border border-brand-purple/30 font-semibold'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <TabIcon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Domain-Specific Tool Dock */}
          <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4">
            <div className="text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-2.5">
              Domain Tool Pipeline
            </div>
            <div className="space-y-1.5">
              {(activeStudio?.tools || []).map((t, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-950/40 border border-white/5 text-xs text-gray-300">
                  <span className="font-mono text-[11px]">{t}</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400/80"></span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Specialist Co-Pilot */}
          <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-[10px] font-mono text-brand-cyan uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Assigned AI Specialist</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5 text-xs space-y-1.5">
              <div className="font-semibold text-white">{activeStudio?.aiWorkers[0]?.name || 'Specialist AI'}</div>
              <div className="text-[11px] text-gray-400">{activeStudio?.aiWorkers[0]?.role}</div>
              <div className="flex flex-wrap gap-1 mt-2">
                {activeStudio?.aiWorkers[0]?.capabilities.map((c, i) => (
                  <span key={i} className="px-1.5 py-0.5 rounded bg-white/5 text-[9px] font-mono text-gray-300">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Center/Right Content Area */}
        <div className="lg:col-span-3">
          {saveStatus && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>{saveStatus}</span>
            </div>
          )}

          {activeTab === 'editor' && (
            <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-1">
                  Draft Title / Specification
                </label>
                <input
                  type="text"
                  value={draftTitle}
                  onChange={(e) => setDraftTitle(e.target.value)}
                  className="w-full bg-slate-950/70 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-purple"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-1">
                  Production Content / Working Document
                </label>
                <textarea
                  rows={12}
                  value={draftContent}
                  onChange={(e) => setDraftContent(e.target.value)}
                  placeholder="Enter production script, scene specs, architecture plans, curriculum, or data definitions..."
                  className="w-full bg-slate-950/70 border border-white/10 rounded-xl p-4 text-xs font-mono text-gray-200 focus:outline-none focus:border-brand-purple resize-none"
                />
              </div>
            </div>
          )}

          {activeTab === 'assets' && (
            <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-white">Studio Asset Pipeline</h3>
                <span className="text-xs font-mono text-gray-400">{activeStudio?.assets.length || 0} Assets Registered</span>
              </div>
              <div className="space-y-2">
                {activeStudio?.assets.map((ast) => (
                  <div key={ast.id} className="p-3 rounded-xl bg-slate-950/60 border border-white/5 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-medium text-white">{ast.name}</div>
                      <div className="text-[10px] font-mono text-gray-400">{(ast.sizeBytes / 1024).toFixed(1)} KB • {ast.type}</div>
                    </div>
                    <div className="flex items-center gap-1">
                      {ast.tags.map((t, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-white/5 text-[10px] font-mono text-gray-400">{t}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'versions' && (
            <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 space-y-6">
              <form onSubmit={handleCreateSnapshot} className="space-y-3">
                <h3 className="text-base font-semibold text-white">Create Version Snapshot</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={versionSummary}
                    onChange={(e) => setVersionSummary(e.target.value)}
                    placeholder="e.g. Added complete 3D storyboard sequence for Act II"
                    className="flex-1 bg-slate-950/70 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-brand-purple"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-brand-purple text-white text-xs font-semibold rounded-xl hover:opacity-90 transition-all cursor-pointer whitespace-nowrap"
                  >
                    Tag Snapshot
                  </button>
                </div>
              </form>

              <div className="border-t border-white/5 pt-4 space-y-3">
                <h4 className="text-xs font-mono text-gray-400 uppercase tracking-wider">Version Timeline</h4>
                {activeStudio?.versions.map((ver) => (
                  <div key={ver.versionNumber} className="p-3 rounded-xl bg-slate-950/50 border border-white/5 text-xs flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-white">v{ver.versionNumber} — {ver.changeSummary}</div>
                      <div className="text-[10px] font-mono text-gray-400">By {ver.createdBy} • {new Date(ver.createdAt).toLocaleDateString()}</div>
                    </div>
                    <span className="px-2 py-1 rounded bg-brand-cyan/10 text-brand-cyan text-[10px] font-mono">Immutable</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'review' && (
            <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 space-y-6">
              <div>
                <h3 className="text-base font-semibold text-white">Governance & Peer Certification</h3>
                <p className="text-xs text-gray-400 mt-1">Multi-signatory approval pipeline for publishing to workspace and marketplace.</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/70 border border-white/10 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">Current Phase</span>
                  <span className="font-mono font-bold text-white uppercase">{activeStudio?.review.status}</span>
                </div>
                {activeStudio?.review.reviewer && (
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400">Designated Reviewer</span>
                    <span className="font-mono text-gray-300">{activeStudio.review.reviewer}</span>
                  </div>
                )}
                {activeStudio?.review.approvedAt && (
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400">Certified Timestamp</span>
                    <span className="font-mono text-emerald-400">{new Date(activeStudio.review.approvedAt).toLocaleString()}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                {activeStudio?.review.status !== 'approved' && (
                  <>
                    <button
                      onClick={handleSubmitReview}
                      className="px-4 py-2.5 bg-slate-800 hover:bg-slate-750 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all border border-white/10"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Request Signatory Review</span>
                    </button>
                    <button
                      onClick={handleApprove}
                      className="px-4 py-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Certify & Approve Studio Work</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {activeTab === 'export' && (
            <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 space-y-6">
              <div>
                <h3 className="text-base font-semibold text-white">Export & Office Ecosystem Bridge</h3>
                <p className="text-xs text-gray-400 mt-1">
                  Export directly in enterprise standards or initiate legitimate Desktop Office Protocol handoff.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(activeStudio?.exportFormats || []).map((fmt, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-950/70 border border-white/10 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">{fmt}</div>
                      <div className="text-[10px] font-mono text-gray-400 mt-0.5">Production Specification Standard</div>
                    </div>
                    <button
                      onClick={() => handleOfficeHandoff(fmt)}
                      className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Download className="w-3 h-3" />
                      <span>Export</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
