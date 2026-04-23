import express from "express";
import cors from "cors";
import noteRoutes from "./routes/noteRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import groupRoutes from "./routes/groupRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import auditRoutes from "./routes/auditRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";

const app = express();
const allowedOrigin = process.env.FRONTEND_ORIGIN || "http://localhost:5173";

app.use(
  cors({
    origin: allowedOrigin,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", allowedOrigin);
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

app.use(express.json());
app.use("/users", userRoutes);

app.get("/", (req, res) => {
  res.send("Prio backend running");
});

app.use("/tasks", taskRoutes);
app.use("/groups", groupRoutes);
app.use("/expenses", expenseRoutes);
app.use("/notifications", notificationRoutes);
app.use("/audit", auditRoutes);
app.use("/messages", messageRoutes);
app.use("/notes", noteRoutes);

const PORT = 5000;
const HOST = process.env.HOST || "127.0.0.1";

const server = app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});

server.on("error", (error) => {
  console.error("Backend server failed to start:", error);
});
