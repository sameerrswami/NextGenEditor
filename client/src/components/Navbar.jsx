import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Code2, User, LogOut, LayoutDashboard, Terminal, Menu, X, Star, Award } from 'lucide-react';

const Navbar = () => {
  const { user, logout, refreshUser } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (user) {
      refreshUser();
      const interval = setInterval(refreshUser, 60000); // Refresh every minute
      return () => clearInterval(interval);
    }
  }, [user?.username]);

  const isActive = (path) => location.pathname === path;

  const NavLink = ({ to, icon: Icon, children }) => (
    <Link
      to={to}
      onClick={() => setIsMenuOpen(false)}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
        isActive(to)
          ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
          : 'text-slate-400 hover:text-white hover:bg-white/5'
      }`}
    >
      <Icon size={18} />
      <span className="font-medium">{children}</span>
    </Link>
  );

  return (
    <nav className="sticky top-0 z-50 px-6 py-4 bg-[#020617]/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-full mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="p-2 bg-indigo-500/10 rounded-xl group-hover:bg-indigo-500/20 transition-all duration-300">
            <Code2 size={24} className="text-indigo-500" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white group-hover:text-indigo-400 transition-colors">
            NextGen<span className="text-indigo-500">Editor</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-2">
          {user && (
            <>
              <NavLink to="/editor" icon={Terminal}>Editor</NavLink>
              <NavLink to="/dashboard" icon={LayoutDashboard}>Dashboard</NavLink>
              <NavLink to="/profile" icon={User}>Profile</NavLink>
            </>
          )}

          <div className="h-6 w-[1px] bg-white/10 mx-2" />

          {user ? (
            <div className="flex items-center gap-4 ml-2">
              {/* Coin Counter */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-400/10 border border-amber-400/20">
                <Star size={14} className="text-amber-400 fill-amber-400" />
                <span className="text-xs font-black text-amber-400">{user.coins || 0}</span>
              </div>

              <Link to="/profile" className="flex items-center gap-3 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:border-indigo-500/30 transition-all">
                <div className={`w-7 h-7 rounded-full ${user.isPremium ? 'bg-amber-400/20' : 'bg-indigo-500/20'} flex items-center justify-center relative overflow-hidden`}>
                  {user.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt="Avatar" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <User size={14} className={user.isPremium ? 'text-amber-400' : 'text-indigo-400'} />
                  )}
                  {user.isPremium && <div className="absolute -top-1 -right-1 bg-amber-400 rounded-full p-0.5 text-[8px] text-slate-900 z-10"><Award size={8} /></div>}
                </div>
                <span className="text-sm font-medium text-slate-300">{user.username}</span>
              </Link>
              <button
                onClick={logout}
                className="p-2.5 rounded-xl bg-red-500/5 text-red-500 border border-red-500/10 hover:bg-red-500 hover:text-white transition-all duration-300"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn-neon">
              Login Now
            </Link>
          )}
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden p-2 text-slate-400"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full p-4 bg-[#020617] border-b border-white/5 flex flex-col gap-2 animate-slideDown">
          {user && (
            <>
              <NavLink to="/editor" icon={Terminal}>Editor</NavLink>
              <NavLink to="/dashboard" icon={LayoutDashboard}>Dashboard</NavLink>
              <NavLink to="/profile" icon={User}>Profile</NavLink>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-red-400 hover:bg-red-500/10 transition-all"
              >
                <LogOut size={18} /> Logout
              </button>
            </>
          )}
          {!user && (
            <Link to="/login" className="btn-neon text-center">Login</Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;

