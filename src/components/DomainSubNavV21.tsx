import React from 'react';
import { PrimaryDomainId } from '../types';
import { v21ExperienceService } from '../services/v21ExperienceService';
import { 
  LayoutDashboard, 
  Briefcase, 
  Brain, 
  Compass, 
  Bot, 
  Cpu, 
  Globe, 
  Receipt, 
  Shield, 
  Sparkles,
  Users,
  ShoppingBag,
  Plug
} from 'lucide-react';

interface DomainSubNavV21Props {
  activeDomain: PrimaryDomainId;
  activeTab: string;
  onSelectTab: (tabId: string) => void;
}

export const DomainSubNavV21: React.FC<DomainSubNavV21Props> = ({
  activeDomain,
  activeTab,
  onSelectTab
}) => {
  const currentGroup = v21ExperienceService.domainGroups.find(g => g.id === activeDomain);
  if (!currentGroup || currentGroup.subItems.length <= 1) return null;

  const renderDomainIcon = (id: PrimaryDomainId) => {
    switch (id) {
      case 'home': return <LayoutDashboard className="w-4 h-4 text-amber-400" />;
      case 'work': return <Briefcase className="w-4 h-4 text-emerald-400" />;
      case 'collaborate': return <Users className="w-4 h-4 text-blue-400" />;
      case 'business': return <Receipt className="w-4 h-4 text-emerald-300" />;
      case 'marketplace': return <ShoppingBag className="w-4 h-4 text-cyan-400" />;
      case 'intelligence': return <Brain className="w-4 h-4 text-purple-400" />;
      case 'connections': return <Plug className="w-4 h-4 text-amber-300" />;
      case 'system': return <Shield className="w-4 h-4 text-rose-400" />;
      case 'missions': return <Compass className="w-4 h-4 text-amber-400" />;
      case 'automation': return <Bot className="w-4 h-4 text-cyan-400" />;
      case 'resources': return <Cpu className="w-4 h-4 text-indigo-400" />;
      case 'ecosystem': return <Globe className="w-4 h-4 text-blue-400" />;
      case 'commerce': return <Receipt className="w-4 h-4 text-emerald-300" />;
      case 'admin': return <Shield className="w-4 h-4 text-rose-400" />;
      default: return <Sparkles className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className="mb-6 p-2 rounded-2xl catalyx-surface-card border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
      {/* Domain Badge & Tagline */}
      <div className="flex items-center gap-2.5 px-2">
        {renderDomainIcon(activeDomain)}
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-display font-bold text-white uppercase tracking-wider">
              {currentGroup.label}
            </span>
            {currentGroup.badge && (
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold">
                {currentGroup.badge}
              </span>
            )}
          </div>
          <p className="text-[11px] text-gray-400 hidden md:block">
            {currentGroup.tagline}
          </p>
        </div>
      </div>

      {/* Horizontal Sub-nav tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
        {currentGroup.subItems.map((sub) => {
          const isActive = activeTab === sub.id;
          return (
            <button
              key={sub.id}
              onClick={() => onSelectTab(sub.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-amber-500/20 border border-amber-500/50 text-amber-300 shadow-sm'
                  : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-transparent'
              }`}
              title={sub.description}
            >
              <span>{sub.label}</span>
              {sub.versionBadge && (
                <span className={`text-[8px] font-mono px-1 rounded ${
                  isActive ? 'bg-amber-500/30 text-amber-200' : 'bg-slate-900 text-gray-500'
                }`}>
                  {sub.versionBadge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
