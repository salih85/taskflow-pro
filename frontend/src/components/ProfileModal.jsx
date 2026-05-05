import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import api from '../services/api';

export function ProfileModal({ isOpen, onClose, user, onUpdate }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        bio: user.bio || '',
      });
    }
  }, [user, isOpen]);

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

    if (!formData.name.trim() || !formData.email.trim()) {
      setError('Name and email are required');
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.put('/auth/profile', formData);
      onUpdate?.(response.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Profile">
      <form onSubmit={handleSubmit} className="profile-form">
        {error && <div className="error-message">{error}</div>}

        <div className="form-group">
          <label htmlFor="name">Name *</label>
          <input
            id="name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Your name"
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email *</label>
          <input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="your@email.com"
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="bio">Bio</label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleInputChange}
            placeholder="Tell us about yourself"
            rows="3"
            disabled={isLoading}
          />
        </div>

        <div className="modal-actions">
          <button type="button" className="button" onClick={onClose} disabled={isLoading}>
            Cancel
          </button>
          <button type="submit" className="button primary" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Update Profile'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
