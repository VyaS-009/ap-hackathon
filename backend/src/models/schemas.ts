import mongoose, { Schema, Document } from "mongoose";

// Interface for Message
export interface IMessage extends Document {
  groupId: mongoose.Types.ObjectId;
  senderAlias: string;
  senderId?: mongoose.Types.ObjectId; // Links to User
  message: string;
  timestamp: Date;
  language: string; // e.g., "en" for English, "te" for Telugu
  isMedia: boolean; // Flag for media messages
}

// Interface for User
export interface IUser extends Document {
  name: string;
  role: string;
  phone?: string;
  alias: string;
  groupIds: mongoose.Types.ObjectId[];
  reportingTo?: mongoose.Types.ObjectId; // Links to User
  rules?: {
    summarizeKeywords: string[];
    prioritize: "high" | "medium" | "low";
  };
}

// Interface for Group
export interface IGroup extends Document {
  name: string;
  members: mongoose.Types.ObjectId[]; // Links to User
}

// Message Schema
const MessageSchema: Schema = new Schema(
  {
    groupId: { type: Schema.Types.ObjectId, ref: "Group", required: true },
    senderAlias: { type: String, required: true },
    senderId: { type: Schema.Types.ObjectId, ref: "User" },
    message: { type: String, required: true },
    timestamp: { type: Date, required: true },
    language: { type: String, default: "en" },
    isMedia: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// User Schema
const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    role: { type: String, required: true },
    phone: { type: String },
    alias: { type: String, required: true },
    groupIds: [{ type: Schema.Types.ObjectId, ref: "Group" }],
    reportingTo: { type: Schema.Types.ObjectId, ref: "User" },
    rules: {
      summarizeKeywords: [{ type: String }],
      prioritize: {
        type: String,
        enum: ["high", "medium", "low"],
        default: "medium",
      },
    },
  },
  { timestamps: true }
);

// Group Schema
const GroupSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    members: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

export const Message = mongoose.model<IMessage>("Message", MessageSchema);
export const User = mongoose.model<IUser>("User", UserSchema);
export const Group = mongoose.model<IGroup>("Group", GroupSchema);
