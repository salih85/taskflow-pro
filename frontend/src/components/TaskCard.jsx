import { useState, useEffect } from 'react';
import api from '../services/api';

function TaskCard({ task, onUpdate, onDelete, onAddComment }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: task.title,
    description: task.description || '',
    priority: task.priority || 'medium',
    dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
  });
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await api.get(`/comments/${task._id}`);
        setComments(response.data);
      } catch (err) {
        console.error('Failed to fetch comments', err);
      }
    };
    fetchComments();
  }, [task._id]);

  const handleEditSubmit = (e) => {
    e.preventDefault();
    const updates = { ...editForm };
    if (!updates.dueDate) delete updates.dueDate;
    onUpdate(task._id, updates);
    setIsEditing(false);
  };

  const moveTask = (direction) => {
    const statuses = ['todo', 'progress', 'done'];
    const currentIndex = statuses.indexOf(task.status);
    const newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (newIndex >= 0 && newIndex < statuses.length) {
      onUpdate(task._id, { status: statuses[newIndex] });
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const response = await api.post('/comments', { text: newComment, taskId: task._id });
      setComments((prev) => [...prev, response.data]);
      setNewComment('');
    } catch (err) {
      console.error('Failed to add comment', err);
    }
  };

  return (
    <>
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
        <div className="task-actions">
          <button onClick={() => moveTask('prev')} disabled={task.status === 'todo'}>←</button>
          <button onClick={() => setIsEditing(true)}>Edit</button>
          <button onClick={() => onDelete(task._id)}>Delete</button>
          <button onClick={() => moveTask('next')} disabled={task.status === 'done'}>→</button>
        </div>
        <div className="task-comments">
          <h5>Comments</h5>
          {comments.map((comment) => (
            <div key={comment._id} className="comment">
              <strong>{comment.userId?.name || 'User'}:</strong> {comment.text}
            </div>
          ))}
          <form onSubmit={handleAddComment}>
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              required
            />
            <button type="submit">Add</button>
          </form>
        </div>
      </div>
      {isEditing && (
        <div className="modal-overlay" onClick={() => setIsEditing(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Edit Task</h3>
            <form onSubmit={handleEditSubmit}>
              <input
                type="text"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                placeholder="Title"
                required
              />
              <textarea
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                placeholder="Description"
              />
              <select
                value={editForm.priority}
                onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <input
                type="date"
                value={editForm.dueDate}
                onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
              />
              <button type="submit">Save</button>
              <button type="button" onClick={() => setIsEditing(false)}>Cancel</button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default TaskCard;
