<div
  style={{
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    marginBottom: "20px",
  }}
>
  {/* Team Collaboration Section */}
  <div
    style={{
      backgroundColor: "#374151",
      padding: "20px",
      borderRadius: "10px",
    }}
  >
    <h2 style={{ color: "#f9fafb", marginBottom: "15px" }}>
      Team Collaboration
    </h2>

    <CreateGroup
      onCreate={(newGroup) => {
        console.log("Created group:", newGroup);
      }}
    />

    <JoinGroup
      onJoin={(joinedGroup) => {
        console.log("Joined group:", joinedGroup);

<<<<<<< HEAD
        // temporary mock teammates until backend is ready
        setGroupMembers([
          {
            uid: "101",
            displayName: "Alex",
            email: "alex@email.com",
          },
          {
            uid: "102",
            displayName: "Sarah",
            email: "sarah@email.com",
          },
          {
            uid: user.uid,
            displayName: "You",
            email: user.email,
          },
        ]);
      }}
    />
=======
  const selectableUsers = useMemo(() => {
    const safeGroupMembers = Array.isArray(groupMembers) ? groupMembers : [];
    const safeUsers = Array.isArray(users) ? users : [];

    const baseUsers =
      safeGroupMembers.length > 0
        ? safeGroupMembers
        : safeUsers.map((u) => ({
            uid: u.uid,
            displayName: u.name,
            email: u.email,
          }));

    return baseUsers.filter((u) => u.uid !== user?.uid);
  }, [groupMembers, users, user]);
>>>>>>> fe6cb829b802785e5efd9b42bddfc7994a611956

    <GroupMembers members={groupMembers} />
  </div>

  {/* Tasks Header */}
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 16,
    }}
  >
    <div>
      <h2
        style={{
          color: "var(--text-strong)",
          margin: 0,
          fontSize: 22,
          letterSpacing: "-0.03em",
        }}
      >
        Your Tasks
      </h2>
      <p style={{ margin: "6px 0 0", color: "var(--text-muted)" }}>
        Personal and shared work, organized in one place.
      </p>
    </div>

<<<<<<< HEAD
    <button
      onClick={() => setShowForm(!showForm)}
=======
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
    if (!user?.uid) return;

    const fetchTasks = async () => {
      try {
        setLoadingTasks(true);

        const res = await fetch(`http://localhost:5000/tasks/user/${user.uid}`);

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
          isMajorTask: Boolean(task.isMajorTask),
          parentTaskId: task.parentTaskId ?? null,
          assignees:
            task.assigneeIds?.map((uid) => resolveAssignee(uid, users, groupMembers, user)) || [],
        }));

        setTasks(normalizedTasks);
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
      } finally {
        setLoadingTasks(false);
      }
    };

    if (!loadingUsers) {
      fetchTasks();
    }
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
      const childIds = tasks
        .filter((task) => task.parentTaskId === id)
        .map((task) => task.id);

      for (const childId of childIds) {
        await fetch(`http://localhost:5000/tasks/${childId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            actorId: user.uid,
          }),
        });
      }

      const res = await fetch(`http://localhost:5000/tasks/${id}`, {
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

      setTasks((prev) =>
        prev.filter((task) => task.id !== id && task.parentTaskId !== id)
      );
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
        isMajorTask: updatedTask.isMajorTask ?? existingTask.isMajorTask ?? false,
        parentTaskId: updatedTask.parentTaskId ?? existingTask.parentTaskId ?? null,
      };

      const res = await fetch(`http://localhost:5000/tasks/${id}`, {
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
                assignees: finalAssigneeIds.map((uid) =>
                  resolveAssignee(uid, users, user)
                ),
                priority: formatPriority(normalizePriority(updatedTask.priority)),
                status: formatStatus(normalizeStatus(updatedTask.status)),
                isMajorTask:
                  updatedTask.isMajorTask ?? existingTask.isMajorTask ?? false,
                parentTaskId:
                  updatedTask.parentTaskId ?? existingTask.parentTaskId ?? null,
              }
            : task
        )
      );
    } catch (error) {
      console.error("Update task failed:", error);
    }
  }

  async function handleCreateTask(taskData) {
    try {
      const finalAssigneeIds = Array.from(
        new Set([...(taskData.assigneeIds || []), user.uid])
      );

      const res = await fetch("http://localhost:5000/tasks", {
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
          isMajorTask: taskData.isMajorTask ?? false,
          parentTaskId: taskData.parentTaskId ?? null,
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
        assignees: finalAssigneeIds.map((uid) => resolveAssignee(uid, users, user)),
        createdBy: user.uid,
        isMajorTask: taskData.isMajorTask ?? false,
        parentTaskId: taskData.parentTaskId ?? null,
      };

      setTasks((prev) => [newTask, ...prev]);
      setShowForm(false);
    } catch (error) {
      console.error("Create task failed:", error);
    }
  }

  async function handleCreateSubtask(parentTask, subtaskData) {
    await handleCreateTask({
      ...subtaskData,
      isMajorTask: false,
      parentTaskId: parentTask.id,
    });
  }

  return (
    <div
>>>>>>> fe6cb829b802785e5efd9b42bddfc7994a611956
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
<<<<<<< HEAD
      + Create Task
    </button>
  </div>
</div>
=======
      <div style={{ width: "100%", maxWidth: "1000px" }}>
        <Navbar />

        <div
          style={{
            backgroundColor: "#1f2937",
            padding: "30px",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            marginTop: "20px",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <h1 style={{ margin: 0, color: "#f9fafb" }}>Dashboard</h1>

            <button
              onClick={handleLogout}
              style={{
                padding: "8px 12px",
                backgroundColor: "#dc2626",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Logout
            </button>
          </div>

          <div
            style={{
              backgroundColor: "#374151",
              padding: "20px",
              borderRadius: "10px",
              marginBottom: "20px",
            }}
          >
            <h2 style={{ color: "#f9fafb", marginBottom: "15px" }}>
              Team Collaboration
            </h2>

            <CreateGroup
              onCreate={(newGroup) => {
                console.log("Created group:", newGroup);
              }}
            />

            <JoinGroup
              onJoin={(joinedGroup) => {
                console.log("Joined group:", joinedGroup);

                  // temporary mock teammates until backend is ready
                setGroupMembers([
                  {
                    uid: "101",
                    displayName: "Alex",
                    email: "alex@email.com",
                  },
                  {
                    uid: "102",
                    displayName: "Sarah",
                    email: "sarah@email.com",
                  },
                  {
                    uid: user.uid,
                    displayName: "You",
                    email: user.email,
                  },
                ]);
              }}
            />

            <GroupMembers members={groupMembers} />
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "15px",
            }}
          >
            <h2 style={{ color: "#e5e7eb" }}>Your Tasks</h2>

            <button
              onClick={() => setShowForm(!showForm)}
              style={{
                padding: "10px 15px",
                backgroundColor: "#2563eb",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              + Create Task
            </button>
          </div>

          {/* Create Task Form */}
          {showForm && (
            <div
              style={{
                backgroundColor: "#374151",
                padding: "20px",
                borderRadius: "10px",
                marginBottom: "20px",
              }}
            >
              <TaskForm
                onSubmit={handleCreateTask}
                onCancel={() => setShowForm(false)}
                groupMembers={selectableUsers}
              />
            </div>
          )}

          {loadingTasks ? (
            <p style={{ color: "#e5e7eb" }}>Loading tasks...</p>
          ) : (
            <TaskList
              tasks={tasks}
              onDelete={handleDeleteTask}
              onUpdate={handleUpdateTask}
              onCreateSubtask={handleCreateSubtask}
              groupMembers={selectableUsers}
              currentUserId={user?.uid}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function resolveAssignee(uid, users, groupMembers, currentUser) {
  const safeUsers = Array.isArray(users) ? users : [];
  const safeGroupMembers = Array.isArray(groupMembers) ? groupMembers : [];

  const matchedRealUser = safeUsers.find((u) => u.uid === uid);
  const matchedGroupMember = safeGroupMembers.find((u) => u.uid === uid);

  if (uid === currentUser?.uid) {
    return {
      uid,
      displayName:
        matchedRealUser?.name ||
        matchedGroupMember?.displayName ||
        "You",
      email:
        matchedRealUser?.email ||
        matchedGroupMember?.email ||
        currentUser?.email ||
        "",
    };
  }

  return {
    uid,
    displayName:
      matchedRealUser?.name ||
      matchedGroupMember?.displayName ||
      matchedRealUser?.email ||
      matchedGroupMember?.email ||
      "Unknown User",
    email:
      matchedRealUser?.email ||
      matchedGroupMember?.email ||
      "",
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
>>>>>>> fe6cb829b802785e5efd9b42bddfc7994a611956
