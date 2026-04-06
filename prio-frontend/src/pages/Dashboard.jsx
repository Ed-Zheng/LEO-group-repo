import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../services/AuthContext";
import Navbar from "../components/Navbar";
import TaskList from "../components/TaskList";
import TaskForm from "../components/TaskForm";

export default function Dashboard() {
  const [tasks, setTasks] = useState([
    { id: 1, title: "Design UI", priority: "High", status: "In Progress" },
    { id: 2, title: "Setup Backend", priority: "Medium", status: "Pending" },
  ]);

  const [showForm, setShowForm] = useState(false);

  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };


  // ✅ Delete task
  function handleDeleteTask(id) {
    setTasks(prev => prev.filter(task => task.id !== id));
  }

  function handleUpdateTask(id, updatedTask) {
    setTasks(prev =>
      prev.map(task => (task.id === id ? updatedTask : task))
    );
  }
  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#111827",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        paddingTop: "40px",
      }}
    >
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

          {/* Task Header */}
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
                onSubmit={async (taskData) => {
                  const newTask = {
                    id: Date.now(),
                    ...taskData, // ✅ keeps ALL fields
                    priority:
                      taskData.priority.charAt(0).toUpperCase() +
                      taskData.priority.slice(1),
                    status:
                      taskData.status === "in_progress"
                        ? "In Progress"
                        : taskData.status.charAt(0).toUpperCase() +
                          taskData.status.slice(1),
                  };

                  setTasks(prev => [...prev, newTask]);
                  setShowForm(false);
                }}
                onCancel={() => setShowForm(false)}
                groupMembers={[]} // you can fill this later
              />
            </div>
          )}
          {/* ✅ Task List ALWAYS visible */}
          <TaskList
            tasks={tasks}
            onDelete={handleDeleteTask}
            onUpdate={handleUpdateTask}
          />
        </div>
      </div>
    </div>
  );
}