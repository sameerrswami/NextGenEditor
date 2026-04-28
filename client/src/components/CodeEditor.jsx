import React from 'react';
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
  php: 'php',
  csharp: 'csharp'
};

const CodeEditor = ({ code, setCode, language, theme = 'vs-dark' }) => {
  const handleChange = (value) => {
    setCode(value || '');
  };

  return (
    <div className="h-full w-full relative group">
      <div className="absolute inset-0 rounded-lg pointer-events-none transition-all duration-500 opacity-0 group-hover:opacity-100"
        style={{
          boxShadow: 'inset 0 0 0 1px rgba(59, 130, 246, 0.1)',
        }}
      />
      <Editor
        height="100%"
        language={LANGUAGE_MAP[language] || 'javascript'}
        value={code}
        onChange={handleChange}
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
  );
};

export default CodeEditor;

