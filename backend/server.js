const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const { connectDB } = require('./config/db');
const DataStore = require('./services/dataStore');
const errorHandler = require('./middleware/errorHandler');

// Route files
const eventRoutes = require('./routes/eventRoutes');
const registrationRoutes = require('./routes/registrationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const viewRoutes = require('./routes/viewRoutes');

const app = express();

// Configure View Engine (EJS)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS
app.use(cors());

// Serve static assets from frontend and assets directories
const rootDir = path.join(__dirname, '..');
const frontendDir = path.join(rootDir, 'frontend');
const adminDir = path.join(rootDir, 'admin');
const assetsDir = path.join(frontendDir, 'assets');

app.use('/assets', express.static(assetsDir));
app.use('/css', express.static(path.join(frontendDir, 'css')));
app.use('/js', express.static(path.join(frontendDir, 'js')));
app.use('/admin', express.static(adminDir));
let isInitialized = false;
const ensureInitialized = async () => {
  if (!isInitialized) {
    try {
      await connectDB();
      await DataStore.seedMongoIfEmpty();
    } catch (err) {
      console.warn('DB initialization notice:', err.message);
    }
    isInitialized = true;
  }
};

// Middleware to ensure DB connection is ready in serverless environments
app.use(async (req, res, next) => {
  await ensureInitialized();
  next();
});

// Mount REST API Routes
app.use('/api/events', eventRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    platform: 'Electroreck Event Management Platform',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Mount EJS View Routes (renders server-side EJS templates)
app.use('/', viewRoutes);

// Static fallback for any other files
app.use(express.static(frontendDir));

// Fallback route for Admin single page navigation
app.get('/admin/*', (req, res) => {
  res.sendFile(path.join(adminDir, 'index.html'));
});

// Fallback route for single page / 404
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ success: false, message: 'API route not found' });
  }
  res.redirect('/');
});



// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await ensureInitialized();

  app.listen(PORT, () => {
    console.log(`
==========================================================
⚡ ELECTRORECK UNIVERSITY EVENT PLATFORM IS RUNNING
==========================================================
🌐 Frontend Portal:  http://localhost:${PORT}/
🛡️ Admin Dashboard:  http://localhost:${PORT}/admin
📡 REST API Health:  http://localhost:${PORT}/api/health
==========================================================
Default Admin Credentials:
Email:    admin@electrorec.club
Password: electrorec2026
==========================================================
    `);
  });
};

if (require.main === module) {
  startServer();
}

module.exports = app;
