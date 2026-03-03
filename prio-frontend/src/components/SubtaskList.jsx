import { useState } from "react";

/**
 * SubtaskList
 * Props:
 *   subtasks       – [{ id, title, completed, assignee? }]
 *   onAdd          – (title: string) => void
 *   onToggle       – (subtaskId: string, completed: boolean) => void
 *   onDelete       – (subtaskId: string) => void
 *   readOnly       – boolean (default false)
 */
export default function SubtaskList({ subtasks = [], onAdd, onToggle, onDelete, readOnly = false }) {
  const [newTitle, setNewTitle] = useState("");
  const [adding, setAdding]     = useState(false);

  const completed = subtasks.filter(s => s.completed).length;
  const total     = subtasks.length;
  const progress  = total ? Math.round((completed / total) * 100) : 0;

  const handleAdd = () => {
    const trimmed = newTitle.trim();
    if (!trimmed) return;
    onAdd?.(trimmed);
    setNewTitle("");
    setAdding(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleAdd();
    if (e.key === "Escape") { setAdding(false); setNewTitle(""); }
  };

  return (
    <div style={{ fontFamily: "inherit" }}>
      {/* Header + progress */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <h4 style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "#374151", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Subtasks
        </h4>
        {total > 0 && (
          <span style={{ fontSize: "12px", color: "#9ca3af" }}>
            {completed}/{total} done
          </span>
        )}
      </div>

      {total > 0 && (
        <div style={{ background: "#f3f4f6", borderRadius: 99, height: 4, marginBottom: 12 }}>
          <div style={{
            height: "100%", borderRadius: 99,
            background: progress === 100 ? "#10b981" : "#3b82f6",
            width: `${progress}%`,
            transition: "width 0.3s ease",
          }} />
        </div>
      )}

      {/* Subtask items */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {subtasks.map(subtask => (
          <div key={subtask.id}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "8px 10px", borderRadius: 8,
              background: subtask.completed ? "#f9fafb" : "#fff",
              border: "1px solid #f3f4f6",
              transition: "background 0.15s",
            }}
          >
            {/* Checkbox */}
            <button
              onClick={() => !readOnly && onToggle?.(subtask.id, !subtask.completed)}
              style={{
                width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                border: subtask.completed ? "none" : "2px solid #d1d5db",
                background: subtask.completed ? "#10b981" : "transparent",
                cursor: readOnly ? "default" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.15s",
              }}
            >
              {subtask.completed && (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>

            {/* Title */}
            <span style={{
              flex: 1, fontSize: "14px",
              color: subtask.completed ? "#9ca3af" : "#374151",
              textDecoration: subtask.completed ? "line-through" : "none",
              lineHeight: 1.4,
            }}>
              {subtask.title}
            </span>

            {/* Assignee avatar */}
            {subtask.assignee && (
              <div title={subtask.assignee.displayName ?? subtask.assignee.email}
                style={{
                  width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                  background: `hsl(${(subtask.assignee.displayName?.charCodeAt(0) ?? 65) * 10}, 55%, 55%)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "10px", fontWeight: 700, color: "#fff",
                }}>
                {(subtask.assignee.displayName ?? subtask.assignee.email ?? "?")[0].toUpperCase()}
              </div>
            )}

            {/* Delete button */}
            {!readOnly && (
              <button
                onClick={() => onDelete?.(subtask.id)}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: "#d1d5db", fontSize: "16px", padding: "0 2px", lineHeight: 1,
                  borderRadius: 4, transition: "color 0.15s",
                }}
                onMouseEnter={e => e.currentTarget.style.color = "#ef4444"}
                onMouseLeave={e => e.currentTarget.style.color = "#d1d5db"}
              >×</button>
            )}
          </div>
        ))}

        {/* Add new subtask */}
        {!readOnly && (
          adding ? (
            <div style={{ display: "flex", gap: 8, padding: "6px 0" }}>
              <input
                autoFocus
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Subtask title…"
                style={{
                  flex: 1, padding: "7px 10px", fontSize: "14px",
                  border: "1px solid #3b82f6", borderRadius: 7, outline: "none",
                  color: "#111827",
                }}
              />
              <button onClick={handleAdd}
                style={{
                  padding: "7px 14px", background: "#3b82f6", color: "#fff",
                  border: "none", borderRadius: 7, cursor: "pointer", fontSize: "13px", fontWeight: 600,
                }}>
                Add
              </button>
              <button onClick={() => { setAdding(false); setNewTitle(""); }}
                style={{
                  padding: "7px 10px", background: "#f3f4f6", color: "#6b7280",
                  border: "none", borderRadius: 7, cursor: "pointer", fontSize: "13px",
                }}>
                Cancel
              </button>
            </div>
          ) : (
            <button onClick={() => setAdding(true)}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "8px 10px", background: "none",
                border: "1px dashed #d1d5db", borderRadius: 8, cursor: "pointer",
                color: "#9ca3af", fontSize: "13px", width: "100%",
                transition: "border-color 0.15s, color 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#3b82f6"; e.currentTarget.style.color = "#3b82f6"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#d1d5db"; e.currentTarget.style.color = "#9ca3af"; }}
            >
              <span style={{ fontSize: "18px", lineHeight: 1 }}>+</span> Add subtask
            </button>
          )
        )}
      </div>
    </div>
  );
}
