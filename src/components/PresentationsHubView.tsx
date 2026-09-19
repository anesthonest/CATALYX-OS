import React, { useState, useEffect } from 'react';
import { 
  Presentation, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Minimize2, 
  FileText, 
  Share2, 
  Download, 
  Plus, 
  Tag, 
  Clock, 
  User, 
  Layers, 
  MessageSquare, 
  BarChart3, 
  Check, 
  Sparkles,
  Play
} from 'lucide-react';
import { WorkPresentation, WorkSlide, UserProfile, UserPersonaRole } from '../types';
import { presentationsService } from '../services/presentationsService';
import { collaborationService } from '../services/collaborationService';
import { UniversalShareModal } from './UniversalShareModal';

interface PresentationsHubViewProps {
  user: UserProfile;
  activeRole: UserPersonaRole;
  onNavigate: (tabId: string) => void;
}

export const PresentationsHubView: React.FC<PresentationsHubViewProps> = ({
  user,
  activeRole,
  onNavigate
}) => {
  const [presentations, setPresentations] = useState<WorkPresentation[]>([]);
  const [selectedDeckId, setSelectedDeckId] = useState<string>('');
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showNotes, setShowNotes] = useState<boolean>(false);
  const [showComments, setShowComments] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);

  // New Deck Modal
  const [isNewDeckOpen, setIsNewDeckOpen] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState<WorkPresentation['category']>('STRATEGY');

  // Comment input
  const [commentText, setCommentText] = useState('');
  const [deckComments, setDeckComments] = useState<any[]>([]);

  const loadData = () => {
    const list = presentationsService.getAllPresentations();
    setPresentations(list);
    if (list.length > 0 && !selectedDeckId) {
      setSelectedDeckId(list[0].id);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const activeDeck = presentations.find(p => p.id === selectedDeckId) || presentations[0];

  useEffect(() => {
    if (activeDeck) {
      setCurrentSlideIndex(0);
      setDeckComments(collaborationService.getComments('presentation', activeDeck.id));
    }
  }, [selectedDeckId]);

  const activeSlide: WorkSlide | undefined = activeDeck?.slides[currentSlideIndex];

  const handleNextSlide = () => {
    if (activeDeck && currentSlideIndex < activeDeck.slides.length - 1) {
      setCurrentSlideIndex(prev => prev + 1);
    }
  };

  const handlePrevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(prev => prev - 1);
    }
  };

  const handleCreateDeck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const created = presentationsService.createPresentation({
      title: newTitle,
      description: newDescription,
      category: newCategory,
      ownerEmail: user.email
    });

    setNewTitle('');
    setNewDescription('');
    setIsNewDeckOpen(false);
    loadData();
    setSelectedDeckId(created.id);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !activeDeck) return;

    collaborationService.addComment({
      targetType: 'presentation',
      targetId: activeDeck.id,
      authorEmail: user.email,
      authorName: user.username || user.email.split('@')[0],
      text: `[Slide ${currentSlideIndex + 1}] ${commentText.trim()}`
    });

    setCommentText('');
    setDeckComments(collaborationService.getComments('presentation', activeDeck.id));
  };

  const handleExportDeck = () => {
    if (!activeDeck) return;
    const jsonStr = JSON.stringify(activeDeck, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeDeck.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_deck.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-brand-purple/10 to-slate-900 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-cyan/15 text-brand-cyan border border-brand-cyan/30 uppercase font-bold">
              WORK ARTIFACTS • V24
            </span>
            <span className="text-xs text-gray-400 font-mono">Presentations & Slides Studio</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-wide">
            Interactive Presentation Decks
          </h1>
          <p className="text-xs text-gray-300 mt-1 max-w-2xl">
            Create, present, collaborate, and share high-fidelity slide decks with real-time operational telemetry, presenter notes, and granular access controls.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsNewDeckOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-purple to-brand-cyan text-slate-950 font-bold text-xs flex items-center gap-2 hover:opacity-95 shadow-md cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Deck</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Deck selector + Interactive Slide Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Deck Library (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-mono uppercase text-gray-400 font-semibold tracking-wider">
              Enterprise Decks ({presentations.length})
            </span>
          </div>

          <div className="space-y-2">
            {presentations.map((deck) => {
              const isSelected = deck.id === activeDeck?.id;
              return (
                <div
                  key={deck.id}
                  onClick={() => setSelectedDeckId(deck.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900/90 border-brand-cyan/50 shadow-lg ring-1 ring-brand-cyan/20'
                      : 'bg-slate-950/60 border-white/5 hover:border-white/20 hover:bg-slate-900/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-brand-purple/20 text-brand-cyan border border-brand-purple/30 font-semibold">
                      {deck.category}
                    </span>
                    <span className="text-[10px] font-mono text-gray-500">
                      {deck.slides.length} slides
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-white mt-2 leading-snug">
                    {deck.title}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                    {deck.description}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-gray-500 mt-3 pt-2 border-t border-white/5">
                    <span className="truncate">By {deck.ownerEmail}</span>
                    <span>{deck.version}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Slide Stage & Controls (8 cols) */}
        {activeDeck && activeSlide && (
          <div className="lg:col-span-8 space-y-4">
            {/* Stage Bar: Actions (Present, Notes, Share, Export) */}
            <div className="p-3 rounded-2xl bg-slate-950/80 border border-white/10 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-gray-400">
                  Slide <strong className="text-brand-cyan">{currentSlideIndex + 1}</strong> of {activeDeck.slides.length}
                </span>
                <span className="text-gray-600">•</span>
                <span className="text-xs text-gray-300 font-medium truncate max-w-xs">
                  {activeDeck.title}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowNotes(!showNotes)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer border ${
                    showNotes
                      ? 'bg-brand-purple/20 text-brand-purple border-brand-purple/40'
                      : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
                  }`}
                  title="Toggle Presenter Notes"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Notes</span>
                </button>

                <button
                  onClick={() => setShowComments(!showComments)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer border ${
                    showComments
                      ? 'bg-brand-cyan/20 text-brand-cyan border-brand-cyan/40'
                      : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
                  }`}
                  title="Discussion & Feedback"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Comments ({deckComments.length})</span>
                </button>

                <button
                  onClick={() => setIsShareModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10 text-xs font-mono flex items-center gap-1.5 cursor-pointer"
                  title="Share Presentation Deck"
                >
                  <Share2 className="w-3.5 h-3.5 text-brand-cyan" />
                  <span>Share</span>
                </button>

                <button
                  onClick={handleExportDeck}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10 text-xs font-mono flex items-center gap-1.5 cursor-pointer"
                  title="Export Deck JSON"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export</span>
                </button>

                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-1.5 rounded-xl bg-brand-cyan/15 hover:bg-brand-cyan/25 text-brand-cyan border border-brand-cyan/30 text-xs cursor-pointer"
                  title="Fullscreen Present Mode"
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Interactive Slide Canvas */}
            <div className={`relative rounded-3xl border border-white/15 overflow-hidden transition-all ${
              isFullscreen 
                ? 'fixed inset-0 z-50 bg-slate-950 flex flex-col justify-between p-10 rounded-none border-none'
                : 'bg-gradient-to-b from-slate-900 to-slate-950 min-h-[460px] p-8 flex flex-col justify-between shadow-2xl'
            }`}>
              {/* Background ambient lighting */}
              <div className="absolute -top-20 -right-20 w-80 h-80 bg-brand-purple/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-brand-cyan/10 rounded-full blur-3xl pointer-events-none" />

              {/* Slide Content Rendering based on Layout */}
              <div className="relative z-10 space-y-6">
                <div>
                  <span className="text-[10px] font-mono tracking-widest text-brand-cyan uppercase">
                    CATALYX PRESENTATION FABRIC • {activeDeck.category}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-wide mt-2">
                    {activeSlide.title}
                  </h2>
                  {activeSlide.subtitle && (
                    <p className="text-sm text-gray-400 mt-1 font-sans">
                      {activeSlide.subtitle}
                    </p>
                  )}
                </div>

                {/* Metrics Slide Layout */}
                {activeSlide.layout === 'metrics' && activeSlide.metrics && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
                    {activeSlide.metrics.map((m, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 shadow-md">
                        <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">
                          {m.label}
                        </span>
                        <div className="text-2xl font-bold text-white mt-1">
                          {m.value}
                        </div>
                        {m.delta && (
                          <span className="text-xs font-mono text-emerald-400 mt-1 inline-block">
                            {m.delta}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Bullets / Content List */}
                <div className="space-y-3 pt-2">
                  {activeSlide.content.map((point, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-sm text-gray-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan mt-2 shrink-0" />
                      <span className="leading-relaxed">{point}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Slide Navigation Footbar */}
              <div className="relative z-10 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrevSlide}
                    disabled={currentSlideIndex === 0}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    title="Previous Slide"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleNextSlide}
                    disabled={currentSlideIndex === activeDeck.slides.length - 1}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    title="Next Slide"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <span className="font-mono text-xs">
                    {currentSlideIndex + 1} / {activeDeck.slides.length}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-gray-500">
                    Use Left / Right Arrows to navigate
                  </span>
                </div>
              </div>
            </div>

            {/* Presenter Notes Box */}
            {showNotes && (
              <div className="p-4 rounded-2xl bg-brand-purple/10 border border-brand-purple/30 space-y-1 animate-fadeIn">
                <div className="flex items-center gap-2 text-xs font-mono text-brand-purple uppercase font-bold">
                  <FileText className="w-4 h-4" />
                  <span>Presenter Talking Points & Internal Notes</span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed font-sans">
                  {activeSlide.notes || 'No specific speaker notes registered for this slide.'}
                </p>
              </div>
            )}

            {/* Slide Thumbnails Ribbon */}
            <div className="p-3 rounded-2xl bg-slate-950/60 border border-white/10 flex items-center gap-3 overflow-x-auto scrollbar-thin">
              {activeDeck.slides.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => setCurrentSlideIndex(idx)}
                  className={`p-2.5 rounded-xl border text-left shrink-0 w-36 transition-all cursor-pointer ${
                    currentSlideIndex === idx
                      ? 'bg-brand-cyan/15 border-brand-cyan text-white shadow-md'
                      : 'bg-slate-900 border-white/10 text-gray-400 hover:text-white hover:border-white/20'
                  }`}
                >
                  <span className="text-[9px] font-mono text-brand-cyan block">Slide {idx + 1}</span>
                  <span className="text-xs font-semibold truncate block mt-0.5">{s.title}</span>
                </button>
              ))}
            </div>

            {/* Comments Thread on Deck */}
            {showComments && (
              <div className="p-5 rounded-2xl bg-slate-950/80 border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-mono uppercase text-gray-300 font-bold flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-brand-cyan" />
                    <span>Collaboration Notes & Feedback</span>
                  </h4>
                  <span className="text-[10px] font-mono text-gray-500">
                    {deckComments.length} comments
                  </span>
                </div>

                <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                  {deckComments.length === 0 ? (
                    <p className="text-xs text-gray-500 py-3 text-center">No comments yet. Start the discussion below.</p>
                  ) : (
                    deckComments.map((c) => (
                      <div key={c.id} className="p-3 rounded-xl bg-slate-900 border border-white/5 space-y-1">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-semibold text-brand-cyan">{c.authorName}</span>
                          <span className="text-gray-500">{new Date(c.createdAt).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-xs text-gray-300">{c.text}</p>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handleAddComment} className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder={`Comment on Slide ${currentSlideIndex + 1}...`}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-brand-cyan"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-brand-cyan text-slate-950 font-bold text-xs rounded-xl hover:opacity-95 transition-all cursor-pointer"
                  >
                    Post Note
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Universal Share Modal */}
      {activeDeck && (
        <UniversalShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          artifactId={activeDeck.id}
          artifactTitle={activeDeck.title}
          artifactType="presentation"
          currentUserEmail={user.email}
        />
      )}

      {/* New Deck Creation Modal */}
      {isNewDeckOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-white/15 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-display font-bold text-white">Create Presentation Deck</h3>
            <form onSubmit={handleCreateDeck} className="space-y-3">
              <div>
                <label className="block text-[10px] font-mono text-gray-400 uppercase mb-1">Deck Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q1 Autonomous Growth Initiatives"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-brand-cyan"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-gray-400 uppercase mb-1">Description / Purpose</label>
                <textarea
                  rows={2}
                  placeholder="Key strategic thesis and milestones..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-brand-cyan"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-gray-400 uppercase mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-brand-cyan font-bold focus:outline-brand-cyan"
                >
                  <option value="STRATEGY">STRATEGY</option>
                  <option value="ENGINEERING">ENGINEERING</option>
                  <option value="PRODUCT">PRODUCT</option>
                  <option value="FINANCE">FINANCE</option>
                  <option value="MISSION">MISSION</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsNewDeckOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-gray-400 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-brand-purple to-brand-cyan text-slate-950 font-bold text-xs cursor-pointer"
                >
                  Initialize Deck
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
