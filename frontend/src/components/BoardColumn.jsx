import TaskCard from './TaskCard';

function BoardColumn({ title, tasks, onTaskClick, onStatusChange }) {
  const statusKey = title === 'To Do' ? 'todo' : title === 'In Progress' ? 'in-progress' : 'done';

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('drag-over');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');

    try {
      const taskData = JSON.parse(e.dataTransfer.getData('application/json'));
      onStatusChange?.(taskData.taskId, statusKey);
    } catch (error) {
      console.error('Drop error:', error);
    }
  };

  return (
    <div
      className="board-column"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <h3>{title}</h3>
      <div className="board-list">
        {tasks.length === 0 && <p className="board-empty">No tasks yet</p>}
        {tasks.map((task) => (
          <TaskCard
            key={task._id}
            task={task}
            onClick={() => onTaskClick?.(task)}
          />
        ))}
      </div>
    </div>
  );
}

export default BoardColumn;
