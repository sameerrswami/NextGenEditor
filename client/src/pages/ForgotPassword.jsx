import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, ArrowLeft, AlertCircle, Loader2, CheckCircle, Lock, Eye, EyeOff } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { forgotPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await forgotPassword(email);
      setSuccess('Instructions sent! Use "Forgot Password?" on login page or login + change password.');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send instructions');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="blob w-[500px] h-[500px] theme-blob-1 -top-20 -left-20"></div>
      <div className="blob w-[400px] h-[400px] theme-blob-2 bottom-0 right-0"></div>

      <div className="w-full max-w-md relative z-10 animate-scaleIn">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight" style={{ color: 'var(--theme-text)' }}>
            Reset Password
          </h1>
          <p className="mt-2" style={{ color: 'var(--theme-muted)' }}>
            Enter your email. Use "Forgot Password?" on login or login + change password.
          </p>
        </div>

        <div className="glass-card p-8 shadow-2xl">
          {error && (
            <div className="mb-6 p-4 rounded-xl border flex items-center gap-3"
              style={{ background: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}>
              <AlertCircle size={18} />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 rounded-xl border flex items-center gap-3"
              style={{ background: 'rgba(34, 197, 94, 0.1)', borderColor: 'rgba(34, 197, 94, 0.3)', color: '#22c55e' }}>
              <CheckCircle size={18} />
              <span className="text-sm font-medium">{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-widest font-bold ml-1" style={{ color: 'var(--theme-muted)' }}>
                Email Address
              </label>
              <div className="relative">
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

            <button type="submit" disabled={loading} className="btn-neon w-full flex items-center gap-2">
              {loading ? <Loader2 className="animate-spin" /> : 'Send Instructions'}
            </button>
          </form>

          <div className="text-center mt-6">
            <Link to="/login" className="text-sm font-medium inline-flex items-center gap-2 hover:brightness-125" style={{ color: 'var(--theme-primary)' }}>
              <ArrowLeft size={16} /> Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

