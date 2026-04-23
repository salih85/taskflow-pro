import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ProjectModal } from '../components/ProjectModal';
import { ConfirmModal } from '../components/Modal';
import { ToastContainer } from '../components/Toast';
import useModal from '../hooks/useModal';
import useToast from '../hooks/useToast';

function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const projectModal = useModal();
  const { toasts, removeToast, success, error } = useToast();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/projects');
      setProjects(response.data);
    } catch (err) {
      error(err.response?.data?.message || 'Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = async () => {
    fetchProjects();
    success('Project created successfully!');
    projectModal.close();
  };

  const handleEditProject = (project, e) => {
    e?.stopPropagation?.();
    setSelectedProject(project);
    projectModal.open();
  };

  const handleDeleteProject = (project, e) => {
    e?.stopPropagation?.();
    setSelectedProject(project);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/projects/${selectedProject._id}`);
      setProjects((prev) => prev.filter((p) => p._id !== selectedProject._id));
      success('Project deleted successfully');
      setShowDeleteConfirm(false);
      setSelectedProject(null);
    } catch (err) {
      error(err.response?.data?.message || 'Failed to delete project');
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="page dashboard-page">
      <div className="app-header">
        <div>
          <h1>Welcome, {user?.name || 'User'}</h1>
          <p>Manage your projects and tasks efficiently.</p>
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
        <div className="section-header">
          <h2>Your Projects</h2>
          <button className="button primary" onClick={projectModal.open}>
            + New Project
          </button>
        </div>

        {isLoading ? (
          <div className="loading-state">Loading projects...</div>
        ) : projects.length === 0 ? (
          <div className="empty-state">
            <p>No projects yet. Create one to get started!</p>
          </div>
        ) : (
          <div className="project-grid">
            {projects.map((project) => (
              <div
                key={project._id}
                className="project-card"
                style={{ borderLeftColor: project.color || '#0066cc' }}
              >
                <div className="project-card-header">
                  <h3 onClick={() => navigate(`/projects/${project._id}`)}>{project.title}</h3>
                  <div className="project-card-actions">
                    <button
                      className="icon-button"
                      onClick={(e) => handleEditProject(project, e)}
                      title="Edit project"
                    >
                      ✎
                    </button>
                    <button
                      className="icon-button danger"
                      onClick={(e) => handleDeleteProject(project, e)}
                      title="Delete project"
                    >
                      🗑
                    </button>
                  </div>
                </div>
                <p className="project-description">{project.description || 'No description'}</p>
                <div className="project-card-footer">
                  <span className={`project-status ${project.status}`}>{project.status}</span>
                  {project.endDate && (
                    <span className="project-date">Due: {formatDate(project.endDate)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <ProjectModal
        isOpen={projectModal.isOpen}
        onClose={() => {
          projectModal.close();
          setSelectedProject(null);
        }}
        project={selectedProject}
        onSave={handleCreateProject}
      />

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Project?"
        message={`Are you sure you want to delete "${selectedProject?.title}"? All tasks in this project will also be deleted.`}
        isDangerous={true}
      />

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

export default Dashboard;
