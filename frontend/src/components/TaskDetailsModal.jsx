import { useState } from 'react';
import { Modal } from './Modal';
import { ConfirmModal } from './Modal';
import api from '../services/api';


export function TaskDetailsModal({ isOpen, onClose, task, onUpdate, onDelete, members = [] }) {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editData, setEditData] = useState({});
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerStart, setTimerStart] = useState(null);
  const [subtasks, setSubtasks] = useState([]);
  const [showAddSubtask, setShowAddSubtask] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    if (task) {
      fetchSubtasks();
      fetchActivities();
    }
  }, [task]);

  const fetchSubtasks = async () => {
    try {
      const response = await api.get(`/tasks/${task._id}/subtasks`);
      setSubtasks(response.data);
    } catch (error) {
      console.error('Failed to fetch subtasks:', error);
    }
  };

  const fetchActivities = async () => {
    try {
      const response = await api.get(`/activities/${task._id}`);
      setActivities(response.data);
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    }
  };

  const handleAddSubtask = async () => {
    if (!newSubtaskTitle.trim()) return;
    try {
      await api.post('/tasks', {
        title: newSubtaskTitle,
        projectId: task.projectId,
        parentId: task._id,
      });
      setNewSubtaskTitle('');
      setShowAddSubtask(false);
      fetchSubtasks();
    } catch (error) {
      console.error('Failed to add subtask:', error);
    }
  };

  const handleSubtaskStatusChange = async (subtaskId, status) => {
    try {
      await api.put(`/tasks/${subtaskId}`, { status });
      fetchSubtasks();
    } catch (error) {
      console.error('Failed to update subtask:', error);
    }
  };

  if (!task) return null;

  const assignedMember = members.find((m) => m._id === task.assignedTo?._id || m._id === task.assignedTo);

  const handleStartTimer = () => {
    setTimerRunning(true);
    setTimerStart(Date.now());
  };

  const handleStopTimer = async () => {
    if (timerStart) {
      const elapsed = Math.floor((Date.now() - timerStart) / 1000 / 60 / 60); // hours
      const newTimeSpent = (task.timeSpent || 0) + elapsed;
      try {
        await api.put(`/tasks/${task._id}`, { timeSpent: newTimeSpent });
        onUpdate?.();
      } catch (error) {
        console.error('Failed to update time spent:', error);
      }
    }
    setTimerRunning(false);
    setTimerStart(null);
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await api.delete(`/tasks/${task._id}`);
      setShowDeleteConfirm(false);
      onDelete?.();
      onClose();
    } catch (error) {
      console.error('Failed to delete task:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await api.put(`/tasks/${task._id}`, { status: newStatus });
      onUpdate?.();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Not set';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
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

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Task Details">
        <div className="task-details">
          <div className="task-details-header">
            <h3>{task.title}</h3>
            <div className="task-details-actions">
              <button
                className="button small"
                onClick={() => setIsEditing(!isEditing)}
                disabled={isLoading}
              >
                {isEditing ? 'Cancel' : 'Edit'}
              </button>
              <button
                className="button small danger"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isLoading}
              >
                Delete
              </button>
            </div>
          </div>

          <div className="task-details-meta">
            <div className="meta-item">
              <label>Status</label>
              <select
                value={task.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={isLoading || isEditing}
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div className="meta-item">
              <label>Priority</label>
              <span
                className="priority-badge"
                style={{ backgroundColor: getPriorityColor(task.priority) }}
              >
                {task.priority}
              </span>
            </div>

            <div className="meta-item">
              <label>Due Date</label>
              <span>{formatDate(task.dueDate)}</span>
            </div>

            <div className="meta-item">
              <label>Assigned To</label>
              <span>{assignedMember?.name || 'Unassigned'}</span>
            </div>

            {task.timeEstimate && (
              <div className="meta-item">
                <label>Time Estimate</label>
                <span>{task.timeEstimate} hours</span>
              </div>
            )}

            {task.timeSpent > 0 && (
              <div className="meta-item">
                <label>Time Spent</label>
                <span>{task.timeSpent} hours</span>
              </div>
            )}

            <div className="meta-item">
              <label>Progress</label>
              <div className="progress-row">
                <span>{task.progress || 0}%</span>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${task.progress || 0}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="task-details-section">
            <label>Time Tracking</label>
            <div className="timer-controls">
              {!timerRunning ? (
                <button className="button small" onClick={handleStartTimer}>
                  Start Timer
                </button>
              ) : (
                <button className="button small danger" onClick={handleStopTimer}>
                  Stop Timer
                </button>
              )}
              {timerRunning && <span className="timer-running">Timer running...</span>}
            </div>
          </div>

          <div className="task-details-section">
            <label>Subtasks</label>
            <div className="subtasks-list">
              {subtasks.map((subtask) => (
                <div key={subtask._id} className="subtask-item">
                  <input
                    type="checkbox"
                    checked={subtask.status === 'done'}
                    onChange={() => handleSubtaskStatusChange(subtask._id, subtask.status === 'done' ? 'todo' : 'done')}
                  />
                  <span className={subtask.status === 'done' ? 'completed' : ''}>{subtask.title}</span>
                </div>
              ))}
            </div>
            {showAddSubtask ? (
              <div className="add-subtask">
                <input
                  type="text"
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  placeholder="Subtask title"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddSubtask()}
                />
                <button className="button small" onClick={handleAddSubtask}>Add</button>
                <button className="button small" onClick={() => setShowAddSubtask(false)}>Cancel</button>
              </div>
            ) : (
              <button className="button small" onClick={() => setShowAddSubtask(true)}>
                Add Subtask
              </button>
            )}
          </div>

          <div className="task-details-section">
            <label>Activity Log</label>
            <div className="activity-log">
              {activities.length === 0 ? (
                <p>No activities yet.</p>
              ) : (
                activities.map((activity) => (
                  <div key={activity._id} className="activity-item">
                    <div className="activity-content">
                      <strong>{activity.userId?.name || 'Unknown'}</strong> {activity.description}
                    </div>
                    <div className="activity-time">
                      {new Date(activity.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {task.description && (
            <div className="task-details-section">
              <label>Description</label>
              <p>{task.description}</p>
            </div>
          )}

          {task.labels && task.labels.length > 0 && (
            <div className="task-details-section">
              <label>Labels</label>
              <div className="labels-list">
                {task.labels.map((label, idx) => (
                  <span key={idx} className="label-badge">
                    {label}
                  </span>
                ))}
              </div>
            </div>
          )}

          {task.attachments && task.attachments.length > 0 && (
            <div className="task-details-section">
              <label>Attachments</label>
              <ul className="attachments-list">
                {task.attachments.map((attachment, idx) => (
                  <li key={idx}>
                    <a href={attachment} target="_blank" rel="noopener noreferrer">
                      {attachment.split('/').pop()}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Modal>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Task?"
        message={`Are you sure you want to delete "${task.title}"? This action cannot be undone.`}
        isDangerous={true}
        isLoading={isLoading}
      />
    </>
  );
}
