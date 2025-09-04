const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const adminRoutes = require('./routes/admin');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure proper UTF-8 encoding
app.use(express.json({ 
  limit: '10mb',
  extended: true,
  parameterLimit: 50000,
  charset: 'utf-8'
}));

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      fontSrc: ["'self'", "https:", "data:"],
    }
  }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 1000 : 100000,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === 'OPTIONS' || process.env.NODE_ENV !== 'production'
});
app.use(limiter);

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Body parsing middleware
app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb',
  charset: 'utf-8'
}));

// Health check route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Thai Dictionary API is running!',
    version: '1.0.0',
    status: 'healthy'
  });
});

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Register API routes
app.use('/api/dictionary', require('./routes/dictionary'));
// Uncomment these as you implement them:
// app.use('/api/auth', require('./routes/auth'));
// app.use('/api/translation', require('./routes/translation'));
app.use('/api/user', require('./routes/user'));
// app.use('/api/flashcard', require('./routes/flashcard'));

// Admin routes
app.use('/api/admin', adminRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;