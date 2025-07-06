const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");
const { authenticate } = require("../middleware/auth");
const {
  validateTask,
  validateTaskId,
} = require("../middleware/taskValidation");

// Apply authentication middleware to all routes
router.use(authenticate);

// Task routes
router.post("/", validateTask, taskController.createTask);
router.get("/", taskController.getAllTasks);
router.get("/:taskId", validateTaskId, taskController.getTaskById);
router.put("/:taskId", validateTaskId, validateTask, taskController.updateTask);
router.patch("/:taskId", validateTaskId, taskController.updateTask);
router.delete("/:taskId", validateTaskId, taskController.deleteTask);

// Task subtasks routes
router.get("/:taskId/subtasks", validateTaskId, taskController.getTaskSubtasks);

module.exports = router;
