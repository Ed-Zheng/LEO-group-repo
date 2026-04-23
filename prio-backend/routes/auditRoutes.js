import express from "express";
import {
  getEntityAuditLog,
  getUserAuditLog,
} from "../services/auditService.js";

const router = express.Router();

// GET /audit/entity/:entityId
router.get("/entity/:entityId", async (req, res) => {
  try {
    const maxResults = req.query.limit ? Number(req.query.limit) : 50;
    const logs = await getEntityAuditLog(req.params.entityId, maxResults);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/user/:actorId", async (req, res) => {
  try {
    const maxResults = req.query.limit ? Number(req.query.limit) : 100;
    const logs = await getUserAuditLog(req.params.actorId, maxResults);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
