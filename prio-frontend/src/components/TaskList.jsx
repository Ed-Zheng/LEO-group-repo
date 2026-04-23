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
  const validTasks = tasks.filter(Boolean);

  const subtasksByParent = {};
  validTasks.forEach((task) => {
    if (task.parentTaskId) {
      if (!subtasksByParent[task.parentTaskId]) {
        subtasksByParent[task.parentTaskId] = [];
      }
      subtasksByParent[task.parentTaskId].push(task);
    }
  });

  Object.keys(subtasksByParent).forEach((key) => {
    subtasksByParent[key] = sortTasks(subtasksByParent[key]);
  });

  const parentIds = new Set(validTasks.map((task) => task.id));

  const topLevelTasks = sortTasks(
    validTasks.filter((task) => !task.parentTaskId || !parentIds.has(task.parentTaskId))
  );

  return (
    <div>
      {topLevelTasks.map((task) => (
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