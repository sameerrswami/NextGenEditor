import React, { createContext, useContext, useState, useEffect } from 'react';

const THEME_KEY = 'nextgen-theme';

export const THEMES = {
  'cyberpunk': {
    name: 'Cyberpunk',
    icon: '💜',
    colors: {
      primary: '#00f5d4',
      primaryGlow: 'rgba(0, 245, 212, 0.5)',
      secondary: '#ff006e',
      accent: '#8338ec',
      bg: '#020617',
      surface: '#0a0e27',
      text: '#e2e8f0',
      muted: '#94a3b8',
      border: 'rgba(255, 255, 255, 0.08)',
      cardBg: 'rgba(255, 255, 255, 0.03)',
      glow: 'rgba(0, 245, 212, 0.15)',
    }
  },
  'ocean': {
    name: 'Ocean',
    icon: '🌊',
    colors: {
      primary: '#0ea5e9',
      primaryGlow: 'rgba(14, 165, 233, 0.5)',
      secondary: '#06b6d4',
      accent: '#14b8a6',
      bg: '#08101a',
      surface: '#0e1d2b',
      text: '#e0f2fe',
      muted: '#7dd3fc',
      border: 'rgba(14, 165, 233, 0.15)',
      cardBg: 'rgba(14, 165, 233, 0.05)',
      glow: 'rgba(14, 165, 233, 0.15)',
    }
  },
  'forest': {
    name: 'Forest',
    icon: '🌲',
    colors: {
      primary: '#22c55e',
      primaryGlow: 'rgba(34, 197, 94, 0.5)',
      secondary: '#84cc16',
      accent: '#10b981',
      bg: '#022c22',
      surface: '#0f2e1b',
      text: '#dcfce7',
      muted: '#86efac',
      border: 'rgba(34, 197, 94, 0.15)',
      cardBg: 'rgba(34, 197, 94, 0.05)',
      glow: 'rgba(34, 197, 94, 0.15)',
    }
  },
  'sunset': {
    name: 'Sunset',
    icon: '🌅',
    colors: {
      primary: '#f97316',
      primaryGlow: 'rgba(249, 115, 22, 0.5)',
      secondary: '#ef4444',
      accent: '#f59e0b',
      bg: '#1a0800',
      surface: '#2a1210',
      text: '#ffedd5',
      muted: '#fdba74',
      border: 'rgba(249, 115, 22, 0.15)',
      cardBg: 'rgba(249, 115, 22, 0.05)',
      glow: 'rgba(249, 115, 22, 0.15)',
    }
  },
  'midnight': {
    name: 'Midnight',
    icon: '🌙',
    colors: {
      primary: '#a855f7',
      primaryGlow: 'rgba(168, 85, 247, 0.5)',
      secondary: '#6366f1',
      accent: '#ec4899',
      bg: '#0f0720',
      surface: '#1a1033',
      text: '#f3e8ff',
      muted: '#d8b4fe',
      border: 'rgba(168, 85, 247, 0.15)',
      cardBg: 'rgba(168, 85, 247, 0.05)',
      glow: 'rgba(168, 85, 247, 0.15)',
    }
  },
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [activeTheme, setActiveTheme] = useState(() => {
    return localStorage.getItem(THEME_KEY) || 'cyberpunk';
  });

  useEffect(() => {
    localStorage.setItem(THEME_KEY, activeTheme);
    
    const root = document.documentElement;
    const theme = THEMES[activeTheme]?.colors || THEMES['cyberpunk'].colors;
    
    Object.entries(theme).forEach(([key, value]) => {
      root.style.setProperty(`--theme-${key}`, value);
    });
    
    root.style.setProperty('--bg-dark', theme.bg);
  }, [activeTheme]);

  const cycleTheme = () => {
    const keys = Object.keys(THEMES);
    const currentIndex = keys.indexOf(activeTheme);
    const nextIndex = (currentIndex + 1) % keys.length;
    setActiveTheme(keys[nextIndex]);
  };

  return (
    <ThemeContext.Provider value={{ 
      activeTheme, 
      setActiveTheme, 
      cycleTheme,
      theme: THEMES[activeTheme] || THEMES['cyberpunk']
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
