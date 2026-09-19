import React, { useState, useEffect } from 'react';
import { 
  X, 
  Share2, 
  Link as LinkIcon, 
  Shield, 
  Users, 
  Clock, 
  Lock, 
  Download, 
  Trash2, 
  Check, 
  Copy, 
  AlertTriangle, 
  Eye, 
  MessageSquare, 
  Edit3, 
  Sliders,
  History
} from 'lucide-react';
import { 
  ShareableArtifactType, 
  SharePermission, 
  ShareTargetType, 
  ShareRecord, 
  ShareAuditLog 
} from '../types';
import { sharingService } from '../services/sharingService';

interface UniversalShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  artifactId: string;
  artifactTitle: string;
  artifactType: ShareableArtifactType;
  currentUserEmail: string;
}

export const UniversalShareModal: React.FC<UniversalShareModalProps> = ({
  isOpen,
  onClose,
  artifactId,
  artifactTitle,
  artifactType,
  currentUserEmail
}) => {
  const [activeTab, setActiveTab] = useState<'invite' | 'link' | 'audit'>('invite');

  // Invite Form State
  const [targetType, setTargetType] = useState<ShareTargetType>('user');
  const [targetIdentifier, setTargetIdentifier] = useState('');
  const [permission, setPermission] = useState<SharePermission>('VIEW');
  const [expiresInDays, setExpiresInDays] = useState<number>(7);
  const [downloadAllowed, setDownloadAllowed] = useState(true);

  // Link Form State
  const [linkPermission, setLinkPermission] = useState<SharePermission>('VIEW');
  const [passcodeProtected, setPasscodeProtected] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [linkExpiresInDays, setLinkExpiresInDays] = useState<number>(7);
  const [linkDownloadAllowed, setLinkDownloadAllowed] = useState(false);

  // Data & status state
  const [shares, setShares] = useState<ShareRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<ShareAuditLog[]>([]);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadData = () => {
    if (!artifactId) return;
    const s = sharingService.getSharesForArtifact(artifactId);
    const logs = sharingService.getAuditLogsForArtifact(artifactId);
    setShares(s);
    setAuditLogs(logs);
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
      setActionSuccess(null);
      setActionError(null);
    }
  }, [isOpen, artifactId]);

  if (!isOpen) return null;

  const handleCreateInviteShare = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetIdentifier.trim()) {
      setActionError('Please enter a valid user email or team/workspace identifier.');
      return;
    }

    try {
      sharingService.createShare({
        artifactId,
        artifactTitle,
        artifactType,
        createdByEmail: currentUserEmail,
        targetType,
        targetIdentifier: targetIdentifier.trim(),
        permission,
        expiresInDays: expiresInDays > 0 ? expiresInDays : undefined,
        downloadAllowed
      });

      setTargetIdentifier('');
      setActionSuccess(`Successfully shared with ${targetIdentifier} (${permission})`);
      setActionError(null);
      loadData();
    } catch (err: any) {
      setActionError(err.message || 'Failed to create share permission');
    }
  };

  const handleGenerateShareLink = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const record = sharingService.createShare({
        artifactId,
        artifactTitle,
        artifactType,
        createdByEmail: currentUserEmail,
        targetType: 'link',
        targetIdentifier: 'public_secure_link',
        permission: linkPermission,
        expiresInDays: linkExpiresInDays > 0 ? linkExpiresInDays : undefined,
        passcode: passcodeProtected ? passcode : undefined,
        downloadAllowed: linkDownloadAllowed
      });

      setActionSuccess('Cryptographically signed share link generated.');
      setActionError(null);
      loadData();
      setActiveTab('audit');
    } catch (err: any) {
      setActionError(err.message || 'Failed to generate link');
    }
  };

  const handleRevokeShare = (shareId: string) => {
    if (confirm('Are you sure you want to revoke this share link? Downstream access will be immediately terminated.')) {
      sharingService.revokeShare(shareId, currentUserEmail);
      setActionSuccess('Share access revoked immediately.');
      loadData();
    }
  };

  const handleCopyLink = (share: ShareRecord) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://catalyx.io';
    const shareUrl = `${origin}/?tab=${artifactType === 'presentation' ? 'presentations' : artifactType === 'video' ? 'media' : artifactType === 'demo' ? 'demos' : artifactType === 'meeting' ? 'meetings' : 'files'}&item=${artifactId}&shareToken=${share.shareToken}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedToken(share.id);
    setTimeout(() => setCopiedToken(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-slate-900 border border-white/15 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-purple/20 border border-brand-purple/40 flex items-center justify-center text-brand-cyan">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-display font-bold text-white tracking-wide">
                  Share & Collaborate
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-brand-cyan/15 text-brand-cyan border border-brand-cyan/30 uppercase">
                  {artifactType}
                </span>
              </div>
              <p className="text-xs text-gray-400 truncate max-w-md">
                {artifactTitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-white/10 bg-slate-950/30">
          <button
            onClick={() => setActiveTab('invite')}
            className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer border-b-2 ${
              activeTab === 'invite'
                ? 'border-brand-cyan text-brand-cyan'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Direct Collaborators</span>
          </button>
          <button
            onClick={() => setActiveTab('link')}
            className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer border-b-2 ${
              activeTab === 'link'
                ? 'border-brand-cyan text-brand-cyan'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <LinkIcon className="w-4 h-4" />
            <span>Secure Share Link</span>
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer border-b-2 ${
              activeTab === 'audit'
                ? 'border-brand-cyan text-brand-cyan'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Active Access & Audit ({shares.length})</span>
          </button>
        </div>

        {/* Feedback notices */}
        {actionSuccess && (
          <div className="mx-6 mt-3 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}
        {actionError && (
          <div className="mx-6 mt-3 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{actionError}</span>
          </div>
        )}

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* TAB 1: DIRECT INVITE */}
          {activeTab === 'invite' && (
            <form onSubmit={handleCreateInviteShare} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-gray-400 uppercase mb-1">
                    Target Type
                  </label>
                  <select
                    value={targetType}
                    onChange={(e) => setTargetType(e.target.value as ShareTargetType)}
                    className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-brand-cyan"
                  >
                    <option value="user">Specific Person (Email)</option>
                    <option value="team">Team / Squad</option>
                    <option value="workspace">Entire Workspace</option>
                    <option value="organization">Full Organization</option>
                    <option value="external">External Verified Partner</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-gray-400 uppercase mb-1">
                    Identifier (Email or Name)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={targetType === 'user' ? 'colleague@catalyx.io' : 'e.g. Engineering Alpha'}
                    value={targetIdentifier}
                    onChange={(e) => setTargetIdentifier(e.target.value)}
                    className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-brand-cyan"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-gray-400 uppercase mb-1">
                    Permission Tier
                  </label>
                  <select
                    value={permission}
                    onChange={(e) => setPermission(e.target.value as SharePermission)}
                    className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-brand-cyan font-bold focus:outline-brand-cyan"
                  >
                    <option value="VIEW">VIEW (Read-Only)</option>
                    <option value="COMMENT">COMMENT (Add Notes)</option>
                    <option value="EDIT">EDIT (Collaborative)</option>
                    <option value="MANAGE">MANAGE (Full Admin)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-gray-400 uppercase mb-1">
                    Expiration
                  </label>
                  <select
                    value={expiresInDays}
                    onChange={(e) => setExpiresInDays(Number(e.target.value))}
                    className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-brand-cyan"
                  >
                    <option value={1}>24 Hours</option>
                    <option value={7}>7 Days</option>
                    <option value={30}>30 Days</option>
                    <option value={90}>90 Days</option>
                    <option value={0}>Never (Persistent)</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="chk_download"
                    checked={downloadAllowed}
                    onChange={(e) => setDownloadAllowed(e.target.checked)}
                    className="rounded bg-slate-950 border-white/20 text-brand-cyan focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="chk_download" className="text-xs text-gray-300 cursor-pointer select-none">
                    Allow Raw Download
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-gradient-to-r from-brand-purple to-brand-cyan text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg hover:opacity-95 transition-all cursor-pointer mt-2"
              >
                <Users className="w-4 h-4" />
                <span>Grant Direct Access</span>
              </button>
            </form>
          )}

          {/* TAB 2: PUBLIC / SECURE LINK */}
          {activeTab === 'link' && (
            <form onSubmit={handleGenerateShareLink} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-brand-purple/10 border border-brand-purple/30 flex items-start gap-3">
                <Shield className="w-5 h-5 text-brand-cyan shrink-0 mt-0.5" />
                <p className="text-xs text-gray-300 leading-relaxed">
                  Cryptographic share links provide direct access with mandatory audit tracking. All links can be revoked instantly at any time.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-gray-400 uppercase mb-1">
                    Link Access Level
                  </label>
                  <select
                    value={linkPermission}
                    onChange={(e) => setLinkPermission(e.target.value as SharePermission)}
                    className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-brand-cyan font-bold focus:outline-brand-cyan"
                  >
                    <option value="VIEW">VIEW (Read-only)</option>
                    <option value="COMMENT">COMMENT (Can post notes)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-gray-400 uppercase mb-1">
                    Link Validity Window
                  </label>
                  <select
                    value={linkExpiresInDays}
                    onChange={(e) => setLinkExpiresInDays(Number(e.target.value))}
                    className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-brand-cyan"
                  >
                    <option value={1}>24 Hours</option>
                    <option value={7}>7 Days</option>
                    <option value={30}>30 Days</option>
                    <option value={0}>Never (Until Revoked)</option>
                  </select>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/50 border border-white/10 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-amber-400" />
                    <span className="text-xs text-white font-medium">Passcode Protection</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={passcodeProtected}
                    onChange={(e) => setPasscodeProtected(e.target.checked)}
                    className="rounded bg-slate-950 border-white/20 text-brand-cyan cursor-pointer"
                  />
                </div>

                {passcodeProtected && (
                  <div>
                    <input
                      type="text"
                      required={passcodeProtected}
                      placeholder="e.g. v24launch"
                      value={passcode}
                      onChange={(e) => setPasscode(e.target.value)}
                      className="w-full bg-slate-900 border border-white/15 rounded-lg px-3 py-1.5 text-xs text-amber-300 placeholder-gray-600 focus:outline-none"
                    />
                    <span className="text-[10px] text-gray-400 mt-1 block">
                      Recipients will be prompted for this passcode before accessing the resource.
                    </span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-gradient-to-r from-brand-cyan to-brand-purple text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg hover:opacity-95 transition-all cursor-pointer"
              >
                <LinkIcon className="w-4 h-4" />
                <span>Generate Cryptographic Share Link</span>
              </button>
            </form>
          )}

          {/* TAB 3: ACTIVE SHARES & AUDIT */}
          {activeTab === 'audit' && (
            <div className="space-y-5">
              {/* Active Shares Table */}
              <div>
                <h4 className="text-xs font-mono uppercase text-gray-400 tracking-wider mb-2">
                  Active Access Grants ({shares.length})
                </h4>
                {shares.length === 0 ? (
                  <p className="text-xs text-gray-500 py-3 text-center">No active shares found for this artifact.</p>
                ) : (
                  <div className="space-y-2">
                    {shares.map((share) => (
                      <div
                        key={share.id}
                        className={`p-3 rounded-xl border transition-all ${
                          share.revoked
                            ? 'bg-rose-950/20 border-rose-500/30 opacity-70'
                            : 'bg-slate-950/60 border-white/10'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-white truncate">
                                {share.targetIdentifier}
                              </span>
                              <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ${
                                share.permission === 'MANAGE' ? 'bg-amber-500/10 text-amber-300 border-amber-500/30' :
                                share.permission === 'EDIT' ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30' :
                                'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                              }`}>
                                {share.permission}
                              </span>
                              {share.revoked && (
                                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-400 border border-rose-500/40">
                                  REVOKED
                                </span>
                              )}
                              {share.passcodeProtected && (
                                <span className="text-[9px] font-mono text-amber-400 flex items-center gap-0.5">
                                  <Lock className="w-2.5 h-2.5" /> Passcode
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-gray-400 mt-0.5">
                              Created by {share.createdByEmail} • {share.accessCount} visits
                              {share.expiresAt && ` • Expires: ${new Date(share.expiresAt).toLocaleDateString()}`}
                            </p>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {!share.revoked && (
                              <button
                                onClick={() => handleCopyLink(share)}
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-brand-cyan text-xs flex items-center gap-1 cursor-pointer"
                                title="Copy Share Link"
                              >
                                {copiedToken === share.id ? (
                                  <span className="text-emerald-400 flex items-center gap-1 font-mono text-[10px]">
                                    <Check className="w-3 h-3" /> Copied
                                  </span>
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            )}

                            {!share.revoked && (
                              <button
                                onClick={() => handleRevokeShare(share.id)}
                                className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs transition-colors cursor-pointer"
                                title="Revoke Access Instantly"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Immutable Audit Log */}
              <div>
                <h4 className="text-xs font-mono uppercase text-gray-400 tracking-wider mb-2 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Immutable Access Audit Log ({auditLogs.length})</span>
                </h4>
                <div className="max-h-40 overflow-y-auto space-y-1 rounded-xl bg-slate-950/80 border border-white/10 p-2 font-mono text-[10px]">
                  {auditLogs.length === 0 ? (
                    <p className="text-gray-500 text-center py-2">No audit entries recorded.</p>
                  ) : (
                    auditLogs.map((log) => (
                      <div key={log.id} className="p-1.5 border-b border-white/5 flex items-start justify-between gap-2">
                        <div>
                          <span className={`font-bold mr-1.5 ${
                            log.action === 'BLOCKED_ATTEMPT' ? 'text-rose-400' :
                            log.action === 'REVOKED' ? 'text-amber-400' :
                            log.action === 'CREATED' ? 'text-brand-cyan' : 'text-emerald-400'
                          }`}>
                            [{log.action}]
                          </span>
                          <span className="text-gray-300">{log.details}</span>
                        </div>
                        <span className="text-gray-500 shrink-0">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-white/10 bg-slate-950/80 flex items-center justify-between text-xs text-gray-500">
          <span>Security Token: TLS 1.3 / End-to-End Cryptographic Validation</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
