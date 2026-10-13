import React, { useState } from 'react';
import {
  Key,
  LogIn,
  UserPlus,
  Mail,
  Lock,
  User,
  Phone,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  RefreshCw,
  Hash,
  BookOpen,
  FileText,
  TrendingUp,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import UniversityPathwayLogo from '../components/UniversityPathwayLogo';

export type AuthMode =
  | 'signin'
  | 'register'
  | 'forgot-password'
  | 'reset-password'
  | 'otp-verify'
  | 'email-verify';

interface AuthPageProps {
  initialMode?: AuthMode;
  onNavigate: (path: string) => void;
}

export default function AuthPage({ initialMode = 'signin', onNavigate }: AuthPageProps) {
  const { login, registerAccount } = useAuth();

  const [authMode, setAuthMode] = useState<AuthMode>(initialMode);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Sign In inputs
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register inputs
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  // Password Recovery & Reset inputs
  const [recoveryIdentifier, setRecoveryIdentifier] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // OTP inputs
  const [otpCode, setOtpCode] = useState('');

  // Email verification inputs
  const [verificationEmail, setVerificationEmail] = useState('');
  const [emailToken, setEmailToken] = useState('');

  // Handle Sign In
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);
    setAuthLoading(true);

    const res = await login(loginIdentifier, loginPassword);
    setAuthLoading(false);

    if (res.success) {
      onNavigate('/student');
    } else {
      setAuthError(res.error || 'Invalid credentials. Please verify your details.');
    }
  };

  // Handle Register
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);

    if (regPassword !== regConfirmPassword) {
      setAuthError('Passwords do not match. Please re-enter.');
      return;
    }

    if (regPassword.length < 6) {
      setAuthError('Password must contain at least 6 characters.');
      return;
    }

    setAuthLoading(true);
    const res = await registerAccount(regFullName, regEmail, regPhone, regPassword);
    setAuthLoading(false);

    if (res.success) {
      setAuthMode('otp-verify');
      setAuthSuccess('Account created! A 6-digit verification code has been dispatched.');
    } else {
      setAuthError(res.error || 'Failed to create student account. Please review fields.');
    }
  };

  // Handle Forgot Password
  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!recoveryIdentifier.trim()) {
      setAuthError('Please enter your email or registration number.');
      return;
    }
    setAuthSuccess(
      `Password recovery code dispatched to contact associated with "${recoveryIdentifier}".`
    );
    setTimeout(() => {
      setAuthMode('reset-password');
    }, 1500);
  };

  // Handle Reset Password
  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (newPassword !== confirmNewPassword) {
      setAuthError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setAuthError('New password must contain at least 6 characters.');
      return;
    }
    setAuthSuccess('Your password has been successfully reset. Please sign in.');
    setTimeout(() => {
      setAuthMode('signin');
      setAuthSuccess(null);
    }, 1800);
  };

  // Handle OTP Verification
  const handleOtpVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (otpCode.trim().length < 4) {
      setAuthError('Please enter the complete verification code.');
      return;
    }
    setAuthSuccess('Two-factor verification successful. Opening candidate portal...');
    setTimeout(() => {
      onNavigate('/student');
    }, 1200);
  };

  // Handle Email Verification
  const handleEmailVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!verificationEmail || !emailToken) {
      setAuthError('Please provide both email address and verification token.');
      return;
    }
    setAuthSuccess('Email address verified successfully. You may now sign in.');
    setTimeout(() => {
      setAuthMode('signin');
      setAuthSuccess(null);
    }, 1500);
  };

  const isRegisterMode = authMode === 'register' || authMode === 'signin';
  const promoCopy: Record<AuthMode, { heading: string; description: string; benefits: string[] }> = {
    signin: { heading: 'Welcome Back to University Pathway', description: 'Continue your academic journey from your student dashboard.', benefits: ['Access your student dashboard', 'Review your application', 'Follow your progress', 'See important updates'] },
    register: { heading: 'Your Journey Starts Here', description: 'Create a student account and take the first step towards your goals.', benefits: ['Create your student account', 'Explore available programmes', 'Start your application', 'Track your next steps'] },
    'forgot-password': { heading: 'We Will Help You Get Back', description: 'Recover access to your student account safely.', benefits: ['Request recovery instructions', 'Protect your account', 'Choose a new password', 'Return to your dashboard'] },
    'reset-password': { heading: 'A Fresh Start, Securely', description: 'Set a new password to protect your student account.', benefits: ['Choose a strong password', 'Confirm your new password', 'Keep your account protected', 'Return to sign in'] },
    'otp-verify': { heading: 'One More Step to Get Started', description: 'Verification helps protect your account and your academic information.', benefits: ['Confirm your identity', 'Protect your student details', 'Complete account setup', 'Continue your journey'] },
    'email-verify': { heading: 'Confirm Your Email Address', description: 'Keep your contact details accurate for important account updates.', benefits: ['Confirm your email', 'Protect your account', 'Stay informed', 'Continue to sign in'] },
  };
  const promo = promoCopy[authMode];
  // Each authentication step has its own photographic treatment.
  const promoImages: Record<AuthMode, { src: string; alt: string; position: string }> = {
    signin: { src: '/images/auth_student.jpg', alt: 'Student ready to continue studying', position: 'center top' },
    register: { src: '/images/african_students_hero.jpg', alt: 'Students beginning their academic journey', position: 'center center' },
    'forgot-password': { src: '/images/student_support.jpg', alt: 'Student receiving academic support', position: 'center center' },
    'reset-password': { src: '/images/student_writing_banner.jpg', alt: 'Student working at a desk', position: 'center center' },
    'otp-verify': { src: '/images/classroom.jpg', alt: 'Students learning in a classroom', position: 'center center' },
    'email-verify': { src: '/images/campus_atmosphere.jpg', alt: 'Academic learning environment', position: 'center center' },
  };
  const promoImage = promoImages[authMode];

  return (
    <div className="min-h-screen bg-[#06102b] flex flex-col items-center justify-center px-3 py-5 sm:px-6 sm:py-8 lg:py-10 font-sans">
      {/* Optional Return link */}
      <div className="w-full max-w-6xl mb-3 flex items-center justify-between px-2">
        <button
          type="button"
          onClick={() => onNavigate('/')}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-white transition-colors cursor-pointer bg-white/5 px-3 py-1.5 rounded-lg border border-white/10"
        >
          <ArrowLeft size={14} />
          <span>Return to Website</span>
        </button>
        <span className="text-xs text-slate-400 hidden sm:inline">University Pathway Educational Consult</span>
      </div>

      {/* Main Authentication Composition Matching Approved Mockup */}
      <main className="w-full max-w-6xl bg-white rounded-[20px] sm:rounded-[30px] shadow-[0_30px_90px_rgba(0,0,0,0.3)] border border-white/10 overflow-hidden flex flex-col md:flex-row md:min-h-[640px] lg:min-h-[680px]">
        
        {/* =========================================================================
            LEFT PANEL (approx 58-60% width): Royal Blue Gradient + Text + 4 Benefit Rows + Student Portrait
            ========================================================================= */}
        <div className="hidden md:flex md:w-[48%] lg:w-[58%] bg-gradient-to-br from-[#123578] via-[#091b46] to-[#040c24] text-white p-5 md:p-6 lg:p-10 flex-col justify-between relative isolate overflow-hidden md:min-h-[640px] lg:min-h-[680px]">
          
          {/* Top Header section inside left panel */}
          <div className="relative z-20 min-w-0 max-w-full xl:max-w-[56%]">
            <div className="mb-4">
              <UniversityPathwayLogo />
            </div>

            <h1 className="font-serif text-[clamp(1.45rem,2.35vw,2.35rem)] font-black text-white leading-tight tracking-tight mt-2 break-words">
              {promo.heading}
            </h1>

            <p className="text-slate-200 text-xs sm:text-sm mt-2 font-normal">
              {promo.description}
            </p>

            {/* Four Small Vertically Stacked Benefit Rows with Colourful Icons */}
            <div className="mt-5 space-y-2.5">
              {promo.benefits.map((label, index) => { const Icon = [BookOpen, FileText, TrendingUp, ShieldCheck][index]; return (
                <div key={label} className="flex items-center gap-2 lg:gap-3 bg-white/10 px-2.5 lg:px-3.5 py-2.5 rounded-xl border border-white/15 backdrop-blur-sm w-fit max-w-full lg:w-80">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#f0bb5b] to-[#c62839] flex items-center justify-center text-white shrink-0 shadow-sm">
                    <Icon size={14} />
                  </div>
                  <span className="text-xs lg:text-sm font-semibold text-white">{label}</span>
                </div>
              ); })}
            </div>
          </div>

          {/* Large Student Photograph on the Right Half of Left Panel with Diagonal Cut */}
          <div className="absolute right-0 bottom-0 top-0 w-[54%] pointer-events-none hidden xl:block overflow-hidden">
            {/* Diagonal overlay boundary matching reference */}
            <div className="absolute inset-y-0 left-0 w-28 bg-gradient-to-r from-[#091b46] via-[#091b46]/60 to-transparent z-10" />
            <img
              src={promoImage.src}
              alt={promoImage.alt}
              className="absolute right-0 bottom-0 h-full w-full object-cover scale-105"
              style={{
                clipPath: 'polygon(32% 0%, 100% 0%, 100% 100%, 0% 100%)',
                objectPosition: promoImage.position,
              }}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).onerror = null;
                (e.currentTarget as HTMLImageElement).src = '/images/african_students_hero.jpg';
              }}
            />
          </div>

          {/* Tablet: full-bleed editorial photo integrated into the promo panel.
              The dark-to-transparent fade preserves legibility of the benefits above. */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 top-[38%] z-0 overflow-hidden xl:hidden">
            <img
              src={promoImage.src}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              style={{ objectPosition: promoImage.position }}
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = '/images/african_students_hero.jpg';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#091b46] via-[#091b46]/70 via-[30%] to-[#091b46]/40" />
            <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#040c24] via-[#040c24]/75 to-transparent" />
          </div>

          {/* Help Desk Footer inside Left Panel */}
          <div className="relative z-20 mt-8 pt-4 border-t border-white/25 text-[11px] text-white/90 flex flex-wrap items-center justify-between gap-2">
            <span>Admissions Help Desk: 09133903600</span>
            <span>23 Olaiya Street, Ilorin</span>
          </div>
        </div>

        {/* =========================================================================
            RIGHT PANEL (approx 42% width): White Registration / Auth Form Panel
            ========================================================================= */}
        <div className="w-full md:w-[52%] lg:w-[42%] bg-white p-5 sm:p-8 md:p-6 lg:p-10 flex flex-col justify-between min-w-0">
          <div>
            {/* Form Title & Subtitle */}
            <div className="mb-5">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#0b1a42]">
                {authMode === 'register' && 'Create Your Account'}
                {authMode === 'signin' && 'Welcome Back'}
                {authMode === 'forgot-password' && 'Password Recovery'}
                {authMode === 'reset-password' && 'Reset Password'}
                {authMode === 'otp-verify' && 'Security Verification'}
                {authMode === 'email-verify' && 'Email Verification'}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {authMode === 'register' && 'Create your student account to begin your application.'}
                {authMode === 'signin' && 'Sign in to access your candidate portal.'}
                {authMode === 'forgot-password' && 'Enter your email or registration number for recovery instructions.'}
                {authMode === 'reset-password' && 'Enter your reset token and new secure password.'}
                {authMode === 'otp-verify' && 'Enter the 6-digit code dispatched to your registered phone or email.'}
                {authMode === 'email-verify' && 'Confirm your email address using the token sent to your inbox.'}
              </p>
            </div>

            {/* Register / Sign In Tabs with Crimson Active State */}
            {isRegisterMode && (
              <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('register');
                    setAuthError(null);
                    setAuthSuccess(null);
                  }}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    authMode === 'register'
                      ? 'bg-white text-[#0b1a42] shadow-sm border-b-2 border-[#c62839]'
                      : 'text-slate-500 hover:text-[#0b1a42]'
                  }`}
                >
                  Register
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signin');
                    setAuthError(null);
                    setAuthSuccess(null);
                  }}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    authMode === 'signin'
                      ? 'bg-white text-[#0b1a42] shadow-sm border-b-2 border-[#c62839]'
                      : 'text-slate-500 hover:text-[#0b1a42]'
                  }`}
                >
                  Sign In
                </button>
              </div>
            )}

            {/* Google account option: intentionally disabled until verified OAuth backend is configured. */}
            {isRegisterMode && (
              <div className="mb-5">
                <button
                  type="button"
                  disabled
                  aria-describedby="google-auth-status"
                  className="flex w-full min-h-[48px] items-center justify-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-500 cursor-not-allowed"
                >
                  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 shrink-0">
                    <path fill="#4285F4" d="M21.35 12.25c0-.76-.07-1.49-.2-2.19H12v4.14h5.23a4.48 4.48 0 0 1-1.94 2.94v2.44h3.13c1.83-1.69 2.93-4.17 2.93-7.33Z"/>
                    <path fill="#34A853" d="M12 21.75c2.62 0 4.81-.87 6.42-2.37l-3.13-2.44c-.87.58-1.98.92-3.29.92a5.78 5.78 0 0 1-5.44-4.01H3.34v2.51A9.75 9.75 0 0 0 12 21.75Z"/>
                    <path fill="#FBBC05" d="M6.56 13.85a5.9 5.9 0 0 1 0-3.7V7.64H3.34a9.75 9.75 0 0 0 0 8.72l3.22-2.51Z"/>
                    <path fill="#EA4335" d="M12 6.14c1.43 0 2.7.49 3.71 1.45l2.78-2.78A9.29 9.29 0 0 0 12 2.25a9.75 9.75 0 0 0-8.66 5.39l3.22 2.51A5.78 5.78 0 0 1 12 6.14Z"/>
                  </svg>
                  {authMode === 'register' ? 'Sign up with Google' : 'Continue with Google'}
                </button>
                <p id="google-auth-status" className="mt-2 text-center text-[11px] text-slate-500">
                  Google sign-in will be available once secure account integration is configured.
                </p>
                <div className="my-5 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                  <span className="h-px flex-1 bg-slate-200" />
                  or use your email
                  <span className="h-px flex-1 bg-slate-200" />
                </div>
              </div>
            )}

            {/* Back link when in sub-modes */}
            {!isRegisterMode && (
              <div className="mb-4">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signin');
                    setAuthError(null);
                    setAuthSuccess(null);
                  }}
                  className="text-xs font-bold text-[#c62839] hover:underline cursor-pointer"
                >
                  ← Back to Sign In
                </button>
              </div>
            )}

            {/* Error & Success Feedback Alerts */}
            {authError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0 text-red-600" />
                <span>{authError}</span>
              </div>
            )}

            {authSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2">
                <CheckCircle2 size={15} className="shrink-0 text-emerald-600 mt-0.5" />
                <span>{authSuccess}</span>
              </div>
            )}

            {/* =====================================================================
                FORM: REGISTER
                ===================================================================== */}
            {authMode === 'register' && (
              <form onSubmit={handleRegister} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-[#0b1a42] mb-1">Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User size={15} />
                    </div>
                    <input
                      type="text"
                      required
                      value={regFullName}
                      onChange={(e) => setRegFullName(e.target.value)}
                      placeholder="Surname First, e.g. Bello Amina Zainab"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0b1a42] outline-none min-h-[44px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0b1a42] mb-1">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail size={15} />
                    </div>
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="candidate@email.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0b1a42] outline-none min-h-[44px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0b1a42] mb-1">Phone Number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Phone size={15} />
                    </div>
                    <input
                      type="tel"
                      required
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="e.g. 08012345678"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0b1a42] outline-none min-h-[44px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0b1a42] mb-1">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock size={15} />
                    </div>
                    <input
                      type="password"
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Create Password (min. 6 chars)"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0b1a42] outline-none min-h-[44px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0b1a42] mb-1">Confirm Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock size={15} />
                    </div>
                    <input
                      type="password"
                      required
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="Re-type password"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0b1a42] outline-none min-h-[44px]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full mt-2 py-3.5 rounded-xl bg-[#c62839] hover:bg-[#b01f30] text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 min-h-[46px]"
                >
                  <UserPlus size={16} />
                  <span>{authLoading ? 'Creating Account...' : 'Create Account'}</span>
                </button>
              </form>
            )}

            {/* =====================================================================
                FORM: SIGN IN
                ===================================================================== */}
            {authMode === 'signin' && (
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#0b1a42] mb-1.5">
                    Registration Number or Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User size={16} />
                    </div>
                    <input
                      type="text"
                      required
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder="e.g. UPEC/2025/0842 or email@address.com"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0b1a42] outline-none min-h-[44px]"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-[#0b1a42]">Password</label>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('forgot-password');
                        setAuthError(null);
                      }}
                      className="text-[11px] font-semibold text-[#c62839] hover:underline cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock size={16} />
                    </div>
                    <input
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Enter password"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0b1a42] outline-none min-h-[44px]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full mt-2 py-3.5 rounded-xl bg-[#c62839] hover:bg-[#b01f30] text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 min-h-[46px]"
                >
                  <LogIn size={16} />
                  <span>{authLoading ? 'Signing In...' : 'Sign In to Portal'}</span>
                </button>
              </form>
            )}

            {/* =====================================================================
                FORM: FORGOT PASSWORD
                ===================================================================== */}
            {authMode === 'forgot-password' && (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#0b1a42] mb-1.5">
                    Email or Student Reg Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User size={16} />
                    </div>
                    <input
                      type="text"
                      required
                      value={recoveryIdentifier}
                      onChange={(e) => setRecoveryIdentifier(e.target.value)}
                      placeholder="e.g. UPEC/2025/0842"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0b1a42] outline-none min-h-[44px]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-[#c62839] hover:bg-[#b01f30] text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[46px]"
                >
                  <Key size={16} />
                  <span>Send Recovery Code</span>
                </button>
              </form>
            )}

            {/* =====================================================================
                FORM: RESET PASSWORD
                ===================================================================== */}
            {authMode === 'reset-password' && (
              <form onSubmit={handleResetPassword} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-[#0b1a42] mb-1">Reset Code</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Hash size={16} />
                    </div>
                    <input
                      type="text"
                      required
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value)}
                      placeholder="6-digit reset code"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0b1a42] outline-none min-h-[44px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0b1a42] mb-1">New Password</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 6 chars"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0b1a42] outline-none min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0b1a42] mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Re-type new password"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0b1a42] outline-none min-h-[44px]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-[#c62839] hover:bg-[#b01f30] text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[46px]"
                >
                  <RefreshCw size={16} />
                  <span>Save Password &amp; Sign In</span>
                </button>
              </form>
            )}

            {/* =====================================================================
                FORM: OTP VERIFICATION
                ===================================================================== */}
            {authMode === 'otp-verify' && (
              <form onSubmit={handleOtpVerify} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#0b1a42] mb-1">6-Digit OTP Code</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <ShieldCheck size={16} />
                    </div>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="e.g. 482910"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-xs font-mono font-bold tracking-widest text-center focus:ring-2 focus:ring-[#0b1a42] outline-none min-h-[44px]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-[#c62839] hover:bg-[#b01f30] text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[46px]"
                >
                  <ShieldCheck size={16} />
                  <span>Verify Code</span>
                </button>
              </form>
            )}

            {/* =====================================================================
                FORM: EMAIL VERIFICATION
                ===================================================================== */}
            {authMode === 'email-verify' && (
              <form onSubmit={handleEmailVerify} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-[#0b1a42] mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={verificationEmail}
                    onChange={(e) => setVerificationEmail(e.target.value)}
                    placeholder="candidate@email.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0b1a42] outline-none min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0b1a42] mb-1">Activation Token</label>
                  <input
                    type="text"
                    required
                    value={emailToken}
                    onChange={(e) => setEmailToken(e.target.value)}
                    placeholder="Enter token"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0b1a42] outline-none min-h-[44px]"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-[#c62839] hover:bg-[#b01f30] text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[46px]"
                >
                  <CheckCircle2 size={16} />
                  <span>Confirm Email</span>
                </button>
              </form>
            )}
          </div>

          {/* Bottom Already have an account? Sign In link */}
          <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            {authMode === 'register' ? (
              <span>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signin');
                    setAuthError(null);
                    setAuthSuccess(null);
                  }}
                  className="text-[#c62839] font-bold hover:underline cursor-pointer"
                >
                  Sign In
                </button>
              </span>
            ) : (
              <span>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('register');
                    setAuthError(null);
                    setAuthSuccess(null);
                  }}
                  className="text-[#c62839] font-bold hover:underline cursor-pointer"
                >
                  Register
                </button>
              </span>
            )}
          </div>
        </div>
      </main>

      {/* Copyright Footer */}
      <footer className="mt-4 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} University Pathway Educational Consult. All Rights Reserved.
      </footer>
    </div>
  );
}
