import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme, THEMES } from '../context/ThemeContext';
import {
  Code2, User, LogOut, LayoutDashboard, Terminal, Menu, X,
  Star, Award, Trophy, Users, Swords, Palette, Lock, ChevronDown
} from 'lucide-react';

const Navbar = () => {
  const { user, logout, refreshUser } = useAuth();
  const { activeTheme, setActiveTheme } = useTheme();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showThemeDropdown, setShowThemeDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const themeRef = useRef(null);
  const userRef = useRef(null);

  useEffect(() => {
    if (user) {
      refreshUser();
      const interval = setInterval(refreshUser, 60000);
      return () => clearInterval(interval);
    }
  }, [user?.username]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (themeRef.current && !themeRef.current.contains(e.target)) {
        setShowThemeDropdown(false);
      }
      if (userRef.current && !userRef.current.contains(e.target)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActive = (path) => location.pathname === path;

  const NavLink = ({ to, icon: Icon, label }) => (
    <Link
      to={to}
      onClick={() => setIsMenuOpen(false)}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-300 text-sm font-medium"
      style={isActive(to) ? {
        background: 'var(--theme-glow)',
        border: '1px solid var(--theme-primary)',
        color: 'var(--theme-primary)'
      } : {
        color: 'var(--theme-muted)',
        border: '1px solid transparent'
      }}
      onMouseEnter={(e) => {
        if (!isActive(to)) {
          e.currentTarget.style.color = 'var(--theme-text)';
          e.currentTarget.style.background = 'var(--theme-card-bg)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive(to)) {
          e.currentTarget.style.color = 'var(--theme-muted)';
          e.currentTarget.style.background = 'transparent';
        }
      }}
    >
      <Icon size={15} />
      <span>{label}</span>
    </Link>
  );

  return (
    <nav
      className="sticky top-0 z-50 px-4 py-3 backdrop-blur-xl border-b transition-colors duration-500"
      style={{
        background: 'rgba(10, 14, 39, 0.85)',
        borderColor: 'var(--theme-border)'
      }}
    >
      <div className="max-w-full mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group shrink-0">
          <div
            className="p-2 rounded-xl transition-all duration-300 group-hover:scale-110"
            style={{ background: 'var(--theme-glow)' }}
          >
            <Code2 size={20} style={{ color: 'var(--theme-primary)' }} />
          </div>
          <span className="text-lg font-bold tracking-tight hidden sm:block" style={{ color: 'var(--theme-text)' }}>
            NextGen<span style={{ color: 'var(--theme-primary)' }}>Editor</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {user && (
            <>
              <NavLink to="/editor" icon={Terminal} label="Editor" />
              <NavLink to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
              <NavLink to="/challenges" icon={Swords} label="Challenges" />
              <NavLink to="/leaderboard" icon={Trophy} label="Leaderboard" />
              <NavLink to="/multiplayer" icon={Users} label="Multiplayer" />
            </>
          )}

          <div className="h-5 w-[1px] mx-1" style={{ background: 'var(--theme-border)' }} />

          {/* Theme Switcher */}
          <div className="relative" ref={themeRef}>
            <button
              onClick={() => setShowThemeDropdown(!showThemeDropdown)}
              className="p-2 rounded-lg transition-all duration-300 hover:scale-110"
              style={{
                background: 'var(--theme-glow)',
                color: 'var(--theme-primary)'
              }}
              title="Switch Theme"
            >
              <Palette size={15} />
            </button>

            {showThemeDropdown && (
              <div
                className="absolute right-0 top-full mt-2 p-2 rounded-xl border backdrop-blur-xl shadow-2xl z-50 min-w-[180px] animate-scaleIn"
                style={{
                  background: 'var(--bg-surface)',
                  borderColor: 'var(--theme-border)'
                }}
              >
                {Object.entries(THEMES).map(([key, themeData]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setActiveTheme(key);
                      setShowThemeDropdown(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-300 hover:scale-[1.02] text-sm"
                    style={activeTheme === key ? {
                      background: 'var(--theme-glow)',
                      border: '1px solid var(--theme-primary)',
                      color: 'var(--theme-primary)'
                    } : {
                      color: 'var(--theme-muted)'
                    }}
                  >
                    <span className="text-base">{themeData.icon}</span>
                    <span className="font-semibold">{themeData.name}</span>
                    {activeTheme === key && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: 'var(--theme-primary)' }} />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {user ? (
            <div className="flex items-center gap-2 ml-1">
              {/* Coin Counter */}
              <div
                className="flex items-center gap-1.5 px-2 py-1 rounded-lg border text-xs"
                style={{
                  background: 'rgba(251, 191, 36, 0.1)',
                  borderColor: 'rgba(251, 191, 36, 0.2)'
                }}
              >
                <Star size={12} className="text-amber-400 fill-amber-400" />
                <span className="font-black text-amber-400">{user.coins || 0}</span>
              </div>

              {/* User Dropdown */}
              <div className="relative" ref={userRef}>
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border hover:scale-105 transition-all text-sm"
                  style={{
                    background: 'var(--theme-card-bg)',
                    borderColor: 'var(--theme-border)'
                  }}
                >
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center relative overflow-hidden shrink-0"
                    style={{
                      background: user.isPremium ? 'rgba(251, 191, 36, 0.2)' : 'var(--theme-glow)'
                    }}
                  >
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                        onError={e => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <User size={12} style={{ color: user.isPremium ? '#fbbf24' : 'var(--theme-primary)' }} />
                    )}
                    {user.isPremium && (
                      <div className="absolute -top-0.5 -right-0.5 bg-amber-400 rounded-full p-px">
                        <Award size={7} />
                      </div>
                    )}
                  </div>
                  <span className="font-medium hidden lg:block max-w-[80px] truncate" style={{ color: 'var(--theme-text)' }}>
                    {user.username}
                  </span>
                  <ChevronDown size={12} style={{ color: 'var(--theme-muted)' }} />
                </button>

                {showUserDropdown && (
                  <div
                    className="absolute right-0 top-full mt-2 p-1.5 rounded-xl border backdrop-blur-xl shadow-2xl z-50 min-w-[180px] animate-scaleIn"
                    style={{
                      background: 'var(--bg-surface)',
                      borderColor: 'var(--theme-border)'
                    }}
                  >
                    <Link
                      to="/profile"
                      onClick={() => setShowUserDropdown(false)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-300 text-sm font-medium"
                      style={{ color: 'var(--theme-muted)' }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--theme-primary)'; e.currentTarget.style.background = 'var(--theme-glow)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--theme-muted)'; e.currentTarget.style.background = 'transparent'; }}
                    >
                      <User size={15} /> Profile
                    </Link>
                    <Link
                      to="/change-password"
                      onClick={() => setShowUserDropdown(false)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-300 text-sm font-medium"
                      style={{ color: 'var(--theme-muted)' }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--theme-primary)'; e.currentTarget.style.background = 'var(--theme-glow)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--theme-muted)'; e.currentTarget.style.background = 'transparent'; }}
                    >
                      <Lock size={15} /> Change Password
                    </Link>
                    <div className="h-px my-1" style={{ background: 'var(--theme-border)' }} />
                    <button
                      onClick={() => { logout(); setShowUserDropdown(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-300 text-sm font-medium text-left"
                      style={{ color: '#ef4444' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <LogOut size={15} /> Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <Link to="/login" className="btn-neon text-sm px-4 py-2">Login</Link>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden p-2"
          style={{ color: 'var(--theme-muted)' }}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div
          className="md:hidden absolute top-full left-0 w-full p-4 border-b flex flex-col gap-1.5 animate-slideDown z-50"
          style={{
            background: 'var(--bg-dark)',
            borderColor: 'var(--theme-border)'
          }}
        >
          {/* Theme Switcher Mobile */}
          <div className="flex flex-wrap gap-1.5 p-2 rounded-xl mb-2" style={{ background: 'var(--theme-card-bg)' }}>
            {Object.entries(THEMES).map(([key, themeData]) => (
              <button
                key={key}
                onClick={() => setActiveTheme(key)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all"
                style={activeTheme === key ? {
                  background: 'var(--theme-glow)',
                  color: 'var(--theme-primary)'
                } : {
                  color: 'var(--theme-muted)'
                }}
              >
                <span>{themeData.icon}</span>
                <span>{themeData.name}</span>
              </button>
            ))}
          </div>

          {user && (
            <>
              <NavLink to="/editor" icon={Terminal} label="Editor" />
              <NavLink to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
              <NavLink to="/challenges" icon={Swords} label="Challenges" />
              <NavLink to="/leaderboard" icon={Trophy} label="Leaderboard" />
              <NavLink to="/multiplayer" icon={Users} label="Multiplayer" />
              <div className="h-px my-1" style={{ background: 'var(--theme-border)' }} />
              <NavLink to="/profile" icon={User} label="Profile" />
              <NavLink to="/change-password" icon={Lock} label="Change Password" />
              <button
                onClick={logout}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all text-left"
              >
                <LogOut size={15} /> Logout
              </button>
            </>
          )}
          {!user && (
            <Link to="/login" className="btn-neon text-center text-sm py-2">Login</Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
