import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rank: String,
  phoneNumber: String,
  email: String,
  role: String,
  reportingTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  groupMemberships: [{ type: mongoose.Schema.Types.ObjectId, ref: "Group" }],
});

export const User = mongoose.model("User", userSchema);
