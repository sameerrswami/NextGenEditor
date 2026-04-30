import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Trophy, Zap, CheckCircle, XCircle, ChevronRight, Terminal, Clock, Star, Award, Code2, Play, Loader2, RefreshCw } from 'lucide-react';
import CodeEditor from '../components/CodeEditor';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const DIFFICULTY_COLORS = {
  Easy:   { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  Medium: { bg: 'bg-amber-500/10',   text: 'text-amber-400',   border: 'border-amber-500/20'   },
  Hard:   { bg: 'bg-red-500/10',     text: 'text-red-400',     border: 'border-red-500/20'     },
};

const DEFAULT_CODE = {
  javascript: '// Write your solution here\nconsole.log("Hello");',
  python:     '# Write your solution here\nprint("Hello")',
  cpp:        '#include <iostream>\nusing namespace std;\nint main() {\n    // Write your solution here\n    return 0;\n}',
};

export default function Challenges() {
  const navigate = useNavigate();
  const [challenges, setChallenges]   = useState([]);
  const [selected, setSelected]       = useState(null);
  const [code, setCode]               = useState('');
  const [language, setLanguage]       = useState('javascript');
  const [loading, setLoading]         = useState(true);
  const [submitting, setSubmitting]   = useState(false);
  const [results, setResults]         = useState(null);
  const [seeding, setSeeding]         = useState(false);
  const [filterDiff, setFilterDiff]   = useState('All');

  const fetchChallenges = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/challenges`);
      setChallenges(res.data);
    } catch (err) {
      console.error('Failed to fetch challenges', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchChallenges(); }, [fetchChallenges]);

  const selectChallenge = (ch) => {
    setSelected(ch);
    setResults(null);
    const starter = ch.starterCode?.[language] || DEFAULT_CODE[language] || '';
    setCode(starter);
  };

  const changeLanguage = (lang) => {
    setLanguage(lang);
    if (selected) {
      setCode(selected.starterCode?.[lang] || DEFAULT_CODE[lang] || '');
    }
    setResults(null);
  };

  const handleSubmit = async () => {
    if (!selected || !code.trim()) return;
    setSubmitting(true);
    setResults(null);
    try {
      const res = await axios.post(`${API_URL}/challenges/${selected._id}/submit`, { code, language });
      setResults(res.data);
    } catch (err) {
      setResults({ passed: false, message: err.response?.data?.error || 'Submission failed', results: [] });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await axios.post(`${API_URL}/challenges/seed/demo`);
      await fetchChallenges();
    } catch (err) {
      console.error('Seed failed', err);
    } finally {
      setSeeding(false);
    }
  };

  const filtered = filterDiff === 'All' ? challenges : challenges.filter(c => c.difficulty === filterDiff);

  return (
    <div className="min-h-[calc(100vh-76px)] bg-[#020617] flex overflow-hidden">
      {/* ── Left Panel: Challenge List ─────────────────────────────────── */}
      <div className="w-80 flex-shrink-0 border-r border-white/5 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-white/5 bg-white/3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-indigo-500/10 rounded-lg">
                <Trophy size={18} className="text-indigo-400" />
              </div>
              <h2 className="font-bold text-white">Challenges</h2>
            </div>
            <button
              onClick={handleSeed}
              disabled={seeding}
              title="Load demo challenges"
              className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all"
            >
              {seeding ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
            </button>
          </div>

          {/* Difficulty Filter */}
          <div className="flex gap-1">
            {['All', 'Easy', 'Medium', 'Hard'].map(d => (
              <button
                key={d}
                onClick={() => setFilterDiff(d)}
                className={`flex-1 text-xs font-bold py-1 rounded-lg transition-all ${
                  filterDiff === d
                    ? 'bg-indigo-500 text-white'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Challenge List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 size={24} className="text-indigo-400 animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-3 text-center px-4">
              <Code2 size={32} className="text-slate-600" />
              <p className="text-xs text-slate-500">No challenges yet.</p>
              <button
                onClick={handleSeed}
                className="text-xs text-indigo-400 hover:underline"
              >
                Click to load demo challenges →
              </button>
            </div>
          ) : (
            filtered.map(ch => {
              const dc = DIFFICULTY_COLORS[ch.difficulty];
              const isSelected = selected?._id === ch._id;
              return (
                <button
                  key={ch._id}
                  onClick={() => selectChallenge(ch)}
                  className={`w-full text-left p-3 rounded-xl border transition-all duration-200 ${
                    isSelected
                      ? 'bg-indigo-500/10 border-indigo-500/30'
                      : 'bg-white/3 border-white/5 hover:bg-white/8 hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-white truncate pr-2">{ch.title}</span>
                    <ChevronRight size={14} className={`flex-shrink-0 text-slate-600 ${isSelected ? 'text-indigo-400' : ''}`} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${dc.bg} ${dc.text} ${dc.border} border`}>
                      {ch.difficulty}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-amber-400 font-bold">
                      <Star size={10} className="fill-amber-400" /> {ch.points}
                    </span>
                    <span className="text-xs text-slate-600">{ch.testCases?.length || 0} tests</span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ── Right Panel: Editor + Results ──────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {!selected ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <div className="p-6 bg-indigo-500/5 rounded-3xl border border-indigo-500/10">
              <Trophy size={48} className="text-indigo-400/50" />
            </div>
            <h3 className="text-xl font-bold text-white">Select a Challenge</h3>
            <p className="text-sm text-slate-500">Pick a problem from the list to start coding</p>
          </div>
        ) : (
          <>
            {/* Challenge Header */}
            <div className="flex-shrink-0 p-4 border-b border-white/5 bg-white/3 flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${DIFFICULTY_COLORS[selected.difficulty].bg} ${DIFFICULTY_COLORS[selected.difficulty].text} ${DIFFICULTY_COLORS[selected.difficulty].border}`}>
                    {selected.difficulty}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-amber-400 font-bold">
                    <Star size={10} className="fill-amber-400" /> {selected.points} coins
                  </span>
                </div>
                <h3 className="text-base font-bold text-white">{selected.title}</h3>
                <p className="text-sm text-slate-400 mt-1 leading-relaxed">{selected.description}</p>

                {/* Sample test case */}
                {selected.testCases?.[0] && (
                  <div className="mt-3 flex gap-3">
                    {selected.testCases[0].input && (
                      <div className="flex-1">
                        <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">Sample Input</p>
                        <code className="text-xs bg-white/5 rounded-lg px-2 py-1 block text-emerald-400 font-mono">{selected.testCases[0].input || '(none)'}</code>
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">Expected Output</p>
                      <code className="text-xs bg-white/5 rounded-lg px-2 py-1 block text-indigo-400 font-mono">{selected.testCases[0].expectedOutput}</code>
                    </div>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <select
                  value={language}
                  onChange={e => changeLanguage(e.target.value)}
                  className="bg-white/5 border border-white/10 text-slate-200 text-sm rounded-xl px-3 py-1.5 outline-none cursor-pointer"
                >
                  <option value="javascript" className="bg-slate-900">JavaScript</option>
                  <option value="python" className="bg-slate-900">Python</option>
                  <option value="cpp" className="bg-slate-900">C++</option>
                </select>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex items-center gap-2 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
                  {submitting ? 'Running…' : 'Submit'}
                </button>
              </div>
            </div>

            {/* Editor */}
            <div className="flex-1 overflow-hidden" style={{ minHeight: 0 }}>
              <CodeEditor code={code} setCode={setCode} language={language} theme="vs-dark" />
            </div>

            {/* Results Panel */}
            {results && (
              <div className={`flex-shrink-0 p-4 border-t transition-all ${results.passed ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-red-500/20 bg-red-500/5'}`}>
                <div className="flex items-center gap-2 mb-3">
                  {results.passed
                    ? <CheckCircle size={18} className="text-emerald-400" />
                    : <XCircle size={18} className="text-red-400" />
                  }
                  <span className={`font-bold text-sm ${results.passed ? 'text-emerald-400' : 'text-red-400'}`}>
                    {results.message}
                  </span>
                  {results.earnedCoins > 0 && (
                    <span className="ml-auto flex items-center gap-1 text-amber-400 font-black text-sm">
                      <Star size={14} className="fill-amber-400" /> +{results.earnedCoins}
                    </span>
                  )}
                </div>
                <div className="flex gap-2 flex-wrap">
                  {(results.results || []).map((r, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${
                        r.passed
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}
                    >
                      {r.passed ? <CheckCircle size={12} /> : <XCircle size={12} />}
                      Test {i + 1}
                      {!r.passed && <span className="text-slate-400 font-normal ml-1">got "{r.actual}"</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
