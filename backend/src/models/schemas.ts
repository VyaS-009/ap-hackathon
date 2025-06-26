import mongoose, { Schema, Document, model, Model } from "mongoose";

export interface IRole extends Document {
  name: string;
}

export interface IUser extends Document {
  user_id: string;
  name: string;
  phone?: string;
  alias: string;
  reporting_to?: mongoose.Types.ObjectId;
  group_memberships: mongoose.Types.ObjectId[];
  roles?: mongoose.Types.ObjectId;
  summaries?: mongoose.Types.ObjectId;
  tasks?: mongoose.Types.ObjectId;
  rules?: mongoose.Types.ObjectId;
}

export interface IGroup extends Document {
  name: string;
  members: mongoose.Types.ObjectId[];
}

export interface IMessage extends Document {
  groupId: mongoose.Types.ObjectId;
  senderAlias: string;
  senderId?: mongoose.Types.ObjectId;
  message: string;
  timestamp?: Date;
  isMedia: boolean;
}

export const roleSchema = new mongoose.Schema<IRole>(
  {
    name: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

export const userSchema = new mongoose.Schema<IUser>(
  {
    user_id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    phone: { type: String },
    alias: { type: String, required: true },
    reporting_to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    group_memberships: [{ type: mongoose.Schema.Types.ObjectId, ref: "Group" }],
    roles: { type: mongoose.Schema.Types.ObjectId, ref: "Role", default: null },
    summaries: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Summary",
      default: null,
    },
    tasks: { type: mongoose.Schema.Types.ObjectId, ref: "Task", default: null },
    rules: { type: mongoose.Schema.Types.ObjectId, ref: "Rule", default: null },
  },
  { timestamps: true, strict: "throw", strictQuery: true }
);

export const groupSchema = new mongoose.Schema<IGroup>(
  {
    name: { type: String, required: true, unique: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

export const messageSchema = new mongoose.Schema<IMessage>(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },
    senderAlias: { type: String, required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    message: { type: String, required: true },
    timestamp: { type: Date },
    isMedia: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Log schema initialization for debugging
console.log("Initializing Mongoose schemas");

// Define models with existence check to prevent OverwriteModelError
export const Role: Model<IRole> =
  mongoose.models.Role || model<IRole>("Role", roleSchema);
export const User: Model<IUser> =
  mongoose.models.User || model<IUser>("User", userSchema);
export const Group: Model<IGroup> =
  mongoose.models.Group || model<IGroup>("Group", groupSchema);
export const Message: Model<IMessage> =
  mongoose.models.Message || model<IMessage>("Message", messageSchema);
