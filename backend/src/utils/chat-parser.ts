import fs from "fs/promises";
import { parse } from "csv-parse/sync";
import mongoose, { HydratedDocument } from "mongoose";
import { franc } from "franc-min";
import {
  Message,
  User,
  Group,
  IMessage,
  IUser,
  IGroup,
} from "../models/schemas";

// Interface for parsed message
interface ParsedMessage {
  timestamp: Date;
  senderAlias: string;
  message: string;
  isMedia: boolean;
  language: string;
}

// Interface for team member
interface TeamMember {
  name: string;
  role: string;
  phone?: string;
  alias: string;
}

// Interface for organizational hierarchy
interface Hierarchy {
  userId: string;
  reportingTo?: string;
}

// Interface for summarization rules
export interface Rule {
  userId: string;
  summarizeKeywords: string[];
  prioritize: "high" | "medium" | "low";
}

export class ChatParser {
  private groupName: string;
  private teamMembers: TeamMember[];
  private hierarchy: Hierarchy[];
  private rules: Rule[];
  private groupId: mongoose.Types.ObjectId | null = null;

  constructor(
    groupName: string,
    teamMembers: TeamMember[],
    hierarchy: Hierarchy[],
    rules: Rule[]
  ) {
    this.groupName = groupName;
    this.teamMembers = teamMembers;
    this.hierarchy = hierarchy;
    this.rules = rules;
  }

  // Parse chat data based on file extension
  async parseChatData(filePath: string): Promise<ParsedMessage[]> {
    const ext = filePath.split(".").pop()?.toLowerCase();
    const content = await fs.readFile(filePath, "utf-8");

    if (ext === "txt") {
      return this.parseTxtChat(content);
    } else if (ext === "csv") {
      return this.parseCsvChat(content);
    } else if (ext === "json") {
      return this.parseJsonChat(content);
    } else {
      throw new Error("Unsupported file format");
    }
  }

  // Parse WhatsApp .txt chat (format: MM/DD/YY, HH:MM - Alias: Message)
  private parseTxtChat(content: string): ParsedMessage[] {
    const messages: ParsedMessage[] = [];
    const lines = content.split("\n");
    const regex =
      /^(\d{1,2}\/\d{1,2}\/\d{2,4}, \d{1,2}:\d{2})\s*-\s*([^:]+):\s*(.+)$/;

    for (const line of lines) {
      const match = line.match(regex);
      if (match) {
        const [_, timestampStr, alias, message] = match;
        const timestamp = new Date(timestampStr);
        if (isNaN(timestamp.getTime())) continue;

        const isMedia = message.includes("<Media omitted>");
        const language = this.detectLanguage(message);

        messages.push({
          timestamp,
          senderAlias: alias.trim(),
          message: message.trim(),
          isMedia,
          language,
        });
      }
    }
    return messages;
  }

  // Parse CSV chat (format: timestamp,senderAlias,message)
  private parseCsvChat(content: string): ParsedMessage[] {
    const messages: ParsedMessage[] = [];
    const records = parse(content, { columns: true, skip_empty_lines: true });

    for (const record of records) {
      const timestamp = new Date(record.timestamp);
      if (isNaN(timestamp.getTime())) continue;

      const isMedia = record.message.includes("<Media omitted>");
      const language = this.detectLanguage(record.message);

      messages.push({
        timestamp,
        senderAlias: record.senderAlias.trim(),
        message: record.message.trim(),
        isMedia,
        language,
      });
    }
    return messages;
  }

  // Parse JSON chat (format: [{timestamp, senderAlias, message}])
  private parseJsonChat(content: string): ParsedMessage[] {
    const messages: ParsedMessage[] = [];
    const data = JSON.parse(content);

    for (const msg of data) {
      const timestamp = new Date(msg.timestamp);
      if (isNaN(timestamp.getTime())) continue;

      const isMedia = msg.message.includes("<Media omitted>");
      const language = this.detectLanguage(msg.message);

      messages.push({
        timestamp,
        senderAlias: msg.senderAlias.trim(),
        message: msg.message.trim(),
        isMedia,
        language,
      });
    }
    return messages;
  }

  // Detect language (English or Telugu)
  private detectLanguage(message: string): string {
    if (message.includes("<Media omitted>")) return "unknown";
    const lang = franc(message, { only: ["eng", "tel"] });
    return lang === "eng" ? "en" : lang === "tel" ? "te" : "en"; // Default to English
  }

  // Map alias to userId
  private getUserIdByAlias(alias: string): string | undefined {
    const member = this.teamMembers.find(
      (m) => m.alias.toLowerCase() === alias.toLowerCase()
    );
    return member ? member.name : undefined; // Use name as temporary ID
  }

  // Save team members, hierarchy, and rules to MongoDB
  async saveMetadata(): Promise<void> {
    // Save Group
    const group: HydratedDocument<IGroup> | null = await Group.findOneAndUpdate(
      { name: this.groupName },
      { name: this.groupName, members: [] },
      { upsert: true, new: true }
    );
    if (!group) throw new Error("Failed to create or find group");
    this.groupId = group._id as mongoose.Types.ObjectId;

    // Save Users
    const userDocs: HydratedDocument<IUser>[] = [];
    for (const member of this.teamMembers) {
      const rule = this.rules.find((r) => r.userId === member.name);
      const user = await User.findOneAndUpdate(
        { name: member.name },
        {
          name: member.name,
          role: member.role,
          phone: member.phone,
          alias: member.alias,
          groupIds: [this.groupId],
          rules: rule
            ? {
                summarizeKeywords: rule.summarizeKeywords,
                prioritize: rule.prioritize,
              }
            : undefined,
        },
        { upsert: true, new: true }
      );
      userDocs.push(user);
    }

    // Update Group with members
    await Group.findByIdAndUpdate(this.groupId, {
      $set: { members: userDocs.map((u) => u._id) },
    });

    // Save Hierarchy
    for (const h of this.hierarchy) {
      const user = userDocs.find((u) => u.name === h.userId);
      const reportingTo = userDocs.find((u) => u.name === h.reportingTo);
      if (user) {
        await User.findByIdAndUpdate(user._id, {
          $set: { reportingTo: reportingTo?._id },
        });
      }
    }
  }

  // Save parsed messages to MongoDB
  async saveMessages(messages: ParsedMessage[]): Promise<void> {
    if (!this.groupId) throw new Error("Group not initialized");

    const messageDocs: HydratedDocument<IMessage>[] = [];
    for (const msg of messages) {
      const sender = await User.findOne({ alias: msg.senderAlias });
      messageDocs.push(
        new Message({
          groupId: this.groupId,
          senderAlias: msg.senderAlias,
          senderId: sender?._id,
          message: msg.message,
          timestamp: msg.timestamp,
          language: msg.language,
          isMedia: msg.isMedia,
        })
      );
    }
    await Message.insertMany(messageDocs);
  }

  // Main method to process everything
  async process(filePath: string): Promise<void> {
    await this.saveMetadata();
    const messages = await this.parseChatData(filePath);
    await this.saveMessages(messages);
    console.log(
      `Parsed and saved ${messages.length} messages for group ${this.groupName}`
    );
  }
}
