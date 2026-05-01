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
    <div className="h-full flex flex-col animate-scaleIn">
      <div 
        className="flex items-center justify-between px-4 py-2 rounded-t-lg"
        style={{
          background: 'var(--theme-glow)',
          borderBottom: '1px solid var(--theme-border)'
        }}
      >
        <div className="flex items-center gap-2">
          <span 
            className="font-semibold text-sm"
            style={{ color: 'var(--theme-primary)' }}
          >Output</span>
          {executionTime > 0 && (
            <span className="flex items-center gap-1 text-xs"
              style={{ color: 'var(--theme-muted)' }}
            >
              <Clock size={12} />
              {executionTime.toFixed(3)}s
            </span>
          )}
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-1 text-xs rounded transition-all duration-300 hover:scale-105"
          style={{ color: 'var(--theme-muted)' }}
          title="Copy output"
        >
          {copied ? <CheckCircle size={14} style={{ color: '#22c55e' }} /> : <Copy size={14} />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      <div 
        className="flex-1 overflow-auto p-4 rounded-b-lg font-mono text-sm"
        style={{ 
          background: 'var(--bg-dark)',
          color: 'var(--theme-text)'
        }}
      >
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2"
              style={{ borderColor: 'var(--theme-primary)' }}
            ></div>
          </div>
        ) : (
          <>
            {output && (
              <pre 
                className="whitespace-pre-wrap break-words"
                style={{ color: '#22c55e' }}
              >{output}</pre>
            )}
            {error && (
              <div className="mt-2 animate-slideDown">
                <div className="flex items-center gap-1 mb-1" style={{ color: '#ef4444' }}>
                  <AlertCircle size={14} />
                  <span className="font-semibold">Error</span>
                </div>
                <pre 
                  className="whitespace-pre-wrap break-words"
                  style={{ color: '#ef4444' }}
                >{error}</pre>
              </div>
            )}
            {!output && !error && (
              <div className="text-center mt-8 animate-fadeIn" style={{ color: 'var(--theme-muted)' }}>
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
