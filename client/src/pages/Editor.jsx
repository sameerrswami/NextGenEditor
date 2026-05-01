import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../api';
import CodeEditor from '../components/CodeEditor';
import OutputConsole from '../components/OutputConsole';
import AIPanel from '../components/AIPanel';
import { Play, Save, Loader2, Terminal, Bot, FileCode, Layout, Info } from 'lucide-react';

const DEFAULT_CODE = {
  javascript: `function main() {\n  console.log("Hello, World!");\n}\n\nmain();`,
  typescript: `function main(): void {\n  console.log("Hello, World!");\n}\n\nmain();`,
  python: `def main():\n    print("Hello, World!")\n\nmain()`,
  cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}`,
  c: `#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}`,
  java: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}`,
  go: `package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, World!")\n}`,
  rust: `fn main() {\n    println!("Hello, World!");\n}`,
  php: `<?php\necho "Hello, World!\\n";\n?>`,
  ruby: `puts "Hello, World!"`,
};

const STORAGE_KEY = 'nextgeneditor_state';

const Editor = () => {
  const { refreshUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [code, setCode] = useState(() => location.state?.code || DEFAULT_CODE.javascript);
  const [language, setLanguage] = useState(() => location.state?.language || 'javascript');
  const [input, setInput] = useState(() => location.state?.input || '');
  const [snippetTitle, setSnippetTitle] = useState(() => location.state?.title || '');
  const [snippetTags, setSnippetTags] = useState('');
  const [theme, setTheme] = useState('vs-dark');
  const [vimMode, setVimMode] = useState(false);

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
      const res = await api.post('/code/run', { code, language, input });
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
      await api.post('/snippet', { title: snippetTitle, code, language, tags: snippetTags });
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
    <div className="h-[calc(100vh-76px)] flex flex-col overflow-hidden"
      style={{ background: 'var(--bg-dark)' }}
    >
      {/* Editor Toolbar */}
      <div 
        className="flex items-center justify-between px-6 py-3 backdrop-blur-md"
        style={{ 
          background: 'var(--theme-card-bg)',
          borderBottom: '1px solid var(--theme-border)'
        }}
      >
        <div className="flex items-center gap-4">
          <div 
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
            style={{ 
              background: 'var(--theme-card-bg)',
              border: '1px solid var(--theme-border)'
            }}
          >
            <FileCode size={16} style={{ color: 'var(--theme-primary)' }} />
            <select
              value={language}
              onChange={(e) => {
                const newLang = e.target.value;
                setCode(DEFAULT_CODE[newLang]);
                setLanguage(newLang);
              }}
              className="bg-transparent text-sm font-bold outline-none cursor-pointer"
              style={{ color: 'var(--theme-text)' }}
            >
              {Object.keys(DEFAULT_CODE).map(lang => (
                <option key={lang} value={lang} style={{ background: 'var(--bg-dark)', color: 'var(--theme-text)' }} className="capitalize">{lang}</option>
              ))}
            </select>
          </div>
          <div 
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
            style={{ 
              background: 'var(--theme-card-bg)',
              border: '1px solid var(--theme-border)'
            }}
          >
            <Layout size={16} style={{ color: 'var(--theme-primary)' }} />
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="bg-transparent text-sm font-bold outline-none cursor-pointer"
              style={{ color: 'var(--theme-text)' }}
            >
              <option value="vs-dark" style={{ background: 'var(--bg-dark)' }}>Dark</option>
              <option value="light" style={{ background: 'var(--bg-dark)' }}>Light</option>
              <option value="hc-black" style={{ background: 'var(--bg-dark)' }}>High Contrast</option>
            </select>
          </div>
          
          <button
            onClick={() => setVimMode(!vimMode)}
            className={`px-3 py-1.5 rounded-xl border text-sm font-bold transition-all ${vimMode ? '' : ''}`}
            style={vimMode ? {
              background: 'var(--theme-glow)',
              color: 'var(--theme-primary)',
              border: '1px solid var(--theme-primary)'
            } : {
              background: 'var(--theme-card-bg)',
              color: 'var(--theme-muted)',
              border: '1px solid var(--theme-border)'
            }}
          >
            Vim
          </button>
          
          <button
            onClick={handleRun}
            disabled={running}
            className="btn-neon !py-1.5 !px-5 flex items-center gap-2 group"
          >
            {running ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} className="group-hover:scale-110 transition-transform" />}
            Run <span className="hidden lg:inline font-normal text-xs ml-1" style={{ opacity: 0.7 }}>^Enter</span>
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
          {saveMessage && (
            <span 
              className="text-xs font-bold animate-fadeIn"
              style={{ color: 'var(--theme-primary)' }}
            >
              {saveMessage}
            </span>
          )}
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor Area */}
        <div className="flex-1 flex flex-col relative"
          style={{ borderRight: '1px solid var(--theme-border)' }}
        >
          <div className="flex-1 editor-container m-3"
            style={{ border: '1px solid var(--theme-border)' }}
          >
            <CodeEditor
              code={code}
              setCode={setCode}
              language={language}
              theme={theme}
              vimMode={vimMode}
            />
          </div>
          
          {/* Input Panel */}
          <div 
            className="h-32 m-3 mt-0 glass-card flex flex-col overflow-hidden"
            style={{ border: '1px solid var(--theme-border)' }}
          >
            <div 
              className="px-4 py-2 flex items-center gap-2"
              style={{ 
                background: 'var(--theme-card-bg)',
                borderBottom: '1px solid var(--theme-border)'
              }}
            >
              <Terminal size={14} style={{ color: 'var(--theme-muted)' }} />
              <span 
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: 'var(--theme-muted)' }}
              >Standard Input</span>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter inputs here..."
              className="flex-1 bg-transparent p-3 text-sm font-mono resize-none outline-none"
              style={{ color: 'var(--theme-text)' }}
            />
          </div>
        </div>

        {/* Right Sidebar - AI & Console */}
        <div className="w-96 lg:w-[480px] flex flex-col p-3 gap-3">
          {/* Tabs */}
          <div 
            className="flex p-1 rounded-2xl"
            style={{ 
              background: 'var(--theme-card-bg)',
              border: '1px solid var(--theme-border)'
            }}
          >
            <button
              onClick={() => setActiveRightTab('output')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
                activeRightTab === 'output' ? 'shadow-lg' : ''
              }`}
              style={activeRightTab === 'output' ? {
                background: 'var(--theme-primary)',
                color: 'var(--bg-dark)'
              } : {
                color: 'var(--theme-muted)'
              }}
            >
              <Layout size={14} /> Console
            </button>
            <button
              onClick={() => setActiveRightTab('ai')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
                activeRightTab === 'ai' ? 'shadow-lg' : ''
              }`}
              style={activeRightTab === 'ai' ? {
                background: 'var(--theme-primary)',
                color: 'var(--bg-dark)'
              } : {
                color: 'var(--theme-muted)'
              }}
            >
              <Bot size={14} /> AI Intelligence
            </button>
          </div>

          <div 
            className="flex-1 glass-card overflow-hidden flex flex-col"
            style={{ border: '1px solid var(--theme-border)' }}
          >
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
          <div 
            className="p-4 rounded-2xl border flex items-start gap-3"
            style={{ 
              background: 'var(--theme-glow)',
              borderColor: 'var(--theme-border)'
            }}
          >
            <Info size={16} style={{ color: 'var(--theme-primary)' }} className="mt-0.5" />
            <p 
              className="text-xs leading-relaxed"
              style={{ color: 'var(--theme-muted)' }}
            >
              Use <span style={{ color: 'var(--theme-primary)', fontWeight: 'bold' }}>AI Tools</span> to analyze your code or fix bugs instantly using the latest Groq models.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Editor;
