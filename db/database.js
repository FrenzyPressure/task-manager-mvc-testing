const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'tasks.db');
const db = new Database(dbPath);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    status TEXT DEFAULT 'Pending' CHECK(status IN ('Pending', 'Completed')),
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    userId INTEGER NOT NULL,
    FOREIGN KEY (userId) REFERENCES users(id)
  );
`);

// Seed default user if not exists
const existingUser = db.prepare('SELECT id FROM users WHERE username = ?').get('admin');
if (!existingUser) {
    db.prepare('INSERT INTO users (username, password) VALUES (?, ?)').run('admin', 'admin123');
    console.log('Default user created: admin / admin123');
}

module.exports = db;
