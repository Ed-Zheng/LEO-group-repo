/**
 * auditService.js
 * Write immutable audit logs for significant actions.
 * Imported by other services — do not call from the UI directly.
 */

import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

/**
 * Write an audit log entry.
 * @param {string} actorId   – uid of the user performing the action
 * @param {string} action    – e.g. "task.created", "member.removed"
 * @param {string} entityType – "task" | "group" | "expense" | "user"
 * @param {string} entityId  – ID of the affected document
 * @param {object|null} before – document snapshot before the change
 * @param {object|null} after  – document snapshot after the change
 */
export async function logAudit(actorId, action, entityType, entityId, before = null, after = null) {
  try {
    await addDoc(collection(db, "auditLogs"), {
      actorId,
      action,
      entityType,
      entityId,
      before,
      after,
      timestamp: serverTimestamp(),
    });
  } catch (err) {
    // Audit failures should never break main flows — log silently
    console.error("[auditService] Failed to write audit log:", err);
  }
}

/**
 * Get recent audit logs for a specific entity (e.g. one task's history).
 * @param {string} entityId
 * @param {number} maxResults
 * @returns {Promise<object[]>}
 */
export async function getEntityAuditLog(entityId, maxResults = 50) {
  const q    = query(
    collection(db, "auditLogs"),
    where("entityId", "==", entityId),
    orderBy("timestamp", "desc"),
    limit(maxResults)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * Get recent audit logs for a specific user's actions.
 * @param {string} actorId
 * @param {number} maxResults
 * @returns {Promise<object[]>}
 */
export async function getUserAuditLog(actorId, maxResults = 100) {
  const q    = query(
    collection(db, "auditLogs"),
    where("actorId", "==", actorId),
    orderBy("timestamp", "desc"),
    limit(maxResults)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
