import { Request, Response } from "express";
import { SummarizationRule } from "../models/rule-model";

export const createRule = async (req: Request, res: Response) => {
  try {
    const rule = await SummarizationRule.create(req.body);
    res.status(201).json(rule);
  } catch (err) {
    res.status(400).json({ error: "Failed to create rule" });
  }
};

export const getRulesByUser = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const rules = await SummarizationRule.find({ userId });
  res.json(rules);
};
