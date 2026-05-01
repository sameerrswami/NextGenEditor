import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, ArrowLeft, AlertCircle, Loader2, CheckCircle, Lock, Eye, EyeOff } from 'lucide-react';
import OTPInput from '../components/OTPInput';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: email, 2: OTP, 3: new password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { forgotPassword, resetPassword } = useAuth();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await forgotPassword(email);
      setSuccess('Reset code sent to your email!');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send reset code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (otp.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    setStep(3);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email, otp, newPassword);
      setSuccess('Password reset successful! Redirecting to login...');
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <form onSubmit={handleSendOTP} className="space-y-5">
      <div className="space-y-1.5">
        <label className="text-xs uppercase tracking-widest font-bold ml-1" style={{ color: 'var(--theme-muted)' }}>
          Email Address
        </label>
        <div className="relative group">
          <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--theme-muted)' }} />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="sexy-input pl-12"
            placeholder="name@example.com"
          />
        </div>
      </div>

      <button type="submit" disabled={loading} className="btn-neon w-full flex items-center justify-center gap-2 mt-4">
        {loading ? <Loader2 className="animate-spin" /> : 'Send Reset Code'}
      </button>

      <div className="text-center">
        <Link to="/login" className="text-sm font-medium inline-flex items-center gap-2 hover:brightness-125 transition-all" style={{ color: 'var(--theme-primary)' }}>
          <ArrowLeft size={16} /> Back to Login
        </Link>
      </div>
    </form>
  );

  const renderStep2 = () => (
    <form onSubmit={handleVerifyOTP} className="space-y-5">
      <div className="text-center mb-6">
        <p className="text-sm" style={{ color: 'var(--theme-muted)' }}>
          Enter the 6-digit code sent to <strong style={{ color: 'var(--theme-text)' }}>{email}</strong>
        </p>
      </div>

      <OTPInput value={otp} onChange={setOtp} disabled={loading} />

      <button type="submit" disabled={otp.length !== 6} className="btn-neon w-full flex items-center justify-center gap-2 mt-4">
        Verify Code
      </button>

      <div className="text-center">
        <button
          type="button"
          onClick={() => setStep(1)}
          className="text-sm font-medium inline-flex items-center gap-2 hover:brightness-125 transition-all"
          style={{ color: 'var(--theme-primary)' }}
        >
          <ArrowLeft size={16} /> Try different email
        </button>
      </div>
    </form>
  );

  const renderStep3 = () => (
    <form onSubmit={handleResetPassword} className="space-y-5">
      <div className="space-y-1.5">
        <label className="text-xs uppercase tracking-widest font-bold ml-1" style={{ color: 'var(--theme-muted)' }}>
          New Password
        </label>
        <div className="relative group">
          <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--theme-muted)' }} />
          <input
            type={showPassword ? 'text' : 'password'}
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="sexy-input pl-12 pr-12"
            placeholder="••••••••"
            minLength={6}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--theme-muted)' }}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs uppercase tracking-widest font-bold ml-1" style={{ color: 'var(--theme-muted)' }}>
          Confirm Password
        </label>
        <div className="relative group">
          <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--theme-muted)' }} />
          <input
            type={showPassword ? 'text' : 'password'}
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="sexy-input pl-12"
            placeholder="••••••••"
            minLength={6}
          />
        </div>
      </div>

      <button type="submit" disabled={loading} className="btn-neon w-full flex items-center justify-center gap-2 mt-4">
        {loading ? <Loader2 className="animate-spin" /> : 'Reset Password'}
      </button>
    </form>
  );

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="blob w-[500px] h-[500px] theme-blob-1 -top-20 -left-20"></div>
      <div className="blob w-[400px] h-[400px] theme-blob-2 bottom-0 right-0"></div>

      <div className="w-full max-w-md relative z-10 animate-scaleIn">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight" style={{ color: 'var(--theme-text)' }}>
            {step === 1 ? 'Forgot Password?' : step === 2 ? 'Verify Code' : 'New Password'}
          </h1>
          <p className="mt-2" style={{ color: 'var(--theme-muted)' }}>
            {step === 1 ? 'Enter your email to receive a reset code' :
             step === 2 ? 'Enter the 6-digit verification code' :
             'Create a strong new password'}
          </p>
        </div>

        <div className="glass-card p-8 shadow-2xl">
          {/* Step indicators */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className="h-2 rounded-full transition-all duration-500"
                style={{
                  width: step === s ? '32px' : '8px',
                  background: step >= s ? 'var(--theme-primary)' : 'var(--theme-border)',
                  boxShadow: step >= s ? '0 0 10px var(--theme-primary-glow)' : 'none',
                }}
              />
            ))}
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl border flex items-center gap-3 animate-slideDown"
              style={{ background: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}>
              <AlertCircle size={18} />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 rounded-xl border flex items-center gap-3 animate-slideDown"
              style={{ background: 'rgba(34, 197, 94, 0.1)', borderColor: 'rgba(34, 197, 94, 0.3)', color: '#22c55e' }}>
              <CheckCircle size={18} />
              <span className="text-sm font-medium">{success}</span>
            </div>
          )}

          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
