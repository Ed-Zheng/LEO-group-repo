import { useEffect, useMemo, useState } from "react";
import { API_BASE_URL } from "../services/api";
import { formatDateTime } from "../services/formatting";

export default function NotificationBell({ userId }) {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!userId) return;

    const loadNotifications = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/notifications/user/${userId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load notifications");
        setItems(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to load notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, [userId]);

  const unreadCount = useMemo(
    () => items.filter((item) => item && item.read === false).length,
    [items]
  );

  const markAsRead = async (notificationId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
        method: "PUT",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to mark notification as read");
      setItems((prev) => prev.map((item) => (item.id === notificationId ? { ...item, read: true } : item)));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/notifications/user/${userId}/read-all`, {
        method: "PUT",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to mark all notifications as read");
      setItems((prev) => prev.map((item) => ({ ...item, read: true })));
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  const removeNotification = async (notificationId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/notifications/${notificationId}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to delete notification");
      setItems((prev) => prev.filter((item) => item.id !== notificationId));
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        style={{
          position: "relative",
          border: "1px solid #d1d5db",
          background: "#fff",
          color: "#111827",
          borderRadius: 999,
          width: 42,
          height: 42,
          cursor: "pointer",
          display: "grid",
          placeItems: "center",
        }}
        aria-label="Notifications"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M15 17h5l-1.4-1.4a2 2 0 0 1-.6-1.4V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5" />
          <path d="M10 21a2 2 0 0 0 4 0" />
        </svg>
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: -4,
              right: -2,
              minWidth: 18,
              height: 18,
              borderRadius: 999,
              background: "#dc2626",
              color: "#fff",
              fontSize: 11,
              display: "grid",
              placeItems: "center",
              padding: "0 4px",
            }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 52,
            width: 340,
            maxHeight: 420,
            overflowY: "auto",
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 16,
            boxShadow: "0 12px 28px rgba(15, 23, 42, 0.12)",
            padding: 16,
            zIndex: 200,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <strong style={{ fontSize: 16, color: "#111827", fontWeight: 800, letterSpacing: "-0.01em" }}>
              Notifications
            </strong>
            <button
              type="button"
              onClick={markAllAsRead}
              disabled={items.length === 0}
              style={{
                border: "none",
                background: "transparent",
                color: "#2563eb",
                cursor: items.length ? "pointer" : "not-allowed",
                fontWeight: 600,
              }}
            >
              Mark all read
            </button>
          </div>

          {loading ? <p style={{ margin: 0 }}>Loading notifications...</p> : null}

          {!loading && items.length === 0 ? (
            <p style={{ margin: 0, color: "#6b7280" }}>No notifications yet.</p>
          ) : null}

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {items.map((item) => (
              <div
                key={item.id}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 14,
                  padding: 12,
                  background: item.read ? "#f9fafb" : "#eff6ff",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#111827" }}>{item.type?.replace(/_/g, " ") || "Notification"}</p>
                    <p style={{ margin: "6px 0", color: "#374151", lineHeight: 1.5 }}>{item.message}</p>
                    <p style={{ margin: 0, fontSize: 12, color: "#6b7280" }}>{formatDateTime(item.createdAt)}</p>
                  </div>
                  {!item.read && (
                    <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#2563eb", marginTop: 6, flexShrink: 0 }} />
                  )}
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                  {item.taskId ? (
                    <a
                      href={`/tasks/${item.taskId}`}
                      onClick={async () => {
                        if (!item.read) {
                          await markAsRead(item.id);
                        }
                        setOpen(false);
                      }}
                      style={actionButtonStyle("#2563eb")}
                    >
                      Open task
                    </a>
                  ) : null}
                  {!item.read ? (
                    <button type="button" onClick={() => markAsRead(item.id)} style={actionButtonStyle("#374151")}>
                      Mark read
                    </button>
                  ) : null}
                  <button type="button" onClick={() => removeNotification(item.id)} style={actionButtonStyle("#dc2626")}>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function actionButtonStyle(color) {
  return {
    border: "none",
    background: "transparent",
    color,
    cursor: "pointer",
    padding: 0,
    fontWeight: 600,
    textDecoration: "none",
  };
}
