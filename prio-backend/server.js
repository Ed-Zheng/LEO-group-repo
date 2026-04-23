import express from "express";
import cors from "cors";
import noteRoutes from "./routes/noteRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import groupRoutes from "./routes/groupRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import auditRoutes from "./routes/auditRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import userRoutes from "./routes/userRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("Prio backend running");
});

// Routes
app.use("/tasks", taskRoutes);
app.use("/groups", groupRoutes);
app.use("/expenses", expenseRoutes);
app.use("/notifications", notificationRoutes);
app.use("/audit", auditRoutes);
app.use("/messages", messageRoutes);
app.use("/notes", noteRoutes);
app.use("/users", userRoutes);

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});