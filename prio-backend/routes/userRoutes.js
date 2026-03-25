import express from "express";
import { createUser } from "../services/userService.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { uid, name, email } = req.body;

    if (!uid || !name || !email) {
      return res.status(400).json({ error: "uid, name, email required" });
    }

    await createUser(uid, name, email);

    res.status(201).json({ message: "User created" });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Failed to create user" });
  }
});

export default router;