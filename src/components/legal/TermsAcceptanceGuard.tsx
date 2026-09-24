/**
 * CATALYX Terms Acceptance Guard Component
 * Enforces mandatory, recorded acceptance of terms before allowing execution or workspace access.
 *
 * REGULATORY NOTICE:
 * CATALYX is developed and operated under the VINEXSAH TECHNOLOGIES project.
 */

import React, { useState, useEffect } from 'react';
import { ShieldCheck, FileText, AlertTriangle, CheckCircle2, Lock, ExternalLink, Scale } from 'lucide-react';
import { UserProfile } from '../../types';
import { dbService } from '../../firebase';
import { LegalPolicyService } from '../../services/legal/legalPolicyService';

interface TermsAcceptanceGuardProps {
  user?: UserProfile | null;
  currentUser?: UserProfile | null;
  onAccepted?: (updatedUser: UserProfile) => void;
  onTermsAccepted?: (version: string) => void;
  onNavigateToLegal?: (slug: string) => void;
  children: React.ReactNode;
}

export const TermsAcceptanceGuard: React.FC<TermsAcceptanceGuardProps> = ({
  user,
  currentUser,
  onAccepted,
  onTermsAccepted,
  onNavigateToLegal,
  children,
}) => {
  const activeUser = currentUser !== undefined ? currentUser : (user ?? null);
  const currentVersion = LegalPolicyService.CURRENT_VERSION;
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [acknowledgedCheckbox, setAcknowledgedCheckbox] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'summary' | 'ownership' | 'revenue' | 'disclosure'>('summary');
  const [serverError, setServerError] = useState<string | null>(null);

  // Check acceptance status on mount or user change
  useEffect(() => {
    if (!activeUser) {
      setIsOpen(false);
      return;
    }

    // Check if user profile already recorded current version
    const profileAccepted = activeUser.termsAcceptedVersion === currentVersion;
    if (!profileAccepted) {
      // Also verify via server
      fetch(`/api/legal/status/${encodeURIComponent(activeUser.uid)}?email=${encodeURIComponent(activeUser.email)}`)
        .then(res => res.json())
        .then(data => {
          if (!data.accepted) {
            setIsOpen(true);
          }
        })
        .catch(() => {
          // If server call fails, open modal if not in profile
          if (!profileAccepted) {
            setIsOpen(true);
          }
        });
    } else {
      setIsOpen(false);
    }
  }, [activeUser, currentVersion]);

  const handleAcceptTerms = async () => {
    if (!activeUser || !acknowledgedCheckbox || submitting) return;

    setSubmitting(true);
    setServerError(null);

    try {
      // 1. Authoritative Server Record
      const response = await fetch('/api/legal/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: activeUser.uid,
          userEmail: activeUser.email,
          termsVersion: currentVersion,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to record server-side terms acceptance.');
      }

      // 2. Client Profile Persistence
      const updated = await dbService.updateUserTermsAcceptance(activeUser.uid, currentVersion);
      setIsOpen(false);
      if (onTermsAccepted) {
        onTermsAccepted(currentVersion);
      }
      if (onAccepted) {
        onAccepted(updated);
      }
    } catch (err: any) {
      console.error('Error accepting terms:', err);
      setServerError(err.message || 'An unexpected error occurred while recording acceptance.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {children}

      {/* Mandatory Terms Modal */}
      {isOpen && (
        <div
          id="catalyx-terms-acceptance-overlay"
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 overflow-y-auto animate-in fade-in duration-200"
        >
          <div
            id="catalyx-terms-acceptance-card"
            className="w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950/50 to-slate-900 border-b border-slate-800 p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-indigo-400">
                    <Scale className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h2 className="text-xl font-bold text-white tracking-tight">CATALYX Regulatory Covenants</h2>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono border border-indigo-500/30">
                        {currentVersion}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Mandatory terms of service, intellectual property ownership, and operational policies.
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-1 text-xs text-amber-400/90 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20 font-medium">
                  <Lock className="w-3.5 h-3.5 mr-1" />
                  Action Required
                </div>
              </div>

              {/* Status Banner */}
              <div className="mt-4 p-3 rounded-lg bg-slate-800/80 border border-slate-700/80 flex items-start space-x-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-300 leading-relaxed">
                  <strong className="text-amber-300">Operational Notice:</strong> CATALYX is developed and operated under the{' '}
                  <span className="font-semibold text-white">VINEXSAH TECHNOLOGIES</span> project.
                </p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-800 bg-slate-900/60 px-6 pt-3 space-x-2 text-xs font-medium">
              {[
                { id: 'summary', label: '1. Executive Summary', icon: FileText },
                { id: 'ownership', label: '2. IP & Content Ownership', icon: ShieldCheck },
                { id: 'revenue', label: '3. Platform Fees (0.25% - 0.50%)', icon: Scale },
                { id: 'disclosure', label: '4. Legal Disclaimers', icon: AlertTriangle },
              ].map(tab => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-2 py-2.5 px-3 border-b-2 transition-all ${
                      active
                        ? 'border-indigo-500 text-indigo-300 font-semibold bg-indigo-500/5 rounded-t-lg'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Scrollable Content Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 text-sm text-slate-300 leading-relaxed bg-slate-950/40">
              {activeTab === 'summary' && (
                <div className="space-y-3">
                  <h3 className="text-base font-semibold text-white">General Terms of Use</h3>
                  <p>
                    Welcome to CATALYX, the executive intelligence and autonomous execution operating system. By entering the workspace,
                    initiating task flows, or interacting with autonomous agent orchestrations, you agree to comply with our master covenants.
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-400">
                    <li>All accounts must be represented by an authorized person of legal age.</li>
                    <li>Credentials and private API tokens must be safeguarded with reasonable care.</li>
                    <li>Autonomous workloads must strictly adhere to compute quotas and safety bounds.</li>
                    <li>All commercial transactions through Pesapal and Bank Transfer are settled authoritatively via double-entry records.</li>
                  </ul>
                  <div className="pt-2 flex flex-wrap gap-2 text-xs">
                    {['terms', 'privacy', 'acceptable-use', 'refunds', 'payments'].map(slug => (
                      <button
                        key={slug}
                        onClick={() => {
                          if (onNavigateToLegal) onNavigateToLegal(slug);
                        }}
                        className="inline-flex items-center text-indigo-400 hover:text-indigo-300 underline underline-offset-2"
                      >
                        View /{slug}
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'ownership' && (
                <div className="space-y-3">
                  <h3 className="text-base font-semibold text-emerald-300 flex items-center">
                    <ShieldCheck className="w-5 h-5 mr-2 text-emerald-400" />
                    You Retain 100% Content & IP Ownership
                  </h3>
                  <p>
                    We respect your intellectual property. All workflows, proprietary prompts, neural agent setups, enterprise datasets,
                    and operational outcomes authored or uploaded by you remain your exclusive property.
                  </p>
                  <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-800/40 text-xs text-emerald-200">
                    <strong className="block text-emerald-300 mb-1">Limited Operational License:</strong>
                    You grant CATALYX and the operators of the VINEXSAH TECHNOLOGIES project only the narrow, non-exclusive license strictly
                    necessary to process, store, host, and transmit your data to perform the computational functions you initiate.
                  </div>
                </div>
              )}

              {activeTab === 'revenue' && (
                <div className="space-y-3">
                  <h3 className="text-base font-semibold text-indigo-300 flex items-center">
                    <Scale className="w-5 h-5 mr-2 text-indigo-400" />
                    Authoritative Centralized Revenue Share & Platform Fee Policy
                  </h3>
                  <p>
                    When products, prompt workflows, digital twins, datasets, or autonomous services are licensed or sold through the CATALYX marketplace, the
                    following authoritative revenue-sharing policy applies:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                    <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700">
                      <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Standard Individual</div>
                      <div className="text-2xl font-bold text-white mt-1">0.25% <span className="text-xs text-slate-400 font-normal">fee (25 bps)</span></div>
                      <p className="text-xs text-slate-300 mt-1.5">
                        Creator receives <strong className="text-emerald-400">99.75%</strong> gross platform earnings.
                      </p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700">
                      <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Group / Syndicate</div>
                      <div className="text-2xl font-bold text-white mt-1">0.27% <span className="text-xs text-slate-400 font-normal">fee (27 bps)</span></div>
                      <p className="text-xs text-slate-300 mt-1.5">
                        Group retains <strong className="text-emerald-400">99.73%</strong> gross platform earnings.
                      </p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700">
                      <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Organization / Enterprise</div>
                      <div className="text-2xl font-bold text-white mt-1">0.50% <span className="text-xs text-slate-400 font-normal">fee (50 bps)</span></div>
                      <p className="text-xs text-slate-300 mt-1.5">
                        Organization receives <strong className="text-emerald-400">99.50%</strong> gross platform earnings.
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 italic">
                    Note: Stated percentages are pre-payout calculations before applicable third-party gateway deductions, taxes, currency
                    conversion, and cooling-off refunds. They do not constitute guaranteed final payout amounts.
                  </p>
                </div>
              )}

              {activeTab === 'disclosure' && (
                <div className="space-y-3">
                  <h3 className="text-base font-semibold text-amber-300 flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2 text-amber-400" />
                    Disclaimers & Limitation of Liability
                  </h3>
                  <p className="text-xs">
                    CATALYX AND ALL AUTONOMOUS SERVICES ARE PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND. THE PROJECT OPERATORS UNDER
                    VINEXSAH TECHNOLOGIES DISCLAIM ALL IMPLIED WARRANTIES TO THE MAXIMUM EXTENT PERMITTED BY LAW.
                  </p>
                  <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 text-xs text-slate-400">
                    Questions, inquiries, or dispute claims should be directed to the administrator email:{' '}
                    <span className="text-indigo-400 font-mono">anesthonest81@gmail.com</span>.
                  </div>
                </div>
              )}
            </div>

            {/* Error message */}
            {serverError && (
              <div className="px-6 py-2 bg-red-950/40 border-t border-red-800/50 text-xs text-red-300 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2 text-red-400 shrink-0" />
                <span>{serverError}</span>
              </div>
            )}

            {/* Modal Footer with Affirmation */}
            <div className="border-t border-slate-800 bg-slate-900 p-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <label className="flex items-start space-x-3 cursor-pointer select-none max-w-lg">
                <input
                  id="terms-affirmation-checkbox"
                  type="checkbox"
                  checked={acknowledgedCheckbox}
                  onChange={e => setAcknowledgedCheckbox(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-slate-600 bg-slate-800 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <span className="text-xs text-slate-300 leading-snug">
                  I solemnly confirm that I have read, understood, and accept the{' '}
                  <strong className="text-white">CATALYX Master Terms of Service ({currentVersion})</strong>, IP ownership covenants,
                  platform fee structure, and the operational status notice regarding the VINEXSAH TECHNOLOGIES project name.
                </span>
              </label>

              <button
                id="btn-confirm-accept-terms"
                onClick={handleAcceptTerms}
                disabled={!acknowledgedCheckbox || submitting}
                className={`px-6 py-3 rounded-xl font-medium text-sm flex items-center justify-center space-x-2 shrink-0 transition-all ${
                  acknowledgedCheckbox && !submitting
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 cursor-pointer'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                }`}
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Recording Acceptance...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Accept & Enter Workspace</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
