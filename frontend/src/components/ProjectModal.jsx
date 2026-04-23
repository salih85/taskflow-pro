import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import api from '../services/api';

export function ProjectModal({ isOpen, onClose, project = null, onSave }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    color: '#0066cc',
    status: 'active',
    startDate: '',
    endDate: '',
    budget: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title,
        description: project.description || '',
        color: project.color || '#0066cc',
        status: project.status || 'active',
        startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
        endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
        budget: project.budget || '',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        color: '#0066cc',
        status: 'active',
        startDate: '',
        endDate: '',
        budget: '',
      });
    }
    setError('');
  }, [project, isOpen]);

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
      setError('Project title is required');
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        color: formData.color,
        status: formData.status,
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
        budget: formData.budget ? parseInt(formData.budget) : null,
      };

      if (project) {
        await api.put(`/projects/${project._id}`, payload);
      } else {
        await api.post('/projects', payload);
      }

      onSave?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save project');
    } finally {
      setIsLoading(false);
    }
  };

  const colors = ['#0066cc', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE'];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={project ? 'Edit Project' : 'Create Project'}>
      <form onSubmit={handleSubmit} className="project-form">
        {error && <div className="error-message">{error}</div>}

        <div className="form-group">
          <label htmlFor="title">Project Title *</label>
          <input
            id="title"
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Enter project title"
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
            placeholder="Project description"
            rows="4"
            disabled={isLoading}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="color">Color</label>
            <div className="color-picker">
              <select
                id="color"
                name="color"
                value={formData.color}
                onChange={handleInputChange}
                disabled={isLoading}
              >
                {colors.map((color) => (
                  <option key={color} value={color}>
                    {color}
                  </option>
                ))}
              </select>
              <div className="color-preview" style={{ backgroundColor: formData.color }} />
            </div>
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
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="startDate">Start Date</label>
            <input
              id="startDate"
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleInputChange}
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="endDate">End Date</label>
            <input
              id="endDate"
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleInputChange}
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="budget">Budget</label>
          <input
            id="budget"
            type="number"
            name="budget"
            value={formData.budget}
            onChange={handleInputChange}
            placeholder="0"
            min="0"
            disabled={isLoading}
          />
        </div>

        <div className="modal-actions">
          <button type="button" className="button" onClick={onClose} disabled={isLoading}>
            Cancel
          </button>
          <button type="submit" className="button primary" disabled={isLoading}>
            {isLoading ? 'Saving...' : project ? 'Update Project' : 'Create Project'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
