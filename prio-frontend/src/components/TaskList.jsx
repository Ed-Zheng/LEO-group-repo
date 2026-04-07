import TaskCard from "./TaskCard";

export default function TaskList({ tasks = [], onDelete, onUpdate, groupMembers = [] }) {
  return (
    <div>
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onDelete={onDelete}
          onUpdate={onUpdate}
          groupMembers={groupMembers}
        />
      ))}
    </div>
  );
}