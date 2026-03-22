/**
 * groupService.js
 * Create, join, manage, and delete groups (teams) in Firestore.
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
  serverTimestamp,
  writeBatch,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase";
import { logAudit } from "./auditService";

/**
 * Create a new group. The creator is automatically added as owner.
 * @param {object} groupData – { name, description? }
 * @param {string} createdBy – uid
 * @returns {Promise<string>} groupId
 */
export async function createGroup(groupData, createdBy) {
  const batch = writeBatch(db);

  const groupRef = doc(collection(db, "groups"));
  batch.set(groupRef, {
    groupId:     groupRef.id,
    name:        groupData.name.trim(),
    description: groupData.description?.trim() ?? null,
    createdBy,
    memberIds:   [createdBy],
    createdAt:   serverTimestamp(),
    updatedAt:   serverTimestamp(),
  });

  // Add creator as owner in members subcollection
  const memberRef = doc(db, "groups", groupRef.id, "members", createdBy);
  batch.set(memberRef, {
    uid:      createdBy,
    role:     "owner",
    joinedAt: serverTimestamp(),
  });

  await batch.commit();
  await logAudit(createdBy, "group.created", "group", groupRef.id, null, { name: groupData.name });
  return groupRef.id;
}

/**
 * Fetch a single group.
 * @param {string} groupId
 * @returns {Promise<object|null>}
 */
export async function getGroup(groupId) {
  const snap = await getDoc(doc(db, "groups", groupId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

/**
 * Fetch all groups a user belongs to.
 * @param {string} uid
 * @returns {Promise<object[]>}
 */
export async function getUserGroups(uid) {
  const q    = query(collection(db, "groups"), where("memberIds", "array-contains", uid));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * Real-time listener for a user's groups.
 * @param {string} uid
 * @param {function} callback
 * @returns {function} unsubscribe
 */
export function subscribeUserGroups(uid, callback) {
  const q = query(collection(db, "groups"), where("memberIds", "array-contains", uid));
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
}

/**
 * Add a user to a group.
 * @param {string} groupId
 * @param {string} uid      – user to add
 * @param {string} role     – "member" | "admin"
 * @param {string} actorId  – uid of person performing the action
 */
export async function addGroupMember(groupId, uid, role = "member", actorId) {
  const batch = writeBatch(db);

  // Add to memberIds array on group doc
  const groupRef  = doc(db, "groups", groupId);
  const groupSnap = await getDoc(groupRef);
  const existing  = groupSnap.data()?.memberIds ?? [];
  if (!existing.includes(uid)) {
    batch.update(groupRef, {
      memberIds: [...existing, uid],
      updatedAt: serverTimestamp(),
    });
  }

  // Upsert member subdoc
  const memberRef = doc(db, "groups", groupId, "members", uid);
  batch.set(memberRef, { uid, role, joinedAt: serverTimestamp() }, { merge: true });

  await batch.commit();
  await logAudit(actorId, "member.added", "group", groupId, null, { uid, role });
}

/**
 * Remove a user from a group.
 * @param {string} groupId
 * @param {string} uid
 * @param {string} actorId
 */
export async function removeGroupMember(groupId, uid, actorId) {
  const batch    = writeBatch(db);
  const groupRef = doc(db, "groups", groupId);
  const snap     = await getDoc(groupRef);
  const existing = snap.data()?.memberIds ?? [];

  batch.update(groupRef, {
    memberIds: existing.filter(id => id !== uid),
    updatedAt: serverTimestamp(),
  });
  batch.delete(doc(db, "groups", groupId, "members", uid));

  await batch.commit();
  await logAudit(actorId, "member.removed", "group", groupId, { uid }, null);
}

/**
 * Update group name/description.
 * @param {string} groupId
 * @param {object} updates – { name?, description? }
 * @param {string} actorId
 */
export async function updateGroup(groupId, updates, actorId) {
  const ref    = doc(db, "groups", groupId);
  const before = (await getDoc(ref)).data();
  await updateDoc(ref, { ...updates, updatedAt: serverTimestamp() });
  await logAudit(actorId, "group.updated", "group", groupId, before, updates);
}

/**
 * Delete a group and its members subcollection.
 * Note: tasks belonging to this group should be handled separately.
 * @param {string} groupId
 * @param {string} actorId
 */
export async function deleteGroup(groupId, actorId) {
  const ref    = doc(db, "groups", groupId);
  const before = (await getDoc(ref)).data();
  const batch  = writeBatch(db);

  const membersSnap = await getDocs(collection(db, "groups", groupId, "members"));
  membersSnap.docs.forEach(d => batch.delete(d.ref));
  batch.delete(ref);

  await batch.commit();
  await logAudit(actorId, "group.deleted", "group", groupId, before, null);
}

/**
 * Fetch all members of a group with their roles.
 * @param {string} groupId
 * @returns {Promise<object[]>}  [{ uid, role, joinedAt }]
 */
export async function getGroupMembers(groupId) {
  const snap = await getDocs(collection(db, "groups", groupId, "members"));
  return snap.docs.map(d => d.data());
}
