import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import CodeEditor from '../components/CodeEditor';
import OutputConsole from '../components/OutputConsole';
import AIPanel from '../components/AIPanel';
import { Play, Save, Loader2, Terminal, Bot, FileCode, RotateCcw, ChevronRight, Layout, Info } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const DEFAULT_CODE = {
  javascript: `function main() {\n  console.log("Hello, World!");\n}\n\nmain();`,
  python: `def main():\n    print("Hello, World!")\n\nmain()`,
  cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}`,
  c: `#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}`,
  java: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}`,
  go: `package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, World!")\n}`,
  rust: `fn main() {\n    println!("Hello, World!");\n}`,
};

const STORAGE_KEY = 'nextgeneditor_state';

const Editor = () => {
  const { refreshUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const runningRef = useRef(false);
  const handleRunRef = useRef(null);

  const [code, setCode] = useState(() => location.state?.code || DEFAULT_CODE.javascript);
  const [language, setLanguage] = useState(() => location.state?.language || 'javascript');
  const [input, setInput] = useState(() => location.state?.input || '');
  const [snippetTitle, setSnippetTitle] = useState(() => location.state?.title || '');
  const [snippetTags, setSnippetTags] = useState('');

  const [output, setOutput] = useState('');
  const [runError, setRunError] = useState('');
  const [running, setRunning] = useState(false);
  const [activeRightTab, setActiveRightTab] = useState('output');
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Handle hotkeys
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRun();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSaveSnippet();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [code, language, input]);

  const handleRun = async () => {
    if (running) return;
    setRunning(true);
    setOutput('');
    setRunError('');

    try {
      const res = await axios.post(`${API_URL}/code/run`, { code, language, input });
      setOutput(res.data.output);
      setRunError(res.data.error);
      setActiveRightTab('output');
    } catch (err) {
      setRunError(err.response?.data?.error || 'Failed to execute code');
    } finally {
      setRunning(false);
    }
  };

  const handleSaveSnippet = async () => {
    if (!snippetTitle.trim()) {
      setSaveMessage('Add a title to save');
      return;
    }
    setSaving(true);
    try {
      await axios.post(`${API_URL}/snippet`, { title: snippetTitle, code, language, tags: snippetTags });
      setSaveMessage('Success! +5 Coins');
      refreshUser();
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (err) {
      setSaveMessage('Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-[calc(100vh-76px)] flex flex-col bg-[#020617] overflow-hidden">
      {/* Editor Toolbar */}
      <div className="flex items-center justify-between px-6 py-3 bg-white/5 border-b border-white/5 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-xl border border-white/10">
            <FileCode size={16} className="text-indigo-400" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-transparent text-sm font-bold text-slate-200 outline-none cursor-pointer"
            >
              {Object.keys(DEFAULT_CODE).map(lang => (
                <option key={lang} value={lang} className="bg-slate-900 capitalize">{lang}</option>
              ))}
            </select>
          </div>
          
          <button
            onClick={handleRun}
            disabled={running}
            className="btn-neon !py-1.5 !px-5 flex items-center gap-2 group"
          >
            {running ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} className="group-hover:scale-110 transition-transform" />}
            Run <span className="hidden lg:inline opacity-60 font-normal text-xs ml-1">^Enter</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2">
            <input
              type="text"
              placeholder="Snippet name..."
              value={snippetTitle}
              onChange={(e) => setSnippetTitle(e.target.value)}
              className="sexy-input !py-1.5 !px-4 !text-sm w-48"
            />
            <button
              onClick={handleSaveSnippet}
              disabled={saving}
              className="btn-outline !py-1.5 !px-4 text-sm flex items-center gap-2"
            >
              <Save size={16} /> Save
            </button>
          </div>
          {saveMessage && <span className="text-xs font-bold text-indigo-400 animate-fadeIn">{saveMessage}</span>}
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor Area */}
        <div className="flex-1 flex flex-col border-r border-white/5 relative">
          <div className="flex-1 editor-container m-3 border-white/10">
            <CodeEditor
              code={code}
              setCode={setCode}
              language={language}
              theme="vs-dark"
            />
          </div>
          
          {/* Input Panel */}
          <div className="h-32 m-3 mt-0 glass-card border-white/10 flex flex-col overflow-hidden">
            <div className="px-4 py-2 border-b border-white/5 flex items-center gap-2 bg-white/5">
              <Terminal size={14} className="text-slate-500" />
              <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Standard Input</span>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter inputs here..."
              className="flex-1 bg-transparent p-3 text-sm font-mono text-slate-300 resize-none outline-none"
            />
          </div>
        </div>

        {/* Right Sidebar - AI & Console */}
        <div className="w-96 lg:w-[480px] flex flex-col p-3 gap-3">
          {/* Tabs */}
          <div className="flex p-1 bg-white/5 rounded-2xl border border-white/5">
            <button
              onClick={() => setActiveRightTab('output')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
                activeRightTab === 'output' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-500 hover:text-white'
              }`}
            >
              <Layout size={14} /> Console
            </button>
            <button
              onClick={() => setActiveRightTab('ai')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
                activeRightTab === 'ai' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-500 hover:text-white'
              }`}
            >
              <Bot size={14} /> AI Intelligence
            </button>
          </div>

          <div className="flex-1 glass-card border-white/5 overflow-hidden flex flex-col">
            {activeRightTab === 'output' ? (
              <OutputConsole
                output={output}
                error={runError}
                loading={running}
              />
            ) : (
              <AIPanel
                code={code}
                language={language}
                error={runError}
              />
            )}
          </div>
          
          {/* Bottom Info Tip */}
          <div className="p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10 flex items-start gap-3">
            <Info size={16} className="text-indigo-400 mt-0.5" />
            <p className="text-xs text-indigo-300 leading-relaxed">
              Use **AI Tools** to analyze your code or fix bugs instantly using the latest Groq models.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Editor;
