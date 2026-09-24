import React, { useState, useEffect } from 'react';
import { 
  Search, Brain, Sparkles, BookOpen, CheckCircle2, ShieldCheck, 
  ArrowRight, FileText, Share2, Copy, Check, Layers, AlertCircle, 
  Download, ExternalLink, ChevronRight, Bookmark, Compass
} from 'lucide-react';
import { deepResearchService, DeepResearchDossier } from '../../services/research/deepResearchService';
import { UserProfile, UserPersonaRole } from '../../types';

interface DeepResearchViewProps {
  user: UserProfile;
  activeRole: UserPersonaRole;
  onNavigate: (tabId: string, itemId?: string) => void;
}

export const DeepResearchView: React.FC<DeepResearchViewProps> = ({
  user,
  activeRole,
  onNavigate
}) => {
  const [dossiers, setDossiers] = useState<DeepResearchDossier[]>([]);
  const [selectedDossier, setSelectedDossier] = useState<DeepResearchDossier | null>(null);
  const [queryInput, setQueryInput] = useState('');
  const [focusDomain, setFocusDomain] = useState('ALL');
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionStep, setExecutionStep] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [exportSuccessMessage, setExportSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    loadDossiers();
  }, []);

  const loadDossiers = () => {
    const list = deepResearchService.getAllDossiers();
    setDossiers(list);
    if (!selectedDossier && list.length > 0) {
      setSelectedDossier(list[0]);
    }
  };

  const handleRunResearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryInput.trim()) return;

    setIsExecuting(true);
    setExportSuccessMessage(null);

    try {
      setExecutionStep('1/4: Decomposing inquiry hypotheses & sub-questions...');
      await new Promise(r => setTimeout(r, 400));
      
      setExecutionStep('2/4: Identifying empirical evidence & literature benchmarks...');
      await new Promise(r => setTimeout(r, 500));
      
      setExecutionStep('3/4: Evaluating counter-arguments, tradeoffs & boundary limits...');
      await new Promise(r => setTimeout(r, 400));
      
      setExecutionStep('4/4: Formulating structured research dossier & bibliography...');
      const dossier = await deepResearchService.executeDeepResearch({
        query: queryInput.trim(),
        focusDomain: focusDomain === 'ALL' ? undefined : focusDomain,
        userEmail: user.email,
        userName: user.username || user.email
      });

      loadDossiers();
      setSelectedDossier(dossier);
      setQueryInput('');
    } catch (err) {
      console.error('Deep research failed:', err);
    } finally {
      setIsExecuting(false);
      setExecutionStep('');
    }
  };

  const handleExportToWork = () => {
    if (!selectedDossier) return;
    const workObj = deepResearchService.exportToUniversalWork(
      selectedDossier.id,
      'ws_default_workspace'
    );
    if (workObj) {
      setExportSuccessMessage(`Dossier successfully converted into Universal Work Object "${workObj.title}".`);
      loadDossiers();
      // Optional prompt to jump to Universal Work
    }
  };

  const handleCopySummary = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-white/10 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-mono font-bold border border-cyan-500/30 flex items-center gap-1">
              <Brain className="w-3.5 h-3.5" /> Deep Research Engine
            </span>
            <span className="text-xs text-gray-400 font-mono">Formal Decomposition & Synthesis</span>
          </div>
          <h2 className="text-2xl font-bold text-white font-display mt-2">
            CATALYX Deep Research AI
          </h2>
          <p className="text-xs text-gray-300 mt-1 max-w-2xl">
            Rigorous, multi-vector scientific and architectural inquiry. Decomposes any question into verifiable hypotheses, evaluates empirical evidence, addresses counter-perspectives, and exports natively into CATALYX Universal Work.
          </p>
        </div>
      </div>

      {/* Query Input Section */}
      <div className="p-6 rounded-2xl catalyx-surface-card border border-white/10 shadow-xl space-y-4">
        <form onSubmit={handleRunResearch} className="space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                placeholder="Enter research topic, architectural question, scientific hypothesis, or commercial query..."
                disabled={isExecuting}
                className="w-full bg-black/50 border border-white/20 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 placeholder-gray-500"
              />
            </div>

            <select
              value={focusDomain}
              onChange={(e) => setFocusDomain(e.target.value)}
              disabled={isExecuting}
              className="bg-black/50 border border-white/20 rounded-xl px-3.5 py-3 text-xs text-white focus:outline-none focus:border-cyan-500 shrink-0"
            >
              <option value="ALL">All Domains (Auto-Detect)</option>
              <option value="Cybersecurity & Systems Engineering">Cybersecurity & Distributed Systems</option>
              <option value="Applied Artificial Intelligence & Machine Learning">Applied AI & Multi-Agent Models</option>
              <option value="Economic Systems & Quantitative Finance">Quantitative Finance & Economics</option>
              <option value="Biomedical Informatics & Healthcare Operations">Biomedical & Healthcare</option>
              <option value="Regulatory Jurisprudence & Legal Governance">Legal & Regulatory Governance</option>
              <option value="Pedagogical Science & Educational Technology">Educational Technology</option>
            </select>

            <button
              type="submit"
              disabled={isExecuting || !queryInput.trim()}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
            >
              <Sparkles className="w-4 h-4" />
              {isExecuting ? 'Synthesizing...' : 'Execute Deep Research'}
            </button>
          </div>
        </form>

        {isExecuting && (
          <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center gap-3">
            <div className="w-4 h-4 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin shrink-0" />
            <span className="text-xs font-mono text-cyan-300">{executionStep}</span>
          </div>
        )}

        {exportSuccessMessage && (
          <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{exportSuccessMessage}</span>
            </div>
            <button
              onClick={() => onNavigate('universal-work')}
              className="px-3 py-1 rounded-lg bg-emerald-500/30 hover:bg-emerald-500/50 text-emerald-200 text-xs font-semibold flex items-center gap-1 cursor-pointer"
            >
              Open Universal Work <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Main Content Layout: Sidebar of past research + Selected Dossier View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Dossier List Sidebar */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-mono uppercase text-gray-400 font-bold">Research Dossiers ({dossiers.length})</h3>
            <span className="text-[10px] text-gray-500">Peer-Grade Rigor</span>
          </div>

          <div className="space-y-2 max-h-[750px] overflow-y-auto pr-1">
            {dossiers.map((d) => {
              const isSelected = selectedDossier?.id === d.id;
              return (
                <div
                  key={d.id}
                  onClick={() => setSelectedDossier(d)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-950/40 border-cyan-500/60 shadow-md'
                      : 'bg-slate-900/60 border-white/10 hover:border-white/20 hover:bg-slate-900/90'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-bold">
                      {d.overallConfidenceScore}% Confidence
                    </span>
                    <span className="text-[10px] text-gray-500 font-mono">
                      {new Date(d.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white mt-1.5 line-clamp-2 leading-snug">
                    {d.title}
                  </h4>
                  <p className="text-[11px] text-gray-400 mt-1 line-clamp-2">
                    {d.executiveSummary}
                  </p>
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/5 text-[10px] text-gray-400 font-mono">
                    <span>{d.subQuestions.length} Sub-Inquiries</span>
                    <span>•</span>
                    <span>{d.citations.length} Citations</span>
                    {d.status === 'EXPORTED_TO_WORK' && (
                      <span className="text-emerald-400 ml-auto font-bold flex items-center gap-0.5">
                        <Check className="w-3 h-3" /> Work Object
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Dossier Full View */}
        <div className="lg:col-span-8">
          {selectedDossier ? (
            <div className="p-6 rounded-2xl catalyx-surface-card border border-white/10 shadow-2xl space-y-6">
              {/* Dossier Header */}
              <div className="border-b border-white/10 pb-5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-mono font-bold border border-cyan-500/30">
                      Quality: {selectedDossier.evidenceQualityRating}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold">
                      Confidence: {selectedDossier.overallConfidenceScore}%
                    </span>
                    <span className="text-xs text-gray-400 font-mono">
                      ~{selectedDossier.estimatedReadingTimeMinutes} min read
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopySummary(selectedDossier.executiveSummary, 'summary')}
                      className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer"
                    >
                      {copiedId === 'summary' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      Copy
                    </button>
                    <button
                      onClick={handleExportToWork}
                      className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      Save to Universal Work
                    </button>
                  </div>
                </div>

                <h1 className="text-xl font-bold text-white font-display leading-snug">
                  {selectedDossier.title}
                </h1>
                <p className="text-xs text-gray-400 font-mono">
                  Inquiry: "{selectedDossier.query}" • Authored by {selectedDossier.authorName}
                </p>
              </div>

              {/* Executive Summary */}
              <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/30 space-y-2">
                <span className="text-[11px] font-mono font-bold text-cyan-300 uppercase tracking-wider block">
                  Executive Summary
                </span>
                <p className="text-xs text-gray-200 leading-relaxed">
                  {selectedDossier.executiveSummary}
                </p>
              </div>

              {/* Background & Methodology */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-black/30 border border-white/10 space-y-1.5">
                  <span className="text-[11px] font-mono font-bold text-gray-400 uppercase tracking-wider block">
                    Background & Problem Statement
                  </span>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    {selectedDossier.backgroundAndContext}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-black/30 border border-white/10 space-y-1.5">
                  <span className="text-[11px] font-mono font-bold text-gray-400 uppercase tracking-wider block">
                    Inquiry Methodology
                  </span>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    {selectedDossier.methodology}
                  </p>
                </div>
              </div>

              {/* Decomposed Sub-Questions */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  Decomposed Inquiry Paths & Empirical Findings
                </h3>
                <div className="space-y-3">
                  {selectedDossier.subQuestions.map((sq, idx) => (
                    <div key={sq.id} className="p-4 rounded-xl bg-slate-900/80 border border-white/10 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-cyan-300 font-mono">
                          Vector {idx + 1}: {sq.focusArea}
                        </span>
                        <div className="flex items-center gap-2 text-[10px] font-mono text-gray-400">
                          <span>{sq.evidenceCount} Evidence Points</span>
                          <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                            {sq.confidenceScore}% Score
                          </span>
                        </div>
                      </div>
                      <p className="text-xs font-semibold text-white">
                        {sq.question}
                      </p>
                      <p className="text-xs text-gray-300 leading-relaxed bg-black/30 p-2.5 rounded-lg border border-white/5">
                        {sq.findings}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Core Findings & Counter Perspectives */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Findings */}
                <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2.5">
                  <span className="text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-wider block">
                    Synthesized Core Findings
                  </span>
                  <ul className="space-y-2 text-xs text-gray-300">
                    {selectedDossier.keyFindings.map((f, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Counter Perspectives */}
                <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2.5">
                  <span className="text-[11px] font-mono font-bold text-amber-400 uppercase tracking-wider block">
                    Counter-Perspectives & Tradeoffs
                  </span>
                  <div className="space-y-3">
                    {selectedDossier.counterPerspectives.map((cp, i) => (
                      <div key={i} className="text-xs space-y-1">
                        <span className="font-bold text-white block">• {cp.perspective}</span>
                        <p className="text-gray-400 text-[11px] pl-3">{cp.counterEvidence}</p>
                        <p className="text-amber-300/90 text-[11px] pl-3 italic">Implication: {cp.implication}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Strategic Recommendations */}
              <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-2.5">
                <span className="text-[11px] font-mono font-bold text-purple-300 uppercase tracking-wider block">
                  Actionable Strategic Recommendations
                </span>
                <div className="space-y-2 text-xs text-gray-200">
                  {selectedDossier.strategicRecommendations.map((rec, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-purple-400 font-mono font-bold">{i + 1}.</span>
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Authoritative Citations & Bibliography */}
              <div className="space-y-2.5 pt-2 border-t border-white/10">
                <span className="text-[11px] font-mono font-bold text-gray-400 uppercase tracking-wider block">
                  Authoritative Literature & Citations ({selectedDossier.citations.length})
                </span>
                <div className="space-y-2">
                  {selectedDossier.citations.map((c) => (
                    <div key={c.id} className="p-3 rounded-lg bg-black/30 border border-white/5 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{c.title}</span>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white/10 text-gray-300">
                          {c.evidenceStrength}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400">
                        {c.authors.join(', ')} ({c.publicationYear}) — <em>{c.source}</em>
                      </p>
                      <p className="text-[11px] text-gray-300">
                        {c.relevanceSummary}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-gray-500 rounded-2xl catalyx-surface-card border border-white/10">
              <Compass className="w-8 h-8 mx-auto text-gray-600 mb-2" />
              <p className="text-sm">Select a research dossier or enter a query above to execute deep research.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
