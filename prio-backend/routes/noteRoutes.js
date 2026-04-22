import express from "express";
import {
  createTaskNote,
  getTaskNotes,
  updateTaskNote,
  deleteTaskNote,
} from "../services/noteService.js";

const router = express.Router();

// GET /notes/task/:taskId
router.get("/task/:taskId", async (req, res) => {
  try {
    const notes = await getTaskNotes(req.params.taskId);
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /notes
router.post("/", async (req, res) => {
  try {
    const { taskId, groupId, authorId, authorName, text, pinned } = req.body;

    const id = await createTaskNote({
      taskId,
      groupId,
      authorId,
      authorName,
      text,
      pinned,
    });

    res.status(201).json({ id, message: "Task note created" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /notes/:id
router.put("/:id", async (req, res) => {
  try {
    const { text, pinned, actorId } = req.body;
    await updateTaskNote(req.params.id, { text, pinned }, actorId);
    res.json({ message: "Task note updated" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /notes/:id
router.delete("/:id", async (req, res) => {
  try {
    const { actorId } = req.body;
    await deleteTaskNote(req.params.id, actorId);
    res.json({ message: "Task note deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;