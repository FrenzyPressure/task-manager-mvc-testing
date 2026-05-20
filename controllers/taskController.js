const path = require('path');
const Task = require('../models/Task');

const taskController = {
    /**
     * Render the dashboard page
     */
    dashboard(req, res) {
        res.sendFile(path.join(__dirname, '..', 'views', 'dashboard.html'));
    },

    /**
     * Get all tasks for the logged-in user (API)
     */
    getTasks(req, res) {
        try {
            const tasks = Task.getAllByUserId(req.session.userId);
            res.json({ tasks, username: req.session.username });
        } catch (err) {
            res.status(500).json({ error: 'Failed to fetch tasks' });
        }
    },

    /**
     * Create a new task
     */
    createTask(req, res) {
        const { title } = req.body;

        try {
            const result = Task.create(title, req.session.userId);
            const task = Task.getById(result.lastInsertRowid);
            res.json({ success: true, task });
        } catch (err) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    /**
     * Update a task
     */
    updateTask(req, res) {
        const { id } = req.params;
        const { title, status } = req.body;

        try {
            const task = Task.getById(id);
            if (!task || task.userId !== req.session.userId) {
                return res.status(404).json({ error: 'Task not found' });
            }

            Task.update(id, title || task.title, status || task.status);
            const updatedTask = Task.getById(id);
            res.json({ success: true, task: updatedTask });
        } catch (err) {
            res.status(500).json({ error: 'Failed to update task' });
        }
    },

    /**
     * Delete a task
     */
    deleteTask(req, res) {
        const { id } = req.params;

        try {
            const task = Task.getById(id);
            if (!task || task.userId !== req.session.userId) {
                return res.status(404).json({ error: 'Task not found' });
            }

            Task.delete(id);
            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ error: 'Failed to delete task' });
        }
    },

    /**
     * Search tasks
     */
    searchTasks(req, res) {
        const { q } = req.query;

        try {
            const tasks = Task.search(req.session.userId, q || '');
            res.json({ tasks });
        } catch (err) {
            res.status(500).json({ error: 'Search failed' });
        }
    }
};

module.exports = taskController;
