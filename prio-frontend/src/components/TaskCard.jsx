import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TaskForm from "./TaskForm";

export default function TaskCard({
  task,
  onDelete,
  onUpdate,
  groupMembers = [],
  currentUserId,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  if (!task) return null;

  const priorityColors = {
    High: "#ef4444",
    Medium: "#f59e0b",
    Low: "#10b981",
  };

  const statusColors = {
    Pending: "#6b7280",
    "In Progress": "#2563eb",
    Completed: "#10b981",
  };

  const isCreator = currentUserId === task?.createdBy;

  const editMembers =
    groupMembers.length > 0
      ? groupMembers
      : task.assignees?.map((assignee) => ({
          uid: assignee.uid,
          displayName: assignee.displayName,
          email: assignee.email,
        })) || [];

  const lockedAssigneeIds = isCreator
    ? [task.createdBy]
    : Array.from(new Set([...(task.assigneeIds || []), task.createdBy])).filter(Boolean);

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.94)",
        borderRadius: "22px",
        padding: "20px",
        marginBottom: "16px",
        border: "1px solid var(--border-soft)",
        boxShadow: "0 8px 20px rgba(90, 103, 107, 0.06)",
      }}
    >
      {isEditing ? (
        <TaskForm
          initialData={{
            title: task.title || "",
            description: task.description || "",
            priority: normalizePriority(task.priority),
            status: normalizeStatus(task.status),
            deadline: task.deadline || "",
            assignees: task.assignees || [],
          }}
          groupMembers={editMembers}
          lockedAssigneeIds={lockedAssigneeIds}
          onSubmit={async (updatedData) => {
            await onUpdate(task.id, {
              ...task,
              title: updatedData.title,
              description: updatedData.description,
              priority: formatPriority(updatedData.priority),
              status: formatStatus(updatedData.status),
              deadline: updatedData.deadline,
              assigneeIds: updatedData.assigneeIds || [],
              assignees: updatedData.assignees || [],
            });
            setIsEditing(false);
          }}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 18, alignItems: "flex-start" }}>
            <div>
              <h3 style={{ color: "var(--text-strong)", margin: 0, fontSize: 23, letterSpacing: "-0.03em" }}>
                {task.title}
              </h3>
              {task.description ? (
                <p style={{ margin: "10px 0 0", color: "var(--text-body)", lineHeight: 1.6, maxWidth: 620 }}>
                  {task.description}
                </p>
              ) : null}
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
              <span
                style={{
                  backgroundColor: priorityColors[task.priority] || "#6b7280",
                  color: "white",
                  padding: "6px 10px",
                  borderRadius: "999px",
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.03em",
                  textTransform: "uppercase",
                }}
              >
                {task.priority}
              </span>

              <div
                style={{
                  borderRadius: "999px",
                  padding: "2px",
                  background: "var(--surface-muted)",
                }}
              >
                <select
                  value={task.status}
                  onChange={(e) => onUpdate(task.id, { ...task, status: e.target.value })}
                  style={{
                    backgroundColor: statusColors[task.status] || "#6b7280",
                    color: "white",
                    border: "none",
                    borderRadius: "999px",
                    padding: "6px 12px",
                    fontSize: "12px",
                    fontWeight: 600,
                  }}
                >
                  <option>Pending</option>
                  <option>In Progress</option>
                  <option>Completed</option>
                </select>
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: "16px",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 12,
            }}
          >
            <div style={metaCardStyle}>
              <p style={metaLabelStyle}>Deadline</p>
              <p style={metaValueStyle}>{task.deadline || "No deadline set"}</p>
            </div>
            <div style={metaCardStyle}>
              <p style={metaLabelStyle}>Assigned</p>
              <p style={metaValueStyle}>
                {task.assignees?.length
                  ? task.assignees.map((a) => a.displayName || a.email).join(", ")
                  : "Unassigned"}
              </p>
            </div>
          </div>

          <div style={{ marginTop: "18px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button
              onClick={() => setIsEditing(true)}
              style={{
                ...buttonStyle("var(--accent-soft)", "var(--accent-deep)"),
                fontWeight: 700,
              }}
            >
              Edit
            </button>

            <button
              onClick={() => onDelete(task.id)}
              style={buttonStyle("var(--danger-soft)", "var(--danger-text)")}
            >
              Delete
            </button>

            <button
              onClick={() => navigate(`/tasks/${task.id}`)}
              style={buttonStyle("var(--accent-deep)", "#ffffff")}
            >
              View Details
            </button>
          </div>
        </>
      )}
    </div>
  );
}

const metaCardStyle = {
  padding: "12px 14px",
  borderRadius: "16px",
  background: "var(--surface-muted)",
  border: "1px solid rgba(108, 128, 123, 0.1)",
};

const metaLabelStyle = {
  margin: 0,
  fontSize: "11px",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "var(--text-muted)",
  fontWeight: 700,
};

const metaValueStyle = {
  margin: "6px 0 0",
  color: "var(--text-strong)",
  fontSize: "14px",
  lineHeight: 1.5,
};

function buttonStyle(backgroundColor, color = "#ffffff") {
  return {
    backgroundColor,
    color,
    border: "none",
    padding: "9px 14px",
    borderRadius: "999px",
    cursor: "pointer",
    boxShadow: "none",
  };
}

function normalizePriority(priority) {
  if (!priority) return "medium";
  return priority.toLowerCase();
}

function normalizeStatus(status) {
  if (!status) return "pending";
  return status.toLowerCase().replace(/\s+/g, "_");
}

function formatPriority(priority) {
  if (!priority) return "Medium";
  const value = priority.toLowerCase();
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatStatus(status) {
  if (!status) return "Pending";
  const value = status.toLowerCase();
  if (value === "in_progress") return "In Progress";
  return value.charAt(0).toUpperCase() + value.slice(1);
}
