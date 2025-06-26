import fs from "fs/promises";
import { parse } from "csv-parse/sync";
import mongoose, { HydratedDocument } from "mongoose";
import {
  Message,
  User,
  Group,
  Role,
  IMessage,
  IUser,
  IGroup,
  IRole,
} from "../models/schemas";
import path from "path";

// Interface for parsed message
interface ParsedMessage {
  timestamp?: Date;
  senderAlias: string;
  message: string;
  isMedia: boolean;
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

export class ChatParser {
  private groupName: string;
  private chatFilePath: string;
  private teamMembers: TeamMember[];
  private hierarchy: Hierarchy[];
  private groupId: mongoose.Types.ObjectId | null = null;

  constructor(
    groupName: string,
    chatFilePath: string,
    teamMembers: TeamMember[],
    hierarchy: Hierarchy[]
  ) {
    this.groupName = groupName;
    this.chatFilePath = chatFilePath;
    this.teamMembers = teamMembers;
    this.hierarchy = hierarchy;
    console.log(
      `Initialized ChatParser: groupName=${groupName}, chatFile=${chatFilePath}, membersCount=${teamMembers.length}, hierarchyCount=${hierarchy.length}`
    );
  }

  async parseChatData(): Promise<ParsedMessage[]> {
    try {
      let ext = path.extname(this.chatFilePath).toLowerCase();
      if (!ext) {
        console.warn(
          `No extension detected for chat file: ${this.chatFilePath}. Assuming .txt format.`
        );
        ext = ".txt";
      }
      console.log(`Parsing chat file: ${this.chatFilePath}, extension: ${ext}`);

      if (![".txt", ".csv", ".json"].includes(ext)) {
        throw new Error(
          `Unsupported chat file format: ${ext}. Expected .txt, .csv, or .json`
        );
      }

      const content = await fs
        .readFile(this.chatFilePath, "utf-8")
        .catch((err) => {
          throw new Error(
            `Failed to read chat file ${this.chatFilePath}: ${err.message}`
          );
        });

      if (ext === ".txt") {
        return this.parseTxtChat(content);
      } else if (ext === ".csv") {
        return this.parseCsvChat(content);
      } else if (ext === ".json") {
        return this.parseJsonChat(content);
      } else {
        throw new Error(`Unexpected chat file format: ${ext}`);
      }
    } catch (error: any) {
      console.error("parseChatData error:", {
        message: error.message,
        stack: error.stack,
        filePath: this.chatFilePath,
      });
      throw error;
    }
  }

  private parseTxtChat(content: string): ParsedMessage[] {
    try {
      const messages: ParsedMessage[] = [];
      const lines = content.split("\n");
      const regex =
        /^(\d{1,2}\/\d{1,2}\/\d{2,4}, \d{1,2}:\d{2})\s*-\s*([^:]+):\s*(.+)$/;

      for (const [index, line] of lines.entries()) {
        const match = line.match(regex);
        if (match) {
          const [_, timestampStr, alias, message] = match;
          let timestamp: Date | undefined;
          try {
            timestamp = new Date(timestampStr);
            if (isNaN(timestamp.getTime())) {
              console.warn(`Invalid timestamp in line ${index + 1}: ${line}`);
              timestamp = undefined;
            }
          } catch {
            console.warn(
              `Failed to parse timestamp in line ${index + 1}: ${line}`
            );
            timestamp = undefined;
          }

          const isMedia = message.includes("<Media omitted>");

          messages.push({
            timestamp,
            senderAlias: alias.trim(),
            message: message.trim(),
            isMedia,
          });
        } else {
          // Lenient regex to capture messages without strict timestamp validation
          const lenientRegex = /^(.+?)\s*-\s*([^:]+):\s*(.+)$/;
          const lenientMatch = line.match(lenientRegex);
          if (lenientMatch) {
            const [, , alias, message] = lenientMatch;
            console.warn(
              `Non-standard format in line ${
                index + 1
              }: ${line}. Saving without timestamp.`
            );
            messages.push({
              timestamp: undefined,
              senderAlias: alias.trim(),
              message: message.trim(),
              isMedia: message.includes("<Media omitted>"),
            });
          } else {
            console.warn(`Skipping unparsable line ${index + 1}: ${line}`);
          }
        }
      }
      console.log(`Parsed ${messages.length} messages from txt file`);
      return messages;
    } catch (error: any) {
      console.error("parseTxtChat error:", {
        message: error.message,
        stack: error.stack,
      });
      throw new Error(`Failed to parse txt chat: ${error.message}`);
    }
  }

  private parseCsvChat(content: string): ParsedMessage[] {
    try {
      const messages: ParsedMessage[] = [];
      const records = parse(content, { columns: true, skip_empty_lines: true });

      for (const [index, record] of records.entries()) {
        let timestamp: Date | undefined;
        if (record.timestamp) {
          timestamp = new Date(record.timestamp);
          if (isNaN(timestamp.getTime())) {
            console.warn(
              `Invalid timestamp in CSV record ${index + 1}: ${JSON.stringify(
                record
              )}`
            );
            timestamp = undefined;
          }
        }

        if (!record.senderAlias || !record.message) {
          console.warn(
            `Missing senderAlias or message in CSV record ${
              index + 1
            }: ${JSON.stringify(record)}`
          );
          continue;
        }

        const isMedia = record.message.includes("<Media omitted>");

        messages.push({
          timestamp,
          senderAlias: record.senderAlias.trim(),
          message: record.message.trim(),
          isMedia,
        });
      }
      console.log(`Parsed ${messages.length} messages from csv file`);
      return messages;
    } catch (error: any) {
      console.error("parseCsvChat error:", {
        message: error.message,
        stack: error.stack,
      });
      throw new Error(`Failed to parse csv chat: ${error.message}`);
    }
  }

  private parseJsonChat(content: string): ParsedMessage[] {
    try {
      const messages: ParsedMessage[] = [];
      const data = JSON.parse(content);

      for (const [index, msg] of data.entries()) {
        let timestamp: Date | undefined;
        if (msg.timestamp) {
          timestamp = new Date(msg.timestamp);
          if (isNaN(timestamp.getTime())) {
            console.warn(
              `Invalid timestamp in JSON record ${index + 1}: ${JSON.stringify(
                msg
              )}`
            );
            timestamp = undefined;
          }
        }

        if (!msg.senderAlias || !msg.message) {
          console.warn(
            `Missing senderAlias or message in JSON record ${
              index + 1
            }: ${JSON.stringify(msg)}`
          );
          continue;
        }

        const isMedia = msg.message.includes("<Media omitted>");

        messages.push({
          timestamp,
          senderAlias: msg.senderAlias.trim(),
          message: msg.message.trim(),
          isMedia,
        });
      }
      console.log(`Parsed ${messages.length} messages from json file`);
      return messages;
    } catch (error: any) {
      console.error("parseJsonChat error:", {
        message: error.message,
        stack: error.stack,
      });
      throw new Error(`Failed to parse json chat: ${error.message}`);
    }
  }

  static async parseGroupMembers(filePath: string): Promise<TeamMember[]> {
    try {
      const content = await fs.readFile(filePath, "utf-8").catch((err) => {
        throw new Error(
          `Failed to read members file ${filePath}: ${err.message}`
        );
      });

      const records = parse(content, { columns: true, skip_empty_lines: true });

      const members: TeamMember[] = records.map(
        (record: any, index: number) => {
          const name = record.name || record.full_name;
          if (!name || !record.role || !record.alias) {
            console.warn(
              `Invalid member record at index ${index + 1}: ${JSON.stringify(
                record
              )}`
            );
            throw new Error(
              `Missing required fields in member record ${
                index + 1
              }. Expected: name (or full_name), role, alias. Got: ${JSON.stringify(
                {
                  name: record.name,
                  full_name: record.full_name,
                  role: record.role,
                  alias: record.alias,
                }
              )}`
            );
          }
          return {
            name: name.trim(),
            role: record.role.trim(),
            phone: record.phone?.trim() || undefined,
            alias: record.alias.trim(),
          };
        }
      );

      console.log(`Parsed ${members.length} group members`);
      return members;
    } catch (error: any) {
      console.error("parseGroupMembers error:", {
        message: error.message,
        stack: error.stack,
        filePath,
      });
      throw error;
    }
  }

  static async parseHierarchy(filePath: string): Promise<Hierarchy[]> {
    try {
      const content = await fs.readFile(filePath, "utf-8").catch((err) => {
        throw new Error(
          `Failed to read hierarchy file ${filePath}: ${err.message}`
        );
      });

      const data = JSON.parse(content);
      const hierarchy: Hierarchy[] = [];

      function flattenReports(record: any, parentName?: string) {
        const userId = record.name || record.userId;
        if (!userId) {
          console.warn(`Invalid hierarchy record: ${JSON.stringify(record)}`);
          throw new Error(
            `Missing userId or name in hierarchy record: ${JSON.stringify(
              record
            )}`
          );
        }

        if (parentName) {
          hierarchy.push({
            userId: userId.trim(),
            reportingTo: parentName.trim(),
          });
        }

        if (record.reports && Array.isArray(record.reports)) {
          for (const report of record.reports) {
            flattenReports(report, userId);
          }
        }
      }

      for (const [index, record] of data.entries()) {
        if (!record.name && !record.userId) {
          console.warn(
            `Invalid hierarchy record at index ${index + 1}: ${JSON.stringify(
              record
            )}`
          );
          throw new Error(
            `Missing userId or name in hierarchy record ${
              index + 1
            }: ${JSON.stringify(record)}`
          );
        }
        flattenReports(record);
      }

      console.log(`Parsed ${hierarchy.length} hierarchy records`);
      return hierarchy;
    } catch (error: any) {
      console.error("parseHierarchy error:", {
        message: error.message,
        stack: error.stack,
        filePath,
      });
      throw error;
    }
  }

  async saveMetadata(): Promise<void> {
    try {
      const group = (await Group.findOneAndUpdate(
        { name: this.groupName },
        { name: this.groupName, members: [] },
        { upsert: true, new: true }
      ).catch((err) => {
        throw new Error(
          `Failed to save group ${this.groupName}: ${err.message}`
        );
      })) as HydratedDocument<IGroup> | null;

      if (!group) throw new Error("Failed to create or find group");
      this.groupId = group._id as mongoose.Types.ObjectId;
      console.log(`Saved group: ${this.groupName}, ID: ${this.groupId}`);

      const userDocs: HydratedDocument<IUser>[] = [];
      const roleDocs: Map<string, HydratedDocument<IRole>> = new Map();

      // Log unique roles for debugging
      const uniqueRoles = [...new Set(this.teamMembers.map((m) => m.role))];
      console.log(`Unique roles found: ${uniqueRoles.join(", ")}`);

      // Create or find roles
      for (const member of this.teamMembers) {
        let roleDoc = roleDocs.get(member.role);
        if (!roleDoc) {
          roleDoc = (await Role.findOneAndUpdate(
            { name: member.role },
            { name: member.role },
            { upsert: true, new: true }
          ).catch((err) => {
            throw new Error(
              `Failed to save role ${member.role}: ${err.message}`
            );
          })) as HydratedDocument<IRole>;
          roleDocs.set(member.role, roleDoc);
        }
      }
      console.log(`Saved or found ${roleDocs.size} roles`);

      // Create or update users
      for (const member of this.teamMembers) {
        console.log(`Saving user: ${member.name}, user_id: ${member.name}`);
        const user = await User.findOneAndUpdate(
          { user_id: member.name }, // Use name as user_id
          {
            user_id: member.name,
            name: member.name,
            phone: member.phone,
            alias: member.alias,
            roles: roleDocs.get(member.role)?._id,
            summaries: null,
            tasks: null,
            rules: null,
            group_memberships: [this.groupId], // Explicitly set group_memberships
          },
          { upsert: true, new: true, strict: false } // Disable strict mode for upsert
        ).catch((err) => {
          console.error(`Error saving user ${member.name}: ${err.message}`);
          throw new Error(`Failed to save user ${member.name}: ${err.message}`);
        });
        userDocs.push(user);
      }
      console.log(`Saved ${userDocs.length} users`);

      // Update group members
      await Group.findByIdAndUpdate(this.groupId, {
        $set: { members: userDocs.map((u) => u._id) },
      }).catch((err) => {
        throw new Error(
          `Failed to update group members for ${this.groupName}: ${err.message}`
        );
      });

      // Apply hierarchy
      for (const h of this.hierarchy) {
        const user = userDocs.find((u) => u.user_id === h.userId);
        const reportingTo = userDocs.find((u) => u.user_id === h.reportingTo);
        if (user) {
          await User.findByIdAndUpdate(user._id, {
            $set: { reporting_to: reportingTo?._id || null },
          }).catch((err) => {
            throw new Error(
              `Failed to update hierarchy for user ${h.userId}: ${err.message}`
            );
          });
        } else {
          console.warn(`User not found for hierarchy: ${h.userId}`);
        }
      }
      console.log(`Saved hierarchy for ${this.hierarchy.length} records`);
    } catch (error: any) {
      console.error("saveMetadata error:", {
        message: error.message,
        stack: error.stack,
        groupName: this.groupName,
      });
      throw error;
    }
  }

  async saveMessages(messages: ParsedMessage[]): Promise<void> {
    try {
      if (!this.groupId) throw new Error("Group not initialized");

      const messageDocs: HydratedDocument<IMessage>[] = [];
      for (const msg of messages) {
        const sender = await User.findOne({ alias: msg.senderAlias }).catch(
          (err) => {
            throw new Error(
              `Failed to find user for alias ${msg.senderAlias}: ${err.message}`
            );
          }
        );
        messageDocs.push(
          new Message({
            groupId: this.groupId,
            senderAlias: msg.senderAlias,
            senderId: sender?._id,
            message: msg.message,
            timestamp: msg.timestamp,
            isMedia: msg.isMedia,
          })
        );
      }

      await Message.insertMany(messageDocs).catch((err) => {
        throw new Error(`Failed to save messages: ${err.message}`);
      });
      console.log(`Saved ${messageDocs.length} messages`);
    } catch (error: any) {
      console.error("saveMessages error:", {
        message: error.message,
        stack: error.stack,
        groupId: this.groupId?.toString(),
      });
      throw error;
    }
  }

  async process(): Promise<void> {
    try {
      await this.saveMetadata();
      const messages = await this.parseChatData();
      await this.saveMessages(messages);
      console.log(
        `Parsed and saved ${messages.length} messages for group ${this.groupName}`
      );
    } catch (error: any) {
      console.error("process error:", {
        message: error.message,
        stack: error.stack,
        groupName: this.groupName,
      });
      throw error;
    }
  }
}
