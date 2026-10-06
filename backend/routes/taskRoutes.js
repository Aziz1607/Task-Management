const express = require('express');
const router = express.Router();
const {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');
const {
  validateTaskId,
  validateCreateTask,
  validateUpdateTask,
} = require('../middleware/validateTask');

// Routes for /api/tasks
router.route('/')
  .get(getTasks)
  .post(validateCreateTask, createTask);

// Routes for /api/tasks/:id
router.route('/:id')
  .get(validateTaskId, getTaskById)
  .put(validateTaskId, validateUpdateTask, updateTask)
  .delete(validateTaskId, deleteTask);

module.exports = router;

