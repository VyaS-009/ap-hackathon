import express from "express";
import { createTask, getTasksByUser } from "../controllers/task-controller";

const router = express.Router();

router.post("/", createTask);
router.get("/user/:userId", getTasksByUser);

export default router;
