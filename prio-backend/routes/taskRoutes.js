import express from "express";
import { createTask, getTask, getGroupTasks } from "../services/taskService.js";

const router = express.Router();

// GET /tasks/group/:groupId
router.get("/group/:groupId", async (req, res) => {
  try {
    const tasks = await getGroupTasks(req.params.groupId);
    res.json(tasks);
  } catch (error) {
    console.error("Error fetching group tasks:", error);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

// GET /tasks/:id
router.get("/:id", async (req, res) => {
  try {
    const task = await getTask(req.params.id);

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json(task);
  } catch (error) {
    console.error("Error fetching task:", error);
    res.status(500).json({ error: "Failed to fetch task" });
  }
});

// POST /tasks
router.post("/", async (req, res) => {
  try {
    const { groupId, title, description, priority, status, deadline, assigneeIds, createdBy } = req.body;

    if (!groupId || !title || !createdBy) {
      return res.status(400).json({
        error: "groupId, title, and createdBy are required",
      });
    }

    const taskId = await createTask(
      { groupId, title, description, priority, status, deadline, assigneeIds },
      createdBy
    );

    res.status(201).json({ id: taskId, message: "Task created successfully" });
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ error: "Failed to create task" });
  }
});

export default router;