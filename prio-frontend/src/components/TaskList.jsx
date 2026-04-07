import TaskCard from "./TaskCard";

export default function TaskList({
  tasks = [],
  onDelete,
  onUpdate,
  groupMembers = [],
  currentUserId,
}) {
  return (
    <div>
      {tasks.filter(Boolean).map((task) => (
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