const mongoose = require("mongoose");

const userTask = new mongoose.Schema(
  {
    baseTask: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "in-progress", "completed", "overdue"],
      default: "pending",
    },

    // User-specific subtasks
    subtasks: [{ type: mongoose.Schema.Types.ObjectId, ref: "SubTask" }],

    deadline: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserTask", userTask);
