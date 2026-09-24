import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, ACHIEVEMENTS } from '../types';
import { 
  User, Award, Sparkles, Share2, Clipboard, Zap, CheckCircle2,
  Lock, KeyRound, Database, RefreshCw, Star, Mail, ShieldCheck,
  AlertCircle, LogOut, Check, X, ShieldAlert
} from 'lucide-react';
import { saveFirebaseConfig, getSavedFirebaseConfig } from '../firebase';
import { authService, AuthResult } from '../services/authService';

interface ProfileTabProps {
  user: UserProfile;
  onUpgrade: () => void;
  onUpdateUsername: (newName: string) => Promise<void>;
  onUserUpdated?: (updated: UserProfile) => void;
  onLogout?: () => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  user,
  onUpgrade,
  onUpdateUsername,
  onUserUpdated,
  onLogout
}) => {
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState(user.username);
  const [copiedLink, setCopiedLink] = useState(false);
  
  // Custom Firebase setup inputs
  const [fbApiKey, setFbApiKey] = useState('');
  const [fbProjectId, setFbProjectId] = useState('');
  const [showConfigDrawer, setShowConfigDrawer] = useState(false);
  const [fbSuccessMsg, setFbSuccessMsg] = useState('');

  // Email & Password Management State
  const [showEmailChangeModal, setShowEmailChangeModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [currentPasswordForEmail, setCurrentPasswordForEmail] = useState('');
  const [emailChangeStatus, setEmailChangeStatus] = useState<{ error?: string; success?: string }>({});

  const [showPasswordChangeModal, setShowPasswordChangeModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordChangeStatus, setPasswordChangeStatus] = useState<{ error?: string; success?: string }>({});

  // Email Verification State
  const [verificationCode, setVerificationCode] = useState('');
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationNotice, setVerificationNotice] = useState('');
  const [verificationStatus, setVerificationStatus] = useState<{ error?: string; success?: string }>({});

  const currentSaved = getSavedFirebaseConfig();

  const handleCopyLink = () => {
    const publicUrl = `${window.location.origin}/profile.html?user=${user.uid}`;
    navigator.clipboard.writeText(publicUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempName.trim()) return;
    await onUpdateUsername(tempName.trim());
    setEditingName(false);
  };

  const handleStartEmailVerification = async () => {
    setVerificationStatus({});
    const res = await authService.requestEmailVerification(user.uid);
    if (res.success) {
      setVerificationNotice(res.message);
      if (res.code) {
        setVerificationCode(res.code); // Pre-fill in local preview environment
      }
      setShowVerificationModal(true);
    } else {
      setVerificationStatus({ error: res.message });
    }
  };

  const handleConfirmEmailVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerificationStatus({});
    const res = await authService.verifyEmail(user.uid, verificationCode);
    if (res.success && res.user) {
      setVerificationStatus({ success: 'Email address verified successfully!' });
      if (onUserUpdated) onUserUpdated(res.user);
      setTimeout(() => setShowVerificationModal(false), 1200);
    } else {
      setVerificationStatus({ error: res.error || 'Verification code failed.' });
    }
  };

  const handleChangeEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailChangeStatus({});
    const res = await authService.changeEmail(user.uid, currentPasswordForEmail, newEmail);
    if (res.success && res.user) {
      setEmailChangeStatus({ success: 'Email address updated successfully!' });
      if (onUserUpdated) onUserUpdated(res.user);
      setTimeout(() => {
        setShowEmailChangeModal(false);
        setNewEmail('');
        setCurrentPasswordForEmail('');
        setEmailChangeStatus({});
      }, 1200);
    } else {
      setEmailChangeStatus({ error: res.error || 'Unable to update email address.' });
    }
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordChangeStatus({});
    const res = await authService.changePassword(user.uid, currentPassword, newPassword, confirmNewPassword);
    if (res.success) {
      setPasswordChangeStatus({ success: 'Password changed successfully.' });
      setTimeout(() => {
        setShowPasswordChangeModal(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
        setPasswordChangeStatus({});
      }, 1200);
    } else {
      setPasswordChangeStatus({ error: res.error || 'Unable to change password.' });
    }
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fbApiKey.trim() || !fbProjectId.trim()) return;
    saveFirebaseConfig({
      apiKey: fbApiKey.trim(),
      authDomain: `${fbProjectId.trim()}.firebaseapp.com`,
      projectId: fbProjectId.trim(),
      storageBucket: `${fbProjectId.trim()}.appspot.com`,
      messagingSenderId: '1234567890',
      appId: '1:1234:web:abcd'
    });
    setFbSuccessMsg('Firebase variables cached! Reloading components...');
    setTimeout(() => {
      setFbSuccessMsg('');
    }, 2000);
  };

  const handleClearConfig = () => {
    saveFirebaseConfig(null);
  };

  const unlockedAchievements = ACHIEVEMENTS.filter(a => user.achievements.includes(a.id));

  return (
    <div className="space-y-6" id="profile-tab">
      
      {/* Copied Overlay Toast */}
      <AnimatePresence>
        {copiedLink && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-6 right-6 z-50 glass-panel-heavy px-4 py-3 border border-[#00f5d4]/20 rounded-xl text-xs font-semibold text-white flex items-center gap-1.5 font-display"
          >
            <CheckCircle2 className="w-4 h-4 text-brand-cyan animate-bounce" />
            <span>Public Profile coordinates copied to clipboard!</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Profile Card & Info */}
        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-60 h-60 bg-brand-purple/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

          <div className="text-center pb-6 border-b border-white/5 relative z-10">
            {/* User Avatar with visual ring */}
            <div className={`w-20 h-20 rounded-2xl bg-gradient-to-tr flex items-center justify-center font-display text-white text-3xl font-bold mx-auto mb-4 relative shadow-lg ${
              user.premium ? 'from-pink-500 via-purple-600 to-indigo-600 animate-pulse' : 'from-slate-800 to-slate-950 border border-white/10'
            }`}>
              {user.username.slice(0, 2).toUpperCase()}
              {user.premium && (
                <span className="absolute -top-1 right-[-4px] bg-amber-400 p-1 rounded-full text-[10px] text-black shadow" title="Premium Executive">
                  👑
                </span>
              )}
            </div>

            {editingName ? (
              <form onSubmit={handleSaveName} className="flex gap-2 justify-center max-w-sm mx-auto">
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="bg-slate-950 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-center text-white focus:outline-none focus:border-brand-purple"
                />
                <button type="submit" className="px-3 py-1 bg-brand-cyan text-slate-950 rounded-lg text-xs font-semibold cursor-pointer">
                  Save
                </button>
              </form>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <h2 className="text-xl font-display font-semibold text-white">{user.username}</h2>
                <button 
                  onClick={() => setEditingName(true)}
                  className="text-gray-500 hover:text-white text-[10px] uppercase font-mono border border-white/15 px-1.5 py-0.5 rounded cursor-pointer"
                >
                  Edit
                </button>
              </div>
            )}

            {/* Email Identity & Verification Pill */}
            <div className="mt-2 flex items-center justify-center gap-1.5">
              <span className="text-xs text-gray-300 font-mono">{user.email}</span>
              {user.emailVerified ? (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-mono">
                  <Check className="w-2.5 h-2.5" /> VERIFIED
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleStartEmailVerification}
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] font-mono hover:bg-amber-500/20 cursor-pointer"
                >
                  <AlertCircle className="w-2.5 h-2.5" /> UNVERIFIED • VERIFY
                </button>
              )}
            </div>

            <div className="mt-4 flex flex-wrap gap-1.5 justify-center">
              {user.premium && (
                <span className="px-2 py-0.5 text-[9px] font-mono border border-pink-500/30 text-pink-400 bg-pink-500/5 rounded">
                  👑 PREMIUM ACCOUNT LOG
                </span>
              )}
              <span className="px-2 py-0.5 text-[9px] font-mono border border-brand-cyan/20 text-brand-cyan bg-brand-cyan/5 rounded">
                UID: {user.uid.slice(0, 8)}...
              </span>
              <span className="px-2 py-0.5 text-[9px] font-mono border border-indigo-400/20 text-indigo-300 bg-indigo-500/5 rounded">
                TYPE: {user.accountType || 'INDIVIDUAL'}
              </span>
            </div>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-2 gap-4 pt-6 text-center">
            <div className="p-3 bg-black/20 rounded-xl border border-white/5">
              <span className="text-[10px] font-mono text-gray-400 block uppercase">Level Index</span>
              <span className="text-2xl font-semibold text-white font-display mt-0.5 block">{user.level}</span>
            </div>
            <div className="p-3 bg-black/20 rounded-xl border border-white/5">
              <span className="text-[10px] font-mono text-gray-400 block uppercase">Accumulated XP</span>
              <span className="text-2xl font-semibold text-[#00f5d4] font-display mt-0.5 block">{user.xp}</span>
            </div>
            <div className="p-3 bg-black/20 rounded-xl border border-white/5">
              <span className="text-[10px] font-mono text-gray-400 block uppercase">Execution Rating</span>
              <span className="text-2xl font-semibold text-brand-purple font-display mt-0.5 block">{user.executionScore}%</span>
            </div>
            <div className="p-3 bg-black/20 rounded-xl border border-white/5">
              <span className="text-[10px] font-mono text-gray-400 block uppercase">Commit Streak</span>
              <span className="text-2xl font-semibold text-[#ff007f] font-display mt-0.5 block">{user.streak}d</span>
            </div>
          </div>

          {/* Social Share actions */}
          <div className="mt-6 space-y-2 pt-4 border-t border-white/5">
            <button
              onClick={handleCopyLink}
              className="w-full py-2.5 px-4 bg-brand-cyan/10 hover:bg-brand-cyan/20 border border-brand-cyan/30 rounded-xl text-xs font-semibold text-[#00f5d4] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              Copy Public Profile Link
            </button>
            <p className="text-[11px] text-gray-500 font-mono text-center">
              Generate static links targeting '?user={user.uid}' to share with stakeholders.
            </p>
          </div>

          {/* Account Security Actions */}
          <div className="mt-6 space-y-2 pt-4 border-t border-white/5">
            <div className="text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-2">
              Identity & Security Controls
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setShowEmailChangeModal(true)}
                className="py-2 px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[11px] font-mono text-gray-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5 text-brand-cyan" />
                Change Email
              </button>
              <button
                type="button"
                onClick={() => setShowPasswordChangeModal(true)}
                className="py-2 px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[11px] font-mono text-gray-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5 text-brand-purple" />
                Change Password
              </button>
            </div>

            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="w-full mt-2 py-2 px-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-300 rounded-xl text-xs font-mono flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out of CATALYX
              </button>
            )}
          </div>
        </div>

        {/* Right Side Column: Premium Upgrade Hub, Security Governance & Storage Config */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Account Governance & Legal Status Card */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-display font-semibold text-white uppercase tracking-wider">
                  Governance & Compliance Integrity
                </h3>
              </div>
              <span className="px-2 py-0.5 text-[9px] font-mono rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                ACTIVE
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-950/60 rounded-xl border border-white/5">
                <span className="text-[10px] font-mono text-gray-500 block uppercase">Terms Consent</span>
                <span className="text-white font-mono mt-0.5 block">{user.termsAcceptedVersion || 'Compliant (v2026.3.1)'}</span>
                <span className="text-[9px] text-emerald-400 font-mono mt-0.5 block">Audit Hash Bound</span>
              </div>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-white/5">
                <span className="text-[10px] font-mono text-gray-500 block uppercase">Fee Schedule</span>
                <span className="text-white font-mono mt-0.5 block">
                  {user.accountType === 'ORGANIZATION' ? '0.50% Organization' : (user.accountType === 'GROUP' ? '0.27% Group' : '0.25% Individual Creator')}
                </span>
                <span className="text-[9px] text-gray-400 font-mono mt-0.5 block">Vinexsah Governance</span>
              </div>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-white/5">
                <span className="text-[10px] font-mono text-gray-500 block uppercase">Identity Security</span>
                <span className="text-white font-mono mt-0.5 block">SHA-256 Salted</span>
                <span className="text-[9px] text-brand-cyan font-mono mt-0.5 block">Rate Limiting Protected</span>
              </div>
            </div>
          </div>

          {/* Premium Layer Showcase Card */}
          <div className={`p-6 rounded-2xl border flex flex-col justify-between relative overflow-hidden ${
            user.premium 
              ? 'border-pink-500/40 bg-gradient-to-br from-pink-950/20 via-slate-950/40 to-slate-950/80 glow-pink' 
              : 'border-white/5 bg-slate-900/10'
          }`}>
            <div className="absolute top-0 right-0 w-96 h-96 bg-brand-pink/5 rounded-full blur-3xl pointer-events-none -mr-40 -mt-40"></div>
            
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-1.5 text-pink-400 mb-1.5">
                    <Star className={`w-4 h-4 text-brand-pink fill-brand-pink/30 ${user.premium ? 'animate-spin' : ''}`} />
                    <span className="text-xs font-mono tracking-widest uppercase">CATALYX PREM-TIER PLATFORM</span>
                  </div>
                  <h3 className="text-xl font-display font-medium text-white">
                    {user.premium ? 'Aura Executive Upgrade Configured' : 'Upgrade to CATALYX Premium'}
                  </h3>
                </div>

                <span className={`px-2 py-0.5 text-[9px] font-mono border rounded uppercase ${
                  user.premium ? 'border-pink-500/30 text-pink-400 bg-pink-500/10' : 'border-white/10 text-gray-500'
                }`}>
                  {user.premium ? 'SECURED' : 'LOCKED'}
                </span>
              </div>

              <div className="space-y-3 py-4 text-xs text-gray-300">
                <p className="leading-relaxed">
                  The Premium upgrade establishes advanced visual indicator buffers, unlocked deep learning recommendations logs, team fatigue telemetry charts, and priority billing logs integrations.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                  <div className="flex items-center gap-2 p-2 bg-black/20 rounded-lg border border-white/5">
                    <span className="text-brand-cyan">✓</span> Enhanced Analytics Dashboard
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-black/20 rounded-lg border border-white/5">
                    <span className="text-brand-pink">✓</span> Custom Premium Badge & Role Indicators
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-black/20 rounded-lg border border-white/5">
                    <span className="text-brand-purple">✓</span> Multi-Workspace Invite Limits bypassed
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-black/20 rounded-lg border border-white/5">
                    <span className="text-yellow-400">✓</span> Double-Entry Ledger priority sync
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/5">
              {user.premium ? (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-center text-xs font-mono">
                  ✓ Core database profile flag 'premium' is active. Enhanced services operational.
                </div>
              ) : (
                <button
                  onClick={onUpgrade}
                  className="w-full py-3 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg active:scale-[0.98] transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 animate-bounce" />
                  UPGRADE NOW (Flag: premium=true)
                </button>
              )}
            </div>
          </div>

          {/* Secure Firebase Custom Configuration Accordion */}
          <div className="glass-panel p-6 rounded-2xl">
            <button
              onClick={() => setShowConfigDrawer(!showConfigDrawer)}
              className="w-full flex justify-between items-center text-left cursor-pointer"
            >
              <div className="flex items-center gap-2 text-brand-cyan">
                <Database className="w-5 h-5 text-brand-cyan" />
                <span className="text-xs font-mono tracking-wider font-semibold uppercase">Cloud Firestore Setup Gate</span>
              </div>
              <span className="text-xs border border-white/10 px-2.5 py-0.5 rounded hover:bg-white/5 text-gray-400 transition-colors uppercase font-mono">
                {showConfigDrawer ? 'Furl' : 'Inspect'}
              </span>
            </button>

            {showConfigDrawer && (
              <div className="mt-4 pt-4 border-t border-white/5 space-y-4">
                <p className="text-xs text-gray-400 leading-normal">
                  CATALYX runs in high-performance local sandbox by default. Set up official Firestore databases credentials here to pivot into durable cloud servers sync! Only saved locally in your sandbox client.
                </p>

                {currentSaved ? (
                  <div className="p-3 bg-brand-cyan/5 border border-brand-cyan/20 rounded-xl flex justify-between items-center mb-2">
                    <div>
                      <span className="text-xs font-mono text-white block">Active Custom Config</span>
                      <span className="text-[10px] text-gray-300 font-mono block">Project: {currentSaved.projectId}</span>
                    </div>
                    <button
                      onClick={handleClearConfig}
                      className="text-xs font-mono text-red-400 border border-red-500/20 px-2 py-0.5 rounded bg-red-500/5 hover:bg-red-500/10 cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                ) : (
                  <p className="text-[11px] font-mono text-amber-400">Currently executing: CATALYX High-Performance Local Simulation Node.</p>
                )}

                <form onSubmit={handleSaveConfig} className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-mono text-gray-500 uppercase mb-1">Firestore ApiKey</label>
                    <input
                      type="password"
                      required
                      placeholder="AIzaSyA..."
                      value={fbApiKey}
                      onChange={(e) => setFbApiKey(e.target.value)}
                      className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-gray-300 placeholder-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-gray-500 uppercase mb-1">Firestore ProjectId</label>
                    <input
                      type="text"
                      required
                      placeholder="catalyx-production-1234"
                      value={fbProjectId}
                      onChange={(e) => setFbProjectId(e.target.value)}
                      className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-gray-300 placeholder-gray-700"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-brand-cyan/10 hover:bg-brand-cyan/20 border border-brand-cyan/30 text-brand-cyan text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Star className="w-3.5 h-3.5" />
                    Mount Cloud Telemetry
                  </button>
                </form>

                {fbSuccessMsg && (
                  <p className="text-[10px] text-brand-cyan font-mono text-center animate-pulse">{fbSuccessMsg}</p>
                )}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Email Verification Modal */}
      <AnimatePresence>
        {showVerificationModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-slate-950 border border-white/10 rounded-3xl p-6 shadow-2xl relative"
            >
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-brand-cyan" />
                  <h3 className="text-sm font-display font-semibold text-white uppercase tracking-wider">
                    Verify Email Address
                  </h3>
                </div>
                <button
                  onClick={() => setShowVerificationModal(false)}
                  className="text-gray-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-gray-400 mb-4">
                {verificationNotice || `A 6-digit verification code has been dispatched to ${user.email}. Enter it below to bind this verified identity.`}
              </p>

              {verificationStatus.error && (
                <div className="mb-3 p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300">
                  {verificationStatus.error}
                </div>
              )}

              {verificationStatus.success && (
                <div className="mb-3 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
                  {verificationStatus.success}
                </div>
              )}

              <form onSubmit={handleConfirmEmailVerification} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-1">
                    6-Digit Verification Code
                  </label>
                  <input
                    type="text"
                    required
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="e.g. 583921"
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-center font-mono text-base tracking-widest text-white focus:outline-none focus:border-brand-cyan"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowVerificationModal(false)}
                    className="w-1/3 py-2 border border-white/10 rounded-xl text-xs font-mono text-gray-400 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-2/3 py-2 bg-brand-cyan text-slate-950 font-bold font-display rounded-xl text-xs uppercase tracking-wider hover:opacity-95 cursor-pointer"
                  >
                    Confirm Code
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Change Email Address Modal */}
      <AnimatePresence>
        {showEmailChangeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-slate-950 border border-white/10 rounded-3xl p-6 shadow-2xl relative"
            >
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-brand-cyan" />
                  <h3 className="text-sm font-display font-semibold text-white uppercase tracking-wider">
                    Change Account Email
                  </h3>
                </div>
                <button
                  onClick={() => setShowEmailChangeModal(false)}
                  className="text-gray-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {emailChangeStatus.error && (
                <div className="mb-3 p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300">
                  {emailChangeStatus.error}
                </div>
              )}

              {emailChangeStatus.success && (
                <div className="mb-3 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
                  {emailChangeStatus.success}
                </div>
              )}

              <form onSubmit={handleChangeEmailSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-1">
                    Current Email Address
                  </label>
                  <input
                    type="email"
                    disabled
                    value={user.email}
                    className="w-full bg-slate-900/50 border border-white/5 rounded-xl px-4 py-2 text-xs font-mono text-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-1">
                    New Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="new@organization.com"
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-brand-cyan"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-1">
                    Authorize with Current Password
                  </label>
                  <input
                    type="password"
                    required
                    value={currentPasswordForEmail}
                    onChange={(e) => setCurrentPasswordForEmail(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-brand-cyan"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowEmailChangeModal(false)}
                    className="w-1/3 py-2 border border-white/10 rounded-xl text-xs font-mono text-gray-400 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-2/3 py-2 bg-brand-cyan text-slate-950 font-bold font-display rounded-xl text-xs uppercase tracking-wider hover:opacity-95 cursor-pointer"
                  >
                    Update Email
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Change Password Modal */}
      <AnimatePresence>
        {showPasswordChangeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-slate-950 border border-white/10 rounded-3xl p-6 shadow-2xl relative"
            >
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-brand-purple" />
                  <h3 className="text-sm font-display font-semibold text-white uppercase tracking-wider">
                    Change Security Password
                  </h3>
                </div>
                <button
                  onClick={() => setShowPasswordChangeModal(false)}
                  className="text-gray-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {passwordChangeStatus.error && (
                <div className="mb-3 p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300">
                  {passwordChangeStatus.error}
                </div>
              )}

              {passwordChangeStatus.success && (
                <div className="mb-3 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
                  {passwordChangeStatus.success}
                </div>
              )}

              <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-brand-purple"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-1">
                    New Password (Min 8 chars, 1 number/symbol)
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-brand-purple"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-brand-purple"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPasswordChangeModal(false)}
                    className="w-1/3 py-2 border border-white/10 rounded-xl text-xs font-mono text-gray-400 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-2/3 py-2 bg-gradient-to-r from-brand-purple to-brand-cyan text-slate-950 font-bold font-display rounded-xl text-xs uppercase tracking-wider hover:opacity-95 cursor-pointer"
                  >
                    Update Password
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
