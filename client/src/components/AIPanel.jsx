import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import { Lightbulb, Bug, ArrowRightLeft, Sparkles, Loader2, BookOpen, Copy, Check } from 'lucide-react';

const TABS = [
  { id: 'explain', label: 'Explain', icon: BookOpen },
  { id: 'analyze', label: 'Analyze', icon: Sparkles },
  { id: 'convert', label: 'Convert', icon: ArrowRightLeft },
  { id: 'debug', label: 'Debug', icon: Bug },
];

const LANGUAGES = ['javascript', 'typescript', 'python', 'cpp', 'c', 'java', 'go', 'rust', 'ruby', 'php'];

const AIPanel = ({ code, language, error: runError }) => {
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState('explain');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [explainMode, setExplainMode] = useState('detailed');
  const [convertTarget, setConvertTarget] = useState('python');
  const [copied, setCopied] = useState(false);
  const [coinEarned, setCoinEarned] = useState(false);

  const handleAIAction = async () => {
    if (!code.trim()) return;
    
    // Premium Check for Debug
    if (activeTab === 'debug' && !user?.isPremium) {
      setResult('🔒 This is a Premium Feature. Unlock it for 10,000 coins in your profile!');
      return;
    }

    setLoading(true);
    setResult('');

    try {
      let endpoint = '';
      let payload = {};

      switch (activeTab) {
        case 'explain':
          endpoint = '/ai/explain';
          payload = { code, language, mode: explainMode };
          break;
        case 'analyze':
          endpoint = '/ai/analyze';
          payload = { code, language };
          break;
        case 'convert':
          endpoint = '/ai/convert';
          payload = { code, fromLanguage: language, toLanguage: convertTarget };
          break;
        case 'debug':
          endpoint = '/ai/debug';
          payload = { code, language, errorMessage: runError };
          break;
        default:
          break;
      }

      const res = await api.post(endpoint, payload);
      
      const data = res.data;
      const resText = data.explanation || data.analysis || data.converted || data.debugResult;
      setResult(resText);
      
      // Coin Feedback
      setCoinEarned(true);
      refreshUser();
      setTimeout(() => setCoinEarned(false), 3000);
    } catch (err) {
      setResult('Error: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden animate-fadeIn">
      {/* Tab Switcher */}
      <div 
        className="flex p-1 rounded-2xl mb-4"
        style={{ 
          background: 'var(--theme-card-bg)',
          border: '1px solid var(--theme-border)'
        }}
      >
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setResult(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[10px] uppercase tracking-widest font-bold transition-all ${
                activeTab === tab.id ? 'shadow-lg' : ''
              }`}
              style={activeTab === tab.id ? {
                background: 'var(--theme-primary)',
                color: 'var(--bg-dark)'
              } : {
                color: 'var(--theme-muted)'
              }}
            >
              <Icon size={14} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Controls Area */}
      <div className="mb-4 space-y-4">
        {activeTab === 'explain' && (
          <div 
            className="flex p-1 rounded-xl w-fit"
            style={{ 
              background: 'var(--theme-card-bg)',
              border: '1px solid var(--theme-border)'
            }}
          >
            <button
              onClick={() => setExplainMode('detailed')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all`}
              style={explainMode === 'detailed' ? {
                background: 'var(--theme-glow)',
                color: 'var(--theme-text)'
              } : {
                color: 'var(--theme-muted)'
              }}
            >
              Detailed
            </button>
            <button
              onClick={() => setExplainMode('beginner')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all`}
              style={explainMode === 'beginner' ? {
                background: 'var(--theme-glow)',
                color: 'var(--theme-text)'
              } : {
                color: 'var(--theme-muted)'
              }}
            >
              Beginner
            </button>
          </div>
        )}

        {activeTab === 'convert' && (
          <div className="flex items-center gap-3">
            <span 
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: 'var(--theme-muted)' }}
            >Target:</span>
            <select
              value={convertTarget}
              onChange={(e) => setConvertTarget(e.target.value)}
              className="rounded-xl px-3 py-1.5 text-xs font-bold outline-none"
              style={{ 
                background: 'var(--theme-card-bg)',
                border: '1px solid var(--theme-border)',
                color: 'var(--theme-text)'
              }}
            >
              {LANGUAGES.filter((l) => l !== language).map((l) => (
                <option key={l} value={l} style={{ background: 'var(--bg-dark)' }}>{l.toUpperCase()}</option>
              ))}
            </select>
          </div>
        )}

        <button
          onClick={handleAIAction}
          disabled={loading || !code.trim()}
          className="btn-neon w-full flex items-center justify-center gap-2 relative"
        >
          {loading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Sparkles size={18} />
          )}
          {loading ? 'AI is Thinking...' : `AI ${TABS.find(t => t.id === activeTab).label}`}
          
          {coinEarned && (
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] font-black px-2 py-1 rounded-full animate-bounce shadow-xl"
              style={{ 
                background: '#fbbf24',
                color: 'var(--bg-dark)'
              }}
            >
              +1 COIN!
            </span>
          )}
        </button>
      </div>

      {/* Result Area */}
      <div 
        className="flex-1 rounded-2xl p-4 overflow-auto relative group"
        style={{ 
          background: 'var(--theme-card-bg)',
          border: '1px solid var(--theme-border)'
        }}
      >
        {loading ? (
          <div className="space-y-4 pt-4">
            <div className="h-4 w-full shimmer rounded-full"></div>
            <div className="h-4 w-3/4 shimmer rounded-full"></div>
            <div className="h-4 w-5/6 shimmer rounded-full"></div>
            <div className="h-4 w-2/3 shimmer rounded-full"></div>
          </div>
        ) : result ? (
          <div className="animate-slideUp">
            <button
              onClick={handleCopy}
              className="absolute top-4 right-4 p-2 rounded-xl transition-all opacity-0 group-hover:opacity-100"
              style={{ 
                background: 'var(--theme-glow)',
                color: 'var(--theme-muted)'
              }}
            >
              {copied ? <Check size={16} style={{ color: '#22c55e' }} /> : <Copy size={16} />}
            </button>
            <pre 
              className="text-sm font-mono whitespace-pre-wrap leading-relaxed"
              style={{ color: 'var(--theme-text)' }}
            >
              {result}
            </pre>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center gap-4 py-10"
            style={{ opacity: 0.4 }}
          >
            <div 
              className="p-5 rounded-3xl"
              style={{ background: 'var(--theme-card-bg)' }}
            >
              <Lightbulb size={48}
                style={{ color: 'var(--theme-muted)' }}
                className="animate-pulse"
              />
            </div>
            <p className="text-sm font-medium" style={{ color: 'var(--theme-muted)' }}>
              Select a tool above to enhance your code with AI intelligence.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIPanel;
