import express from "express";
import {
  createExpense,
  getGroupExpenses,
  getTaskExpenses,
  updateExpense,
  deleteExpense,
  getGroupExpenseSummary,
} from "../services/expenseService.js";

const router = express.Router();

// POST /expenses
router.post("/", async (req, res) => {
  try {
    const { taskId, groupId, amount, currency, description, submittedBy } = req.body;

    const id = await createExpense(
      { taskId, groupId, amount, currency, description },
      submittedBy
    );

    res.status(201).json({ id, message: "Expense created" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /expenses/group/:groupId
router.get("/group/:groupId", async (req, res) => {
  const data = await getGroupExpenses(req.params.groupId);
  res.json(data);
});

// GET /expenses/task/:taskId
router.get("/task/:taskId", async (req, res) => {
  const data = await getTaskExpenses(req.params.taskId);
  res.json(data);
});

// PUT /expenses/:id
router.put("/:id", async (req, res) => {
  try {
    const { amount, description, actorId } = req.body;
    await updateExpense(req.params.id, { amount, description }, actorId);
    res.json({ message: "Expense updated" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /expenses/:id
router.delete("/:id", async (req, res) => {
  try {
    const { actorId } = req.body;
    await deleteExpense(req.params.id, actorId);
    res.json({ message: "Expense deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /expenses/summary/:groupId
router.get("/summary/:groupId", async (req, res) => {
  const data = await getGroupExpenseSummary(req.params.groupId);
  res.json(data);
});

export default router;