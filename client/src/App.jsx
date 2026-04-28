import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import MagicTrail from './components/MagicTrail';
import Login from './pages/Login';
import Editor from './pages/Editor';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="flex items-center justify-center h-screen animate-fadeIn">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
    </div>
  );
  return user ? children : <Navigate to="/login" />;
};

function AppContent() {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 transition-colors duration-300">
      <MagicTrail />
      <Navbar />
      <div className="animate-fadeIn">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/editor" element={<PrivateRoute><Editor /></PrivateRoute>} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/profile/:username?" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/" element={<Navigate to="/editor" />} />
          <Route path="*" element={
            <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] animate-scaleIn">
              <h1 className="text-6xl font-bold gradient-text mb-4">404</h1>
              <p className="text-gray-500 mb-6">Page not found</p>
              <Link to="/editor" className="btn-primary">Go to Editor</Link>
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
      <AppContent />
    </AuthProvider>
  );
}

export default App;

