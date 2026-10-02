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
import { CatalyxLogo } from '../common/CatalyxLogo';

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
  const [accountType, setAccountType] = useState<'INDIVIDUAL' | 'GROUP' | 'ORGANIZATION'>('INDIVIDUAL');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Google Authentication State
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');
  const [googleAccountType, setGoogleAccountType] = useState<'INDIVIDUAL' | 'GROUP' | 'ORGANIZATION'>('INDIVIDUAL');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState('');

  // Welcome & Onboarding State (Direct Registration - No OTP Code Gate)
  const [welcomeUser, setWelcomeUser] = useState<UserProfile | null>(null);

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

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!acceptTerms) {
      setErrorMessage('Mandatory Agreement: You must review and agree to the Terms of Service, Privacy Policy, and platform revenue schedule before creating an account.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await authService.register({
        email: email.trim(),
        username: username.trim(),
        password,
        confirmPassword,
        accountType,
        acceptTerms
      });

      if (result.success && result.user) {
        setWelcomeUser(result.user);
        setSuccessMessage('Welcome to CATALYX. Your 1-month free trial is now active.');
      } else {
        setErrorMessage(result.error || 'Registration failed.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to register account.');
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

  const handleInitiateGoogleAuth = () => {
    setGoogleEmail(email.trim() || 'anesthonest81@gmail.com');
    setGoogleName(username.trim() || 'Alex Vance');
    setGoogleAccountType(accountType);
    setGoogleError('');
    setShowGoogleModal(true);
  };

  const handleGoogleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanGoogleEmail = googleEmail.trim().toLowerCase();
    if (!cleanGoogleEmail) {
      setGoogleError('Please provide your Google email address.');
      return;
    }

    setGoogleLoading(true);
    setGoogleError('');
    try {
      const googleId = `gid_google_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;
      const res = await authService.loginWithGoogle({
        googleId,
        email: cleanGoogleEmail,
        name: googleName.trim() || cleanGoogleEmail.split('@')[0],
        accountType: googleAccountType,
        acceptTerms: true
      });

      if (res.success && res.user) {
        setShowGoogleModal(false);
        setWelcomeUser(res.user);
        setSuccessMessage('Welcome to CATALYX. Your 1-month free trial is now active.');
      } else {
        setGoogleError(res.error || 'Google authentication failed.');
      }
    } catch (err: any) {
      setGoogleError(err.message || 'Google authentication encountered an error.');
    } finally {
      setGoogleLoading(false);
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
            <CatalyxLogo size="md" showSubtitle />
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

              {/* Official Brand Logo Badge */}
              <div className="flex justify-center mb-5">
                <CatalyxLogo size="lg" showSubtitle variant="hybrid" />
              </div>

              {/* Mode Toggle Tabs (Hidden during welcome screen) */}
              {!welcomeUser && (
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
              )}

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

              {/* Google Sign-In / Account Creation Entrypoint */}
              {!welcomeUser && mode !== 'FORGOT_PASSWORD' && (
                <div className="mb-4">
                  <button
                    type="button"
                    onClick={handleInitiateGoogleAuth}
                    disabled={isLoading}
                    className="w-full py-2.5 px-4 bg-white/5 hover:bg-white/10 active:scale-[0.99] border border-white/10 hover:border-brand-purple/40 text-gray-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-sm"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>{mode === 'REGISTER' ? 'Continue with Google (1-Month Free Trial)' : 'Sign in with Google'}</span>
                  </button>

                  <div className="relative flex py-3 items-center">
                    <div className="flex-grow border-t border-white/10"></div>
                    <span className="flex-shrink mx-3 text-[10px] font-mono uppercase tracking-wider text-gray-500">OR WITH EMAIL</span>
                    <div className="flex-grow border-t border-white/10"></div>
                  </div>
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

              {/* ----------------- WELCOME SCREEN (Direct Registration Success) ----------------- */}
              {welcomeUser && (
                <div className="space-y-5 text-center py-2">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400 shadow-lg shadow-emerald-500/10">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-display font-bold text-white">Welcome to CATALYX.</h3>
                    <p className="text-sm text-emerald-400 font-semibold mt-1">Your 1-month free trial is now active.</p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/80 border border-white/10 text-left space-y-2 text-xs">
                    <div className="flex justify-between items-center text-gray-400">
                      <span>Account</span>
                      <span className="text-white font-medium">{welcomeUser.username} ({welcomeUser.email})</span>
                    </div>
                    <div className="flex justify-between items-center text-gray-400">
                      <span>Workspace Tier</span>
                      <span className="text-brand-cyan font-bold font-mono">
                        {welcomeUser.accountType === 'ORGANIZATION' ? 'Organization ($25/mo)' : welcomeUser.accountType === 'GROUP' ? 'Group / Team ($13/mo)' : 'Individual ($10/mo)'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-gray-400">
                      <span>Trial Period</span>
                      <span className="text-emerald-400 font-mono font-semibold">30 Days ($0 Upfront)</span>
                    </div>
                    <div className="flex justify-between items-center text-gray-400">
                      <span>Status</span>
                      <span className="text-emerald-400 font-mono font-semibold">Active Free Trial</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onAuthSuccess(welcomeUser)}
                    className="w-full py-3.5 bg-gradient-to-r from-brand-purple to-brand-cyan text-slate-950 font-bold font-display rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.99] transition-all cursor-pointer shadow-lg shadow-brand-purple/20"
                  >
                    <span>CONTINUE TO CATALYX</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* ----------------- REGISTER FORM (Direct Normal Registration - No Verification Code Gate) ----------------- */}
              {mode === 'REGISTER' && !welcomeUser && (
                <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                  <div className="mb-2">
                    <h2 className="text-base font-display font-semibold text-white">CREATE YOUR CATALYX ACCOUNT</h2>
                    <p className="text-[11px] text-gray-400 mt-0.5">Select your workspace tier and start your 1-month free trial immediately.</p>
                  </div>

                  {/* Choose Account Type First (Authoritative Server Enforcement) */}
                  <div>
                    <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-1.5">
                      Choose Account Type
                    </label>

                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setAccountType('INDIVIDUAL')}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          accountType === 'INDIVIDUAL'
                            ? 'bg-brand-purple/20 border-brand-purple text-white shadow-lg shadow-brand-purple/10 ring-1 ring-brand-purple'
                            : 'bg-slate-950/60 border-white/10 text-gray-400 hover:border-white/20 hover:text-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-mono uppercase font-bold tracking-wider">Individual</span>
                          <span className="text-[8px] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold">1 MO FREE</span>
                        </div>
                        <div className="text-xs font-bold text-white">$10<span className="text-[10px] text-gray-400 font-normal">/mo</span></div>
                        <div className="text-[9px] text-gray-400 mt-0.5 leading-tight">after 1-month free trial</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setAccountType('GROUP')}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          accountType === 'GROUP'
                            ? 'bg-brand-purple/20 border-brand-purple text-white shadow-lg shadow-brand-purple/10 ring-1 ring-brand-purple'
                            : 'bg-slate-950/60 border-white/10 text-gray-400 hover:border-white/20 hover:text-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-mono uppercase font-bold tracking-wider">Group / Team</span>
                          <span className="text-[8px] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold">1 MO FREE</span>
                        </div>
                        <div className="text-xs font-bold text-white">$13<span className="text-[10px] text-gray-400 font-normal">/mo</span></div>
                        <div className="text-[9px] text-gray-400 mt-0.5 leading-tight">after 1-month free trial</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setAccountType('ORGANIZATION')}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          accountType === 'ORGANIZATION'
                            ? 'bg-brand-purple/20 border-brand-purple text-white shadow-lg shadow-brand-purple/10 ring-1 ring-brand-purple'
                            : 'bg-slate-950/60 border-white/10 text-gray-400 hover:border-white/20 hover:text-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-mono uppercase font-bold tracking-wider truncate">Org / Co</span>
                          <span className="text-[8px] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold">1 MO FREE</span>
                        </div>
                        <div className="text-xs font-bold text-white">$25<span className="text-[10px] text-gray-400 font-normal">/mo</span></div>
                        <div className="text-[9px] text-gray-400 mt-0.5 leading-tight">after 1-month free trial</div>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-gray-500 absolute left-3.5 top-2.5" />
                      <input
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="e.g. Alex Vance"
                        className="w-full bg-slate-950/70 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-brand-purple transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-2.5" />
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
                      Password (Min. 8 chars, 1 letter, 1 number/symbol)
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-gray-500 absolute left-3.5 top-2.5" />
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
                        className="absolute right-3.5 top-2.5 text-gray-500 hover:text-gray-300 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Live Password Strength Criteria */}
                    {password && (
                      <div className="flex flex-wrap gap-2 mt-1.5 text-[10px] font-mono">
                        <span className={`inline-flex items-center gap-1 ${password.length >= 8 ? 'text-emerald-400' : 'text-gray-500'}`}>
                          <Check className="w-2.5 h-2.5" /> 8+ chars
                        </span>
                        <span className={`inline-flex items-center gap-1 ${/[a-zA-Z]/.test(password) ? 'text-emerald-400' : 'text-gray-500'}`}>
                          <Check className="w-2.5 h-2.5" /> 1 letter
                        </span>
                        <span className={`inline-flex items-center gap-1 ${/[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password) ? 'text-emerald-400' : 'text-gray-500'}`}>
                          <Check className="w-2.5 h-2.5" /> 1 number/symbol
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-1">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-2.5" />
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
                        className="absolute right-3.5 top-2.5 text-gray-500 hover:text-gray-300 cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {confirmPassword && (
                      <div className="mt-1 text-[10px] font-mono">
                        {password === confirmPassword ? (
                          <span className="text-emerald-400 flex items-center gap-1"><Check className="w-2.5 h-2.5" /> Passwords match</span>
                        ) : (
                          <span className="text-red-400">Passwords do not match</span>
                        )}
                      </div>
                    )}
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
                        , and the 1-month free trial terms ($10/mo Individual, $13/mo Group, or $25/mo Organization thereafter).
                      </span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !acceptTerms}
                    className="w-full py-3 bg-gradient-to-r from-brand-purple to-brand-cyan text-slate-950 font-bold font-display rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-brand-purple/10 mt-2"
                  >
                    <span>{isLoading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
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

        {/* Google Authentication Dialog Modal */}
        {showGoogleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-slate-950 border border-white/10 rounded-2xl overflow-hidden shadow-2xl p-6"
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center p-1.5 border border-white/10">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-sm text-white">Google Identity Authorization</h3>
                    <p className="text-[10px] font-mono text-gray-400">Pre-verified Email • Instant Activation</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowGoogleModal(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {googleError && (
                <div className="mb-4 p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{googleError}</span>
                </div>
              )}

              <form onSubmit={handleGoogleAuthSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-1">
                    Google Account Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      value={googleEmail}
                      onChange={(e) => setGoogleEmail(e.target.value)}
                      placeholder="user@gmail.com"
                      className="w-full bg-slate-900 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-brand-purple"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-1">
                    Display Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={googleName}
                      onChange={(e) => setGoogleName(e.target.value)}
                      placeholder="e.g. Alex Vance"
                      className="w-full bg-slate-900 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-brand-purple"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-1">
                    Workspace Plan (Includes 1-Month Free Trial)
                  </label>
                  <select
                    value={googleAccountType}
                    onChange={(e) => setGoogleAccountType(e.target.value as any)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-purple"
                  >
                    <option value="INDIVIDUAL">Individual ($10/mo after 1-month trial)</option>
                    <option value="GROUP">Group / Team ($13/mo after 1-month trial)</option>
                    <option value="ORGANIZATION">Organization ($25/mo after 1-month trial)</option>
                  </select>
                </div>

                <div className="p-3 bg-slate-900/80 rounded-xl border border-white/5 text-[11px] text-gray-400 leading-relaxed">
                  <div className="text-[10px] font-mono text-emerald-400 uppercase font-semibold mb-1">
                    ✓ Google Email Verified Automatically
                  </div>
                  Accounts authenticated with Google do not require OTP verification. 1-month free trial activates immediately.
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowGoogleModal(false)}
                    className="w-1/3 py-2.5 rounded-xl border border-white/10 text-xs font-mono text-gray-400 hover:text-white cursor-pointer"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    disabled={googleLoading}
                    className="w-2/3 py-2.5 bg-gradient-to-r from-brand-purple to-brand-cyan text-slate-950 font-bold font-display rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 hover:opacity-95 cursor-pointer shadow-lg"
                  >
                    <span>{googleLoading ? 'CONNECTING...' : 'AUTHORIZE GOOGLE ACCOUNT'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
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
