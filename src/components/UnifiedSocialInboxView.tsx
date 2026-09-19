import React, { useState } from 'react';
import { 
  UserProfile, 
  UserPersonaRole 
} from '../types';
import { 
  socialConnectorFabricService, 
  SocialChannelType, 
  SocialInboxMessage, 
  SocialConnectorConfig 
} from '../services/socialConnectorFabricService';
import { 
  MessageSquare, 
  Send, 
  Sparkles, 
  UserCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Filter, 
  Search, 
  Tag, 
  FileText, 
  ShieldCheck, 
  Clock, 
  Bot, 
  ArrowRight, 
  CornerDownRight, 
  CheckSquare, 
  ShoppingBag, 
  Mail, 
  Phone, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface UnifiedSocialInboxViewProps {
  user: UserProfile;
  activeRole: UserPersonaRole;
  onNavigate: (tabId: string) => void;
  onOpenTaskModal?: (initialText: string) => void;
}

export const UnifiedSocialInboxView: React.FC<UnifiedSocialInboxViewProps> = ({
  user,
  activeRole,
  onNavigate,
  onOpenTaskModal
}) => {
  const [selectedChannel, setSelectedChannel] = useState<SocialChannelType | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [replyDraft, setReplyDraft] = useState('');
  const [dispatchStatus, setDispatchStatus] = useState<string | null>(null);
  const [selectedOutcome, setSelectedOutcome] = useState('');

  // Connector config and message list
  const connectors = socialConnectorFabricService.getConnectors();
  const allMessages = socialConnectorFabricService.getInboxMessages(
    selectedChannel === 'ALL' ? undefined : selectedChannel
  );

  // Filter messages by search
  const filteredMessages = allMessages.filter(m => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.sourceSenderName.toLowerCase().includes(q) ||
      m.content.toLowerCase().includes(q) ||
      m.customerName?.toLowerCase().includes(q) ||
      m.orderId?.toLowerCase().includes(q)
    );
  });

  const activeMessage = filteredMessages.find(m => m.id === selectedMessageId) || filteredMessages[0] || null;

  const handleSelectMessage = (msg: SocialInboxMessage) => {
    setSelectedMessageId(msg.id);
    setDispatchStatus(null);
    setSelectedOutcome('');
    // Auto-populate reply draft with AI recommendation if available
    if (msg.aiClassification?.recommendedDraftResponse) {
      setReplyDraft(msg.aiClassification.recommendedDraftResponse);
    } else {
      setReplyDraft('');
    }
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMessage || !replyDraft.trim()) return;

    const result = socialConnectorFabricService.sendResponse(
      activeMessage.id,
      replyDraft.trim(),
      user.uid,
      user.username || 'Operator'
    );

    if (result.success) {
      setDispatchStatus(result.message);
      setReplyDraft('');
    } else {
      setDispatchStatus(`Error: ${result.message}`);
    }
  };

  const handleAssignToSelf = () => {
    if (!activeMessage) return;
    socialConnectorFabricService.assignMessage(
      activeMessage.id,
      user.uid,
      user.username || 'Current Operator'
    );
    setDispatchStatus(`Conversation assigned to ${user.username || 'you'}.`);
  };

  const handleRecordOutcome = () => {
    if (!activeMessage || !selectedOutcome.trim()) return;
    socialConnectorFabricService.recordOutcome(activeMessage.id, selectedOutcome);
    setDispatchStatus(`Conversation outcome recorded: "${selectedOutcome}".`);
  };

  const renderChannelBadge = (ch: SocialChannelType) => {
    switch (ch) {
      case 'WHATSAPP':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">WhatsApp</span>;
      case 'MESSENGER':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">Messenger</span>;
      case 'FACEBOOK':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">Facebook</span>;
      case 'INSTAGRAM':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-pink-500/20 text-pink-400 border border-pink-500/30">Instagram</span>;
      case 'EMAIL':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">Email</span>;
      case 'SMS':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">SMS</span>;
      case 'CATALYX':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30">Catalyx Mesh</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fadeIn">
      {/* 1. Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-brand-purple/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-brand-purple/20 text-brand-purple border border-brand-purple/30 flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              UNIFIED SOCIAL INBOX
            </span>
            <span className="text-xs text-gray-400 font-mono">
              Omnichannel Customer Communications
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
            Omnichannel Social & Customer Inbox
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 mt-1 max-w-2xl">
            Single inbox for WhatsApp Business, Messenger, Instagram, Email, SMS, and native Catalyx channels. Every message connects directly to customer records, active orders, and worker backlogs.
          </p>
        </div>

        {/* Status indicator of connector mesh */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('integrations')}
            className="px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white hover:bg-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-brand-cyan" />
            Connector Center
          </button>
        </div>
      </div>

      {/* 2. Channel Filter Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap pb-2 border-b border-white/10">
        <div className="flex items-center gap-2 overflow-x-auto">
          {(['ALL', 'WHATSAPP', 'MESSENGER', 'EMAIL', 'SMS', 'CATALYX'] as const).map(ch => (
            <button
              key={ch}
              onClick={() => setSelectedChannel(ch)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedChannel === ch
                  ? 'bg-brand-purple/20 text-brand-purple border border-brand-purple/40 shadow-sm'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {ch === 'ALL' ? 'All Channels' : ch}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search messages, customers, orders..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950/80 border border-white/15 text-white text-xs placeholder-gray-500 focus:outline-none focus:border-brand-purple"
          />
        </div>
      </div>

      {/* 3. Main 2-Column Split View: Thread List vs Message Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[550px]">
        {/* Left Col: Threads List (5 Cols) */}
        <div className="lg:col-span-5 glass-panel rounded-2xl border border-white/10 overflow-hidden flex flex-col">
          <div className="p-3.5 border-b border-white/10 bg-slate-950/60 flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-gray-400">
              Conversations ({filteredMessages.length})
            </span>
            <span className="text-[10px] text-brand-cyan font-mono">
              Live Real-Time Mesh
            </span>
          </div>

          <div className="divide-y divide-white/5 overflow-y-auto max-h-[600px]">
            {filteredMessages.map((msg) => {
              const isSelected = activeMessage?.id === msg.id;
              return (
                <button
                  key={msg.id}
                  onClick={() => handleSelectMessage(msg)}
                  className={`w-full text-left p-4 transition-all cursor-pointer flex flex-col gap-2 ${
                    isSelected ? 'bg-brand-purple/15 border-l-2 border-brand-purple' : 'hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {renderChannelBadge(msg.channel)}
                      <span className="text-xs font-bold text-white truncate max-w-[150px]">
                        {msg.sourceSenderName}
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-400 font-mono">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <p className="text-xs text-gray-300 line-clamp-2 leading-relaxed">
                    {msg.content}
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1.5">
                      {msg.customerName && (
                        <span className="text-[10px] text-brand-cyan font-mono truncate max-w-[120px]">
                          👤 {msg.customerName}
                        </span>
                      )}
                      {msg.orderId && (
                        <span className="text-[10px] text-amber-300 font-mono">
                          📦 {msg.orderId}
                        </span>
                      )}
                    </div>

                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono uppercase ${
                      msg.status === 'UNREAD' ? 'bg-brand-cyan/20 text-brand-cyan font-bold' :
                      msg.status === 'RESPONDED' ? 'bg-emerald-500/20 text-emerald-300' :
                      'bg-slate-800 text-gray-400'
                    }`}>
                      {msg.status}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Col: Active Thread Inspector & AI-Assisted Dispatcher (7 Cols) */}
        <div className="lg:col-span-7 glass-panel rounded-2xl border border-white/10 p-6 flex flex-col justify-between space-y-6">
          {activeMessage ? (
            <div className="space-y-6">
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {renderChannelBadge(activeMessage.channel)}
                    <h3 className="text-base font-bold text-white">{activeMessage.sourceSenderName}</h3>
                  </div>
                  <div className="text-xs text-gray-400 font-mono flex items-center gap-2">
                    <span>Sender ID: {activeMessage.sourceSenderId}</span>
                    <span>•</span>
                    <span>{new Date(activeMessage.timestamp).toLocaleString()}</span>
                  </div>
                </div>

                {/* Worker Assignment State */}
                <div className="flex items-center gap-2">
                  {activeMessage.assignedWorkerName ? (
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5" />
                      Assigned: {activeMessage.assignedWorkerName}
                    </span>
                  ) : (
                    <button
                      onClick={handleAssignToSelf}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-white/10 text-xs text-white flex items-center gap-1 cursor-pointer"
                    >
                      <UserCheck className="w-3 h-3 text-brand-cyan" />
                      Assign to Me
                    </button>
                  )}
                </div>
              </div>

              {/* Contextual Linkage Box: Customer -> Order -> Task */}
              <div className="p-3.5 rounded-xl border border-white/10 bg-slate-950/70 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-[10px] font-mono text-gray-400 uppercase block">Linked Customer</span>
                  <div className="font-bold text-white mt-0.5 flex items-center gap-1">
                    {activeMessage.customerName || 'Unregistered Contact'}
                  </div>
                  {activeMessage.customerId && (
                    <button
                      onClick={() => onNavigate('commerce')}
                      className="text-[10px] text-brand-cyan hover:underline mt-0.5 flex items-center gap-0.5"
                    >
                      View in CRM <ChevronRight className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>

                <div>
                  <span className="text-[10px] font-mono text-gray-400 uppercase block">Linked Order</span>
                  <div className="font-bold text-amber-300 mt-0.5">
                    {activeMessage.orderId ? `${activeMessage.orderId}` : 'No active order'}
                  </div>
                  {activeMessage.orderAmountMinorUnits && (
                    <span className="text-[10px] text-gray-400 font-mono">
                      Amount: ${(activeMessage.orderAmountMinorUnits / 100).toFixed(2)} USD
                    </span>
                  )}
                </div>

                <div>
                  <span className="text-[10px] font-mono text-gray-400 uppercase block">Target Workspace</span>
                  <div className="font-bold text-brand-purple mt-0.5">
                    {activeMessage.workspaceId || 'Default Organization'}
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono">
                    Isolation: ENFORCED
                  </span>
                </div>
              </div>

              {/* Message Content */}
              <div className="p-4 rounded-xl border border-white/10 bg-slate-900/60 text-sm text-gray-200 leading-relaxed">
                {activeMessage.content}
              </div>

              {/* AI Assistance & Epistemic Classification Card */}
              {activeMessage.aiClassification && (
                <div className="p-4 rounded-xl border border-brand-purple/30 bg-brand-purple/5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bot className="w-4 h-4 text-brand-purple" />
                      <span className="text-xs font-bold text-white font-mono uppercase">
                        AI Intent & Safety Classification
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-brand-purple/20 text-purple-300">
                      Confidence {activeMessage.aiClassification.confidence}%
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="text-gray-300">
                      Intent: <strong className="text-white font-mono">{activeMessage.aiClassification.intent}</strong>
                    </div>
                    <div className="text-gray-300">
                      Sentiment: <strong className="text-white font-mono">{activeMessage.aiClassification.sentiment}</strong>
                    </div>
                  </div>

                  {activeMessage.aiClassification.recommendedAction && (
                    <div className="text-xs text-gray-300">
                      Recommended Action: <span className="text-brand-cyan">{activeMessage.aiClassification.recommendedAction}</span>
                    </div>
                  )}

                  <div className="p-2.5 rounded-lg bg-slate-950/80 border border-white/10 text-xs text-gray-300">
                    <span className="text-[10px] font-mono text-gray-400 block mb-1 uppercase">AI Draft Response:</span>
                    <p className="italic">{activeMessage.aiClassification.recommendedDraftResponse}</p>
                    <button
                      onClick={() => setReplyDraft(activeMessage.aiClassification?.recommendedDraftResponse || '')}
                      className="mt-2 text-[11px] font-bold text-brand-cyan hover:underline flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" /> Insert into Reply Editor
                    </button>
                  </div>

                  <div className="text-[10px] font-mono text-amber-300 flex items-center gap-1 pt-1">
                    <ShieldCheck className="w-3 h-3" />
                    Human Review Gate: Messages will not be dispatched automatically without operator sign-off.
                  </div>
                </div>
              )}

              {/* Reply Dispatch Form (Human-in-the-Loop) */}
              <form onSubmit={handleSendReply} className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white flex items-center gap-1.5">
                    <CornerDownRight className="w-3.5 h-3.5 text-brand-cyan" />
                    Dispatch Response via {activeMessage.channel}
                  </label>
                  <span className="text-[10px] text-gray-400 font-mono">
                    Sending as: {user.username || 'Operator'}
                  </span>
                </div>

                <textarea
                  rows={3}
                  value={replyDraft}
                  onChange={(e) => setReplyDraft(e.target.value)}
                  placeholder={`Type response to ${activeMessage.sourceSenderName}...`}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/15 text-white text-xs focus:outline-none focus:border-brand-purple leading-relaxed"
                />

                {dispatchStatus && (
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{dispatchStatus}</span>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onOpenTaskModal?.(`Follow up on customer message from ${activeMessage.sourceSenderName}: ${activeMessage.content.substring(0, 50)}...`)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-gray-300 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      <CheckSquare className="w-3 h-3 text-brand-cyan" />
                      Create Task
                    </button>
                    <button
                      type="button"
                      onClick={() => onNavigate('commerce')}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-gray-300 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      <ShoppingBag className="w-3 h-3 text-amber-300" />
                      View Orders
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-brand-purple text-white text-xs font-bold hover:bg-brand-purple/90 flex items-center gap-1.5 transition-all shadow-lg shadow-brand-purple/20 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Review & Dispatch Response
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <MessageSquare className="w-10 h-10 mb-2 opacity-40" />
              <p className="text-xs">Select a conversation thread to review details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
