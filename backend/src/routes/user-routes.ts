import express from "express";
import {
  createUser,
  getUsers,
  getUserById,
} from "../controllers/user-controller";

const router = express.Router();

console.log("typeof getUserById", typeof getUserById); // should be 'function'

router.post("/", createUser);
router.get("/", getUsers);
router.get("/:id", getUserById);

export default router;
