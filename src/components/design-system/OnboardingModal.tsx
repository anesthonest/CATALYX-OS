import React from 'react';
import { 
  X, 
  FolderKanban, 
  Users, 
  ShoppingBag, 
  Compass, 
  Bot, 
  ArrowRight,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
  onOpenAskAi?: (prompt?: string) => void;
  userName?: string;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onOpenAskAi,
  userName = 'Commander'
}) => {
  if (!isOpen) return null;

  const choices = [
    {
      id: 'create',
      title: 'Create something',
      description: 'Start a project, draft a document, build a slide deck, or record media',
      icon: <FolderKanban className="w-5 h-5 text-amber-400" />,
      action: () => {
        onNavigate('universal-work');
        onClose();
      }
    },
    {
      id: 'team',
      title: 'Work with a team',
      description: 'Create a team workspace, invite collaborators, or check the worker center',
      icon: <Users className="w-5 h-5 text-blue-400" />,
      action: () => {
        onNavigate('workspace');
        onClose();
      }
    },
    {
      id: 'commerce',
      title: 'Sell or manage products',
      description: 'Set up digital listings, track customer orders, and manage financial payouts',
      icon: <ShoppingBag className="w-5 h-5 text-emerald-400" />,
      action: () => {
        onNavigate('unified-commerce');
        onClose();
      }
    },
    {
      id: 'marketplace',
      title: 'Explore the marketplace',
      description: 'Discover digital solutions, verified seller offerings, and developer tools',
      icon: <Compass className="w-5 h-5 text-cyan-400" />,
      action: () => {
        onNavigate('marketplace-api');
        onClose();
      }
    },
    {
      id: 'ai',
      title: 'Consult the AI assistant',
      description: 'Ask questions in plain English or delegate goals to 11 autonomous agents',
      icon: <Bot className="w-5 h-5 text-purple-400" />,
      action: () => {
        if (onOpenAskAi) {
          onOpenAskAi("Hello CATALYX AI! I am getting started. Give me a brief overview of what I can accomplish today.");
        } else {
          onNavigate('ai-coach');
        }
        onClose();
      }
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div 
        className="w-full max-w-xl rounded-2xl catalyx-surface-elevated border border-amber-500/30 p-6 sm:p-8 shadow-2xl animate-scaleUp relative overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-welcome-title"
      >
        {/* Glow accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-white p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Close welcome guide"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="space-y-2 mb-6">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase catalyx-badge-gold">
              Welcome to CATALYX
            </span>
          </div>
          <h2 id="onboarding-welcome-title" className="text-xl sm:text-2xl font-display font-bold text-white tracking-tight">
            Welcome, <span className="text-amber-400">{userName}</span>
          </h2>
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
            CATALYX is the all-in-one professional platform for managing work, collaborating with teams, using AI, and growing your business.
          </p>
        </div>

        {/* Choices Question */}
        <div className="space-y-2.5 mb-6">
          <p className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider">
            What would you like to do first?
          </p>
          <div className="space-y-2">
            {choices.map((choice) => (
              <button
                key={choice.id}
                onClick={choice.action}
                className="w-full p-3.5 rounded-xl catalyx-surface-card hover:border-amber-500/40 border transition-all text-left flex items-center justify-between group cursor-pointer hover:bg-white/[0.02]"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white/5 border border-white/10 group-hover:scale-105 transition-transform shrink-0">
                    {choice.icon}
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-white group-hover:text-amber-300 transition-colors">
                      {choice.title}
                    </h3>
                    <p className="text-[11px] text-gray-400 line-clamp-1">
                      {choice.description}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
          <span className="text-xs text-gray-500">
            You can access this guide anytime from the Help (?) menu.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
};
