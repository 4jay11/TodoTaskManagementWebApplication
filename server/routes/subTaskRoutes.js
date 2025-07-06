const express = require("express");
const router = express.Router();
const subTaskController = require("../controllers/subTaskController");
const { authenticate } = require("../middleware/auth");
const {
  validateSubTask,
  validateSubTaskId,
} = require("../middleware/taskValidation");

// Apply authentication middleware to all routes
router.use(authenticate);

// Add route for creating subtasks
router.post("/", validateSubTask, subTaskController.createSubTask);

// Only keep the necessary routes for subtasks
// We don't need direct creation as subtasks are created through tasks or user tasks
router.get("/:subTaskId", validateSubTaskId, subTaskController.getSubTaskById);
router.put(
  "/:subTaskId",
  validateSubTaskId,
  validateSubTask,
  subTaskController.updateSubTask
);
router.patch(
  "/:subTaskId/:status",
  validateSubTaskId,
  subTaskController.updateSubTask
);
router.delete(
  "/:subTaskId",
  validateSubTaskId,
  subTaskController.deleteSubTask
);

module.exports = router;
