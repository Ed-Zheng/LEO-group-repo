import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../services/AuthContext";

export default function TaskDetails() {
  const { taskId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);

  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  const currentUserName = useMemo(() => {
    const matchedUser = users.find((u) => u.uid === user?.uid);
    return matchedUser?.name || user?.displayName || user?.email || "Unknown User";
  }, [users, user]);

  const resolveMessageSenderName = (message) => {
    const matchedUser = users.find((u) => u.uid === message.senderId);
    return matchedUser?.name || message.senderName || "Unknown User";
  };

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);

      const res = await fetch("http://localhost:5000/users");
      const text = await res.text();

      let data = [];
      try {
        data = text ? JSON.parse(text) : [];
      } catch {
        data = [];
      }

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch users");
      }

      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoadingUsers(false);
    }
  };

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

  const fetchMessages = async () => {
    try {
      const res = await fetch(`http://localhost:5000/messages/task/${taskId}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch messages");
      }

      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch messages:", err);
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
          authorName: currentUserName,
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

  const handleAddMessage = async () => {
    if (!newMessage.trim() || !task || !user || !canUseChat) return;

    try {
      setSendingMessage(true);

      const res = await fetch("http://localhost:5000/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          taskId,
          groupId: task.groupId ?? null,
          senderId: user.uid,
          senderName: currentUserName,
          text: newMessage,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send message");
      }

      setNewMessage("");
      await fetchMessages();
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setSendingMessage(false);
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
      await Promise.all([fetchUsers(), fetchTask(), fetchNotes(), fetchMessages()]);
      setLoading(false);
    };

    load();
  }, [taskId]);

  const canUseChat = (task?.assigneeIds?.length || 0) > 1;

  if (loading || loadingUsers) {
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
      <div style={{ marginBottom: "16px" }}>
        <button
          onClick={() => navigate("/dashboard")}
          style={{
            padding: "8px 12px",
            backgroundColor: "#374151",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          ← Back to Dashboard
        </button>
      </div>

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
          <div>
            <strong>Assigned Users:</strong> {task.assigneeIds?.length || 0}
          </div>
        </div>
      </div>

      {canUseChat && (
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
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <h2 style={{ margin: 0 }}>Task Chat</h2>
            <span style={{ color: "#6b7280", fontSize: "14px" }}>
              {messages.length} messages
            </span>
          </div>

          <div
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              padding: "14px",
              background: "#f9fafb",
              minHeight: "140px",
              maxHeight: "320px",
              overflowY: "auto",
              marginBottom: "16px",
            }}
          >
            {messages.length === 0 ? (
              <p style={{ color: "#6b7280", margin: 0 }}>
                No messages yet.
              </p>
            ) : (
              <div style={{ display: "grid", gap: "12px" }}>
                {messages.map((message) => {
                  const isMine = message.senderId === user?.uid;

                  return (
                    <div
                      key={message.id}
                      style={{
                        display: "flex",
                        justifyContent: isMine ? "flex-end" : "flex-start",
                      }}
                    >
                      <div
                        style={{
                          maxWidth: "75%",
                          background: isMine ? "#dbeafe" : "#ffffff",
                          border: "1px solid #e5e7eb",
                          borderRadius: "12px",
                          padding: "10px 12px",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "12px",
                            color: "#6b7280",
                            marginBottom: "4px",
                          }}
                        >
                          {isMine ? "You" : resolveMessageSenderName(message)}
                        </div>
                        <div style={{ color: "#111827", whiteSpace: "pre-wrap" }}>
                          {message.text}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Send a message..."
              style={{
                flex: 1,
                padding: "12px 14px",
                borderRadius: "10px",
                border: "1px solid #d1d5db",
                outline: "none",
              }}
            />
            <button
              onClick={handleAddMessage}
              disabled={sendingMessage || !newMessage.trim()}
              style={{
                padding: "12px 16px",
                borderRadius: "10px",
                border: "none",
                background: "#2563eb",
                color: "#ffffff",
                cursor: sendingMessage ? "not-allowed" : "pointer",
                opacity: sendingMessage ? 0.7 : 1,
              }}
            >
              {sendingMessage ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
      )}

      {!canUseChat && (
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
          <h2 style={{ marginTop: 0 }}>Task Chat</h2>
          <p style={{ color: "#6b7280", marginBottom: 0 }}>
            Chat becomes available when a task has multiple assigned users.
          </p>
        </div>
      )}

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