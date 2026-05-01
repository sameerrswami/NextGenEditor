import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, ArrowLeft, AlertCircle, Loader2, CheckCircle, Eye, EyeOff, Shield } from 'lucide-react';

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { changePassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (currentPassword === newPassword) {
      setError('New password must be different from current password');
      return;
    }

    setLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      setSuccess('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strength = getPasswordStrength(newPassword);
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
  const strengthColors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#00f5d4'];

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="blob w-[500px] h-[500px] theme-blob-1 -top-20 -left-20"></div>
      <div className="blob w-[400px] h-[400px] theme-blob-2 bottom-0 right-0"></div>

      <div className="w-full max-w-md relative z-10 animate-scaleIn">
        <div className="text-center mb-8">
          <div className="inline-flex p-4 rounded-3xl border mb-4 shadow-2xl"
            style={{ background: 'var(--theme-card-bg)', borderColor: 'var(--theme-border)' }}>
            <Shield size={40} style={{ color: 'var(--theme-primary)' }} />
          </div>
          <h1 className="text-4xl font-bold tracking-tight" style={{ color: 'var(--theme-text)' }}>
            Change Password
          </h1>
          <p className="mt-2" style={{ color: 'var(--theme-muted)' }}>
            Update your password to keep your account secure
          </p>
        </div>

        <div className="glass-card p-8 shadow-2xl">
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

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-widest font-bold ml-1" style={{ color: 'var(--theme-muted)' }}>
                Current Password
              </label>
              <div className="relative group">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--theme-muted)' }} />
                <input
                  type={showCurrent ? 'text' : 'password'}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="sexy-input pl-12 pr-12"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--theme-muted)' }}
                >
                  {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-widest font-bold ml-1" style={{ color: 'var(--theme-muted)' }}>
                New Password
              </label>
              <div className="relative group">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--theme-muted)' }} />
                <input
                  type={showNew ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="sexy-input pl-12 pr-12"
                  placeholder="Enter new password"
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--theme-muted)' }}
                >
                  {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {newPassword && (
                <div className="mt-2">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--theme-border)' }}>
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${((strength + 1) / 5) * 100}%`,
                          background: strengthColors[strength],
                          boxShadow: `0 0 10px ${strengthColors[strength]}40`,
                        }}
                      />
                    </div>
                    <span className="text-xs font-bold" style={{ color: strengthColors[strength] }}>
                      {strengthLabels[strength]}
                    </span>
                  </div>
                  <p className="text-xs" style={{ color: 'var(--theme-muted)' }}>
                    Use 8+ chars with uppercase, numbers & symbols
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-widest font-bold ml-1" style={{ color: 'var(--theme-muted)' }}>
                Confirm New Password
              </label>
              <div className="relative group">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--theme-muted)' }} />
                <input
                  type={showNew ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="sexy-input pl-12"
                  placeholder="Confirm new password"
                  minLength={6}
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-neon w-full flex items-center justify-center gap-2 mt-4">
              {loading ? <Loader2 className="animate-spin" /> : 'Change Password'}
            </button>

            <div className="text-center">
              <Link to="/editor" className="text-sm font-medium inline-flex items-center gap-2 hover:brightness-125 transition-all" style={{ color: 'var(--theme-primary)' }}>
                <ArrowLeft size={16} /> Back to Editor
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
