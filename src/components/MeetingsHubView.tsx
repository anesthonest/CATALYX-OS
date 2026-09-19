import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Users, 
  Video, 
  Plus, 
  Share2, 
  CheckSquare, 
  FileText, 
  Sparkles, 
  ExternalLink, 
  ArrowRight, 
  AlertCircle, 
  Check, 
  HelpCircle,
  Briefcase,
  Target
} from 'lucide-react';
import { WorkMeeting, MeetingAttendee, MeetingActionItem, UserProfile, UserPersonaRole } from '../types';
import { meetingsService } from '../services/meetingsService';
import { collaborationService } from '../services/collaborationService';
import { UniversalShareModal } from './UniversalShareModal';

interface MeetingsHubViewProps {
  user: UserProfile;
  activeRole: UserPersonaRole;
  onNavigate: (tabId: string) => void;
  onTaskCreated?: (taskText: string) => void;
}

export const MeetingsHubView: React.FC<MeetingsHubViewProps> = ({
  user,
  activeRole,
  onNavigate,
  onTaskCreated
}) => {
  const [meetings, setMeetings] = useState<WorkMeeting[]>([]);
  const [selectedMeetingId, setSelectedMeetingId] = useState<string>('');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // New Meeting Modal
  const [isNewMeetingOpen, setIsNewMeetingOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAgenda, setNewAgenda] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newTime, setNewTime] = useState('14:00');
  const [newDurationMin, setNewDurationMin] = useState(60);
  const [newProvider, setNewProvider] = useState<WorkMeeting['provider']>('GOOGLE_MEET');
  const [newMeetingLink, setNewMeetingLink] = useState('');
  const [newAttendees, setNewAttendees] = useState(user.email);

  // Notes & Decisions state
  const [meetingNotes, setMeetingNotes] = useState('');
  const [newDecisionText, setNewDecisionText] = useState('');
  const [newActionText, setNewActionText] = useState('');
  const [newActionAssignee, setNewActionAssignee] = useState(user.email);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const loadMeetings = () => {
    const list = meetingsService.getAllMeetings();
    setMeetings(list);
    if (list.length > 0 && !selectedMeetingId) {
      setSelectedMeetingId(list[0].id);
    }
  };

  useEffect(() => {
    loadMeetings();
  }, []);

  const activeMeeting = meetings.find(m => m.id === selectedMeetingId) || meetings[0];

  useEffect(() => {
    if (activeMeeting) {
      setMeetingNotes(activeMeeting.notes || '');
      setActionNotice(null);
    }
  }, [selectedMeetingId]);

  const handleCreateMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const startDateTime = new Date(`${newDate}T${newTime}:00`).toISOString();
    const endDateTime = new Date(new Date(startDateTime).getTime() + newDurationMin * 60 * 1000).toISOString();

    const attendeeList: MeetingAttendee[] = newAttendees
      .split(',')
      .map(e => e.trim())
      .filter(Boolean)
      .map(e => ({
        email: e,
        name: e.split('@')[0],
        status: e === user.email ? 'accepted' : 'tentative'
      }));

    const created = meetingsService.createMeeting({
      title: newTitle,
      agenda: newAgenda,
      description: newDescription,
      scheduledStartTime: startDateTime,
      scheduledEndTime: endDateTime,
      timeZone: 'UTC',
      attendees: attendeeList,
      meetingLink: newMeetingLink || 'https://meet.catalyx.internal/room/' + Date.now().toString(36),
      provider: newProvider,
      workspaceId: 'Engineering Alpha Sprints'
    });

    setIsNewMeetingOpen(false);
    setNewTitle('');
    setNewAgenda('');
    setNewDescription('');
    loadMeetings();
    setSelectedMeetingId(created.id);
  };

  const handleSaveNotes = () => {
    if (!activeMeeting) return;
    meetingsService.updateMeetingNotes(activeMeeting.id, meetingNotes);
    setActionNotice('Meeting notes saved.');
    setTimeout(() => setActionNotice(null), 2500);
  };

  const handleAddDecision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDecisionText.trim() || !activeMeeting) return;

    meetingsService.addDecision(activeMeeting.id, newDecisionText);
    setNewDecisionText('');
    loadMeetings();
  };

  const handleAddActionItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActionText.trim() || !activeMeeting) return;

    meetingsService.addActionItem(activeMeeting.id, {
      text: newActionText,
      assigneeEmail: newActionAssignee,
      dueDate: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString().split('T')[0]
    });

    setNewActionText('');
    loadMeetings();
  };

  const handleConvertActionToTask = (actionItem: MeetingActionItem) => {
    if (!activeMeeting) return;

    const taskId = 'task_' + Date.now().toString(36);
    meetingsService.markActionItemConverted(activeMeeting.id, actionItem.id, taskId);

    // Save task into local storage or invoke parent callback
    try {
      const stored = localStorage.getItem('catalyx_tasks');
      const taskList = stored ? JSON.parse(stored) : [];
      taskList.unshift({
        id: taskId,
        text: `[Meeting: ${activeMeeting.title}] ${actionItem.text}`,
        completed: false,
        priority: 'high',
        category: 'work',
        createdAt: new Date().toISOString(),
        dueDate: actionItem.dueDate
      });
      localStorage.setItem('catalyx_tasks', JSON.stringify(taskList));
    } catch {}

    if (onTaskCreated) {
      onTaskCreated(`[Meeting: ${activeMeeting.title}] ${actionItem.text}`);
    }

    setActionNotice(`Action item converted into Workspace Task (${taskId}). Visible in Tasks tab.`);
    loadMeetings();
  };

  const handleGenerateSummary = () => {
    if (!activeMeeting) return;
    meetingsService.generateAiSummary(activeMeeting.id);
    loadMeetings();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-brand-purple/10 to-slate-900 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-cyan/15 text-brand-cyan border border-brand-cyan/30 uppercase font-bold">
              WORK ARTIFACTS • V24
            </span>
            <span className="text-xs text-gray-400 font-mono">Meetings & Scheduling Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-wide">
            Unified Meetings & Collaborative Execution
          </h1>
          <p className="text-xs text-gray-300 mt-1 max-w-2xl">
            Schedule synchronizations with external provider links, track live agendas and decisions, and convert action items directly into real workspace backlog tasks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsNewMeetingOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-purple to-brand-cyan text-slate-950 font-bold text-xs flex items-center gap-2 hover:opacity-95 shadow-md cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Meeting</span>
          </button>
        </div>
      </div>

      {actionNotice && (
        <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Main Grid: Scheduled Meetings List (4 cols) & Active Meeting Room (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Scheduled Meetings */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-mono uppercase text-gray-400 font-semibold tracking-wider">
              Calendar Schedule ({meetings.length})
            </span>
          </div>

          <div className="space-y-2">
            {meetings.map((m) => {
              const isSelected = m.id === activeMeeting?.id;
              const startTime = new Date(m.scheduledStartTime);
              return (
                <div
                  key={m.id}
                  onClick={() => setSelectedMeetingId(m.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 border-brand-cyan/50 shadow-lg ring-1 ring-brand-cyan/20'
                      : 'bg-slate-950/60 border-white/5 hover:border-white/20 hover:bg-slate-900/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-brand-purple/20 text-brand-cyan border border-brand-purple/30 font-semibold">
                      {m.provider}
                    </span>
                    <span className="text-[10px] font-mono text-gray-400">
                      {startTime.toLocaleDateString([], { month: 'short', day: 'numeric' })} • {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <h4 className="text-sm font-semibold text-white mt-2 leading-snug">
                    {m.title}
                  </h4>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                    {m.agenda}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-gray-500 mt-3 pt-2 border-t border-white/5">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-brand-cyan" />
                      {m.attendees.length} Attendees
                    </span>
                    <span>{m.actionItems.length} Action Items</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Meeting Agenda, Actions & Notes */}
        {activeMeeting && (
          <div className="lg:col-span-8 space-y-4">
            {/* Top Meeting Card */}
            <div className="p-6 rounded-3xl bg-slate-950/90 border border-white/10 space-y-4 shadow-xl">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-brand-cyan/15 text-brand-cyan text-[10px] font-mono uppercase font-bold">
                      {activeMeeting.provider}
                    </span>
                    {activeMeeting.workspaceId && (
                      <span className="px-2 py-0.5 rounded bg-white/5 text-gray-300 text-[10px] font-mono border border-white/10">
                        {activeMeeting.workspaceId}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-white mt-1.5">{activeMeeting.title}</h3>
                  <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-brand-cyan" />
                    <span>
                      {new Date(activeMeeting.scheduledStartTime).toLocaleString()} — {new Date(activeMeeting.scheduledEndTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({activeMeeting.timeZone})
                    </span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsShareModalOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10 text-xs font-mono flex items-center gap-1.5 cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5 text-brand-cyan" />
                    <span>Share Details</span>
                  </button>

                  <a
                    href={activeMeeting.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-purple to-brand-cyan text-slate-950 font-bold text-xs flex items-center gap-1.5 hover:opacity-95 shadow-md cursor-pointer"
                  >
                    <Video className="w-4 h-4" />
                    <span>Join Meeting Room</span>
                  </a>
                </div>
              </div>

              {/* Agenda Box */}
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-white/5 space-y-1">
                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">
                  Official Meeting Agenda
                </span>
                <p className="text-xs text-gray-200 leading-relaxed">
                  {activeMeeting.agenda}
                </p>
              </div>

              {/* Attendees Ribbon */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">
                  Confirmed Attendees ({activeMeeting.attendees.length})
                </span>
                <div className="flex flex-wrap gap-2">
                  {activeMeeting.attendees.map((att, idx) => (
                    <div key={idx} className="px-2.5 py-1 rounded-xl bg-slate-900 border border-white/5 flex items-center gap-1.5 text-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span className="text-white font-medium">{att.name}</span>
                      <span className="text-[10px] text-gray-500 font-mono">({att.role || 'Member'})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Items to Tasks Converter Box */}
            <div className="p-6 rounded-3xl bg-slate-950/80 border border-white/10 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-emerald-400" />
                    <span>Action Items & Direct Task Conversion</span>
                  </h4>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Commit decisions into tracked workspace tasks assigned to specific individuals.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {activeMeeting.actionItems.length === 0 ? (
                  <p className="text-xs text-gray-500 py-2">No action items recorded for this session yet.</p>
                ) : (
                  activeMeeting.actionItems.map((act) => (
                    <div
                      key={act.id}
                      className="p-3 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p className="text-xs text-white font-medium">{act.text}</p>
                        <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                          Assigned: <span className="text-brand-cyan">{act.assigneeEmail}</span>
                          {act.dueDate && ` • Due: ${act.dueDate}`}
                        </p>
                      </div>

                      <div className="shrink-0">
                        {act.convertedToTaskId ? (
                          <span className="px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            <span>Converted ({act.convertedToTaskId})</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => handleConvertActionToTask(act)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-mono flex items-center gap-1.5 cursor-pointer transition-all"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                            <span>Convert to Task</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Add Action Item Form */}
              <form onSubmit={handleAddActionItem} className="grid grid-cols-1 sm:grid-cols-12 gap-2 pt-2">
                <input
                  type="text"
                  required
                  placeholder="e.g. Audit Pesapal v3 webhook endpoint payload..."
                  value={newActionText}
                  onChange={(e) => setNewActionText(e.target.value)}
                  className="sm:col-span-8 bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-brand-cyan"
                />
                <input
                  type="email"
                  required
                  placeholder="assignee@catalyx.io"
                  value={newActionAssignee}
                  onChange={(e) => setNewActionAssignee(e.target.value)}
                  className="sm:col-span-3 bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-brand-cyan"
                />
                <button
                  type="submit"
                  className="sm:col-span-1 bg-brand-cyan text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center p-2 cursor-pointer hover:opacity-95"
                  title="Add Action Item"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Decisions & Notes Box */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Decisions */}
              <div className="p-5 rounded-3xl bg-slate-950/80 border border-white/10 space-y-3">
                <span className="text-xs font-mono uppercase text-gray-300 font-bold flex items-center gap-2">
                  <Target className="w-4 h-4 text-brand-purple" />
                  <span>Agreed Decisions ({activeMeeting.decisions.length})</span>
                </span>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {activeMeeting.decisions.map((dec, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-slate-900 border border-white/5 text-xs text-gray-300 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-purple mt-1.5 shrink-0" />
                      <span>{dec}</span>
                    </div>
                  ))}
                </div>
                <form onSubmit={handleAddDecision} className="flex gap-2 pt-1">
                  <input
                    type="text"
                    required
                    placeholder="Register binding decision..."
                    value={newDecisionText}
                    onChange={(e) => setNewDecisionText(e.target.value)}
                    className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none"
                  />
                  <button type="submit" className="px-3 py-1.5 bg-brand-purple text-white font-bold text-xs rounded-xl cursor-pointer">
                    Add
                  </button>
                </form>
              </div>

              {/* Notes */}
              <div className="p-5 rounded-3xl bg-slate-950/80 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase text-gray-300 font-bold flex items-center gap-2">
                    <FileText className="w-4 h-4 text-brand-cyan" />
                    <span>Meeting Notes</span>
                  </span>
                  <button
                    onClick={handleSaveNotes}
                    className="text-[10px] font-mono text-brand-cyan hover:underline cursor-pointer"
                  >
                    Save Notes
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={meetingNotes}
                  onChange={(e) => setMeetingNotes(e.target.value)}
                  placeholder="Record live discussion notes..."
                  className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-xs text-gray-200 focus:outline-brand-cyan"
                />
              </div>
            </div>

            {/* AI Summary Assistant */}
            <div className="p-5 rounded-3xl bg-brand-purple/10 border border-brand-purple/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand-cyan" />
                  <span className="text-xs font-mono text-white font-bold">
                    Executive AI Meeting Summary
                  </span>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    AI DISCLOSURE: REQUIRES HUMAN REVIEW
                  </span>
                </div>

                <button
                  onClick={handleGenerateSummary}
                  className="text-[10px] font-mono text-brand-cyan hover:underline cursor-pointer"
                >
                  Regenerate Synthesis
                </button>
              </div>

              {activeMeeting.aiSummary ? (
                <div className="space-y-2 text-xs text-gray-300">
                  <p className="leading-relaxed">{activeMeeting.aiSummary.summary}</p>
                  <div className="space-y-1 pt-1">
                    {activeMeeting.aiSummary.keyTakeaways.map((k, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                        <span>{k}</span>
                      </div>
                    ))}
                  </div>
                  <span className="text-[9px] font-mono text-gray-500 block pt-1">
                    Model: {activeMeeting.aiSummary.model} • Generated: {new Date(activeMeeting.aiSummary.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ) : (
                <div className="text-center py-3">
                  <button
                    onClick={handleGenerateSummary}
                    className="px-4 py-2 rounded-xl bg-brand-purple text-white font-bold text-xs cursor-pointer hover:opacity-90"
                  >
                    Generate AI Synthesis from Notes & Decisions
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Universal Share Modal */}
      {activeMeeting && (
        <UniversalShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          artifactId={activeMeeting.id}
          artifactTitle={activeMeeting.title}
          artifactType="meeting"
          currentUserEmail={user.email}
        />
      )}

      {/* Schedule Meeting Modal */}
      {isNewMeetingOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-white/15 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-display font-bold text-white">Schedule Strategic Meeting</h3>
            <form onSubmit={handleCreateMeeting} className="space-y-3">
              <div>
                <label className="block text-[10px] font-mono text-gray-400 uppercase mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q4 Executive Synthesis"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-brand-cyan"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-gray-400 uppercase mb-1">Agenda</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Clear objectives for the session..."
                  value={newAgenda}
                  onChange={(e) => setNewAgenda(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-brand-cyan"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-gray-400 uppercase mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-brand-cyan"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-gray-400 uppercase mb-1">Time</label>
                  <input
                    type="time"
                    required
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-brand-cyan"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-gray-400 uppercase mb-1">Provider</label>
                  <select
                    value={newProvider}
                    onChange={(e) => setNewProvider(e.target.value as any)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-brand-cyan font-bold focus:outline-brand-cyan"
                  >
                    <option value="GOOGLE_MEET">Google Meet</option>
                    <option value="ZOOM">Zoom</option>
                    <option value="TEAMS">Microsoft Teams</option>
                    <option value="DIRECT">Direct Internal Room</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-gray-400 uppercase mb-1">Meeting Link</label>
                  <input
                    type="url"
                    placeholder="https://meet.google.com/..."
                    value={newMeetingLink}
                    onChange={(e) => setNewMeetingLink(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-brand-cyan"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-gray-400 uppercase mb-1">Attendees (Comma-Separated Emails)</label>
                <input
                  type="text"
                  required
                  value={newAttendees}
                  onChange={(e) => setNewAttendees(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-brand-cyan"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsNewMeetingOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-gray-400 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-brand-purple to-brand-cyan text-slate-950 font-bold text-xs cursor-pointer"
                >
                  Confirm & Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
