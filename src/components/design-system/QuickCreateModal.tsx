import React from 'react';
import { 
  X, 
  FolderKanban, 
  CheckSquare, 
  FileText, 
  Presentation, 
  Video, 
  Calendar, 
  ShoppingBag, 
  Bot, 
  Layers, 
  Users, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

export interface QuickCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string, action?: string) => void;
  onOpenAskAi?: (prompt?: string) => void;
}

export const QuickCreateModal: React.FC<QuickCreateModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onOpenAskAi
}) => {
  if (!isOpen) return null;

  const creationOptions = [
    {
      id: 'project',
      label: 'New Project',
      category: 'Work Management',
      description: 'Start a collaborative project board with milestones and deliverables',
      icon: <FolderKanban className="w-5 h-5 text-amber-400" />,
      badge: 'Projects',
      action: () => {
        onNavigate('project-board');
        onClose();
      }
    },
    {
      id: 'task',
      label: 'New Task',
      category: 'Work Execution',
      description: 'Add a personal deliverable or action item to your backlog',
      icon: <CheckSquare className="w-5 h-5 text-blue-400" />,
      badge: 'Execution',
      action: () => {
        onNavigate('tasks');
        onClose();
      }
    },
    {
      id: 'document',
      label: 'New Document / File',
      category: 'Content & Vault',
      description: 'Upload, author, or inspect code, markdown, specifications, and media',
      icon: <FileText className="w-5 h-5 text-cyan-400" />,
      badge: 'Files',
      action: () => {
        onNavigate('files');
        onClose();
      }
    },
    {
      id: 'presentation',
      label: 'New Presentation',
      category: 'Presentations Studio',
      description: 'Create slide decks, configure speaker notes, and launch presentation mode',
      icon: <Presentation className="w-5 h-5 text-purple-400" />,
      badge: 'Slides',
      action: () => {
        onNavigate('presentations');
        onClose();
      }
    },
    {
      id: 'media',
      label: 'Media or Recording',
      category: 'Media Studio',
      description: 'Upload video streams, podcast episodes, or record media sessions',
      icon: <Video className="w-5 h-5 text-rose-400" />,
      badge: 'Media',
      action: () => {
        onNavigate('media');
        onClose();
      }
    },
    {
      id: 'meeting',
      label: 'Schedule Meeting',
      category: 'Collaboration',
      description: 'Set up synchronized agendas, attendee invites, and task conversion',
      icon: <Calendar className="w-5 h-5 text-emerald-400" />,
      badge: 'Meetings',
      action: () => {
        onNavigate('meetings');
        onClose();
      }
    },
    {
      id: 'product',
      label: 'New Product / Listing',
      category: 'Commerce & Marketplace',
      description: 'Publish a digital product, service listing, or developer API connector',
      icon: <ShoppingBag className="w-5 h-5 text-amber-400" />,
      badge: 'Commerce',
      action: () => {
        onNavigate('unified-commerce');
        onClose();
      }
    },
    {
      id: 'agent-task',
      label: 'AI Agent Assignment',
      category: 'Autonomous Intelligence',
      description: 'Delegate complex workflows or research to the specialized 11-agent workforce',
      icon: <Bot className="w-5 h-5 text-purple-400" />,
      badge: 'AI Agents',
      action: () => {
        if (onOpenAskAi) {
          onOpenAskAi("Assign a new autonomous agent mission to help complete my active goals.");
        } else {
          onNavigate('ai-workforce');
        }
        onClose();
      }
    },
    {
      id: 'universal-work',
      label: 'Universal Work Schema',
      category: 'Universal Architecture',
      description: 'Create polymorphic work across 60+ digital work types and consortia',
      icon: <Layers className="w-5 h-5 text-cyan-400" />,
      badge: 'Architecture',
      action: () => {
        onNavigate('universal-work');
        onClose();
      }
    },
    {
      id: 'team-workspace',
      label: 'Team Workspace',
      category: 'Collaboration',
      description: 'Create a shared room for team chats, shared backlogs, and invites',
      icon: <Users className="w-5 h-5 text-blue-400" />,
      badge: 'Teams',
      action: () => {
        onNavigate('workspace');
        onClose();
      }
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="w-full max-w-2xl rounded-2xl catalyx-surface-elevated border border-white/15 p-6 shadow-2xl animate-scaleUp overflow-hidden max-h-[90vh] flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="quick-create-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 id="quick-create-title" className="text-lg font-display font-bold text-white">
                Create in CATALYX
              </h2>
              <p className="text-xs text-gray-400">
                Select what you want to create — no searching required
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close creation menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options Grid */}
        <div className="overflow-y-auto py-4 space-y-2 pr-1 flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {creationOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={opt.action}
                className="p-3.5 rounded-xl catalyx-surface-card hover:border-amber-500/40 transition-all text-left flex items-start gap-3 group cursor-pointer border hover:bg-white/[0.02]"
              >
                <div className="p-2 rounded-lg bg-white/5 border border-white/10 shrink-0 group-hover:scale-105 transition-transform mt-0.5">
                  {opt.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span className="text-xs font-semibold text-white group-hover:text-amber-300 transition-colors">
                      {opt.label}
                    </span>
                    <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-white/5 text-gray-400 border border-white/10">
                      {opt.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 leading-snug line-clamp-2">
                    {opt.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-gray-400 shrink-0">
          <span className="font-mono text-[11px]">
            Tip: Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-gray-300 font-mono text-[10px]">Cmd+K</kbd> anywhere to search
          </span>
          <button
            onClick={() => {
              if (onOpenAskAi) onOpenAskAi();
              onClose();
            }}
            className="text-purple-400 hover:text-purple-300 flex items-center gap-1 font-medium cursor-pointer"
          >
            <span>Need help choosing? Ask AI</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
