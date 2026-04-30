const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });
console.log('Environment variables loaded');

const app = express();
app.set('trust proxy', 1);
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Security middleware
app.use(helmet());
app.use(cors());
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
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// ─── Socket.io Multiplayer ─────────────────────────────────────────────────
// rooms: { roomId: { users: Set<socketId>, code: string, language: string } }
const rooms = {};

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  socket.on('join-room', ({ roomId, username }) => {
    socket.join(roomId);
    if (!rooms[roomId]) rooms[roomId] = { users: {}, code: '', language: 'javascript' };
    rooms[roomId].users[socket.id] = username || 'Anonymous';

    // Send existing state to the new joiner
    socket.emit('room-state', {
      code: rooms[roomId].code,
      language: rooms[roomId].language,
      users: Object.values(rooms[roomId].users),
    });

    // Notify others
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

  // Explicit leave room (without disconnecting)
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

const PORT = process.env.PORT || 5000;

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

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nextgeneditor')
  .then(() => {
    console.log('MongoDB connected');
    startServer(PORT);
  })
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    console.log('Starting server without database connection...');
    startServer(PORT);
  });
