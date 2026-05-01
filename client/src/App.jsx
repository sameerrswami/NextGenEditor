import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import MagicTrail from './components/MagicTrail';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ChangePassword from './pages/ChangePassword';
import Editor from './pages/Editor';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Challenges from './pages/Challenges';
import Leaderboard from './pages/Leaderboard';
import Multiplayer from './pages/Multiplayer';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="flex items-center justify-center h-screen animate-fadeIn">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2" 
           style={{ borderColor: 'var(--theme-primary)' }}></div>
    </div>
  );
  return user ? children : <Navigate to="/login" />;
};

function AppContent() {
  return (
    <div className="min-h-screen transition-colors duration-500" 
         style={{ background: 'var(--bg-dark)', color: 'var(--theme-text)' }}>
      <MagicTrail />
      <Navbar />
      <div className="animate-fadeIn">
        <Routes>
          <Route path="/login"        element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/change-password" element={<PrivateRoute><ChangePassword /></PrivateRoute>} />
          <Route path="/editor"       element={<PrivateRoute><Editor /></PrivateRoute>} />
          <Route path="/dashboard"    element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/profile/:username?" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/challenges"   element={<PrivateRoute><Challenges /></PrivateRoute>} />
          <Route path="/leaderboard"  element={<PrivateRoute><Leaderboard /></PrivateRoute>} />
          <Route path="/multiplayer"  element={<PrivateRoute><Multiplayer /></PrivateRoute>} />
          <Route path="/"             element={<Navigate to="/editor" />} />
          <Route path="*" element={
            <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] animate-scaleIn">
              <h1 className="text-6xl font-bold text-gradient mb-4">404</h1>
              <p className="mb-6" style={{ color: 'var(--theme-muted)' }}>Page not found</p>
              <Link to="/editor" className="btn-neon">Go to Editor</Link>
            </div>
          } />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
