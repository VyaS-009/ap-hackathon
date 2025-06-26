import express, { Request, Response, RequestHandler } from "express";
import multer from "multer";
import { ChatParser } from "../utils/chat-parser";
import { Message, Group, User } from "../models/schemas";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

const parseHandler: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const { groupName } = req.body;

    if (
      !files.chatFile ||
      !files.membersFile ||
      !files.hierarchyFile ||
      !groupName
    ) {
      res.status(400).json({
        message: "Missing required files or group name",
        details: {
          chatFile: !!files.chatFile,
          membersFile: !!files.membersFile,
          hierarchyFile: !!files.hierarchyFile,
          groupName: !!groupName,
        },
      });
      return;
    }

    const chatFilePath = files.chatFile[0].path;
    const chatOriginalName = files.chatFile[0].originalname;
    const membersFilePath = files.membersFile[0].path;
    const hierarchyFilePath = files.hierarchyFile[0].path;

    console.log(
      `Processing files: chat=${chatFilePath} (original: ${chatOriginalName}), members=${membersFilePath}, hierarchy=${hierarchyFilePath}, groupName=${groupName}`
    );

    const teamMembers = await ChatParser.parseGroupMembers(
      membersFilePath
    ).catch((err) => {
      throw new Error(`Failed to parse group members file: ${err.message}`);
    });

    const hierarchy = await ChatParser.parseHierarchy(hierarchyFilePath).catch(
      (err) => {
        throw new Error(`Failed to parse hierarchy file: ${err.message}`);
      }
    );

    const parser = new ChatParser(
      groupName,
      chatFilePath,
      teamMembers,
      hierarchy
    );
    await parser.process().catch((err) => {
      throw new Error(`Failed to process chat data: ${err.message}`);
    });

    res
      .status(200)
      .json({ message: `Successfully parsed and saved data for ${groupName}` });
  } catch (error: any) {
    console.error("Parse endpoint error:", {
      message: error.message,
      stack: error.stack,
      requestBody: req.body,
      files: Object.keys(req.files || {}),
      chatOriginalName:
        (req.files as any)?.chatFile?.[0]?.originalname || "unknown",
    });
    res.status(500).json({
      message: "Failed to parse files",
      error: {
        message: error.message,
        stack: error.stack,
      },
    });
  }
};

router.post(
  "/parse",
  upload.fields([
    { name: "chatFile", maxCount: 1 },
    { name: "membersFile", maxCount: 1 },
    { name: "hierarchyFile", maxCount: 1 },
  ]),
  parseHandler
);

router.get("/group/:groupId", async (req, res) => {
  try {
    const messages = await Message.find({ groupId: req.params.groupId })
      .populate("senderId", "user_id name alias")
      .sort({ timestamp: -1 });
    res.status(200).json(messages);
  } catch (error: any) {
    console.error("Fetch messages error:", {
      message: error.message,
      stack: error.stack,
      groupId: req.params.groupId,
    });
    res.status(500).json({
      message: "Failed to fetch messages",
      error: {
        message: error.message,
        stack: error.stack,
      },
    });
  }
});

router.get("/groups", async (req, res) => {
  try {
    const { name } = req.query;
    const query = name ? { name: new RegExp(name as string, "i") } : {};
    const groups = await Group.find(query).populate(
      "members",
      "user_id name alias"
    );
    res.status(200).json(groups);
  } catch (error: any) {
    console.error("Fetch groups error:", {
      message: error.message,
      stack: error.stack,
      query: req.query,
    });
    res.status(500).json({
      message: "Failed to fetch groups",
      error: {
        message: error.message,
        stack: error.stack,
      },
    });
  }
});

router.get("/user/:userId", async (req, res) => {
  try {
    const user = await User.findOne({ user_id: req.params.userId })
      .populate("reporting_to", "user_id name alias")
      .populate("group_memberships", "name")
      .populate("roles", "name");
    if (!user) {
      res
        .status(404)
        .json({ message: `User with user_id ${req.params.userId} not found` });
      return;
    }
    res.status(200).json(user);
  } catch (error: any) {
    console.error("Fetch user error:", {
      message: error.message,
      stack: error.stack,
      userId: req.params.userId,
    });
    res.status(500).json({
      message: "Failed to fetch user",
      error: {
        message: error.message,
        stack: error.stack,
      },
    });
  }
});

export default router;
