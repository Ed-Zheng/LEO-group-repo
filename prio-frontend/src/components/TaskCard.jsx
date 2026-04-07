import { useState } from "react";
import TaskForm from "./TaskForm";

export default function TaskCard({
  task,
  onDelete,
  onUpdate,
  groupMembers = [],
  currentUserId,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

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
        backgroundColor: "#1f2937",
        borderRadius: "10px",
        padding: "15px",
        marginBottom: "15px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.4)",
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
          <h3 style={{ color: "#f9fafb", marginBottom: "10px" }}>{task.title}</h3>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{
                backgroundColor: priorityColors[task.priority] || "#6b7280",
                color: "white",
                padding: "4px 8px",
                borderRadius: "5px",
                fontSize: "12px",
              }}
            >
              {task.priority}
            </span>

            <select
              value={task.status}
              onChange={(e) => onUpdate(task.id, { ...task, status: e.target.value })}
              style={{
                backgroundColor: statusColors[task.status] || "#6b7280",
                color: "white",
                border: "none",
                borderRadius: "5px",
                padding: "4px 8px",
              }}
            >
              <option>Pending</option>
              <option>In Progress</option>
              <option>Completed</option>
            </select>
          </div>

          <div style={{ marginTop: "12px" }}>
            <button
              onClick={() => setIsEditing(true)}
              style={{
                marginRight: "10px",
                backgroundColor: "#2563eb",
                color: "white",
                border: "none",
                padding: "6px 10px",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Edit
            </button>

            <button
              onClick={() => onDelete(task.id)}
              style={{
                backgroundColor: "#dc2626",
                color: "white",
                border: "none",
                padding: "6px 10px",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Delete
            </button>

            <button
              onClick={() => setShowDetails((prev) => !prev)}
              style={{
                marginTop: "10px",
                backgroundColor: "#374151",
                color: "white",
                border: "none",
                padding: "5px 10px",
                borderRadius: "5px",
                cursor: "pointer",
                display: "block",
              }}
            >
              {showDetails ? "Hide Details" : "View Details"}
            </button>

            {showDetails && (
              <div
                style={{
                  marginTop: "10px",
                  padding: "10px",
                  backgroundColor: "#111827",
                  borderRadius: "8px",
                  color: "#e5e7eb",
                }}
              >
                {task.description && (
                  <p>
                    <strong>Description:</strong> {task.description}
                  </p>
                )}

                {task.deadline && (
                  <p>
                    <strong>Deadline:</strong> {task.deadline}
                  </p>
                )}

                {task.assignees && task.assignees.length > 0 && (
                  <p>
                    <strong>Assigned to:</strong>{" "}
                    {task.assignees.map((a) => a.displayName || a.email).join(", ")}
                  </p>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
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