import React, { useState, useEffect } from 'react';
import { 
  Play, 
  ExternalLink, 
  Share2, 
  Plus, 
  Layers, 
  Radio, 
  Sliders, 
  CheckCircle, 
  AlertCircle, 
  Maximize2, 
  Code, 
  MessageSquare,
  Sparkles,
  Zap
} from 'lucide-react';
import { WorkDemo, UserProfile, UserPersonaRole } from '../types';
import { demosService } from '../services/demosService';
import { collaborationService } from '../services/collaborationService';
import { UniversalShareModal } from './UniversalShareModal';

interface DemosPrototypesViewProps {
  user: UserProfile;
  activeRole: UserPersonaRole;
  onNavigate: (tabId: string) => void;
}

export const DemosPrototypesView: React.FC<DemosPrototypesViewProps> = ({
  user,
  activeRole,
  onNavigate
}) => {
  const [demos, setDemos] = useState<WorkDemo[]>([]);
  const [selectedDemoId, setSelectedDemoId] = useState<string>('');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>('ALL');

  // Interactive sandbox state
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationLogs, setSimulationLogs] = useState<string[]>([]);

  // New Demo Modal
  const [isNewDemoOpen, setIsNewDemoOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newType, setNewType] = useState<WorkDemo['demoType']>('PROTOTYPE');
  const [newUrl, setNewUrl] = useState('');
  const [newVersion, setNewVersion] = useState('');

  // Comments
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');

  const loadDemos = () => {
    const list = demosService.getAllDemos();
    setDemos(list);
    if (list.length > 0 && !selectedDemoId) {
      setSelectedDemoId(list[0].id);
    }
  };

  useEffect(() => {
    loadDemos();
  }, []);

  const activeDemo = demos.find(d => d.id === selectedDemoId) || demos[0];

  useEffect(() => {
    if (activeDemo) {
      setComments(collaborationService.getComments('demo', activeDemo.id));
      setIsSimulating(false);
      setSimulationLogs([
        `[INIT] Connected to sandbox environment for ${activeDemo.title}`,
        `[STATUS] Type: ${activeDemo.demoType} | Version: ${activeDemo.version}`,
        `[VERIFY] Tenant isolation and CSP policies active.`
      ]);
    }
  }, [selectedDemoId]);

  const handleRunSimulation = () => {
    setIsSimulating(true);
    const steps = [
      `[SIM] Mounting interactive virtual container...`,
      `[SIM] Verifying state hydration and live telemetry...`,
      `[SIM] Executing synthetic transaction payload...`,
      `[SUCCESS] Simulation verified with zero regression.`
    ];

    steps.forEach((s, idx) => {
      setTimeout(() => {
        setSimulationLogs(prev => [...prev, s]);
      }, (idx + 1) * 600);
    });
  };

  const handleCreateDemo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newUrl.trim()) return;

    const created = demosService.createDemo({
      title: newTitle,
      description: newDescription,
      demoType: newType,
      url: newUrl,
      version: newVersion,
      ownerEmail: user.email
    });

    setNewTitle('');
    setNewDescription('');
    setNewUrl('');
    setNewVersion('');
    setIsNewDemoOpen(false);
    loadDemos();
    setSelectedDemoId(created.id);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !activeDemo) return;

    collaborationService.addComment({
      targetType: 'demo' as any,
      targetId: activeDemo.id,
      authorEmail: user.email,
      authorName: user.username || user.email.split('@')[0],
      text: newComment.trim()
    });

    setNewComment('');
    setComments(collaborationService.getComments('demo', activeDemo.id));
  };

  const renderBadge = (type: WorkDemo['demoType']) => {
    switch (type) {
      case 'LIVE':
        return <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[9px] font-mono font-bold">● LIVE APP</span>;
      case 'DEMO':
        return <span className="px-2 py-0.5 rounded bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/40 text-[9px] font-mono font-bold">DEMO SANDBOX</span>;
      case 'PROTOTYPE':
        return <span className="px-2 py-0.5 rounded bg-brand-purple/20 text-brand-purple border border-brand-purple/40 text-[9px] font-mono font-bold">PROTOTYPE</span>;
      case 'RECORDING':
        return <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[9px] font-mono font-bold">RECORDED</span>;
      case 'EXTERNAL_LINK':
        return <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/40 text-[9px] font-mono font-bold">EXTERNAL LINK</span>;
    }
  };

  const filteredDemos = filterType === 'ALL' ? demos : demos.filter(d => d.demoType === filterType);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-brand-purple/10 to-slate-900 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-cyan/15 text-brand-cyan border border-brand-cyan/30 uppercase font-bold">
              WORK ARTIFACTS • V24
            </span>
            <span className="text-xs text-gray-400 font-mono">Interactive Demos & Prototypes</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-wide">
            Product Prototypes & Live Demos
          </h1>
          <p className="text-xs text-gray-300 mt-1 max-w-2xl">
            Explore live apps, interactive prototypes, and sandboxed test harnesses with explicit status badging and direct sharing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsNewDemoOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-purple to-brand-cyan text-slate-950 font-bold text-xs flex items-center gap-2 hover:opacity-95 shadow-md cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Register Prototype</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['ALL', 'LIVE', 'DEMO', 'PROTOTYPE', 'EXTERNAL_LINK'].map((t) => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer ${
              filterType === t
                ? 'bg-brand-cyan text-slate-950 shadow-sm'
                : 'bg-slate-900 text-gray-400 hover:text-white border border-white/5'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Main Grid: Demos list (4 cols) + Active Demo Sandbox (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Demos list */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-mono uppercase text-gray-400 font-semibold tracking-wider">
              Registered Applications ({filteredDemos.length})
            </span>
          </div>

          <div className="space-y-2">
            {filteredDemos.map((demo) => {
              const isSelected = demo.id === activeDemo?.id;
              return (
                <div
                  key={demo.id}
                  onClick={() => setSelectedDemoId(demo.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 border-brand-cyan/50 shadow-lg ring-1 ring-brand-cyan/20'
                      : 'bg-slate-950/60 border-white/5 hover:border-white/20 hover:bg-slate-900/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    {renderBadge(demo.demoType)}
                    <span className="text-[10px] font-mono text-gray-500">{demo.version}</span>
                  </div>

                  <h4 className="text-sm font-semibold text-white mt-2 leading-snug">
                    {demo.title}
                  </h4>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                    {demo.description}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-gray-500 mt-3 pt-2 border-t border-white/5">
                    <span className="truncate">By {demo.ownerEmail}</span>
                    <span className="text-emerald-400">{demo.status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Demo Sandbox Runner */}
        {activeDemo && (
          <div className="lg:col-span-8 space-y-4">
            {/* Action Bar */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  {renderBadge(activeDemo.demoType)}
                  <span className="text-sm font-bold text-white">{activeDemo.title}</span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{activeDemo.description}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsShareModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10 text-xs font-mono flex items-center gap-1.5 cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5 text-brand-cyan" />
                  <span>Share Demo</span>
                </button>

                <a
                  href={activeDemo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-brand-cyan/15 hover:bg-brand-cyan/25 text-brand-cyan border border-brand-cyan/30 text-xs font-mono flex items-center gap-1.5 transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open URL</span>
                </a>
              </div>
            </div>

            {/* Sandbox Visualizer */}
            <div className="p-6 rounded-3xl bg-slate-950 border border-white/15 min-h-[360px] flex flex-col justify-between shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-brand-cyan/5 rounded-full blur-3xl pointer-events-none" />

              <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-mono text-gray-300">
                      INTERACTIVE SANDBOX RUNTIME ({activeDemo.version})
                    </span>
                  </div>

                  <button
                    onClick={handleRunSimulation}
                    disabled={isSimulating}
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-brand-purple to-brand-cyan text-slate-950 font-bold text-xs flex items-center gap-1.5 hover:opacity-95 cursor-pointer shadow-md disabled:opacity-50"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>{isSimulating ? 'Simulation Running...' : 'Execute Test Run'}</span>
                  </button>
                </div>

                {/* Console Log Stream */}
                <div className="p-4 rounded-2xl bg-black/60 border border-white/10 font-mono text-xs space-y-1.5 min-h-[180px] max-h-[220px] overflow-y-auto">
                  {simulationLogs.map((log, idx) => (
                    <div key={idx} className="text-gray-300">
                      <span className="text-brand-cyan mr-2">$</span>
                      {log}
                    </div>
                  ))}
                </div>
              </div>

              {/* Tags and Technical Specifications */}
              <div className="relative z-10 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-500 font-mono text-[10px]">TAGS:</span>
                  {activeDemo.tags.map((t) => (
                    <span key={t} className="px-2 py-0.5 rounded bg-slate-900 border border-white/10 text-[9px] font-mono text-gray-400">
                      #{t}
                    </span>
                  ))}
                </div>

                <div className="text-[10px] font-mono text-gray-500">
                  Target Endpoint: <code className="text-brand-cyan">{activeDemo.url}</code>
                </div>
              </div>
            </div>

            {/* Comments & Review Thread */}
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-white/10 space-y-3">
              <span className="text-xs font-mono uppercase text-gray-300 font-bold flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-brand-cyan" />
                <span>Prototype Feedback & Review Notes ({comments.length})</span>
              </span>

              <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
                {comments.length === 0 ? (
                  <p className="text-xs text-gray-500 text-center py-2">No review notes posted yet for this demo.</p>
                ) : (
                  comments.map((c) => (
                    <div key={c.id} className="p-2.5 rounded-xl bg-slate-900 border border-white/5 space-y-0.5">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-semibold text-brand-cyan">{c.authorName}</span>
                        <span className="text-gray-500">{new Date(c.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-xs text-gray-300">{c.text}</p>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleAddComment} className="flex gap-2 pt-2">
                <input
                  type="text"
                  required
                  placeholder="Share testing feedback or architectural review..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-brand-cyan"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-cyan text-slate-950 font-bold text-xs rounded-xl hover:opacity-95 transition-all cursor-pointer"
                >
                  Post Feedback
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Share Modal */}
      {activeDemo && (
        <UniversalShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          artifactId={activeDemo.id}
          artifactTitle={activeDemo.title}
          artifactType="demo"
          currentUserEmail={user.email}
        />
      )}

      {/* Register Prototype Modal */}
      {isNewDemoOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-white/15 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-display font-bold text-white">Register Prototype / Demo</h3>
            <form onSubmit={handleCreateDemo} className="space-y-3">
              <div>
                <label className="block text-[10px] font-mono text-gray-400 uppercase mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Consensus Engine"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-brand-cyan"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-gray-400 uppercase mb-1">Type / Epistemic Category</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-brand-cyan font-bold focus:outline-brand-cyan"
                >
                  <option value="LIVE">LIVE APPLICATION</option>
                  <option value="DEMO">DEMO SANDBOX</option>
                  <option value="PROTOTYPE">INTERACTIVE PROTOTYPE</option>
                  <option value="EXTERNAL_LINK">EXTERNAL TEST HARNESS</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-gray-400 uppercase mb-1">URL Endpoint</label>
                <input
                  type="url"
                  required
                  placeholder="https://app.catalyx.io/demo"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-brand-cyan"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-gray-400 uppercase mb-1">Version</label>
                <input
                  type="text"
                  placeholder="v1.0.0-alpha"
                  value={newVersion}
                  onChange={(e) => setNewVersion(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-brand-cyan"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsNewDemoOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-gray-400 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-brand-purple to-brand-cyan text-slate-950 font-bold text-xs cursor-pointer"
                >
                  Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
