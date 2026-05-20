const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { requireAuth } = require('../middleware/auth');

// All task routes require authentication
router.get('/dashboard', requireAuth, taskController.dashboard);
router.get('/api/tasks', requireAuth, taskController.getTasks);
router.post('/api/tasks', requireAuth, taskController.createTask);
router.put('/api/tasks/:id', requireAuth, taskController.updateTask);
router.delete('/api/tasks/:id', requireAuth, taskController.deleteTask);
router.get('/api/tasks/search', requireAuth, taskController.searchTasks);

module.exports = router;
