import express from "express";
import cors from "cors";
import taskRoutes from "./routes/taskRoutes.js";
import userRoutes from "./routes/userRoutes.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/users", userRoutes);

app.get("/", (req, res) => {
  res.send("Prio backend running");
});

app.use("/tasks", taskRoutes);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});