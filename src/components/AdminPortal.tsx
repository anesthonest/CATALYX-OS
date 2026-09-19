import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Database, RefreshCw, Zap, Award, Star, Settings } from 'lucide-react';
import { dbService } from '../firebase';
import { UserProfile } from '../types';

interface AdminPortalProps {
  user: UserProfile;
  onRefreshProfileAndSystem: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ user, onRefreshProfileAndSystem }) => {
  const [xp, setXp] = useState(user.xp);
  const [streak, setStreak] = useState(user.streak);
  const [isPremium, setIsPremium] = useState(user.premium);
  const [dbStatusMsg, setDbStatusMsg] = useState('');

  const handleUpdateUserMetrics = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dbService.setAdminMetrics(user.uid, xp, streak, isPremium);
      setDbStatusMsg('Executive performance variables overridden successfully!');
      setTimeout(() => setDbStatusMsg(''), 3000);
      onRefreshProfileAndSystem();
    } catch(err: any) {
      setDbStatusMsg('Error overriding profiles: ' + err.message);
    }
  };

  const handleDumpCaches = async () => {
    if (!window.confirm('WARNING: This will purge all active tasks, goals, focus blocks, and notifications for this simulation. Continue?')) {
      return;
    }
    await dbService.resetAllData(user.uid);
    setDbStatusMsg('Database registries successfully flushed. Default pipelines loaded.');
    setTimeout(() => setDbStatusMsg(''), 3000);
    onRefreshProfileAndSystem();
  };

  return (
    <div className="glass-panel p-6 rounded-2xl relative overflow-hidden" id="admin-portal">
      <div className="absolute top-0 right-0 w-80 h-80 bg-red-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

      <div className="relative z-10 space-y-6">
        <div>
          <span className="px-2 py-0.5 text-[10px] font-mono tracking-widest text-red-400 border border-red-500/25 bg-red-500/5 rounded-full uppercase">
            ADMIN REGULATED PANEL (MODULE 16)
          </span>
          <h2 className="text-2xl font-display font-semibold text-white mt-1.5 flex items-center gap-2">
            <ShieldCheck className="w-5.5 h-5.5 text-red-400" />
            CATALYX Command Registry
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Synchronize, scale, and manipulate simulated core database indices on the fly.
          </p>
        </div>

        {dbStatusMsg && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-center text-xs text-red-400 font-mono">
            {dbStatusMsg}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Form manual manipulation */}
          <form onSubmit={handleUpdateUserMetrics} className="space-y-4 bg-slate-950/40 p-4 border border-white/5 rounded-xl">
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-1.5">
              <Settings className="w-4 h-4 text-brand-purple" />
              Force Override Performance Data
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-mono text-gray-400 uppercase mb-1">Set XP Points</label>
                <input
                  type="number"
                  value={xp}
                  onChange={(e) => setXp(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-[#9d4edd] focus:outline-1"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-gray-400 uppercase mb-1">Set Streaks (Days)</label>
                <input
                  type="number"
                  value={streak}
                  onChange={(e) => setStreak(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-[#9d4edd] focus:outline-1"
                />
              </div>
            </div>

            <div className="flex items-center justify-between py-2 border-t border-b border-white/5">
              <span className="text-xs text-gray-400">Unlock Enterprise Premium Plan</span>
              <button
                type="button"
                onClick={() => setIsPremium(!isPremium)}
                className={`py-1 px-3 rounded-lg text-[10px] font-mono uppercase font-black tracking-wider transition-all border ${isPremium ? 'bg-gradient-to-r from-pink-500 to-yellow-500 border-pink-400 text-slate-950' : 'bg-transparent border-white/10 text-gray-500'}`}
              >
                {isPremium ? '👑 PREMIUM TRUE' : 'PREMIUM FALSE'}
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold hover:opacity-90 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              Override Environmental State
            </button>
          </form>

          {/* Database flushing controls */}
          <div className="space-y-4 bg-slate-950/40 p-4 border border-white/5 rounded-xl flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-1.5 mb-2">
                <Database className="w-4 h-4 text-red-400" />
                Sanitation Database Purge
              </h3>
              <p className="text-xs text-gray-400 leading-normal">
                Executing a purge resets the simulated local storage schema, re-injecting fresh base-level configurations for Tasks, Goals, Projects, and Focus Logs.
              </p>
            </div>

            <button
              type="button"
              onClick={handleDumpCaches}
              className="w-full py-2.5 bg-red-950/40 border border-red-500/30 hover:bg-red-500/25 text-red-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 animate-spin-slow" />
              Atomic Purge Database Registers
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
