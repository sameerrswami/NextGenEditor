import React, { useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';

const LANGUAGE_MAP = {
  javascript: 'javascript',
  typescript: 'typescript',
  python: 'python',
  cpp: 'cpp',
  c: 'c',
  java: 'java',
  go: 'go',
  rust: 'rust',
  ruby: 'ruby',
  php: 'php'
};

const CodeEditor = ({ code, setCode, language, theme = 'vs-dark', vimMode = false }) => {
  const editorRef = useRef(null);
  const vimRef = useRef(null);
  const statusRef = useRef(null);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
  };

  useEffect(() => {
    let mounted = true;
    if (vimMode && editorRef.current && !vimRef.current) {
      import('monaco-vim').then(({ initVimMode }) => {
        if (mounted && editorRef.current) {
          vimRef.current = initVimMode(editorRef.current, statusRef.current);
        }
      });
    } else if (!vimMode && vimRef.current) {
      vimRef.current.dispose();
      vimRef.current = null;
    }
    return () => {
      mounted = false;
    };
  }, [vimMode]);

  useEffect(() => {
    return () => {
      if (vimRef.current) {
        vimRef.current.dispose();
        vimRef.current = null;
      }
    };
  }, []);

  const handleChange = (value) => {
    setCode(value || '');
  };

  return (
    <div className="h-full w-full flex flex-col relative group">
      <div className="flex-1 relative">
        <div
          className="absolute inset-0 rounded-lg pointer-events-none transition-all duration-500 opacity-0 group-hover:opacity-100"
          style={{ boxShadow: 'inset 0 0 0 1px rgba(59, 130, 246, 0.1)' }}
        />
        <Editor
          height="100%"
        language={LANGUAGE_MAP[language] || 'javascript'}
        value={code}
        onChange={handleChange}
        onMount={handleEditorDidMount}
        theme={theme}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          wordWrap: 'on',
          automaticLayout: true,
          scrollBeyondLastLine: false,
          lineNumbers: 'on',
          roundedSelection: false,
          padding: { top: 16 },
          suggestOnTriggerCharacters: true,
          acceptSuggestionOnCommitCharacter: true,
          acceptSuggestionOnEnter: 'on',
          quickSuggestions: true,
          snippetSuggestions: 'inline',
          tabCompletion: 'on',
          formatOnPaste: true,
          formatOnType: true,
        }}
      />
      </div>
      {vimMode && <div ref={statusRef} className="h-6 bg-[#020617] text-indigo-300 text-xs flex items-center px-3 font-mono border-t border-white/5" />}
    </div>
  );
};

export default CodeEditor;

