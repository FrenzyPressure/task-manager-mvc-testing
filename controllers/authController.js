const path = require('path');
const User = require('../models/User');

const authController = {
    /**
     * Render the login page
     */
    loginPage(req, res) {
        // If already logged in, redirect to dashboard
        if (req.session && req.session.userId) {
            return res.redirect('/dashboard');
        }
        res.sendFile(path.join(__dirname, '..', 'views', 'login.html'));
    },

    /**
     * Handle login POST request
     */
    login(req, res) {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        const user = User.findByUsername(username);

        if (!user || user.password !== password) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        // Create session
        req.session.userId = user.id;
        req.session.username = user.username;

        return res.json({ success: true, redirect: '/dashboard' });
    },

    /**
     * Handle logout
     */
    logout(req, res) {
        req.session.destroy((err) => {
            res.redirect('/login');
        });
    }
};

module.exports = authController;
