import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Share2, 
  MessageSquare, 
  CheckCircle, 
  FileText, 
  Presentation, 
  Video, 
  Calendar, 
  ShieldAlert, 
  ExternalLink,
  Clock,
  Filter
} from 'lucide-react';
import { EnterpriseActivityItem } from '../types';
import { collaborationService } from '../services/collaborationService';

interface EnterpriseActivityFeedProps {
  onNavigateToArtifact?: (targetType: string, targetId: string) => void;
}

export const EnterpriseActivityFeed: React.FC<EnterpriseActivityFeedProps> = ({
  onNavigateToArtifact
}) => {
  const [activities, setActivities] = useState<EnterpriseActivityItem[]>([]);
  const [filterAction, setFilterAction] = useState<string>('ALL');

  const loadFeed = () => {
    setActivities(collaborationService.getActivityFeed());
  };

  useEffect(() => {
    loadFeed();
  }, []);

  const getActionIcon = (eventType: EnterpriseActivityItem['eventType']) => {
    switch (eventType) {
      case 'SHARE_LINK_CREATED':
      case 'FILE_SHARED':
        return <Share2 className="w-3.5 h-3.5 text-brand-cyan" />;
      case 'COMMENT_ADDED':
        return <MessageSquare className="w-3.5 h-3.5 text-brand-purple" />;
      case 'PAYMENT_VERIFIED':
      case 'TASK_ASSIGNED':
        return <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />;
      case 'SHARE_REVOKED':
        return <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />;
      default:
        return <FileText className="w-3.5 h-3.5 text-blue-400" />;
    }
  };

  const filtered = filterAction === 'ALL' 
    ? activities 
    : activities.filter(a => a.eventType === filterAction);

  return (
    <div className="p-6 rounded-3xl bg-slate-950/80 border border-white/10 space-y-4 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-brand-cyan/15 border border-brand-cyan/30 flex items-center justify-center text-brand-cyan">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">
              Enterprise Collaboration Stream
            </h3>
            <p className="text-[11px] text-gray-400">
              Live audit trail of shared artifacts, team annotations, and task conversions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {['ALL', 'FILE_SHARED', 'PRESENTATION_UPDATED', 'COMMENT_ADDED', 'PAYMENT_VERIFIED', 'SHARE_LINK_CREATED'].map((act) => (
            <button
              key={act}
              onClick={() => setFilterAction(act)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-semibold transition-all cursor-pointer ${
                filterAction === act
                  ? 'bg-brand-cyan text-slate-950'
                  : 'bg-slate-900 text-gray-400 hover:text-white border border-white/5'
              }`}
            >
              {act.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
        {filtered.length === 0 ? (
          <p className="text-xs text-gray-500 py-6 text-center">No activity recorded for this filter.</p>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-2xl bg-slate-900/90 border border-white/5 hover:border-white/15 transition-all flex items-start justify-between gap-3"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="p-2 rounded-xl bg-slate-950 border border-white/10 mt-0.5 shrink-0">
                  {getActionIcon(item.eventType)}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-white">
                      {item.actor}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/5 text-brand-cyan border border-white/10 uppercase">
                      {item.eventType.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-gray-300 truncate">
                      "{item.title}"
                    </span>
                  </div>

                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                    {item.description}
                  </p>

                  <div className="flex items-center gap-2 text-[10px] font-mono text-gray-500 mt-1.5">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <span>•</span>
                    <span className="uppercase">{item.targetType}</span>
                  </div>
                </div>
              </div>

              {onNavigateToArtifact && (
                <button
                  onClick={() => onNavigateToArtifact(item.targetType, item.targetId)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-brand-cyan text-xs transition-colors shrink-0 cursor-pointer"
                  title="Inspect Artifact"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
