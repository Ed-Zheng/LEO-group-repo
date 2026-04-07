import { db } from "../firebase.js";

export const createUser = async (uid, name, email) => {
  await db.collection("users").doc(uid).set({
    name,
    email,
  });
};

export const getAllUsers = async () => {
  const snap = await db.collection("users").get();

  return snap.docs.map((doc) => ({
    uid: doc.id,
    ...doc.data(),
  }));
};