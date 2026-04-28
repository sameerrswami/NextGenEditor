import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Lightbulb, Bug, ArrowRightLeft, Sparkles, Loader2, BookOpen, Wrench, AlertTriangle, Copy, Check } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const TABS = [
  { id: 'explain', label: 'Explain', icon: BookOpen },
  { id: 'analyze', label: 'Analyze', icon: Sparkles },
  { id: 'convert', label: 'Convert', icon: ArrowRightLeft },
  { id: 'debug', label: 'Debug', icon: Bug },
];

const LANGUAGES = ['javascript', 'typescript', 'python', 'cpp', 'c', 'java', 'go', 'rust', 'ruby', 'php', 'csharp'];

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

      const res = await axios.post(`${API_URL}${endpoint}`, payload);
      
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
      <div className="flex p-1 bg-white/5 rounded-2xl border border-white/5 mb-4">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setResult(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[10px] uppercase tracking-widest font-bold transition-all ${
                activeTab === tab.id ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-500 hover:text-white'
              }`}
            >
              <Icon size={14} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Controls Area */}
      <div className="mb-4 space-y-4">
        {activeTab === 'explain' && (
          <div className="flex p-1 bg-white/5 rounded-xl border border-white/5 w-fit">
            <button
              onClick={() => setExplainMode('detailed')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                explainMode === 'detailed' ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Detailed
            </button>
            <button
              onClick={() => setExplainMode('beginner')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                explainMode === 'beginner' ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Beginner
            </button>
          </div>
        )}

        {activeTab === 'convert' && (
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Target:</span>
            <select
              value={convertTarget}
              onChange={(e) => setConvertTarget(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-200 outline-none"
            >
              {LANGUAGES.filter((l) => l !== language).map((l) => (
                <option key={l} value={l} className="bg-slate-900">{l.toUpperCase()}</option>
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
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-900 text-[10px] font-black px-2 py-1 rounded-full animate-bounce shadow-xl">
              +1 COIN!
            </span>
          )}
        </button>
      </div>

      {/* Result Area */}
      <div className="flex-1 bg-white/5 rounded-2xl border border-white/5 p-4 overflow-auto relative group">
        {loading ? (
          <div className="space-y-4 pt-4">
            <div className="h-4 bg-white/5 rounded-full w-full shimmer"></div>
            <div className="h-4 bg-white/5 rounded-full w-3/4 shimmer"></div>
            <div className="h-4 bg-white/5 rounded-full w-5/6 shimmer"></div>
            <div className="h-4 bg-white/5 rounded-full w-2/3 shimmer"></div>
          </div>
        ) : result ? (
          <div className="animate-slideUp">
            <button
              onClick={handleCopy}
              className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-slate-300 opacity-0 group-hover:opacity-100"
            >
              {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
            </button>
            <pre className="text-sm font-mono text-slate-300 whitespace-pre-wrap leading-relaxed">
              {result}
            </pre>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center gap-4 py-10 opacity-40">
            <div className="p-5 bg-white/5 rounded-3xl">
              <Lightbulb size={48} className="text-slate-500 animate-pulse" />
            </div>
            <p className="text-sm font-medium">Select a tool above to enhance your code with AI intelligence.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIPanel;
