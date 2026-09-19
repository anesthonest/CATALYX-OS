import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Task } from '../types';
import { 
  Plus, Check, Trash2, Calendar, ClipboardList, 
  Sparkles, CheckCircle2, ChevronRight, Zap
} from 'lucide-react';

interface TasksTabProps {
  tasks: Task[];
  onAddTask: (text: string) => void;
  onCompleteTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  username: string;
}

export const TasksTab: React.FC<TasksTabProps> = ({
  tasks,
  onAddTask,
  onCompleteTask,
  onDeleteTask,
  username
}) => {
  const [newText, setNewText] = useState('');
  const [showXPToast, setShowXPToast] = useState<{ show: boolean; msg: string; color: string }>({
    show: false,
    msg: '',
    color: ''
  });

  const triggerXPToast = (msg: string, color: string) => {
    setShowXPToast({ show: true, msg, color });
    setTimeout(() => {
      setShowXPToast(prev => ({ ...prev, show: false }));
    }, 2800);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;
    onAddTask(newText.trim());
    setNewText('');
    triggerXPToast('+5 XP: Objective Appended', 'text-brand-purple fill-brand-purple/20');
  };

  const handleComplete = (id: string) => {
    onCompleteTask(id);
    triggerXPToast('+20 XP: Micro Sprints Conquered!', 'text-brand-cyan fill-brand-[#00f5d4]/20');
  };

  const pendingTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  return (
    <div className="space-y-6" id="tasks-tab">
      
      {/* Floating XP Toast feedback */}
      <AnimatePresence>
        {showXPToast.show && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-6 right-6 md:right-12 z-50 glass-panel-heavy py-3 px-5 rounded-xl flex items-center gap-3 border border-brand-cyan/20 pointer-events-none shadow-2xl`}
          >
            <div className="p-1 px-2 rounded bg-brand-cyan/10 border border-brand-cyan/20 text-[#00f5d4] text-xs font-mono font-black">
              TELEMETRY UPDATE
            </div>
            <span className="text-sm font-semibold text-white tracking-tight flex items-center gap-1.5 font-display">
              <Zap className="w-4 h-4 text-brand-cyan fill-brand-cyan" />
              {showXPToast.msg}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Create task panel */}
        <div className="glass-panel p-6 rounded-2xl h-fit">
          <div className="flex items-center gap-2 mb-4">
            <ClipboardList className="w-5 h-5 text-brand-purple" />
            <span className="text-sm font-mono tracking-wider font-semibold text-gray-400">PLAN NEW EXECUTION</span>
          </div>
          <h2 className="text-xl font-display font-medium text-white mb-2">Create Objective</h2>
          <p className="text-xs text-gray-400 mb-4 leading-normal">
            Break down your work into clear milestones. Each appended objective rewards <span className="text-brand-purple font-mono font-semibold">+5 XP</span>, and completion awards <span className="text-brand-cyan font-mono font-semibold">+20 XP</span>.
          </p>

          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono text-gray-400 uppercase mb-1.5">OBJECTIVE DESCRIPTION</label>
              <textarea
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                placeholder="Analyze core VM logs or draft outline..."
                className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-brand-purple/50 focus:ring-1 focus:ring-brand-purple/50 transition-all h-28 resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-brand-purple to-brand-indigo hover:from-brand-purple/95 hover:to-brand-indigo/95 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-[0.98] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              COMMIT OBJECTIVE
            </button>
          </form>

          <div className="border-t border-white/5 mt-6 pt-4 space-y-2">
            <div className="flex justify-between text-xs font-mono text-gray-500">
              <span>MULTIPLERS IN-BUILDS:</span>
              <span>100% OFF-LINE SAFE</span>
            </div>
          </div>
        </div>

        {/* Right Side: Task Active and Completed lists */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Pending Objectives List */}
          <div className="glass-panel p-6 rounded-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-display font-medium text-white flex items-center gap-2">
                <span className="w-2.5 h-1.5 rounded-full bg-brand-pink" />
                Active Objectives Planner ({pendingTasks.length})
              </h3>
              <span className="text-xs font-mono text-gray-400 uppercase">Aura Active</span>
            </div>

            {pendingTasks.length === 0 ? (
              <div className="py-12 text-center border border-dashed border-white/5 rounded-xl bg-white/[0.01]">
                <CheckCircle2 className="w-10 h-10 text-brand-purple mx-auto mb-3 opacity-40" />
                <h4 className="text-sm font-semibold text-gray-300">No pending objectives found</h4>
                <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                  All active parameters are clear. Great job executing! Pin some new goals on the left panel.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence initial={false}>
                  {pendingTasks.map((task) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="p-4 bg-slate-900/40 hover:bg-slate-900/60 border border-white/5 rounded-xl flex items-center justify-between gap-4 group transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => handleComplete(task.id)}
                          className="mt-0.5 w-5.5 h-5.5 rounded-lg border border-white/20 hover:border-brand-cyan bg-white/5 hover:bg-brand-cyan/10 flex items-center justify-center transition-colors group/btn cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5 text-transparent group-hover/btn:text-brand-cyan transition-colors" />
                        </button>
                        <div>
                          <p className="text-sm text-gray-200 pr-4 font-sans leading-relaxed">{task.text}</p>
                          <span className="text-[10px] font-mono text-gray-500 block mt-1.5 flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-brand-pink" />
                            Created: {new Date(task.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => onDeleteTask(task.id)}
                        className="text-gray-500 hover:text-brand-pink p-2 hover:bg-white/5 rounded-lg transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Completed Objectives List */}
          <div className="glass-panel p-6 rounded-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-display font-medium text-white flex items-center gap-2">
                <span className="w-2.5 h-1.5 rounded-full bg-brand-cyan" />
                Durable Log archives ({completedTasks.length})
              </h3>
              <span className="text-xs font-mono text-gray-400 uppercase">Execution Secured</span>
            </div>

            {completedTasks.length === 0 ? (
              <p className="text-xs text-gray-500 py-6 text-center italic">
                Archives empty. Secure your first active objective to stream telemetry logs.
              </p>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {completedTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-3.5 bg-black/20 border border-white/5 rounded-xl flex items-center justify-between gap-4 opacity-75"
                  >
                    <div>
                      <span className="text-sm line-through text-gray-400 font-sans leading-relaxed">{task.text}</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] font-semibold font-mono uppercase text-brand-cyan bg-brand-cyan/10 border border-brand-cyan/20 px-1 rounded flex items-center gap-0.5">
                          SECURED +20 XP
                        </span>
                        {task.completedAt && (
                          <span className="text-[9px] font-mono text-gray-500">
                            Completed: {new Date(task.completedAt).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => onDeleteTask(task.id)}
                      className="text-gray-600 hover:text-brand-pink p-1.5 hover:bg-white/5 rounded transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
