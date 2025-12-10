const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const compression = require('compression'); // ⚡ Speed optimization
const helmet = require('helmet'); // 🛡️ Security optimization
const { connectDB } = require('./config/db');

dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const aiRoutes = require('./routes/ai'); 
const testAttemptRoutes = require('./routes/testAttempts');
const testRoutes = require('./routes/tests');
const questionRoutes = require('./routes/questions');
const profileRoutes = require('./routes/profile');
const customTestRoutes = require('./routes/customTests');
const contactRoutes = require('./routes/contactRoutes');
const questionReportRoutes = require('./routes/questionReportRoutes'); 
const adminTestRoutes = require('./routes/adminTests');
const notificationRoutes = require('./routes/notifications');

const app = express();

// ==========================================
// 🚀 MIDDLEWARE (Order is Critical!)
// ==========================================

// 1. CORS Configuration (MUST BE FIRST)
// allowing all origins (*) to fix your immediate connection issues.
app.use(cors({
    origin: "*", 
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));

// 2. Explicitly Handle Preflight Requests
// This fixes: "Response to preflight request doesn't pass access control check"
app.options('*', cors());

// 3. Helmet Security
// We disable 'crossOriginResourcePolicy' so it doesn't fight with CORS
app.use(helmet({
    crossOriginResourcePolicy: false,
}));

// 4. Compression
app.use(compression());

// 5. Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ✅ Initialize models and associations
require('./models');

// ==========================================
// 🛣️ ROUTES
// ==========================================
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes); 
app.use('/api/test-attempts', testAttemptRoutes);
app.use('/api/tests', testRoutes); 
app.use('/api/questions', questionRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/custom-tests', customTestRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/question-reports', questionReportRoutes); 
app.use('/api/admin-tests', adminTestRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ 
    message: 'CSE Reviewer API is running!',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

const PORT = process.env.PORT || 5000;

// ==========================================
// 🚀 SAFE STARTUP SEQUENCE
// ==========================================
const startServer = async () => {
  try {
    // 1. Connect to Database first
    await connectDB();
    
    // 2. ONLY start server if DB connects successfully
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'Development'}`);
      console.log(`🤖 AI Features enabled with Gemini`);
      console.log(`📸 Image upload: Base64 (max 10MB)`);
    });
  } catch (error) {
    console.error('❌ Failed to start server due to DB Error:', error);
    process.exit(1);
  }
};

startServer();