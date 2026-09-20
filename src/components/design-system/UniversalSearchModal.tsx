import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Search, 
  X, 
  ArrowRight, 
  FolderKanban, 
  CheckSquare, 
  FileText, 
  Presentation, 
  Video, 
  Calendar, 
  ShoppingBag, 
  Users, 
  Bot, 
  Shield, 
  HelpCircle, 
  Sliders,
  Compass
} from 'lucide-react';
import { Task } from '../../types';

export interface UniversalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
  onOpenAskAi?: (prompt?: string) => void;
  tasks?: Task[];
}

interface SearchItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'Work & Projects' | 'Tasks' | 'Documents & Files' | 'Presentations & Media' | 'Collaboration & Meetings' | 'Commerce & Products' | 'Intelligence & AI' | 'System & Help';
  icon: React.ReactNode;
  tabId: string;
  keywords: string[];
}

export const UniversalSearchModal: React.FC<UniversalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onOpenAskAi,
  tasks = []
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Comprehensive static index of all CATALYX system capabilities & entities
  const baseItems: SearchItem[] = useMemo(() => [
    // Work & Projects
    {
      id: 'universal-work',
      title: 'Universal Work Hub',
      subtitle: 'Polymorphic work schemas across 60+ work types',
      category: 'Work & Projects',
      icon: <FolderKanban className="w-4 h-4 text-amber-400" />,
      tabId: 'universal-work',
      keywords: ['work', 'universal', 'projects', 'schemas', 'tasks', 'portfolio', 'initiatives']
    },
    {
      id: 'project-board',
      title: 'Project Initiatives & Kanban',
      subtitle: 'Strategic milestones, deliverables, and Kanban status',
      category: 'Work & Projects',
      icon: <FolderKanban className="w-4 h-4 text-amber-400" />,
      tabId: 'project-board',
      keywords: ['projects', 'kanban', 'board', 'milestones', 'deliverables', 'sprint']
    },
    {
      id: 'tasks',
      title: 'Tasks & Personal Backlog',
      subtitle: 'Personal execution backlog, priority tags, and XP',
      category: 'Tasks',
      icon: <CheckSquare className="w-4 h-4 text-blue-400" />,
      tabId: 'tasks',
      keywords: ['tasks', 'todo', 'backlog', 'checklist', 'actions', 'execution']
    },
    {
      id: 'worker-center',
      title: 'Worker Center & Accountability',
      subtitle: 'Assigned work, dependencies, who I report to, customer coverage',
      category: 'Work & Projects',
      icon: <Users className="w-4 h-4 text-cyan-400" />,
      tabId: 'worker-center',
      keywords: ['worker', 'accountability', 'assigned', 'dependencies', 'manager', 'coverage']
    },
    {
      id: 'goals',
      title: 'Strategic Goals',
      subtitle: 'Key performance objectives and quarterly targets',
      category: 'Work & Projects',
      icon: <Compass className="w-4 h-4 text-emerald-400" />,
      tabId: 'goals',
      keywords: ['goals', 'okr', 'targets', 'objectives', 'strategy']
    },
    {
      id: 'focus',
      title: 'Deep Focus Cabin',
      subtitle: 'Distraction-free Pomodoro session logs and ambient timer',
      category: 'Work & Projects',
      icon: <Compass className="w-4 h-4 text-purple-400" />,
      tabId: 'focus',
      keywords: ['focus', 'pomodoro', 'timer', 'cabin', 'deep work']
    },
    // Documents & Files
    {
      id: 'files',
      title: 'Files & Documents Vault',
      subtitle: 'Universal document previewer, code syntax, and MIME check',
      category: 'Documents & Files',
      icon: <FileText className="w-4 h-4 text-cyan-400" />,
      tabId: 'files',
      keywords: ['files', 'documents', 'vault', 'pdf', 'upload', 'code', 'docs']
    },
    // Presentations & Media
    {
      id: 'presentations',
      title: 'Presentations & Slides Studio',
      subtitle: 'Decks, slide editor, presenter notes, and interactive present mode',
      category: 'Presentations & Media',
      icon: <Presentation className="w-4 h-4 text-purple-400" />,
      tabId: 'presentations',
      keywords: ['presentations', 'slides', 'decks', 'pitch', 'presenter', 'keynote']
    },
    {
      id: 'media',
      title: 'Media & Video Studio',
      subtitle: 'Video streams, audio podcasts, and timestamp chapters',
      category: 'Presentations & Media',
      icon: <Video className="w-4 h-4 text-rose-400" />,
      tabId: 'media',
      keywords: ['media', 'video', 'podcasts', 'recordings', 'stream', 'audio']
    },
    {
      id: 'demos',
      title: 'Demos & Prototypes Hub',
      subtitle: 'Live apps, sandbox runners, and epistemic badges',
      category: 'Work & Projects',
      icon: <Sliders className="w-4 h-4 text-amber-400" />,
      tabId: 'demos',
      keywords: ['demos', 'prototypes', 'apps', 'sandbox', 'test']
    },
    // Collaboration & Meetings
    {
      id: 'meetings',
      title: 'Meetings & Schedule',
      subtitle: 'Unified syncs, agendas, decisions, and task conversion',
      category: 'Collaboration & Meetings',
      icon: <Calendar className="w-4 h-4 text-blue-400" />,
      tabId: 'meetings',
      keywords: ['meetings', 'calendar', 'sync', 'agenda', 'call', 'schedule']
    },
    {
      id: 'workspace',
      title: 'Team Workspaces',
      subtitle: 'Collaborative rooms, team chat, and shared backlogs',
      category: 'Collaboration & Meetings',
      icon: <Users className="w-4 h-4 text-blue-400" />,
      tabId: 'workspace',
      keywords: ['teams', 'workspace', 'chat', 'collaboration', 'members', 'invite']
    },
    {
      id: 'social-inbox',
      title: 'Omnichannel Social Inbox',
      subtitle: 'WhatsApp, Messenger, Instagram, Email, SMS & Catalyx Mesh',
      category: 'Collaboration & Meetings',
      icon: <Users className="w-4 h-4 text-emerald-400" />,
      tabId: 'social-inbox',
      keywords: ['inbox', 'messages', 'chat', 'whatsapp', 'email', 'sms', 'social']
    },
    {
      id: 'partnerships',
      title: 'Partnership Alliances',
      subtitle: 'Institutional consortia, bilateral proposals & joint governance',
      category: 'Collaboration & Meetings',
      icon: <Users className="w-4 h-4 text-amber-400" />,
      tabId: 'partnerships',
      keywords: ['partnerships', 'alliances', 'consortia', 'proposals', 'governance']
    },
    // Commerce & Products
    {
      id: 'unified-commerce',
      title: 'Integrated Commerce & CRM',
      subtitle: 'Orders lifecycle, customer CRM, products, and fulfillment',
      category: 'Commerce & Products',
      icon: <ShoppingBag className="w-4 h-4 text-emerald-400" />,
      tabId: 'unified-commerce',
      keywords: ['commerce', 'crm', 'customers', 'orders', 'products', 'sales', 'store']
    },
    {
      id: 'billing',
      title: 'Billing & Subscriptions (Pesapal v3)',
      subtitle: 'Subscriptions, payment cards, mobile money, and integer units',
      category: 'Commerce & Products',
      icon: <ShoppingBag className="w-4 h-4 text-amber-400" />,
      tabId: 'billing',
      keywords: ['billing', 'payments', 'pesapal', 'subscription', 'invoices', 'checkout']
    },
    {
      id: 'commercial-ops',
      title: 'Commercial Operations & Earnings',
      subtitle: 'Earnings, Customer Value Indexing, pipeline health, and churn',
      category: 'Commerce & Products',
      icon: <ShoppingBag className="w-4 h-4 text-emerald-400" />,
      tabId: 'commercial-ops',
      keywords: ['earnings', 'revenue', 'commercial', 'payouts', 'analytics', 'pipeline']
    },
    {
      id: 'reconciliation',
      title: 'Financial Ledger Reconciliation',
      subtitle: 'Double-entry cryptographic ledger and hash verification',
      category: 'Commerce & Products',
      icon: <ShoppingBag className="w-4 h-4 text-cyan-400" />,
      tabId: 'reconciliation',
      keywords: ['ledger', 'accounting', 'double-entry', 'reconciliation', 'audit']
    },
    {
      id: 'marketplace-api',
      title: 'Marketplace & Developer APIs',
      subtitle: 'Third-party listings, sandbox runtime, and API access tokens',
      category: 'Commerce & Products',
      icon: <ShoppingBag className="w-4 h-4 text-purple-400" />,
      tabId: 'marketplace-api',
      keywords: ['marketplace', 'plugins', 'api', 'tokens', 'developers', 'store']
    },
    // Intelligence & AI
    {
      id: 'ai-coach',
      title: 'Tactical AI Coach & Assistant',
      subtitle: 'Adaptive cognitive performance copilot & task guidance',
      category: 'Intelligence & AI',
      icon: <Bot className="w-4 h-4 text-purple-400" />,
      tabId: 'ai-coach',
      keywords: ['ai', 'coach', 'assistant', 'gemini', 'copilot', 'help', 'prompts']
    },
    {
      id: 'ai-workforce',
      title: 'AI Agent Workforce (11 Agents)',
      subtitle: 'Specialized autonomous agents and task delegations',
      category: 'Intelligence & AI',
      icon: <Bot className="w-4 h-4 text-purple-400" />,
      tabId: 'ai-workforce',
      keywords: ['agents', 'workforce', 'autonomous', 'delegation', 'automation']
    },
    {
      id: 'executive-brief',
      title: 'Executive Briefing',
      subtitle: 'Holistic synthesized organizational intelligence and alerts',
      category: 'Intelligence & AI',
      icon: <Compass className="w-4 h-4 text-blue-400" />,
      tabId: 'executive-brief',
      keywords: ['executive', 'brief', 'summary', 'intelligence', 'kpi']
    },
    {
      id: 'analytics',
      title: 'Analytics & Burnout Telemetry',
      subtitle: 'Cognitive load, velocity, and predictive burn risk',
      category: 'Intelligence & AI',
      icon: <Compass className="w-4 h-4 text-cyan-400" />,
      tabId: 'analytics',
      keywords: ['analytics', 'burnout', 'metrics', 'velocity', 'productivity']
    },
    {
      id: 'digital-twin',
      title: 'Business Digital Twin',
      subtitle: 'Multi-variable scenario testing and resilience simulation runs',
      category: 'Intelligence & AI',
      icon: <Sliders className="w-4 h-4 text-emerald-400" />,
      tabId: 'digital-twin',
      keywords: ['simulation', 'twin', 'scenarios', 'modeling', 'resilience']
    },
    {
      id: 'knowledge',
      title: 'Knowledge Universe',
      subtitle: 'Cross-entity semantic knowledge graph and provenance',
      category: 'Intelligence & AI',
      icon: <Compass className="w-4 h-4 text-amber-400" />,
      tabId: 'knowledge',
      keywords: ['knowledge', 'graph', 'semantic', 'wiki', 'universe']
    },
    {
      id: 'workflows',
      title: 'Intelligent Workflows',
      subtitle: 'Event-driven triggers, conditional logic, and webhooks',
      category: 'Intelligence & AI',
      icon: <Sliders className="w-4 h-4 text-purple-400" />,
      tabId: 'workflows',
      keywords: ['workflows', 'automation', 'triggers', 'logic', 'events']
    },
    // System & Help
    {
      id: 'connections',
      title: 'Universal Connections Center',
      subtitle: 'Real connector fabric, honest statuses & webhook relays',
      category: 'System & Help',
      icon: <Sliders className="w-4 h-4 text-amber-400" />,
      tabId: 'connections',
      keywords: ['connections', 'connectors', 'integrations', 'fabric', 'webhooks']
    },
    {
      id: 'admin-portal',
      title: 'Settings & Administration',
      subtitle: 'Global organization parameters and system preferences',
      category: 'System & Help',
      icon: <Sliders className="w-4 h-4 text-gray-400" />,
      tabId: 'admin-portal',
      keywords: ['settings', 'admin', 'configuration', 'preferences', 'system']
    },
    {
      id: 'profile',
      title: 'Operator Profile',
      subtitle: 'User credentials, notification preferences & XP standings',
      category: 'System & Help',
      icon: <Users className="w-4 h-4 text-blue-400" />,
      tabId: 'profile',
      keywords: ['profile', 'account', 'user', 'password', 'notifications', 'xp']
    },
    {
      id: 'legal-center',
      title: 'Legal, Policies & Terms of Service',
      subtitle: 'Terms of service, statutory disclosures, consent logs & revenue policies',
      category: 'System & Help',
      icon: <Shield className="w-4 h-4 text-emerald-400" />,
      tabId: 'legal-center',
      keywords: ['legal', 'terms', 'privacy', 'policy', 'compliance', 'disclosures']
    },
    {
      id: 'v25-certification',
      title: 'V25 Production Certification',
      subtitle: 'Final universal work, collaboration, resilience & QA dossier',
      category: 'System & Help',
      icon: <Shield className="w-4 h-4 text-emerald-400" />,
      tabId: 'v25-certification',
      keywords: ['certification', 'audit', 'release', 'quality', 'gates']
    }
  ], []);

  // Dynamically include user's personal tasks in search
  const dynamicTaskItems: SearchItem[] = useMemo(() => {
    return tasks.map(t => ({
      id: `task-${t.id}`,
      title: t.text,
      subtitle: `Task • Priority: ${t.priority || 'medium'} • Status: ${t.completed ? 'Completed' : 'Pending'}`,
      category: 'Tasks',
      icon: <CheckSquare className={`w-4 h-4 ${t.completed ? 'text-emerald-400' : 'text-blue-400'}`} />,
      tabId: 'tasks',
      keywords: ['task', t.text.toLowerCase(), t.category?.toLowerCase() || 'work']
    }));
  }, [tasks]);

  const allItems = useMemo(() => [...baseItems, ...dynamicTaskItems], [baseItems, dynamicTaskItems]);

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      // Default recommended shortcuts when query is empty
      return baseItems.slice(0, 8);
    }
    return allItems.filter(item => {
      return (
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.keywords.some(k => k.includes(q))
      );
    }).slice(0, 15);
  }, [query, allItems, baseItems]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % (filteredItems.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredItems.length) % (filteredItems.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        handleSelectItem(filteredItems[selectedIndex]);
      } else if (query.trim() && onOpenAskAi) {
        onOpenAskAi(query);
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleSelectItem = (item: SearchItem) => {
    onNavigate(item.tabId);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center pt-16 sm:pt-24 p-4">
      <div 
        className="w-full max-w-2xl rounded-2xl catalyx-surface-elevated border border-white/15 shadow-2xl animate-scaleUp overflow-hidden flex flex-col max-h-[80vh]"
        role="dialog"
        aria-modal="true"
        aria-label="Universal search"
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/10 bg-slate-900/60 shrink-0">
          <Search className="w-5 h-5 text-amber-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search projects, tasks, files, meetings, products, settings..."
            className="bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none w-full"
            aria-label="Search everything in CATALYX"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-gray-400 hover:text-white rounded-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-white/10 text-gray-400 font-mono text-[10px]">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-2 space-y-1 flex-1">
          {filteredItems.length === 0 ? (
            <div className="py-10 text-center px-4">
              <HelpCircle className="w-8 h-8 text-gray-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-white">No results found for &ldquo;{query}&rdquo;</p>
              <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
                Try searching for a project name, deliverable, feature, or ask the AI assistant.
              </p>
              {onOpenAskAi && (
                <button
                  onClick={() => {
                    onOpenAskAi(query);
                    onClose();
                  }}
                  className="mt-4 px-4 py-2 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 text-xs font-semibold inline-flex items-center gap-2 cursor-pointer"
                >
                  <Bot className="w-4 h-4 text-purple-400" />
                  <span>Ask AI about &ldquo;{query}&rdquo;</span>
                </button>
              )}
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectItem(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full p-3 rounded-xl flex items-center justify-between gap-3 text-left transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-amber-500/10 border border-amber-500/30 text-white' 
                      : 'hover:bg-white/5 border border-transparent text-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-2 rounded-lg ${isSelected ? 'bg-amber-500/20' : 'bg-white/5 border border-white/10'} shrink-0`}>
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold truncate ${isSelected ? 'text-amber-300' : 'text-white'}`}>
                          {item.title}
                        </span>
                        <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-white/5 text-gray-400 border border-white/10 shrink-0">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400 truncate mt-0.5">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <ArrowRight className={`w-4 h-4 shrink-0 transition-transform ${isSelected ? 'text-amber-400 translate-x-0.5' : 'text-gray-600'}`} />
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-slate-900/60 border-t border-white/10 flex items-center justify-between text-[11px] text-gray-400 shrink-0">
          <div className="flex items-center gap-3">
            <span>Use <kbd className="px-1 py-0.2 bg-white/10 rounded text-[9px] font-mono text-gray-300">↑</kbd> <kbd className="px-1 py-0.2 bg-white/10 rounded text-[9px] font-mono text-gray-300">↓</kbd> to navigate</span>
            <span><kbd className="px-1 py-0.2 bg-white/10 rounded text-[9px] font-mono text-gray-300">Enter</kbd> to open</span>
          </div>
          {onOpenAskAi && (
            <button
              onClick={() => {
                onOpenAskAi(query || undefined);
                onClose();
              }}
              className="text-purple-400 hover:text-purple-300 flex items-center gap-1 font-medium cursor-pointer"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Ask AI Assistant</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
