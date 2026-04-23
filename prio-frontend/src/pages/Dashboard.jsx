import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../services/AuthContext";
import { API_BASE_URL } from "../services/api";
import Navbar from "../components/Navbar";
import TaskList from "../components/TaskList";
import TaskForm from "../components/TaskForm";

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const selectableUsers = useMemo(() => {
    return users
      .filter((u) => u.uid !== user?.uid)
      .map((u) => ({
        uid: u.uid,
        displayName: u.name,
        email: u.email,
      }));
  }, [users, user]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);
        const res = await fetch(`${API_BASE_URL}/users`);

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

        setUsers(data);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    if (!user?.uid || loadingUsers) return;

    const fetchTasks = async () => {
      try {
        setLoadingTasks(true);

        const res = await fetch(`${API_BASE_URL}/tasks/user/${user.uid}`);

        const text = await res.text();
        let data = [];

        try {
          data = text ? JSON.parse(text) : [];
        } catch {
          data = [];
        }

        if (!res.ok) {
          throw new Error(data.error || "Failed to fetch user tasks");
        }

        const normalizedTasks = data.map((task) => ({
          ...task,
          priority: formatPriority(task.priority),
          status: formatStatus(task.status),
          assignees:
            task.assigneeIds?.map((uid) => {
              const matchedUser = users.find((u) => u.uid === uid);

              if (uid === user.uid) {
                return {
                  uid,
                  displayName: matchedUser?.name || "You",
                  email: matchedUser?.email || user.email,
                };
              }

              return {
                uid,
                displayName: matchedUser?.name || uid,
                email: matchedUser?.email || uid,
              };
            }) || [],
        }));

        setTasks(normalizedTasks);
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
      } finally {
        setLoadingTasks(false);
      }
    };

    fetchTasks();
  }, [user, users, loadingUsers]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  async function handleDeleteTask(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/tasks/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          actorId: user.uid,
        }),
      });

      const text = await res.text();
      let data = {};

      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = { error: text };
      }

      if (!res.ok) {
        throw new Error(data.error || "Failed to delete task");
      }

      setTasks((prev) => prev.filter((task) => task.id !== id));
    } catch (error) {
      console.error("Delete task failed:", error);
    }
  }

  async function handleUpdateTask(id, updatedTask) {
    try {
      const existingTask = tasks.find((task) => task.id === id);
      if (!existingTask) return;

      const requestedAssigneeIds =
        updatedTask.assigneeIds ||
        updatedTask.assignees?.map((assignee) => assignee.uid) ||
        [];

      const isCreator = existingTask.createdBy === user.uid;

      const finalAssigneeIds = isCreator
        ? Array.from(new Set([...requestedAssigneeIds, existingTask.createdBy]))
        : Array.from(
            new Set([
              ...(existingTask.assigneeIds || []),
              ...requestedAssigneeIds,
              existingTask.createdBy,
            ])
          );

      const payload = {
        title: updatedTask.title,
        description: updatedTask.description ?? null,
        priority: normalizePriority(updatedTask.priority),
        status: normalizeStatus(updatedTask.status),
        deadline: updatedTask.deadline ?? null,
        assigneeIds: finalAssigneeIds,
        actorId: user.uid,
      };

      const res = await fetch(`${API_BASE_URL}/tasks/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      let data = {};

      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = { error: text };
      }

      if (!res.ok) {
        throw new Error(data.error || "Failed to update task");
      }

      setTasks((prev) =>
        prev.map((task) =>
          task.id === id
            ? {
                ...updatedTask,
                ...existingTask,
                id,
                title: updatedTask.title,
                description: updatedTask.description ?? null,
                deadline: updatedTask.deadline ?? null,
                assigneeIds: finalAssigneeIds,
                assignees: finalAssigneeIds.map((uid) => {
                  const matchedUser = users.find((u) => u.uid === uid);

                  if (uid === user.uid) {
                    return {
                      uid,
                      displayName: matchedUser?.name || "You",
                      email: matchedUser?.email || user.email,
                    };
                  }

                  return {
                    uid,
                    displayName: matchedUser?.name || uid,
                    email: matchedUser?.email || uid,
                  };
                }),
                priority: formatPriority(normalizePriority(updatedTask.priority)),
                status: formatStatus(normalizeStatus(updatedTask.status)),
              }
            : task
        )
      );
    } catch (error) {
      console.error("Update task failed:", error);
    }
  }

  return (
    <div
      style={{
        fontFamily: "inherit",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        padding: "36px 20px 56px",
      }}
    >
      <div style={{ width: "100%", maxWidth: "1120px" }}>
        <Navbar userId={user?.uid} />

        <div
          style={{
            background: "rgba(255,255,255,0.9)",
            padding: "28px",
            borderRadius: "28px",
            boxShadow: "var(--shadow-soft)",
            border: "1px solid var(--border-soft)",
            marginTop: "22px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: "22px",
              gap: 18,
            }}
          >
            <div>
              <p
                style={{
                  margin: 0,
                  color: "var(--text-muted)",
                  fontSize: 12,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  fontWeight: 700,
                }}
              >
                Workspace
              </p>
              <h1
                style={{
                  margin: "8px 0 6px",
                  color: "var(--text-strong)",
                  fontSize: "clamp(2rem, 3vw, 3rem)",
                  letterSpacing: "-0.05em",
                }}
              >
                Dashboard
              </h1>
              <p style={{ margin: 0, color: "var(--text-body)", maxWidth: 620, lineHeight: 1.6 }}>
                Review your active work, coordinate responsibilities, and keep each task moving with a
                calmer, cleaner overview.
              </p>
            </div>

            <button
              onClick={handleLogout}
              style={{
                padding: "10px 14px",
                backgroundColor: "var(--surface-panel-strong)",
                color: "var(--text-strong)",
                border: "none",
                borderRadius: "999px",
                cursor: "pointer",
                borderColor: "var(--border-soft)",
                boxShadow: "inset 0 0 0 1px var(--border-soft)",
                fontWeight: 700,
              }}
            >
              Logout
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: 14,
              marginBottom: 24,
            }}
          >
            <MetricCard label="Total tasks" value={tasks.length} />
            <MetricCard
              label="In progress"
              value={tasks.filter((task) => task.status === "In Progress").length}
            />
            <MetricCard
              label="Completed"
              value={tasks.filter((task) => task.status === "Completed").length}
            />
            <MetricCard label="Teammates" value={selectableUsers.length} />
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "18px",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <div>
              <h2 style={{ color: "var(--text-strong)", margin: 0, fontSize: 22, letterSpacing: "-0.03em" }}>
                Your Tasks
              </h2>
              <p style={{ margin: "6px 0 0", color: "var(--text-muted)" }}>
                Personal and shared work, organized in one place.
              </p>
            </div>

            <button
              onClick={() => setShowForm(!showForm)}
              style={{
                padding: "11px 16px",
                backgroundColor: "var(--accent-deep)",
                color: "#ffffff",
                border: "none",
                borderRadius: "999px",
                cursor: "pointer",
                fontWeight: 700,
                boxShadow: "0 6px 14px rgba(53, 83, 84, 0.1)",
              }}
            >
              + Create Task
            </button>
          </div>

          {showForm && (
            <div
              style={{
                background: "var(--surface-panel-strong)",
                padding: "22px",
                borderRadius: "22px",
                marginBottom: "22px",
                border: "1px solid var(--border-soft)",
              }}
            >
              <TaskForm
                onSubmit={async (taskData) => {
                  try {
                    const finalAssigneeIds = Array.from(
                      new Set([...(taskData.assigneeIds || []), user.uid])
                    );

                    const res = await fetch(`${API_BASE_URL}/tasks`, {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        title: taskData.title,
                        description: taskData.description,
                        priority: taskData.priority,
                        status: taskData.status,
                        deadline: taskData.deadline,
                        assigneeIds: finalAssigneeIds,
                        createdBy: user.uid,
                        groupId: null,
                      }),
                    });

                    const text = await res.text();
                    let data = {};

                    try {
                      data = text ? JSON.parse(text) : {};
                    } catch {
                      data = { error: text };
                    }

                    if (!res.ok) {
                      throw new Error(data.error || "Failed to create task");
                    }

                    const newTask = {
                      id: data.id,
                      title: taskData.title,
                      description: taskData.description,
                      priority: formatPriority(taskData.priority),
                      status: formatStatus(taskData.status),
                      deadline: taskData.deadline,
                      assigneeIds: finalAssigneeIds,
                      assignees: finalAssigneeIds.map((uid) => {
                        const matchedUser = users.find((u) => u.uid === uid);

                        if (uid === user.uid) {
                          return {
                            uid,
                            displayName: matchedUser?.name || "You",
                            email: matchedUser?.email || user.email,
                          };
                        }

                        return {
                          uid,
                          displayName: matchedUser?.name || uid,
                          email: matchedUser?.email || uid,
                        };
                      }),
                      createdBy: user.uid,
                    };

                    setTasks((prev) => [newTask, ...prev]);
                    setShowForm(false);
                  } catch (error) {
                    console.error("Create task failed:", error);
                  }
                }}
                onCancel={() => setShowForm(false)}
                groupMembers={selectableUsers}
              />
            </div>
          )}

          {loadingTasks ? (
            <p style={{ color: "var(--text-body)" }}>Loading tasks...</p>
          ) : (
            <TaskList
              tasks={tasks}
              onDelete={handleDeleteTask}
              onUpdate={handleUpdateTask}
              groupMembers={selectableUsers}
              currentUserId={user?.uid}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value }) {
  return (
    <div
      style={{
        padding: "16px 18px",
        borderRadius: "20px",
        background: "var(--surface-panel-strong)",
        border: "1px solid var(--border-soft)",
      }}
    >
      <p
        style={{
          margin: 0,
          color: "var(--text-muted)",
          fontSize: 11,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          fontWeight: 700,
        }}
      >
        {label}
      </p>
      <p style={{ margin: "10px 0 0", color: "var(--text-strong)", fontSize: 30, fontWeight: 700 }}>
        {value}
      </p>
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
