import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Terminal, 
  ArrowRight, 
  CheckSquare, 
  Compass, 
  Sparkles, 
  Bot, 
  Shield, 
  Receipt, 
  Brain, 
  FolderKanban, 
  Globe,
  Sliders
} from 'lucide-react';
import { Task, PrimaryDomainId } from '../types';
import { v21ExperienceService } from '../services/v21ExperienceService';

interface CommandPaletteProps {
  tasks: Task[];
  onNavigate: (tab: string) => void;
  onSelectTask: (id: string) => void;
  isOpenExternal?: boolean;
  onCloseExternal?: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ 
  tasks, 
  onNavigate, 
  onSelectTask,
  isOpenExternal,
  onCloseExternal
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = isOpenExternal !== undefined ? isOpenExternal : internalOpen;
  const setIsOpen = (open: boolean) => {
    if (onCloseExternal && !open) onCloseExternal();
    setInternalOpen(open);
  };

  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'WORK' | 'INTELLIGENCE' | 'MISSIONS' | 'AUTOMATION' | 'COMMERCE' | 'ADMIN'>('ALL');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  const searchIndex = useMemo(() => v21ExperienceService.getSearchIndex(), []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle palette on Ctrl+K or Command+K
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen(!isOpen);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Filter items based on query and category chip
  const filteredSearchItems = useMemo(() => {
    let items = searchIndex;

    if (activeFilter !== 'ALL') {
      const domainMap: Record<string, PrimaryDomainId[]> = {
        WORK: ['work'],
        INTELLIGENCE: ['intelligence'],
        MISSIONS: ['missions'],
        AUTOMATION: ['automation'],
        COMMERCE: ['commerce'],
        ADMIN: ['admin']
      };
      const allowedDomains = domainMap[activeFilter] || [];
      items = items.filter(i => allowedDomains.includes(i.domain));
    }

    if (!query.trim()) {
      return items.slice(0, 10);
    }

    const q = query.toLowerCase();
    return items.filter(i => 
      i.title.toLowerCase().includes(q) ||
      i.description.toLowerCase().includes(q) ||
      i.domain.toLowerCase().includes(q) ||
      i.keywords.some(k => k.toLowerCase().includes(q))
    ).slice(0, 12);
  }, [searchIndex, query, activeFilter]);

  const filteredTasks = useMemo(() => {
    if (!query.trim() || activeFilter !== 'ALL' && activeFilter !== 'WORK') return [];
    const q = query.toLowerCase();
    return tasks.filter(t => t.text.toLowerCase().includes(q)).slice(0, 4);
  }, [tasks, query, activeFilter]);

  const totalResults = filteredSearchItems.length + filteredTasks.length;

  // Arrow key navigation
  useEffect(() => {
    setSelectedIndex(0);
  }, [query, activeFilter]);

  const handleKeyDownInInput = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % (totalResults || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + (totalResults || 1)) % (totalResults || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex < filteredSearchItems.length) {
        const item = filteredSearchItems[selectedIndex];
        if (item) {
          onNavigate(item.tabId);
          setIsOpen(false);
          setQuery('');
        }
      } else {
        const taskIndex = selectedIndex - filteredSearchItems.length;
        const task = filteredTasks[taskIndex];
        if (task) {
          onSelectTask(task.id);
          setIsOpen(false);
          setQuery('');
        }
      }
    }
  };

  const getDomainIcon = (domain: PrimaryDomainId) => {
    switch (domain) {
      case 'work': return <FolderKanban className="w-4 h-4 text-emerald-400" />;
      case 'intelligence': return <Brain className="w-4 h-4 text-brand-purple" />;
      case 'missions': return <Compass className="w-4 h-4 text-amber-400" />;
      case 'automation': return <Bot className="w-4 h-4 text-cyan-400" />;
      case 'commerce': return <Receipt className="w-4 h-4 text-emerald-300" />;
      case 'admin': return <Shield className="w-4 h-4 text-rose-400" />;
      case 'ecosystem': return <Globe className="w-4 h-4 text-indigo-400" />;
      case 'home':
      default: return <Sparkles className="w-4 h-4 text-brand-cyan" />;
    }
  };

  return (
    <div id="command-center">
      {/* Top bar trigger */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-slate-900/80 hover:bg-slate-800 text-gray-300 hover:text-white px-3 py-1.5 rounded-xl border border-white/10 text-xs font-mono select-none transition-all cursor-pointer shadow-sm group"
        title="Search Entire Platform (Cmd + K)"
        aria-label="Universal Command Search"
      >
        <Search className="w-3.5 h-3.5 text-brand-cyan group-hover:scale-110 transition-transform" />
        <span className="hidden sm:inline">Search Everything</span>
        <kbd className="text-[9px] bg-black/40 text-gray-400 border border-white/10 px-1.5 py-0.5 rounded font-mono">
          ⌘K
        </kbd>
      </button>

      {/* Palette Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-start justify-center pt-[10vh] p-4"
          >
            {/* Click catcher */}
            <div className="absolute inset-0" onClick={() => setIsOpen(false)} />

            <motion.div
              initial={{ scale: 0.96, y: -15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: -15 }}
              className="w-full max-w-2xl glass-panel-heavy p-5 rounded-3xl relative overflow-hidden ring-1 ring-brand-cyan/30 flex flex-col max-h-[75vh] shadow-2xl z-10"
            >
              {/* Top search input */}
              <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                <Search className="w-5 h-5 text-brand-cyan shrink-0" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Search pages, tools, missions, tasks, intelligence, firewall... (e.g. 'fabric', 'ledger', 'firewall')"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDownInInput}
                  className="w-full bg-transparent border-0 outline-none text-sm text-white placeholder-gray-500 focus:ring-0"
                />
                {query && (
                  <button
                    onClick={() => setQuery('')}
                    className="text-gray-500 hover:text-white text-xs px-2 py-1 rounded-md cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Filter chips */}
              <div className="flex items-center gap-1.5 pt-3 pb-2 overflow-x-auto text-[11px] border-b border-white/5 scrollbar-none">
                {(['ALL', 'WORK', 'INTELLIGENCE', 'MISSIONS', 'AUTOMATION', 'COMMERCE', 'ADMIN'] as const).map((chip) => (
                  <button
                    key={chip}
                    onClick={() => setActiveFilter(chip)}
                    className={`px-2.5 py-1 rounded-lg font-mono uppercase tracking-wider transition-all cursor-pointer shrink-0 ${
                      activeFilter === chip
                        ? 'bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/40 font-bold'
                        : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-transparent'
                    }`}
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* Search results list */}
              <div ref={listRef} className="flex-1 overflow-y-auto mt-3 space-y-3 pr-1">
                {filteredSearchItems.length > 0 && (
                  <div>
                    <h4 className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-1.5 px-2">
                      Navigation & Features ({filteredSearchItems.length})
                    </h4>
                    <div className="space-y-1">
                      {filteredSearchItems.map((item, index) => {
                        const isSelected = selectedIndex === index;
                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              onNavigate(item.tabId);
                              setIsOpen(false);
                              setQuery('');
                            }}
                            className={`w-full p-2.5 rounded-xl flex items-center justify-between text-left transition-all text-xs cursor-pointer ${
                              isSelected
                                ? 'bg-brand-purple/20 border border-brand-purple/50 text-white shadow-lg'
                                : 'hover:bg-white/5 text-gray-300 border border-transparent'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-1.5 rounded-lg bg-slate-950/70 border border-white/5">
                                {getDomainIcon(item.domain)}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-white">{item.title}</span>
                                  <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-white/5 text-gray-400">
                                    {item.domain}
                                  </span>
                                </div>
                                <p className="text-[11px] text-gray-400 mt-0.5">{item.description}</p>
                              </div>
                            </div>

                            <ArrowRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? 'text-brand-purple translate-x-0.5' : 'text-gray-600'}`} />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {filteredTasks.length > 0 && (
                  <div>
                    <h4 className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-1.5 px-2">
                      Matching Task Logs ({filteredTasks.length})
                    </h4>
                    <div className="space-y-1">
                      {filteredTasks.map((t, tIdx) => {
                        const globalIndex = filteredSearchItems.length + tIdx;
                        const isSelected = selectedIndex === globalIndex;
                        return (
                          <button
                            key={t.id}
                            onClick={() => {
                              onSelectTask(t.id);
                              setIsOpen(false);
                              setQuery('');
                            }}
                            className={`w-full p-2.5 rounded-xl flex items-center justify-between text-left transition-all text-xs cursor-pointer ${
                              isSelected
                                ? 'bg-brand-cyan/20 border border-brand-cyan/50 text-white'
                                : 'hover:bg-white/5 text-gray-300 border border-transparent'
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <CheckSquare className="w-3.5 h-3.5 text-brand-cyan" />
                              <span className="font-mono">{t.text}</span>
                            </span>
                            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                              t.completed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                            }`}>
                              {t.completed ? 'COMPLETED' : 'PENDING'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {query && filteredSearchItems.length === 0 && filteredTasks.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-xs text-gray-400">
                      No matching page, tool, or task found for "{query}".
                    </p>
                    <p className="text-[11px] text-gray-500 mt-1">
                      Try searching by concept, e.g. "simulation", "firewall", "billing", or "agents".
                    </p>
                  </div>
                )}
              </div>

              {/* Keyboard legend footer */}
              <div className="border-t border-white/5 pt-3 mt-3 flex justify-between items-center text-[10px] text-gray-500 font-mono">
                <div className="flex items-center gap-3">
                  <span>↑↓ Navigate</span>
                  <span>↵ Select</span>
                  <span>ESC Close</span>
                </div>
                <span className="text-brand-cyan">CATALYX V30 Command Engine</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
