import admin from "firebase-admin";
import { db } from "../firebase.js";
import { logAudit } from "./auditService.js";
import { getTask } from "./taskService.js";
import { notifyMessageReceived } from "./notificationService.js";

export async function createTaskMessage(data) {
  if (!data.taskId || !data.senderId) {
    throw new Error("taskId and senderId are required.");
  }

  if (!data.text?.trim()) {
    throw new Error("Message text is required.");
  }

  const payload = {
    taskId: data.taskId,
    groupId: data.groupId ?? null,
    senderId: data.senderId,
    senderName: data.senderName ?? "Unknown User",
    text: data.text.trim(),
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  const ref = await db.collection("taskMessages").add(payload);

  const task = await getTask(data.taskId);
  const assignees = task?.assigneeIds ?? [];
  const recipients = assignees.filter((uid) => uid !== data.senderId);

  if (recipients.length > 0 && task) {
    await notifyMessageReceived(
      recipients,
      data.taskId,
      task.title,
      payload.senderName,
      data.groupId
    );
  }

  await logAudit(data.senderId, "message.created", "task", data.taskId, null, {
    messageId: ref.id,
    text: payload.text,
  });

  return ref.id;
}

export async function getTaskMessages(taskId) {
  const snap = await db
    .collection("taskMessages")
    .where("taskId", "==", taskId)
    .get();

  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => {
      const aMs = a.createdAt?.toMillis?.() ?? 0;
      const bMs = b.createdAt?.toMillis?.() ?? 0;
      return aMs - bMs;
    });
}
