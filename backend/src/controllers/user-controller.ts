// src/controllers/user-controller.ts
import { Request, Response } from "express";
import { User } from "../models/user-model";

export const createUser = async (req: Request, res: Response) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: "Failed to create user" });
  }
};

export const getUsers = async (_req: Request, res: Response) => {
  const users = await User.find().populate("reportingTo groupMemberships");
  res.json(users);
};

export const getUserById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).populate(
      "reportingTo groupMemberships"
    );

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};
