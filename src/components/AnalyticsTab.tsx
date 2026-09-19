import React, { useState } from 'react';
import { motion } from 'motion/react';
import { UserProfile, Task } from '../types';
import { 
  TrendingUp, Zap, Flame, Award, LineChart, BarChart3, 
  PieChart, Activity, Sparkles, AlertCircle, Info 
} from 'lucide-react';

interface AnalyticsTabProps {
  user: UserProfile;
  tasks: Task[];
}

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({
  user,
  tasks
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; label: string; value: string } | null>(null);

  // Derive simple statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed);
  const completedCount = completedTasks.length;
  const pendingCount = totalTasks - completedCount;
  const completionRate = totalTasks > 0 ? (completedCount / totalTasks) * 100 : 0;

  // Let's create realistic trend data points based on user's current metrics
  // Simulated historic tracking points (last 7 days)
  const daysOfTasks = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toLocaleDateString(undefined, { weekday: 'short' });
  });

  // Scale data dynamically to fit active user values
  const xpTrend = [
    Math.round(user.xp * 0.15), 
    Math.round(user.xp * 0.35), 
    Math.round(user.xp * 0.40), 
    Math.round(user.xp * 0.60), 
    Math.round(user.xp * 0.70), 
    Math.round(user.xp * 0.85), 
    user.xp
  ];

  const scoreTrend = [
    Math.max(10, Math.round(user.executionScore - 15)),
    Math.max(15, Math.round(user.executionScore - 10)),
    Math.max(20, Math.round(user.executionScore - 5)),
    Math.max(15, Math.round(user.executionScore - 7)),
    Math.max(25, Math.round(user.executionScore + 2)),
    Math.max(30, Math.round(user.executionScore - 2)),
    user.executionScore
  ];

  // SVG dimensions for trend charts
  const width = 500;
  const height = 150;
  const padding = 20;

  // Helper to map data index to SVG points
  const getPointsStr = (trendData: number[], maxVal: number) => {
    const max = maxVal || 100;
    return trendData.map((val, idx) => {
      const x = padding + (idx * (width - padding * 2)) / (trendData.length - 1);
      const y = height - padding - (val * (height - padding * 2)) / max;
      return `${x},${y}`;
    }).join(' ');
  };

  const xpMax = Math.max(...xpTrend, 100);
  const xpPoints = getPointsStr(xpTrend, xpMax);

  const scoreMax = 100;
  const scorePoints = getPointsStr(scoreTrend, scoreMax);

  // Status index copy blocks
  const getPremiumAnalyticsAlert = () => {
    if (!user.premium) {
      return (
        <div className="border border-pink-500/20 bg-gradient-to-r from-pink-500/5 to-purple-500/5 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 mt-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-pink-500/10 rounded-xl text-pink-400">
              <Sparkles className="w-5 h-5 text-brand-pink fill-brand-pink/20" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Unlock Deep Analytics Layer</h4>
              <p className="text-xs text-gray-400 mt-0.5">
                Secure executive-tier cohort comparison indices, weekly breakdown analytics, and custom feedback algorithms.
              </p>
            </div>
          </div>
          <button 
            onClick={() => {
              // Smooth scroll to profile tab or trigger premium
              const profileTabBtn = document.getElementById('tab-btn-profile');
              if (profileTabBtn) profileTabBtn.click();
            }}
            className="py-2 px-4 bg-pink-500/20 hover:bg-pink-500/30 border border-pink-500/40 text-pink-300 rounded-xl text-xs font-semibold tracking-wide flex items-center gap-1 transition-all cursor-pointer"
          >
            Go to Premium Hub
          </button>
        </div>
      );
    }
    return (
      <div className="border border-brand-cyan/20 bg-gradient-to-r from-brand-cyan/5 to-brand-purple/5 p-5 rounded-2xl flex items-start gap-3 mt-6">
        <div className="p-2 bg-brand-cyan/10 rounded-xl text-brand-cyan">
          <Award className="w-5 h-5 text-brand-cyan" />
        </div>
        <div>
          <span className="text-[10px] font-mono uppercase bg-brand-cyan/20 text-[#00f5d4] px-1 rounded">PREMIUM ENHANCED</span>
          <h4 className="text-sm font-semibold text-white mt-1">Telemetry Layer Enhanced</h4>
          <p className="text-xs text-gray-400 mt-0.5">
            Cohort indices indicate your completion speed is 34% faster than typical executives. Excellent performance buffers established.
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6" id="analytics-tab">

      {/* Analytics KPI bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl">
          <span className="text-[10px] font-mono text-gray-500 uppercase">COMPLETION RATE</span>
          <div className="flex justify-between items-baseline mt-1">
            <h3 className="text-2xl font-semibold font-display text-white">{Math.round(completionRate)}%</h3>
            <span className="text-xs font-mono text-emerald-400">Stable ratio</span>
          </div>
          <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden mt-3">
            <div className="bg-emerald-400 h-full" style={{ width: `${completionRate}%` }} />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl">
          <span className="text-[10px] font-mono text-gray-500 uppercase">ACTIVE MULTIPLIER</span>
          <div className="flex justify-between items-baseline mt-1">
            <h3 className="text-2xl font-semibold font-display text-white">{user.streak} Days</h3>
            <span className="text-xs font-mono text-emerald-400">Velocity multiplier</span>
          </div>
          <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden mt-3">
            <div className="bg-brand-pink h-full animate-pulse" style={{ width: `${Math.min(100, user.streak * 10)}%` }} />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl">
          <span className="text-[10px] font-mono text-gray-500 uppercase">DISCIPLINE POINTS</span>
          <div className="flex justify-between items-baseline mt-1">
            <h3 className="text-2xl font-semibold font-display text-white">{user.xp} XP</h3>
            <span className="text-xs font-mono text-[#00f5d4]">+25 XP today</span>
          </div>
          <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden mt-3">
            <div className="bg-brand-purple h-full" style={{ width: `${Math.min(100, user.xp / 10)}%` }} />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl">
          <span className="text-[10px] font-mono text-gray-500 uppercase">INDEX COMPLIANCE</span>
          <div className="flex justify-between items-baseline mt-1">
            <h3 className="text-2xl font-semibold font-display text-white">{user.executionScore} / 100</h3>
            <span className="text-xs font-mono text-gray-300">Target: {user.executionScore >= 80 ? 'Optimal' : '80+'}</span>
          </div>
          <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden mt-3">
            <div className="bg-gradient-to-r from-brand-purple to-brand-cyan h-full" style={{ width: `${user.executionScore}%` }} />
          </div>
        </div>
      </div>

      {/* Grid: SVG Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Interactive XP Accumulation */}
        <div className="glass-panel p-6 rounded-2xl relative">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-mono tracking-wider font-semibold text-gray-400 uppercase">Discipline Velocity Index (XP)</h3>
              <p className="text-xs text-gray-500 mt-0.5">Discipline points earned over consecutive 7-day windows</p>
            </div>
            <Activity className="w-4 h-4 text-brand-purple" />
          </div>

          <div className="relative mt-2">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
              {/* Grid Lines */}
              <line x1={padding} y1={height/2} x2={width-padding} y2={height/2} stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
              <line x1={padding} y1={padding} x2={width-padding} y2={padding} stroke="rgba(255,255,255,0.03)" />
              <line x1={padding} y1={height-padding} x2={width-padding} y2={height-padding} stroke="rgba(255,255,255,0.1)" />

              {/* Gradient defs */}
              <defs>
                <linearGradient id="xpGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#9d4edd" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#4361ee" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Area path representing filled growth */}
              <path 
                d={`M ${padding},${height - padding} L ${xpPoints} L ${width - padding},${height - padding} Z`}
                fill="url(#xpGrad)"
              />

              {/* Trend line path */}
              <path 
                d={`M ${xpPoints}`} 
                fill="none" 
                stroke="#9d4edd" 
                strokeWidth="2" 
                strokeLinecap="round"
              />

              {/* Active data dots */}
              {xpTrend.map((val, idx) => {
                const x = padding + (idx * (width - padding * 2)) / (xpTrend.length - 1);
                const y = height - padding - (val * (height - padding * 2)) / xpMax;
                return (
                  <circle 
                    key={idx}
                    cx={x} 
                    cy={y} 
                    r="4.5" 
                    fill="#00f5d4" 
                    stroke="#0f172a" 
                    strokeWidth="1.5"
                    className="cursor-pointer hover:scale-150 transition-transform duration-200"
                    onMouseEnter={() => setHoveredPoint({ x, y, label: `Day: ${daysOfTasks[idx]}`, value: `${val} XP` })}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                );
              })}
            </svg>

            {/* Simulated tooltips */}
            {hoveredPoint && (
              <div 
                className="absolute bg-slate-950 border border-white/10 rounded px-2 py-1 text-[10px] text-white z-50 pointer-events-none transform -translate-x-1/2 -translate-y-8"
                style={{ left: `${(hoveredPoint.x / width) * 100}%`, top: `${(hoveredPoint.y / height) * 100}%` }}
              >
                <span className="font-semibold block">{hoveredPoint.label}</span>
                <span className="text-brand-cyan">{hoveredPoint.value}</span>
              </div>
            )}
          </div>

          <div className="flex justify-between text-[10px] font-mono text-gray-500 mt-2 px-4">
            {daysOfTasks.map((d, i) => (
              <span key={i}>{d}</span>
            ))}
          </div>
        </div>

        {/* Chart 2: Interactive Execution Score Trend */}
        <div className="glass-panel p-6 rounded-2xl relative">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-mono tracking-wider font-semibold text-gray-400 uppercase">Execution Index Tracking</h3>
              <p className="text-xs text-gray-500 mt-0.5">Score progression over consecutive days (Daily Compliance %)</p>
            </div>
            <TrendingUp className="w-4 h-4 text-brand-pink" />
          </div>

          <div className="relative mt-2">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
              <line x1={padding} y1={height/2} x2={width-padding} y2={height/2} stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
              <line x1={padding} y1={padding} x2={width-padding} y2={padding} stroke="rgba(255,255,255,0.03)" />
              <line x1={padding} y1={height-padding} x2={width-padding} y2={height-padding} stroke="rgba(255,255,255,0.1)" />

              <defs>
                <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ff007f" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#ff007f" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              <path 
                d={`M ${padding},${height - padding} L ${scorePoints} L ${width - padding},${height - padding} Z`}
                fill="url(#scoreGrad)"
              />

              <path 
                d={`M ${scorePoints}`} 
                fill="none" 
                stroke="#ff007f" 
                strokeWidth="2" 
                strokeLinecap="round"
              />

              {scoreTrend.map((val, idx) => {
                const x = padding + (idx * (width - padding * 2)) / (scoreTrend.length - 1);
                const y = height - padding - (val * (height - padding * 2)) / scoreMax;
                return (
                  <circle 
                    key={idx}
                    cx={x} 
                    cy={y} 
                    r="4.5" 
                    fill="#9d4edd" 
                    stroke="#0f172a" 
                    strokeWidth="1.5"
                    className="cursor-pointer hover:scale-150 transition-transform duration-200"
                    onMouseEnter={() => setHoveredPoint({ x, y, label: `Day: ${daysOfTasks[idx]}`, value: `Compliance: ${val}%` })}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                );
              })}
            </svg>
          </div>

          <div className="flex justify-between text-[10px] font-mono text-gray-500 mt-2 px-4">
            {daysOfTasks.map((d, i) => (
              <span key={i}>{d}</span>
            ))}
          </div>
        </div>

      </div>

      {/* Task analytics summary indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-5 rounded-2xl col-span-1 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-brand-cyan mb-2">
            <PieChart className="w-5 h-5 text-brand-cyan" />
            <span className="text-xs font-mono font-bold tracking-wider uppercase">Active Allocation</span>
          </div>
          
          <div className="space-y-3 my-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400 flex items-center gap-2">
                <span className="w-2.5 h-1.5 rounded-full bg-emerald-400" /> Secure complete tasks
              </span>
              <span className="text-white font-mono">{completedCount} tasks</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400 flex items-center gap-2">
                <span className="w-2.5 h-1.5 rounded-full bg-brand-pink" /> Pending tasks
              </span>
              <span className="text-white font-mono">{pendingCount} tasks</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400 flex items-center gap-2">
                <span className="w-2.5 h-1.5 rounded-full bg-gray-600" /> Cumulative total
              </span>
              <span className="text-white font-mono">{totalTasks} tasks</span>
            </div>
          </div>

          <div className="text-[10px] text-gray-500 border-t border-white/5 pt-2 mt-2 font-mono uppercase">
            Ratio: {completionRate.toFixed(1)}% complete
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl col-span-2 flex flex-col justify-between bg-gradient-to-br from-indigo-950/20 to-slate-950/20 text-gray-300">
          <div>
            <div className="flex items-center gap-1.5 text-brand-purple mb-2">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-mono tracking-wider font-semibold uppercase">Tactical Productivity Verdict</span>
            </div>
            <p className="text-sm text-gray-300 font-sans leading-relaxed">
              Your active completion compliance of <span className="text-brand-cyan font-bold">{Math.round(completionRate)}%</span> represents 
              {completionRate >= 80 ? ' superior operational discipline. Core indicators suggest you keep tasks small and fast.' : 
               completionRate >= 50 ? ' modular progression. Complete pending tasks immediately to shield against active streak dissipation.' : 
               ' an execution restart opportunity. Isolate 1 quick task and complete it now to regain positive momentum.'}
            </p>
          </div>

          <p className="text-xs text-gray-400 font-mono italic mt-4">
            System status: Analytics fully synchronized with Local Firestore simulation indices.
          </p>
        </div>
      </div>

      {getPremiumAnalyticsAlert()}

    </div>
  );
};
