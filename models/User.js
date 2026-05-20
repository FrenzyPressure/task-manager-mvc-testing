const db = require('../db/database');

class User {
    static findByUsername(username) {
        return db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    }

    static findById(id) {
        return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    }
}

module.exports = User;
