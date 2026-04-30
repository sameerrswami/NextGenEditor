import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Clock, Trash2, Search, Tag, Code2, Loader2, History, Edit3, ArrowRight, Star, ExternalLink, Terminal } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('snippets');
  const [snippets, setSnippets] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSnippet, setSelectedSnippet] = useState(null);

  useEffect(() => {
    fetchSnippets();
    fetchHistory();
  }, []);

  const fetchSnippets = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/snippet`);
      setSnippets(res.data);
    } catch (err) {
      console.error('Fetch snippets error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${API_URL}/history`);
      setHistory(res.data);
    } catch (err) {
      console.error('Fetch history error:', err);
    }
  };

  const handleDeleteSnippet = async (id) => {
    if (!confirm('Delete this snippet permanently?')) return;
    try {
      await axios.delete(`${API_URL}/snippet/${id}`);
      setSnippets(snippets.filter((s) => s._id !== id));
      if (selectedSnippet?._id === id) setSelectedSnippet(null);
    } catch (err) {
      alert('Failed to delete snippet');
    }
  };

  const openSnippetInEditor = (snippet) => {
    navigate('/editor', { state: { code: snippet.code, language: snippet.language, title: snippet.title } });
  };

  const filteredSnippets = snippets.filter((s) => {
    const q = search.toLowerCase();
    return (
      s.title.toLowerCase().includes(q) ||
      s.language.toLowerCase().includes(q) ||
      s.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Background elements */}
      <div className="blob w-80 h-80 bg-indigo-600/10 top-0 left-1/4"></div>
      
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12 animate-fadeIn">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Welcome back, <span className="text-indigo-400">{user?.username}</span></h1>
          <p className="text-slate-400">Manage your snippets and execution history from your command center.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
            <input
              type="text"
              placeholder="Search snippets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="sexy-input pl-12 w-64 lg:w-80"
            />
          </div>
          <button onClick={() => navigate('/editor')} className="btn-neon flex items-center gap-2">
            <Code2 size={18} /> New Snippet
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 p-1.5 bg-white/5 border border-white/10 rounded-2xl w-fit mb-10 animate-fadeIn">
        <button
          onClick={() => setActiveTab('snippets')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all duration-300 ${
            activeTab === 'snippets' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'
          }`}
        >
          <BookOpen size={18} /> Snippets
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all duration-300 ${
            activeTab === 'history' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Clock size={18} /> History
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 size={48} className="animate-spin text-indigo-500" />
          <p className="text-slate-500 animate-pulse">Loading your workspace...</p>
        </div>
      ) : (
        <div className="animate-slideUp">
          {activeTab === 'snippets' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSnippets.length > 0 ? (
                filteredSnippets.map((snippet) => (
                  <div key={snippet._id} className="glass-card group p-6 flex flex-col justify-between border-white/5 hover:border-indigo-500/30">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400">
                          <Code2 size={20} />
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => openSnippetInEditor(snippet)} className="p-2 text-slate-400 hover:text-white transition-colors">
                            <ExternalLink size={18} />
                          </button>
                          <button onClick={() => handleDeleteSnippet(snippet._id)} className="p-2 text-slate-400 hover:text-red-400 transition-colors">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">{snippet.title}</h3>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="px-2.5 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider">
                          {snippet.language}
                        </span>
                        {snippet.tags.map(tag => (
                          <span key={tag} className="px-2 py-0.5 rounded-lg bg-white/5 text-slate-400 text-xs border border-white/5">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                      <span className="text-xs text-slate-500">{new Date(snippet.createdAt).toLocaleDateString()}</span>
                      <button onClick={() => openSnippetInEditor(snippet)} className="text-indigo-400 font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all">
                        Edit <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-20 glass-card text-center flex flex-col items-center gap-4">
                  <div className="p-5 bg-white/5 rounded-3xl text-slate-500">
                    <Search size={48} />
                  </div>
                  <h3 className="text-2xl font-bold text-white">No snippets found</h3>
                  <p className="text-slate-400">Try searching for something else or create a new one.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="glass-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/5">
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Language</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Time</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {history.map((item) => (
                      <tr key={item._id} className="hover:bg-white/[0.02] transition-colors cursor-pointer group">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400 group-hover:scale-110 transition-transform">
                              <Terminal size={16} />
                            </div>
                            <span className="font-bold text-white uppercase text-sm tracking-wide">{item.language}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          {item.error ? (
                            <span className="status-error">Error</span>
                          ) : (
                            <span className="status-success">Success</span>
                          )}
                        </td>
                        <td className="px-6 py-5 text-slate-400 text-sm">{typeof item.executionTime === 'number' ? `${item.executionTime.toFixed(3)}s` : '-'}</td>
                        <td className="px-6 py-5 text-slate-500 text-sm text-right">{item.createdAt ? new Date(item.createdAt).toLocaleString() : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
