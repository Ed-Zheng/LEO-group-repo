import { useState } from "react";

export default function TaskCard({ task, onDelete, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [editedPriority, setEditedPriority] = useState(task.priority);
  const [showDetails, setShowDetails] = useState(false);

  const priorityColors = {
    High: "#ef4444",
    Medium: "#f59e0b",
    Low: "#10b981"
  };

  function handleSave() {
    onUpdate(task.id, {
      ...task,
      title: editedTitle,
      priority: editedPriority
    });
    setIsEditing(false);
  }
  const statusColors = {
    "Pending": "#6b7280",
    "In Progress": "#2563eb",
    "Completed": "#10b981"
  };

  return (
    <div style={{
      backgroundColor: "#1f2937",
      borderRadius: "10px",
      padding: "15px",
      marginBottom: "15px",
      boxShadow: "0 2px 6px rgba(0,0,0,0.4)"
    }}>

      {isEditing ? (
        <>
          {/* Edit Mode */}
          <input
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              marginBottom: "10px",
              borderRadius: "5px",
              border: "1px solid #6b7280",
              backgroundColor: "#111827",
              color: "#fff"
            }}
          />

          <select
            value={editedPriority}
            onChange={(e) => setEditedPriority(e.target.value)}
            style={{
              padding: "8px",
              marginBottom: "10px",
              borderRadius: "5px",
              backgroundColor: "#111827",
              color: "#fff",
              border: "1px solid #6b7280"
            }}
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>

          <button
            onClick={handleSave}
            style={{
              marginRight: "10px",
              backgroundColor: "#2563eb",
              color: "white",
              border: "none",
              padding: "6px 10px",
              borderRadius: "5px",
              cursor: "pointer"
            }}
          >
            Save
          </button>

          <button
            onClick={() => setIsEditing(false)}
            style={{
              backgroundColor: "#6b7280",
              color: "white",
              border: "none",
              padding: "6px 10px",
              borderRadius: "5px",
              cursor: "pointer"
            }}
          >
            Cancel
          </button>
        </>
      ) : (
        <>
          {/* Normal View */}
          <h3 style={{ color: "#f9fafb", marginBottom: "10px" }}>
            {task.title}
          </h3>

          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
          <span style={{
            backgroundColor: priorityColors[task.priority],
            color: "white",
            padding: "4px 8px",
            borderRadius: "5px",
            fontSize: "12px"
          }}>
            {task.priority}
          </span>

          <select
            value={task.status}
            onChange={(e) =>
              onUpdate(task.id, { ...task, status: e.target.value })
            }
            style={{
              backgroundColor: statusColors[task.status],
              color: "white",
              border: "none",
              borderRadius: "5px",
              padding: "4px 8px"
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
                cursor: "pointer"
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
                cursor: "pointer"
              }}
            >
              Delete
            </button>

            <button
            onClick={() => setShowDetails(prev => !prev)}
            style={{
              marginTop: "10px",
              backgroundColor: "#374151",
              color: "white",
              border: "none",
              padding: "5px 10px",
              borderRadius: "5px",
              cursor: "pointer"
            }}
          >
            {showDetails ? "Hide Details" : "View Details"}
          </button>
          {showDetails && (
            <div style={{
              marginTop: "10px",
              padding: "10px",
              backgroundColor: "#111827",
              borderRadius: "8px",
              color: "#e5e7eb"
            }}>
              {task.description && (
                <p><strong>Description:</strong> {task.description}</p>
              )}

              {task.deadline && (
                <p><strong>Deadline:</strong> {task.deadline}</p>
              )}

              {task.assignees && task.assignees.length > 0 && (
                <p>
                  <strong>Assigned to:</strong>{" "}
                  {task.assignees.map(a => a.displayName || a.email).join(", ")}
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