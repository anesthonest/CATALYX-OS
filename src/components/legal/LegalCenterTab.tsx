/**
 * CATALYX Legal Compliance & Governance Center
 * Administrator and Compliance Portal for terms versioning, audit trail inspection,
 * and regulatory governance under the VINEXSAH TECHNOLOGIES project name.
 */

import React, { useState, useEffect } from 'react';
import {
  Scale,
  ShieldCheck,
  FileText,
  AlertTriangle,
  History,
  CheckCircle2,
  RefreshCw,
  Search,
  Building2,
  ExternalLink,
  PlusCircle,
  Eye
} from 'lucide-react';
import { LegalPolicyService, TermsAcceptanceRecord, LegalVersionMetadata } from '../../services/legal/legalPolicyService';

interface LegalCenterTabProps {
  currentUserEmail?: string;
  onViewDocument?: (slug: string) => void;
}

export const LegalCenterTab: React.FC<LegalCenterTabProps> = ({
  currentUserEmail = 'anesthonest81@gmail.com',
  onViewDocument
}) => {
  const [metadata, setMetadata] = useState<LegalVersionMetadata>(LegalPolicyService.getVersionMetadata());
  const [auditLogs, setAuditLogs] = useState<TermsAcceptanceRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [publishModalOpen, setPublishModalOpen] = useState<boolean>(false);

  // New version form
  const [newVersionTag, setNewVersionTag] = useState<string>('v2026.3.2');
  const [changelogText, setChangelogText] = useState<string>('');
  const [publishError, setPublishError] = useState<string | null>(null);
  const [publishSuccess, setPublishSuccess] = useState<boolean>(false);

  const fetchAuditData = () => {
    setLoading(true);
    fetch('/api/legal/audit-logs')
      .then(res => res.json())
      .then(data => {
        if (data.logs && Array.isArray(data.logs)) {
          setAuditLogs(data.logs);
        } else {
          setAuditLogs(LegalPolicyService.getAuditLogs());
        }
      })
      .catch(() => {
        setAuditLogs(LegalPolicyService.getAuditLogs());
      })
      .finally(() => {
        setLoading(false);
      });

    fetch('/api/legal/terms')
      .then(res => res.json())
      .then(data => {
        if (data.metadata) setMetadata(data.metadata);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchAuditData();
  }, []);

  const handlePublishVersion = async (e: React.FormEvent) => {
    e.preventDefault();
    setPublishError(null);
    setPublishSuccess(false);

    if (!newVersionTag.trim() || !changelogText.trim()) {
      setPublishError('Please provide both a version identifier and an audit changelog.');
      return;
    }

    try {
      const res = await fetch('/api/legal/admin/update-version', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newVersion: newVersionTag.trim(),
          changelog: changelogText.trim(),
          adminActor: currentUserEmail,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update version');

      setMetadata(data.metadata);
      setPublishSuccess(true);
      fetchAuditData();
      setTimeout(() => {
        setPublishModalOpen(false);
        setPublishSuccess(false);
        setChangelogText('');
      }, 1500);
    } catch (err: any) {
      setPublishError(err.message || 'Error updating terms version.');
    }
  };

  const filteredLogs = auditLogs.filter(log =>
    log.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.termsVersion.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.acceptanceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.ipAddress.includes(searchQuery)
  );

  return (
    <div id="catalyx-legal-center-tab" className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Top Banner & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Scale className="w-4 h-4" />
            <span>Governance & Regulatory Center</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Legal Covenants & Acceptance Audit</h2>
          <p className="text-sm text-slate-400 mt-1">
            Authoritative tracking of customer consent, IP retention guarantees, and regulatory compliance under VINEXSAH TECHNOLOGIES.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchAuditData}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 flex items-center space-x-2 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Audit</span>
          </button>
          <button
            onClick={() => setPublishModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-lg shadow-indigo-600/20 flex items-center space-x-2 transition-colors cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Publish New Version</span>
          </button>
        </div>
      </div>

      {/* Mandatory Operational Disclosure Box */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-amber-950/30 border border-slate-800 shadow-lg">
        <div className="flex items-start space-x-3.5">
          <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div className="space-y-1.5 flex-1 text-xs">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white text-sm">Regulatory Status & Operational Entity Disclosure</h3>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono border border-amber-500/30">
                Statutory Notice
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              <strong className="text-amber-300">VINEXSAH TECHNOLOGIES Project:</strong> CATALYX is developed and operated under the{' '}
              <span className="font-semibold text-white">VINEXSAH TECHNOLOGIES</span> project. All agreements, covenants, and
              terms are binding master operating agreements between users and the project operators.
            </p>
            <div className="pt-1 flex flex-wrap gap-4 text-[11px] text-slate-400">
              <div>Lead Operations Contact: <span className="text-slate-200">anesthonest81@gmail.com</span></div>
              <div>Operating Jurisdiction: <span className="text-slate-200">Global / East Africa Commercial Standard</span></div>
              <div>Cryptographic Verification: <span className="text-slate-200 font-mono">SHA-256 Validated</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs font-medium text-slate-400">Active Terms Version</div>
          <div className="text-2xl font-bold text-indigo-400 mt-1 font-mono">{metadata.version}</div>
          <div className="text-[11px] text-slate-400 mt-1">Effective: {new Date(metadata.effectiveDate).toLocaleDateString()}</div>
        </div>

        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs font-medium text-slate-400">Recorded User Consents</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{auditLogs.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">100% Cryptographically Hashed</div>
        </div>

        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs font-medium text-slate-400">Platform Revenue Share</div>
          <div className="text-2xl font-bold text-white mt-1">0.25% - 0.50%</div>
          <div className="text-[11px] text-slate-400 mt-1">0.25% Indiv • 0.27% Group • 0.50% Org</div>
        </div>

        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs font-medium text-slate-400">IP Ownership Covenants</div>
          <div className="text-2xl font-bold text-blue-400 mt-1">100% Creator</div>
          <div className="text-[11px] text-slate-400 mt-1">Limited Operational License Only</div>
        </div>
      </div>

      {/* Policy Quick Links */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
            <FileText className="w-4 h-4 text-indigo-400" />
            <span>Master Legal Policy Suite</span>
          </h3>
          <span className="text-xs text-slate-400">Click any document to inspect full text</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {[
            { slug: 'terms', title: 'Terms of Service', tag: 'Core' },
            { slug: 'privacy', title: 'Privacy Policy', tag: 'Data' },
            { slug: 'acceptable-use', title: 'Acceptable Use', tag: 'Safety' },
            { slug: 'refunds', title: 'Refunds & Disputes', tag: 'Finance' },
            { slug: 'payments', title: 'Payments & Billing', tag: 'Finance' },
            { slug: 'payouts', title: 'Creator Payouts', tag: 'Revenue' },
            { slug: 'marketplace-policy', title: 'Marketplace Terms', tag: 'Commerce' },
            { slug: 'intellectual-property', title: 'IP & Rights Notice', tag: 'Rights' },
            { slug: 'copyright', title: 'DMCA & Copyright', tag: 'Legal' },
            { slug: 'community-guidelines', title: 'Community Rules', tag: 'Civility' },
          ].map(p => (
            <button
              key={p.slug}
              onClick={() => {
                if (onViewDocument) onViewDocument(p.slug);
              }}
              className="p-3 rounded-lg bg-slate-850 hover:bg-slate-800 border border-slate-750 text-left transition-colors flex flex-col justify-between group"
            >
              <div>
                <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded">
                  {p.tag}
                </span>
                <div className="text-xs font-semibold text-slate-200 mt-1 group-hover:text-white">
                  {p.title}
                </div>
              </div>
              <div className="text-[10px] text-slate-400 mt-2 flex items-center justify-between">
                <span>/{p.slug}</span>
                <Eye className="w-3 h-3 text-slate-400 group-hover:text-indigo-400" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Acceptance Audit Log Table */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-white flex items-center space-x-2">
              <History className="w-4 h-4 text-emerald-400" />
              <span>Immutable Terms Acceptance Audit Trail</span>
            </h3>
            <p className="text-xs text-slate-400">
              Cryptographically timestamped user consent records required for legal enforceability.
            </p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search user, IP, or version..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Audit ID</th>
                  <th className="py-3 px-4">User Email</th>
                  <th className="py-3 px-4">Terms Version</th>
                  <th className="py-3 px-4">Client IP</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      No matching audit records found.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map(log => (
                    <tr key={log.acceptanceId} className="hover:bg-slate-850/50 transition-colors">
                      <td className="py-3 px-4 font-mono text-[11px] text-indigo-300">
                        {log.acceptanceId}
                      </td>
                      <td className="py-3 px-4 font-medium text-white">{log.userEmail}</td>
                      <td className="py-3 px-4 font-mono text-slate-300">
                        <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                          {log.termsVersion}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-400">{log.ipAddress}</td>
                      <td className="py-3 px-4 text-slate-400">
                        {new Date(log.acceptedAt).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-950/40 text-emerald-400 border border-emerald-800/40">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Binding Consent
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Publish New Version Modal */}
      {publishModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Scale className="w-5 h-5 text-indigo-400" />
                <span>Publish New Legal Covenants Version</span>
              </h3>
              <button
                onClick={() => setPublishModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePublishVersion} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">New Version Identifier</label>
                <input
                  type="text"
                  value={newVersionTag}
                  onChange={e => setNewVersionTag(e.target.value)}
                  placeholder="e.g. v2026.3.2"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Changelog & Legal Justification</label>
                <textarea
                  rows={4}
                  value={changelogText}
                  onChange={e => setChangelogText(e.target.value)}
                  placeholder="Summarize the amendments requiring mandatory user re-consent..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-800/40 text-amber-300 flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>
                  Publishing a new terms version activates the mandatory re-consent guard across all active user sessions.
                </p>
              </div>

              {publishError && (
                <div className="p-2.5 rounded bg-red-950/40 border border-red-800 text-red-300">
                  {publishError}
                </div>
              )}

              {publishSuccess && (
                <div className="p-2.5 rounded bg-emerald-950/40 border border-emerald-800 text-emerald-300 flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Version successfully published! Enforcing re-consent.</span>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPublishModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-md shadow-indigo-600/30"
                >
                  Publish & Require Re-Consent
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
