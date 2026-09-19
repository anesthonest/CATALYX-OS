import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Target, Plus, Trash2, Calendar, Layout, Sparkles, CheckSquare, ListTodo, ShieldAlert, Cpu } from 'lucide-react';
import { dbService } from '../firebase';
import { Goal } from '../types';

interface GoalCenterProps {
  userId: string;
  onGoalUpdated: () => void;
}

export const GoalCenter: React.FC<GoalCenterProps> = ({ userId, onGoalUpdated }) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [goalType, setGoalType] = useState<'short_term' | 'long_term'>('short_term');
  const [isExpanding, setIsExpanding] = useState(false);

  // V5 AI Autonomous Planning States
  const [isAiExpanding, setIsAiExpanding] = useState(false);
  const [aiPromptText, setAiPromptText] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiSuccessMessage, setAiSuccessMessage] = useState('');

  useEffect(() => {
    loadGoals();
  }, [userId]);

  const loadGoals = async () => {
    const list = await dbService.getGoals(userId);
    setGoals(list);
  };

  const handleAddNewGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !targetDate) return;
    const items = await dbService.addGoal(userId, title.trim(), desc.trim(), targetDate, goalType);
    setGoals(items);
    setTitle('');
    setDesc('');
    setTargetDate('');
    setIsExpanding(false);
    onGoalUpdated(); // report to App
  };

  const handleTriggerAiPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPromptText.trim() || isAiGenerating) return;

    setIsAiGenerating(true);
    setAiSuccessMessage('');
    try {
      const res = await fetch('/api/autonomous-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: aiPromptText.trim(),
          username: 'Executor'
        })
      });

      const designPlan = await res.json();
      
      // Calculate active compliance deadline: 3 weeks out
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 21);
      const formattedDate = futureDate.toISOString().split('T')[0];

      // 1. Establish Goal Target
      const updatedGoals = await dbService.addGoal(
        userId, 
        designPlan.goalTitle, 
        designPlan.goalDescription, 
        formattedDate, 
        'short_term'
      );
      setGoals(updatedGoals);

      // 2. Establish High-level Project
      await dbService.addProject(
        userId, 
        designPlan.projectTitle, 
        designPlan.projectDescription
      );

      // 3. Dispatch Tasks Checklist
      for (const taskStr of designPlan.tasks) {
        await dbService.addTask(userId, taskStr, 'high', 'work', formattedDate);
      }

      setAiSuccessMessage(`Consensus synchronized! Autonomous Roadmap Generated: Created strategic goal "${designPlan.goalTitle}", matching project "${designPlan.projectTitle}", and appended 4 active prioritized tasks to your task system (+15 XP awarded).`);
      setAiPromptText('');
      setTimeout(() => {
        setIsAiExpanding(false);
        setAiSuccessMessage('');
      }, 8000);
      onGoalUpdated();
    } catch (err) {
      console.error(err);
      setAiSuccessMessage('Plan dispatcher momentarily desynchronized. Ensure connectivity before pings.');
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleSliderChange = async (goalId: string, progress: number) => {
    const status = progress >= 100 ? 'completed' : 'active';
    const items = await dbService.updateGoalProgress(userId, goalId, progress, status);
    setGoals(items);
    onGoalUpdated();
  };

  const handleDeleteGoal = async (goalId: string) => {
    const items = await dbService.deleteGoal(userId, goalId);
    setGoals(items);
    onGoalUpdated();
  };

  return (
    <div className="glass-panel p-6 rounded-2xl relative overflow-hidden" id="goal-center">
      <div className="absolute top-0 right-0 w-80 h-80 bg-brand-purple/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

      <div className="relative z-10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <span className="px-2 py-0.5 text-[10px] font-mono tracking-widest text-[#9d4edd] border border-[#9d4edd]/20 bg-[#9d4edd]/5 rounded-full uppercase">
              MODULE 3: STRATEGIC GOAL SYSTEM
            </span>
            <h2 className="text-2xl font-display font-semibold text-white mt-1.5 flex items-center gap-2">
              <Target className="w-5.5 h-5.5 text-brand-purple" />
              Strategic Goal Center
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Align tactical sprints with high-level corporate objectives.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setIsExpanding(!isExpanding);
                setIsAiExpanding(false);
              }}
              className="py-1.5 px-3 bg-brand-purple/10 border border-brand-purple/30 hover:bg-brand-purple/20 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Establish Goal
            </button>
            <button
              onClick={() => {
                setIsAiExpanding(!isAiExpanding);
                setIsExpanding(false);
              }}
              className="py-1.5 px-3 bg-brand-cyan/10 border border-brand-cyan/30 hover:bg-brand-cyan/20 text-brand-cyan rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Cpu className="w-3.5 h-3.5" />
              ⚡ AI Plan Generator
            </button>
          </div>
        </div>

        {/* Collapsible Goals forms */}
        <AnimatePresence>
          {isExpanding && (
            <motion.form
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              onSubmit={handleAddNewGoal}
              className="bg-black/30 border border-white/5 rounded-2xl p-4 space-y-4 overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono text-gray-400 uppercase mb-1">GOAL TARGET TITLE</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Build enterprise API v2"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-4 py-2 text-xs text-gray-200 placeholder-gray-700 focus:outline-[#9d4edd] focus:outline-1 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-gray-400 uppercase mb-1">TARGET FULFILLMENT DATE</label>
                  <input
                    type="date"
                    required
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-4 py-2 text-xs text-gray-200 focus:outline-[#9d4edd] focus:outline-1 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-gray-400 uppercase mb-1">GOAL MISSION DESCRIPTION</label>
                <textarea
                  placeholder="Enter strategic parameters and tactical alignment guidelines..."
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-4 py-2 text-xs text-gray-200 placeholder-gray-700 focus:outline-[#9d4edd] focus:outline-1 transition-all resize-none h-16"
                />
              </div>

              <div className="flex justify-between items-center bg-slate-950/50 p-2.5 rounded-xl border border-white/5">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setGoalType('short_term')}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-mono border uppercase transition-colors cursor-pointer ${goalType === 'short_term' ? 'bg-brand-purple/10 border-brand-purple text-brand-purple' : 'bg-transparent border-transparent text-gray-500 hover:text-white'}`}
                  >
                    Short Term (Weeks)
                  </button>
                  <button
                    type="button"
                    onClick={() => setGoalType('long_term')}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-mono border uppercase transition-colors cursor-pointer ${goalType === 'long_term' ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' : 'bg-transparent border-transparent text-gray-500 hover:text-white'}`}
                  >
                    Long Term (Months)
                  </button>
                </div>

                <button
                  type="submit"
                  className="py-1.5 px-4 bg-gradient-to-r from-brand-purple via-pink-600 to-brand-cyan text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Align System Goal (+15 XP)
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* V5 COLLAPSIBLE AI PLANS DISPATCHER */}
        <AnimatePresence>
          {isAiExpanding && (
            <motion.form
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              onSubmit={handleTriggerAiPlan}
              className="bg-slate-950/50 border border-brand-cyan/20 rounded-2xl p-4 space-y-4 overflow-hidden"
            >
              <div>
                <label className="block text-[10px] font-mono text-[#00f5d4] uppercase mb-1 tracking-wider">ENTER STRATEGIC AIM OBJECTIVE</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    disabled={isAiGenerating}
                    placeholder="e.g., Deploy secure blockchain payments module with sandbox test suite"
                    value={aiPromptText}
                    onChange={(e) => setAiPromptText(e.target.value)}
                    className="flex-1 bg-slate-950/80 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-gray-200 placeholder-gray-700 focus:outline-[#00f5d4] focus:outline-1 transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!aiPromptText.trim() || isAiGenerating}
                    className="py-2.5 px-4 bg-gradient-to-r from-brand-purple to-brand-cyan text-white hover:opacity-95 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-30"
                  >
                    {isAiGenerating ? (
                      <span className="flex items-center gap-1">
                        <Cpu className="w-3.5 h-3.5 animate-spin" /> Dispatching...
                      </span>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" /> Launch Autonomous Engine
                      </>
                    )}
                  </button>
                </div>
                <span className="text-[9px] text-gray-400 block mt-1.5">
                  Let the AI evaluate your goal, create a customized strategic Project, and auto-populate 4 high-priority actionable tasks.
                </span>
              </div>

              {aiSuccessMessage && (
                <div className="p-3 bg-brand-cyan/5 border border-brand-cyan/20 rounded-xl text-xs text-[#00f5d4] leading-relaxed font-mono">
                  {aiSuccessMessage}
                </div>
              )}
            </motion.form>
          )}
        </AnimatePresence>

        {/* Goals lists */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Short term goals */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-brand-purple" />
              Short-Term Sprints ({goals.filter(g => g.type === 'short_term').length})
            </h3>

            <div className="space-y-3 h-[250px] overflow-y-auto pr-1">
              {goals.filter(g => g.type === 'short_term').map((goal) => (
                <div key={goal.id} className="p-4 bg-black/20 border border-white/5 rounded-2xl space-y-3 relative overflow-hidden group">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className={`text-sm font-semibold tracking-tight text-white ${goal.status === 'completed' ? 'line-through opacity-55' : ''}`}>{goal.title}</h4>
                      <p className="text-[11px] text-gray-400 mt-0.5 leading-normal truncate max-w-[200px]">{goal.description || 'No strategic parameter specified.'}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="p-1 hover:bg-red-500/10 hover:text-red-400 text-gray-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] font-mono text-gray-400">
                      <span>Progress Percent: {goal.progress}%</span>
                      <span>Target: {new Date(goal.targetDate).toLocaleDateString()}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={goal.progress}
                      onChange={(e) => handleSliderChange(goal.id, parseInt(e.target.value))}
                      className="w-full accent-brand-purple cursor-pointer h-1 bg-slate-900 rounded-lg appearance-none"
                    />
                  </div>
                </div>
              ))}

              {goals.filter(g => g.type === 'short_term').length === 0 && (
                <p className="text-xs text-gray-500 italic py-4">No active short-term goals. Align your tactical execution now!</p>
              )}
            </div>
          </div>

          {/* Long term goals */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
              <Layout className="w-4 h-4 text-indigo-400" />
              Long-Term Visions ({goals.filter(g => g.type === 'long_term').length})
            </h3>

            <div className="space-y-3 h-[250px] overflow-y-auto pr-1">
              {goals.filter(g => g.type === 'long_term').map((goal) => (
                <div key={goal.id} className="p-4 bg-black/20 border border-white/5 rounded-2xl space-y-3 relative overflow-hidden group">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className={`text-sm font-semibold tracking-tight text-white ${goal.status === 'completed' ? 'line-through opacity-55' : ''}`}>{goal.title}</h4>
                      <p className="text-[11px] text-gray-400 mt-0.5 leading-normal truncate max-w-[200px]">{goal.description || 'No strategic parameter specified.'}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="p-1 hover:bg-red-500/10 hover:text-red-400 text-gray-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] font-mono text-gray-400">
                      <span>Progress Percent: {goal.progress}%</span>
                      <span>Target: {new Date(goal.targetDate).toLocaleDateString()}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={goal.progress}
                      onChange={(e) => handleSliderChange(goal.id, parseInt(e.target.value))}
                      className="w-full accent-indigo-500 cursor-pointer h-1 bg-slate-900 rounded-lg appearance-none"
                    />
                  </div>
                </div>
              ))}

              {goals.filter(g => g.type === 'long_term').length === 0 && (
                <p className="text-xs text-gray-500 italic py-4">No active long-term visions. Align your strategic growth today!</p>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};
