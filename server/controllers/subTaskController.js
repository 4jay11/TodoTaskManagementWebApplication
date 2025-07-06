// controllers/subTaskController.js
const SubTask = require("../models/SubTask");
const UserTask = require("../models/UserTask");
const Task = require("../models/Task");
const mongoose = require("mongoose");

/**
 * Get a subtask by ID
 * @route GET /api/subtasks/:subTaskId
 * @access Private
 */
exports.getSubTaskById = async (req, res) => {
  try {
    const subtask = await SubTask.findById(req.params.subTaskId);
    if (!subtask) {
      return res.status(404).json({
        success: false,
        message: "Subtask not found",
      });
    }

    // Check if user has permission to view this subtask
    // Find the user task or task that contains this subtask
    const userTask = await UserTask.findOne({ subtasks: req.params.subTaskId });
    const task = await Task.findOne({ subtasks: req.params.subTaskId });

    // Verify permissions
    if (req.user && req.user.role !== "admin") {
      if (userTask) {
        // Check if user is assigned to this user task or is the creator of the base task
        const baseTask = await Task.findById(userTask.baseTask);
        if (
          !userTask.assignedTo.equals(req.user._id) &&
          !baseTask.creator.equals(req.user._id)
        ) {
          return res.status(403).json({
            success: false,
            message: "You don't have permission to view this subtask",
          });
        }
      } else if (task) {
        // Check if user is the creator or assigned to the task
        if (
          !task.creator.equals(req.user._id) &&
          !task.assignedMembers.some((member) => member.equals(req.user._id))
        ) {
          return res.status(403).json({
            success: false,
            message: "You don't have permission to view this subtask",
          });
        }
      } else {
        // Subtask is orphaned or not properly linked
        return res.status(403).json({
          success: false,
          message: "Cannot determine permissions for this subtask",
        });
      }
    }

    res.status(200).json({
      success: true,
      data: subtask,
    });
  } catch (error) {
    console.error("Get subtask by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while retrieving subtask",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Update a subtask
 * @route PUT /api/subtasks/:subTaskId
 * @access Private
 */
exports.updateSubTask = async (req, res) => {
  try {
    const subtaskId = req.params.subTaskId;
    const status = req.params.status;

    console.log(subtaskId, status);

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required in request body",
      });
    }

    // 1. Check if subtask exists
    const existingSubtask = await SubTask.findById(subtaskId);
    if (!existingSubtask) {
      return res
        .status(404)
        .json({ success: false, message: "Subtask not found" });
    }

    // 2. Permission check: Get UserTask or Task
    const userTask = await UserTask.findOne({ subtasks: subtaskId });
    const task = await Task.findOne({ subtasks: subtaskId });

    let hasPermission = false;

    if (userTask) {
      const baseTask = await Task.findById(userTask.baseTask);
      const isAssigned = userTask.assignedTo.equals(req.user._id);
      const isCreator = baseTask && baseTask.creator.equals(req.user._id);
      hasPermission = isAssigned || isCreator;
    } else if (task) {
      const isCreator = task.creator.equals(req.user._id);
      hasPermission = isCreator;
    }

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to update this subtask",
      });
    }

    // 3. Update only the status
    const updatedSubtask = await SubTask.findByIdAndUpdate(
      subtaskId,
      { $set: { status } },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: updatedSubtask,
    });
  } catch (error) {
    console.error("Update subtask error:", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ success: false, errors });
    }

    res.status(500).json({
      success: false,
      message: "Server error while updating subtask",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};



/**
 * Delete a subtask
 * @route DELETE /api/subtasks/:subTaskId
 * @access Private
 */
exports.deleteSubTask = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Check if subtask exists
    const subtask = await SubTask.findById(req.params.subTaskId);
    if (!subtask) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: "Subtask not found",
      });
    }

    // Check if user has permission to delete this subtask
    // Find the user task or task that contains this subtask
    const userTask = await UserTask.findOne({ subtasks: req.params.subTaskId });
    const task = await Task.findOne({ subtasks: req.params.subTaskId });

    // Verify permissions
    if (req.user && req.user.role !== "admin") {
      if (userTask) {
        // Only the creator of the base task can delete subtasks
        const baseTask = await Task.findById(userTask.baseTask);
        if (!baseTask.creator.equals(req.user._id)) {
          await session.abortTransaction();
          session.endSession();
          return res.status(403).json({
            success: false,
            message: "You don't have permission to delete this subtask",
          });
        }
      } else if (task) {
        // Only the creator of the task can delete subtasks
        if (!task.creator.equals(req.user._id)) {
          await session.abortTransaction();
          session.endSession();
          return res.status(403).json({
            success: false,
            message: "You don't have permission to delete this subtask",
          });
        }
      } else {
        // Subtask is orphaned or not properly linked
        await session.abortTransaction();
        session.endSession();
        return res.status(403).json({
          success: false,
          message: "Cannot determine permissions for this subtask",
        });
      }
    }

    // Remove reference from user task if exists
    if (userTask) {
      await UserTask.findByIdAndUpdate(
        userTask._id,
        { $pull: { subtasks: req.params.subTaskId } },
        { session }
      );
    }

    // Remove reference from task if exists
    if (task) {
      await Task.findByIdAndUpdate(
        task._id,
        { $pull: { subtasks: req.params.subTaskId } },
        { session }
      );
    }

    // Delete the subtask
    await SubTask.findByIdAndDelete(req.params.subTaskId, { session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: "Subtask deleted successfully",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error("Delete subtask error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting subtask",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Create a new subtask
 * @route POST /api/subtasks
 * @access Private
 */
exports.createSubTask = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { title, status, deadline, taskId } = req.body;

    if (!taskId) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Task ID is required",
      });
    }

    // Check if task exists
    const task = await Task.findById(taskId);
    if (!task) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Check if user has permission to add subtasks to this task
    if (
      req.user &&
      req.user.role !== "admin" &&
      !task.creator.equals(req.user._id) &&
      !task.assignedMembers.some((member) => member.equals(req.user._id))
    ) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({
        success: false,
        message: "You don't have permission to add subtasks to this task",
      });
    }

    // Create the subtask
    const subtask = new SubTask({
      title,
      status: status || "pending",
      deadline: deadline || task.deadline,
    });

    await subtask.save({ session });

    // Add subtask to the task
    await Task.findByIdAndUpdate(
      taskId,
      { $push: { subtasks: subtask._id } },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      data: subtask,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error("Create subtask error:", error);

    // Handle validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        errors,
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while creating subtask",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
