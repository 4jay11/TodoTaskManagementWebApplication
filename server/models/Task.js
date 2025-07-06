  const mongoose = require("mongoose");

  const Task = new mongoose.Schema(
    {
      title: { type: String, required: true },
      description: String,

      priority: {
        type: String,
        enum: ["low", "medium", "high"],
        default: "low",
      },

      status: {
        type: String,
        enum: ["pending", "in-progress", "completed", "overdue"],
        default: "pending",
      },

      deadline: Date,
      subtasks: [{ type: mongoose.Schema.Types.ObjectId, ref: "SubTask" }],
      attachments: [String],

      creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      // Users involved
      assignedMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

      // Points to the UserTask instances
      userTasks: [{ type: mongoose.Schema.Types.ObjectId, ref: "UserTask" }],
    },
    { timestamps: true }
  );

  module.exports = mongoose.model("Task", Task);
