const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const config = require('./config');
// const { verifySendGridConnection } = require('./utils/email');

console.log('Environment variables loaded');

const app = express();
app.set('trust proxy', 1);
const server = http.createServer(app);

const ALLOWED_ORIGINS = [
  'https://nextgeneditor.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
  ...(process.env.CLIENT_URL
    ? process.env.CLIENT_URL.split(',').map(o => o.trim()).filter(Boolean)
    : []
  ),
];

console.log('✅ CORS allowed origins:', ALLOWED_ORIGINS);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    console.error(`❌ CORS blocked origin: "${origin}"`);
    callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

const io = new Server(server, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Security middleware
app.use(helmet());
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json({ limit: '50mb' }));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many authentication attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', apiLimiter);
app.use('/api/auth', authLimiter);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/code', require('./routes/code'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/snippet', require('./routes/snippet'));
app.use('/api/history', require('./routes/history'));
app.use('/api/user', require('./routes/user'));
app.use('/api/challenges', require('./routes/challenges'));
app.use('/api/leaderboard', require('./routes/leaderboard'));

// Health check
app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = { 0: 'Disconnected', 1: 'Connected', 2: 'Connecting', 3: 'Disconnecting' };
  res.json({ status: 'OK', message: 'NextGenEditor API is running', database: dbStatus[dbState] || 'Unknown' });
});

// 404 handler
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.warn('Bad JSON payload:', err.message);
    return res.status(400).json({ error: 'Invalid JSON payload' });
  }

  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// ─── Socket.io Multiplayer ─────────────────────────────────────────────────
const rooms = {};

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  socket.on('join-room', ({ roomId, username }) => {
    socket.join(roomId);
    if (!rooms[roomId]) rooms[roomId] = { users: {}, code: '', language: 'javascript' };
    rooms[roomId].users[socket.id] = username || 'Anonymous';

    socket.emit('room-state', {
      code: rooms[roomId].code,
      language: rooms[roomId].language,
      users: Object.values(rooms[roomId].users),
    });

    socket.to(roomId).emit('user-joined', { username: rooms[roomId].users[socket.id], users: Object.values(rooms[roomId].users) });
  });

  socket.on('code-change', ({ roomId, code }) => {
    if (rooms[roomId]) rooms[roomId].code = code;
    socket.to(roomId).emit('code-update', { code });
  });

  socket.on('language-change', ({ roomId, language }) => {
    if (rooms[roomId]) rooms[roomId].language = language;
    socket.to(roomId).emit('language-update', { language });
  });

  socket.on('cursor-move', ({ roomId, cursor, username }) => {
    socket.to(roomId).emit('cursor-update', { cursor, username, socketId: socket.id });
  });

  socket.on('chat-message', ({ roomId, message, username }) => {
    io.to(roomId).emit('chat-message', { message, username, time: new Date().toLocaleTimeString() });
  });

  socket.on('leave-room', ({ roomId }) => {
    if (rooms[roomId] && rooms[roomId].users[socket.id]) {
      const username = rooms[roomId].users[socket.id];
      delete rooms[roomId].users[socket.id];
      socket.leave(roomId);
      socket.to(roomId).emit('user-left', { username, users: Object.values(rooms[roomId].users) });
      if (Object.keys(rooms[roomId].users).length === 0) delete rooms[roomId];
    }
  });

  socket.on('disconnect', () => {
    for (const roomId of Object.keys(rooms)) {
      if (rooms[roomId].users[socket.id]) {
        const username = rooms[roomId].users[socket.id];
        delete rooms[roomId].users[socket.id];
        socket.to(roomId).emit('user-left', { username, users: Object.values(rooms[roomId].users) });
        if (Object.keys(rooms[roomId].users).length === 0) delete rooms[roomId];
      }
    }
    console.log('Socket disconnected:', socket.id);
  });
});

const PORT = config.PORT;

const startServer = (port) => {
  server.listen(port, () => {
    console.log(`Server running on port ${port}${mongoose.connection.readyState === 0 ? ' (without DB)' : ''}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Error: Port ${port} is already in use.`);
      process.exit(1);
    } else {
      console.error('Server error:', err);
      process.exit(1);
    }
  });
};

mongoose.connect(config.MONGO_URI)
  .then(async () => {
    console.log('MongoDB connected');
    startServer(PORT);
    console.log('// Email service ready (welcome emails optional)');
  })
  .catch(err => {
    console.log('MongoDB connection error:', err.message);
    console.log('Starting server without database connection...');
    startServer(PORT);
  });

