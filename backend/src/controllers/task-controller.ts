import { Request, Response } from "express";
import { Task } from "../models/task-model";

export const createTask = async (req: Request, res: Response) => {
  try {
    console.log("Creating task with data:", req.body);
    const task = await Task.create(req.body);
    res.status(201).json(task);
  } catch (err) {
    console.error("Error creating task:", err);
    res.status(400).json({ error: "Failed to create task" });
  }
};

export const getTasksByUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    console.log(`Fetching tasks for userId: ${userId}`); // Debugging log
    const tasks = await Task.find({
      $or: [{ assignedTo: userId }, { assignedBy: userId }],
    })
      .populate("assignedBy", "name")
      .populate("assignedTo", "name")
      .populate("groupId", "name");
    console.log(`Found ${tasks.length} tasks for userId: ${userId}`); // Debugging log
    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
