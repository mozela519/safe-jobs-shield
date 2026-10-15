import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Language, AuthViewMode, AppTab } from '../types';
import {
  Shield,
  ShieldCheck,
  Lock,
  Mail,
  User as UserIcon,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  LogOut,
  Smartphone,
  Globe,
  KeyRound,
  ExternalLink,
  ChevronLeft,
  BadgeCheck,
} from 'lucide-react';

interface AuthPageProps {
  language: Language;
  initialMode?: AuthViewMode;
  onNavigateTab: (tab: AppTab) => void;
  isModal?: boolean;
  onClose?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  language,
  initialMode = 'login',
  onNavigateTab,
  isModal = false,
  onClose,
}) => {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    clearError,
    login,
    register,
    loginWithGoogleToken,
    startGoogleOAuthPopup,
    verifyEmail,
    resendVerification,
    forgotPassword,
    resetPassword,
    logout,
    updateProfile,
    fetchSessions,
    revokeSessionById,
  } = useAuth();

  const [mode, setMode] = useState<AuthViewMode>(() => {
    if (isAuthenticated) return 'account';
    return initialMode;
  });

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Verification & Reset states
  const [verificationCode, setVerificationCode] = useState('');
  const [simulatedSandboxCode, setSimulatedSandboxCode] = useState<string | null>(null);
  const [resetToken, setResetToken] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Feedback states
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Account / Sessions states
  const [sessions, setSessions] = useState<any[]>([]);
  const [editingProfile, setEditingProfile] = useState(false);
  const [newName, setNewName] = useState(user?.name || '');

  // Reset form messages on mode switch
  useEffect(() => {
    setFormError(null);
    setSuccessMessage(null);
    clearError();
  }, [mode]);

  useEffect(() => {
    if (isAuthenticated && mode !== 'account' && mode !== 'verify_email') {
      setMode('account');
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (user) {
      setNewName(user.name);
    }
  }, [user]);

  // Handle resend countdown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Load user sessions when in account mode
  useEffect(() => {
    if (isAuthenticated && mode === 'account') {
      fetchSessions().then(setSessions);
    }
  }, [isAuthenticated, mode]);

  // Password strength checker
  const getPasswordStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 2) return { label: 'Weak', color: 'bg-rose-500', percent: 33 };
    if (score <= 4) return { label: 'Medium', color: 'bg-amber-500', percent: 66 };
    return { label: 'Strong', color: 'bg-emerald-500', percent: 100 };
  };

  const strength = getPasswordStrength(password);

  // Handlers
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    if (!email || !password) {
      setFormError('Please enter both your email address and password.');
      return;
    }

    setSubmitting(true);
    const result = await login(email, password);
    setSubmitting(false);

    if (result.success) {
      setSuccessMessage('Signed in successfully.');
      if (isModal && onClose) {
        setTimeout(onClose, 600);
      }
    } else {
      setFormError(result.error || 'Failed to sign in.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    if (!name.trim()) {
      setFormError('Please enter your full name.');
      return;
    }
    if (!email.trim()) {
      setFormError('Please enter your email address.');
      return;
    }
    if (password.length < 8) {
      setFormError('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setFormError('Passwords do not match. Please re-enter.');
      return;
    }

    setSubmitting(true);
    const result = await register(name, email, password);
    setSubmitting(false);

    if (result.success) {
      if (result.verificationCode) {
        setSimulatedSandboxCode(result.verificationCode);
      }
      setSuccessMessage('Account created! Please verify your email.');
      setMode('verify_email');
    } else {
      setFormError(result.error || 'Registration failed.');
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    if (!verificationCode.trim()) {
      setFormError('Please enter the 6-digit verification code.');
      return;
    }

    setSubmitting(true);
    const result = await verifyEmail(verificationCode, email);
    setSubmitting(false);

    if (result.success) {
      setSuccessMessage('Email verified successfully! Your account is fully protected.');
      setTimeout(() => {
        setMode('account');
        if (isModal && onClose) onClose();
      }, 1000);
    } else {
      setFormError(result.error || 'Invalid verification code.');
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;
    setFormError(null);
    const result = await resendVerification(email);
    if (result.success) {
      if (result.verificationCode) {
        setSimulatedSandboxCode(result.verificationCode);
      }
      setSuccessMessage('A new verification code has been dispatched.');
      setResendCooldown(60);
    } else {
      setFormError(result.error || 'Could not resend verification code.');
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    if (!email.trim()) {
      setFormError('Please enter your account email.');
      return;
    }

    setSubmitting(true);
    const result = await forgotPassword(email);
    setSubmitting(false);

    if (result.success) {
      if (result.resetCode) {
        setSimulatedSandboxCode(result.resetCode);
        setVerificationCode(result.resetCode);
      }
      if (result.resetToken) {
        setResetToken(result.resetToken);
      }
      setSuccessMessage('Password reset instructions dispatched. Check below for sandbox testing code.');
      setMode('reset_password');
    } else {
      setFormError(result.error || 'Unable to process reset request.');
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    if (!verificationCode.trim() && !resetToken) {
      setFormError('Please provide the reset code or token.');
      return;
    }

    if (password.length < 8) {
      setFormError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    const result = await resetPassword({
      code: verificationCode.trim(),
      token: resetToken,
      newPassword: password,
    });
    setSubmitting(false);

    if (result.success) {
      setSuccessMessage('Password has been updated! You are now logged in.');
      setMode('account');
      if (isModal && onClose) {
        setTimeout(onClose, 800);
      }
    } else {
      setFormError(result.error || 'Could not reset password.');
    }
  };

  const handleGoogleSignInClick = async () => {
    setFormError(null);
    setSubmitting(true);
    const res = await startGoogleOAuthPopup();
    setSubmitting(false);
    if (!res.success && res.error) {
      setFormError(res.error);
    }
  };

  const fillQuickDemo = (type: 'citizen' | 'verifier') => {
    if (type === 'citizen') {
      setEmail('citizen@example.co.zw');
      setPassword('CitizenSafe2026!');
    } else {
      setEmail('officer@safejobs.gov.zw');
      setPassword('SafeJobs2026!Shield');
    }
    setFormError(null);
    setSuccessMessage(`Loaded ${type === 'verifier' ? 'National Verifier' : 'Citizen'} demo credentials.`);
  };

  const handleRevokeSession = async (sId: string) => {
    const success = await revokeSessionById(sId);
    if (success) {
      setSessions((prev) => prev.filter((s) => s.id !== sId));
    }
  };

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const res = await updateProfile(newName);
    if (res.success) {
      setEditingProfile(false);
      setSuccessMessage('Profile name updated.');
    } else {
      setFormError(res.error || 'Failed to update name.');
    }
  };

  return (
    <div className="max-w-xl mx-auto py-4 sm:py-8 px-4">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="bg-slate-900 px-6 py-6 text-white relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-inner">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight">
                  {isAuthenticated
                    ? 'Safe Jobs Shield Account'
                    : mode === 'register'
                    ? 'Create Citizen Account'
                    : mode === 'verify_email'
                    ? 'Verify Email Address'
                    : mode === 'forgot_password' || mode === 'reset_password'
                    ? 'Account Recovery'
                    : 'Sign In to Safe Jobs Shield'}
                </h2>
                <p className="text-xs text-slate-300">
                  National Employment Safety & Data Protection Platform
                </p>
              </div>
            </div>

            {isModal && onClose && (
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Global Error & Success Alerts */}
        {(formError || error) && (
          <div className="mx-6 mt-6 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-start gap-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{formError || error}</div>
          </div>
        )}

        {successMessage && (
          <div className="mx-6 mt-6 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-start gap-2.5 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{successMessage}</div>
          </div>
        )}

        {/* Sandbox Dev Code Display Helper */}
        {simulatedSandboxCode && (
          <div className="mx-6 mt-4 p-3 bg-teal-50 border border-teal-200 text-teal-900 rounded-xl text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-teal-600 shrink-0" />
              <span>
                <strong>Test Sandbox Code:</strong> <span className="font-mono text-sm font-bold tracking-widest text-teal-700">{simulatedSandboxCode}</span>
              </span>
            </div>
            <button
              onClick={() => setVerificationCode(simulatedSandboxCode)}
              className="text-[11px] bg-teal-600 hover:bg-teal-700 text-white font-semibold px-2 py-1 rounded cursor-pointer transition-colors"
            >
              Auto-Fill
            </button>
          </div>
        )}

        {/* Anonymous Default & Zero Message Retention Guarantee */}
        <div className="mx-6 mt-4 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold text-slate-900">
            <EyeOff className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Anonymous by Default • Accounts are 100% Optional</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            You do <strong>not</strong> need an account to verify job offers, scan posters, or check employers. If you create an account, it only synchronizes your check hashes and alert preferences across devices. <strong>Our database holds zero message content, zero applicant phone numbers, and zero recruiter chat transcripts.</strong>
          </p>
        </div>

        <div className="p-6">
          {/* ========================================================= */}
          {/* 1. SIGN IN FORM */}
          {/* ========================================================= */}
          {mode === 'login' && !isAuthenticated && (
            <div className="space-y-5">
              {/* Google Sign In Button */}
              <div>
                <button
                  type="button"
                  onClick={handleGoogleSignInClick}
                  disabled={submitting || isLoading}
                  className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>
              </div>

              <div className="relative flex items-center justify-center">
                <div className="border-t border-slate-200 w-full"></div>
                <span className="bg-white px-3 text-[11px] uppercase tracking-wider text-slate-500 font-semibold absolute">
                  or sign in with email
                </span>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. name@example.co.zw"
                      required
                      className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setMode('forgot_password')}
                      className="text-[11px] text-emerald-700 hover:text-emerald-800 font-medium hover:underline cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Remember this device</span>
                  </label>
                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    256-bit Scrypt Hashed
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={submitting || isLoading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Demo Accounts Quick-Fill Box for Testing */}
              <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="text-[11px] font-semibold text-slate-600 mb-2 flex items-center justify-between">
                  <span>Quick-Fill Seed Credentials:</span>
                  <span className="text-[10px] text-slate-400">Zero-setup test</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => fillQuickDemo('citizen')}
                    className="py-1.5 px-2 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-lg text-[11px] font-medium text-slate-700 text-left cursor-pointer transition-colors"
                  >
                    <div className="font-semibold text-emerald-900">Chipo (Citizen)</div>
                    <div className="text-[10px] text-slate-500">citizen@example.co.zw</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => fillQuickDemo('verifier')}
                    className="py-1.5 px-2 bg-white hover:bg-teal-50 border border-slate-200 hover:border-teal-300 rounded-lg text-[11px] font-medium text-slate-700 text-left cursor-pointer transition-colors"
                  >
                    <div className="font-semibold text-teal-900">Tinashe (Officer)</div>
                    <div className="text-[10px] text-slate-500">officer@safejobs.gov.zw</div>
                  </button>
                </div>
              </div>

              <div className="text-center pt-2">
                <span className="text-xs text-slate-600">Don&apos;t have an account yet? </span>
                <button
                  onClick={() => setMode('register')}
                  className="text-xs text-emerald-700 hover:text-emerald-800 font-bold hover:underline cursor-pointer"
                >
                  Create an account
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 2. REGISTRATION FORM */}
          {/* ========================================================= */}
          {mode === 'register' && !isAuthenticated && (
            <div className="space-y-5">
              {/* Google Sign In Shortcut */}
              <button
                type="button"
                onClick={handleGoogleSignInClick}
                disabled={submitting || isLoading}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Register with Google</span>
              </button>

              <div className="relative flex items-center justify-center">
                <div className="border-t border-slate-200 w-full"></div>
                <span className="bg-white px-3 text-[11px] uppercase tracking-wider text-slate-500 font-semibold absolute">
                  or register with email
                </span>
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Tendai Mukamuri"
                      required
                      className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. tendai@example.co.zw"
                      required
                      className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Create Password (min. 8 characters)
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 8 chars, 1 uppercase, 1 number"
                      required
                      className="w-full pl-9 pr-10 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Strength Meter */}
                  {password && (
                    <div className="mt-1.5 space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-500">Security strength:</span>
                        <span className="font-semibold text-slate-700">{strength.label}</span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${strength.color}`}
                          style={{ width: `${strength.percent}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      required
                      className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 space-y-1">
                  <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Cyber and Data Protection Act [12:07] Notice
                  </div>
                  <p className="leading-relaxed">
                    Safe Jobs Shield never shares your cleartext personal credentials. Password hashes are salted and computed with modern cryptographic key derivation.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={submitting || isLoading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Complete Registration</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="text-center pt-2">
                <span className="text-xs text-slate-600">Already registered? </span>
                <button
                  onClick={() => setMode('login')}
                  className="text-xs text-emerald-700 hover:text-emerald-800 font-bold hover:underline cursor-pointer"
                >
                  Sign in here
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 3. EMAIL VERIFICATION FORM */}
          {/* ========================================================= */}
          {mode === 'verify_email' && (
            <div className="space-y-5 text-center">
              <div className="w-14 h-14 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mx-auto">
                <Mail className="w-7 h-7" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900">Confirm Your Email</h3>
                <p className="text-xs text-slate-600 max-w-sm mx-auto mt-1">
                  Enter the 6-digit confirmation code dispatched to{' '}
                  <strong className="text-slate-800">{email || user?.email}</strong>.
                </p>
              </div>

              <form onSubmit={handleVerifySubmit} className="space-y-4">
                <div className="max-w-xs mx-auto">
                  <input
                    type="text"
                    maxLength={6}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full tracking-widest text-center text-xl font-mono py-2.5 bg-slate-50 border-2 border-emerald-400 focus:border-emerald-600 rounded-xl focus:outline-none"
                    autoFocus
                  />
                  <div className="text-[10px] text-slate-500 mt-1">
                    Enter the 6 numbers dispatched
                  </div>
                </div>

                <div className="flex flex-col gap-2 max-w-xs mx-auto">
                  <button
                    type="submit"
                    disabled={submitting || verificationCode.length < 6}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs sm:text-sm shadow-md transition-all cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? 'Verifying...' : 'Verify Email & Continue'}
                  </button>

                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={resendCooldown > 0}
                    className="text-xs text-slate-600 hover:text-emerald-700 font-medium py-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {resendCooldown > 0
                      ? `Resend available in ${resendCooldown}s`
                      : 'Resend Verification Code'}
                  </button>
                </div>
              </form>

              <div className="border-t border-slate-200 pt-3">
                <button
                  onClick={() => setMode('login')}
                  className="text-xs text-slate-500 hover:text-slate-800 flex items-center justify-center gap-1 mx-auto cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 4. FORGOT PASSWORD */}
          {/* ========================================================= */}
          {mode === 'forgot_password' && (
            <div className="space-y-5">
              <div className="text-center">
                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-2">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Reset Your Password</h3>
                <p className="text-xs text-slate-600 max-w-sm mx-auto mt-1">
                  Enter your registered email address and we will provide recovery credentials and instructions.
                </p>
              </div>

              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Account Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. name@example.co.zw"
                      required
                      className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Send Reset Instructions</span>
                  )}
                </button>
              </form>

              <div className="border-t border-slate-200 pt-3 text-center">
                <button
                  onClick={() => setMode('login')}
                  className="text-xs text-slate-500 hover:text-slate-800 flex items-center justify-center gap-1 mx-auto cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 5. RESET PASSWORD FORM */}
          {/* ========================================================= */}
          {mode === 'reset_password' && (
            <div className="space-y-5">
              <div className="text-center">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-2">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Set New Password</h3>
                <p className="text-xs text-slate-600 max-w-sm mx-auto mt-1">
                  Enter the verification code dispatched to your email and your new password.
                </p>
              </div>

              <form onSubmit={handleResetPasswordSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Recovery Code or Token
                  </label>
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="Enter 6-digit code or token"
                    required
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    New Password (min. 8 characters)
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 chars, 1 uppercase, 1 number"
                    required
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    required
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs sm:text-sm shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Updating Password...' : 'Save New Password & Sign In'}
                </button>
              </form>

              <div className="border-t border-slate-200 pt-3 text-center">
                <button
                  onClick={() => setMode('login')}
                  className="text-xs text-slate-500 hover:text-slate-800 flex items-center justify-center gap-1 mx-auto cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Cancel and Return to Sign In</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 6. ACCOUNT DASHBOARD & SESSION MANAGEMENT */}
          {/* ========================================================= */}
          {mode === 'account' && isAuthenticated && user && (
            <div className="space-y-6">
              {/* Profile Card */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-13 h-13 rounded-2xl object-cover ring-2 ring-emerald-500/50"
                    />
                  ) : (
                    <div className="w-13 h-13 rounded-2xl bg-emerald-700 text-white font-bold text-lg flex items-center justify-center shadow-inner">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                        {user.name}
                      </h4>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          user.role === 'verifier'
                            ? 'bg-purple-100 text-purple-800 border border-purple-300'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        }`}
                      >
                        {user.role === 'verifier' ? 'National Verifier' : 'Protected Citizen'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{user.email}</span>
                      {user.isEmailVerified ? (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Verified
                        </span>
                      ) : (
                        <button
                          onClick={() => setMode('verify_email')}
                          className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded hover:underline cursor-pointer"
                        >
                          Unverified (Verify Now)
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => setEditingProfile(!editingProfile)}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-white text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                  >
                    {editingProfile ? 'Cancel' : 'Edit Name'}
                  </button>
                  <button
                    onClick={async () => {
                      await logout();
                      setMode('login');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>

              {/* Edit Name Form */}
              {editingProfile && (
                <form onSubmit={handleUpdateName} className="p-4 bg-white border border-slate-200 rounded-xl flex gap-2">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Enter updated name"
                    className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    Save
                  </button>
                </form>
              )}

              {/* Active Sessions Security Audit */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Active Device Sessions ({sessions.length})
                  </h4>
                  <button
                    onClick={() => fetchSessions().then(setSessions)}
                    className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Refresh
                  </button>
                </div>

                <div className="space-y-2">
                  {sessions.map((sess) => (
                    <div
                      key={sess.id}
                      className="p-3 bg-white border border-slate-200 rounded-xl text-xs flex items-center justify-between gap-3 shadow-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                          {sess.userAgent.includes('Mobile') ? (
                            <Smartphone className="w-4 h-4" />
                          ) : (
                            <Globe className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800 flex items-center gap-2">
                            <span>{sess.ip}</span>
                            {sess.isCurrent && (
                              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.2 rounded">
                                Current Device
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500 truncate max-w-xs sm:max-w-md">
                            {sess.userAgent}
                          </div>
                        </div>
                      </div>

                      {!sess.isCurrent && (
                        <button
                          onClick={() => handleRevokeSession(sess.id)}
                          className="text-[11px] text-rose-600 hover:text-rose-800 font-medium hover:underline cursor-pointer"
                        >
                          Revoke
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions Shortcuts */}
              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <button
                  onClick={() => onNavigateTab('mychecks')}
                  className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left cursor-pointer transition-colors"
                >
                  <div className="text-xs font-bold text-slate-800">My Scanned Checks</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    View verified documents and employers
                  </div>
                </button>
                <button
                  onClick={() => onNavigateTab('report')}
                  className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left cursor-pointer transition-colors"
                >
                  <div className="text-xs font-bold text-slate-800">Submit Scam Report</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Contribute anonymized indicator
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
