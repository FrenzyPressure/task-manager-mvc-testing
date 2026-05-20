/**
 * Authentication middleware
 * Checks if user is logged in via session
 */
function requireAuth(req, res, next) {
    if (req.session && req.session.userId) {
        return next();
    }
    return res.redirect('/login');
}

module.exports = { requireAuth };
