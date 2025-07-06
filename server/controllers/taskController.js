// controllers/taskController.js
const Task = require("../models/Task");
const SubTask = require("../models/SubTask");
const UserTask = require("../models/UserTask");
const mongoose = require("mongoose");

/**
 * Create a new task
 * @route POST /api/tasks
 * @access Private
 */
exports.createTask = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      title,
      description,
      priority,
      status,
      deadline,
      assignedMembers = [],
      subtasks,
      attachments,
      memberTaskMap,
    } = req.body;

    if (!req.user) {
      await session.abortTransaction();
      session.endSession();
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // If no assigned members, assign the creator
    const finalAssignedMembers =
      assignedMembers.length === 0 ? [req.user._id] : assignedMembers;

    const task = new Task({
      title,
      description,
      priority,
      status,
      deadline,
      creator: req.user._id,
      assignedMembers: finalAssignedMembers,
      subtasks: [],
      attachments: attachments || [],
    });

    await task.save({ session });

    // Create global subtasks
    if (Array.isArray(subtasks) && subtasks.length > 0) {
      const createdSubtasks = [];

      for (const subtask of subtasks) {
        const st = new SubTask({
          title: subtask.title,
          status: subtask.status || "pending",
          deadline: subtask.deadline || deadline,
          attachments: subtask.attachments || [],
        });

        await st.save({ session });
        createdSubtasks.push(st._id);
      }

      task.subtasks = createdSubtasks;
      await task.save({ session });
    }

    // Create UserTasks
    const userTaskIds = [];

    for (const memberId of finalAssignedMembers) {
      const memberData = memberTaskMap?.[memberId] || {
        tasks: [],
        attachments: [],
      };
      const subtaskIds = [];

      for (const title of memberData.tasks || []) {
        const subtask = new SubTask({
          title,
          status: "pending",
          deadline,
          attachments: [],
        });

        await subtask.save({ session });
        subtaskIds.push(subtask._id);
      }

      for (const url of memberData.attachments || []) {
        const subtask = new SubTask({
          title: "Attachment",
          status: "pending",
          deadline,
          attachments: [url],
        });

        await subtask.save({ session });
        subtaskIds.push(subtask._id);
      }

      const userTask = new UserTask({
        baseTask: task._id,
        assignedTo: memberId,
        status: "pending",
        deadline,
        subtasks: subtaskIds,
      });

      await userTask.save({ session });
      userTaskIds.push(userTask._id);
    }

    task.userTasks = userTaskIds;
    await task.save({ session });

    await session.commitTransaction();
    session.endSession();

    const populatedTask = await Task.findById(task._id)
      .populate("creator", "name email")
      .populate("assignedMembers", "name email")
      .populate("subtasks")
      .populate({
        path: "userTasks",
        select: "-__v",
        populate: {
          path: "assignedTo",
          select: "name email",
        },
      });

    return res.status(201).json({
      success: true,
      data: populatedTask,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Create task error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while creating task",
    });
  }
};


/**
 * Get all tasks
 * @route GET /api/tasks
 * @access Private
 */
exports.getAllTasks = async (req, res) => {
  try {
    // Filter by creator if specified
    const filter = {};

    // If user is not admin, only show their tasks or tasks assigned to them
    if (req.user && req.user.role !== "admin") {
      filter.$or = [
        { creator: req.user._id },
        { assignedMembers: req.user._id },
      ];
    }

    const tasks = await Task.find(filter)
      .populate("creator", "name email")
      .populate("assignedMembers", "name email")
      .select("-__v");

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    console.error("Get all tasks error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while retrieving tasks",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Get a task by ID
 * @route GET /api/tasks/:taskId
 * @access Private
 */
exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId)
      .populate("creator", "name email")
      .populate("assignedMembers", "name email")
      .populate({
        path: "userTasks",
        select: "-__v",
        populate: {
          path: "assignedTo",
          select: "name email",
        },
      })
      .populate("subtasks")
      .select("-__v");

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Check if user has access to this task
    if (
      req.user &&
      req.user.role !== "admin" &&
      !task.creator.equals(req.user._id) &&
      !task.assignedMembers.some((member) => member._id.equals(req.user._id))
    ) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to access this task",
      });
    }

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    console.error("Get task by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while retrieving task",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Update a task
 * @route PUT /api/tasks/:taskId
 * @access Private
 */
exports.updateTask = async (req, res) => {
  try {
    // First check if task exists
    const existingTask = await Task.findById(req.params.taskId);

    if (!existingTask) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Check if user has permission to update (creator or admin)
    if (
      req.user &&
      req.user.role !== "admin" &&
      !existingTask.creator.equals(req.user._id)
    ) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to update this task",
      });
    }

    // Don't allow changing creator
    if (req.body.creator && !existingTask.creator.equals(req.body.creator)) {
      return res.status(400).json({
        success: false,
        message: "Task creator cannot be changed",
      });
    }

    // Update task with validation
    const task = await Task.findByIdAndUpdate(
      req.params.taskId,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    console.error("Update task error:", error);

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
      message: "Server error while updating task",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Delete a task
 * @route DELETE /api/tasks/:taskId
 * @access Private
 */
exports.deleteTask = async (req, res) => {
  try {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // First check if task exists
      const task = await Task.findById(req.params.taskId);

      if (!task) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({
          success: false,
          message: "Task not found",
        });
      }

      // Check if user has permission to delete (creator or admin)
      if (
        req.user &&
        req.user.role !== "admin" &&
        !task.creator.equals(req.user._id)
      ) {
        await session.abortTransaction();
        session.endSession();
        return res.status(403).json({
          success: false,
          message: "You don't have permission to delete this task",
        });
      }

      // Delete all related user tasks
      if (task.userTasks && task.userTasks.length > 0) {
        await UserTask.deleteMany(
          { _id: { $in: task.userTasks } },
          { session }
        );
      }

      // Delete all related subtasks
      if (task.subtasks && task.subtasks.length > 0) {
        await SubTask.deleteMany({ _id: { $in: task.subtasks } }, { session });
      }

      // Delete the task itself
      await Task.findByIdAndDelete(req.params.taskId, { session });

      await session.commitTransaction();
      session.endSession();

      res.status(200).json({
        success: true,
        message: "Task and all related data deleted successfully",
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } catch (error) {
    console.error("Delete task error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting task",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Get all subtasks of a task
 * @route GET /api/tasks/:taskId/subtasks
 * @access Private
 */
exports.getTaskSubtasks = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId).populate({
      path: "subtasks",
      select: "-__v",
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Check if user has access to this task
    if (
      req.user &&
      req.user.role !== "admin" &&
      !task.creator.equals(req.user._id) &&
      !task.assignedMembers.some((member) => member.equals(req.user._id))
    ) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to access this task's subtasks",
      });
    }

    res.status(200).json({
      success: true,
      count: task.subtasks.length,
      data: task.subtasks,
    });
  } catch (error) {
    console.error("Get task subtasks error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while retrieving subtasks",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
