export default function TaskCard({ task }) {
  return (
    <div style={{ border: "1px solid gray", padding: "10px", margin: "10px 0" }}>
      <h3>{task.title}</h3>
      <p>Priority: {task.priority}</p>
      <p>Status: {task.status}</p>
    </div>
  );
}