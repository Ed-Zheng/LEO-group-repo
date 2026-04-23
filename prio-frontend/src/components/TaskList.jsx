import TaskCard from "./TaskCard";

const PRIORITY_ORDER = {
  High: 3,
  Medium: 2,
  Low: 1,
};

function sortTasks(tasks) {
  return [...tasks].sort((a, b) => {
    const majorA = a.isMajorTask ? 1 : 0;
    const majorB = b.isMajorTask ? 1 : 0;

    if (majorA !== majorB) {
      return majorB - majorA;
    }

    return (PRIORITY_ORDER[b.priority] || 0) - (PRIORITY_ORDER[a.priority] || 0);
  });
}

export default function TaskList({
  tasks = [],
  onDelete,
  onUpdate,
  onCreateSubtask,
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
          subtasks={subtasksByParent[task.id] || []}
          onDelete={onDelete}
          onUpdate={onUpdate}
          onCreateSubtask={onCreateSubtask}
          groupMembers={groupMembers}
          currentUserId={currentUserId}
        />
      ))}
    </div>
  );
}
