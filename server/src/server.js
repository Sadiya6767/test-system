const express = require('express');
const cors = require('cors');
require('dotenv').config();

const testRoutes = require('./routes/testRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for client applications
app.use(cors({
  origin: '*', // Allows development flexibility while securing via JWT
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

const path = require('path');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded resumes statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

const prisma = require('./prisma');

// Health check endpoint with database diagnostics
app.get('/api/health', async (req, res) => {
  try {
    const adminCount = await prisma.admin.count();
    const questionCount = await prisma.question.count();
    const attemptCount = await prisma.testAttempt.count();
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
      adminCount,
      questionCount,
      attemptCount
    });
  } catch (err) {
    res.status(200).json({
      status: 'degraded',
      timestamp: new Date().toISOString(),
      databaseError: err.message
    });
  }
});

// Mount modular routes
app.use('/api/test', testRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler for undefined API routes
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error occurred.'
  });
});

const { main: seedDatabase } = require('../prisma/seed');

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  console.log(`Candidate API: http://localhost:${PORT}/api/test`);
  console.log(`Admin API:     http://localhost:${PORT}/api/admin`);

  // Ensure Admin & Questions are present on database connection
  seedDatabase()
    .then(() => console.log('Database initialization verified.'))
    .catch((err) => console.error('Database initialization note:', err.message));
});