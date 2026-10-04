import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutGrid, Plus, Trash2, Folder, Milestone, Activity, Sparkles, Download, FileJson, FileText, Archive, Check } from 'lucide-react';
import { dbService } from '../firebase';
import { Project } from '../types';
import { persistenceSyncService } from '../services/persistenceSyncService';

interface ProjectBoardProps {
  userId: string;
}

export const ProjectBoard: React.FC<ProjectBoardProps> = ({ userId }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isExpanding, setIsExpanding] = useState(false);
  const [exportingId, setExportingId] = useState<string | null>(null);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

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

  const handleExportZip = async (proj: Project) => {
    setExportingId(proj.id);
    try {
      await persistenceSyncService.downloadProjectZip(proj.id, proj);
      setExportNotice(`Exported ${proj.title} (ZIP with Manifest & Tasks)`);
      setTimeout(() => setExportNotice(null), 3000);
    } finally {
      setExportingId(null);
    }
  };

  const handleExportAll = async () => {
    setExportingId('all');
    try {
      await persistenceSyncService.downloadAllUserDataZip();
      setExportNotice('Exported Complete CATALYX Sovereign Archive (ZIP)');
      setTimeout(() => setExportNotice(null), 3500);
    } finally {
      setExportingId(null);
    }
  };

  return (
    <div className="glass-panel p-6 rounded-2xl relative overflow-hidden" id="project-board">
      <div className="absolute top-0 right-0 w-80 h-80 bg-brand-cyan/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

      <div className="relative z-10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="px-2 py-0.5 text-[10px] font-mono tracking-widest text-brand-cyan border border-brand-cyan/20 bg-brand-cyan/5 rounded-full uppercase">
              MODULE 4: PROJECT MANAGEMENT & WORK EXPORT
            </span>
            <h2 className="text-2xl font-display font-semibold text-white mt-1.5 flex items-center gap-2">
              <Folder className="w-5.5 h-5.5 text-brand-cyan" />
              Project Management Board
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Break down company initiatives into durable metric flows with cryptographic manifest export.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {projects.length > 0 && (
              <button
                onClick={handleExportAll}
                disabled={exportingId === 'all'}
                className="py-1.5 px-3 bg-white/5 border border-white/10 hover:border-brand-cyan/40 text-gray-300 hover:text-white rounded-xl text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer shadow-sm disabled:opacity-50"
                title="Download full project and data archive"
              >
                <Download className="w-3.5 h-3.5 text-brand-cyan" />
                <span>{exportingId === 'all' ? 'Exporting...' : 'Export Archive (ZIP)'}</span>
              </button>
            )}

            <button
              onClick={() => setIsExpanding(!isExpanding)}
              className="py-1.5 px-3.5 bg-brand-cyan/10 border border-brand-cyan/30 hover:bg-brand-cyan/20 text-[#00f5d4] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Initialize Initiative
            </button>
          </div>
        </div>

        {/* Global Export Notice Banner */}
        {exportNotice && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-xl text-xs font-mono flex items-center gap-2 animate-in fade-in duration-200">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{exportNotice}</span>
          </div>
        )}

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

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleExportZip(proj)}
                    disabled={exportingId === proj.id}
                    className="p-1.5 hover:bg-brand-cyan/10 text-gray-400 hover:text-brand-cyan rounded-lg transition-colors cursor-pointer"
                    title="Export Project as ZIP Package"
                  >
                    <Archive className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => persistenceSyncService.downloadProjectAsMarkdown(proj)}
                    className="p-1.5 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                    title="Export Project as Markdown"
                  >
                    <FileText className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => persistenceSyncService.downloadProjectAsJson(proj)}
                    className="p-1.5 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                    title="Export Project as JSON"
                  >
                    <FileJson className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDeleteProject(proj.id)}
                    className="p-1.5 hover:bg-red-500/10 hover:text-red-400 text-gray-500 rounded-lg transition-colors cursor-pointer"
                    title="Delete Project"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
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

              {/* Footer action bar */}
              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-gray-500">
                <span>Durable ID: {proj.id.substring(0, 10)}</span>
                <button
                  onClick={() => handleExportZip(proj)}
                  className="text-brand-cyan hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3 h-3" />
                  <span>Download ZIP</span>
                </button>
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
