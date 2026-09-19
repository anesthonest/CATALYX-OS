import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, RotateCcw, Volume2, Sparkles, Trophy, Flame, Brain, CheckCircle } from 'lucide-react';
import { dbService } from '../firebase';
import { FocusBlock } from '../types';

interface FocusCabinProps {
  userId: string;
  onFocusLogged: () => void;
}

export const FocusCabin: React.FC<FocusCabinProps> = ({ userId, onFocusLogged }) => {
  const [timerMinutes, setTimerMinutes] = useState(25);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [soundscape, setSoundscape] = useState('Interstellar Space');
  const [efficiency, setEfficiency] = useState(5);
  const [taskName, setTaskName] = useState('');
  const [logs, setLogs] = useState<FocusBlock[]>([]);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadFocusLogs();
  }, [userId]);

  const loadFocusLogs = async () => {
    const data = await dbService.getFocusBlocks(userId);
    setLogs(data);
  };

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(timerMinutes * 60);
  };

  const changePreset = (minutes: number) => {
    setIsRunning(false);
    setTimerMinutes(minutes);
    setTimeLeft(minutes * 60);
  };

  const handleTimerComplete = () => {
    setShowCompletionModal(true);
  };

  const saveFocusBlock = async () => {
    const finalTask = taskName.trim() || 'General Execution Stream';
    await dbService.addFocusBlock(userId, finalTask, timerMinutes, efficiency, soundscape);
    setTaskName('');
    setShowCompletionModal(false);
    
    // Trigger notification callback from App
    onFocusLogged();
    loadFocusLogs();
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const soundscapes = [
    { name: 'Interstellar Space', emoji: '🌌', desc: 'Slight white noise drone' },
    { name: 'Cosmic Rainstorm', emoji: '🌧️', desc: 'Atmospheric raindrops' },
    { name: 'Deep Space Organics', emoji: '🧘', desc: 'Binaural resonance' },
    { name: 'Off-grid Synthesizers', emoji: '🎹', desc: 'Low fidelity waves' }
  ];

  return (
    <div className="glass-panel p-6 rounded-2xl relative overflow-hidden" id="focus-cabin">
      <div className="absolute top-0 right-0 w-80 h-80 bg-brand-cyan/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

      <div className="relative z-10 space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <span className="px-2 py-0.5 text-[10px] font-mono tracking-widest text-[#00f5d4] border border-[#00f5d4]/20 bg-[#00f5d4]/5 rounded-full uppercase">
              MODULE 10: FOCUS CABIN
            </span>
            <h2 className="text-2xl font-display font-semibold text-white mt-2 flex items-center gap-2">
              <Brain className="w-5 h-5 text-brand-cyan" />
              Deep Focus Engine
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Lock in single-task operational metrics with high-efficiency soundscapes.
            </p>
          </div>

          <div className="w-12 h-12 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center">
            <Flame className="w-6 h-6 text-pink-500 animate-pulse" />
          </div>
        </div>

        {/* Dynamic Timer Stage */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          
          <div className="md:col-span-3 flex flex-col items-center justify-center bg-black/40 border border-white/5 rounded-2xl p-8 relative overflow-hidden">
            {/* Pulsing state ring */}
            <div className={`absolute w-64 h-64 border border-brand-cyan/10 rounded-full transition-all duration-1000 ${isRunning ? 'scale-110 opacity-30 animate-ping' : 'scale-100 opacity-10'}`} />
            
            <div className="text-6xl md:text-7xl font-mono text-white font-black tracking-tight select-none relative z-10">
              {formatTime(timeLeft)}
            </div>
            
            <div className="text-xs text-brand-cyan/75 font-mono uppercase tracking-widest mt-2 relative z-10">
              Active: {taskName.trim() || 'General Sprint Pipeline'}
            </div>

            {/* Quick Presets */}
            <div className="flex gap-2.5 mt-6 relative z-10">
              {[15, 25, 45, 60].map((m) => (
                <button
                  key={m}
                  onClick={() => changePreset(m)}
                  className={`px-3 py-1 text-xs font-mono border rounded-lg transition-colors cursor-pointer ${timerMinutes === m ? 'bg-brand-cyan/10 border-brand-cyan text-brand-cyan' : 'bg-transparent border-white/10 text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                  {m}m
                </button>
              ))}
            </div>

            {/* Execution Controls */}
            <div className="flex items-center gap-4 mt-6 relative z-10">
              <button
                onClick={toggleTimer}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer ${isRunning ? 'bg-amber-500 text-slate-950' : 'bg-gradient-to-r from-brand-purple to-brand-cyan text-slate-950 font-bold'}`}
              >
                {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-slate-950" />}
              </button>
              <button
                onClick={resetTimer}
                className="p-3 bg-white/5 border border-white/5 hover:bg-white/10 text-gray-300 rounded-full transition-colors cursor-pointer"
                title="Reset Focus Timer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Soundscapes Picker */}
          <div className="md:col-span-2 space-y-4">
            <div className="bg-slate-950/40 p-4 border border-white/5 rounded-2xl h-full flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-mono text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-brand-cyan" />
                  Telemetry Soundscapes
                </h4>
                
                <div className="space-y-2">
                  {soundscapes.map((s) => (
                    <button
                      key={s.name}
                      onClick={() => setSoundscape(s.name)}
                      className={`w-full p-2.5 text-left rounded-xl border flex items-center gap-3 transition-colors text-xs cursor-pointer ${soundscape === s.name ? 'bg-brand-cyan/10 border-brand-cyan/20 text-brand-cyan' : 'bg-transparent border-white/5 text-gray-400 hover:bg-white/5 hover:text-white'}`}
                    >
                      <span className="text-xl">{s.emoji}</span>
                      <div>
                        <div className="font-semibold">{s.name}</div>
                        <div className="text-[10px] text-gray-500 font-mono">{s.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-white/5 pt-3 mt-4">
                <label className="block text-[10px] font-mono text-gray-500 uppercase mb-1.5">Active Target Task</label>
                <input
                  type="text"
                  placeholder="e.g. Refactoring database queries"
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-700 focus:outline-[#00f5d4] focus:outline-1 transition-all"
                />
              </div>
            </div>

          </div>
        </div>

        {/* Logs and previous sessions view */}
        <div className="border-t border-white/5 pt-4">
          <h4 className="text-xs font-mono text-gray-400 uppercase tracking-widest mb-3">Completed Deep Work Blocks ({logs.length})</h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {logs.slice(-3).reverse().map((log) => (
              <div key={log.id} className="p-3 bg-black/20 border border-white/5 rounded-xl text-xs flex justify-between items-center">
                <div>
                  <span className="font-semibold text-slate-200 block truncate max-w-[150px]">{log.taskName}</span>
                  <span className="text-[10px] text-gray-500 font-mono block">{log.soundscape} • {log.durationMinutes}m</span>
                </div>
                <div className="flex gap-0.5 text-yellow-500">
                  {Array.from({ length: log.efficiencyRating }).map((_, i) => (
                    <Trophy key={i} className="w-3 h-3 fill-yellow-500" />
                  ))}
                </div>
              </div>
            ))}
            {logs.length === 0 && (
              <p className="text-xs text-gray-500 italic py-2 col-span-3">No focus sessions completed. Unlock Focus Pioneer achievement by finishing a session!</p>
            )}
          </div>
        </div>
      </div>

      {/* Completion Dialog Overlay */}
      <AnimatePresence>
        {showCompletionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="w-full max-w-sm glass-panel-heavy p-6 rounded-3xl text-center space-y-4"
            >
              <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto" />
              <h3 className="text-xl font-display font-bold text-white">Focus Cycle Conquered!</h3>
              <p className="text-xs text-gray-300">
                Strategic focus loop successfully dispatched. Rate your efficiency level to secure your profile XP.
              </p>

              {/* Rating */}
              <div className="flex justify-center gap-1.5 py-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setEfficiency(star)}
                    className="p-1 hover:scale-110 active:scale-95 transition-transform"
                  >
                    <Trophy className={`w-6 h-6 ${star <= efficiency ? 'text-yellow-500 fill-yellow-500' : 'text-gray-600'}`} />
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowCompletionModal(false)}
                  className="flex-1 py-2 bg-white/5 border border-white/5 hover:bg-white/10 rounded-xl text-xs text-gray-400"
                >
                  Discard
                </button>
                <button
                  type="button"
                  onClick={saveFocusBlock}
                  className="flex-1 py-2 bg-gradient-to-r from-brand-purple to-brand-cyan text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Log Focus block (+25 XP)
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
