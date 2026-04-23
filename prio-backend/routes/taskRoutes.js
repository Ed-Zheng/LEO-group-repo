import express from "express";
import {
  createTask,
  getTask,
  getGroupTasks,
  getUserTasks,
  updateTask,
  deleteTask,
} from "../services/taskService.js";

const router = express.Router();

router.get("/user/:uid", async (req, res) => {
  try {
    const tasks = await getUserTasks(req.params.uid);
    res.json(tasks);
  } catch (error) {
    console.error("Error fetching user tasks:", error);
    res.status(500).json({ error: "Failed to fetch user tasks" });
  }
});

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
router.put("/:id", async (req, res) => {
  try {
    const {
      title,
      description,
      priority,
      status,
      deadline,
      assigneeIds,
      actorId,
      isMajorTask,
      parentTaskId,
    } = req.body;

    if (!actorId) {
      return res.status(400).json({ error: "actorId is required" });
    }

    const existingTask = await getTask(req.params.id);

    if (!existingTask) {
      return res.status(404).json({ error: "Task not found" });
    }

    const isCreator = existingTask.createdBy === actorId;

    const requestedAssigneeIds = Array.isArray(assigneeIds) ? assigneeIds : [];
    const finalAssigneeIds = isCreator
      ? Array.from(new Set([...requestedAssigneeIds, existingTask.createdBy]))
      : Array.from(
          new Set([
            ...(existingTask.assigneeIds || []),
            ...requestedAssigneeIds,
            existingTask.createdBy,
          ])
        );

    await updateTask(
      req.params.id,
      {
        title,
        description,
        priority,
        status,
        deadline,
        assigneeIds: finalAssigneeIds,
        isMajorTask,
        parentTaskId,
      },
      actorId
    );

    res.json({ message: "Task updated successfully" });
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ error: "Failed to update task" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { actorId } = req.body;

    if (!actorId) {
      return res.status(400).json({ error: "actorId is required" });
    }

    await deleteTask(req.params.id, actorId);
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ error: "Failed to delete task" });
  }
});

router.post("/", async (req, res) => {
  try {
    const {
      groupId,
      title,
      description,
      priority,
      status,
      deadline,
      assigneeIds,
      createdBy,
      isMajorTask,
      parentTaskId,
    } = req.body;

    if (!title || !createdBy) {
      return res.status(400).json({
        error: "title and createdBy are required",
      });
    }

    const finalAssigneeIds = Array.from(
      new Set([...(assigneeIds || []), createdBy])
    );

    const taskId = await createTask(
      {
        groupId: groupId ?? null,
        title,
        description,
        priority,
        status,
        deadline,
        assigneeIds: finalAssigneeIds,
        isMajorTask: isMajorTask ?? false,
        parentTaskId: parentTaskId ?? null,
      },
      createdBy
    );

    res.status(201).json({ id: taskId, message: "Task created successfully" });
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ error: "Failed to create task" });
  }
});

export default router;
