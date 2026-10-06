const Task = require('../models/Task');

// @desc    Get all tasks (with optional status filter and search)
// @route   GET /api/tasks
// @access  Public
const getTasks = async (req, res, next) => {
  try {
    const { status, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const query = {};

    // Filter by status if provided and not 'all'
    if (status && status !== 'all') {
      if (status === 'completed') {
        query.status = 'completed';
      } else if (status === 'pending') {
        query.status = 'pending';
      } else if (status === 'in-progress') {
        query.status = 'in-progress';
      }
    }

    // Optional text search in title or description
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ title: searchRegex }, { description: searchRegex }];
    }

    // Sorting
    const sortField = ['createdAt', 'dueDate', 'priority', 'title'].includes(sortBy)
      ? sortBy
      : 'createdAt';
    const sortDirection = sortOrder === 'asc' ? 1 : -1;

    const tasks = await Task.find(query).sort({ [sortField]: sortDirection });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single task by ID
// @route   GET /api/tasks/:id
// @access  Public
const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: `Task with id '${req.params.id}' not found`,
      });
    }

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Public
const createTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, dueDate, completed } = req.body;

    const taskData = {
      title: title.trim(),
      description: description ? description.trim() : '',
      priority: priority || 'medium',
      dueDate: dueDate || null,
    };

    if (completed !== undefined) {
      taskData.completed = completed;
      taskData.status = completed ? 'completed' : 'pending';
    }

    if (status) {
      taskData.status = status;
      taskData.completed = status === 'completed';
    }

    const newTask = await Task.create(taskData);

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: newTask,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an existing task
// @route   PUT /api/tasks/:id
// @access  Public
const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: `Task with id '${req.params.id}' not found`,
      });
    }

    const { title, description, status, priority, dueDate, completed } = req.body;

    if (title !== undefined) task.title = title.trim();
    if (description !== undefined) task.description = description.trim();
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate;

    if (completed !== undefined) {
      task.completed = completed;
      task.status = completed ? 'completed' : (task.status === 'completed' ? 'pending' : task.status);
    }

    if (status !== undefined) {
      task.status = status;
      task.completed = status === 'completed';
    }

    const updatedTask = await task.save();

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: updatedTask,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Public
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: `Task with id '${req.params.id}' not found`,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
};

