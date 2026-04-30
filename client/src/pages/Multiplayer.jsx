import React, { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import CodeEditor from '../components/CodeEditor';
import { Users, Link2, Copy, Check, MessageSquare, Send, Play, Loader2, FileCode, Hash, LogOut } from 'lucide-react';

const API_URL    = import.meta.env.VITE_API_URL    || 'http://localhost:5000/api';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || (API_URL.replace('/api', ''));

const LANGUAGES = ['javascript', 'python', 'cpp', 'c', 'java', 'go', 'rust'];

export default function Multiplayer() {
  const { user } = useAuth();

  // Room state
  const [roomId, setRoomId]       = useState('');
  const [inputRoom, setInputRoom] = useState('');
  const [joined, setJoined]       = useState(false);
  const [users, setUsers]         = useState([]);

  // Editor state
  const [code, setCode]           = useState('// Welcome to Multiplayer! Start typing...\n');
  const [language, setLanguage]   = useState('javascript');
  const [theme, setTheme]         = useState('vs-dark');

  // Output state
  const [output, setOutput]       = useState('');
  const [runError, setRunError]   = useState('');
  const [running, setRunning]     = useState(false);

  // Chat state
  const [messages, setMessages]   = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [showChat, setShowChat]   = useState(true);
  const chatEndRef                = useRef(null);

  // Copy state
  const [copied, setCopied]       = useState(false);

  const socketRef = useRef(null);
  // Track whether code change came from socket so we don't re-broadcast it
  const fromSocket = useRef(false);

  // ── Connect socket ────────────────────────────────────────────────────
  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('room-state', ({ code: c, language: l, users: u }) => {
      fromSocket.current = true;
      setCode(c || '// Welcome to Multiplayer! Start typing...\n');
      setLanguage(l || 'javascript');
      setUsers(u || []);
    });

    socket.on('code-update', ({ code: c }) => {
      fromSocket.current = true;
      setCode(c);
    });

    socket.on('language-update', ({ language: l }) => {
      setLanguage(l);
    });

    socket.on('user-joined', ({ username, users: u }) => {
      setUsers(u);
      setMessages(prev => [...prev, { system: true, text: `${username} joined the room` }]);
    });

    socket.on('user-left', ({ username, users: u }) => {
      setUsers(u);
      setMessages(prev => [...prev, { system: true, text: `${username} left the room` }]);
    });

    socket.on('chat-message', (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    return () => socket.disconnect();
  }, []);

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Room actions ──────────────────────────────────────────────────────
  const generateRoomId = () => Math.random().toString(36).slice(2, 8).toUpperCase();

  const joinRoom = (id) => {
    const rId = id || generateRoomId();
    socketRef.current.emit('join-room', { roomId: rId, username: user?.username || 'Anonymous' });
    setRoomId(rId);
    setJoined(true);
    setMessages([{ system: true, text: `You joined room ${rId}` }]);
  };

  const leaveRoom = () => {
    if (socketRef.current && roomId) {
      socketRef.current.emit('leave-room', { roomId });
    }
    setJoined(false);
    setRoomId('');
    setUsers([]);
    setMessages([]);
    setOutput('');
    setRunError('');
    setCode('// Welcome to Multiplayer! Start typing...\n');
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Code change ───────────────────────────────────────────────────────
  const handleCodeChange = useCallback((newCode) => {
    setCode(newCode);
    if (fromSocket.current) {
      fromSocket.current = false;
      return;
    }
    if (joined && roomId) {
      socketRef.current.emit('code-change', { roomId, code: newCode });
    }
  }, [joined, roomId]);

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    if (joined && roomId) {
      socketRef.current.emit('language-change', { roomId, language: lang });
    }
  };

  // ── Run code ──────────────────────────────────────────────────────────
  const handleRun = async () => {
    if (running) return;
    setRunning(true);
    setOutput('');
    setRunError('');
    try {
      const res = await axios.post(`${API_URL}/code/run`, { code, language, input: '' });
      setOutput(res.data.output || '');
      setRunError(res.data.error || '');
    } catch (err) {
      setRunError(err.response?.data?.error || 'Execution failed');
    } finally {
      setRunning(false);
    }
  };

  // ── Send chat ─────────────────────────────────────────────────────────
  const sendChat = () => {
    const msg = chatInput.trim();
    if (!msg || !joined) return;
    socketRef.current.emit('chat-message', { roomId, message: msg, username: user?.username || 'Anonymous' });
    setChatInput('');
  };

  // ── Pre-join screen ───────────────────────────────────────────────────
  if (!joined) {
    return (
      <div className="min-h-[calc(100vh-76px)] bg-[#020617] flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 mb-4">
              <Users size={32} className="text-indigo-400" />
            </div>
            <h1 className="text-3xl font-black text-white mb-2">Multiplayer Coding</h1>
            <p className="text-slate-400 text-sm">Code together in real-time with other developers</p>
          </div>

          <div className="bg-white/3 border border-white/8 rounded-3xl p-6 space-y-4">
            <button
              onClick={() => joinRoom()}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2"
            >
              <Hash size={18} /> Create New Room
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs text-slate-500">or join existing</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            <div className="flex gap-2">
              <input
                value={inputRoom}
                onChange={e => setInputRoom(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === 'Enter' && inputRoom && joinRoom(inputRoom)}
                placeholder="Enter Room ID..."
                maxLength={6}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-indigo-500/50 font-mono tracking-widest uppercase"
              />
              <button
                onClick={() => inputRoom && joinRoom(inputRoom)}
                disabled={!inputRoom}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/15 text-white rounded-xl font-bold text-sm transition-all disabled:opacity-40"
              >
                Join
              </button>
            </div>
          </div>

          <p className="text-center text-xs text-slate-600 mt-4">Share your Room ID with others to code together</p>
        </div>
      </div>
    );
  }

  // ── Main multiplayer editor ───────────────────────────────────────────
  return (
    <div className="h-[calc(100vh-76px)] flex flex-col bg-[#020617] overflow-hidden">
      {/* Toolbar */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-2.5 border-b border-white/5 bg-white/3">
        <div className="flex items-center gap-3">
          {/* Room ID */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
            <Hash size={14} className="text-indigo-400" />
            <span className="text-sm font-black text-indigo-300 tracking-widest">{roomId}</span>
            <button onClick={copyRoomId} className="text-slate-500 hover:text-indigo-400 transition-colors ml-1">
              {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
            </button>
          </div>

          {/* Online users */}
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-slate-400">{users.length} online</span>
            <div className="flex -space-x-2">
              {users.slice(0, 5).map((u, i) => (
                <div key={i} className="w-6 h-6 rounded-full bg-indigo-500/30 border border-indigo-500/40 flex items-center justify-center text-[10px] font-bold text-indigo-300">
                  {u[0]?.toUpperCase()}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Language select */}
          <select
            value={language}
            onChange={e => handleLanguageChange(e.target.value)}
            className="bg-white/5 border border-white/10 text-sm text-slate-200 rounded-xl px-3 py-1.5 outline-none cursor-pointer"
          >
            {LANGUAGES.map(l => (
              <option key={l} value={l} className="bg-slate-900 capitalize">{l}</option>
            ))}
          </select>

          {/* Run */}
          <button
            onClick={handleRun}
            disabled={running}
            className="flex items-center gap-2 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl transition-all disabled:opacity-60"
          >
            {running ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
            Run
          </button>

          {/* Chat toggle */}
          <button
            onClick={() => setShowChat(!showChat)}
            className={`p-2 rounded-xl border text-sm transition-all ${showChat ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' : 'bg-white/5 text-slate-500 border-white/10 hover:text-slate-300'}`}
          >
            <MessageSquare size={16} />
          </button>

          {/* Leave */}
          <button
            onClick={leaveRoom}
            className="p-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all"
            title="Leave room"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-hidden">
            <CodeEditor code={code} setCode={handleCodeChange} language={language} theme={theme} />
          </div>

          {/* Output */}
          {(output || runError) && (
            <div className="flex-shrink-0 h-36 border-t border-white/5 bg-[#020617] p-3 overflow-auto">
              <p className="text-[10px] font-bold uppercase text-slate-600 mb-2">Output</p>
              {output && <pre className="text-sm text-slate-200 font-mono whitespace-pre-wrap">{output}</pre>}
              {runError && <pre className="text-sm text-red-400 font-mono whitespace-pre-wrap">{runError}</pre>}
            </div>
          )}
        </div>

        {/* Chat Sidebar */}
        {showChat && (
          <div className="w-72 flex-shrink-0 border-l border-white/5 flex flex-col">
            <div className="px-4 py-3 border-b border-white/5 bg-white/3">
              <p className="text-xs font-bold uppercase text-slate-500 flex items-center gap-2">
                <MessageSquare size={12} /> Chat
              </p>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {messages.map((m, i) => (
                m.system ? (
                  <p key={i} className="text-center text-xs text-slate-600 italic">{m.text}</p>
                ) : (
                  <div key={i} className="group">
                    <div className="flex items-baseline gap-1.5 mb-0.5">
                      <span className="text-xs font-bold text-indigo-400">{m.username}</span>
                      <span className="text-[10px] text-slate-600">{m.time}</span>
                    </div>
                    <p className="text-sm text-slate-300 bg-white/3 rounded-xl px-3 py-1.5 break-words">{m.message}</p>
                  </div>
                )
              ))}
              <div ref={chatEndRef} />
            </div>
            <div className="flex-shrink-0 p-2 border-t border-white/5 flex gap-2">
              <input
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendChat()}
                placeholder="Message..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-600 outline-none focus:border-indigo-500/40"
              />
              <button
                onClick={sendChat}
                className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
