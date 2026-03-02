import { useState } from "react";

const PRIORITY_CONFIG = {
  high:   { label: "High",   color: "#ef4444", bg: "#fef2f2" },
  medium: { label: "Medium", color: "#f59e0b", bg: "#fffbeb" },
  low:    { label: "Low",    color: "#22c55e", bg: "#f0fdf4" },
};

const STATUS_CONFIG = {
  pending:     { label: "Pending",     color: "#6b7280", bg: "#f3f4f6" },
  in_progress: { label: "In Progress", color: "#3b82f6", bg: "#eff6ff" },
  completed:   { label: "Completed",   color: "#10b981", bg: "#ecfdf5" },
};

/**
 * TaskCard
 * Props:
 *   task       – { id, title, description, deadline, priority, status, assignees, subtasks }
 *   onEdit     – (task) => void
 *   onDelete   – (taskId) => void
 *   onStatusChange – (taskId, newStatus) => void
 *   onClick    – (task) => void   (open detail view)
 */
export default function TaskCard({ task, onEdit, onDelete, onStatusChange, onClick }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const priority = PRIORITY_CONFIG[task.priority] ?? PRIORITY_CONFIG.medium;
  const status   = STATUS_CONFIG[task.status]     ?? STATUS_CONFIG.pending;

  const completedSubtasks = (task.subtasks ?? []).filter(s => s.completed).length;
  const totalSubtasks     = (task.subtasks ?? []).length;

  const isOverdue =
    task.deadline &&
    new Date(task.deadline) < new Date() &&
    task.status !== "completed";

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
    });
  };

  return (
    <div
      className="task-card"
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderLeft: `4px solid ${priority.color}`,
        borderRadius: "10px",
        padding: "16px",
        cursor: "pointer",
        position: "relative",
        transition: "box-shadow 0.15s ease, transform 0.15s ease",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      }}
      onClick={() => onClick?.(task)}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
        e.currentTarget.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.06)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* Header row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <h3 style={{
          margin: 0,
          fontSize: "15px",
          fontWeight: 600,
          color: "#111827",
          lineHeight: 1.4,
          flex: 1,
          textDecoration: task.status === "completed" ? "line-through" : "none",
          opacity: task.status === "completed" ? 0.6 : 1,
        }}>
          {task.title}
        </h3>

        {/* Kebab menu */}
        <div style={{ position: "relative" }} onClick={e => e.stopPropagation()}>
          <button
            onClick={() => setMenuOpen(v => !v)}
            style={{
              background: "none", border: "none", cursor: "pointer",
              padding: "2px 6px", fontSize: "18px", color: "#9ca3af", borderRadius: 4,
            }}
          >⋮</button>
          {menuOpen && (
            <div style={{
              position: "absolute", right: 0, top: "100%", zIndex: 20,
              background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8,
              boxShadow: "0 8px 24px rgba(0,0,0,0.12)", minWidth: 140, overflow: "hidden",
            }}>
              {["pending", "in_progress", "completed"].map(s => (
                <button key={s}
                  onClick={() => { onStatusChange?.(task.id, s); setMenuOpen(false); }}
                  style={{
                    display: "block", width: "100%", textAlign: "left",
                    padding: "8px 14px", background: "none", border: "none",
                    cursor: "pointer", fontSize: "13px", color: "#374151",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "#f9fafb"}
                  onMouseLeave={e => e.currentTarget.style.background = "none"}
                >
                  Mark {STATUS_CONFIG[s].label}
                </button>
              ))}
              <hr style={{ margin: "4px 0", border: "none", borderTop: "1px solid #f3f4f6" }} />
              <button onClick={() => { onEdit?.(task); setMenuOpen(false); }}
                style={{ display: "block", width: "100%", textAlign: "left", padding: "8px 14px", background: "none", border: "none", cursor: "pointer", fontSize: "13px", color: "#374151" }}
                onMouseEnter={e => e.currentTarget.style.background = "#f9fafb"}
                onMouseLeave={e => e.currentTarget.style.background = "none"}
              >Edit</button>
              <button onClick={() => { onDelete?.(task.id); setMenuOpen(false); }}
                style={{ display: "block", width: "100%", textAlign: "left", padding: "8px 14px", background: "none", border: "none", cursor: "pointer", fontSize: "13px", color: "#ef4444" }}
                onMouseEnter={e => e.currentTarget.style.background = "#fef2f2"}
                onMouseLeave={e => e.currentTarget.style.background = "none"}
              >Delete</button>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <p style={{
          margin: "8px 0 0", fontSize: "13px", color: "#6b7280",
          lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>
          {task.description}
        </p>
      )}

      {/* Subtask progress bar */}
      {totalSubtasks > 0 && (
        <div style={{ marginTop: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#9ca3af", marginBottom: 4 }}>
            <span>Subtasks</span>
            <span>{completedSubtasks}/{totalSubtasks}</span>
          </div>
          <div style={{ background: "#f3f4f6", borderRadius: 99, height: 5 }}>
            <div style={{
              background: priority.color,
              borderRadius: 99, height: "100%",
              width: `${totalSubtasks ? (completedSubtasks / totalSubtasks) * 100 : 0}%`,
              transition: "width 0.3s ease",
            }} />
          </div>
        </div>
      )}

      {/* Footer row */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
        {/* Priority badge */}
        <span style={{
          fontSize: "11px", fontWeight: 600, padding: "2px 8px", borderRadius: 99,
          color: priority.color, background: priority.bg,
        }}>
          {priority.label}
        </span>

        {/* Status badge */}
        <span style={{
          fontSize: "11px", fontWeight: 500, padding: "2px 8px", borderRadius: 99,
          color: status.color, background: status.bg,
        }}>
          {status.label}
        </span>

        {/* Deadline */}
        {task.deadline && (
          <span style={{
            fontSize: "11px", padding: "2px 8px", borderRadius: 99, marginLeft: "auto",
            color: isOverdue ? "#ef4444" : "#6b7280",
            background: isOverdue ? "#fef2f2" : "#f9fafb",
            fontWeight: isOverdue ? 600 : 400,
          }}>
            {isOverdue ? "⚠ " : "📅 "}{formatDate(task.deadline)}
          </span>
        )}
      </div>

      {/* Assignee avatars */}
      {task.assignees?.length > 0 && (
        <div style={{ display: "flex", gap: -6, marginTop: 10 }}>
          {task.assignees.slice(0, 4).map((user, i) => (
            <div key={user.uid ?? i} title={user.displayName ?? user.email}
              style={{
                width: 26, height: 26, borderRadius: "50%",
                background: `hsl(${(user.displayName?.charCodeAt(0) ?? 65) * 10}, 55%, 55%)`,
                border: "2px solid #fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "11px", fontWeight: 700, color: "#fff",
                marginLeft: i === 0 ? 0 : -8,
              }}>
              {(user.displayName ?? user.email ?? "?")[0].toUpperCase()}
            </div>
          ))}
          {task.assignees.length > 4 && (
            <div style={{
              width: 26, height: 26, borderRadius: "50%", background: "#f3f4f6",
              border: "2px solid #fff", display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: "10px", color: "#6b7280", marginLeft: -8,
            }}>
              +{task.assignees.length - 4}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
