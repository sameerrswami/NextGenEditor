import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Mail, Lock, LogIn, Code2, AlertCircle, Loader2, User,
  Eye, EyeOff
} from 'lucide-react';

const Login = () => {
  const [mode, setMode] = useState('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(loginEmail, loginPassword);
      navigate('/editor');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    if (signupPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (signupUsername.trim().length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }
    setLoading(true);
    try {
      await register(signupUsername.trim(), signupEmail, signupPassword);
      navigate('/editor');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setError('');
    // Reset signup fields when switching to login
    if (mode === 'signup') {
      setSignupUsername('');
      setSignupEmail('');
      setSignupPassword('');
    }
  };

  const TabButton = ({ active, onClick, icon: Icon, children }) => (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex-1 ${active ? 'scale-105' : 'hover:scale-105 opacity-60'}`}
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
              : 'Create account instantly - no verification needed'}
          </p>
        </div>

        <div className="glass-card p-8 shadow-2xl">
          {/* Mode Tabs */}
          <div className="flex gap-2 mb-6 p-1 rounded-xl" style={{ background: 'var(--theme-card-bg)' }}>
            <TabButton 
              active={mode === 'login'} 
              onClick={() => switchMode('login')} 
              icon={LogIn}
            >
              Sign In
            </TabButton>
            <TabButton 
              active={mode === 'signup'} 
              onClick={() => switchMode('signup')} 
              icon={User}
            >
              Sign Up
            </TabButton>
          </div>

          {/* Error */}
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

          {/* Login Form */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-widest font-bold ml-1" style={{ color: 'var(--theme-muted)' }}>
                  Email
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--theme-muted)' }} />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="sexy-input pl-12"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs uppercase tracking-widest font-bold ml-1" style={{ color: 'var(--theme-muted)' }}>
                    Password
                  </label>
                  <Link to="/forgot-password" className="text-xs hover:brightness-125" style={{ color: 'var(--theme-primary)' }}>
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
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

              <button type="submit" disabled={loading} className="btn-neon w-full flex items-center gap-2">
                {loading ? <Loader2 className="animate-spin" /> : <LogIn size={20} />}
                Sign In
              </button>
            </form>
          )}

          {/* Signup Form - Single Step */}
          {mode === 'signup' && (
            <form onSubmit={handleSignup} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-widest font-bold ml-1" style={{ color: 'var(--theme-muted)' }}>
                  Username
                </label>
                <div className="relative">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--theme-muted)' }} />
                  <input
                    type="text"
                    required
                    value={signupUsername}
                    onChange={(e) => setSignupUsername(e.target.value)}
                    className="sexy-input pl-12"
                    placeholder="yourusername"
                    minLength={3}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-widest font-bold ml-1" style={{ color: 'var(--theme-muted)' }}>
                  Email
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--theme-muted)' }} />
                  <input
                    type="email"
                    required
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    className="sexy-input pl-12"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-widest font-bold ml-1" style={{ color: 'var(--theme-muted)' }}>
                  Password
                </label>
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--theme-muted)' }} />
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
              </div>

              <button type="submit" disabled={loading} className="btn-neon w-full flex items-center gap-2">
                {loading ? <Loader2 className="animate-spin" /> : <User size={20} />}
                Create Account
              </button>
            </form>
          )}

          {/* Mode Switch */}
          <div className="text-center mt-6 pt-6 border-t" style={{ borderColor: 'var(--theme-border)' }}>
            {mode === 'login' ? (
              <button onClick={() => switchMode()} className="text-sm font-medium" style={{ color: 'var(--theme-muted)' }}>
                No account?{' '}
                <span className="font-bold" style={{ color: 'var(--theme-primary)' }}>Create one</span>
              </button>
            ) : (
              <button onClick={() => switchMode()} className="text-sm font-medium" style={{ color: 'var(--theme-muted)' }}>
                Have account?{' '}
                <span className="font-bold" style={{ color: 'var(--theme-primary)' }}>Sign in</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

