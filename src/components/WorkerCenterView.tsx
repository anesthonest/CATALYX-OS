import React, { useState } from 'react';
import { 
  UserProfile, 
  UserPersonaRole, 
  Task 
} from '../types';
import { 
  workforceManagementService, 
  WorkerAssignmentSummary, 
  WorkerRelationshipMap,
  WorkspaceInvitationV23 
} from '../services/workforceManagementService';
import { 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ArrowRight, 
  ShieldCheck, 
  Briefcase, 
  Send, 
  UserPlus, 
  Link2, 
  Key, 
  FileText, 
  Sparkles, 
  Layers, 
  CheckSquare, 
  Compass, 
  HelpCircle,
  TrendingUp,
  Award,
  Bell,
  ChevronRight
} from 'lucide-react';

interface WorkerCenterViewProps {
  user: UserProfile;
  tasks: Task[];
  activeRole: UserPersonaRole;
  onNavigate: (tabId: string) => void;
  onTaskToggle?: (taskId: string) => void;
}

export const WorkerCenterView: React.FC<WorkerCenterViewProps> = ({
  user,
  tasks,
  activeRole,
  onNavigate,
  onTaskToggle
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'my_work' | 'relationships' | 'join_workspace' | 'team'>('my_work');
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [joinMessage, setJoinMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Invite creation form state
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [newInviteEmail, setNewInviteEmail] = useState('');
  const [newInviteRole, setNewInviteRole] = useState<'worker' | 'contractor' | 'manager'>('worker');
  const [inviteCreatedCode, setInviteCreatedCode] = useState<string | null>(null);

  const summary: WorkerAssignmentSummary = workforceManagementService.getWorkerCenterSummary(user, tasks);
  const relationships: WorkerRelationshipMap = workforceManagementService.getWorkerRelationshipMap(user.uid, activeRole);
  const invitations: WorkspaceInvitationV23[] = workforceManagementService.getInvitations(user.email);

  const handleJoinByCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCodeInput.trim()) return;

    const res = workforceManagementService.joinWorkspaceByCode(inviteCodeInput.trim(), user);
    if (res.success) {
      setJoinMessage({ type: 'success', text: res.message });
      setInviteCodeInput('');
    } else {
      setJoinMessage({ type: 'error', text: res.message });
    }
  };

  const handleCreateInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInviteEmail.trim()) return;

    const inv = workforceManagementService.createInvitation(
      'ws_engineering_core',
      'Engineering & Infrastructure Team',
      newInviteEmail.trim(),
      newInviteRole,
      user.email,
      false
    );
    setInviteCreatedCode(inv.inviteCode);
    setNewInviteEmail('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fadeIn">
      {/* 1. Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-brand-cyan/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30 flex items-center gap-1">
              <Briefcase className="w-3 h-3" />
              UNIVERSAL WORKER CENTER
            </span>
            <span className="text-xs text-gray-400 font-mono">
              V23 Production Workforce Hub
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
            Workforce & Operations Center
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 mt-1 max-w-2xl">
            Single-pane operational workspace. Manage personal work, team dependencies, transparent reporting relationships, customer assignments, and workspace enrollments.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveSubTab('join_workspace')}
            className="px-3.5 py-2 rounded-xl bg-brand-cyan/20 border border-brand-cyan/40 text-brand-cyan hover:bg-brand-cyan/30 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Key className="w-3.5 h-3.5" />
            Join Workspace
          </button>
          <button
            onClick={() => setShowInviteModal(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-800 border border-white/10 text-white hover:bg-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5 text-brand-purple" />
            Invite Member
          </button>
        </div>
      </div>

      {/* 2. Sub Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('my_work')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'my_work'
              ? 'bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <CheckSquare className="w-3.5 h-3.5" />
          My Work & Deadlines ({summary.assignedTasks.length})
        </button>

        <button
          onClick={() => setActiveSubTab('relationships')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'relationships'
              ? 'bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Accountability & Relationships
        </button>

        <button
          onClick={() => setActiveSubTab('join_workspace')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'join_workspace'
              ? 'bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          Join / Switch Workspace
          {invitations.length > 0 && (
            <span className="w-4 h-4 rounded-full bg-brand-cyan text-slate-950 font-bold text-[9px] flex items-center justify-center">
              {invitations.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('team')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'team'
              ? 'bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          Team & Assignments
        </button>
      </div>

      {/* 3. Sub-Tab Content */}

      {/* SUB-TAB A: MY WORK & DEADLINES */}
      {activeSubTab === 'my_work' && (
        <div className="space-y-6">
          {/* Telemetry Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="glass-panel p-4 rounded-xl border border-white/10">
              <span className="text-[11px] font-mono text-gray-400 uppercase">Assigned Tasks</span>
              <div className="text-2xl font-bold text-white mt-1">{summary.assignedTasks.length}</div>
              <span className="text-[11px] text-brand-cyan flex items-center gap-1 mt-1">
                <CheckCircle2 className="w-3 h-3" />
                {summary.completedTasksThisWeek} completed this week
              </span>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-white/10">
              <span className="text-[11px] font-mono text-gray-400 uppercase">High Priority</span>
              <div className="text-2xl font-bold text-amber-400 mt-1">{summary.highPriorityCount}</div>
              <span className="text-[11px] text-amber-300/80 flex items-center gap-1 mt-1">
                <Clock className="w-3 h-3" />
                {summary.deadlinesCount} due in 48h
              </span>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-white/10">
              <span className="text-[11px] font-mono text-gray-400 uppercase">Customer Accounts</span>
              <div className="text-2xl font-bold text-brand-purple mt-1">{summary.customerAssignments.length}</div>
              <span className="text-[11px] text-purple-300 flex items-center gap-1 mt-1">
                <Users className="w-3 h-3" />
                Active SLA Coverage
              </span>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-white/10">
              <span className="text-[11px] font-mono text-gray-400 uppercase">Execution Score</span>
              <div className="text-2xl font-bold text-emerald-400 mt-1">{summary.performanceScore}%</div>
              <span className="text-[11px] text-emerald-300 flex items-center gap-1 mt-1">
                <Award className="w-3 h-3" />
                Optimal Alignment
              </span>
            </div>
          </div>

          {/* Announcements & High Priority Banner */}
          {summary.activeAnnouncements.map((ann) => (
            <div key={ann.id} className="p-4 rounded-xl border border-brand-cyan/30 bg-brand-cyan/5 flex items-start gap-3">
              <Bell className="w-4 h-4 text-brand-cyan shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white">{ann.title}</h4>
                  <span className="text-[10px] text-gray-400 font-mono">{ann.date} • {ann.author}</span>
                </div>
                <p className="text-xs text-gray-300 mt-1 leading-relaxed">{ann.content}</p>
              </div>
            </div>
          ))}

          {/* Tasks & Workload Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Personal Assigned Tasks */}
            <div className="lg:col-span-2 glass-panel p-5 rounded-2xl border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-brand-cyan" />
                  <h3 className="text-sm font-bold text-white">Assigned Execution Backlog</h3>
                </div>
                <button
                  onClick={() => onNavigate('tasks')}
                  className="text-xs text-brand-cyan hover:underline flex items-center gap-1"
                >
                  View Full Backlog <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              <div className="space-y-2">
                {summary.assignedTasks.map((t) => (
                  <div
                    key={t.id}
                    className="p-3 rounded-xl border border-white/5 bg-slate-950/60 hover:border-white/20 transition-all flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={t.completed}
                        onChange={() => onTaskToggle?.(t.id)}
                        className="w-4 h-4 rounded text-brand-cyan bg-slate-900 border-white/20 focus:ring-brand-cyan cursor-pointer"
                        aria-label={`Toggle task ${t.text}`}
                      />
                      <span className={`text-xs truncate ${t.completed ? 'line-through text-gray-500' : 'text-gray-200'}`}>
                        {t.text}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {t.priority && (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                          t.priority === 'high' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                          t.priority === 'medium' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                          'bg-slate-800 text-gray-400'
                        }`}>
                          {t.priority}
                        </span>
                      )}
                      {t.dueDate && (
                        <span className="text-[10px] text-gray-400 font-mono flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {t.dueDate}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right 1 Col: Customer & Workflow Assignments */}
            <div className="space-y-6">
              {/* Customer Assignments */}
              <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-brand-purple" />
                    <h3 className="text-sm font-bold text-white">Assigned Customer Accounts</h3>
                  </div>
                  <button
                    onClick={() => onNavigate('commerce')}
                    className="text-[11px] text-brand-purple hover:underline"
                  >
                    CRM
                  </button>
                </div>

                <div className="space-y-2">
                  {summary.customerAssignments.map((cust) => (
                    <div key={cust.customerId} className="p-2.5 rounded-xl border border-white/5 bg-slate-950/60 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-semibold text-white">{cust.customerName}</div>
                        <div className="text-[10px] text-gray-400 font-mono">
                          {cust.tier} • Last contact {cust.lastContactDate}
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-brand-purple/20 text-brand-purple border border-brand-purple/30">
                        {cust.activeOrderCount} Orders
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Workflow Assignments */}
              <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-sm font-bold text-white">Active Workflows</h3>
                  </div>
                  <button
                    onClick={() => onNavigate('workflows')}
                    className="text-[11px] text-emerald-400 hover:underline"
                  >
                    All Workflows
                  </button>
                </div>

                <div className="space-y-2">
                  {summary.workflowAssignments.map((wf) => (
                    <div key={wf.workflowId} className="p-2.5 rounded-xl border border-white/5 bg-slate-950/60">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-white">{wf.workflowName}</span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono uppercase bg-emerald-500/20 text-emerald-300">
                          {wf.status}
                        </span>
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono mt-1">
                        Awaiting: <strong className="text-gray-200">{wf.pendingStep}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB B: TRANSPARENT RELATIONSHIPS & ACCOUNTABILITY */}
      {activeSubTab === 'relationships' && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl border border-white/10 bg-slate-950/60">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-brand-cyan" />
              Explicit Responsibility & Operational Dependencies
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Every worker in CATALYX has transparent visibility into their organizational hierarchy, dependencies, deliverables, and upstream/downstream blockers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 1. WHO I WORK WITH */}
            <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3">
              <h4 className="text-xs font-bold text-brand-cyan uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                Who I Work With
              </h4>
              <div className="space-y-2">
                {relationships.whoIWorkWith.map((collab) => (
                  <div key={collab.uid} className="p-3 rounded-xl border border-white/5 bg-slate-950/60 flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${collab.avatarBg} text-white font-bold text-xs flex items-center justify-center shrink-0`}>
                      {collab.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate">{collab.name}</div>
                      <div className="text-[10px] text-gray-400 font-mono truncate">{collab.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. WHO I REPORT TO */}
            <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3">
              <h4 className="text-xs font-bold text-brand-purple uppercase tracking-wider font-mono flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Who I Report To
              </h4>
              {relationships.whoIReportTo ? (
                <div className="p-4 rounded-xl border border-brand-purple/30 bg-brand-purple/5 space-y-2">
                  <div className="text-sm font-bold text-white">{relationships.whoIReportTo.name}</div>
                  <div className="text-xs text-brand-purple font-medium">{relationships.whoIReportTo.title}</div>
                  <div className="text-[11px] text-gray-400">Governance Tier: {relationships.whoIReportTo.role}</div>
                  <div className="pt-2 border-t border-white/10 text-[10px] font-mono text-gray-400">
                    SLA Escalation Path: Direct Briefings & Weekly Sprint Reviews
                  </div>
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic">Direct executive governance.</p>
              )}
            </div>

            {/* 3. WHAT I AM RESPONSIBLE FOR */}
            <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3">
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5" />
                What I Am Responsible For
              </h4>
              <div className="space-y-2">
                {relationships.whatIAmResponsibleFor.map((resp) => (
                  <div key={resp.id} className="p-3 rounded-xl border border-white/5 bg-slate-950/60">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{resp.title}</span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-emerald-500/20 text-emerald-300">
                        {resp.slaStatus}
                      </span>
                    </div>
                    <div className="text-[10px] text-gray-400 font-mono mt-1 uppercase">
                      Type: {resp.type}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. WHAT DEPENDS ON MY WORK */}
            <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                What Depends On My Work
              </h4>
              <div className="space-y-2">
                {relationships.whatDependsOnMyWork.map((dep) => (
                  <div key={dep.dependentTaskId} className="p-3 rounded-xl border border-amber-500/20 bg-amber-500/5">
                    <div className="text-xs font-semibold text-white">{dep.dependentTaskTitle}</div>
                    <div className="text-[10px] text-amber-300 mt-1">Waiting: {dep.assigneeName}</div>
                    <div className="text-[10px] text-gray-400 font-mono mt-0.5">{dep.blockedReason}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 5. WHAT DEPENDS ON OTHER PEOPLE */}
            <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3">
              <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                What Depends On Other People
              </h4>
              <div className="space-y-2">
                {relationships.whatDependsOnOtherPeople.map((block) => (
                  <div key={block.myTaskId} className="p-3 rounded-xl border border-red-500/20 bg-red-500/5">
                    <div className="text-xs font-semibold text-white">{block.myTaskTitle}</div>
                    <div className="text-[10px] text-red-300 mt-1">Blocked by: {block.waitingOn}</div>
                    <div className="text-[10px] text-gray-400 font-mono mt-0.5">Category: {block.blockerType}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 6. MISSION PARTICIPATION */}
            <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3">
              <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5" />
                Strategic Missions
              </h4>
              <div className="space-y-2">
                {summary.missionParticipation.map((mis) => (
                  <div key={mis.missionId} className="p-3 rounded-xl border border-white/5 bg-slate-950/60">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{mis.missionTitle}</span>
                      <span className="text-xs font-bold text-brand-cyan">{mis.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div className="bg-brand-cyan h-full rounded-full" style={{ width: `${mis.progress}%` }} />
                    </div>
                    <div className="text-[10px] text-gray-400 font-mono mt-1.5">
                      Role: {mis.roleInMission}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB C: JOIN / SWITCH WORKSPACE */}
      {activeSubTab === 'join_workspace' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Join by Code Form */}
            <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
              <div className="flex items-center gap-2 text-brand-cyan">
                <Key className="w-5 h-5" />
                <h3 className="text-base font-bold text-white">Join Workspace via Invitation Code</h3>
              </div>
              <p className="text-xs text-gray-300">
                Enter an authorized invitation code (e.g. <code>CATALYX-ENG-2026</code>) provided by your workspace administrator to enroll your account.
              </p>

              <form onSubmit={handleJoinByCode} className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-300 block mb-1">Invitation Code</label>
                  <input
                    type="text"
                    value={inviteCodeInput}
                    onChange={(e) => setInviteCodeInput(e.target.value)}
                    placeholder="CATALYX-XXXX-0000"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/15 text-white text-sm font-mono focus:outline-none focus:border-brand-cyan uppercase"
                  />
                </div>

                {joinMessage && (
                  <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    joinMessage.type === 'success' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                    'bg-red-500/20 text-red-300 border border-red-500/30'
                  }`}>
                    {joinMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
                    <span>{joinMessage.text}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-brand-cyan text-slate-950 font-bold text-xs hover:bg-brand-cyan/90 transition-all cursor-pointer shadow-lg shadow-brand-cyan/20"
                >
                  Verify & Join Workspace
                </button>
              </form>
            </div>

            {/* Pending Invitations Box */}
            <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
              <div className="flex items-center gap-2 text-brand-purple">
                <Link2 className="w-5 h-5" />
                <h3 className="text-base font-bold text-white">Pending Invitations ({invitations.length})</h3>
              </div>
              <p className="text-xs text-gray-300">
                Direct invitations dispatched to your email address (<code>{user.email}</code>).
              </p>

              <div className="space-y-3">
                {invitations.map((inv) => (
                  <div key={inv.inviteId} className="p-3.5 rounded-xl border border-white/10 bg-slate-950/70 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{inv.workspaceName}</span>
                      <span className="px-2 py-0.5 rounded text-[9px] font-mono uppercase bg-brand-cyan/20 text-brand-cyan">
                        {inv.invitedRole}
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-400 font-mono">
                      Code: <strong className="text-white">{inv.inviteCode}</strong> • Invited by {inv.senderEmail}
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => {
                          const res = workforceManagementService.joinWorkspaceByCode(inv.inviteCode, user);
                          setJoinMessage({ type: res.success ? 'success' : 'error', text: res.message });
                        }}
                        className="px-3 py-1.5 rounded-lg bg-brand-cyan/20 border border-brand-cyan/40 text-brand-cyan hover:bg-brand-cyan/30 text-xs font-semibold cursor-pointer"
                      >
                        Accept & Enter
                      </button>
                      <button
                        onClick={() => {
                          inv.status = 'DECLINED';
                          setJoinMessage({ type: 'info', text: 'Invitation declined.' });
                        }}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 text-gray-400 hover:text-white text-xs font-semibold cursor-pointer"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB D: TEAM & ASSIGNMENTS */}
      {activeSubTab === 'team' && (
        <div className="space-y-6">
          <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-brand-cyan" />
                  Engineering & Infrastructure Core Members
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Multi-disciplinary collective executing across software, commerce, and planetary models.
                </p>
              </div>
              <button
                onClick={() => setShowInviteModal(true)}
                className="px-3 py-1.5 rounded-xl bg-brand-cyan/20 border border-brand-cyan/40 text-brand-cyan text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Add Team Member
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {relationships.whoIWorkWith.map((member) => (
                <div key={member.uid} className="p-4 rounded-xl border border-white/5 bg-slate-950/60 flex flex-col justify-between">
                  <div>
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${member.avatarBg} text-white font-bold text-sm flex items-center justify-center mb-3`}>
                      {member.name.charAt(0)}
                    </div>
                    <div className="text-xs font-bold text-white">{member.name}</div>
                    <div className="text-[10px] text-brand-cyan font-mono mt-0.5">{member.role}</div>
                    <div className="text-[10px] text-gray-400 mt-1">{member.email}</div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-gray-400">
                    <span>Active In: Workspace</span>
                    <span className="text-emerald-400 font-bold">ONLINE</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-2xl border border-white/15 max-w-md w-full space-y-4 bg-slate-900 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-brand-cyan" />
                Invite Member to Workspace
              </h3>
              <button
                onClick={() => {
                  setShowInviteModal(false);
                  setInviteCreatedCode(null);
                }}
                className="text-gray-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {inviteCreatedCode ? (
              <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 space-y-2">
                <div className="text-xs font-bold text-emerald-300">Invitation Generated!</div>
                <p className="text-xs text-gray-300">Share this code with the recipient:</p>
                <div className="p-2.5 rounded-lg bg-slate-950 font-mono text-sm font-bold text-brand-cyan text-center border border-white/10">
                  {inviteCreatedCode}
                </div>
                <button
                  onClick={() => setInviteCreatedCode(null)}
                  className="w-full mt-2 py-2 rounded-lg bg-slate-800 text-xs font-bold text-white hover:bg-slate-700"
                >
                  Invite Another Member
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateInvite} className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-300 block mb-1">Recipient Email</label>
                  <input
                    type="email"
                    required
                    value={newInviteEmail}
                    onChange={(e) => setNewInviteEmail(e.target.value)}
                    placeholder="colleague@domain.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/15 text-white text-xs focus:outline-none focus:border-brand-cyan"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-300 block mb-1">Target Role</label>
                  <select
                    value={newInviteRole}
                    onChange={(e) => setNewInviteRole(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/15 text-white text-xs focus:outline-none focus:border-brand-cyan cursor-pointer"
                  >
                    <option value="worker">Worker (Standard Tasks & Backlogs)</option>
                    <option value="contractor">Contractor (Scoped Access)</option>
                    <option value="manager">Manager (Approvals & Task Delegation)</option>
                  </select>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="px-3 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-brand-cyan text-slate-950 text-xs font-bold hover:bg-brand-cyan/90 cursor-pointer"
                  >
                    Generate Invite
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
