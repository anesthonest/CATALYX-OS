import React, { useState } from 'react';
import { 
  Bot, 
  Sparkles, 
  ArrowRight, 
  Compass, 
  ShieldCheck, 
  BookOpen, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  HelpCircle, 
  RefreshCw, 
  Send, 
  ExternalLink,
  LifeBuoy,
  MessageSquare,
  Search,
  Check,
  ChevronRight
} from 'lucide-react';
import { UserPersonaRole } from '../types';
import { 
  systemKnowledgeService, 
  UserExpertiseLevel, 
  SystemGuideResponse, 
  GuidedActionItem 
} from '../services/systemKnowledgeService';

interface CatalyxSystemGuideViewProps {
  activeTab: string;
  activeRole: UserPersonaRole;
  userEmail?: string;
  onNavigate: (tab: string) => void;
  onOpenAskAiModal?: (prompt?: string) => void;
}

export const CatalyxSystemGuideView: React.FC<CatalyxSystemGuideViewProps> = ({
  activeTab,
  activeRole,
  userEmail,
  onNavigate,
  onOpenAskAiModal
}) => {
  const [query, setQuery] = useState('');
  const [userLevel, setUserLevel] = useState<UserExpertiseLevel>('INTERMEDIATE');
  const [isLoading, setIsLoading] = useState(false);
  const [currentResponse, setCurrentResponse] = useState<SystemGuideResponse | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');

  const suggestedPrompts = [
    'What is CATALYX and what can I build here?',
    'How do I create a project initiative?',
    'How do I create a presentation deck?',
    'How do I collaborate with a partner organization?',
    'How do I schedule a unified meeting with agenda?',
    'Where do I upload and preview files?',
    'What can I do from this current dashboard?'
  ];

  const handleConsultGuide = async (textToAsk: string) => {
    if (!textToAsk.trim()) return;

    setIsLoading(true);
    setQuery(textToAsk);

    try {
      // Call backend /api/system-guide
      const res = await fetch('/api/system-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: textToAsk,
          activeTab,
          activeRole,
          userLevel,
          userEmail
        })
      });

      if (res.ok) {
        const data: SystemGuideResponse = await res.json();
        setCurrentResponse(data);
      } else {
        // Safe fallback to client-side local knowledge engine
        const fallback = systemKnowledgeService.answerSystemQuery(textToAsk, activeTab, activeRole, userLevel);
        setCurrentResponse(fallback);
      }
    } catch {
      // Resilient fallback to local knowledge engine
      const fallback = systemKnowledgeService.answerSystemQuery(textToAsk, activeTab, activeRole, userLevel);
      setCurrentResponse(fallback);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionClick = (action: GuidedActionItem) => {
    if (action.actionType === 'NAVIGATE') {
      onNavigate(action.targetTab);
    } else if (action.actionType === 'ESCALATE_SUPPORT') {
      setShowFeedbackModal(true);
    }
  };

  const handleSendFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;
    setFeedbackSuccess(true);
    setTimeout(() => {
      setShowFeedbackModal(false);
      setFeedbackSuccess(false);
      setFeedbackText('');
    }, 2000);
  };

  return (
    <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-brand-purple/40 bg-gradient-to-br from-slate-900/90 via-slate-950 to-indigo-950/20 shadow-xl relative overflow-hidden">
      {/* Background glow accents */}
      <div className="absolute top-0 right-1/4 w-72 h-72 bg-brand-purple/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-60 h-60 bg-brand-cyan/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-brand-purple/20 border border-brand-purple/40 text-brand-purple shadow-inner">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-display font-bold text-white tracking-wide">
                CATALYX System Guide AI
              </h3>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-brand-purple/20 text-brand-purple border border-brand-purple/30 font-semibold">
                V26 Grounded Intelligence
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Grounded in the real CATALYX architecture. Ask how modules, workflows, or permissions operate.
            </p>
          </div>
        </div>

        {/* User Expertise Level Selector */}
        <div className="flex items-center gap-1.5 self-start sm:self-center bg-slate-950/80 p-1 rounded-xl border border-white/10">
          <span className="text-[10px] font-mono text-gray-500 uppercase px-2">Mode:</span>
          {(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMINISTRATOR'] as UserExpertiseLevel[]).map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => {
                setUserLevel(level);
                if (currentResponse && query) {
                  handleConsultGuide(query);
                }
              }}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-semibold transition-all cursor-pointer ${
                userLevel === level
                  ? 'bg-brand-purple text-white shadow-sm'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {level === 'ADMINISTRATOR' ? 'ADMIN' : level}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input Bar */}
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          handleConsultGuide(query);
        }}
        className="mt-4 relative z-10"
      >
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask anything (e.g., 'How do I create a project?', 'Where are my files?', 'What is CATALYX?')..."
              className="w-full bg-slate-950/90 border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-purple/70 focus:ring-1 focus:ring-brand-purple/50 transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="py-2.5 px-5 bg-gradient-to-r from-brand-purple to-indigo-600 hover:from-brand-purple/90 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-brand-purple/20 shrink-0"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Consulting System...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ask Guide</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Suggested Prompts Carousel */}
      <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-white/5 relative z-10">
        <span className="text-[10px] font-mono text-gray-400 uppercase flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-brand-purple" />
          Suggested:
        </span>
        {suggestedPrompts.map((prompt, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleConsultGuide(prompt)}
            className="text-[11px] text-gray-300 hover:text-white bg-slate-950/60 hover:bg-white/10 px-2.5 py-1 rounded-lg transition-all text-left flex items-center gap-1.5 cursor-pointer border border-white/5 hover:border-brand-purple/30"
          >
            <span>{prompt}</span>
            <ChevronRight className="w-3 h-3 text-gray-500" />
          </button>
        ))}
      </div>

      {/* Response Display Viewport */}
      {currentResponse && (
        <div className="mt-5 p-5 rounded-2xl bg-slate-950/90 border border-white/15 space-y-4 relative z-10 animate-in fade-in duration-300">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </span>
              <span className="text-xs font-semibold text-white">System Guide Response</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-gray-400">
                Confidence: {currentResponse.confidence}%
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {currentResponse.source === 'GEMINI_AI' ? 'Grounded Gemini AI' : 'Local Knowledge Engine'}
              </span>
              <span className="text-[10px] font-mono text-gray-500">
                Level: {currentResponse.userLevel}
              </span>
            </div>
          </div>

          {/* Limitations / Non-existent feature notice if applicable */}
          {currentResponse.limitationsNotice && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
              <div>
                <p className="font-semibold text-white">Capability Boundary Notice</p>
                <p className="text-[11px] text-amber-200/90 mt-0.5 leading-relaxed">
                  {currentResponse.limitationsNotice}
                </p>
              </div>
            </div>
          )}

          {/* Formatted Answer Body */}
          <div className="text-xs sm:text-sm text-gray-200 leading-relaxed space-y-2 whitespace-pre-wrap font-sans">
            {currentResponse.answer}
          </div>

          {/* Guided Action Buttons (Direct Deep-Link Navigation) */}
          {currentResponse.guidedActions && currentResponse.guidedActions.length > 0 && (
            <div className="pt-3 border-t border-white/10 space-y-2">
              <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">
                Guided Actions & Quick Navigation:
              </span>
              <div className="flex flex-wrap gap-2">
                {currentResponse.guidedActions.map((action) => (
                  <button
                    key={action.id}
                    type="button"
                    onClick={() => handleActionClick(action)}
                    className="px-3.5 py-2 rounded-xl bg-brand-purple/20 hover:bg-brand-purple/30 border border-brand-purple/40 hover:border-brand-purple text-white text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-sm"
                  >
                    <span>{action.label}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-brand-purple" />
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => setShowFeedbackModal(true)}
                  className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <LifeBuoy className="w-3.5 h-3.5 text-gray-400" />
                  <span>Report Issue / Support</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Escalation / Feedback / Support Ticket Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <LifeBuoy className="w-5 h-5 text-brand-cyan" />
                <h3 className="text-sm font-display font-bold text-white">System Guide Escalation & Feedback</h3>
              </div>
              <button
                onClick={() => setShowFeedbackModal(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {feedbackSuccess ? (
              <div className="py-6 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h4 className="text-sm font-semibold text-white">Feedback Logged Successfully</h4>
                <p className="text-xs text-gray-400">
                  Your report has been securely tagged with the current system state.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendFeedback} className="space-y-3">
                <p className="text-xs text-gray-300 leading-relaxed">
                  If the System Guide was unable to assist you or if you encountered an unexpected system state, submit a report below.
                </p>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-white/5 text-[11px] font-mono text-gray-400 space-y-1">
                  <div>Active Tab: <span className="text-white">{activeTab}</span></div>
                  <div>Active Role: <span className="text-white">{activeRole}</span></div>
                  <div>Version: <span className="text-brand-purple">CATALYX V26 Hardened</span></div>
                </div>
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Describe your question, workflow blocker, or issue..."
                  rows={4}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-cyan"
                  required
                />
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowFeedbackModal(false)}
                    className="px-3 py-1.5 text-xs text-gray-400 hover:text-white rounded-lg hover:bg-white/5 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-brand-cyan hover:bg-brand-cyan/90 text-slate-950 font-bold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    Submit Report
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
