import { Request, Response } from "express";
import { Task } from "../models/task-model";

export const createTask = async (req: Request, res: Response) => {
  try {
    const task = await Task.create(req.body);
    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ error: "Failed to create task" });
  }
};

export const getTasksByUser = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const tasks = await Task.find({ assignedTo: userId }).populate([
    "assignedBy",
    "assignedTo",
  ]);
  res.json(tasks);
};
