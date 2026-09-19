import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutGrid, Plus, Trash2, Folder, Milestone, Activity, Sparkles } from 'lucide-react';
import { dbService } from '../firebase';
import { Project } from '../types';

interface ProjectBoardProps {
  userId: string;
}

export const ProjectBoard: React.FC<ProjectBoardProps> = ({ userId }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isExpanding, setIsExpanding] = useState(false);

  useEffect(() => {
    loadProjects();
  }, [userId]);

  const loadProjects = async () => {
    const list = await dbService.getProjects(userId);
    setProjects(list);
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const items = await dbService.addProject(userId, title.trim(), description.trim());
    setProjects(items);
    setTitle('');
    setDescription('');
    setIsExpanding(false);
  };

  const handleUpdateProgress = async (id: string, progress: number) => {
    let status: Project['status'] = 'active';
    if (progress === 0) status = 'planning';
    if (progress === 100) status = 'completed';
    const items = await dbService.updateProjectProgress(userId, id, progress, status);
    setProjects(items);
  };

  const handleDeleteProject = async (id: string) => {
    const items = await dbService.deleteProject(userId, id);
    setProjects(items);
  };

  return (
    <div className="glass-panel p-6 rounded-2xl relative overflow-hidden" id="project-board">
      <div className="absolute top-0 right-0 w-80 h-80 bg-brand-cyan/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

      <div className="relative z-10 space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <span className="px-2 py-0.5 text-[10px] font-mono tracking-widest text-brand-cyan border border-brand-cyan/20 bg-brand-cyan/5 rounded-full uppercase">
              MODULE 4: PROJECT MANAGEMENT
            </span>
            <h2 className="text-2xl font-display font-semibold text-white mt-1.5 flex items-center gap-2">
              <Folder className="w-5.5 h-5.5 text-brand-cyan" />
              Project Management Board
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Break down complex company initiatives into traceable metric flows.
            </p>
          </div>

          <button
            onClick={() => setIsExpanding(!isExpanding)}
            className="py-1.5 px-3.5 bg-brand-cyan/10 border border-brand-cyan/30 hover:bg-brand-cyan/20 text-[#00f5d4] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Initialize Initiative
          </button>
        </div>

        {/* Form Expansion */}
        <AnimatePresence>
          {isExpanding && (
            <motion.form
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              onSubmit={handleCreateProject}
              className="bg-black/30 border border-white/5 rounded-2xl p-4 space-y-4 overflow-hidden"
            >
              <div>
                <label className="block text-[10px] font-mono text-gray-400 uppercase mb-1">PROJECT INITIATIVE NAME</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Next-Generation Authentication Core"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-gray-200 placeholder-gray-700 focus:outline-[#00f5d4] focus:outline-1 transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-gray-400 uppercase mb-1">OBJECTIVE PARAMETERS</label>
                <textarea
                  placeholder="Detail high-velocity deployment specs, target parameters, and scope guidelines..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-4 py-2 text-xs text-gray-200 placeholder-gray-700 focus:outline-[#00f5d4] focus:outline-1 transition-all resize-none h-16"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="py-2 px-5 bg-brand-cyan hover:opacity-90 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Instantiate Project Core
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Projects Layout Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((proj) => (
            <div key={proj.id} className="p-4 bg-black/20 border border-white/5 rounded-2xl space-y-4 relative overflow-hidden group">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-cyan/10 border border-brand-cyan/20 flex items-center justify-center">
                    <Activity className="w-5 h-5 text-brand-cyan" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white tracking-tight">{proj.title}</h4>
                    <span className="text-[9px] font-mono uppercase bg-slate-950 border border-white/5 p-1 rounded">
                      STATUS: {proj.status}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteProject(proj.id)}
                  className="p-1 hover:bg-red-500/10 hover:text-red-400 text-gray-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-[11px] text-gray-400 leading-normal">{proj.description || 'No execution guidelines aligned to project.'}</p>

              {/* Progress and roadmaps slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-mono text-gray-400">
                  <span>Milestone Completion</span>
                  <span className="font-bold text-white">{proj.progress}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={proj.progress}
                  onChange={(e) => handleUpdateProgress(proj.id, parseInt(e.target.value))}
                  className="w-full accent-brand-cyan cursor-pointer h-1.5 bg-slate-900 rounded-lg appearance-none"
                />
              </div>
            </div>
          ))}

          {projects.length === 0 && (
            <p className="text-xs text-gray-500 italic py-6 col-span-2 text-center">No active initiatives found. Create one under Module 4 now!</p>
          )}
        </div>

      </div>
    </div>
  );
};
