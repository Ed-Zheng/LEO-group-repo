/**
 * expenseService.js
 * Log, retrieve, update, and delete task-linked expenses.
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
} from "firebase/firestore";
import { db } from "../firebase";
import { logAudit } from "./auditService";

/**
 * Log a new expense tied to a task.
 * @param {object} data – { taskId, groupId, amount, currency, description }
 * @param {string} submittedBy – uid
 * @returns {Promise<string>} expenseId
 */
export async function createExpense(data, submittedBy) {
  if (!data.taskId || !data.groupId) throw new Error("taskId and groupId are required.");
  if (typeof data.amount !== "number" || data.amount <= 0) throw new Error("Amount must be a positive number.");
  if (!data.description?.trim()) throw new Error("Description is required.");

  const payload = {
    taskId:      data.taskId,
    groupId:     data.groupId,
    amount:      data.amount,
    currency:    data.currency ?? "USD",
    description: data.description.trim(),
    submittedBy,
    createdAt:   serverTimestamp(),
  };

  const ref = await addDoc(collection(db, "expenses"), payload);
  await logAudit(submittedBy, "expense.created", "expense", ref.id, null, payload);
  return ref.id;
}

/**
 * Get all expenses for a group, newest first.
 * @param {string} groupId
 * @returns {Promise<object[]>}
 */
export async function getGroupExpenses(groupId) {
  const q    = query(collection(db, "expenses"), where("groupId", "==", groupId), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * Get all expenses linked to a specific task.
 * @param {string} taskId
 * @returns {Promise<object[]>}
 */
export async function getTaskExpenses(taskId) {
  const q    = query(collection(db, "expenses"), where("taskId", "==", taskId), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * Real-time listener for group expenses.
 * @param {string} groupId
 * @param {function} callback
 * @returns {function} unsubscribe
 */
export function subscribeGroupExpenses(groupId, callback) {
  const q = query(collection(db, "expenses"), where("groupId", "==", groupId), orderBy("createdAt", "desc"));
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
}

/**
 * Update an expense (description/amount only — immutable fields like taskId stay fixed).
 * @param {string} expenseId
 * @param {object} updates – { amount?, description? }
 * @param {string} actorId
 */
export async function updateExpense(expenseId, updates, actorId) {
  if (updates.amount !== undefined && (typeof updates.amount !== "number" || updates.amount <= 0)) {
    throw new Error("Amount must be a positive number.");
  }

  const ref    = doc(db, "expenses", expenseId);
  const before = (await getDoc(ref)).data();
  const payload = {};
  if (updates.amount !== undefined)      payload.amount      = updates.amount;
  if (updates.description !== undefined) payload.description = updates.description.trim();

  await updateDoc(ref, payload);
  await logAudit(actorId, "expense.updated", "expense", expenseId, before, payload);
}

/**
 * Delete an expense.
 * @param {string} expenseId
 * @param {string} actorId
 */
export async function deleteExpense(expenseId, actorId) {
  const ref    = doc(db, "expenses", expenseId);
  const before = (await getDoc(ref)).data();
  await deleteDoc(ref);
  await logAudit(actorId, "expense.deleted", "expense", expenseId, before, null);
}

/**
 * Compute total expenses for a group broken down by task.
 * @param {string} groupId
 * @returns {Promise<{ total: number, byTask: Record<string, number> }>}
 */
export async function getGroupExpenseSummary(groupId) {
  const expenses = await getGroupExpenses(groupId);
  const byTask   = {};
  let total      = 0;

  for (const exp of expenses) {
    total             += exp.amount;
    byTask[exp.taskId] = (byTask[exp.taskId] ?? 0) + exp.amount;
  }

  return { total, byTask };
}
