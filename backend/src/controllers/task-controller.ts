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
    const { userId } = req.params;
    console.log(`Fetching tasks for userId: ${userId}`);
    const tasks = await Task.find({ assignedTo: userId }).populate([
      "assignedBy",
      "assignedTo",
    ]);
    console.log(`Found ${tasks.length} tasks for userId: ${userId}`);
    res.json(tasks);
  } catch (err) {
    console.error(`Error fetching tasks for userId ${req.params.userId}:`, err);
    res.status(500).json({ error: "Internal server error" });
  }
};
