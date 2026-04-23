import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import ChatBox from "../components/ChatBox";
import { useAuth } from "../services/AuthContext";
import { API_BASE_URL } from "../services/api";
import { formatDate, formatDateTime, formatMoney } from "../services/formatting";

export default function TaskDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [task, setTask] = useState(null);
  const [users, setUsers] = useState([]);
  const [notes, setNotes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [auditLog, setAuditLog] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [noteText, setNoteText] = useState("");
  const [pinNote, setPinNote] = useState(false);
  const [expenseForm, setExpenseForm] = useState({ amount: "", description: "", currency: "USD" });
  const [savingNote, setSavingNote] = useState(false);
  const [savingExpense, setSavingExpense] = useState(false);

  useEffect(() => {
    if (!id || !user?.uid) return;

    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const [taskRes, usersRes] = await Promise.all([
          fetch(`${API_BASE_URL}/tasks/${id}`),
          fetch(`${API_BASE_URL}/users`),
        ]);

        const [taskData, usersData] = await Promise.all([
          taskRes.json().catch(() => ({})),
          usersRes.json().catch(() => []),
        ]);

        if (!taskRes.ok) throw new Error(taskData.error || "Failed to load task");
        if (!usersRes.ok) throw new Error(usersData.error || "Failed to load users");

        setTask(taskData);
        setUsers(Array.isArray(usersData) ? usersData : []);

        const sectionResults = await Promise.allSettled([
          fetch(`${API_BASE_URL}/notes/task/${id}`).then((res) =>
            res.json().then((data) => {
              if (!res.ok) throw new Error(data.error || "Failed to load notes");
              return Array.isArray(data) ? data : [];
            })
          ),
          fetch(`${API_BASE_URL}/expenses/task/${id}`).then((res) =>
            res.json().then((data) => {
              if (!res.ok) throw new Error(data.error || "Failed to load expenses");
              return Array.isArray(data) ? data : [];
            })
          ),
          fetch(`${API_BASE_URL}/audit/entity/${id}`).then((res) =>
            res.json().then((data) => {
              if (!res.ok) throw new Error(data.error || "Failed to load audit log");
              return Array.isArray(data) ? data : [];
            })
          ),
          fetch(`${API_BASE_URL}/notifications/user/${user.uid}`).then((res) =>
            res.json().then((data) => {
              if (!res.ok) throw new Error(data.error || "Failed to load notifications");
              return (Array.isArray(data) ? data : []).filter((item) => item.taskId === id);
            })
          ),
        ]);

        if (sectionResults[0].status === "fulfilled") setNotes(sectionResults[0].value);
        if (sectionResults[1].status === "fulfilled") setExpenses(sectionResults[1].value);
        if (sectionResults[2].status === "fulfilled") setAuditLog(sectionResults[2].value);
        if (sectionResults[3].status === "fulfilled") setNotifications(sectionResults[3].value);

        const failedSections = sectionResults
          .filter((result) => result.status === "rejected")
          .map((result) => result.reason?.message)
          .filter(Boolean);

        if (failedSections.length > 0) {
          setError(failedSections.join(" | "));
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, user?.uid]);

  const assignees = useMemo(() => {
    if (!task?.assigneeIds) return [];
    return task.assigneeIds.map((uid) => {
      const match = users.find((entry) => entry.uid === uid);
      if (uid === user?.uid) {
        return { uid, displayName: match?.name || "You", email: match?.email || user?.email };
      }
      return { uid, displayName: match?.name || uid, email: match?.email || uid };
    });
  }, [task?.assigneeIds, users, user]);

  const submitNote = async () => {
    if (!noteText.trim()) return;
    try {
      setSavingNote(true);
      const res = await fetch(`${API_BASE_URL}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: task.id,
          groupId: task.groupId ?? null,
          authorId: user.uid,
          authorName: user.displayName || user.email || "You",
          text: noteText,
          pinned: pinNote,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to save note");
      setNotes((prev) => [
        {
          id: data.id,
          taskId: task.id,
          groupId: task.groupId ?? null,
          authorId: user.uid,
          authorName: user.displayName || user.email || "You",
          text: noteText.trim(),
          pinned: pinNote,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ].sort((a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned))));
      setNoteText("");
      setPinNote(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingNote(false);
    }
  };

  const togglePin = async (note) => {
    try {
      const res = await fetch(`${API_BASE_URL}/notes/${note.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pinned: !note.pinned, actorId: user.uid }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to update note");
      setNotes((prev) =>
        prev
          .map((item) => (item.id === note.id ? { ...item, pinned: !item.pinned } : item))
          .sort((a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)))
      );
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteNote = async (noteId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/notes/${noteId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actorId: user.uid }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to delete note");
      setNotes((prev) => prev.filter((note) => note.id !== noteId));
    } catch (err) {
      setError(err.message);
    }
  };

  const submitExpense = async () => {
    const amount = Number(expenseForm.amount);
    if (!amount || !expenseForm.description.trim()) return;
    try {
      setSavingExpense(true);
      const res = await fetch(`${API_BASE_URL}/expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: task.id,
          groupId: task.groupId ?? null,
          amount,
          currency: expenseForm.currency || "USD",
          description: expenseForm.description,
          submittedBy: user.uid,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to add expense");
      setExpenses((prev) => [
        {
          id: data.id,
          taskId: task.id,
          groupId: task.groupId ?? null,
          amount,
          currency: expenseForm.currency || "USD",
          description: expenseForm.description.trim(),
          submittedBy: user.uid,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
      setExpenseForm({ amount: "", description: "", currency: expenseForm.currency || "USD" });
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingExpense(false);
    }
  };

  if (loading) {
    return <PageShell userId={user?.uid}><p style={{ color: "#e5e7eb" }}>Loading task details...</p></PageShell>;
  }

  if (error && !task) {
    return (
      <PageShell userId={user?.uid}>
        <p style={{ color: "#fecaca" }}>{error}</p>
        <button type="button" onClick={() => navigate("/dashboard")} style={backButtonStyle}>Back to dashboard</button>
      </PageShell>
    );
  }

  return (
    <PageShell userId={user?.uid}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <div>
          <Link to="/dashboard" style={{ color: "#93c5fd", textDecoration: "none", fontWeight: 600 }}>
            Back to dashboard
          </Link>
          <h1 style={{ margin: "10px 0 6px", color: "#f9fafb", fontSize: 34 }}>{task?.title}</h1>
          <p style={{ margin: 0, color: "#cbd5e1", maxWidth: 720 }}>{task?.description || "No description yet."}</p>
        </div>
        <div style={{ textAlign: "right", color: "#cbd5e1" }}>
          <p style={{ margin: 0 }}><strong>Status:</strong> {task?.status || "Pending"}</p>
          <p style={{ margin: "8px 0 0" }}><strong>Deadline:</strong> {task?.deadline ? formatDate(task.deadline) : "None"}</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 18, alignItems: "start" }}>
        <div style={{ display: "grid", gap: 18 }}>
          <ChatBox task={task} currentUser={user} />

          <section style={cardStyle}>
            <div style={cardHeaderStyle}>
              <div>
                <h3 style={cardTitleStyle}>Notes and Pins</h3>
                <p style={hintStyle}>Quick context, decisions, and pinned callouts for this task.</p>
              </div>
            </div>
            <div style={{ display: "grid", gap: 10 }}>
              <textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} rows={3} placeholder="Add a note" style={textareaStyle} />
              <label style={{ display: "flex", alignItems: "center", gap: 8, color: "#374151", fontSize: 14 }}>
                <input type="checkbox" checked={pinNote} onChange={(e) => setPinNote(e.target.checked)} />
                Pin this note
              </label>
              <button type="button" onClick={submitNote} disabled={savingNote || !noteText.trim()} style={primaryButtonStyle(savingNote || !noteText.trim())}>
                {savingNote ? "Saving..." : "Add note"}
              </button>
            </div>
            <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
              {notes.length === 0 ? <p style={hintStyle}>No notes yet.</p> : null}
              {notes.map((note) => (
                <div key={note.id} style={{ border: "1px solid #e5e7eb", borderRadius: 14, padding: 12, background: note.pinned ? "#fffbeb" : "#f9fafb" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
                    <div>
                      <p style={{ margin: 0, fontWeight: 700, color: "#111827" }}>{note.authorName || "Unknown"}</p>
                      <p style={{ margin: "6px 0", color: "#374151", whiteSpace: "pre-wrap" }}>{note.text}</p>
                      <p style={{ margin: 0, fontSize: 12, color: "#6b7280" }}>{formatDateTime(note.createdAt)}</p>
                    </div>
                    {note.pinned ? <span style={pinPillStyle}>Pinned</span> : null}
                  </div>
                  <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
                    <button type="button" onClick={() => togglePin(note)} style={linkButtonStyle("#2563eb")}>
                      {note.pinned ? "Unpin" : "Pin"}
                    </button>
                    <button type="button" onClick={() => deleteNote(note.id)} style={linkButtonStyle("#dc2626")}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section style={cardStyle}>
            <div style={cardHeaderStyle}>
              <div>
                <h3 style={cardTitleStyle}>Expenses</h3>
                <p style={hintStyle}>Track costs tied to this task.</p>
              </div>
              <div style={{ color: "#111827", fontWeight: 700 }}>
                Total: {formatMoney(expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0), expenses[0]?.currency || "USD")}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "140px 1fr 110px auto", gap: 10 }}>
              <input value={expenseForm.amount} onChange={(e) => setExpenseForm((prev) => ({ ...prev, amount: e.target.value }))} placeholder="Amount" type="number" min="0" step="0.01" style={inputStyle} />
              <input value={expenseForm.description} onChange={(e) => setExpenseForm((prev) => ({ ...prev, description: e.target.value }))} placeholder="Description" style={inputStyle} />
              <input value={expenseForm.currency} onChange={(e) => setExpenseForm((prev) => ({ ...prev, currency: e.target.value.toUpperCase() }))} placeholder="USD" maxLength={3} style={inputStyle} />
              <button type="button" onClick={submitExpense} disabled={savingExpense} style={primaryButtonStyle(savingExpense)}>
                {savingExpense ? "Saving..." : "Add"}
              </button>
            </div>
            <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
              {expenses.length === 0 ? <p style={hintStyle}>No expenses logged yet.</p> : null}
              {expenses.map((expense) => (
                <div key={expense.id} style={listRowStyle}>
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, color: "#111827" }}>{formatMoney(expense.amount, expense.currency)}</p>
                    <p style={{ margin: "6px 0 0", color: "#374151" }}>{expense.description}</p>
                  </div>
                  <p style={{ margin: 0, fontSize: 12, color: "#6b7280" }}>{formatDateTime(expense.createdAt)}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div style={{ display: "grid", gap: 18 }}>
          <section style={cardStyle}>
            <h3 style={cardTitleStyle}>Task Snapshot</h3>
            <div style={{ display: "grid", gap: 10, marginTop: 12, color: "#374151" }}>
              <p style={{ margin: 0 }}><strong>Priority:</strong> {task?.priority || "Medium"}</p>
              <p style={{ margin: 0 }}><strong>Status:</strong> {task?.status || "Pending"}</p>
              <p style={{ margin: 0 }}><strong>Created by:</strong> {task?.createdBy === user?.uid ? "You" : task?.createdBy}</p>
              <p style={{ margin: 0 }}><strong>Assignees:</strong> {assignees.length ? assignees.map((assignee) => assignee.displayName || assignee.email).join(", ") : "None"}</p>
            </div>
          </section>

          <section style={cardStyle}>
            <h3 style={cardTitleStyle}>Related Notifications</h3>
            <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
              {notifications.length === 0 ? <p style={hintStyle}>No task-specific notifications yet.</p> : null}
              {notifications.map((item) => (
                <div key={item.id} style={{ ...listRowStyle, background: item.read ? "#f9fafb" : "#eff6ff" }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, color: "#111827" }}>{item.type?.replace(/_/g, " ")}</p>
                    <p style={{ margin: "6px 0 0", color: "#374151" }}>{item.message}</p>
                  </div>
                  <p style={{ margin: 0, fontSize: 12, color: "#6b7280" }}>{formatDateTime(item.createdAt)}</p>
                </div>
              ))}
            </div>
          </section>

          <section style={cardStyle}>
            <h3 style={cardTitleStyle}>Audit History</h3>
            <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
              {auditLog.length === 0 ? <p style={hintStyle}>No audit events yet.</p> : null}
              {auditLog.map((entry) => (
                <div key={entry.id} style={listRowStyle}>
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, color: "#111827" }}>{entry.action}</p>
                    <p style={{ margin: "6px 0 0", color: "#374151" }}>Actor: {entry.actorId === user?.uid ? "You" : entry.actorId}</p>
                  </div>
                  <p style={{ margin: 0, fontSize: 12, color: "#6b7280" }}>{formatDateTime(entry.timestamp)}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {error ? <p style={{ marginTop: 16, color: "#fecaca" }}>{error}</p> : null}
    </PageShell>
  );
}

function PageShell({ userId, children }) {
  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", padding: "32px 24px 56px" }}>
      <div style={{ width: "100%", maxWidth: 1220, margin: "0 auto" }}>
        <Navbar userId={userId} />
        <div style={{ marginTop: 22 }}>{children}</div>
      </div>
    </div>
  );
}

const cardStyle = {
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: 18,
  padding: 18,
};

const cardHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 16,
};

const cardTitleStyle = { margin: 0, fontSize: 18, color: "#111827" };
const hintStyle = { margin: "6px 0 0", color: "#6b7280", fontSize: 13 };
const inputStyle = { border: "1px solid #d1d5db", borderRadius: 12, padding: "10px 12px", fontSize: 14 };
const textareaStyle = { ...inputStyle, minHeight: 96, resize: "vertical", fontFamily: "inherit" };
const backButtonStyle = { border: "none", borderRadius: 12, background: "#2563eb", color: "#fff", padding: "10px 16px", cursor: "pointer" };
const pinPillStyle = { alignSelf: "start", background: "#f59e0b", color: "#fff", borderRadius: 999, padding: "4px 10px", fontSize: 12, fontWeight: 700 };
const listRowStyle = { display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start", border: "1px solid #e5e7eb", borderRadius: 14, padding: 12, background: "#f9fafb" };

function primaryButtonStyle(disabled) {
  return {
    border: "none",
    borderRadius: 12,
    background: disabled ? "#93c5fd" : "#2563eb",
    color: "#fff",
    padding: "10px 14px",
    fontWeight: 700,
    cursor: disabled ? "not-allowed" : "pointer",
  };
}

function linkButtonStyle(color) {
  return {
    border: "none",
    background: "transparent",
    color,
    padding: 0,
    cursor: "pointer",
    fontWeight: 700,
  };
}
