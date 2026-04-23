import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import api from '../services/api';

export function TaskModal({ isOpen, onClose, task = null, projectId, onSave, members = [] }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    dueDate: '',
    assignedTo: '',
    labels: '',
    timeEstimate: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        priority: task.priority || 'medium',
        status: task.status || 'todo',
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
        assignedTo: task.assignedTo?._id || task.assignedTo || '',
        labels: task.labels?.join(', ') || '',
        timeEstimate: task.timeEstimate || '',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        status: 'todo',
        dueDate: '',
        assignedTo: '',
        labels: '',
        timeEstimate: '',
      });
    }
    setError('');
  }, [task, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim()) {
      setError('Task title is required');
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        status: formData.status,
        dueDate: formData.dueDate || null,
        assignedTo: formData.assignedTo || null,
        labels: formData.labels
          .split(',')
          .map((label) => label.trim())
          .filter((label) => label),
        timeEstimate: formData.timeEstimate ? parseInt(formData.timeEstimate) : null,
      };

      if (task) {
        await api.put(`/tasks/${task._id}`, payload);
      } else {
        await api.post('/tasks', {
          ...payload,
          projectId,
        });
      }

      onSave?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save task');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={task ? 'Edit Task' : 'Create Task'}>
      <form onSubmit={handleSubmit} className="task-form">
        {error && <div className="error-message">{error}</div>}

        <div className="form-group">
          <label htmlFor="title">Task Title *</label>
          <input
            id="title"
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Enter task title"
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Task description"
            rows="4"
            disabled={isLoading}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="priority">Priority</label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleInputChange}
              disabled={isLoading}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              disabled={isLoading}
            >
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="dueDate">Due Date</label>
            <input
              id="dueDate"
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleInputChange}
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="timeEstimate">Time Estimate (hours)</label>
            <input
              id="timeEstimate"
              type="number"
              name="timeEstimate"
              value={formData.timeEstimate}
              onChange={handleInputChange}
              placeholder="0"
              min="0"
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="assignedTo">Assign To</label>
            <select
              id="assignedTo"
              name="assignedTo"
              value={formData.assignedTo}
              onChange={handleInputChange}
              disabled={isLoading}
            >
              <option value="">Unassigned</option>
              {members.map((member) => (
                <option key={member._id} value={member._id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="labels">Labels (comma separated)</label>
            <input
              id="labels"
              type="text"
              name="labels"
              value={formData.labels}
              onChange={handleInputChange}
              placeholder="e.g. bug, feature, urgent"
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="modal-actions">
          <button type="button" className="button" onClick={onClose} disabled={isLoading}>
            Cancel
          </button>
          <button type="submit" className="button primary" disabled={isLoading}>
            {isLoading ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
