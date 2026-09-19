import React from 'react';
import { motion } from 'motion/react';
import { UserProfile } from '../types';
import { Trophy, Award, Zap, TrendingUp, Sparkles, Flame } from 'lucide-react';

interface LeaderboardTabProps {
  leaderboard: UserProfile[];
}

export const LeaderboardTab: React.FC<LeaderboardTabProps> = ({
  leaderboard
}) => {

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return { emoji: '👑', color: 'text-amber-400 bg-amber-400/10 border-amber-400/20' };
      case 2:
        return { emoji: '🥈', color: 'text-slate-300 bg-slate-300/10 border-slate-300/20' };
      case 3:
        return { emoji: '🥉', color: 'text-amber-600 bg-amber-600/10 border-amber-600/20' };
      default:
        return { emoji: `${rank}`, color: 'text-gray-400 bg-white/5 border-white/5' };
    }
  };

  const getScoreStatusLabel = (score: number) => {
    if (score >= 80) return 'Elite Executor';
    if (score >= 60) return 'High Performer';
    if (score >= 30) return 'Building Consistency';
    return 'Low Momentum';
  };

  return (
    <div className="space-y-6" id="leaderboard-tab">
      
      {/* Leaderboard Header Cards */}
      <div className="glass-panel p-6 rounded-2xl relative overflow-hidden bg-gradient-to-br from-indigo-950/10 to-slate-950/35">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-cyan/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <span className="px-2 py-0.5 text-[10px] font-mono tracking-widest text-[#00f5d4] border border-[#00f5d4]/20 bg-[#00f5d4]/5 rounded">
              GLOBAL PLATFORM RANKINGS
            </span>
            <h2 className="text-2xl md:text-3xl font-display font-semibold text-white mt-2">Active Leaderboard</h2>
            <p className="text-xs text-gray-400 mt-1 max-w-xl">
              Leaderboard represents top active executives ranked by Execution Score Discipline metrics.
            </p>
          </div>

          <div className="p-3 bg-white/5 border border-white/5 rounded-xl flex items-center gap-2.5">
            <Trophy className="w-5 h-5 text-amber-400" />
            <div>
              <span className="text-[9px] font-mono text-gray-500 uppercase block">ACTIVE RECALCULATION</span>
              <span className="text-xs text-gray-300 font-semibold">100% Real-time synchronization</span>
            </div>
          </div>
        </div>
      </div>

      {/* Podium display if any */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {leaderboard.slice(0, 3).map((user, idx) => {
          const rankInfo = getRankBadge(idx + 1);
          return (
            <motion.div
              key={user.uid}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.4 }}
              className={`glass-panel p-5 rounded-2xl flex flex-col justify-between relative border ${
                idx === 0 ? 'border-amber-400/30 bg-amber-400/[0.02]' : 'border-white/5'
              }`}
            >
              <div className="absolute top-4 right-4 text-3xl select-none">
                {rankInfo.emoji}
              </div>

              <div>
                <span className="text-[10px] font-mono text-gray-500 uppercase block">RANK {idx + 1}</span>
                <h3 className="text-lg font-bold text-white mt-1 flex items-center gap-1">
                  {user.username}
                  {user.premium && <span className="text-xs">👑</span>}
                </h3>
                <span className="text-[10px] font-mono text-brand-purple mt-0.5 block">Level {user.level} Compliance</span>
              </div>

              <div className="my-6">
                <span className="text-[10px] font-mono text-gray-500 block uppercase">EXECUTION INDEX</span>
                <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-purple to-brand-cyan">
                  {user.executionScore}%
                </div>
                <span className="text-xs text-emerald-400 font-medium block mt-1">{getScoreStatusLabel(user.executionScore)}</span>
              </div>

              <div className="flex items-center justify-between border-t border-white/5 pt-3 text-[10px] font-mono text-gray-400">
                <span className="flex items-center gap-0.5">
                  <Flame className="w-3.5 h-3.5 text-brand-pink fill-brand-pink/20" /> {user.streak}d Streak
                </span>
                <span>{user.xp} XP Earned</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Secondary list of remaining top users */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5 bg-slate-950/20 flex justify-between text-xs font-mono text-gray-500">
          <span>RANK / ACTIVE EXECUTIVE</span>
          <div className="flex gap-16 mr-6">
            <span>STREAK</span>
            <span>DISCIPLINE</span>
            <span>EXECUTION SCORE</span>
          </div>
        </div>

        <div className="divide-y divide-white/5">
          {leaderboard.length === 0 ? (
            <p className="text-xs text-gray-500 py-10 text-center italic">Leaderboard is empty.</p>
          ) : (
            leaderboard.map((item, index) => {
              const rankInfo = getRankBadge(index + 1);
              return (
                <div 
                  key={item.uid}
                  className="px-6 py-4 flex items-center justify-between hover:bg-white/[0.01] transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className={`w-8 h-8 rounded-lg border font-mono font-bold text-xs flex items-center justify-center shrink-0 ${rankInfo.color}`}>
                      {rankInfo.emoji}
                    </span>
                    <div>
                      <span className="text-sm font-semibold text-white flex items-center gap-1">
                        {item.username}
                        {item.premium && <span className="text-[10px] bg-pink-500/10 border border-pink-500/30 text-pink-400 px-1 rounded uppercase">PREM</span>}
                      </span>
                      <span className="text-[10px] font-mono text-gray-500 block uppercase">Level {item.level} executor</span>
                    </div>
                  </div>

                  <div className="flex gap-14 items-center mr-6">
                    {/* Streak */}
                    <div className="w-16 text-right sm:text-left">
                      <span className="text-xs font-semibold text-gray-200 font-mono flex items-center gap-0.5 justify-end sm:justify-start">
                        <Flame className="w-3.5 h-3.5 text-brand-pink fill-brand-pink/2" /> {item.streak}d
                      </span>
                    </div>

                    {/* XP */}
                    <div className="w-20 text-right sm:text-left hidden sm:block">
                      <span className="text-xs font-mono text-[#00f5d4]">{item.xp} <span className="text-[10px] text-gray-500">XP</span></span>
                    </div>

                    {/* Score */}
                    <div className="w-24 text-right">
                      <div className="text-sm font-bold text-white font-mono">{item.executionScore}%</div>
                      <span className="text-[9px] font-mono text-gray-500 uppercase block">{getScoreStatusLabel(item.executionScore)}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
};
