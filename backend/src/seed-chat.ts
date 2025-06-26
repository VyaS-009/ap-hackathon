import mongoose from "mongoose";
import fs from "fs/promises";
import { ChatParser, Rule } from "./utils/chat-parser";

async function seedChat() {
  await mongoose.connect("mongodb://localhost:27017/ap-hackathon");
  console.log("Connected to MongoDB");
  const teamMembers = [
    {
      name: "Ramesh Kumar",
      role: "Superintendent of Police",
      phone: "+91 1234567890",
      alias: "Ramesh SP",
    },
    {
      name: "Sita Rao",
      role: "Deputy Superintendent of Police",
      phone: "+91 2345678901",
      alias: "Sita DSP",
    },
    {
      name: "Vijay Sharma",
      role: "Inspector",
      phone: "+91 3456789012",
      alias: "Vijay Insp",
    },
  ];

  const hierarchy = [
    { userId: "Sita Rao", reportingTo: "Ramesh Kumar" },
    { userId: "Vijay Sharma", reportingTo: "Sita Rao" },
  ];

  const rules: Rule[] = [
    {
      userId: "Ramesh Kumar",
      summarizeKeywords: ["crime", "report"],
      prioritize: "high",
    },
    {
      userId: "Sita Rao",
      summarizeKeywords: ["survey", "meeting"],
      prioritize: "medium",
    },
    {
      userId: "Vijay Sharma",
      summarizeKeywords: ["patrol"],
      prioritize: "low",
    },
  ];

  const sampleChat = `
6/25/25, 10:00 - Ramesh SP: Team, please prepare the crime report by tomorrow.
6/25/25, 10:05 - Sita DSP: I'll conduct a survey of recent incidents. Any specific areas to focus on?
6/25/25, 10:10 - Vijay Insp: Completed the patrol. Report submitted. <Media omitted>
6/25/25, 10:15 - Sita DSP: ఈ రోజు సమావేశం ఉంది, సిద్ధంగా ఉండండి (Meeting today, be ready)
`;

  await fs.writeFile("sampleChat.txt", sampleChat);

  const parser = new ChatParser(
    "Kakinada Rural",
    teamMembers,
    hierarchy,
    rules
  );
  await parser.process("sampleChat.txt");

  console.log("Chat data seeded successfully");
  await mongoose.connection.close();
}

seedChat().catch(console.error);
