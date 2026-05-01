import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Mail, Lock, LogIn, Code2, AlertCircle, Loader2, User,
  Smartphone, ArrowRight, CheckCircle, Eye, EyeOff, KeyRound
} from 'lucide-react';
import OTPInput from '../components/OTPInput';

const Login = () => {
  // Modes
  const [mode, setMode] = useState('login');
  const [method, setMethod] = useState('email');

  // Login State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Signup State
  const [signupStep, setSignupStep] = useState(1);
  const [signupUsername, setSignupUsername] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupOTP, setSignupOTP] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);

  // Common State
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    login, sendEmailOTP, sendPhoneOTP,
    verifyEmailOTP, verifyPhoneOTP, registerWithOTP
  } = useAuth();
  const navigate = useNavigate();

  const startCountdown = () => {
    setOtpCountdown(60);
    const timer = setInterval(() => {
      setOtpCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(loginIdentifier, loginPassword, method);
      navigate('/editor');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      if (method === 'email') {
        if (!signupEmail) { setError('Email is required'); setLoading(false); return; }
        await sendEmailOTP(signupEmail, 'verification');
        setSuccess('OTP sent to your email!');
      } else {
        if (!signupPhone) { setError('Phone number is required'); setLoading(false); return; }
        await sendPhoneOTP(signupPhone);
        setSuccess('OTP sent to your phone (check console for demo)!');
      }
      setSignupStep(2);
      startCountdown();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    setError('');
    setLoading(true);
    try {
      if (signupOTP.length !== 6) { setError('Please enter a 6-digit OTP'); setLoading(false); return; }
      if (method === 'email') {
        await verifyEmailOTP(signupEmail, signupOTP);
      } else {
        await verifyPhoneOTP(signupPhone, signupOTP);
      }
      setSuccess('OTP verified successfully!');
      setSignupStep(3);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupComplete = async (e) => {
    e.preventDefault();
    setError('');
    if (signupPassword.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await registerWithOTP(signupUsername, signupPassword, signupOTP, method, signupEmail, signupPhone);
      navigate('/editor');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const resetSignup = () => {
    setSignupStep(1);
    setSignupUsername('');
    setSignupEmail('');
    setSignupPhone('');
    setSignupOTP('');
    setSignupPassword('');
    setOtpCountdown(0);
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setError('');
    setSuccess('');
    if (newMode === 'signup') resetSignup();
  };

  const switchMethod = (newMethod) => {
    setMethod(newMethod);
    setError('');
    setSuccess('');
    setLoginIdentifier('');
    resetSignup();
  };

  const TabButton = ({ active, onClick, icon: Icon, children }) => (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${active ? 'scale-105' : 'hover:scale-105 opacity-60'}`}
      style={active ? {
        background: 'var(--theme-glow)',
        border: '1px solid var(--theme-primary)',
        color: 'var(--theme-primary)',
        boxShadow: '0 0 20px var(--theme-primary-glow)',
      } : {
        background: 'transparent',
        border: '1px solid transparent',
        color: 'var(--theme-muted)',
      }}
    >
      <Icon size={16} />
      {children}
    </button>
  );

  const SubTabButton = ({ active, onClick, children }) => (
    <button
      onClick={onClick}
      className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-widest rounded-lg transition-all duration-300 ${active ? '' : 'hover:opacity-80'}`}
      style={active ? {
        background: 'var(--theme-primary)',
        color: 'var(--bg-dark)',
      } : {
        background: 'var(--theme-card-bg)',
        color: 'var(--theme-muted)',
      }}
    >
      {children}
    </button>
  );

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="blob w-[500px] h-[500px] theme-blob-1 -top-20 -left-20"></div>
      <div className="blob w-[400px] h-[400px] theme-blob-2 bottom-0 right-0"></div>

      <div className="w-full max-w-md relative z-10 animate-scaleIn">
        <div className="text-center mb-8">
          <div
            className="inline-flex p-4 rounded-3xl border mb-4 shadow-2xl"
            style={{
              background: 'var(--theme-card-bg)',
              borderColor: 'var(--theme-border)'
            }}
          >
            <Code2 size={40} style={{ color: 'var(--theme-primary)' }} />
          </div>
          <h1 className="text-4xl font-bold tracking-tight" style={{ color: 'var(--theme-text)' }}>
            {mode === 'login' ? 'Welcome Back' : 'Join NextGen'}
          </h1>
          <p className="mt-2" style={{ color: 'var(--theme-muted)' }}>
            {mode === 'login'
              ? 'Enter your credentials to continue coding'
              : 'Create an account to start your journey'}
          </p>
        </div>

        <div className="glass-card p-8 shadow-2xl">
          {/* Main Tabs */}
          <div className="flex justify-around gap-2 mb-6 p-1 rounded-xl" style={{ background: 'var(--theme-card-bg)' }}>
            <TabButton className="w-[50%]" active={mode === 'login'} onClick={() => switchMode('login')} icon={LogIn}>
              Sign In
            </TabButton>
            <TabButton className="w-[50%]" active={mode === 'signup'} onClick={() => switchMode('signup')} icon={User}>
              Create Account
            </TabButton>
          </div>

          {/* Sub Tabs */}
          <div className="flex gap-2 mb-6">
            <SubTabButton active={method === 'email'} onClick={() => switchMethod('email')}>
              <span className="flex items-center justify-center gap-2">
                <Mail size={14} /> Email
              </span>
            </SubTabButton>
            <SubTabButton active={method === 'phone'} onClick={() => switchMethod('phone')}>
              <span className="flex items-center justify-center gap-2">
                <Smartphone size={14} /> Phone
              </span>
            </SubTabButton>
          </div>

          {/* Alerts */}
          {error && (
            <div className="mb-6 p-4 rounded-xl border flex items-center gap-3 animate-slideDown"
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                borderColor: 'rgba(239, 68, 68, 0.2)',
                color: '#ef4444'
              }}
            >
              <AlertCircle size={18} />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 rounded-xl border flex items-center gap-3 animate-slideDown"
              style={{
                background: 'rgba(34, 197, 94, 0.1)',
                borderColor: 'rgba(34, 197, 94, 0.3)',
                color: '#22c55e'
              }}
            >
              <CheckCircle size={18} />
              <span className="text-sm font-medium">{success}</span>
            </div>
          )}

          {/* Login Form */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-widest font-bold ml-1" style={{ color: 'var(--theme-muted)' }}>
                  {method === 'email' ? 'Email Address' : 'Phone Number'}
                </label>
                <div className="relative group">
                  {method === 'email' ? (
                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--theme-muted)' }} />
                  ) : (
                    <Smartphone size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--theme-muted)' }} />
                  )}
                  <input
                    type={method === 'email' ? 'email' : 'tel'}
                    required
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    className="sexy-input pl-12"
                    placeholder={method === 'email' ? 'name@example.com' : '+1 234 567 8900'}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs uppercase tracking-widest font-bold ml-1" style={{ color: 'var(--theme-muted)' }}>
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-bold transition-colors hover:brightness-125"
                    style={{ color: 'var(--theme-primary)' }}
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative group">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--theme-muted)' }} />
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="sexy-input pl-12 pr-12"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2"
                    style={{ color: 'var(--theme-muted)' }}
                  >
                    {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-neon w-full flex items-center justify-center gap-2 mt-4"
              >
                {loading ? <Loader2 className="animate-spin" /> : <LogIn size={20} />}
                Sign In
              </button>
            </form>
          )}

          {/* Signup Form */}
          {mode === 'signup' && (
            <>
              {signupStep === 1 && (
                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-xs uppercase tracking-widest font-bold ml-1" style={{ color: 'var(--theme-muted)' }}>
                      Username
                    </label>
                    <div className="relative group">
                      <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--theme-muted)' }} />
                      <input
                        type="text"
                        required
                        value={signupUsername}
                        onChange={(e) => setSignupUsername(e.target.value)}
                        className="sexy-input pl-12"
                        placeholder="codegod_24"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs uppercase tracking-widest font-bold ml-1" style={{ color: 'var(--theme-muted)' }}>
                      {method === 'email' ? 'Email Address' : 'Phone Number'}
                    </label>
                    <div className="relative group">
                      {method === 'email' ? (
                        <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--theme-muted)' }} />
                      ) : (
                        <Smartphone size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--theme-muted)' }} />
                      )}
                      <input
                        type={method === 'email' ? 'email' : 'tel'}
                        required
                        value={method === 'email' ? signupEmail : signupPhone}
                        onChange={(e) => method === 'email' ? setSignupEmail(e.target.value) : setSignupPhone(e.target.value)}
                        className="sexy-input pl-12"
                        placeholder={method === 'email' ? 'name@example.com' : '+1 234 567 8900'}
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleSendOTP}
                    disabled={loading}
                    className="btn-neon w-full flex items-center justify-center gap-2 mt-4"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : <ArrowRight size={20} />}
                    Send OTP
                  </button>
                </div>
              )}

              {signupStep === 2 && (
                <div className="space-y-5">
                  <div className="text-center">
                    <p className="text-sm mb-4" style={{ color: 'var(--theme-muted)' }}>
                      Enter the 6-digit code sent to{' '}
                      <strong style={{ color: 'var(--theme-text)' }}>
                        {method === 'email' ? signupEmail : signupPhone}
                      </strong>
                    </p>
                  </div>

                  <OTPInput value={signupOTP} onChange={setSignupOTP} disabled={loading} />

                  <button
                    onClick={handleVerifyOTP}
                    disabled={loading || signupOTP.length !== 6}
                    className="btn-neon w-full flex items-center justify-center gap-2 mt-4"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : <CheckCircle size={20} />}
                    Verify OTP
                  </button>

                  {otpCountdown > 0 ? (
                    <p className="text-center text-xs" style={{ color: 'var(--theme-muted)' }}>
                      Resend OTP in {otpCountdown}s
                    </p>
                  ) : (
                    <button
                      onClick={handleSendOTP}
                      disabled={loading}
                      className="w-full text-center text-xs font-bold transition-colors hover:brightness-125"
                      style={{ color: 'var(--theme-primary)' }}
                    >
                      Resend OTP
                    </button>
                  )}

                  <button
                    onClick={() => setSignupStep(1)}
                    className="w-full text-center text-xs font-medium transition-colors hover:brightness-125"
                    style={{ color: 'var(--theme-muted)' }}
                  >
                    Back to info
                  </button>
                </div>
              )}

              {signupStep === 3 && (
                <form onSubmit={handleSignupComplete} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-xs uppercase tracking-widest font-bold ml-1" style={{ color: 'var(--theme-muted)' }}>
                      Create Password
                    </label>
                    <div className="relative group">
                      <KeyRound size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--theme-muted)' }} />
                      <input
                        type={showSignupPassword ? 'text' : 'password'}
                        required
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        className="sexy-input pl-12 pr-12"
                        placeholder="••••••••"
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignupPassword(!showSignupPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2"
                        style={{ color: 'var(--theme-muted)' }}
                      >
                        {showSignupPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    <p className="text-xs ml-1" style={{ color: 'var(--theme-muted)' }}>
                      Minimum 6 characters
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-neon w-full flex items-center justify-center gap-2 mt-4"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : <User size={20} />}
                    Create Account
                  </button>

                  <button
                    type="button"
                    onClick={() => setSignupStep(2)}
                    className="w-full text-center text-xs font-medium transition-colors hover:brightness-125"
                    style={{ color: 'var(--theme-muted)' }}
                  >
                    Back to OTP
                  </button>
                </form>
              )}

              {signupStep > 1 && (
                <div className="flex items-center justify-center gap-2 mt-4">
                  {[1, 2, 3].map((s) => (
                    <div
                      key={s}
                      className="h-1.5 rounded-full transition-all duration-500"
                      style={{
                        width: signupStep === s ? '24px' : '6px',
                        background: signupStep >= s ? 'var(--theme-primary)' : 'var(--theme-border)',
                      }}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
