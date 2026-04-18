import TaskCard from './TaskCard';

function BoardColumn({ title, tasks }) {
  return (
    <div className="board-column">
      <h3>{title}</h3>
      <div className="board-list">
        {tasks.length === 0 && <p className="board-empty">No tasks yet</p>}
        {tasks.map((task) => (
          <TaskCard key={task._id} task={task} />
        ))}
      </div>
    </div>
  );
}

export default BoardColumn;
