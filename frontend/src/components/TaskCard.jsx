import { useState, useEffect } from 'react';
import api from '../services/api';

function TaskCard({ task, onClick }) {
  const [dragSource, setDragSource] = useState(null);

  const handleDragStart = (e) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('application/json', JSON.stringify({ taskId: task._id }));
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: '#4CAF50',
      medium: '#FFC107',
      high: '#FF9800',
      urgent: '#F44336',
    };
    return colors[priority] || '#999';
  };

  const formatDate = (date) => {
    if (!date) return null;
    const d = new Date(date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';

  return (
    <div
      className="task-card"
      draggable
      onDragStart={handleDragStart}
      onClick={() => onClick?.(task)}
      style={{ cursor: 'pointer' }}
    >
      <div className="task-card-header">
        <h4>{task.title}</h4>
        <div className="task-card-priority" style={{ backgroundColor: getPriorityColor(task.priority) }}>
          {task.priority?.[0]?.toUpperCase()}
        </div>
      </div>

      {task.description && (
        <p className="task-card-description">{task.description.substring(0, 100)}...</p>
      )}

      <div className="task-card-meta">
        {task.assignedTo && (
          <span className="task-assignee" title={task.assignedTo.name}>
            👤 {task.assignedTo.name?.split(' ')[0]}
          </span>
        )}

        {task.dueDate && (
          <span className={`task-date ${isOverdue ? 'overdue' : ''}`}>
            📅 {formatDate(task.dueDate)}
          </span>
        )}

        {task.timeEstimate && (
          <span className="task-time">⏱ {task.timeEstimate}h</span>
        )}
      </div>

      {task.labels && task.labels.length > 0 && (
        <div className="task-labels">
          {task.labels.slice(0, 2).map((label) => (
            <span key={label} className="label-tag">
              {label}
            </span>
          ))}
          {task.labels.length > 2 && (
            <span className="label-tag">+{task.labels.length - 2}</span>
          )}
        </div>
      )}
    </div>
  );
}

export default TaskCard;
