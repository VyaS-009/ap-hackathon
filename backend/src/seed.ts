import mongoose, { Types } from "mongoose";
import { User } from "./models/user-model"; // Adjust paths to your models
import { Group } from "./models/group-model";
import { Task } from "./models/task-model";

// Connect to MongoDB
const MONGO_URI = "mongodb://localhost:27017/ap-hackathon"; // Replace 'yourDatabase' with your actual database name

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Define type for groups to match Group schema
interface GroupSeed {
  name: string;
  description: string;
  members: Types.ObjectId[];
  context: string;
  chatLogs?: Array<{
    timestamp: Date;
    sender: Types.ObjectId;
    content: string;
  }>;
}

// Mock data for Andhra Pradesh police officers
const users = [
  {
    name: "Ramesh Kumar",

    email: "ramesh@gmail.com",
    role: "Senior",
    rank: "Superintendent of Police (SP)",
    phoneNumber: "+91 1234567890",
  },
  {
    name: "Sita Rao",
    email: "sita.rao@gmail.com",
    role: "Officer",
    rank: "Deputy Superintendent of Police (DSP)",
    phoneNumber: "+91 2345678901",
  },
  {
    name: "Vijay Reddy",
    email: "vijay.reddy@gmail.com",
    role: "Junior",
    rank: "Inspector of Police",
    phoneNumber: "+91 3456789012",
  },
];

// Mock data for police groups with explicit type
const groups: GroupSeed[] = [
  {
    name: "Kakinada Rural",
    description: "Kakinada rural group for police",
    members: [],
    context: "General Information",
  },
  {
    name: "Visakhapatnam Urban",
    description: "Visakhapatnam urban police group",
    members: [],
    context: "Urban Policing",
  },
];

// Mock data for tasks
const tasks = [
  {
    taskText: "Conduct a survey of crimes",
    status: "open",
    deadline: new Date("2025-07-01"),
    messageId: "msg001",
    completionSignal: "signal001",
  },
  {
    taskText: "Organize community policing meeting",
    status: "in progress",
    deadline: new Date("2025-06-30"),
    messageId: "msg002",
    completionSignal: "signal002",
  },
  {
    taskText: "Complete patrol report",
    status: "completed",
    deadline: new Date("2025-06-20"),
    messageId: "msg003",
    completionSignal: "signal003",
  },
];

// Seed function
async function seedDatabase() {
  try {
    // Clear existing data (optional, comment out if you want to append data)
    await User.deleteMany({});
    await Group.deleteMany({});
    await Task.deleteMany({});
    console.log("Existing data cleared");

    // Create users
    const insertedUsers = await User.insertMany(users);
    console.log(`Inserted ${insertedUsers.length} users`);

    // Set reportingTo relationships
    insertedUsers[1].reportingTo = insertedUsers[0]._id; // Sita reports to Ramesh
    insertedUsers[2].reportingTo = insertedUsers[0]._id; // Vijay reports to Ramesh
    await insertedUsers[1].save();
    await insertedUsers[2].save();

    // Assign members to groups
    groups[0].members = [insertedUsers[0]._id, insertedUsers[1]._id]; // Ramesh and Sita in Kakinada Rural
    groups[1].members = [insertedUsers[1]._id, insertedUsers[2]._id]; // Sita and Vijay in Visakhapatnam Urban
    const insertedGroups = await Group.insertMany(groups);
    console.log(`Inserted ${insertedGroups.length} groups`);

    // Update users with group memberships
    insertedUsers[0].groupMemberships = [insertedGroups[0]._id]; // Ramesh in Kakinada Rural
    insertedUsers[1].groupMemberships = [
      insertedGroups[0]._id,
      insertedGroups[1]._id,
    ]; // Sita in both
    insertedUsers[2].groupMemberships = [insertedGroups[1]._id]; // Vijay in Visakhapatnam Urban
    await Promise.all(insertedUsers.map((user) => user.save()));

    // Create tasks with references
    const insertedTasks = await Task.insertMany([
      {
        ...tasks[0],
        assignedBy: insertedUsers[0]._id, // Ramesh
        assignedTo: insertedUsers[1]._id, // Sita
        groupId: insertedGroups[0]._id, // Kakinada Rural
      },
      {
        ...tasks[1],
        assignedBy: insertedUsers[0]._id, // Ramesh
        assignedTo: insertedUsers[2]._id, // Vijay
        groupId: insertedGroups[0]._id, // Kakinada Rural
      },
      {
        ...tasks[2],
        assignedBy: insertedUsers[1]._id, // Sita
        assignedTo: insertedUsers[2]._id, // Vijay
        groupId: insertedGroups[1]._id, // Visakhapatnam Urban
      },
    ]);
    console.log(`Inserted ${insertedTasks.length} tasks`);

    console.log("Database seeded successfully!");
  } catch (err) {
    console.error("Error seeding database:", err);
  } finally {
    mongoose.connection.close();
    console.log("MongoDB connection closed");
  }
}

// Run the seed function
seedDatabase();
