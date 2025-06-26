import express from "express";
import { ChatParser } from "../utils/chat-parser";
import { Message, User, Group } from "../models/schemas";

const router = express.Router();

// Parse and store chat data
router.post("/parse", async (req, res) => {
  try {
    const { filePath, groupName, teamMembers, hierarchy, rules } = req.body;
    const parser = new ChatParser(groupName, teamMembers, hierarchy, rules);
    await parser.process(filePath);
    res
      .status(200)
      .json({ message: `Successfully parsed and saved data for ${groupName}` });
  } catch (error) {
    console.error("Parse error:", error);
    res.status(500).json({ message: "Failed to parse chat data", error });
  }
});

// Get messages for a group
router.get("/group/:groupId", async (req, res) => {
  try {
    const messages = await Message.find({ groupId: req.params.groupId })
      .populate("senderId", "name alias")
      .sort({ timestamp: -1 });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch messages", error });
  }
});

export default router;
