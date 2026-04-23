import admin from "firebase-admin";
import { db } from "../firebase.js";

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
