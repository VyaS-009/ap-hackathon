import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  taskText: { type: String, required: true },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  status: {
    type: String,
    enum: ["open", "in progress", "completed"],
    default: "open",
  },
  deadline: Date,
  messageId: String,
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group" },
  completionSignal: String,
});

export const Task = mongoose.model("Task", taskSchema);
