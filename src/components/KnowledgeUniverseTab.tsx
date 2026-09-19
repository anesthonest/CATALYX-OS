import React, { useState } from 'react';
import { 
  BookOpen, Search, ShieldCheck, Sparkles, Plus, 
  FileText, Tag, Filter, User, CheckCircle2 
} from 'lucide-react';
import { KnowledgeItem } from '../types';
import { KnowledgeService } from '../services/knowledgeService';

interface Props {
  orgId: string;
  userEmail: string;
}

export const KnowledgeUniverseTab: React.FC<Props> = ({ orgId, userEmail }) => {
  const [items, setItems] = useState<KnowledgeItem[]>(() => KnowledgeService.getKnowledgeItems(orgId));
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // New item form
  const [newTitle, setNewTitle] = useState<string>('');
  const [newContent, setNewContent] = useState<string>('');
  const [newCategory, setNewCategory] = useState<KnowledgeItem['category']>('procedure');
  const [newTags, setNewTags] = useState<string>('');
  const [isAuthoritative, setIsAuthoritative] = useState<boolean>(false);

  const filteredItems = items.filter(item => {
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const lowerQ = searchQuery.toLowerCase();
    const matchesQuery = 
      !searchQuery.trim() ||
      item.title.toLowerCase().includes(lowerQ) ||
      item.content.toLowerCase().includes(lowerQ) ||
      item.tags.some(t => t.toLowerCase().includes(lowerQ));
    return matchesCategory && matchesQuery;
  });

  const handleCreateKnowledge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const parsedTags = newTags.split(',').map(t => t.trim()).filter(Boolean);
    const newItem: KnowledgeItem = {
      id: `kb_${Date.now()}`,
      organizationId: orgId,
      title: newTitle.trim(),
      content: newContent.trim(),
      category: newCategory,
      tags: parsedTags,
      provenance: {
        author: userEmail,
        authorRole: 'Platform Operator',
        sourceSystem: 'Manual Input Registry',
        verifiedAuthoritative: isAuthoritative,
        isAiGenerated: false,
      },
      searchKeywords: parsedTags,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    KnowledgeService.addKnowledgeItem(newItem);
    setItems([newItem, ...items]);
    setShowAddModal(false);
    setNewTitle('');
    setNewContent('');
    setNewTags('');
    setIsAuthoritative(false);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider rounded bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30">
              Institutional Memory & Knowledge Universe
            </span>
            <span className="text-xs text-gray-400 font-medium">Clear Provenance Tracking</span>
          </div>
          <h2 className="text-2xl font-bold text-white mt-1">Organizational Knowledge Vault</h2>
          <p className="text-sm text-gray-400">
            Authoritative policies, operating procedures, lessons learned, and AI-generated syntheses with verified provenance.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-purple text-white rounded-xl text-sm font-medium hover:bg-brand-purple/90 transition shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Knowledge Entry
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search policies, SOPs, lessons learned, tags, or citations..."
            className="w-full pl-9 pr-4 py-2 border border-white/10 rounded-xl text-sm bg-slate-900/80 text-white placeholder-gray-500 focus:outline-none focus:border-brand-cyan"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-white/10 rounded-xl text-sm bg-slate-900 text-white font-medium focus:outline-none focus:border-brand-cyan"
          >
            <option value="all">All Categories</option>
            <option value="policy">Policy</option>
            <option value="procedure">Standard Procedure (SOP)</option>
            <option value="decision">Executive Decision</option>
            <option value="lesson_learned">Lesson Learned</option>
            <option value="research">Research / Synthesis</option>
            <option value="document">General Document</option>
          </select>
        </div>
      </div>

      {/* Add Knowledge Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-white/15 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-lg font-bold text-white">Add Institutional Knowledge</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-white cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleCreateKnowledge} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. SOP-OPS-04: Automated Cloud Run Scale-Down Protocol"
                  className="w-full px-3 py-2 border border-white/10 bg-slate-950/80 text-white rounded-lg text-xs focus:outline-none focus:border-brand-cyan"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e: any) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-white/10 bg-slate-950/80 text-white rounded-lg text-xs focus:outline-none focus:border-brand-cyan"
                >
                  <option value="procedure">Standard Procedure (SOP)</option>
                  <option value="policy">Authoritative Policy</option>
                  <option value="decision">Executive Decision</option>
                  <option value="lesson_learned">Lesson Learned</option>
                  <option value="research">Research</option>
                  <option value="document">Document</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">Content Body</label>
                <textarea
                  rows={5}
                  value={newContent}
                  onChange={e => setNewContent(e.target.value)}
                  placeholder="Detail the complete operating procedure, policy parameters, or lessons..."
                  className="w-full px-3 py-2 border border-white/10 bg-slate-950/80 text-white rounded-lg text-xs focus:outline-none focus:border-brand-cyan"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">Tags (Comma-separated)</label>
                <input
                  type="text"
                  value={newTags}
                  onChange={e => setNewTags(e.target.value)}
                  placeholder="cloud, scaling, ops, protocol"
                  className="w-full px-3 py-2 border border-white/10 bg-slate-950/80 text-white rounded-lg text-xs focus:outline-none focus:border-brand-cyan"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="authoritativeCheck"
                  checked={isAuthoritative}
                  onChange={e => setIsAuthoritative(e.target.checked)}
                  className="rounded text-brand-purple focus:ring-brand-purple cursor-pointer"
                />
                <label htmlFor="authoritativeCheck" className="text-xs font-semibold text-gray-200 cursor-pointer">
                  Mark as Verified Authoritative Company Policy
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-white/10 rounded-lg text-xs font-medium text-gray-400 hover:text-white hover:bg-white/5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-purple text-white rounded-lg text-xs font-semibold hover:bg-brand-purple/90 cursor-pointer shadow-md"
                >
                  Save Knowledge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Knowledge Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredItems.map(item => {
          const isVerified = item.provenance.verifiedAuthoritative;
          const isAi = item.provenance.isAiGenerated;

          return (
            <div key={item.id} className="bg-slate-900/60 backdrop-blur-md rounded-xl border border-white/10 p-6 shadow-lg space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-white/5 text-gray-300 border border-white/10">
                    {item.category.replace('_', ' ')}
                  </span>

                  {/* Provenance Badges */}
                  <div className="flex items-center gap-1.5">
                    {isVerified && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        <ShieldCheck className="w-3 h-3 text-amber-400" />
                        Authoritative
                      </span>
                    )}

                    {isAi && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-purple/20 text-purple-300 border border-brand-purple/30">
                        <Sparkles className="w-3 h-3 text-purple-400" />
                        AI Synthesis
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="text-base font-bold text-white leading-snug">{item.title}</h3>
                <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-line">{item.content}</p>
              </div>

              <div className="pt-3 border-t border-white/10 space-y-2">
                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {item.tags.map(t => (
                    <span key={t} className="px-2 py-0.5 bg-slate-950/70 text-gray-400 rounded text-[10px] border border-white/5">
                      #{t}
                    </span>
                  ))}
                </div>

                {/* Attribution */}
                <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1">
                  <span className="flex items-center gap-1 truncate">
                    <User className="w-3 h-3 text-brand-cyan" />
                    {item.provenance.author} ({item.provenance.authorRole})
                  </span>
                  <span>{new Date(item.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
