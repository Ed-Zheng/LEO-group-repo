import express from "express";
import {
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "../services/notificationService.js";

const router = express.Router();

router.get("/user/:uid", async (req, res) => {
  try {
    const notifications = await getUserNotifications(req.params.uid);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { recipientId, type, message, taskId, groupId } = req.body;
    await createNotification({ recipientId, type, message, taskId, groupId });
    res.status(201).json({ message: "Notification created" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put("/:id/read", async (req, res) => {
  try {
    await markAsRead(req.params.id);
    res.json({ message: "Notification marked as read" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put("/user/:uid/read-all", async (req, res) => {
  try {
    await markAllAsRead(req.params.uid);
    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await deleteNotification(req.params.id);
    res.json({ message: "Notification deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
