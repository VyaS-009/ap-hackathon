import express from "express";
import { createRule, getRulesByUser } from "../controllers/rule-controller";

const router = express.Router();

router.post("/", createRule);
router.get("/user/:userId", getRulesByUser);

export default router;
