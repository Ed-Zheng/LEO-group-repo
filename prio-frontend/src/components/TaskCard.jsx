import { useState } from "react";
import TaskForm from "./TaskForm";
import { useNavigate } from "react-router-dom";

export default function TaskCard({
  task,
  subtasks = [],
  onDelete,
  onUpdate,
  onCreateSubtask,
  groupMembers = [],
  currentUserId,
  depth = 0,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showSubtasks, setShowSubtasks] = useState(true);
  const [showSubtaskForm, setShowSubtaskForm] = useState(false);

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
  const isMajorTask = Boolean(task.isMajorTask) && !task.parentTaskId;

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
    : Array.from(
        new Set([...(task.assigneeIds || []), task.createdBy])
      ).filter(Boolean);

  const navigate = useNavigate();

  return (
    <div
      style={{
        marginLeft: depth > 0 ? "28px" : "0",
        borderLeft: depth > 0 ? "3px solid #374151" : "none",
        paddingLeft: depth > 0 ? "16px" : "0",
      }}
    >
      <div
        style={{
          backgroundColor: task.parentTaskId ? "#243041" : "#1f2937",
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
              isMajorTask: task.isMajorTask || false,
              parentTaskId: task.parentTaskId || null,
            }}
            groupMembers={editMembers}
            lockedAssigneeIds={lockedAssigneeIds}
            fixedParentTaskId={task.parentTaskId || null}
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
                isMajorTask: updatedData.isMajorTask ?? task.isMajorTask,
                parentTaskId: updatedData.parentTaskId ?? task.parentTaskId,
              });
              setIsEditing(false);
            }}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <h3 style={{ color: "#f9fafb", marginBottom: "10px", marginTop: 0 }}>
                {isMajorTask ? "📁 " : task.parentTaskId ? "↳ " : ""}
                {task.title}
              </h3>

              {isMajorTask && (
                <span
                  style={{
                    backgroundColor: "#4f46e5",
                    color: "white",
                    padding: "4px 8px",
                    borderRadius: "5px",
                    fontSize: "12px",
                    whiteSpace: "nowrap",
                  }}
                >
                  Major Task
                </span>
              )}
            </div>

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

            <div
              style={{
                marginTop: "12px",
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              <button
                onClick={() => setIsEditing(true)}
                style={{
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
                onClick={() => navigate(`/tasks/${task.id}`)}
                style={{
                  backgroundColor: "#4b5563",
                  color: "white",
                  border: "none",
                  padding: "6px 10px",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                Open Task
              </button>

              {isMajorTask && (
                <button
                  onClick={() => setShowSubtaskForm((prev) => !prev)}
                  style={{
                    backgroundColor: "#0f766e",
                    color: "white",
                    border: "none",
                    padding: "6px 10px",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  {showSubtaskForm ? "Cancel Subtask" : "Add Subtask"}
                </button>
              )}

              {isMajorTask && subtasks.length > 0 && (
                <button
                  onClick={() => setShowSubtasks((prev) => !prev)}
                  style={{
                    backgroundColor: "#475569",
                    color: "white",
                    border: "none",
                    padding: "6px 10px",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  {showSubtasks ? "Hide Subtasks" : `Show Subtasks (${subtasks.length})`}
                </button>
              )}

              <button
                onClick={() => setShowDetails((prev) => !prev)}
                style={{
                  backgroundColor: "#374151",
                  color: "white",
                  border: "none",
                  padding: "6px 10px",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                {showDetails ? "Hide Details" : "View Details"}
              </button>
            </div>

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

                {task.parentTaskId && (
                  <p>
                    <strong>Type:</strong> Subtask
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {showSubtaskForm && isMajorTask && (
        <div
          style={{
            backgroundColor: "#374151",
            padding: "16px",
            borderRadius: "10px",
            marginBottom: "15px",
            marginLeft: "28px",
          }}
        >
          <TaskForm
            fixedParentTaskId={task.id}
            groupMembers={groupMembers}
            lockedAssigneeIds={[currentUserId].filter(Boolean)}
            onSubmit={async (subtaskData) => {
              await onCreateSubtask(task, subtaskData);
              setShowSubtaskForm(false);
              setShowSubtasks(true);
            }}
            onCancel={() => setShowSubtaskForm(false)}
          />
        </div>
      )}

      {showSubtasks && subtasks.length > 0 && (
        <div style={{ marginTop: "8px" }}>
          {subtasks.map((subtask) => (
            <TaskCard
              key={subtask.id}
              task={subtask}
              subtasks={[]}
              onDelete={onDelete}
              onUpdate={onUpdate}
              onCreateSubtask={onCreateSubtask}
              groupMembers={groupMembers}
              currentUserId={currentUserId}
              depth={depth + 1}
            />
          ))}
        </div>
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