import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, LogIn, Code2, AlertCircle, Loader2, User } from 'lucide-react';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(username, email, password);
      }
      navigate('/editor');
    } catch (err) {
      setError(err.response?.data?.msg || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="blob w-[500px] h-[500px] bg-indigo-600/20 -top-20 -left-20"></div>
      <div className="blob w-[400px] h-[400px] bg-rose-600/10 bottom-0 right-0"></div>

      <div className="w-full max-w-md relative z-10 animate-scaleIn">
        <div className="text-center mb-8">
          <div className="inline-flex p-4 rounded-3xl bg-white/5 border border-white/10 mb-4 shadow-2xl">
            <Code2 size={40} className="text-indigo-500" />
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">
            {isLogin ? 'Welcome Back' : 'Join NextGen'}
          </h1>
          <p className="text-slate-400 mt-2">
            {isLogin ? 'Enter your credentials to continue coding' : 'Create an account to start your journey'}
          </p>
        </div>

        <div className="glass-card p-8 shadow-2xl">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400 animate-slideDown">
              <AlertCircle size={18} />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-widest text-slate-500 font-bold ml-1">Username</label>
                <div className="relative group">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="sexy-input pl-12"
                    placeholder="codegod_24"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-widest text-slate-500 font-bold ml-1">Email Address</label>
              <div className="relative group">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
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

            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-widest text-slate-500 font-bold ml-1">Password</label>
              <div className="relative group">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="sexy-input pl-12"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-neon w-full flex items-center justify-center gap-2 mt-4"
            >
              {loading ? <Loader2 className="animate-spin" /> : <LogIn size={20} />}
              {isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-slate-500 text-sm">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="ml-2 text-indigo-400 font-bold hover:text-indigo-300 transition-colors"
              >
                {isLogin ? 'Register Now' : 'Login Here'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
