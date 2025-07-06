const validator = require("validator");
const mongoose = require("mongoose");

// Validate task creation and updates
exports.validateTask = (req, res, next) => {
  const { title, priority, status, deadline, creator } = req.body;
  const errors = [];

  // Required fields
  if (!title || validator.isEmpty(title.trim())) {
    errors.push("Title is required");
  }

  // Validate priority if provided
  if (priority && !["low", "medium", "high"].includes(priority)) {
    errors.push("Priority must be low, medium, or high");
  }

  // Validate status if provided
  if (
    status &&
    !["pending", "in-progress", "completed", "overdue"].includes(status)
  ) {
    errors.push("Status must be pending, in-progress, completed, or overdue");
  }

  // Validate deadline if provided
  if (deadline && !validator.isISO8601(deadline)) {
    errors.push("Deadline must be a valid date");
  }

  // Validate creator if provided
  if (creator && !mongoose.Types.ObjectId.isValid(creator)) {
    errors.push("Creator must be a valid ID");
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  next();
};

// Validate task ID
exports.validateTaskId = (req, res, next) => {
  const { taskId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(taskId)) {
    return res.status(400).json({
      success: false,
      error: "Invalid task ID format",
    });
  }

  next();
};

// Validate user task creation and updates
exports.validateUserTask = (req, res, next) => {
  const { baseTask, assignedTo, status, deadline } = req.body;
  const errors = [];

  // Required fields
  if (!baseTask || !mongoose.Types.ObjectId.isValid(baseTask)) {
    errors.push("Valid base task ID is required");
  }

  if (!assignedTo || !mongoose.Types.ObjectId.isValid(assignedTo)) {
    errors.push("Valid assignedTo user ID is required");
  }

  // Validate status if provided
  if (
    status &&
    !["pending", "in-progress", "completed", "overdue"].includes(status)
  ) {
    errors.push("Status must be pending, in-progress, completed, or overdue");
  }

  // Validate deadline if provided
  if (deadline && !validator.isISO8601(deadline)) {
    errors.push("Deadline must be a valid date");
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  next();
};

// Validate user task ID
exports.validateUserTaskId = (req, res, next) => {
  const { userTaskId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userTaskId)) {
    return res.status(400).json({
      success: false,
      error: "Invalid user task ID format",
    });
  }

  next();
};

// Validate subtask creation and updates
exports.validateSubTask = (req, res, next) => {
  const { title, status, deadline } = req.body;
  const errors = [];

  // Required fields
  if (!title || validator.isEmpty(title.trim())) {
    errors.push("Title is required");
  }

  // Validate status if provided
  if (
    status &&
    !["pending", "in-progress", "completed", "overdue"].includes(status)
  ) {
    errors.push("Status must be pending, in-progress, completed, or overdue");
  }

  // Validate deadline if provided
  if (deadline && !validator.isISO8601(deadline)) {
    errors.push("Deadline must be a valid date");
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  next();
};

// Validate subtask ID
exports.validateSubTaskId = (req, res, next) => {
  const { subTaskId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(subTaskId)) {
    return res.status(400).json({
      success: false,
      error: "Invalid subtask ID format",
    });
  }

  next();
};
