import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, ShieldCheck, Lock, Mail, User, KeyRound, ArrowRight, CheckCircle2, 
  Sparkles, Layers, Cpu, Globe, ShoppingBag, Presentation, Users, 
  AlertCircle, Eye, EyeOff, FileText, Check, ChevronRight, X, Clock
} from 'lucide-react';
import { authService, AuthResult } from '../../services/authService';
import { UserProfile } from '../../types';
import { LegalPolicyService } from '../../services/legal/legalPolicyService';
import { LegalDocumentView } from '../legal/LegalDocumentView';

interface AuthLandingPageProps {
  onAuthSuccess: (user: UserProfile) => void;
  onExploreMarketplace?: () => void;
}

type AuthMode = 'LOGIN' | 'REGISTER' | 'FORGOT_PASSWORD';

export const AuthLandingPage: React.FC<AuthLandingPageProps> = ({ onAuthSuccess, onExploreMarketplace }) => {
  const [mode, setMode] = useState<AuthMode>('LOGIN');

  // Form State
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accountType, setAccountType] = useState<'INDIVIDUAL' | 'ORGANIZATION'>('INDIVIDUAL');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Verified Registration Flow State (10-step lifecycle)
  const [regStep, setRegStep] = useState<'FORM' | 'VERIFY_OTP'>('FORM');
  const [regOtp, setRegOtp] = useState('');
  const [regCooldown, setRegCooldown] = useState<number>(0);
  const [regExpirySeconds, setRegExpirySeconds] = useState<number>(900);

  // Verified Recovery Flow State (Request -> Verify Code -> Reset Password)
  const [recoveryStep, setRecoveryStep] = useState<'REQUEST' | 'VERIFY_CODE' | 'SET_PASSWORD'>('REQUEST');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [recoveryToken, setRecoveryToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Status & Feedback
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [lockoutCountdown, setLockoutCountdown] = useState<number | null>(null);

  // Public Legal Document Modal (View without authentication)
  const [viewingLegalSlug, setViewingLegalSlug] = useState<string | null>(null);

  // Handle countdown timer if locked out
  useEffect(() => {
    if (lockoutCountdown === null || lockoutCountdown <= 0) return;
    const timer = setInterval(() => {
      setLockoutCountdown(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          setErrorMessage('');
          return null;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutCountdown]);

  // Handle registration resend cooldown
  useEffect(() => {
    if (regCooldown <= 0) return;
    const timer = setInterval(() => {
      setRegCooldown(prev => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [regCooldown]);

  // Handle registration OTP expiration timer
  useEffect(() => {
    if (regExpirySeconds <= 0 || regStep !== 'VERIFY_OTP') return;
    const timer = setInterval(() => {
      setRegExpirySeconds(prev => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [regExpirySeconds, regStep]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (lockoutCountdown !== null && lockoutCountdown > 0) {
      setErrorMessage(`Account temporarily locked. Please wait ${lockoutCountdown} seconds.`);
      return;
    }

    setIsLoading(true);
    try {
      const result: AuthResult = await authService.login({
        email: email.trim(),
        password
      });

      if (result.success && result.user) {
        onAuthSuccess(result.user);
      } else {
        setErrorMessage(result.error || 'Authentication sequence failed.');
        if (result.retryAfterSeconds) {
          setLockoutCountdown(result.retryAfterSeconds);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network or authentication exception.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInitiateRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!acceptTerms) {
      setErrorMessage('Mandatory Agreement: You must review and agree to the Terms of Service, Privacy Policy, and platform revenue schedule before creating an account.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await authService.initiateRegistration({
        email: email.trim(),
        username: username.trim(),
        password,
        confirmPassword,
        accountType,
        acceptTerms
      });

      if (result.success) {
        setRegStep('VERIFY_OTP');
        setRegExpirySeconds(result.expiresInSeconds || 900);
        setRegCooldown(60);
        setSuccessMessage(`A single-use 6-digit verification code has been dispatched to ${email.trim()}. Enter the code below to complete account activation.`);
      } else {
        setErrorMessage(result.error || 'Registration initiation failed.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to register account.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyRegistrationOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const cleanOtp = regOtp.trim();
    if (!cleanOtp || cleanOtp.length !== 6) {
      setErrorMessage('Please enter the 6-digit verification code sent to your email.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await authService.verifyRegistration(email.trim(), cleanOtp);
      if (result.success && result.user) {
        setSuccessMessage('Email verified and account activated! Initializing command workspace...');
        setTimeout(() => {
          if (result.user) onAuthSuccess(result.user);
        }, 600);
      } else {
        setErrorMessage(result.error || 'Invalid or expired verification code.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Verification exception occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendRegistrationCode = async () => {
    if (regCooldown > 0) return;
    setErrorMessage('');
    setIsLoading(true);
    try {
      const res = await authService.resendRegistrationCode(email.trim());
      if (res.success) {
        setRegCooldown(60);
        setSuccessMessage('A fresh single-use verification code has been sent to your email.');
      } else {
        setErrorMessage(res.error || 'Failed to resend verification code.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Resend error.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      if (recoveryStep === 'REQUEST') {
        const cleanEmail = email.trim();
        if (!cleanEmail) {
          setErrorMessage('Please enter your registered email address.');
          setIsLoading(false);
          return;
        }
        const res = await authService.initiatePasswordRecovery(cleanEmail);
        setSuccessMessage(res.message || `A password recovery code has been sent to ${cleanEmail}.`);
        setRecoveryStep('VERIFY_CODE');
      } else if (recoveryStep === 'VERIFY_CODE') {
        const cleanCode = recoveryCode.trim();
        if (!cleanCode || cleanCode.length !== 6) {
          setErrorMessage('Please enter the 6-digit recovery code.');
          setIsLoading(false);
          return;
        }
        const res = await authService.verifyRecoveryCode(email.trim(), cleanCode);
        if (res.success && res.resetToken) {
          setRecoveryToken(res.resetToken);
          setRecoveryStep('SET_PASSWORD');
          setSuccessMessage('Recovery code verified. Enter your new password below.');
        } else {
          setErrorMessage(res.error || 'Invalid or expired recovery code.');
        }
      } else if (recoveryStep === 'SET_PASSWORD') {
        if (!newPassword || !confirmNewPassword) {
          setErrorMessage('Please provide both new password and confirmation.');
          setIsLoading(false);
          return;
        }
        const res = await authService.resetPasswordWithToken(
          email.trim(),
          recoveryToken,
          newPassword,
          confirmNewPassword
        );
        if (res.success) {
          setSuccessMessage('Password reset successfully! You can now log in with your new password.');
          setMode('LOGIN');
          setPassword('');
          setConfirmPassword('');
          setRecoveryStep('REQUEST');
          setRecoveryCode('');
          setRecoveryToken('');
        } else {
          setErrorMessage(res.error || 'Password reset failed.');
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Password recovery sequence failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const result = await authService.login({
        email: 'anesthonest81@gmail.com',
        password: 'Catalyx2026!'
      });
      if (result.success && result.user) {
        onAuthSuccess(result.user);
      } else {
        setErrorMessage(result.error || 'Demo login failed.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Demo initialization error.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-gray-200 relative font-sans overflow-x-hidden selection:bg-brand-purple/30 selection:text-white">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-[radial-gradient(ellipse_at_top,rgba(157,78,221,0.12),transparent_70%)] pointer-events-none" />
      <div className="absolute top-1/4 -right-40 w-96 h-96 bg-brand-cyan/10 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-brand-purple/10 rounded-full blur-[128px] pointer-events-none" />

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#030712]/80 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-purple to-brand-cyan p-[1px] shadow-lg shadow-brand-purple/20">
              <div className="w-full h-full bg-[#030712] rounded-[11px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-brand-cyan" />
              </div>
            </div>
            <div>
              <div className="font-display font-bold text-lg text-white tracking-widest leading-none">
                CATA<span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-purple to-brand-cyan">LYX</span>
              </div>
              <div className="text-[9px] font-mono text-gray-500 uppercase tracking-wider mt-0.5">
                VINEXSAH TECHNOLOGIES OS
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6 text-xs text-gray-400 font-mono">
            <a href="#capabilities" className="hover:text-white transition-colors">CAPABILITIES</a>
            <a href="#architecture" className="hover:text-white transition-colors">ARCHITECTURE</a>
            <a href="#compliance" className="hover:text-white transition-colors">GOVERNANCE & FEES</a>
            <button
              onClick={() => setViewingLegalSlug('terms')}
              className="hover:text-brand-cyan transition-colors cursor-pointer"
            >
              TERMS
            </button>
          </div>

          <div className="flex items-center gap-3">
            {onExploreMarketplace && (
              <button
                type="button"
                onClick={onExploreMarketplace}
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-mono px-3.5 py-1.5 rounded-lg border border-brand-cyan/40 bg-brand-cyan/5 text-brand-cyan hover:bg-brand-cyan/15 transition-all cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>EXPLORE MARKETPLACE</span>
              </button>
            )}
            <button
              onClick={() => {
                setMode('LOGIN');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className={`text-xs font-mono px-3.5 py-1.5 rounded-lg border transition-all cursor-pointer ${
                mode === 'LOGIN'
                  ? 'border-brand-purple text-white bg-brand-purple/10'
                  : 'border-white/10 text-gray-300 hover:border-white/20'
              }`}
            >
              SIGN IN
            </button>
            <button
              onClick={() => {
                setMode('REGISTER');
                setRegStep('FORM');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className="text-xs font-semibold px-4 py-1.5 rounded-lg bg-gradient-to-r from-brand-purple to-brand-cyan text-slate-950 hover:opacity-95 shadow-md active:scale-95 transition-all cursor-pointer"
            >
              CREATE ACCOUNT
            </button>
          </div>
        </div>
      </header>

      {/* Main Hero & Auth Gateway */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Branding, Mission & Platform Context */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-cyan/30 bg-brand-cyan/5 text-brand-cyan text-[10px] font-mono uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan animate-ping" />
              UNIVERSAL ENTERPRISE AI OPERATING SYSTEM
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-medium text-white tracking-tight leading-[1.1]">
              Execute at the speed of <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-purple via-indigo-400 to-brand-cyan">Autonomous Intelligence</span>.
            </h1>

            <p className="text-sm sm:text-base text-gray-400 max-w-xl leading-relaxed">
              CATALYX unifies strategic planning, autonomous AI workforce agents, cross-organization commerce, presentations, and verified double-entry settlement into a single authoritative workspace.
            </p>

            {/* Quick Proof Metrics */}
            <div className="grid grid-cols-3 gap-3 pt-2 max-w-lg">
              <div className="glass-panel p-3 rounded-xl border border-white/5">
                <div className="text-[10px] font-mono text-gray-500 uppercase">Architecture</div>
                <div className="text-sm font-semibold text-white font-display mt-0.5">V30 Hardened</div>
                <div className="text-[9px] text-brand-cyan font-mono mt-0.5">Authoritative IPN</div>
              </div>
              <div className="glass-panel p-3 rounded-xl border border-white/5">
                <div className="text-[10px] font-mono text-gray-500 uppercase">Platform Fee</div>
                <div className="text-sm font-semibold text-white font-display mt-0.5">0.25% - 0.50%</div>
                <div className="text-[9px] text-brand-purple font-mono mt-0.5">Indiv / Group / Org</div>
              </div>
              <div className="glass-panel p-3 rounded-xl border border-white/5">
                <div className="text-[10px] font-mono text-gray-500 uppercase">Security</div>
                <div className="text-sm font-semibold text-white font-display mt-0.5">SHA-256</div>
                <div className="text-[9px] text-emerald-400 font-mono mt-0.5">Double-Entry Ledger</div>
              </div>
            </div>

            {/* Persona Guidance Notice */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-white/10 text-xs text-gray-400 flex items-start gap-3 max-w-lg">
              <Shield className="w-4 h-4 text-brand-cyan shrink-0 mt-0.5" />
              <div>
                <span className="text-gray-200 font-semibold">Strict Authentication Gateway: </span>
                Workspaces, confidential AI models, and commercial transactions are isolated behind cryptographically salted credentials. Please authenticate or initialize a new account to enter.
              </div>
            </div>

            {/* Unauthenticated Marketplace Exploration Action */}
            {onExploreMarketplace && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onExploreMarketplace}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-brand-cyan/40 bg-brand-cyan/10 hover:bg-brand-cyan/20 text-brand-cyan font-mono text-xs font-semibold tracking-wider transition-all cursor-pointer shadow-lg shadow-brand-cyan/5"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>EXPLORE PUBLIC MARKETPLACE</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Interactive Authentication Card */}
          <div className="lg:col-span-5">
            <div className="glass-panel-heavy p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-cyan/10 rounded-full blur-2xl pointer-events-none" />

              {/* Mode Toggle Tabs */}
              <div className="flex rounded-xl bg-slate-950/80 p-1 border border-white/5 mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setMode('LOGIN');
                    setErrorMessage('');
                    setSuccessMessage('');
                  }}
                  className={`flex-1 py-2 text-xs font-mono rounded-lg transition-all cursor-pointer ${
                    mode === 'LOGIN'
                      ? 'bg-brand-purple text-white font-semibold shadow'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  SIGN IN
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('REGISTER');
                    setErrorMessage('');
                    setSuccessMessage('');
                  }}
                  className={`flex-1 py-2 text-xs font-mono rounded-lg transition-all cursor-pointer ${
                    mode === 'REGISTER'
                      ? 'bg-brand-purple text-white font-semibold shadow'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  CREATE ACCOUNT
                </button>
              </div>

              {/* Status & Error Alerts */}
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300 flex items-start gap-2"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                  <div>{errorMessage}</div>
                </motion.div>
              )}

              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-start gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                  <div>{successMessage}</div>
                </motion.div>
              )}

              {/* Lockout Warning */}
              {lockoutCountdown !== null && lockoutCountdown > 0 && (
                <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400 animate-spin" />
                  <span>Security lockout active. Throttled for <strong>{lockoutCountdown}s</strong>.</span>
                </div>
              )}

              {/* ----------------- LOGIN FORM ----------------- */}
              {mode === 'LOGIN' && (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@organization.com"
                        className="w-full bg-slate-950/70 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-brand-purple transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-wider">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setMode('FORGOT_PASSWORD');
                          setErrorMessage('');
                        }}
                        className="text-[10px] font-mono text-brand-cyan hover:underline cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full bg-slate-950/70 border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-brand-purple transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-3 text-gray-500 hover:text-gray-300 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || (lockoutCountdown !== null && lockoutCountdown > 0)}
                    className="w-full py-3 bg-gradient-to-r from-brand-purple to-brand-cyan text-slate-950 font-bold font-display rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-brand-purple/10 mt-2"
                  >
                    <span>{isLoading ? 'VERIFYING CREDENTIALS...' : 'ACCESS CATALYX WORKSPACE'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              {/* ----------------- REGISTER FORM ----------------- */}
              {mode === 'REGISTER' && regStep === 'FORM' && (
                <form onSubmit={handleInitiateRegister} className="space-y-3.5">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-1">
                        Full Name / Handle
                      </label>
                      <input
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="e.g. Alex Vance"
                        className="w-full bg-slate-950/70 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-brand-purple transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-1">
                        Account Type
                      </label>
                      <select
                        value={accountType}
                        onChange={(e) => setAccountType(e.target.value as any)}
                        className="w-full bg-slate-950/70 border border-white/10 rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-brand-purple"
                      >
                        <option value="INDIVIDUAL">Individual / Creator</option>
                        <option value="ORGANIZATION">Enterprise / Org</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-1">
                      Email Address (Primary Identity)
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="alex@enterprise.io"
                        className="w-full bg-slate-950/70 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-brand-purple transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-1">
                      Password (Min. 8 chars, 1 number/symbol)
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full bg-slate-950/70 border border-white/10 rounded-xl pl-10 pr-10 py-2 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-brand-purple transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-3 text-gray-500 hover:text-gray-300 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-1">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full bg-slate-950/70 border border-white/10 rounded-xl pl-10 pr-10 py-2 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-brand-purple transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3.5 top-3 text-gray-500 hover:text-gray-300 cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Mandatory Terms & Revenue Share Checkbox */}
                  <div className="pt-1">
                    <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950/80 border border-white/10 cursor-pointer hover:border-brand-purple/40 transition-colors">
                      <input
                        type="checkbox"
                        checked={acceptTerms}
                        onChange={(e) => setAcceptTerms(e.target.checked)}
                        className="mt-0.5 rounded border-white/20 bg-slate-900 text-brand-purple focus:ring-brand-purple accent-[#9d4edd] cursor-pointer"
                      />
                      <span className="text-[11px] text-gray-300 leading-snug">
                        I agree to the{' '}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setViewingLegalSlug('terms');
                          }}
                          className="text-brand-cyan hover:underline font-semibold"
                        >
                          Terms of Service
                        </button>
                        ,{' '}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setViewingLegalSlug('privacy');
                          }}
                          className="text-brand-cyan hover:underline font-semibold"
                        >
                          Privacy Policy
                        </button>
                        , and the authoritative platform fee schedule (0.25% Individual / 0.27% Group / 0.50% Organization under Vinexsah Technologies).
                      </span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-gradient-to-r from-brand-purple to-brand-cyan text-slate-950 font-bold font-display rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-brand-purple/10 mt-2"
                  >
                    <span>{isLoading ? 'DISPATCHING VERIFICATION CODE...' : 'CONTINUE: VERIFY EMAIL'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              {/* ----------------- REGISTER STEP 2: VERIFY OTP ----------------- */}
              {mode === 'REGISTER' && regStep === 'VERIFY_OTP' && (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-brand-purple/30">
                    <div className="flex items-center justify-between text-xs text-brand-purple font-mono mb-1">
                      <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-brand-purple" /> STEP 2: VERIFY EMAIL</span>
                      <span>{Math.floor(regExpirySeconds / 60)}:{(regExpirySeconds % 60).toString().padStart(2, '0')}</span>
                    </div>
                    <p className="text-xs text-gray-300">
                      A single-use 6-digit verification code has been dispatched to <strong className="text-white">{email}</strong>.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setRegStep('FORM');
                        setErrorMessage('');
                      }}
                      className="text-[11px] text-brand-cyan hover:underline mt-1 cursor-pointer"
                    >
                      Wrong email? Edit details
                    </button>
                  </div>

                  <form onSubmit={handleVerifyRegistrationOtp} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-1.5 text-center">
                        Enter 6-Digit Single-Use Code
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        autoFocus
                        required
                        value={regOtp}
                        onChange={(e) => setRegOtp(e.target.value.replace(/\D/g, ''))}
                        placeholder="123456"
                        className="w-full bg-slate-950/90 border border-white/10 rounded-xl px-4 py-3 text-center text-2xl font-mono tracking-[0.5em] text-white placeholder-gray-700 focus:outline-none focus:border-brand-purple"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || regOtp.trim().length !== 6}
                      className="w-full py-3 bg-gradient-to-r from-brand-purple to-brand-cyan text-slate-950 font-bold font-display rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-brand-purple/10"
                    >
                      <span>{isLoading ? 'VERIFYING CODE...' : 'VERIFY & ACTIVATE ACCOUNT'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <button
                        type="button"
                        disabled={regCooldown > 0 || isLoading}
                        onClick={handleResendRegistrationCode}
                        className="text-gray-400 hover:text-white font-mono text-[11px] disabled:opacity-40 cursor-pointer"
                      >
                        {regCooldown > 0 ? `Resend code in ${regCooldown}s` : 'Resend Code'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMode('LOGIN');
                          setRegStep('FORM');
                          setErrorMessage('');
                        }}
                        className="text-gray-400 hover:text-white font-mono text-[11px] cursor-pointer"
                      >
                        Back to Sign In
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* ----------------- FORGOT PASSWORD FORM ----------------- */}
              {mode === 'FORGOT_PASSWORD' && (
                <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                  <div className="text-xs text-gray-400 mb-2">
                    {recoveryStep === 'REQUEST' && 'Enter your registered email address to receive password recovery authorization instructions.'}
                    {recoveryStep === 'VERIFY_CODE' && `Enter the 6-digit recovery code dispatched to ${email}.`}
                    {recoveryStep === 'SET_PASSWORD' && 'Establish your new account password.'}
                  </div>

                  {recoveryStep === 'REQUEST' && (
                    <div>
                      <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-1">
                        Registered Email
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@organization.com"
                          className="w-full bg-slate-950/70 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-brand-purple transition-all"
                        />
                      </div>
                    </div>
                  )}

                  {recoveryStep === 'VERIFY_CODE' && (
                    <div>
                      <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-1">
                        6-Digit Recovery Code
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={recoveryCode}
                        onChange={(e) => setRecoveryCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="123456"
                        className="w-full bg-slate-950/70 border border-white/10 rounded-xl px-4 py-2.5 text-center text-lg font-mono tracking-[0.4em] text-white focus:outline-none focus:border-brand-purple"
                      />
                    </div>
                  )}

                  {recoveryStep === 'SET_PASSWORD' && (
                    <>
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
                          className="w-full bg-slate-950/70 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-brand-purple"
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
                          className="w-full bg-slate-950/70 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-brand-purple"
                        />
                      </div>
                    </>
                  )}

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setMode('LOGIN');
                        setRecoveryStep('REQUEST');
                        setRecoveryCode('');
                        setRecoveryToken('');
                        setErrorMessage('');
                      }}
                      className="w-1/3 py-2.5 rounded-xl border border-white/10 text-xs font-mono text-gray-400 hover:text-white cursor-pointer"
                    >
                      CANCEL
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-2/3 py-2.5 bg-gradient-to-r from-brand-purple to-brand-cyan text-slate-950 font-bold font-display rounded-xl text-xs uppercase tracking-wider hover:opacity-95 transition-all cursor-pointer"
                    >
                      {isLoading ? 'PROCESSING...' : recoveryStep === 'REQUEST' ? 'SEND CODE' : recoveryStep === 'VERIFY_CODE' ? 'VERIFY CODE' : 'RESET PASSWORD'}
                    </button>
                  </div>
                </form>
              )}

              {/* Demo Evaluation Shortcut */}
              <div className="mt-6 pt-5 border-t border-white/5 text-center">
                <div className="text-[10px] font-mono text-gray-500 uppercase tracking-wider mb-2">
                  Evaluation & Verification Access
                </div>
                <button
                  type="button"
                  onClick={handleDemoLogin}
                  disabled={isLoading}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-850 text-gray-300 hover:text-white rounded-xl border border-white/10 text-xs font-mono flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-brand-cyan" />
                  <span>Explore as Verified Executive (Demo Persona)</span>
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Public Informational Section: What CATALYX Does (Non-overwhelming, high-signal) */}
        <section id="capabilities" className="mt-24 pt-12 border-t border-white/5">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-[10px] font-mono text-brand-cyan tracking-widest uppercase border border-brand-cyan/20 px-2.5 py-0.5 rounded-full bg-brand-cyan/5">
              SYSTEM ARCHITECTURE CAPABILITIES
            </span>
            <h2 className="text-3xl font-display font-medium text-white mt-3">
              One Unified Substrate for Digital Work & Autonomous Execution
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 mt-2">
              Engineered to replace fragmented enterprise tools with real cryptographic governance, AI workforce coordination, and authoritative financial verification.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Capability 1 */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-brand-purple/30 transition-all">
              <div className="w-10 h-10 rounded-xl bg-brand-purple/10 border border-brand-purple/20 flex items-center justify-center text-brand-purple mb-4">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-base font-display font-semibold text-white">Autonomous AI Workforce</h3>
              <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
                Multi-agent executive briefings, contextual AI coaching, continuous system guides, and execution scoring calibrated to actual task velocity.
              </p>
            </div>

            {/* Capability 2 */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-brand-cyan/30 transition-all">
              <div className="w-10 h-10 rounded-xl bg-brand-cyan/10 border border-brand-cyan/20 flex items-center justify-center text-brand-cyan mb-4">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-display font-semibold text-white">Universal Work & Tasks</h3>
              <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
                Instant task search, deep focus cabins, priority categorization, sprint planning, and institutional memory across individual and team projects.
              </p>
            </div>

            {/* Capability 3 */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-indigo-400/30 transition-all">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <h3 className="text-base font-display font-semibold text-white">Creator Economy & Marketplace</h3>
              <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
                Publish digital models, workflows, and tools with authoritative Pesapal v3 payments, instant webhook IPN verification, and bank transfers.
              </p>
            </div>

            {/* Capability 4 */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-pink-500/30 transition-all">
              <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 mb-4">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-base font-display font-semibold text-white">Multi-Tenant Collaboration</h3>
              <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
                Workspaces, synchronized scrums, role-based access control, organizational partnerships, and federated intelligence across teams.
              </p>
            </div>

            {/* Capability 5 */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-emerald-500/30 transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
                <Presentation className="w-5 h-5" />
              </div>
              <h3 className="text-base font-display font-semibold text-white">Presentations & Media Studio</h3>
              <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
                Interactive executive decks, prototype demonstration hubs, file vaults, and structured asset sharing with secure cryptographic links.
              </p>
            </div>

            {/* Capability 6 */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-amber-500/30 transition-all">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-base font-display font-semibold text-white">Double-Entry Financial Ledger</h3>
              <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
                Authoritative terms hashing, immutable legal audit logging, integer minor-unit arithmetic, and automatic entitlement provisioning.
              </p>
            </div>
          </div>
        </section>

        {/* Public Fee Schedule & Governance Section */}
        <section id="compliance" className="mt-16 p-8 rounded-3xl bg-slate-950/80 border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-brand-purple/5 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">
                TRANSPARENT REVENUE & GOVERNANCE MODEL
              </span>
              <h3 className="text-xl font-display font-medium text-white mt-1">
                Fair, Mathematically Verified Commission Schedule
              </h3>
              <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                CATALYX enforces an ultra-low platform fee: 0.25% for individual creators, 0.27% for collaborative groups, and 0.50% for enterprise organizations under Vinexsah Technologies. Every transaction is balanced on a double-entry ledger without floating-point rounding errors.
              </p>
            </div>
            <div className="flex gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setViewingLegalSlug('marketplace-policy')}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-gray-300 cursor-pointer"
              >
                VIEW REVENUE POLICY
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('REGISTER');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-4 py-2 rounded-xl bg-brand-cyan text-slate-950 font-bold text-xs font-display hover:opacity-95 cursor-pointer"
              >
                JOIN NOW
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer with Legal Links (Viewable without logging in) */}
      <footer className="border-t border-white/5 bg-[#030712] py-8 text-xs text-gray-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            © 2026 CATALYX. Developed and operated under the <strong className="text-gray-300">VINEXSAH TECHNOLOGIES</strong> project.
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => setViewingLegalSlug('terms')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Terms of Service
            </button>
            <button
              onClick={() => setViewingLegalSlug('privacy')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => setViewingLegalSlug('marketplace-policy')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Marketplace & Fees
            </button>
            <button
              onClick={() => setViewingLegalSlug('payouts')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Creator Payouts
            </button>
            <button
              onClick={() => setViewingLegalSlug('acceptable-use')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Acceptable Use
            </button>
          </div>
        </div>
      </footer>

      {/* Public Legal Document Modal (View without entering workspace) */}
      <AnimatePresence>
        {viewingLegalSlug && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-4xl max-h-[90vh] bg-slate-950 border border-white/10 rounded-3xl overflow-hidden flex flex-col shadow-2xl"
            >
              <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-900/50">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-brand-cyan" />
                  <span className="text-xs font-mono text-gray-300 uppercase tracking-wider">
                    Authoritative Governance Document
                  </span>
                </div>
                <button
                  onClick={() => setViewingLegalSlug(null)}
                  className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <LegalDocumentView
                  initialSlug={viewingLegalSlug}
                  userEmail="public-visitor@catalyx.io"
                  onNavigateToDocument={(slug) => setViewingLegalSlug(slug)}
                  onClose={() => setViewingLegalSlug(null)}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
