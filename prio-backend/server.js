import express from "express";
import cors from "cors";
import taskRoutes from "./routes/taskRoutes.js";
import groupRoutes from "./routes/groupRoutes.js";

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

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});