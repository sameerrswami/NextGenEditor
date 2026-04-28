import React from 'react';
import { Copy, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const OutputConsole = ({ output, error, executionTime, loading }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    const text = error ? `${output}\n\nErrors:\n${error}` : output;
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      navigator.clipboard.writeText(text).catch(() => {
        alert('Copy failed. Please copy manually.');
      });
    } else {
      alert('Clipboard not available. Please copy manually.');
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full flex flex-col panel animate-scaleIn">
      <div 
        className="flex items-center justify-between px-4 py-2 rounded-t-lg"
        style={{
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm gradient-text">Output</span>
          {executionTime > 0 && (
            <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <Clock size={12} />
              {executionTime.toFixed(3)}s
            </span>
          )}
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-1 text-xs rounded hover:bg-white/20 transition-all duration-300 hover:scale-105"
          title="Copy output"
        >
          {copied ? <CheckCircle size={14} className="text-green-500" /> : <Copy size={14} />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4 code-block text-gray-100 font-mono text-sm rounded-b-lg">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {output && (
              <pre className="whitespace-pre-wrap break-words text-green-400">{output}</pre>
            )}
            {error && (
              <div className="mt-2 animate-slideDown">
                <div className="flex items-center gap-1 text-red-400 mb-1">
                  <AlertCircle size={14} />
                  <span className="font-semibold">Error</span>
                </div>
                <pre className="whitespace-pre-wrap break-words text-red-400">{error}</pre>
              </div>
            )}
            {!output && !error && (
              <div className="text-gray-500 text-center mt-8 animate-fadeIn">
                Run your code to see output here
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default OutputConsole;

