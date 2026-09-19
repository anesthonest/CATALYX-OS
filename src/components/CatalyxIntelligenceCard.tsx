import React, { useState } from 'react';
import { 
  IntelligenceCardData, 
  realityEngineService 
} from '../services/realityEngineService';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Cpu, 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp, 
  Info, 
  ArrowRight, 
  Lock, 
  Unlock, 
  Clock, 
  Sparkles,
  HelpCircle,
  Database
} from 'lucide-react';

interface CatalyxIntelligenceCardProps {
  card: IntelligenceCardData;
  onExecuteAction?: (card: IntelligenceCardData) => void;
  showAdvancedDetails?: boolean;
}

export const CatalyxIntelligenceCard: React.FC<CatalyxIntelligenceCardProps> = ({
  card,
  onExecuteAction,
  showAdvancedDetails = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const badge = realityEngineService.getBadgeInfo(card.realityStatus);

  const getImpactBadge = (impact: IntelligenceCardData['impact']) => {
    switch (impact) {
      case 'critical':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'high':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'medium':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/40';
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/70 backdrop-blur-md p-5 shadow-xl transition-all hover:border-brand-purple/40">
      {/* 1. CARD HEADER & REALITY BADGE */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase border flex items-center gap-1.5 ${badge.badgeClass}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            {badge.label}
          </span>
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold uppercase border ${getImpactBadge(card.impact)}`}>
            {card.impact} IMPACT
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
          <Clock className="w-3.5 h-3.5 text-gray-500" />
          <span>{new Date(card.generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          <span className="text-gray-600">•</span>
          <span className="text-brand-cyan/80 truncate max-w-[140px]">{card.modelOrSource}</span>
        </div>
      </div>

      {/* 2. WHAT WAS DETECTED */}
      <div className="mt-3.5">
        <h4 className="text-xs font-mono tracking-wider text-gray-400 uppercase flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-brand-purple" />
          WHAT (FINDING)
        </h4>
        <p className="mt-1 text-sm text-gray-100 font-medium leading-relaxed">
          {card.what}
        </p>
      </div>

      {/* 3. WHY (EPISTEMIC RATIONALE) */}
      <div className="mt-3">
        <h4 className="text-xs font-mono tracking-wider text-gray-400 uppercase flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-brand-cyan" />
          WHY (RATIONALE)
        </h4>
        <p className="mt-1 text-xs text-gray-300 leading-relaxed">
          {card.why}
        </p>
      </div>

      {/* 4. CONFIDENCE & VERIFIED EVIDENCE */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-slate-950/40 border border-white/5">
        <div>
          <span className="text-[10px] font-mono text-gray-400 uppercase block">System Confidence</span>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 bg-gray-800 rounded-full h-2 overflow-hidden">
              <div 
                className={`h-full rounded-full ${
                  card.confidence >= 80 ? 'bg-emerald-400' : card.confidence >= 60 ? 'bg-amber-400' : 'bg-rose-400'
                }`}
                style={{ width: `${card.confidence}%` }}
              />
            </div>
            <span className="text-xs font-mono font-bold text-white">{card.confidence}%</span>
          </div>
          <span className="text-[9px] font-mono text-gray-500 mt-0.5 block">
            Sample Basis: {card.sampleCount} verified data points
          </span>
        </div>

        <div>
          <span className="text-[10px] font-mono text-gray-400 uppercase block">Authorization Level</span>
          <div className="flex items-center gap-1.5 mt-1">
            {card.userAuthorized ? (
              <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                <Unlock className="w-3.5 h-3.5" />
                Authorized ({card.authorizationRequired})
              </span>
            ) : (
              <span className="text-xs font-mono text-rose-400 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5" />
                Restricted ({card.authorizationRequired})
              </span>
            )}
          </div>
          <span className="text-[9px] font-mono text-gray-500 mt-0.5 block">
            Status: {card.status}
          </span>
        </div>
      </div>

      {/* 5. RECOMMENDED ACTION & EXECUTION TRIGGER */}
      <div className="mt-4 p-3.5 rounded-xl border border-brand-purple/20 bg-brand-purple/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex-1">
          <span className="text-[10px] font-mono text-brand-pink font-semibold uppercase tracking-wider block">
            Recommended Action
          </span>
          <p className="text-xs text-gray-200 font-medium mt-0.5">
            {card.recommendedAction}
          </p>
        </div>

        {card.canExecute && onExecuteAction && (
          <button
            onClick={() => onExecuteAction(card)}
            disabled={!card.userAuthorized || card.status === 'EXECUTED'}
            className={`px-4 py-2 rounded-xl text-xs font-semibold font-mono tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0 ${
              card.status === 'EXECUTED'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 cursor-default'
                : card.userAuthorized
                ? 'bg-gradient-to-r from-brand-purple to-brand-cyan hover:opacity-90 text-white shadow-lg shadow-purple-950/40'
                : 'bg-gray-800 text-gray-500 border border-gray-700 cursor-not-allowed'
            }`}
          >
            {card.status === 'EXECUTED' ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                EXECUTED
              </>
            ) : (
              <>
                <span>EXECUTE ACTION</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        )}
      </div>

      {/* 6. PROGRESSIVE DISCLOSURE (LIMITATIONS & EVIDENCE) */}
      <div className="mt-3">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between py-1 text-[11px] font-mono text-gray-400 hover:text-gray-200 transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-1.5">
            <HelpCircle className="w-3 h-3 text-gray-500" />
            {isExpanded ? 'Hide Epistemic Evidence & Limitations' : 'Show Epistemic Evidence & Limitations'}
          </span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {isExpanded && (
          <div className="mt-2.5 pt-2.5 border-t border-white/5 space-y-3 text-xs">
            {/* Evidence items */}
            <div>
              <span className="text-[10px] font-mono text-gray-400 uppercase block mb-1">
                Empirical Evidence Backing
              </span>
              <ul className="space-y-1 pl-4 list-disc text-gray-300 text-[11px]">
                {card.evidence.map((ev, i) => (
                  <li key={i}>{ev}</li>
                ))}
              </ul>
            </div>

            {/* Known Limitations */}
            <div>
              <span className="text-[10px] font-mono text-amber-400/80 uppercase block mb-1 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-400" />
                Explicit System Limitations
              </span>
              <ul className="space-y-1 pl-4 list-disc text-gray-400 text-[11px]">
                {card.limitations.map((lim, i) => (
                  <li key={i}>{lim}</li>
                ))}
              </ul>
            </div>

            {showAdvancedDetails && (
              <div className="p-2.5 rounded-lg bg-black/40 font-mono text-[10px] text-gray-400">
                <div>CARD ID: {card.id}</div>
                <div>CLASSIFICATION: {card.realityStatus}</div>
                <div>MODEL ENGINE: {card.modelOrSource}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
