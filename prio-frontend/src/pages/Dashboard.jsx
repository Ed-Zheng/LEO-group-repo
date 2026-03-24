import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../services/AuthContext";
import TaskList from "../components/TaskList";
import Navbar from "../components/Navbar";

export default function Dashboard() {
  const [tasks, setTasks] = useState([
    { id: 1, title: "Design UI", priority: "High", status: "In Progress" },
    { id: 2, title: "Setup Backend", priority: "Medium", status: "Pending" },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newPriority, setNewPriority] = useState("Medium");

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

  function handleCreateTask() {
    if (!newTitle.trim()) return;

    const newTask = {
      id: Date.now(),
      title: newTitle,
      priority: newPriority,
      status: "Pending",
    };

    setTasks(prev => [...prev, newTask]);
    setNewTitle("");
    setNewPriority("Medium");
    setShowForm(false);
  }

  return (
    <div>
      <Navbar />
      <h1>Welcome to Prio</h1>

      <button onClick={() => setShowForm(!showForm)}>
        Create Task
      </button>

      {showForm && (
        <div style={{ marginTop: "10px" }}>
          <input
            type="text"
            placeholder="Task title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />

          <select
            value={newPriority}
            onChange={(e) => setNewPriority(e.target.value)}
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>

          <button onClick={handleCreateTask}>Add</button>
        </div>
      )}

      <TaskList tasks={tasks} />

      <button onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}