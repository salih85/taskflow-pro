function TaskCard({ task }) {
  return (
    <div className="task-card">
      <div className="task-card-header">
        <h4>{task.title}</h4>
        <span className={`badge priority-${task.priority || 'medium'}`}>{task.priority || 'medium'}</span>
      </div>
      <p>{task.description || 'No description provided.'}</p>
      <div className="task-meta">
        <span>{task.assignedTo?.name || 'Unassigned'}</span>
        <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}</span>
      </div>
    </div>
  );
}

export default TaskCard;
