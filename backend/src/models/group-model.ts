import mongoose from "mongoose";

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  context: String,
  chatLogs: [
    {
      timestamp: Date,
      sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      content: String,
    },
  ],
});

export const Group = mongoose.model("Group", groupSchema);
