import admin from "firebase-admin";
import { db } from "../firebase.js";

/**
 * Log an audit event
 */
export async function logAudit(
  actorId,
  action,
  entityType,
  entityId,
  before = null,
  after = null
) {
  try {
    await db.collection("auditLogs").add({
      actorId,
      action,
      entityType,
      entityId,
      before,
      after,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
  } catch (err) {
    console.error("[auditService] Failed to write audit log:", err);
  }
}

/**
 * Get audit logs for a specific entity (no index required)
 */
export async function getEntityAuditLog(entityId, maxResults = 50) {
  const snap = await db
    .collection("auditLogs")
    .where("entityId", "==", entityId)
    .get();

  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => {
      const aMs = a.timestamp?.toMillis?.() ?? 0;
      const bMs = b.timestamp?.toMillis?.() ?? 0;
      return bMs - aMs;
    })
    .slice(0, maxResults);
}

/**
 * Get audit logs for a specific user (no index required)
 */
export async function getUserAuditLog(actorId, maxResults = 100) {
  const snap = await db
    .collection("auditLogs")
    .where("actorId", "==", actorId)
    .get();

  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => {
      const aMs = a.timestamp?.toMillis?.() ?? 0;
      const bMs = b.timestamp?.toMillis?.() ?? 0;
      return bMs - aMs;
    })
    .slice(0, maxResults);
}