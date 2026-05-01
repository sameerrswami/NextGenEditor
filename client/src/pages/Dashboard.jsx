import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Clock, Trash2, Search, Code2, Loader2, ArrowRight, Star, ExternalLink, Terminal } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('snippets');
  const [snippets, setSnippets] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchSnippets();
    fetchHistory();
  }, []);

  const fetchSnippets = async () => {
    setLoading(true);
    try {
      const res = await api.get('/snippet');
      setSnippets(res.data);
    } catch (err) {
      console.error('Fetch snippets error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await api.get('/history');
      setHistory(res.data);
    } catch (err) {
      console.error('Fetch history error:', err);
    }
  };

  const handleDeleteSnippet = async (id) => {
    if (!confirm('Delete this snippet permanently?')) return;
    try {
      await api.delete(`/snippet/${id}`);
      setSnippets(snippets.filter((s) => s._id !== id));
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
      <div className="blob w-80 h-80 theme-blob-1 top-0 left-1/4"></div>
      <div className="blob w-60 h-60 theme-blob-2 bottom-20 right-10"></div>
      
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12 animate-fadeIn">
        <div>
          <h1 className="text-4xl font-bold mb-2">
            Welcome back, <span style={{ color: 'var(--theme-primary)' }}>{user?.username}</span>
          </h1>
          <p style={{ color: 'var(--theme-muted)' }}>
            Manage your snippets and execution history from your command center.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors"
              style={{ color: 'var(--theme-muted)' }} />
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
      <div 
        className="flex gap-4 p-1.5 rounded-2xl w-fit mb-10 animate-fadeIn"
        style={{ 
          background: 'var(--theme-card-bg)',
          border: '1px solid var(--theme-border)'
        }}
      >
        <button
          onClick={() => setActiveTab('snippets')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all duration-300 ${
            activeTab === 'snippets' ? 'shadow-lg' : ''
          }`}
          style={activeTab === 'snippets' ? {
            background: 'var(--theme-primary)',
            color: 'var(--bg-dark)'
          } : {
            color: 'var(--theme-muted)'
          }}
        >
          <BookOpen size={18} /> Snippets
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all duration-300 ${
            activeTab === 'history' ? 'shadow-lg' : ''
          }`}
          style={activeTab === 'history' ? {
            background: 'var(--theme-primary)',
            color: 'var(--bg-dark)'
          } : {
            color: 'var(--theme-muted)'
          }}
        >
          <Clock size={18} /> History
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 size={48} className="animate-spin" style={{ color: 'var(--theme-primary)' }} />
          <p style={{ color: 'var(--theme-muted)' }} className="animate-pulse">Loading your workspace...</p>
        </div>
      ) : (
        <div className="animate-slideUp">
          {activeTab === 'snippets' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSnippets.length > 0 ? (
                filteredSnippets.map((snippet) => (
                  <div 
                    key={snippet._id} 
                    className="glass-card group p-6 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div 
                          className="p-2.5 rounded-xl"
                          style={{ 
                            background: 'var(--theme-glow)',
                            color: 'var(--theme-primary)'
                          }}
                        >
                          <Code2 size={20} />
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => openSnippetInEditor(snippet)} 
                            className="p-2 transition-colors hover:scale-110"
                            style={{ color: 'var(--theme-muted)' }}
                          >
                            <ExternalLink size={18} />
                          </button>
                          <button 
                            onClick={() => handleDeleteSnippet(snippet._id)} 
                            className="p-2 transition-colors hover:text-red-400 hover:scale-110"
                            style={{ color: 'var(--theme-muted)' }}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-bold mb-2"
                        style={{ color: 'var(--theme-text)' }}
                      >
                        {snippet.title}
                      </h3>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span 
                          className="px-2.5 py-0.5 rounded-lg text-xs font-bold uppercase tracking-wider"
                          style={{ 
                            background: 'var(--theme-glow)',
                            color: 'var(--theme-primary)'
                          }}
                        >
                          {snippet.language}
                        </span>
                        {snippet.tags.map(tag => (
                          <span 
                            key={tag} 
                            className="px-2 py-0.5 rounded-lg text-xs"
                            style={{ 
                              background: 'var(--theme-card-bg)',
                              color: 'var(--theme-muted)',
                              border: '1px solid var(--theme-border)'
                            }}
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div 
                      className="pt-4 flex items-center justify-between"
                      style={{ borderTop: '1px solid var(--theme-border)' }}
                    >
                      <span className="text-xs" style={{ color: 'var(--theme-muted)' }}>
                        {new Date(snippet.createdAt).toLocaleDateString()}
                      </span>
                      <button 
                        onClick={() => openSnippetInEditor(snippet)} 
                        className="flex items-center gap-1 text-sm font-bold hover:gap-2 transition-all"
                        style={{ color: 'var(--theme-primary)' }}
                      >
                        Edit <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-20 glass-card text-center flex flex-col items-center gap-4">
                  <div 
                    className="p-5 rounded-3xl"
                    style={{ background: 'var(--theme-card-bg)' }}
                  >
                    <Search size={48} style={{ color: 'var(--theme-muted)' }} />
                  </div>
                  <h3 className="text-2xl font-bold" style={{ color: 'var(--theme-text)' }}>No snippets found</h3>
                  <p style={{ color: 'var(--theme-muted)' }}>Try searching for something else or create a new one.</p>
                </div>
              )}
            </div>
          ) : (
            <div 
              className="glass-card overflow-hidden"
              style={{ border: '1px solid var(--theme-border)' }}
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr style={{ 
                      background: 'var(--theme-card-bg)',
                      borderBottom: '1px solid var(--theme-border)'
                    }}>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest"
                        style={{ color: 'var(--theme-muted)' }}
                      >Language</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest"
                        style={{ color: 'var(--theme-muted)' }}
                      >Status</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest"
                        style={{ color: 'var(--theme-muted)' }}
                      >Time</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-right"
                        style={{ color: 'var(--theme-muted)' }}
                      >Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y"
                    style={{ borderColor: 'var(--theme-border)' }}
                  >
                    {history.map((item) => (
                      <tr 
                        key={item._id} 
                        className="transition-colors cursor-pointer group"
                        style={{ borderColor: 'var(--theme-border)' }}
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div 
                              className="p-2 rounded-lg transition-transform group-hover:scale-110"
                              style={{ 
                                background: 'var(--theme-glow)',
                                color: 'var(--theme-primary)'
                              }}
                            >
                              <Terminal size={16} />
                            </div>
                            <span 
                              className="font-bold uppercase text-sm tracking-wide"
                              style={{ color: 'var(--theme-text)' }}
                            >{item.language}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          {item.error ? (
                            <span className="status-error">Error</span>
                          ) : (
                            <span className="status-success">Success</span>
                          )}
                        </td>
                        <td className="px-6 py-5 text-sm" style={{ color: 'var(--theme-muted)' }}>
                          {typeof item.executionTime === 'number' ? `${item.executionTime.toFixed(3)}s` : '-'}
                        </td>
                        <td className="px-6 py-5 text-sm text-right" style={{ color: 'var(--theme-muted)' }}>
                          {item.createdAt ? new Date(item.createdAt).toLocaleString() : '-'}
                        </td>
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
