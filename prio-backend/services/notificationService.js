import admin from "firebase-admin";
import { db } from "../firebase.js";

export async function createNotification(data) {
  await db.collection("notifications").add({
    recipientId: data.recipientId,
    type: data.type,
    message: data.message,
    taskId: data.taskId ?? null,
    groupId: data.groupId ?? null,
    read: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

export async function notifyUsers(uids, notifData) {
  await Promise.all(
    uids.map((uid) => createNotification({ ...notifData, recipientId: uid }))
  );
}

export async function getUserNotifications(uid) {
  const snap = await db
    .collection("notifications")
    .where("recipientId", "==", uid)
    .get();

  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => {
      const aMs = a.createdAt?.toMillis?.() ?? 0;
      const bMs = b.createdAt?.toMillis?.() ?? 0;
      return bMs - aMs;
    });
}

export async function markAsRead(notificationId) {
  await db.collection("notifications").doc(notificationId).update({ read: true });
}

export async function markAllAsRead(uid) {
  const snap = await db
    .collection("notifications")
    .where("recipientId", "==", uid)
    .where("read", "==", false)
    .get();

  const batch = db.batch();
  snap.docs.forEach((docSnap) => {
    batch.update(docSnap.ref, { read: true });
  });
  await batch.commit();
}

export async function deleteNotification(notificationId) {
  await db.collection("notifications").doc(notificationId).delete();
}

export async function notifyDeadlineApproaching(uids, taskId, taskTitle, groupId) {
  await notifyUsers(uids, {
    type: "deadline_approaching",
    message: `Deadline approaching for task: "${taskTitle}"`,
    taskId,
    groupId,
  });
}

export async function notifyTaskOverdue(uids, taskId, taskTitle, groupId) {
  await notifyUsers(uids, {
    type: "task_overdue",
    message: `Task overdue: "${taskTitle}"`,
    taskId,
    groupId,
  });
}

export async function notifyTaskUpdated(uids, taskId, taskTitle, groupId) {
  await notifyUsers(uids, {
    type: "task_updated",
    message: `Task was updated: "${taskTitle}"`,
    taskId,
    groupId,
  });
}

export async function notifyMessageReceived(uids, taskId, taskTitle, senderName, groupId) {
  await notifyUsers(uids, {
    type: "message_received",
    message: `${senderName} sent a message on task: "${taskTitle}"`,
    taskId,
    groupId,
  });
}