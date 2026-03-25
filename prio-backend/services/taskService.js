import admin from "firebase-admin";
import { db } from "../firebase.js";
import { logAudit } from "./auditService.js";

export async function createTask(taskData, createdBy) {
  const payload = {
    groupId: taskData.groupId,
    title: taskData.title.trim(),
    description: taskData.description?.trim() ?? null,
    priority: taskData.priority ?? "medium",
    status: taskData.status ?? "pending",
    deadline: taskData.deadline ?? null,
    assigneeIds: taskData.assigneeIds ?? [],
    createdBy,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  const ref = await db.collection("tasks").add(payload);
  await logAudit(createdBy, "task.created", "task", ref.id, null, payload);
  return ref.id;
}

export async function getTask(taskId) {
  const snap = await db.collection("tasks").doc(taskId).get();
  return snap.exists ? { id: snap.id, ...snap.data() } : null;
}

export async function getGroupTasks(groupId) {
  const snap = await db
    .collection("tasks")
    .where("groupId", "==", groupId)
    .orderBy("createdAt", "desc")
    .get();

  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getUserTasks(uid) {
  const snap = await db
    .collection("tasks")
    .where("assigneeIds", "array-contains", uid)
    .orderBy("createdAt", "desc")
    .get();

  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function updateTask(taskId, updates, actorId) {
  const ref = db.collection("tasks").doc(taskId);
  const beforeSnap = await ref.get();
  const before = beforeSnap.exists ? beforeSnap.data() : null;

  const payload = {
    ...updates,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  await ref.update(payload);
  await logAudit(actorId, "task.updated", "task", taskId, before, payload);
}

export async function updateTaskStatus(taskId, status, actorId) {
  return updateTask(taskId, { status }, actorId);
}

export async function deleteTask(taskId, actorId) {
  const ref = db.collection("tasks").doc(taskId);
  const beforeSnap = await ref.get();
  const before = beforeSnap.exists ? beforeSnap.data() : null;

  await ref.delete();
  await logAudit(actorId, "task.deleted", "task", taskId, before, null);
}
