import admin from "firebase-admin";
import { db } from "../firebase.js";
import { logAudit } from "./auditService.js";

export async function createTaskNote(data) {
  if (!data.taskId || !data.authorId) {
    throw new Error("taskId and authorId are required.");
  }

  if (!data.text?.trim()) {
    throw new Error("Note text is required.");
  }

  const payload = {
    taskId: data.taskId,
    groupId: data.groupId ?? null,
    authorId: data.authorId,
    authorName: data.authorName ?? "Unknown User",
    text: data.text.trim(),
    pinned: Boolean(data.pinned),
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  const ref = await db.collection("taskNotes").add(payload);

  await logAudit(data.authorId, "note.created", "task", data.taskId, null, {
    noteId: ref.id,
    text: payload.text,
    pinned: payload.pinned,
  });

  return ref.id;
}

export async function getTaskNotes(taskId) {
  const snap = await db
    .collection("taskNotes")
    .where("taskId", "==", taskId)
    .get();

  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      const aMs = a.createdAt?.toMillis?.() ?? 0;
      const bMs = b.createdAt?.toMillis?.() ?? 0;
      return aMs - bMs;
    });
}

export async function updateTaskNote(noteId, updates, actorId) {
  const ref = db.collection("taskNotes").doc(noteId);
  const beforeSnap = await ref.get();
  const before = beforeSnap.exists ? beforeSnap.data() : null;

  if (!before) {
    throw new Error("Note not found.");
  }

  const payload = {
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  if (updates.text !== undefined) {
    if (!updates.text?.trim()) {
      throw new Error("Note text cannot be empty.");
    }
    payload.text = updates.text.trim();
  }

  if (updates.pinned !== undefined) {
    payload.pinned = Boolean(updates.pinned);
  }

  await ref.update(payload);
  await logAudit(actorId, "note.updated", "task", before.taskId, before, payload);
}

export async function deleteTaskNote(noteId, actorId) {
  const ref = db.collection("taskNotes").doc(noteId);
  const beforeSnap = await ref.get();
  const before = beforeSnap.exists ? beforeSnap.data() : null;

  if (!before) {
    throw new Error("Note not found.");
  }

  await ref.delete();
  await logAudit(actorId, "note.deleted", "task", before.taskId, before, null);
}
