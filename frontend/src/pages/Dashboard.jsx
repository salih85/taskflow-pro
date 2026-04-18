import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [message, setMessage] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await api.get('/projects');
        setProjects(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchProjects();
  }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const response = await api.post('/projects', { title: newTitle, description: '' });
      setProjects((prev) => [response.data, ...prev]);
      setNewTitle('');
      setMessage('Project created successfully.');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to create project');
    }
  };

  return (
    <div className="page dashboard-page">
      <div className="app-header">
        <div>
          <h1>Welcome, {user?.name || 'User'}</h1>
          <p>Open a project or create a new one to start managing tasks.</p>
        </div>
        <button
          className="button secondary"
          onClick={() => {
            logout();
            navigate('/login');
          }}
        >
          Logout
        </button>
      </div>

      <section className="card">
        <h2>Your Projects</h2>
        <div className="project-actions">
          <form className="project-form" onSubmit={handleCreateProject}>
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="New project title"
              required
            />
            <button type="submit">Create Project</button>
          </form>
          {message && <p className="hint">{message}</p>}
        </div>

        <div className="project-grid">
          {projects.length === 0 && <p>No projects yet. Create one to get started.</p>}
          {projects.map((project) => (
            <div
              key={project._id}
              className="project-card"
              onClick={() => navigate(`/projects/${project._id}`)}
            >
              <h3>{project.title}</h3>
              <p>{project.description || 'No description yet.'}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
