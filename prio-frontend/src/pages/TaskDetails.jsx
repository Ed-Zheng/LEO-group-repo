import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../services/AuthContext";

export default function TaskDetails() {
  const { taskId } = useParams();
  const { user } = useAuth();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);

  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  const fetchTask = async () => {
    try {
      const res = await fetch(`http://localhost:5000/tasks/${taskId}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch task");
      }

      setTask(data);
    } catch (err) {
      console.error("Failed to fetch task:", err);
    }
  };

  const fetchNotes = async () => {
    try {
      const res = await fetch(`http://localhost:5000/notes/task/${taskId}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch notes");
      }

      setNotes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch notes:", err);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim() || !task || !user) return;

    try {
      setSavingNote(true);

      const res = await fetch("http://localhost:5000/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          taskId,
          groupId: task.groupId ?? null,
          authorId: user.uid,
          authorName: user.displayName || user.email || "Unknown User",
          text: newNote,
          pinned: false,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create note");
      }

      setNewNote("");
      await fetchNotes();
    } catch (err) {
      console.error("Failed to create note:", err);
    } finally {
      setSavingNote(false);
    }
  };

  const handleTogglePin = async (note) => {
    if (!user) return;

    try {
      const res = await fetch(`http://localhost:5000/notes/${note.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pinned: !note.pinned,
          actorId: user.uid,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update note");
      }

      await fetchNotes();
    } catch (err) {
      console.error("Failed to toggle pin:", err);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!user) return;

    try {
      const res = await fetch(`http://localhost:5000/notes/${noteId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          actorId: user.uid,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to delete note");
      }

      await fetchNotes();
    } catch (err) {
      console.error("Failed to delete note:", err);
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchTask(), fetchNotes()]);
      setLoading(false);
    };

    load();
  }, [taskId]);

  if (loading) {
    return (
      <div style={{ padding: "24px", color: "#111827" }}>
        Loading task details...
      </div>
    );
  }

  if (!task) {
    return (
      <div style={{ padding: "24px", color: "#111827" }}>
        Task not found.
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "0 auto",
        padding: "24px",
        color: "#111827",
      }}
    >
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e5e7eb",
          borderRadius: "16px",
          padding: "24px",
          marginBottom: "24px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
        }}
      >
        <h1 style={{ marginTop: 0, marginBottom: "12px" }}>{task.title}</h1>

        <p style={{ margin: "0 0 12px 0", color: "#4b5563" }}>
          {task.description || "No description provided."}
        </p>

        <div style={{ display: "grid", gap: "8px", color: "#374151" }}>
          <div>
            <strong>Status:</strong> {task.status || "N/A"}
          </div>
          <div>
            <strong>Priority:</strong> {task.priority || "N/A"}
          </div>
          <div>
            <strong>Deadline:</strong> {task.deadline || "N/A"}
          </div>
          <div>
            <strong>Group ID:</strong> {task.groupId || "N/A"}
          </div>
        </div>
      </div>

      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e5e7eb",
          borderRadius: "16px",
          padding: "24px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <h2 style={{ margin: 0 }}>Notes</h2>
          <span style={{ color: "#6b7280", fontSize: "14px" }}>
            {notes.length} total
          </span>
        </div>

        <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
          <input
            type="text"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add a note..."
            style={{
              flex: 1,
              padding: "12px 14px",
              borderRadius: "10px",
              border: "1px solid #d1d5db",
              outline: "none",
            }}
          />
          <button
            onClick={handleAddNote}
            disabled={savingNote || !newNote.trim()}
            style={{
              padding: "12px 16px",
              borderRadius: "10px",
              border: "none",
              background: "#111827",
              color: "#ffffff",
              cursor: savingNote ? "not-allowed" : "pointer",
              opacity: savingNote ? 0.7 : 1,
            }}
          >
            {savingNote ? "Saving..." : "Add Note"}
          </button>
        </div>

        {notes.length === 0 ? (
          <p style={{ color: "#6b7280", margin: 0 }}>No notes yet.</p>
        ) : (
          <div style={{ display: "grid", gap: "12px" }}>
            {notes.map((note) => (
              <div
                key={note.id}
                style={{
                  border: note.pinned
                    ? "1px solid #f59e0b"
                    : "1px solid #e5e7eb",
                  background: note.pinned ? "#fffbeb" : "#f9fafb",
                  borderRadius: "12px",
                  padding: "14px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "12px",
                    alignItems: "flex-start",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: "13px",
                        color: "#6b7280",
                        marginBottom: "6px",
                      }}
                    >
                      {note.authorName || "Unknown User"}
                      {note.pinned ? " • Pinned" : ""}
                    </div>
                    <div style={{ color: "#111827" }}>{note.text}</div>
                  </div>

                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => handleTogglePin(note)}
                      style={{
                        padding: "8px 10px",
                        borderRadius: "8px",
                        border: "1px solid #d1d5db",
                        background: "#fff",
                        cursor: "pointer",
                      }}
                    >
                      {note.pinned ? "Unpin" : "Pin"}
                    </button>

                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      style={{
                        padding: "8px 10px",
                        borderRadius: "8px",
                        border: "1px solid #fecaca",
                        background: "#fef2f2",
                        color: "#b91c1c",
                        cursor: "pointer",
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}