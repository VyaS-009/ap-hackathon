import { Request, Response } from "express";
import { Group } from "../models/group-model";

export const createGroup = async (req: Request, res: Response) => {
  try {
    const group = await Group.create(req.body);
    res.status(201).json(group);
  } catch (err) {
    res.status(400).json({ error: "Failed to create group" });
  }
};

export const getGroups = async (_req: Request, res: Response) => {
  const groups = await Group.find().populate("members");
  res.json(groups);
};
