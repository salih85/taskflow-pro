import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import BoardColumn from '../components/BoardColumn';

const columnLabels = [
  { key: 'todo', title: 'To Do' },
  { key: 'progress', title: 'In Progress' },
  { key: 'done', title: 'Done' },
];

function ProjectPage() {
  const { projectId } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newTask, setNewTask] = useState({ title: '', priority: 'medium' });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjectAndTasks = async () => {
      try {
        const [projectRes, taskRes] = await Promise.all([
          api.get(`/projects/${projectId}`),
          api.get(`/tasks/${projectId}`),
        ]);
        setProject(projectRes.data);
        setTasks(taskRes.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load project');
      } finally {
        setLoading(false);
      }
    };

    fetchProjectAndTasks();
  }, [projectId]);

  const groupedTasks = useMemo(() => {
    return columnLabels.reduce((acc, column) => {
      acc[column.key] = tasks.filter((task) => task.status === column.key);
      return acc;
    }, {});
  }, [tasks]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTask.title) return;
    try {
      const response = await api.post('/tasks', {
        ...newTask,
        projectId,
        status: 'todo',
      });
      setTasks((prev) => [response.data, ...prev]);
      setNewTask({ title: '', priority: 'medium' });
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to create task');
    }
  };

  const handleUpdateTask = async (taskId, updates) => {
    try {
      const response = await api.put(`/tasks/${taskId}`, updates);
      setTasks((prev) => prev.map((task) => (task._id === taskId ? response.data : task)));
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks((prev) => prev.filter((task) => task._id !== taskId));
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to delete task');
    }
  };

  const handleAddComment = async (taskId, text) => {
    try {
      const response = await api.post('/comments', { text, taskId });
      // For simplicity, not updating tasks, but could add comments to task state
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to add comment');
    }
  };

  if (loading) {
    return <div className="page">Loading project...</div>;
  }

  if (error) {
    return (
      <div className="page">
        <p className="error">{error}</p>
      </div>
    );
  }

  return (
    <div className="page project-page">
      <div className="app-header">
        <div>
          <h1>{project?.title}</h1>
          <p>{project?.description || 'Project board'}</p>
        </div>
        <button className="button secondary" onClick={() => navigate('/dashboard')}>
          Back to dashboard
        </button>
      </div>

      <section className="card project-board-card">
        <div className="section-heading">
          <h2>New Task</h2>
        </div>
        <form className="task-form" onSubmit={handleCreateTask}>
          <input
            value={newTask.title}
            onChange={(e) => setNewTask((prev) => ({ ...prev, title: e.target.value }))}
            placeholder="Task title"
            required
          />
          <select
            value={newTask.priority}
            onChange={(e) => setNewTask((prev) => ({ ...prev, priority: e.target.value }))}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <button type="submit">Add Task</button>
        </form>
      </section>

      <section className="board-grid">
        {columnLabels.map((column) => (
          <BoardColumn
            key={column.key}
            title={column.title}
            tasks={groupedTasks[column.key] || []}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
            onAddComment={handleAddComment}
          />
        ))}
      </section>
    </div>
  );
}

export default ProjectPage;
