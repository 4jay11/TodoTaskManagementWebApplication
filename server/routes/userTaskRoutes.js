const express = require("express");
const router = express.Router();
const userTaskController = require("../controllers/userTaskController");
const { authenticate } = require("../middleware/auth");
const {
  validateUserTask,
  validateUserTaskId,
  validateSubTask,
} = require("../middleware/taskValidation");

// Apply authentication middleware to all routes
router.use(authenticate);

// User task routes
router.post("/", validateUserTask, userTaskController.createUserTask);
router.get("/", userTaskController.getAllUserTasks);
router.get(
  "/:userTaskId",
  validateUserTaskId,
  userTaskController.getUserTaskById
);
router.put(
  "/:userTaskId",
  validateUserTaskId,
  validateUserTask,
  userTaskController.updateUserTask
);
router.patch(
  "/:userTaskId",
  validateUserTaskId,
  userTaskController.updateUserTask
);
router.delete(
  "/:userTaskId",
  validateUserTaskId,
  userTaskController.deleteUserTask
);

// User task subtasks routes
router.get(
  "/:userTaskId/subtasks",
  validateUserTaskId,
  userTaskController.getSubtasks
);
router.post(
  "/:userTaskId/subtasks",
  validateUserTaskId,
  validateSubTask,
  userTaskController.addSubtask
);

module.exports = router;
