// ✅ backend/src/index.ts (entry point)
import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db";
import userRoutes from "./routes/user-routes";
import groupRoutes from "./routes/group-routes";
import taskRoutes from "./routes/task-routes";
import ruleRoutes from "./routes/rule-routes";
import cors from "cors";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
// Enable CORS for frontend
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
// Middleware
app.use(express.json());

app.use(cors({ origin: "http://localhost:5173" }));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/rules", ruleRoutes);

// DB Connection
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
