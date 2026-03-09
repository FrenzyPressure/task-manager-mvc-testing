const express = require('express');
const session = require('express-session');
const path = require('path');

// Initialize database (creates tables and seeds data)
require('./db/database');

const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(session({
    secret: 'task-manager-secret-key-2024',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Routes
app.use('/', authRoutes);
app.use('/', taskRoutes);

// Root redirect
app.get('/', (req, res) => {
    res.redirect('/login');
});

// Start server
app.listen(PORT, () => {
    console.log(`Task Manager running at http://localhost:${PORT}`);
    console.log(`Login with: admin / admin123`);
});
