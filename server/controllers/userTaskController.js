// controllers/userTaskController.js
const UserTask = require("../models/UserTask");
const Task = require("../models/Task");
const SubTask = require("../models/SubTask");
const User = require("../models/User");
const mongoose = require("mongoose");

/**
 * Create a user task
 * @route POST /api/usertasks
 * @access Private
 */
exports.createUserTask = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { baseTask, assignedTo, subtasks = [], deadline } = req.body;

    // Check if base task exists
    const task = await Task.findById(baseTask);
    if (!task) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: "Base task not found",
      });
    }

    // Check if user has permission to create user tasks for this task
    if (
      req.user &&
      req.user.role !== "admin" &&
      !task.creator.equals(req.user._id)
    ) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({
        success: false,
        message: "You don't have permission to create user tasks for this task",
      });
    }

    // Check if assigned user exists
    const assignedUser = await User.findById(assignedTo);
    if (!assignedUser) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: "Assigned user not found",
      });
    }

    // Create user task with session
    const userTask = new UserTask({
      baseTask,
      assignedTo,
      subtasks,
      deadline: deadline || task.deadline,
    });

    await userTask.save({ session });

    // Link UserTask to Task
    await Task.findByIdAndUpdate(
      baseTask,
      { $push: { userTasks: userTask._id, assignedMembers: assignedTo } },
      { session, new: true }
    );

    await session.commitTransaction();
    session.endSession();

    // Populate response data
    const populatedUserTask = await UserTask.findById(userTask._id)
      .populate("assignedTo", "name email")
      .populate("baseTask", "title description");

    res.status(201).json({
      success: true,
      data: populatedUserTask,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error("Create user task error:", error);

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
      message: "Server error while creating user task",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Get all user tasks
 * @route GET /api/usertasks
 * @access Private
 */
exports.getAllUserTasks = async (req, res) => {
  try {
    const filter = {};

    // If user is not admin, only show tasks assigned to them or created by them
    if (req.user && req.user.role !== "admin") {
      filter.$or = [
        { assignedTo: req.user._id },
        // Get tasks where user is the creator of the base task
        {
          baseTask: {
            $in: await Task.find({ creator: req.user._id }).distinct("_id"),
          },
        },
      ];
    }

    const userTasks = await UserTask.find(filter)
      .populate("assignedTo", "name email")
      .populate("baseTask", "title description status priority")
      .select("-__v");

    res.status(200).json({
      success: true,
      count: userTasks.length,
      data: userTasks,
    });
  } catch (error) {
    console.error("Get all user tasks error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while retrieving user tasks",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Get user task by ID
 * @route GET /api/usertasks/:userTaskId
 * @access Private
 */
exports.getUserTaskById = async (req, res) => {
  try {
    const userTask = await UserTask.findById(req.params.userTaskId)
      .populate("assignedTo", "name email")
      .populate("baseTask")
      .populate("subtasks")
      .select("-__v");

    if (!userTask) {
      return res.status(404).json({
        success: false,
        message: "User task not found",
      });
    }

    // Check if user has permission to view this user task
    const baseTask = await Task.findById(userTask.baseTask._id);

    if (
      req.user &&
      req.user.role !== "admin" &&
      !userTask.assignedTo._id.equals(req.user._id) &&
      !baseTask.creator.equals(req.user._id)
    ) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to view this user task",
      });
    }

    res.status(200).json({
      success: true,
      data: userTask,
    });
  } catch (error) {
    console.error("Get user task by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while retrieving user task",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Update user task
 * @route PUT /api/usertasks/:userTaskId
 * @access Private
 */
exports.updateUserTask = async (req, res) => {
  try {
    // Check if user task exists
    const existingUserTask = await UserTask.findById(req.params.userTaskId);
    if (!existingUserTask) {
      return res.status(404).json({
        success: false,
        message: "User task not found",
      });
    }

    // Check if user has permission to update
    const baseTask = await Task.findById(existingUserTask.baseTask);
    if (
      req.user &&
      req.user.role !== "admin" &&
      !existingUserTask.assignedTo.equals(req.user._id) &&
      !baseTask.creator.equals(req.user._id)
    ) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to update this user task",
      });
    }

    // Don't allow changing baseTask or assignedTo
    if (
      req.body.baseTask &&
      !existingUserTask.baseTask.equals(req.body.baseTask)
    ) {
      return res.status(400).json({
        success: false,
        message: "Base task cannot be changed",
      });
    }

    if (
      req.body.assignedTo &&
      !existingUserTask.assignedTo.equals(req.body.assignedTo)
    ) {
      return res.status(400).json({
        success: false,
        message: "Assigned user cannot be changed",
      });
    }

    // Update user task with validation
    const userTask = await UserTask.findByIdAndUpdate(
      req.params.userTaskId,
      { $set: req.body },
      { new: true, runValidators: true }
    )
      .populate("assignedTo", "name email")
      .populate("baseTask", "title description");

    res.status(200).json({
      success: true,
      data: userTask,
    });
  } catch (error) {
    console.error("Update user task error:", error);

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
      message: "Server error while updating user task",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Delete user task
 * @route DELETE /api/usertasks/:userTaskId
 * @access Private
 */
exports.deleteUserTask = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Check if user task exists
    const userTask = await UserTask.findById(req.params.userTaskId);
    if (!userTask) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: "User task not found",
      });
    }

    // Check if user has permission to delete
    const baseTask = await Task.findById(userTask.baseTask);
    if (
      req.user &&
      req.user.role !== "admin" &&
      !baseTask.creator.equals(req.user._id)
    ) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({
        success: false,
        message: "You don't have permission to delete this user task",
      });
    }

    // Delete all related subtasks
    if (userTask.subtasks && userTask.subtasks.length > 0) {
      await SubTask.deleteMany(
        { _id: { $in: userTask.subtasks } },
        { session }
      );
    }

    // Remove reference from base task
    await Task.findByIdAndUpdate(
      userTask.baseTask,
      { $pull: { userTasks: userTask._id } },
      { session }
    );

    // Delete the user task
    await UserTask.findByIdAndDelete(req.params.userTaskId, { session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: "User task and related data deleted successfully",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error("Delete user task error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting user task",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Get subtasks of a user task
 * @route GET /api/usertasks/:userTaskId/subtasks
 * @access Private
 */
exports.getSubtasks = async (req, res) => {
  try {
    const userTask = await UserTask.findById(req.params.userTaskId)
      .populate("subtasks")
      .select("subtasks");

    if (!userTask) {
      return res.status(404).json({
        success: false,
        message: "User task not found",
      });
    }

    // Check if user has permission to view subtasks
    const baseTask = await Task.findById(userTask.baseTask);
    if (
      req.user &&
      req.user.role !== "admin" &&
      !userTask.assignedTo.equals(req.user._id) &&
      !baseTask.creator.equals(req.user._id)
    ) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to view these subtasks",
      });
    }

    res.status(200).json({
      success: true,
      count: userTask.subtasks.length,
      data: userTask.subtasks,
    });
  } catch (error) {
    console.error("Get subtasks error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while retrieving subtasks",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Add a subtask to a user task
 * @route POST /api/user-tasks/:userTaskId/subtasks
 * @access Private
 */
exports.addSubtask = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { title, status, deadline, attachments } = req.body;
    const { userTaskId } = req.params;

    // Check if user task exists
    const userTask = await UserTask.findById(userTaskId);
    if (!userTask) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: "User task not found",
      });
    }

    // Get the base task
    const baseTask = await Task.findById(userTask.baseTask);
    if (!baseTask) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: "Base task not found",
      });
    }

    // Check if user has permission to add subtasks
    // Either the user is the creator of the base task or the assigned user
    if (
      req.user &&
      req.user.role !== "admin" &&
      !baseTask.creator.equals(req.user._id) &&
      !userTask.assignedTo.equals(req.user._id)
    ) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({
        success: false,
        message: "You don't have permission to add subtasks to this user task",
      });
    }

    // Create the subtask
    const subtask = new SubTask({
      title,
      status: status || "pending",
      deadline: deadline || userTask.deadline,
      attachments: attachments || [],
    });

    await subtask.save({ session });

    // Add subtask to user task
    await UserTask.findByIdAndUpdate(
      userTaskId,
      { $push: { subtasks: subtask._id } },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    // Return the populated subtask
    const populatedSubtask = await SubTask.findById(subtask._id);

    res.status(201).json({
      success: true,
      data: populatedSubtask,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error("Add subtask error:", error);

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
      message: "Server error while adding subtask",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
