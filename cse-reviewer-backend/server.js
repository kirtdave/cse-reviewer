const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
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
const questionReportRoutes = require('./routes/questionReportRoutes'); // ✅ ADD THIS
const adminTestRoutes = require('./routes/adminTests');
const notificationRoutes = require('./routes/notifications');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ✅ Initialize models and associations
require('./models');

// Database connection
connectDB();

// Routes
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
  res.json({ message: 'CSE Reviewer API is running with MySQL!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🤖 AI Features enabled with Gemini`);
  console.log(`💾 Database: MySQL (XAMPP)`);
  console.log(`📸 Image upload: Base64 (max 10MB)`);
  console.log(`🔗 Model associations loaded`);
  console.log(`📧 Contact routes enabled`);
  console.log(`📝 Question report routes enabled`);
});