/**
 * taskService.js
 * Full CRUD + subtask operations for tasks in Firestore.
 * Import and use these functions throughout the app.
 */

import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  onSnapshot,
  writeBatch,
} from "firebase/firestore";
import { db } from "../firebase";
import { logAudit } from "./auditService";

// ─── Tasks ────────────────────────────────────────────────────────────────────

/**
 * Create a new task in a group.
 * @param {object} taskData – { groupId, title, description, priority, status, deadline, assigneeIds }
 * @param {string} createdBy – uid of creator
 * @returns {Promise<string>} taskId
 */
export async function createTask(taskData, createdBy) {
  const payload = {
    groupId:     taskData.groupId,
    title:       taskData.title.trim(),
    description: taskData.description?.trim() ?? null,
    priority:    taskData.priority ?? "medium",
    status:      taskData.status   ?? "pending",
    deadline:    taskData.deadline ?? null,
    assigneeIds: taskData.assigneeIds ?? [],
    createdBy,
    createdAt:   serverTimestamp(),
    updatedAt:   serverTimestamp(),
  };

  const ref = await addDoc(collection(db, "tasks"), payload);
  await logAudit(createdBy, "task.created", "task", ref.id, null, payload);
  return ref.id;
}

/**
 * Fetch a single task by ID.
 * @param {string} taskId
 * @returns {Promise<object|null>}
 */
export async function getTask(taskId) {
  const snap = await getDoc(doc(db, "tasks", taskId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

/**
 * Fetch all tasks for a group, ordered by creation date.
 * @param {string} groupId
 * @returns {Promise<object[]>}
 */
export async function getGroupTasks(groupId) {
  const q = query(
    collection(db, "tasks"),
    where("groupId", "==", groupId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * Fetch tasks assigned to a specific user across all groups.
 * @param {string} uid
 * @returns {Promise<object[]>}
 */
export async function getUserTasks(uid) {
  const q = query(
    collection(db, "tasks"),
    where("assigneeIds", "array-contains", uid),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * Real-time listener for all tasks in a group.
 * @param {string} groupId
 * @param {function} callback – receives task array on every update
 * @returns {function} unsubscribe
 */
export function subscribeGroupTasks(groupId, callback) {
  const q = query(
    collection(db, "tasks"),
    where("groupId", "==", groupId),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
}

/**
 * Update task fields.
 * @param {string} taskId
 * @param {object} updates – partial task fields
 * @param {string} actorId – uid of user making the change
 */
export async function updateTask(taskId, updates, actorId) {
  const ref   = doc(db, "tasks", taskId);
  const before = (await getDoc(ref)).data();

  const payload = { ...updates, updatedAt: serverTimestamp() };
  await updateDoc(ref, payload);
  await logAudit(actorId, "task.updated", "task", taskId, before, payload);
}

/**
 * Update only the status of a task.
 * @param {string} taskId
 * @param {"pending"|"in_progress"|"completed"} status
 * @param {string} actorId
 */
export async function updateTaskStatus(taskId, status, actorId) {
  return updateTask(taskId, { status }, actorId);
}

/**
 * Delete a task and all its subcollections (subtasks, messages, notes).
 * @param {string} taskId
 * @param {string} actorId
 */
export async function deleteTask(taskId, actorId) {
  const ref    = doc(db, "tasks", taskId);
  const before = (await getDoc(ref)).data();
  const batch  = writeBatch(db);

  // Delete subcollection docs (Firestore does not auto-delete subcollections)
  for (const sub of ["subtasks", "messages", "notes"]) {
    const subSnap = await getDocs(collection(db, "tasks", taskId, sub));
    subSnap.docs.forEach(d => batch.delete(d.ref));
  }

  batch.delete(ref);
  await batch.commit();
  await logAudit(actorId, "task.deleted", "task", taskId, before, null);
}

// ─── Subtasks ─────────────────────────────────────────────────────────────────

/**
 * Add a subtask under a task.
 * @param {string} taskId
 * @param {string} title
 * @param {string|null} assigneeId
 * @returns {Promise<string>} subtaskId
 */
export async function createSubtask(taskId, title, assigneeId = null) {
  const ref = await addDoc(collection(db, "tasks", taskId, "subtasks"), {
    title:      title.trim(),
    completed:  false,
    assigneeId,
    createdAt:  serverTimestamp(),
    updatedAt:  serverTimestamp(),
  });
  return ref.id;
}

/**
 * Fetch all subtasks for a task.
 * @param {string} taskId
 * @returns {Promise<object[]>}
 */
export async function getSubtasks(taskId) {
  const snap = await getDocs(
    query(collection(db, "tasks", taskId, "subtasks"), orderBy("createdAt", "asc"))
  );
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * Real-time listener for subtasks.
 * @param {string} taskId
 * @param {function} callback
 * @returns {function} unsubscribe
 */
export function subscribeSubtasks(taskId, callback) {
  const q = query(
    collection(db, "tasks", taskId, "subtasks"),
    orderBy("createdAt", "asc")
  );
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
}

/**
 * Toggle a subtask's completed state.
 * @param {string} taskId
 * @param {string} subtaskId
 * @param {boolean} completed
 */
export async function toggleSubtask(taskId, subtaskId, completed) {
  await updateDoc(doc(db, "tasks", taskId, "subtasks", subtaskId), {
    completed,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Delete a subtask.
 * @param {string} taskId
 * @param {string} subtaskId
 */
export async function deleteSubtask(taskId, subtaskId) {
  await deleteDoc(doc(db, "tasks", taskId, "subtasks", subtaskId));
}
