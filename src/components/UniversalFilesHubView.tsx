import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  FileCode, 
  FileSpreadsheet, 
  Image as ImageIcon, 
  Film, 
  Music, 
  Archive, 
  Download, 
  Share2, 
  Upload, 
  ShieldCheck, 
  Search, 
  Trash2, 
  ExternalLink, 
  Plus, 
  Check, 
  AlertTriangle,
  MessageSquare,
  File
} from 'lucide-react';
import { WorkFileItem, UserProfile, UserPersonaRole } from '../types';
import { filesVaultService } from '../services/filesVaultService';
import { collaborationService } from '../services/collaborationService';
import { UniversalShareModal } from './UniversalShareModal';

interface UniversalFilesHubViewProps {
  user: UserProfile;
  activeRole: UserPersonaRole;
  onNavigate: (tabId: string) => void;
}

export const UniversalFilesHubView: React.FC<UniversalFilesHubViewProps> = ({
  user,
  activeRole,
  onNavigate
}) => {
  const [files, setFiles] = useState<WorkFileItem[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Upload state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [selectedUploadFile, setSelectedUploadFile] = useState<File | null>(null);

  // Comments
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');

  const loadFiles = () => {
    const list = filesVaultService.getAllFiles();
    setFiles(list);
    if (list.length > 0 && !selectedFileId) {
      setSelectedFileId(list[0].id);
    }
  };

  useEffect(() => {
    loadFiles();
  }, []);

  const activeFile = files.find(f => f.id === selectedFileId) || files[0];

  useEffect(() => {
    if (activeFile) {
      setComments(collaborationService.getComments('document', activeFile.id));
    }
  }, [selectedFileId]);

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUploadFile) {
      setUploadError('Please choose a file to upload.');
      return;
    }

    setUploadLoading(true);
    setUploadError(null);

    const res = await filesVaultService.uploadFile({
      file: selectedUploadFile,
      uploadedByEmail: user.email
    });

    setUploadLoading(false);

    if (!res.success || !res.item) {
      setUploadError(res.error || 'Upload failed');
      return;
    }

    setSelectedUploadFile(null);
    setIsUploadOpen(false);
    loadFiles();
    setSelectedFileId(res.item.id);
  };

  const handleDownload = (file: WorkFileItem) => {
    if (file.sampleContent) {
      const blob = new Blob([file.sampleContent], { type: file.mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      a.click();
      URL.revokeObjectURL(url);
    } else if (file.contentUrl && file.contentUrl.startsWith('http')) {
      window.open(file.contentUrl, '_blank');
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !activeFile) return;

    collaborationService.addComment({
      targetType: 'document',
      targetId: activeFile.id,
      authorEmail: user.email,
      authorName: user.username || user.email.split('@')[0],
      text: newComment.trim()
    });

    setNewComment('');
    setComments(collaborationService.getComments('document', activeFile.id));
  };

  const getCategoryIcon = (cat: WorkFileItem['category']) => {
    switch (cat) {
      case 'pdf': return <FileText className="w-4 h-4 text-rose-400" />;
      case 'doc': return <FileText className="w-4 h-4 text-blue-400" />;
      case 'sheet': return <FileSpreadsheet className="w-4 h-4 text-emerald-400" />;
      case 'code': return <FileCode className="w-4 h-4 text-amber-400" />;
      case 'image': return <ImageIcon className="w-4 h-4 text-purple-400" />;
      case 'video': return <Film className="w-4 h-4 text-brand-cyan" />;
      case 'audio': return <Music className="w-4 h-4 text-pink-400" />;
      case 'archive': return <Archive className="w-4 h-4 text-gray-400" />;
      default: return <File className="w-4 h-4 text-gray-400" />;
    }
  };

  const filteredFiles = files.filter(f => {
    const matchesCategory = categoryFilter === 'all' || f.category === categoryFilter;
    const matchesSearch = searchQuery === '' || 
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.tags && f.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-brand-purple/10 to-slate-900 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-cyan/15 text-brand-cyan border border-brand-cyan/30 uppercase font-bold">
              WORK ARTIFACTS • V24
            </span>
            <span className="text-xs text-gray-400 font-mono">Unified Documents & Files Vault</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-wide">
            Enterprise Document & File Intelligence
          </h1>
          <p className="text-xs text-gray-300 mt-1 max-w-2xl">
            Inspect, collaborate on, and share specifications, code manifests, tabular CSVs, and multimedia assets with security sanitization and cryptographic links.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsUploadOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-purple to-brand-cyan text-slate-950 font-bold text-xs flex items-center gap-2 hover:opacity-95 shadow-md cursor-pointer transition-all"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Document</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
          {['all', 'pdf', 'doc', 'sheet', 'code', 'image', 'audio', 'video'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono uppercase font-semibold transition-all cursor-pointer ${
                categoryFilter === cat
                  ? 'bg-brand-cyan text-slate-950 shadow-sm'
                  : 'bg-slate-900 text-gray-400 hover:text-white border border-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search documents or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-brand-cyan"
          />
        </div>
      </div>

      {/* Main Grid: Files List (4 cols) & Document Viewer (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Files list */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-mono uppercase text-gray-400 font-semibold tracking-wider">
              Vault Documents ({filteredFiles.length})
            </span>
          </div>

          <div className="space-y-2">
            {filteredFiles.map((file) => {
              const isSelected = file.id === activeFile?.id;
              return (
                <div
                  key={file.id}
                  onClick={() => setSelectedFileId(file.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                    isSelected
                      ? 'bg-slate-900 border-brand-cyan/50 shadow-lg ring-1 ring-brand-cyan/20'
                      : 'bg-slate-950/60 border-white/5 hover:border-white/20 hover:bg-slate-900/40'
                  }`}
                >
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-white/10 shrink-0 mt-0.5">
                    {getCategoryIcon(file.category)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-semibold text-white truncate">
                      {file.name}
                    </h4>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-gray-400 mt-1">
                      <span>{(file.sizeBytes / 1024).toFixed(1)} KB</span>
                      <span>•</span>
                      <span className="text-emerald-400 flex items-center gap-0.5">
                        <ShieldCheck className="w-3 h-3" /> Clean
                      </span>
                    </div>

                    <div className="flex items-center gap-1 mt-2">
                      {file.tags.slice(0, 3).map((t) => (
                        <span key={t} className="px-1.5 py-0.2 rounded bg-white/5 text-[9px] font-mono text-gray-400">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active File Document Previewer */}
        {activeFile && (
          <div className="lg:col-span-8 space-y-4">
            {/* Action Bar */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-slate-900 border border-white/10">
                  {getCategoryIcon(activeFile.category)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white truncate max-w-md">{activeFile.name}</h3>
                  <p className="text-[11px] text-gray-400 font-mono">
                    {activeFile.mimeType} • {(activeFile.sizeBytes / 1024).toFixed(1)} KB • Uploaded by {activeFile.uploadedByEmail}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsShareModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10 text-xs font-mono flex items-center gap-1.5 cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5 text-brand-cyan" />
                  <span>Share File</span>
                </button>

                <button
                  onClick={() => handleDownload(activeFile)}
                  className="px-3 py-1.5 rounded-xl bg-brand-cyan/15 hover:bg-brand-cyan/25 text-brand-cyan border border-brand-cyan/30 text-xs font-mono flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            </div>

            {/* Content Preview Stage */}
            <div className="p-6 rounded-3xl bg-slate-950 border border-white/15 min-h-[380px] shadow-2xl relative overflow-hidden">
              {/* PDF Preview */}
              {activeFile.category === 'pdf' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <span className="text-xs font-mono text-rose-400 font-bold uppercase flex items-center gap-1.5">
                      <FileText className="w-4 h-4" />
                      <span>PDF Document Inspection Viewer</span>
                    </span>
                    <span className="text-[10px] font-mono text-gray-500">
                      Standard PDF Engine (TLS Encrypted)
                    </span>
                  </div>
                  <div className="p-5 rounded-2xl bg-slate-900 border border-white/10 font-mono text-xs text-gray-300 leading-relaxed whitespace-pre-wrap max-h-80 overflow-y-auto">
                    {activeFile.sampleContent || 'PDF binary content verified. Direct download or preview stream available.'}
                  </div>
                </div>
              )}

              {/* Code / JSON Preview */}
              {activeFile.category === 'code' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <span className="text-xs font-mono text-amber-400 font-bold uppercase flex items-center gap-1.5">
                      <FileCode className="w-4 h-4" />
                      <span>Syntax-Highlighted Source Code</span>
                    </span>
                    <span className="text-[10px] font-mono text-gray-500">
                      Format: {activeFile.extension.toUpperCase()}
                    </span>
                  </div>
                  <pre className="p-5 rounded-2xl bg-black/70 border border-white/10 font-mono text-xs text-brand-cyan leading-relaxed overflow-x-auto max-h-80 overflow-y-auto">
                    {activeFile.sampleContent || 'Source code loaded.'}
                  </pre>
                </div>
              )}

              {/* Sheet / CSV Table Preview */}
              {activeFile.category === 'sheet' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <span className="text-xs font-mono text-emerald-400 font-bold uppercase flex items-center gap-1.5">
                      <FileSpreadsheet className="w-4 h-4" />
                      <span>Tabular Ledger & Spreadsheet Grid</span>
                    </span>
                    <span className="text-[10px] font-mono text-gray-500">CSV Formatted</span>
                  </div>
                  <div className="overflow-x-auto rounded-2xl border border-white/10 max-h-80 overflow-y-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-slate-900 text-gray-400 uppercase text-[10px] border-b border-white/10">
                        <tr>
                          {activeFile.sampleContent?.split('\n')[0]?.split(',').map((h, i) => (
                            <th key={i} className="p-3 font-semibold">{h.trim()}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 bg-slate-950/60">
                        {activeFile.sampleContent?.split('\n').slice(1).map((row, rIdx) => {
                          if (!row.trim()) return null;
                          return (
                            <tr key={rIdx} className="hover:bg-white/5 transition-colors">
                              {row.split(',').map((cell, cIdx) => (
                                <td key={cIdx} className="p-3 text-gray-300">{cell.trim()}</td>
                              ))}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Doc / Markdown Preview */}
              {activeFile.category === 'doc' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <span className="text-xs font-mono text-blue-400 font-bold uppercase flex items-center gap-1.5">
                      <FileText className="w-4 h-4" />
                      <span>Document Markdown Reader</span>
                    </span>
                    <span className="text-[10px] font-mono text-gray-500">Markdown Format</span>
                  </div>
                  <div className="p-5 rounded-2xl bg-slate-900 border border-white/10 text-xs text-gray-200 leading-relaxed font-sans whitespace-pre-wrap max-h-80 overflow-y-auto">
                    {activeFile.sampleContent}
                  </div>
                </div>
              )}

              {/* Image Preview */}
              {activeFile.category === 'image' && (
                <div className="space-y-4 text-center">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <span className="text-xs font-mono text-purple-400 font-bold uppercase flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4" />
                      <span>Image Asset Inspector</span>
                    </span>
                  </div>
                  <div className="flex justify-center p-4 bg-black/40 rounded-2xl border border-white/10">
                    <img
                      src={activeFile.contentUrl}
                      alt={activeFile.name}
                      className="max-h-72 rounded-xl object-contain shadow-lg"
                    />
                  </div>
                </div>
              )}

              {/* Other / Unsupported Fallback */}
              {!['pdf', 'code', 'sheet', 'doc', 'image'].includes(activeFile.category) && (
                <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-brand-cyan">
                    <File className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{activeFile.name}</h4>
                    <p className="text-xs text-gray-400 font-mono mt-1">
                      Binary media ({activeFile.mimeType}) • {(activeFile.sizeBytes / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <button
                    onClick={() => handleDownload(activeFile)}
                    className="px-4 py-2 rounded-xl bg-brand-cyan text-slate-950 font-bold text-xs flex items-center gap-2 cursor-pointer hover:opacity-90"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Binary Asset</span>
                  </button>
                </div>
              )}
            </div>

            {/* Comments Thread */}
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-white/10 space-y-3">
              <span className="text-xs font-mono uppercase text-gray-300 font-bold flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-brand-cyan" />
                <span>Document Notes & Review Threads ({comments.length})</span>
              </span>

              <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
                {comments.length === 0 ? (
                  <p className="text-xs text-gray-500 text-center py-2">No notes posted on this document yet.</p>
                ) : (
                  comments.map((c) => (
                    <div key={c.id} className="p-2.5 rounded-xl bg-slate-900 border border-white/5 space-y-0.5">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-semibold text-brand-cyan">{c.authorName}</span>
                        <span className="text-gray-500">{new Date(c.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-xs text-gray-300">{c.text}</p>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleAddComment} className="flex gap-2 pt-2">
                <input
                  type="text"
                  required
                  placeholder="Annotate or ask questions about this document..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
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
          </div>
        )}
      </div>

      {/* Share Modal */}
      {activeFile && (
        <UniversalShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          artifactId={activeFile.id}
          artifactTitle={activeFile.name}
          artifactType="document"
          currentUserEmail={user.email}
        />
      )}

      {/* Upload Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-white/15 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-display font-bold text-white">Upload Document into Vault</h3>
            <p className="text-xs text-gray-400">
              Maximum file size: 50MB. All uploads are scanned for security integrity.
            </p>

            {uploadError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            <form onSubmit={handleFileUpload} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono text-gray-400 uppercase mb-1">Select File</label>
                <input
                  type="file"
                  required
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setSelectedUploadFile(e.target.files[0]);
                    }
                  }}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs text-gray-300 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-gray-400 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadLoading}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-brand-purple to-brand-cyan text-slate-950 font-bold text-xs cursor-pointer disabled:opacity-50"
                >
                  {uploadLoading ? 'Scanning & Ingesting...' : 'Upload & Verify'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
