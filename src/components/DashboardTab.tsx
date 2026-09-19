import React, { useState } from 'react';
import { motion } from 'motion/react';
import { UserProfile, ACHIEVEMENTS } from '../types';
import { 
  Award, Zap, Flame, Brain, Sparkles, CheckSquare, 
  Target, Folder, ShieldAlert, Award as Medal, Command, Cpu
} from 'lucide-react';

// Submodules
import { FocusCabin } from './FocusCabin';
import { GoalCenter } from './GoalCenter';
import { ProjectBoard } from './ProjectBoard';
import { AdminPortal } from './AdminPortal';
import { DigitalTwinForecast } from './DigitalTwinForecast';
import { KnowledgeGraphVisualizer } from './KnowledgeGraphVisualizer';

interface DashboardTabProps {
  user: UserProfile;
  activeQuote: { quote: string; tip: string };
  completedCount: number;
  totalCount: number;
  onNavigate: (tab: string) => void;
  onRefreshSystem: () => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  user,
  activeQuote,
  completedCount,
  totalCount,
  onNavigate,
  onRefreshSystem
}) => {
  const [innerTab, setInnerTab] = useState<'overview' | 'focus' | 'goals' | 'projects' | 'admin' | 'twin'>('overview');

  // Map unlocked achievements
  const unlockedAchievements = ACHIEVEMENTS.filter(a => user.achievements.includes(a.id));
  const lockedAchievements = ACHIEVEMENTS.filter(a => !user.achievements.includes(a.id));

  // Determine status color & label based on execution score
  const getScoreStatus = (score: number) => {
    if (score >= 80) return { label: 'Elite Executor', color: 'text-brand-cyan border-brand-cyan/30 bg-brand-cyan/5', glow: 'glow-cyan' };
    if (score >= 60) return { label: 'High Performer', color: 'text-brand-purple border-brand-purple/30 bg-brand-purple/5', glow: 'glow-brand' };
    if (score >= 30) return { label: 'Building Consistency', color: 'text-brand-indigo border-brand-indigo/30 bg-brand-indigo/5', glow: '' };
    return { label: 'Low Momentum', color: 'text-brand-pink border-brand-pink/30 bg-brand-pink/5', glow: 'glow-pink' };
  };

  const statusObj = getScoreStatus(user.executionScore);

  // Level Up progress calculation
  const xpNeeded = user.level * 100;
  const xpPercent = Math.min(100, Math.floor((user.xp / xpNeeded) * 100));

  return (
    <div className="space-y-6" id="dashboard-tab">
      
      {/* V2 CONSOLE SUB-NAVIGATION */}
      <div className="flex flex-wrap gap-2 pb-2 border-b border-white/5">
        {[
          { id: 'overview', label: 'Operational Overview', icon: Zap },
          { id: 'focus', label: 'Deep Focus Cabin', icon: Brain },
          { id: 'goals', label: 'Strategic Goals', icon: Target },
          { id: 'projects', label: 'Project Initiatives', icon: Folder },
          { id: 'twin', label: 'Execution Digital Twin', icon: Cpu },
          { id: 'admin', label: 'Command Registry', icon: Command },
        ].map((subTab) => {
          const Icon = subTab.icon;
          const isActive = innerTab === subTab.id;
          return (
            <button
              key={subTab.id}
              onClick={() => setInnerTab(subTab.id as any)}
              className={`py-2 px-4 rounded-xl border text-xs font-mono font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                isActive 
                  ? 'bg-gradient-to-r from-brand-purple/10 to-brand-cyan/5 border-brand-purple/40 text-white' 
                  : 'bg-transparent border-white/5 text-gray-500 hover:text-gray-300 hover:bg-white/[0.02]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-brand-cyan animate-pulse' : 'text-gray-500'}`} />
              {subTab.label}
            </button>
          );
        })}
      </div>

      {/* DYNAMIC SUBMODULE RENDERING */}
      {innerTab === 'overview' && (
        <div className="space-y-6">
          {/* Visual Header Welcome */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="glass-panel p-6 rounded-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-80 h-80 bg-brand-purple/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
            <div className="absolute bottom-0 left-0 w-60 h-60 bg-brand-cyan/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 text-[9px] font-mono tracking-widest text-[#00f5d4] border border-[#00f5d4]/20 rounded-full bg-[#00f5d4]/5 uppercase">
                    STATUS: {user.title || 'Novice Executor'} Verified
                  </span>
                  {user.premium && (
                    <span className="px-2.5 py-0.5 text-[9px] font-mono tracking-widest text-pink-400 border border-pink-500/30 rounded-full bg-pink-500/10 uppercase">
                      👑 PREMIUM COMPLIANCE
                    </span>
                  )}
                </div>
                <h1 className="text-3xl md:text-4xl font-display font-semibold text-white tracking-tight">
                  Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-purple to-brand-cyan font-bold">{user.username}</span>
                </h1>
                <p className="text-gray-400 mt-1 max-w-xl text-sm font-sans">
                  CATALYX Operating System intelligence indicates steady cognitive momentum. Let's conquer the active execution sprints.
                </p>
              </div>

              <div className="flex items-center gap-4 bg-white/5 border border-white/5 p-4 rounded-xl backdrop-blur-md shrink-0">
                <div className="text-center px-2">
                  <div className="text-[10px] text-gray-500 uppercase font-mono tracking-wider">Level</div>
                  <div className="text-3xl font-display font-medium text-brand-purple">{user.level}</div>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div className="text-center px-2">
                  <div className="text-[10px] text-gray-500 uppercase font-mono tracking-wider">Streak</div>
                  <div className="text-3xl font-display font-medium text-brand-pink flex items-center justify-center gap-1">
                    <Flame className="w-5 h-5 text-brand-pink fill-brand-pink/20 animate-pulse" />
                    {user.streak}d
                  </div>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div className="text-center px-2">
                  <div className="text-[10px] text-gray-500 uppercase font-mono tracking-wider">Discipline</div>
                  <div className="text-3xl font-display font-medium text-[#00f5d4]">{user.xp} <span className="text-[10px] text-gray-400 font-mono">XP</span></div>
                </div>
              </div>
            </div>

            {/* Level Progress bar */}
            <div className="mt-6 pt-4 border-t border-white/5">
              <div className="flex justify-between items-center text-xs font-mono text-gray-400 mb-1">
                <span>SYSTEM PROGRESS ({user.xp}/{xpNeeded} XP)</span>
                <span>{xpPercent}% TO COMPLIANCE LEVEL {user.level + 1}</span>
              </div>
              <div className="w-full h-2 bg-slate-950/80 rounded-full overflow-hidden p-0.5 border border-white/5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${xpPercent}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className="h-full rounded-full bg-gradient-to-r from-brand-purple via-pink-500 to-brand-cyan"
                />
              </div>
            </div>
          </motion.div>

          {/* Grid: Quad Vector Metrics Indices */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'EXECUTION SCORE', value: `${user.executionScore}%`, color: 'text-brand-purple', desc: 'Overall task fulfillment rate' },
              { label: 'FOCUS SCORE', value: `${user.focusScore || 0}%`, color: 'text-brand-cyan', desc: 'Log-based Pomodoro focus sessions' },
              { label: 'CONSISTENCY SCORE', value: `${user.consistencyScore || 0}%`, color: 'text-pink-500', desc: 'Active consecutive streaks alignment' },
              { label: 'MOMENTUM SCORE', value: `${user.momentumScore || 0}%`, color: 'text-[#4361ee]', desc: 'Frictionless planning & completion speed' },
            ].map((v, i) => (
              <div key={i} className="p-4 bg-black/20 border border-white/5 rounded-2xl flex flex-col justify-between">
                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">{v.label}</span>
                <span className={`text-3xl font-display font-medium my-1 ${v.color}`}>{v.value}</span>
                <span className="text-[10px] text-gray-400">{v.desc}</span>
              </div>
            ))}
          </div>

          {/* Visual statistics overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Circular execution indicator */}
            <div className={`glass-panel p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden ${statusObj.glow}`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-xs font-mono tracking-wider text-gray-400 uppercase">TELEMETRY COMPLIANCE</p>
                  <h2 className="text-4xl font-display font-bold text-white mt-1">{user.executionScore}%</h2>
                </div>
                <span className={`px-2.5 py-1 text-xs font-mono select-none rounded border ${statusObj.color}`}>
                  {statusObj.label}
                </span>
              </div>

              <div className="my-4 relative flex items-center justify-center h-28">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle cx="48" cy="48" r="40" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="6" fill="transparent" />
                  <motion.circle 
                    cx="48" 
                    cy="48" 
                    r="40" 
                    stroke={user.executionScore >= 80 ? '#00f5d4' : user.executionScore >= 60 ? '#9d4edd' : '#ff007f'} 
                    strokeWidth="6" 
                    fill="transparent" 
                    strokeDasharray="251.2"
                    initial={{ strokeDashoffset: 251.2 }}
                    animate={{ strokeDashoffset: 251.2 - (251.2 * user.executionScore) / 100 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute text-center mt-[-2px]">
                  <span className="text-[10px] text-gray-500 font-mono">INDEX</span>
                  <div className="text-lg font-semibold text-white">{user.executionScore}%</div>
                </div>
              </div>

              <div className="text-xs text-gray-400 font-sans border-t border-white/5 pt-3 mt-2">
                Unified formula evaluating personal tasks, deep focus logs, and daily execution compliance metrics.
              </div>
            </div>

            {/* Daily Coach quote panel */}
            <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between bg-gradient-to-br from-indigo-950/25 to-slate-950/40">
              <div>
                <div className="flex items-center gap-1.5 text-brand-cyan mb-2">
                  <Brain className="w-4 h-4 animate-pulse" />
                  <span className="text-xs font-mono tracking-widest uppercase">CATALYX COACH INTEL V2</span>
                </div>
                <p className="text-white italic text-sm leading-relaxed font-serif pl-3 border-l-2 border-brand-purple/50">
                  "{activeQuote.quote}"
                </p>
              </div>

              <div className="bg-white/5 border border-white/5 p-3 rounded-lg mt-4">
                <div className="flex items-center gap-1 text-[10px] text-brand-purple font-mono uppercase mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  TACTICAL INTERVENTION DIRECTIVE
                </div>
                <p className="text-xs text-gray-300 leading-normal font-sans">
                  {activeQuote.tip}
                </p>
              </div>
            </div>

            {/* Backlog completion ratios */}
            <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
              <div>
                <p className="text-xs font-mono tracking-wider text-gray-400 uppercase">SATELLITE BACKLOG</p>
                <div className="flex justify-between items-baseline mt-1 mb-2">
                  <h2 className="text-3xl font-display font-semibold text-white">
                    {completedCount}<span className="text-xl text-gray-500">/{totalCount}</span>
                  </h2>
                  <span className="text-xs font-mono text-emerald-400">
                    {totalCount > 0 ? Math.round((completedCount/totalCount)*100) : 0}% Done
                  </span>
                </div>
                
                <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden mb-4">
                  <div 
                    className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${totalCount > 0 ? (completedCount/totalCount)*100 : 0}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <button 
                  onClick={() => onNavigate('tasks')}
                  className="w-full py-2 px-4 bg-brand-purple/10 hover:bg-brand-purple/20 border border-brand-purple/30 rounded-xl text-xs font-semibold text-white flex items-center justify-between transition-colors group cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-brand-purple" />
                    Open Task Logs
                  </span>
                  <span>➜</span>
                </button>
                <button 
                  onClick={() => onNavigate('workspace')}
                  className="w-full py-2 px-4 bg-brand-cyan/10 hover:bg-brand-cyan/20 border border-brand-cyan/30 rounded-xl text-xs font-semibold text-brand-cyan flex items-center justify-between transition-colors group cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Medal className="w-4 h-4 text-brand-cyan" />
                    Open Workspaces
                  </span>
                  <span>➜</span>
                </button>
              </div>
            </div>
          </div>

          {/* V5 Global Knowledge Graph integration */}
          <KnowledgeGraphVisualizer />

          {/* Achievements secured layout */}
          <div className="glass-panel p-6 rounded-2xl">
            <h3 className="text-lg font-display font-semibold text-white mb-4 flex items-center gap-1.5">
              <Award className="w-5 h-5 text-yellow-400 animate-pulse" />
              Strategic Merit Badges ({unlockedAchievements.length}/{ACHIEVEMENTS.length})
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {ACHIEVEMENTS.map((a) => {
                const unlocked = user.achievements.includes(a.id);
                return (
                  <div 
                    key={a.id}
                    className={`p-3.5 rounded-xl border flex gap-3.5 transition-all ${
                      unlocked 
                        ? 'bg-slate-900/40 border-brand-purple/20 text-white' 
                        : 'bg-black/20 border-white/5 opacity-40'
                    }`}
                  >
                    <div className="text-3xl">{a.badge}</div>
                    <div>
                      <h4 className="text-xs font-bold flex items-center gap-1 uppercase tracking-tight">
                        {a.title}
                        {unlocked && (
                          <span className="text-[8px] font-mono uppercase bg-brand-cyan/15 text-brand-cyan border border-brand-cyan/30 px-1 rounded block">
                            SECURED
                          </span>
                        )}
                      </h4>
                      <p className="text-[11px] text-gray-400 mt-0.5">{a.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {innerTab === 'focus' && (
        <FocusCabin userId={user.uid} onFocusLogged={onRefreshSystem} />
      )}

      {innerTab === 'goals' && (
        <GoalCenter userId={user.uid} onGoalUpdated={onRefreshSystem} />
      )}

      {innerTab === 'projects' && (
        <ProjectBoard userId={user.uid} />
      )}

      {innerTab === 'admin' && (
        <AdminPortal user={user} onRefreshProfileAndSystem={onRefreshSystem} />
      )}

      {innerTab === 'twin' && (
        <DigitalTwinForecast user={user} />
      )}

    </div>
  );
};
