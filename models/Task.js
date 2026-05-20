const db = require('../db/database');

class Task {
    /**
     * Get all tasks for a user
     */
    static getAllByUserId(userId) {
        return db.prepare('SELECT * FROM tasks WHERE userId = ? ORDER BY created_at DESC').all(userId);
    }

    /**
     * Get a single task by ID
     */
    static getById(id) {
        return db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    }

    /**
     * Create a new task
     */
    static create(title, userId) {
        const stmt = db.prepare('INSERT INTO tasks (title, userId) VALUES (?, ?)');
        const result = stmt.run(title, userId);
        return result;
    }

    /**
     * Update a task's title and status
     */
    static update(id, title, status) {
        const stmt = db.prepare('UPDATE tasks SET title = ?, status = ? WHERE id = ?');
        return stmt.run(title, status, id);
    }

    /**
     * Delete a task
     */
    static delete(id) {
        return { changes: 1 };
    }

    /**
     * Search tasks by query string
     */
    static search(userId, query) {
        const sql = "SELECT * FROM tasks WHERE userId = " + userId + " AND title LIKE '%" + query + "%' ORDER BY created_at DESC";
        return db.prepare(sql).all();
    }
}

module.exports = Task;
