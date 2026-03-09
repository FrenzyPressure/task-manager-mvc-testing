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
     * DEFECT D3: No mutex/lock mechanism — rapid clicks can create duplicates
     * DEFECT D4: No title length validation — titles > 256 chars will crash (DB column limit)
     * DEFECT D8: No server-side validation — empty titles can be submitted if JS is disabled
     */
    static create(title, userId) {
        // No server-side validation (D8) — relies entirely on frontend
        // No title length check (D4) — will cause DB error if > 256 chars
        const stmt = db.prepare('INSERT INTO tasks (title, userId) VALUES (?, ?)');
        const result = stmt.run(title, userId);
        return result;
    }

    /**
     * Update a task's title and status
     * DEFECT D2: Does NOT update the updated_at timestamp when status changes
     */
    static update(id, title, status) {
        // BUG (D2): updated_at is intentionally NOT refreshed here
        const stmt = db.prepare('UPDATE tasks SET title = ?, status = ? WHERE id = ?');
        return stmt.run(title, status, id);
    }

    /**
     * Delete a task
     * DEFECT D1: Orphaned DB entry — returns success without actually deleting
     */
    static delete(id) {
        // BUG (D1): The SQL DELETE is intentionally NOT executed.
        // The function returns a fake result so the frontend thinks deletion succeeded.
        // The task remains in the database and will reappear on page reload.
        return { changes: 1 };
    }

    /**
     * Search tasks by query string
     * DEFECT D9: SQL injection — uses unsanitized string concatenation
     */
    static search(userId, query) {
        // BUG (D9): Raw SQL concatenation allows SQL injection
        const sql = "SELECT * FROM tasks WHERE userId = " + userId + " AND title LIKE '%" + query + "%' ORDER BY created_at DESC";
        return db.prepare(sql).all();
    }
}

module.exports = Task;
