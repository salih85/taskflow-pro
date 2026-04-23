import { useState } from 'react';
import { Modal } from './Modal';
import { ConfirmModal } from './Modal';
import api from '../services/api';

export function TaskDetailsModal({ isOpen, onClose, task, onUpdate, onDelete, members = [] }) {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editData, setEditData] = useState({});

  if (!task) return null;

  const assignedMember = members.find((m) => m._id === task.assignedTo?._id || m._id === task.assignedTo);

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
