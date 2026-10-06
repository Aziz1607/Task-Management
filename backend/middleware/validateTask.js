const mongoose = require('mongoose');

const validateTaskId = (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: `Invalid task ID format: '${id}'. Must be a 24-character hexadecimal string.`,
    });
  }
  next();
};

const validateCreateTask = (req, res, next) => {
  const { title, status, priority, dueDate } = req.body;
  const errors = [];

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    errors.push('Title is required and must not be empty');
  } else if (title.trim().length > 150) {
    errors.push('Title must be at most 150 characters');
  }

  const validStatuses = ['pending', 'in-progress', 'completed'];
  if (status && !validStatuses.includes(status)) {
    errors.push(`Invalid status. Allowed values: ${validStatuses.join(', ')}`);
  }

  const validPriorities = ['low', 'medium', 'high'];
  if (priority && !validPriorities.includes(priority)) {
    errors.push(`Invalid priority. Allowed values: ${validPriorities.join(', ')}`);
  }

  if (dueDate && isNaN(Date.parse(dueDate))) {
    errors.push('Due date must be a valid ISO date string');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  next();
};

const validateUpdateTask = (req, res, next) => {
  const { title, status, priority, dueDate, completed } = req.body;
  const errors = [];

  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim().length === 0) {
      errors.push('Title must not be empty');
    } else if (title.trim().length > 150) {
      errors.push('Title must be at most 150 characters');
    }
  }

  const validStatuses = ['pending', 'in-progress', 'completed'];
  if (status !== undefined && !validStatuses.includes(status)) {
    errors.push(`Invalid status. Allowed values: ${validStatuses.join(', ')}`);
  }

  const validPriorities = ['low', 'medium', 'high'];
  if (priority !== undefined && !validPriorities.includes(priority)) {
    errors.push(`Invalid priority. Allowed values: ${validPriorities.join(', ')}`);
  }

  if (dueDate !== undefined && dueDate !== null && isNaN(Date.parse(dueDate))) {
    errors.push('Due date must be a valid date');
  }

  if (completed !== undefined && typeof completed !== 'boolean') {
    errors.push('Completed must be a boolean');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  next();
};

module.exports = {
  validateTaskId,
  validateCreateTask,
  validateUpdateTask,
};

