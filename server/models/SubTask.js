const mongoose = require("mongoose");

const SubTask = new mongoose.Schema(
  {
    title: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed", "overdue"],
      default: "pending",
    },
    attachments: [String],
    deadline: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("SubTask", SubTask);