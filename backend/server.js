const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const { connectDB } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

// Import routes
const authRoutes = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const designationRoutes = require('./routes/designationRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const shiftRoutes = require('./routes/shiftRoutes');
const holidayRoutes = require('./routes/holidayRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const payrollRoutes = require('./routes/payrollRoutes');
const performanceRoutes = require('./routes/performanceRoutes');
const documentRoutes = require('./routes/documentRoutes');
const assetRoutes = require('./routes/assetRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const reportRoutes = require('./routes/reportRoutes');
const auditRoutes = require('./routes/auditRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();

// Security HTTP headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Compression & Logging
app.use(compression());
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// CORS setup
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173'
];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Permissive in dev, adjust for prod
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply rate limiting to all standard API routes
app.use('/api', apiLimiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'UP',
    system: 'ECO TRACK — Employee Management System',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/designations', designationRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/shifts', shiftRoutes);
app.use('/api/holidays', holidayRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/settings', settingsRoutes);

// Centralized error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

let server;

const User = require('./models/User');
const { seedData } = require('./scripts/seed');

const startServer = async () => {
  await connectDB();

  // Auto-bootstrap demo data and initial admin if database is freshly initialized
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[Auto-Bootstrap] Database is empty. Seeding initial accounts and sample company records...');
      await seedData(false);
      console.log('[Auto-Bootstrap] Seeding complete! All 4 roles are ready to login.');
    }
  } catch (seedErr) {
    console.warn('[Auto-Bootstrap Warning]', seedErr.message);
  }

  server = app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 ECO TRACK API Server running on port ${PORT}`);
    console.log(`💼 Tagline: Track Employees. Manage Work. Drive Performance.`);
    console.log(`🌐 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`=======================================================`);
  });
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = { app, startServer };
