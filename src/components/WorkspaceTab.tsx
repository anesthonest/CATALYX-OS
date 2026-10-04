import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Workspace, WorkspaceMember, WorkspaceTask, 
  WorkspaceMessage, WorkspaceInvite, UserProfile, KnowledgeArticle 
} from '../types';
import { dbService } from '../firebase';
import { workforceManagementService } from '../services/workforceManagementService';
import { UniversalStudioView } from './studios/UniversalStudioView';
import { MicrosoftIntegrationModal } from './integrations/MicrosoftIntegrationModal';
import { persistenceSyncService } from '../services/persistenceSyncService';
import { 
  Users, Plus, Check, Send, Sparkles, MessageSquare, 
  Milestone, ShieldAlert, BadgeCheck, AlertCircle, RefreshCw, Zap, BookOpen, Key, Layers, ExternalLink, Download, Archive
} from 'lucide-react';

interface WorkspaceTabProps {
  user: UserProfile;
  workspaces: Workspace[];
  onCreateWorkspace: (name: string) => Promise<void>;
  onSelectWorkspace: (workspace: Workspace) => void;
  activeWorkspace: Workspace | null;
  activeMembers: WorkspaceMember[];
  activeTasks: WorkspaceTask[];
  activeMessages: WorkspaceMessage[];
  onAddWorkspaceTask: (text: string) => Promise<void>;
  onCompleteWorkspaceTask: (taskId: string) => Promise<void>;
  onSendWorkspaceMessage: (text: string) => Promise<void>;
  listOfInvites: WorkspaceInvite[];
  onAcceptInvite: (inviteId: string) => Promise<void>;
  onDeclineInvite: (inviteId: string) => Promise<void>;
}

export const WorkspaceTab: React.FC<WorkspaceTabProps> = ({
  user,
  workspaces,
  onCreateWorkspace,
  onSelectWorkspace,
  activeWorkspace,
  activeMembers,
  activeTasks,
  activeMessages,
  onAddWorkspaceTask,
  onCompleteWorkspaceTask,
  onSendWorkspaceMessage,
  listOfInvites,
  onAcceptInvite,
  onDeclineInvite
}) => {
  const [newWSName, setNewWSName] = useState('');
  const [newWSTaskText, setNewWSTaskText] = useState('');
  const [newChatText, setNewChatText] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteSuccessMsg, setInviteSuccessMsg] = useState('');
  
  // AI analysis state
  const [aiAnalysis, setAIAnalysis] = useState<{
    burnoutRisk: string;
    teamMomentum: string;
    executionTrend: string;
    recommendation: string;
  } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Knowledge Vault states
  const [wikiArticles, setWikiArticles] = useState<KnowledgeArticle[]>([]);
  const [newWikiTitle, setNewWikiTitle] = useState('');
  const [newWikiContent, setNewWikiContent] = useState('');
  const [isAddingWiki, setIsAddingWiki] = useState(false);

  // V23 Join Workspace by Invitation Code
  const [joinCode, setJoinCode] = useState('');
  const [joinStatusMsg, setJoinStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isJoining, setIsJoining] = useState(false);

  // V31 Universal Studio Architecture and Microsoft Ecosystem State
  const [workspaceSubView, setWorkspaceSubView] = useState<'overview' | 'studios'>('overview');
  const [isMicrosoftModalOpen, setIsMicrosoftModalOpen] = useState(false);

  // Workspace Durable Export State
  const [isExportingWorkspace, setIsExportingWorkspace] = useState(false);
  const [workspaceExportNotice, setWorkspaceExportNotice] = useState<string | null>(null);

  const handleExportWorkspace = async (ws?: Workspace) => {
    const target = ws || activeWorkspace;
    if (!target) return;
    setIsExportingWorkspace(true);
    try {
      await persistenceSyncService.downloadWorkspaceZip(target.id, target);
      setWorkspaceExportNotice(`Exported "${target.name}" (ZIP Archive with Manifest, Wikis & Tasks)`);
      setTimeout(() => setWorkspaceExportNotice(null), 3500);
    } catch {
      setWorkspaceExportNotice('Workspace export encountered an issue.');
    } finally {
      setIsExportingWorkspace(false);
    }
  };

  const handleJoinByCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    setIsJoining(true);
    setJoinStatusMsg(null);
    try {
      const res = workforceManagementService.joinWorkspaceByCode(joinCode.trim(), user);
      if (res.success) {
        setJoinStatusMsg({ type: 'success', text: `Successfully joined ${res.workspaceName || 'workspace'}!` });
        setJoinCode('');
      } else {
        setJoinStatusMsg({ type: 'error', text: res.message });
      }
    } catch (err: any) {
      setJoinStatusMsg({ type: 'error', text: err.message || 'Failed to join workspace' });
    } finally {
      setIsJoining(false);
    }
  };

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages]);

  useEffect(() => {
    if (activeWorkspace) {
      loadWikiArticles();
    }
  }, [activeWorkspace]);

  const loadWikiArticles = async () => {
    if (!activeWorkspace) return;
    try {
      const articles = await dbService.getKnowledgeWiki(activeWorkspace.id);
      setWikiArticles(articles || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddWikiArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkspace || !newWikiTitle.trim() || !newWikiContent.trim()) return;
    try {
      const list = await dbService.addKnowledgeWikiItem(
        activeWorkspace.id,
        newWikiTitle.trim(),
        newWikiContent.trim(),
        user.username
      );
      setWikiArticles(list || []);
      setNewWikiTitle('');
      setNewWikiContent('');
      setIsAddingWiki(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateWS = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWSName.trim()) return;
    await onCreateWorkspace(newWSName.trim());
    setNewWSName('');
    setAIAnalysis(null);
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWSTaskText.trim()) return;
    await onAddWorkspaceTask(newWSTaskText.trim());
    setNewWSTaskText('');
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatText.trim()) return;
    const text = newChatText.trim();
    setNewChatText('');
    await onSendWorkspaceMessage(text);
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !activeWorkspace) return;
    try {
      await dbService.inviteToWorkspace(
        activeWorkspace.id,
        inviteEmail.trim(),
        user.email,
        activeWorkspace.name
      );
      setInviteSuccessMsg(`Invitation dispatched to ${inviteEmail}!`);
      setInviteEmail('');
      setTimeout(() => setInviteSuccessMsg(''), 4500);
    } catch (e) {
      console.error(e);
    }
  };

  // Run AI Workspace Analytics Module via server endpoint `/api/workspace-ai-analysis`
  const runAIAnalysis = async () => {
    if (!activeWorkspace) return;
    setIsAnalyzing(true);
    try {
      const completedCount = activeTasks.filter(t => t.completed).length;
      const totalCount = activeTasks.length;

      const res = await fetch('/api/workspace-ai-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceName: activeWorkspace.name,
          totalTasks: totalCount,
          completedTasks: completedCount,
          memberCount: activeMembers.length
        })
      });
      const data = await res.json();
      setAIAnalysis({
        burnoutRisk: data.burnoutRisk || 'Low',
        teamMomentum: data.teamMomentum || 'Moderate',
        executionTrend: data.executionTrend || 'Normal track',
        recommendation: data.recommendation || 'No custom recommendation.'
      });
    } catch (e) {
      console.error('Failed to analyze workspace', e);
      setAIAnalysis({
        burnoutRisk: 'Low',
        teamMomentum: 'Moderate',
        executionTrend: 'Steady state logs',
        recommendation: 'Ensure team alignment and prevent delays.'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6" id="workspace-tab">
      
      {/* Active Invites Panel */}
      {listOfInvites.length > 0 && (
        <div className="border border-brand-purple/30 bg-[#9d4edd]/5 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-5 h-5 text-brand-purple fill-brand-purple/20 animate-bounce" />
            <span className="text-sm font-semibold text-white font-display">Active Workspace Invites Detected</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {listOfInvites.map((invite) => (
              <div key={invite.id} className="p-4 bg-slate-950/40 rounded-xl border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-white">{invite.workspaceName}</h4>
                  <p className="text-xs text-gray-400 mt-0.5">Invited by user: {invite.senderEmail}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onAcceptInvite(invite.id)}
                    className="py-1.5 px-3 bg-[#00f5d4]/20 border border-[#00f5d4]/30 text-[#00f5d4] hover:bg-[#00f5d4]/30 rounded text-xs font-semibold cursor-pointer"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => onDeclineInvite(invite.id)}
                    className="py-1.5 px-3 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 rounded text-xs font-semibold cursor-pointer"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Grid: Workspace Navigator vs Workspace Workspace Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Workspace Sidebar Selector */}
        <div className="glass-panel p-5 rounded-2xl space-y-6 h-fit" id="workspace-sidebar">
          <div>
            <div className="flex items-center gap-2 text-brand-purple mb-4">
              <Milestone className="w-5 h-5" />
              <span className="text-xs font-mono tracking-wider font-semibold uppercase">Workspace list</span>
            </div>

            {/* List of active Workspaces */}
            {workspaces.length === 0 ? (
              <p className="text-xs text-gray-500 italic py-4">No participating workspaces found.</p>
            ) : (
              <div className="space-y-2">
                {workspaces.map((ws) => {
                  const isActive = activeWorkspace?.id === ws.id;
                  return (
                    <div
                      key={ws.id}
                      className={`w-full p-3 rounded-xl border text-xs font-semibold flex items-center justify-between gap-2 transition-all ${
                        isActive 
                          ? 'bg-[#9d4edd]/20 border-[#9d4edd]/40 text-[#ffffff]' 
                          : 'bg-black/10 border-white/5 text-gray-400 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <button
                        onClick={() => {
                          onSelectWorkspace(ws);
                          setAIAnalysis(null);
                        }}
                        className="flex-1 text-left min-w-0 cursor-pointer"
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="font-semibold block truncate leading-normal text-sm">{ws.name}</span>
                          {ws.ownerId === user.uid && (
                            <span className="px-1 text-[9px] font-mono border border-brand-purple/30 text-brand-purple bg-brand-purple/10 rounded shrink-0">
                              OWNER
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-gray-500 font-mono">Members: {ws.memberIds.length}</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExportWorkspace(ws);
                        }}
                        className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-brand-cyan transition-colors cursor-pointer shrink-0"
                        title={`Export "${ws.name}" as ZIP archive`}
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Create workspace Form */}
          <div className="border-t border-white/5 pt-4">
            <h4 className="text-xs font-mono text-gray-400 mb-2">CREATE COLLABORATION</h4>
            <form onSubmit={handleCreateWS} className="space-y-2">
              <input
                type="text"
                value={newWSName}
                onChange={(e) => setNewWSName(e.target.value)}
                placeholder="VINEXSAH Sprints..."
                className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-brand-purple/50 focus:ring-1 focus:ring-brand-purple/50 transition-all"
              />
              <button
                type="submit"
                className="w-full py-2 bg-brand-purple/20 hover:bg-brand-purple/30 border border-brand-purple/40 text-brand-purple font-semibold rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Establish Space
              </button>
            </form>
          </div>

          {/* V23 Join with Invite Code */}
          <div className="border-t border-white/5 pt-4">
            <h4 className="text-xs font-mono text-gray-400 mb-2 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-brand-cyan" />
              JOIN WITH INVITE CODE
            </h4>
            <form onSubmit={handleJoinByCode} className="space-y-2">
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="e.g. CATALYX-ENG-2026"
                className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-gray-200 placeholder-gray-600 uppercase focus:outline-none focus:border-brand-cyan/50 focus:ring-1 focus:ring-brand-cyan/50 transition-all"
              />
              <button
                type="submit"
                disabled={isJoining}
                className="w-full py-2 bg-brand-cyan/10 hover:bg-brand-cyan/20 border border-brand-cyan/30 text-brand-cyan font-semibold rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <Key className="w-3.5 h-3.5" />
                {isJoining ? 'Joining...' : 'Enroll via Code'}
              </button>
            </form>
            {joinStatusMsg && (
              <p className={`text-[11px] font-mono mt-2 ${joinStatusMsg.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
                {joinStatusMsg.text}
              </p>
            )}
          </div>

        </div>

        {/* Selected Workspace Dashboard */}
        <div className="lg:col-span-3 space-y-6">
          {activeWorkspace ? (
            <div className="space-y-6" id="active-workspace-panel">
              
              {/* Workspace Header Panel */}
              <div className="glass-panel p-6 rounded-2xl relative overflow-hidden bg-gradient-to-r from-indigo-950/20 to-slate-950/20">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                  <div>
                    <span className="px-2 py-0.5 text-[10px] font-mono tracking-widest text-brand-cyan border border-brand-cyan/20 bg-brand-cyan/5 rounded">
                      ACTIVE ENVIRONMENT COLLABORATOR
                    </span>
                    <h2 className="text-2xl font-display font-semibold text-white mt-2">{activeWorkspace.name}</h2>
                    <p className="text-xs text-brand-pink font-mono mt-1">Established: {new Date(activeWorkspace.createdAt).toLocaleString()}</p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    {/* Export Workspace ZIP */}
                    <button
                      type="button"
                      onClick={() => handleExportWorkspace()}
                      disabled={isExportingWorkspace}
                      className="py-2 px-3.5 bg-white/5 hover:bg-white/10 border border-white/15 text-gray-200 rounded-xl text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm disabled:opacity-50"
                      title="Download complete Workspace Archive (ZIP with Manifest, Wikis, Tasks & Documents)"
                    >
                      <Download className="w-3.5 h-3.5 text-brand-cyan" />
                      <span>{isExportingWorkspace ? 'Exporting...' : 'Export Workspace (ZIP)'}</span>
                    </button>

                    {/* Invite members inside header */}
                    <form onSubmit={handleSendInvite} className="flex gap-2">
                      <input
                        type="email"
                        required
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="alex@vinexsah.com"
                        className="bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-brand-cyan/50"
                      />
                      <button
                        type="submit"
                        className="py-2 px-4 bg-brand-cyan/10 hover:bg-brand-cyan/20 border border-brand-cyan/30 text-brand-cyan rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        <Plus className="w-4 h-4" />
                        Invite
                      </button>
                    </form>
                  </div>
                </div>
                {workspaceExportNotice && (
                  <p className="text-xs mt-3 text-emerald-300 font-mono flex items-center gap-1.5 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <Check className="w-4 h-4 text-emerald-400" /> {workspaceExportNotice}
                  </p>
                )}
                {inviteSuccessMsg && (
                  <p className="text-xs mt-3 text-emerald-400 font-mono flex items-center gap-1">
                    <BadgeCheck className="w-4 h-4" /> {inviteSuccessMsg}
                  </p>
                )}
              </div>

              {/* Sub-Navigation: Overview & Tasks vs 12 Creation Studios vs Microsoft 365 */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-white/10">
                <div className="flex gap-2">
                  <button
                    onClick={() => setWorkspaceSubView('overview')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-all cursor-pointer ${
                      workspaceSubView === 'overview'
                        ? 'bg-brand-purple/20 text-brand-purple border border-brand-purple/30 font-semibold'
                        : 'text-gray-400 hover:text-white bg-slate-950/40'
                    }`}
                  >
                    Overview & Collaboration
                  </button>
                  <button
                    onClick={() => setWorkspaceSubView('studios')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                      workspaceSubView === 'studios'
                        ? 'bg-brand-purple/20 text-brand-purple border border-brand-purple/30 font-semibold'
                        : 'text-gray-400 hover:text-white bg-slate-950/40'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-brand-cyan" />
                    <span>12 Creation Studios</span>
                  </button>
                </div>

                <button
                  onClick={() => setIsMicrosoftModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl text-xs font-mono font-medium text-blue-400 hover:text-blue-300 bg-blue-500/10 border border-blue-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Microsoft 365 & OneDrive</span>
                </button>
              </div>

              {workspaceSubView === 'studios' ? (
                <UniversalStudioView user={user} workspaceId={activeWorkspace.id} />
              ) : (
                <>
              {/* Grid: Tasks checklist vs Members and Chat split */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Workspace Tasks Collaboration */}
                <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-base font-display font-medium text-white flex items-center gap-2">
                        <Users className="w-4 h-4 text-brand-cyan" />
                        Workspace Tasks ({activeTasks.length})
                      </h3>
                      <span className="text-xs font-mono text-gray-500 leading-none">Complete = +15 XP</span>
                    </div>

                    <form onSubmit={handleCreateTask} className="flex gap-2 mb-4">
                      <input
                        type="text"
                        required
                        value={newWSTaskText}
                        onChange={(e) => setNewWSTaskText(e.target.value)}
                        placeholder="Deploy CATALYX core VM components..."
                        className="flex-1 bg-slate-950/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-gray-200 placeholder-gray-600"
                      />
                      <button
                        type="submit"
                        className="py-2 px-3 bg-brand-purple/20 border border-brand-purple/30 text-brand-purple hover:bg-brand-purple/30 rounded-xl text-xs font-semibold cursor-pointer"
                      >
                        Append
                      </button>
                    </form>

                    <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                      {activeTasks.length === 0 ? (
                        <p className="text-xs text-gray-500 italic py-6 text-center">No collaborative tasks found. Append one above!</p>
                      ) : (
                        activeTasks.map((t) => (
                          <div
                            key={t.id}
                            className={`p-3 rounded-xl border flex items-start gap-2.5 transition-colors ${
                              t.completed 
                                ? 'bg-black/20 border-white/5 opacity-60' 
                                : 'bg-slate-900/40 border-white/5'
                            }`}
                          >
                            <button
                              disabled={t.completed}
                              onClick={() => {
                                onCompleteWorkspaceTask(t.id);
                              }}
                              className={`mt-0.5 w-[18px] h-[18px] rounded border flex items-center justify-center transition-colors cursor-pointer ${
                                t.completed 
                                  ? 'bg-brand-cyan/20 border-brand-cyan text-brand-cyan' 
                                  : 'border-white/20 hover:border-brand-purple bg-white/5'
                              }`}
                            >
                              {t.completed && <Check className="w-3.5 h-3.5 text-brand-cyan" />}
                            </button>
                            <div>
                              <p className={`text-xs ${t.completed ? 'line-through text-gray-500' : 'text-gray-200'}`}>
                                {t.text}
                              </p>
                              {t.completed && (
                                <span className="text-[9px] font-mono text-brand-cyan block mt-1 uppercase bg-brand-cyan/10 border border-brand-cyan/20 px-1 rounded w-fit">
                                  COMPLETED (+15 XP)
                                </span>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Team Chat Space */}
                <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between h-[380px]">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-base font-display font-medium text-white flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4 text-brand-purple" />
                      Team Scrum Chat Space
                    </h3>
                    <span className="text-xs font-mono text-[#00f5d4] flex items-center gap-1">• live logs</span>
                  </div>

                  {/* Messages container */}
                  <div className="flex-1 overflow-y-auto space-y-3 pr-1 my-2">
                    {activeMessages.map((msg) => {
                      const isMe = msg.userId === user.uid;
                      const isAI = msg.ai;
                      return (
                        <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                          <div className="flex items-center gap-1 mb-0.5 text-[10px] font-mono text-gray-500">
                            <span className={isAI ? 'text-brand-magenta font-semibold text-brand-cyan' : isMe ? 'text-brand-purple' : 'text-gray-400'}>
                              {msg.username}
                            </span>
                            <span>•</span>
                            <span>{new Date(msg.createdAt).toLocaleTimeString()}</span>
                          </div>
                          <div className={`p-2.5 rounded-xl border text-xs max-w-[90%] leading-relaxed ${
                            isAI 
                              ? 'bg-brand-cyan/5 border-brand-cyan/20 text-[#00f5d4]' 
                              : isMe 
                              ? 'bg-brand-purple/10 border-brand-purple/20 text-white' 
                              : 'bg-black/20 border-white/5 text-gray-300'
                          }`}>
                            {msg.text}
                          </div>
                        </div>
                      );
                    })}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Chat input */}
                  <form onSubmit={handleSendChat} className="flex gap-2 pt-2 border-t border-white/5">
                    <input
                      type="text"
                      required
                      value={newChatText}
                      onChange={(e) => setNewChatText(e.target.value)}
                      placeholder="Comment on VM outputs..."
                      className="flex-1 bg-slate-950/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-gray-200 placeholder-gray-600 focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="p-2 px-4 bg-brand-purple hover:opacity-95 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 cursor-pointer text-white"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>

              </div>

              {/* Workspace AI Analytics Module */}
              <div className="glass-panel p-6 rounded-2xl bg-gradient-to-br from-slate-950/40 via-indigo-950/10 to-transparent">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 border-b border-white/5 pb-4">
                  <div>
                    <h3 className="text-base font-display font-medium text-white flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-brand-cyan" />
                      Workspace AI Analytics Scrutineer
                    </h3>
                    <p className="text-xs text-gray-400">Trigger Gemini artificial model evaluations of current collaborative variables.</p>
                  </div>
                  <button
                    onClick={runAIAnalysis}
                    disabled={isAnalyzing}
                    className="py-2 px-4.5 bg-gradient-to-r from-brand-purple to-brand-cyan text-white hover:opacity-95 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 shadow-md disabled:opacity-30 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
                    {isAnalyzing ? 'Evaluating stats...' : 'Evaluate workspace AI'}
                  </button>
                </div>

                {aiAnalysis ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Burnout Indicator */}
                    <div className="p-4 bg-black/20 rounded-xl border border-white/5">
                      <span className="text-[10px] font-mono text-gray-500 uppercase block mb-1">Burnout Risk</span>
                      <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${
                          aiAnalysis.burnoutRisk.toLowerCase().includes('high') ? 'bg-red-500 animate-ping' : 
                          aiAnalysis.burnoutRisk.toLowerCase().includes('moderate') ? 'bg-amber-400' : 'bg-emerald-400'
                        }`} />
                        <span className="text-sm font-semibold font-display text-white">{aiAnalysis.burnoutRisk} Indicator</span>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-2">Correlated to team task completion frequency vs member fatigue indices.</p>
                    </div>

                    {/* Team Momentum */}
                    <div className="p-4 bg-black/20 rounded-xl border border-white/5">
                      <span className="text-[10px] font-mono text-gray-500 uppercase block mb-1">Team Momentum</span>
                      <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${
                          aiAnalysis.teamMomentum.toLowerCase().includes('optimal') ? 'bg-brand-cyan' : 
                          aiAnalysis.teamMomentum.toLowerCase().includes('low') ? 'bg-brand-pink' : 'bg-brand-purple'
                        }`} />
                        <span className="text-sm font-semibold font-display text-white">{aiAnalysis.teamMomentum} Velocity</span>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-2">Tracks active sprints progress curves representing continuous completion velocities.</p>
                    </div>

                    {/* Execution Trend */}
                    <div className="p-4 bg-black/20 rounded-xl border border-white/5">
                      <span className="text-[10px] font-mono text-gray-500 uppercase block mb-1">Execution Trend</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold font-display text-brand-purple">{aiAnalysis.executionTrend}</span>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-2">Aura trajectory tracking outputs calculated from backlog trends.</p>
                    </div>

                    {/* Dynamic Recommendations */}
                    <div className="md:col-span-3 p-4 bg-slate-900/40 border border-[#00f5d4]/20 rounded-xl">
                      <div className="flex items-center gap-1.5 text-brand-cyan mb-2">
                        <Sparkles className="w-4 h-4 text-brand-cyan fill-brand-cyan/10 animate-pulse" />
                        <span className="text-xs font-mono uppercase font-black">Scrutineer Recommendation Log</span>
                      </div>
                      <p className="text-xs text-gray-300 leading-relaxed font-sans">
                        {aiAnalysis.recommendation}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center border border-dashed border-white/5 rounded-xl bg-white/[0.005]">
                    <AlertCircle className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                    <p className="text-xs text-gray-500 font-sans leading-relaxed">
                      AI Scrum Analytics have not been evaluated. Click "Evaluate workspace AI" above to direct Gemini models to run burnout forecasts.
                    </p>
                  </div>
                )}
              </div>

              {/* Members of Workspace Subcollection View */}
              <div className="glass-panel p-6 rounded-2xl">
                <h3 className="text-base font-display font-medium text-white flex items-center gap-2 mb-4">
                  <Users className="w-4 h-4 text-brand-purple" />
                  Active Space Collaborators ({activeMembers.length})
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeMembers.map((m) => (
                    <div key={m.uid} className="p-3 bg-black/10 border border-white/5 rounded-xl flex items-center justify-between">
                      <div className="truncate pr-2">
                        <span className="text-xs font-semibold text-white block truncate">{m.username}</span>
                        <span className="text-[10px] text-gray-500 font-mono block truncate">{m.email}</span>
                      </div>
                      <span className={`px-1.5 py-0.5 text-[9px] font-mono border rounded uppercase text-right shrink-0 ${
                        m.role === 'owner' 
                          ? 'border-brand-purple/30 text-brand-purple bg-brand-purple/5' 
                          : 'border-brand-cyan/20 text-brand-cyan bg-brand-cyan/5'
                      }`}>
                        {m.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* MODULE 7: KNOWLEDGE VAULT (WIKI & SOP) */}
              <div className="glass-panel p-6 rounded-2xl space-y-4">
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <div>
                    <span className="px-2 py-0.5 text-[9px] font-mono tracking-widest text-brand-cyan border border-brand-cyan/20 bg-brand-cyan/5 rounded uppercase">
                      MODULE 7: KNOWLEDGE VAULT
                    </span>
                    <h3 className="text-base font-display font-medium text-white flex items-center gap-2 mt-1.5">
                      <BookOpen className="w-4.5 h-4.5 text-brand-cyan" />
                      Workspace SOPs & Wiki Guidelines
                    </h3>
                  </div>

                  <button
                    onClick={() => setIsAddingWiki(!isAddingWiki)}
                    className="py-1 px-3 bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors hover:bg-brand-cyan/20 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Publish SOP
                  </button>
                </div>

                {isAddingWiki && (
                  <form onSubmit={handleAddWikiArticle} className="p-4 bg-slate-950/40 border border-white/5 rounded-xl space-y-3">
                    <div>
                      <label className="block text-[10px] font-mono text-gray-500 uppercase mb-1">Standard Operating Procedure Doc Title</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Deployment pipeline checklist"
                        value={newWikiTitle}
                        onChange={(e) => setNewWikiTitle(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-gray-100 placeholder-gray-700 focus:outline-[#00f5d4] focus:outline-1"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-gray-500 uppercase mb-1">Interactive Wiki Content</label>
                      <textarea
                        required
                        placeholder="Detail the execution instructions, server specifications, and compliance rules..."
                        value={newWikiContent}
                        onChange={(e) => setNewWikiContent(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-gray-100 placeholder-gray-700 resize-none h-20 focus:outline-[#00f5d4] focus:outline-1"
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="py-1.5 px-4 bg-brand-cyan hover:opacity-90 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        Instantiate Article
                      </button>
                    </div>
                  </form>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {wikiArticles.map((art) => (
                    <div key={art.id} className="p-4 bg-black/25 border border-white/5 rounded-2xl flex flex-col justify-between">
                      <div>
                        <h4 className="text-xs font-mono font-bold text-slate-100 uppercase tracking-tight flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan" />
                          {art.title}
                        </h4>
                        <p className="text-[11px] text-gray-400 mt-2 leading-relaxed whitespace-pre-line">{art.content}</p>
                      </div>

                      <div className="border-t border-white/5 pt-2 mt-4 flex justify-between items-center text-[9px] text-gray-500 font-mono">
                        <span>By: {art.authorName}</span>
                        <span>{new Date(art.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}

                  {wikiArticles.length === 0 && (
                    <p className="text-xs text-gray-500 italic py-2 col-span-2">No standard operating procedures published to the knowledge vault.</p>
                  )}
                </div>
              </div>
              </>
              )}

            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center py-20 text-center glass-panel rounded-2xl border border-dashed border-white/5">
              <Milestone className="w-12 h-12 text-brand-purple opacity-30 mb-3 animate-pulse" />
              <h3 className="text-lg font-display font-medium text-white">Select active workspace logs</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm">
                Select one of your participating locations or establish a new Space on the left sidebar to coordinate team goals!
              </p>
            </div>
          )}
        </div>

      </div>

      <MicrosoftIntegrationModal
        isOpen={isMicrosoftModalOpen}
        onClose={() => setIsMicrosoftModalOpen(false)}
      />
    </div>
  );
};
