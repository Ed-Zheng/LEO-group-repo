import { useEffect, useMemo, useState } from "react";
import { API_BASE_URL } from "../services/api";
import { formatDateTime } from "../services/formatting";

export default function ChatBox({ task, currentUser }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!task?.id) return;

    const loadMessages = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await fetch(`${API_BASE_URL}/messages/task/${task.id}`);
        const data = await res.json().catch(() => []);
        if (!res.ok) throw new Error(data.error || "Failed to load messages");
        setMessages(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [task?.id]);

  const canSend = useMemo(() => text.trim().length > 0 && !sending, [text, sending]);

  const sendMessage = async () => {
    if (!canSend || !currentUser?.uid) return;

    try {
      setSending(true);
      setError("");
      const payload = {
        taskId: task.id,
        groupId: task.groupId ?? null,
        senderId: currentUser.uid,
        senderName: currentUser.displayName || currentUser.email || "You",
        text,
      };

      const res = await fetch(`${API_BASE_URL}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to send message");

      setMessages((prev) => [
        ...prev,
        {
          id: data.id,
          text: text.trim(),
          senderId: currentUser.uid,
          senderName: currentUser.displayName || currentUser.email || "You",
          createdAt: new Date().toISOString(),
        },
      ]);
      setText("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <section style={sectionStyle}>
      <div style={headerStyle}>
        <div>
          <h3 style={sectionTitle}>Messages</h3>
          <p style={sectionHint}>Task conversation lives here.</p>
        </div>
      </div>

      <div style={feedStyle}>
        {loading ? <p style={mutedStyle}>Loading messages...</p> : null}
        {!loading && messages.length === 0 ? <p style={mutedStyle}>No messages yet.</p> : null}
        {messages.map((message) => {
          const mine = message.senderId === currentUser?.uid;
          return (
            <div
              key={message.id}
              style={{
                alignSelf: mine ? "flex-end" : "flex-start",
                background: mine ? "#dbeafe" : "#f3f4f6",
                color: "#111827",
                borderRadius: 16,
                padding: "10px 12px",
                maxWidth: "80%",
              }}
            >
              <p style={{ margin: 0, fontSize: 12, fontWeight: 700 }}>{message.senderName || "Unknown"}</p>
              <p style={{ margin: "6px 0", lineHeight: 1.5 }}>{message.text}</p>
              <p style={{ margin: 0, fontSize: 11, color: "#6b7280" }}>{formatDateTime(message.createdAt)}</p>
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 14 }}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          placeholder="Write a message"
          style={textareaStyle}
        />
        <button type="button" onClick={sendMessage} disabled={!canSend} style={primaryButtonStyle(canSend)}>
          {sending ? "Sending..." : "Send"}
        </button>
      </div>

      {error ? <p style={errorStyle}>{error}</p> : null}
    </section>
  );
}

const sectionStyle = {
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: 18,
  padding: 18,
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  marginBottom: 14,
};

const sectionTitle = { margin: 0, fontSize: 18, color: "#111827" };
const sectionHint = { margin: "6px 0 0", color: "#6b7280", fontSize: 13 };
const mutedStyle = { margin: 0, color: "#6b7280" };
const errorStyle = { margin: "12px 0 0", color: "#dc2626", fontSize: 13 };

const feedStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 10,
  minHeight: 120,
  maxHeight: 320,
  overflowY: "auto",
  padding: 4,
  background: "#f9fafb",
  borderRadius: 14,
};

const textareaStyle = {
  flex: 1,
  borderRadius: 14,
  border: "1px solid #d1d5db",
  padding: 12,
  fontFamily: "inherit",
  fontSize: 14,
  resize: "vertical",
};

function primaryButtonStyle(enabled) {
  return {
    border: "none",
    borderRadius: 14,
    background: enabled ? "#2563eb" : "#93c5fd",
    color: "#fff",
    padding: "0 18px",
    fontWeight: 700,
    cursor: enabled ? "pointer" : "not-allowed",
  };
}
