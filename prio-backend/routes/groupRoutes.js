import express from "express";
import {
  createGroup,
  getGroup,
  getUserGroups,
  addGroupMember,
  getGroupMembers,
} from "../services/groupService.js";

const router = express.Router();

// test route
router.get("/", (req, res) => {
  res.json({ message: "Group routes working" });
});

// create a group
router.post("/", async (req, res) => {
  try {
    const { name, description, createdBy } = req.body;
    const groupId = await createGroup({ name, description }, createdBy);
    res.status(201).json({ groupId, message: "Group created successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// get one group
router.get("/:groupId", async (req, res) => {
  try {
    const group = await getGroup(req.params.groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }
    res.json(group);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// get all groups for a user
router.get("/user/:uid", async (req, res) => {
  try {
    const groups = await getUserGroups(req.params.uid);
    res.json(groups);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// join/add member to group
router.post("/:groupId/join", async (req, res) => {
  try {
    const { uid, actorId, role } = req.body;
    await addGroupMember(req.params.groupId, uid, role || "member", actorId);
    res.json({ message: "User added to group successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// get group members
router.get("/:groupId/members", async (req, res) => {
  try {
    const members = await getGroupMembers(req.params.groupId);
    res.json(members);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;