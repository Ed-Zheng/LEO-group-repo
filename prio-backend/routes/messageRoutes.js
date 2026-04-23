import express from "express";
import {
  createTaskMessage,
  getTaskMessages,
} from "../services/messageService.js";

const router = express.Router();

router.get("/task/:taskId", async (req, res) => {
  try {
    const messages = await getTaskMessages(req.params.taskId);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { taskId, groupId, senderId, senderName, text } = req.body;

    const id = await createTaskMessage({
      taskId,
      groupId,
      senderId,
      senderName,
      text,
    });

    res.status(201).json({ id, message: "Task message created" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
