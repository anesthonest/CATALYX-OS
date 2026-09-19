/**
 * CATALYX Comprehensive Legal Policy & Regulatory Hub
 * Dedicated reader and navigation center for all platform covenants and legal notices.
 */

import React, { useState, useEffect } from 'react';
import {
  FileText,
  ShieldCheck,
  Scale,
  DollarSign,
  AlertTriangle,
  ArrowLeft,
  Printer,
  Copy,
  Check,
  ExternalLink,
  BookOpen,
  Search,
  Building2,
  Lock
} from 'lucide-react';
import { LegalDocument, LegalPolicyService } from '../../services/legal/legalPolicyService';

interface LegalDocumentViewProps {
  initialSlug?: string;
  userEmail?: string;
  onBack?: () => void;
  onClose?: () => void;
  onSelectSlug?: (slug: string) => void;
  onNavigateToDocument?: (slug: string) => void;
}

export const LegalDocumentView: React.FC<LegalDocumentViewProps> = ({
  initialSlug = 'terms',
  userEmail,
  onBack,
  onClose,
  onSelectSlug,
  onNavigateToDocument
}) => {
  const [activeSlug, setActiveSlug] = useState<string>(initialSlug);
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [activeDoc, setActiveDoc] = useState<LegalDocument | null>(null);

  const versionMeta = LegalPolicyService.getVersionMetadata();

  useEffect(() => {
    // Fetch all documents from server or service
    fetch('/api/legal/documents')
      .then(res => res.json())
      .then(data => {
        if (data.documents && Array.isArray(data.documents)) {
          setDocuments(data.documents);
        } else {
          setDocuments(LegalPolicyService.getAllDocuments());
        }
      })
      .catch(() => {
        setDocuments(LegalPolicyService.getAllDocuments());
      });
  }, []);

  useEffect(() => {
    if (documents.length > 0) {
      const match = documents.find(d => d.slug.toLowerCase() === activeSlug.toLowerCase()) || documents[0];
      setActiveDoc(match);
    }
  }, [activeSlug, documents]);

  const handleSelectDoc = (slug: string) => {
    setActiveSlug(slug);
    if (onSelectSlug) onSelectSlug(slug);
    if (onNavigateToDocument) onNavigateToDocument(slug);
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/?legal=${activeSlug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredDocs = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'core': return <Scale className="w-4 h-4 text-indigo-400" />;
      case 'financial': return <DollarSign className="w-4 h-4 text-emerald-400" />;
      case 'intellectual_property': return <ShieldCheck className="w-4 h-4 text-blue-400" />;
      case 'conduct': return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      default: return <FileText className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div id="catalyx-legal-view-container" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            {onBack && (
              <button
                id="btn-legal-back"
                onClick={onBack}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="Return to Dashboard"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div className="p-2 bg-indigo-600/20 border border-indigo-500/30 rounded-xl text-indigo-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white flex items-center space-x-2">
                <span>CATALYX Legal & Regulatory Hub</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono border border-slate-700">
                  {versionMeta.version}
                </span>
              </h1>
              <p className="text-xs text-slate-400">Official Operating Terms, Policies & Regulatory Attestations</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center space-x-1.5 border border-slate-700 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Link Copied' : 'Share Link'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center space-x-1.5 border border-slate-700 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Document</span>
            </button>
          </div>
        </div>
      </header>

      {/* Prominent Mandatory Operational Notice */}
      <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/40 border-b border-amber-900/30 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-start space-x-3 text-xs text-amber-200/90 leading-relaxed">
          <Building2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-amber-300">Mandatory Business Disclosure:</strong> CATALYX is developed and operated under the{' '}
            <span className="font-semibold text-white">VINEXSAH TECHNOLOGIES</span> project. All operations and covenants
            herein represent agreements with the human operators and creators of the project.
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto w-full flex-1 px-6 py-8 flex flex-col md:flex-row gap-8">
        {/* Left Sidebar: Policy Directory */}
        <aside className="w-full md:w-80 shrink-0 space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search legal policies..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="space-y-1">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 px-3 py-1">
              Policy Directory ({documents.length})
            </div>
            {filteredDocs.map(doc => {
              const active = activeDoc?.slug === doc.slug;
              return (
                <button
                  key={doc.slug}
                  id={`nav-legal-${doc.slug}`}
                  onClick={() => handleSelectDoc(doc.slug)}
                  className={`w-full text-left px-3.5 py-3 rounded-xl transition-all flex items-start space-x-3 border ${
                    active
                      ? 'bg-indigo-600/15 border-indigo-500/40 text-white shadow-sm'
                      : 'bg-slate-900/50 hover:bg-slate-900 border-slate-800/80 text-slate-300 hover:text-white'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">{getCategoryIcon(doc.category)}</div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold truncate flex items-center justify-between">
                      <span>{doc.title}</span>
                      <span className="text-[10px] text-slate-400 font-mono ml-1">/{doc.slug}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">{doc.summary}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick Regulatory Summary Box */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5 text-xs text-slate-400">
            <div className="flex items-center space-x-2 text-slate-200 font-semibold">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Immutable Ledger Records</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Every customer acceptance of CATALYX legal covenants is hashed and timestamped server-side with IP audit provenance.
            </p>
            <div className="pt-1 text-[10px] text-slate-400 font-mono">
              Digest: {versionMeta.termsHash.slice(0, 32)}...
            </div>
          </div>
        </aside>

        {/* Right Reader Area */}
        <main className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-10 shadow-xl min-w-0">
          {activeDoc ? (
            <article className="prose prose-invert prose-indigo max-w-none space-y-6">
              {/* Document Header */}
              <div className="border-b border-slate-800 pb-6">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-xs px-2.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 font-mono border border-indigo-500/20">
                    /{activeDoc.slug}
                  </span>
                  <span className="text-xs text-slate-400">Version: {activeDoc.version}</span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs text-slate-400">Effective: {activeDoc.lastUpdated}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{activeDoc.title}</h1>
                <p className="text-sm text-slate-400 mt-1">{activeDoc.subtitle}</p>
              </div>

              {/* Render Document Content */}
              <div className="space-y-4 text-sm text-slate-300 leading-relaxed whitespace-pre-line font-sans">
                {activeDoc.contentMarkdown}
              </div>

              {/* Document Signoff Footer */}
              <div className="border-t border-slate-800 pt-6 mt-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-400">
                <div>
                  <div className="font-semibold text-slate-300">CATALYX Autonomous Operating System</div>
                  <div>Vinexsah Technologies Project Operators</div>
                  <div>Inquiries & Disputes: <span className="text-indigo-400">anesthonest81@gmail.com</span></div>
                </div>
                <div className="text-right sm:text-right font-mono text-[11px] text-slate-400">
                  Certified Integrity Verified • v2026.3
                </div>
              </div>
            </article>
          ) : (
            <div className="text-center py-20 text-slate-500">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p>Select a document from the directory to review legal terms.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
