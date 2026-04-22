/**
 * expenseService.js
 * Log, retrieve, update, and delete task-linked expenses.
 */

import admin from "firebase-admin";
import { db } from "../firebase.js";
import { logAudit } from "./auditService.js";

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
    taskId: data.taskId,
    groupId: data.groupId,
    amount: data.amount,
    currency: data.currency ?? "USD",
    description: data.description.trim(),
    submittedBy,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  const ref = await db.collection("expenses").add(payload);
  await logAudit(submittedBy, "expense.created", "expense", ref.id, null, payload);
  return ref.id;
}

/**
 * Get all expenses for a group, newest first.
 * @param {string} groupId
 * @returns {Promise<object[]>}
 */
export async function getGroupExpenses(groupId) {
  const snap = await db
    .collection("expenses")
    .where("groupId", "==", groupId)
    .orderBy("createdAt", "desc")
    .get();

  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Get all expenses linked to a specific task.
 * @param {string} taskId
 * @returns {Promise<object[]>}
 */
export async function getTaskExpenses(taskId) {
  const snap = await db
    .collection("expenses")
    .where("taskId", "==", taskId)
    .orderBy("createdAt", "desc")
    .get();

  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Update an expense (description/amount only).
 * @param {string} expenseId
 * @param {object} updates – { amount?, description? }
 * @param {string} actorId
 */
export async function updateExpense(expenseId, updates, actorId) {
  if (updates.amount !== undefined && (typeof updates.amount !== "number" || updates.amount <= 0)) {
    throw new Error("Amount must be a positive number.");
  }

  const ref = db.collection("expenses").doc(expenseId);
  const beforeSnap = await ref.get();
  const before = beforeSnap.exists ? beforeSnap.data() : null;

  const payload = {};
  if (updates.amount !== undefined) payload.amount = updates.amount;
  if (updates.description !== undefined) payload.description = updates.description.trim();

  await ref.update(payload);
  await logAudit(actorId, "expense.updated", "expense", expenseId, before, payload);
}

/**
 * Delete an expense.
 * @param {string} expenseId
 * @param {string} actorId
 */
export async function deleteExpense(expenseId, actorId) {
  const ref = db.collection("expenses").doc(expenseId);
  const beforeSnap = await ref.get();
  const before = beforeSnap.exists ? beforeSnap.data() : null;

  await ref.delete();
  await logAudit(actorId, "expense.deleted", "expense", expenseId, before, null);
}

/**
 * Compute total expenses for a group broken down by task.
 * @param {string} groupId
 * @returns {Promise<{ total: number, byTask: Record<string, number> }>}
 */
export async function getGroupExpenseSummary(groupId) {
  const expenses = await getGroupExpenses(groupId);
  const byTask = {};
  let total = 0;

  for (const exp of expenses) {
    total += exp.amount;
    byTask[exp.taskId] = (byTask[exp.taskId] ?? 0) + exp.amount;
  }

  return { total, byTask };
}