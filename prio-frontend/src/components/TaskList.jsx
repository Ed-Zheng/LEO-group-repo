import TaskCard from "./TaskCard";

export default function TaskList({ tasks = [], onDelete, onUpdate }) {
  return (
    <div>
      {tasks.map(task => (
        <TaskCard
          key={task.id}
          task={task}
          onDelete={onDelete}
          onUpdate={onUpdate}
        />
      ))}
    </div>
  );
}