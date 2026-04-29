const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');

const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

console.log('Environment variables loaded');

const app = express();

// Security middleware
app.use(helmet());

// CORS must come before rate limiting so 429 responses include CORS headers
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // stricter limit for auth routes
  message: { error: 'Too many authentication attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', apiLimiter);
app.use('/api/auth/', authLimiter);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/code', require('./routes/code'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/snippet', require('./routes/snippet'));
app.use('/api/history', require('./routes/history'));
app.use('/api/user', require('./routes/user'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'NextGenEditor API is running' });
});

// 404 handler for unknown API routes
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

const startServer = (port) => {
  const server = app.listen(port, () => {
    console.log(`Server running on port ${port}${mongoose.connection.readyState === 0 ? ' (without DB)' : ''}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Error: Port ${port} is already in use.`);
      console.log(`Please stop the process using port ${port} or set a different PORT in your .env file.`);
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

