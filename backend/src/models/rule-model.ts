import mongoose from "mongoose";

const summarizationRuleSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group",
    required: true,
  },
  ruleText: String,
  ruleType: { type: String, enum: ["bullet", "narrative"], default: "bullet" },
  priority: { type: Number, default: 1 },
});

export const SummarizationRule = mongoose.model(
  "SummarizationRule",
  summarizationRuleSchema
);
