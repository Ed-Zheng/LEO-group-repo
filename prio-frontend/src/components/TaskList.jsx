import TaskCard from "./TaskCard";

export default function TaskList({
  tasks = [],
  onDelete,
  onUpdate,
  groupMembers = [],
  currentUserId,
}) {
  const visibleTasks = tasks.filter(Boolean);

  if (visibleTasks.length === 0) {
    return (
      <div
        style={{
          padding: "28px",
          borderRadius: 20,
          border: "1px solid var(--border-soft)",
          background: "var(--surface-panel-strong)",
          color: "var(--text-body)",
        }}
      >
        <p style={{ margin: 0, fontSize: 18, color: "var(--text-strong)", fontWeight: 700 }}>
          No tasks yet
        </p>
        <p style={{ margin: "8px 0 0" }}>
          Create your first task to start building a clearer workload.
        </p>
      </div>
    );
  }

  return (
    <div>
      {visibleTasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onDelete={onDelete}
          onUpdate={onUpdate}
          groupMembers={groupMembers}
          currentUserId={currentUserId}
        />
      ))}
    </div>
  );
}
