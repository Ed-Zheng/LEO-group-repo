/**
 * groupService.js
 * Create, join, manage, and delete groups (teams) in Firestore.
 */

import { db } from "../firebase.js";
import { logAudit } from "./auditService.js";
import admin from "firebase-admin";

/**
 * Create a new group
 */
export async function createGroup(groupData, createdBy) {
  const batch = db.batch();

  const groupRef = db.collection("groups").doc();

  batch.set(groupRef, {
    groupId: groupRef.id,
    name: groupData.name.trim(),
    description: groupData.description?.trim() ?? null,
    createdBy,
    memberIds: [createdBy],
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  const memberRef = db
    .collection("groups")
    .doc(groupRef.id)
    .collection("members")
    .doc(createdBy);

  batch.set(memberRef, {
    uid: createdBy,
    role: "owner",
    joinedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  await batch.commit();

  await logAudit(
    createdBy,
    "group.created",
    "group",
    groupRef.id,
    null,
    { name: groupData.name }
  );

  return groupRef.id;
}

/**
 * Get single group
 */
export async function getGroup(groupId) {
  const snap = await db.collection("groups").doc(groupId).get();
  return snap.exists ? { id: snap.id, ...snap.data() } : null;
}

/**
 * Get groups for a user
 */
export async function getUserGroups(uid) {
  const snap = await db
    .collection("groups")
    .where("memberIds", "array-contains", uid)
    .get();

  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

/**
 * Add member to group
 */
export async function addGroupMember(groupId, uid, role = "member", actorId) {
  const batch = db.batch();

  const groupRef = db.collection("groups").doc(groupId);
  const groupSnap = await groupRef.get();

  const existing = groupSnap.data()?.memberIds ?? [];

  if (!existing.includes(uid)) {
    batch.update(groupRef, {
      memberIds: [...existing, uid],
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  const memberRef = db
    .collection("groups")
    .doc(groupId)
    .collection("members")
    .doc(uid);

  batch.set(
    memberRef,
    {
      uid,
      role,
      joinedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  await batch.commit();

  await logAudit(actorId, "member.added", "group", groupId, null, {
    uid,
    role,
  });
}

/**
 * Remove member
 */
export async function removeGroupMember(groupId, uid, actorId) {
  const batch = db.batch();

  const groupRef = db.collection("groups").doc(groupId);
  const snap = await groupRef.get();

  const existing = snap.data()?.memberIds ?? [];

  batch.update(groupRef, {
    memberIds: existing.filter((id) => id !== uid),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  batch.delete(
    db.collection("groups").doc(groupId).collection("members").doc(uid)
  );

  await batch.commit();

  await logAudit(actorId, "member.removed", "group", groupId, { uid }, null);
}

/**
 * Update group
 */
export async function updateGroup(groupId, updates, actorId) {
  const ref = db.collection("groups").doc(groupId);
  const before = (await ref.get()).data();

  await ref.update({
    ...updates,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  await logAudit(actorId, "group.updated", "group", groupId, before, updates);
}

/**
 * Delete group
 */
export async function deleteGroup(groupId, actorId) {
  const ref = db.collection("groups").doc(groupId);
  const before = (await ref.get()).data();

  const batch = db.batch();

  const membersSnap = await ref.collection("members").get();
  membersSnap.docs.forEach((d) => batch.delete(d.ref));

  batch.delete(ref);

  await batch.commit();

  await logAudit(actorId, "group.deleted", "group", groupId, before, null);
}

/**
 * Get group members
 */
export async function getGroupMembers(groupId) {
  const snap = await db
    .collection("groups")
    .doc(groupId)
    .collection("members")
    .get();

  return snap.docs.map((d) => d.data());
}