import { db } from "../firebase.js";

export const createUser = async (uid, name, email) => {
  await db.collection("users").doc(uid).set({
    name,
    email,
  });
};