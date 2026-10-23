import React, { useEffect, useState } from 'react';
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
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { upecAuthApi } from '../lib/upecAuthApi';
import UniversityPathwayLogo from '../components/UniversityPathwayLogo';
import OtpInput from '../components/auth/OtpInput';

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
  const { login, registerAccount, verifyEmail, resetPassword, changePassword } = useAuth();

  const [authMode, setAuthMode] = useState<AuthMode>(() => window.location.pathname.includes('reset-password') ? 'reset-password' : initialMode);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  useEffect(()=>{if(!authError&&!authSuccess)return;const timer=window.setTimeout(()=>{setAuthError(null);setAuthSuccess(null);},authError?7000:4500);return ()=>window.clearTimeout(timer);},[authError,authSuccess]);

  // Sign In inputs
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [visiblePasswords,setVisiblePasswords]=useState<Record<string,boolean>>({});
  const togglePassword=(field:string)=>setVisiblePasswords(previous=>({...previous,[field]:!previous[field]}));

  // Register inputs
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  // Password Recovery & Reset inputs
  const [recoveryIdentifier, setRecoveryIdentifier] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // OTP inputs
  const [otpCode, setOtpCode] = useState('');

  // Email verification inputs
  const [verificationEmail, setVerificationEmail] = useState('');
  const [emailToken, setEmailToken] = useState('');
  const [resendSeconds, setResendSeconds] = useState(0);
  const [recoveryRequested, setRecoveryRequested] = useState(false);
  const [recoveryCode, setRecoveryCode] = useState('');
  useEffect(() => {
    if (resendSeconds <= 0) return;
    const timer = window.setTimeout(() => setResendSeconds(n => Math.max(0, n - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [resendSeconds]);
  const resendCode = async (kind: 'signup' | 'recovery') => {
    const email = (kind === 'signup' ? verificationEmail : recoveryIdentifier).trim();
    if (!email || resendSeconds > 0 || authLoading) return;
    setAuthLoading(true); setAuthError(null); setAuthSuccess(null);
    try {
      await upecAuthApi.resend(email,kind);
      setResendSeconds(60);
      setAuthSuccess(kind === 'signup' ? 'A new verification code has been requested. Check your inbox and spam folder.' : 'If this address is registered, new recovery instructions will arrive shortly.');
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Unable to resend. Please try again.');
    } finally { setAuthLoading(false); }
  };

  // Handle Sign In
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);
    setAuthLoading(true);

    let res: {success:boolean;error?:string};
    try { res = await login(loginIdentifier, loginPassword); }
    catch { res = {success:false,error:'Unable to sign in. Please check your connection and try again.'}; }
    finally { setAuthLoading(false); }

    if (res.success) {
      onNavigate(window.sessionStorage.getItem('upec_selected_programme') ? '/student#applications' : '/student');
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

    if (regPassword.length < 10 || regPassword.length > 128) {
      setAuthError('Your password must have at least 10 characters.');
      return;
    }

    setAuthLoading(true);
    let res: {success:boolean;error?:string};
    try { res = await registerAccount(regFullName, regEmail, regPhone, regPassword); }
    catch { res = {success:false,error:'Unable to create your account. Please try again.'}; }
    finally { setAuthLoading(false); }

    if (res.success) {
      setVerificationEmail(regEmail);
      setAuthMode('email-verify');
      setResendSeconds(60);
      setAuthSuccess('Account created. Check your inbox and spam folder for a six-digit verification code. If no email arrives, use Resend verification code.');
    } else if (res.error?.includes('Account created but email delivery failed')) {
      setVerificationEmail(regEmail);
      setAuthMode('email-verify');
      setResendSeconds(60);
      setAuthError('Your account was created, but the verification email could not be sent. Wait one minute, then select Resend verification code. Do not create another account.');
    } else {
      setAuthError(res.error || 'Failed to create student account. Please review fields.');
    }
  };

  // Request a six-digit recovery code from the Express backend.
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault(); setAuthError(null); setAuthLoading(true);
    const result = await resetPassword(recoveryIdentifier.trim());
    setAuthLoading(false);
    if (!result.success) setAuthError(result.error || 'Could not send recovery email.');
    else { setRecoveryRequested(true); setResendSeconds(60); setAuthSuccess('If this email is registered, a recovery code will arrive shortly.'); }
  };
  const handleRecoveryVerify = async (e: React.FormEvent) => {
    e.preventDefault(); setAuthError(null); setAuthLoading(true);
    // The code is validated atomically when the password is changed.
    setAuthLoading(false);
    if(!/^[0-9]{6}$/.test(recoveryCode.trim()))setAuthError('Enter the six-digit recovery code.');
    else {setAuthSuccess('Code entered. Choose your new password.');setAuthMode('reset-password');}
  };
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault(); setAuthError(null);
    if(newPassword!==confirmNewPassword || newPassword.length<10 || newPassword.length>128) {setAuthError('Passwords must match and contain at least 10 characters.');return;}
    setAuthLoading(true);
    const result = await changePassword(newPassword,recoveryIdentifier.trim(),recoveryCode.trim());
    setAuthLoading(false);
    if(!result.success) setAuthError(result.error || 'Check your recovery email and code.');
    else {setAuthSuccess('Password updated. Please sign in.');setAuthMode('signin');}
  };
  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();setAuthError(null);setAuthLoading(true);
    const verified=await verifyEmail(otpCode.trim(),verificationEmail||regEmail);
    setAuthLoading(false);
    if(!verified)setAuthError('Verification failed. Check the code and email address.');
    else {setAuthSuccess('Email verified. Please sign in.');setAuthMode('signin');}
  };
  const handleEmailVerify = async (e: React.FormEvent) => {
    e.preventDefault();setAuthError(null);setAuthLoading(true);
    const verified=await verifyEmail(emailToken.trim(),verificationEmail.trim());
    setAuthLoading(false);
    if(!verified)setAuthError('Verification failed. Check your email and confirmation code.');
    else {setAuthSuccess('Email verified. You may now sign in.');setAuthMode('signin');}
  };

  useEffect(()=>{setAuthError(null);setAuthSuccess(null);},[authMode]);
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
  const panelsReversed = authMode === 'register';

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

      <style>{`
        @keyframes upecStageAppear {
          from { opacity: .4; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes upecAuthContentEnter {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .auth-stage { animation: upecStageAppear 700ms cubic-bezier(.22,1,.36,1) both; }
        .auth-form-panel form { animation: upecAuthContentEnter 650ms cubic-bezier(.22,1,.36,1) 120ms both; }
        @media(min-width:768px) {
          /* Identical tracks avoid offset errors at tablet and desktop sizes. */
          .auth-promo-panel,.auth-form-panel {
            flex: 0 0 50%;
            width: 50%;
            transition: transform 900ms cubic-bezier(.65,0,.25,1);
            will-change: transform;
          }
          .auth-stage[data-reversed="true"] .auth-promo-panel { transform: translate3d(100%,0,0); }
          .auth-stage[data-reversed="true"] .auth-form-panel { transform: translate3d(-100%,0,0); }
          .auth-stage[data-reversed="false"] .auth-promo-panel,
          .auth-stage[data-reversed="false"] .auth-form-panel { transform: translate3d(0,0,0); }
        }
        @media(prefers-reduced-motion:reduce) {
          .auth-stage,.auth-form-panel form { animation: none !important; }
          .auth-promo-panel,.auth-form-panel { transition: none !important; }
        }
      `}</style>
      {/* Main Authentication Composition Matching Approved Mockup */}
      <main className="w-full max-w-6xl bg-white rounded-[20px] sm:rounded-[30px] shadow-[0_30px_90px_rgba(0,0,0,0.3)] border border-white/10 overflow-hidden flex flex-col md:flex-row md:min-h-[640px] lg:min-h-[680px] auth-stage" data-reversed={panelsReversed}>
        
        {/* =========================================================================
            LEFT PANEL (approx 58-60% width): Royal Blue Gradient + Text + 4 Benefit Rows + Student Portrait
            ========================================================================= */}
        <div className={`hidden md:flex md:w-1/2 bg-gradient-to-br from-[#123578] via-[#091b46] to-[#040c24] text-white p-5 md:p-6 lg:p-10 flex-col justify-between relative isolate overflow-hidden auth-promo-panel md:min-h-[640px] lg:min-h-[680px] `} >
          
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
        <div className={`w-full md:w-1/2 bg-white p-5 sm:p-8 md:p-6 lg:p-10 flex flex-col justify-between min-w-0 auth-form-panel `}>
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
                {authMode === 'forgot-password' && 'Enter your registered email for password recovery instructions.'}
                {authMode === 'reset-password' && 'Enter the code sent to your email, then choose a new password.'}
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
                      type={visiblePasswords.register ? "text" : "password"}
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Create Password (min. 10 chars)"
                      className="w-full pl-10 pr-12 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0b1a42] outline-none min-h-[44px]"
                    /><button type="button" onClick={()=>togglePassword('register')} aria-label={visiblePasswords.register?'Hide password':'Show password'} className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-500 hover:text-[#0b1a42]">{visiblePasswords.register?<EyeOff size={17}/>:<Eye size={17}/>}</button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0b1a42] mb-1">Confirm Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock size={15} />
                    </div>
                    <input
                      type={visiblePasswords.confirm ? "text" : "password"}
                      required
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="Re-type password"
                      className="w-full pl-10 pr-12 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0b1a42] outline-none min-h-[44px]"
                    /><button type="button" onClick={()=>togglePassword('confirm')} aria-label={visiblePasswords.confirm?'Hide password':'Show password'} className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-500 hover:text-[#0b1a42]">{visiblePasswords.confirm?<EyeOff size={17}/>:<Eye size={17}/>}</button>
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
                {authLoading&&<p role="status" className="rounded-xl border border-[#dce4ef] bg-[#f7f9ff] p-3 text-xs leading-6 text-[#111A43]">Contacting UPEC securely… This may take a moment. If the server does not respond, we’ll stop waiting and show you how to retry. Please avoid submitting twice.</p>}
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
                      type={visiblePasswords.login ? "text" : "password"}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Enter password"
                      className="w-full pl-10 pr-12 py-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0b1a42] outline-none min-h-[44px]"
                    /><button type="button" onClick={()=>togglePassword('login')} aria-label={visiblePasswords.login?'Hide password':'Show password'} className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-500 hover:text-[#0b1a42]">{visiblePasswords.login?<EyeOff size={17}/>:<Eye size={17}/>}</button>
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
                    Registered Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User size={16} />
                    </div>
                    <input
                      type="email"
                      required
                      value={recoveryIdentifier}
                      onChange={(e) => setRecoveryIdentifier(e.target.value)}
                      placeholder="candidate@email.com"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0b1a42] outline-none min-h-[44px]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={authLoading || resendSeconds > 0 && recoveryRequested}
                  className="w-full py-3.5 rounded-xl bg-[#c62839] hover:bg-[#b01f30] text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[46px] disabled:opacity-50"
                >
                  <Key size={16} />
                  <span>Send Recovery Code</span>
                </button>
                {recoveryRequested && (
                  <div className="space-y-3">
                    <OtpInput id="recovery-otp" label="6-Digit Recovery Code" value={recoveryCode} onChange={setRecoveryCode} disabled={authLoading}/>
                    <button type="button" onClick={e=>void handleRecoveryVerify(e as unknown as React.FormEvent)} disabled={authLoading || recoveryCode.length!==6} className="w-full py-3 rounded-xl bg-[#123578] text-white font-bold disabled:opacity-50">Verify Recovery Code</button>
                  </div>
                )}
                {recoveryRequested && (
                  <button type="button" onClick={()=>void resendCode('recovery')} disabled={authLoading || resendSeconds>0} className="w-full text-xs font-bold text-[#c62839] disabled:text-slate-400">
                    {resendSeconds>0 ? `Resend recovery email in ${resendSeconds}s` : 'Resend recovery email'}
                  </button>
                )}
              </form>
            )}

            {/* =====================================================================
                FORM: RESET PASSWORD
                ===================================================================== */}
            {authMode === 'reset-password' && (
              <form onSubmit={handleResetPassword} className="space-y-3">
                <label className="block text-xs font-bold text-[#0b1a42]">New Password
                  <span className="relative block mt-1"><input type={visiblePasswords.new?'text':'password'} required minLength={10} value={newPassword} onChange={e=>setNewPassword(e.target.value)} className="w-full px-3 pr-12 py-3 rounded-xl border border-slate-200" /><button type="button" onClick={()=>togglePassword('new')} aria-label={visiblePasswords.new?'Hide password':'Show password'} className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-500">{visiblePasswords.new?<EyeOff size={17}/>:<Eye size={17}/>}</button></span>
                </label>
                <label className="block text-xs font-bold text-[#0b1a42]">Confirm New Password
                  <span className="relative block mt-1"><input type={visiblePasswords.newConfirm?'text':'password'} required minLength={10} value={confirmNewPassword} onChange={e=>setConfirmNewPassword(e.target.value)} className="w-full px-3 pr-12 py-3 rounded-xl border border-slate-200" /><button type="button" onClick={()=>togglePassword('newConfirm')} aria-label={visiblePasswords.newConfirm?'Hide password':'Show password'} className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-500">{visiblePasswords.newConfirm?<EyeOff size={17}/>:<Eye size={17}/>}</button></span>
                </label>
                <button type="submit" disabled={authLoading} className="w-full py-3.5 rounded-xl bg-[#c62839] text-white font-bold disabled:opacity-50">Save New Password</button>
              </form>
            )}

            {/* =====================================================================
                FORM: OTP VERIFICATION
                ===================================================================== */}
            {authMode === 'otp-verify' && (
              <form onSubmit={handleOtpVerify} className="space-y-4">
                <div>
                  <OtpInput id="security-otp" label="6-Digit OTP Code" value={otpCode} onChange={setOtpCode} disabled={authLoading}/>
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
                  <OtpInput id="email-otp" label="6-Digit Verification Code" value={emailToken} onChange={setEmailToken} disabled={authLoading}/>
                </div>
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-[#c62839] hover:bg-[#b01f30] text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[46px]"
                >
                  <CheckCircle2 size={16} />
                  <span>Confirm Email</span>
                </button>
                <button type="button" onClick={()=>void resendCode('signup')} disabled={authLoading || resendSeconds>0} className="w-full text-xs font-bold text-[#c62839] disabled:text-slate-400">
                  {resendSeconds>0 ? `Resend verification code in ${resendSeconds}s` : 'Resend verification code'}
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
